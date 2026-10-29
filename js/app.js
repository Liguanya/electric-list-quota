/* ============================================================
 * 电缆配管配线桥架自动组价系统 - 核心逻辑
 * 依据：天津市安装工程工程量清单计价指引 DBD29-903-2025（2025-10-01施行）
 *       配套 天津市安装工程预算基价 第二册 电气设备安装工程 DBD29-302-2020
 *
 * 六大类清单编码（官方指引表 D.9 / D.12 核准）：
 *   电力电缆   030409001   控制电缆 030409002   电力电缆头 030409003
 *   配管       030412001   桥架     030412003   配线       030412004
 *
 * 定额分档：
 *   电力电缆敷设 铜2-576~580 / 铝2-566~570（截面10/35/120/240/400）
 *   控制电缆敷设 2-586~590（6/14/24/37/48芯以内）
 *   电力电缆头   1kV / 10kV 户内热(冷)缩终端头（编号见 CABLE_HEAD 表，含核对提示）
 *   配管 电线管(JDG/KBG) 明2-1117~1122 暗2-1123~1128（DN15~50 共6档）
 *        镀锌钢管(SC/RC) 明2-1139~1149 暗2-1150~1160（DN15~150 共11档）
 *   配线 照明(BV/BYJ) 2-1318~1320（1.5/2.5/4）
 *        动力(铜芯) 2-1335起（截面就近档）
 *        多芯软导线(RYS/KYJY/KYY) 2-1359起（按芯数）
 *   桥架 钢制槽式 2-637~643（宽度150~1500）
 *
 * 价格库见 data/prices.js（电力电缆主材 元/m，含税÷1.13除税）
 * ============================================================ */

(function () {
  'use strict';

  // ---------- 清单编码（官方核准）----------
  var LIST = {
    power: '030409001',
    control: '030409002',
    head: '030409003',
    conduit: '030412001',
    bridge: '030412003',
    wiring: '030412004',
    // 照明器具（2025指引 附录D 灯具+插座）
    lampCommon: '030413001',  // 普通灯
    lampDecor: '030413002',   // 装饰灯
    lampFluor: '030413003',   // 荧光灯
    lampFactory: '030413005', // 工厂灯
    lampMedical: '030413007', // 医疗专用灯
    outlet: '030413014',      // 插座
    switchBtn: '030413013',   // 照明开关、按钮
    // 配电箱（柜）
    boxCabinet: '030402010',  // 配电柜（开关柜/低压柜/高压柜等）
    box: '030402011'          // 配电箱（照明箱/动力箱/控制箱等）
  };

  // ---------- 配电箱（柜）：形式 + 半周长分档 ----------
  var BOX_GUI_KEYWORDS = ['开关柜', '低压开关柜', '高压开关柜', '低压柜', '高压柜', '中置柜', '环网柜',
    '配电柜', '高压配电柜', '低压配电柜', '受电柜', '进线柜', '出线柜',
    '母联柜', '电容柜', '补偿柜', '联络柜', '切换柜', '总柜', '主柜', '馈线柜',
    '功率补偿柜', '无功补偿柜', '电容补偿柜', '配电屏', '电源屏', '控制柜'];
  var BOX_XIANG_KEYWORDS = ['配电箱', '照明箱', '动力箱', '控制箱', '双电源箱',
    '计量箱', '插座箱', '建筑小品配电箱', '热水器配电箱', '太阳能配电箱',
    '空调配电箱', '风机配电箱', '水泵配电箱', '电梯配电箱', '消防配电箱',
    '应急配电箱', 'UPS配电箱', '通信配电箱', '信号箱', '按钮箱', '电源箱',
    '检修箱', '分电箱', '总箱', '分配箱', '切换箱'];
  var BOX_PERIMETER_TIERS = [
    { tier: '0.5', label: '半周长0.5m以内', code: '2-305', qname: '成套配电箱安装 悬挂嵌入式 半周长0.5m以内' },
    { tier: '1.0', label: '半周长1.0m以内', code: '2-306', qname: '成套配电箱安装 悬挂嵌入式 半周长1.0m以内' },
    { tier: '1.5', label: '半周长1.5m以内', code: '2-307', qname: '成套配电箱安装 悬挂嵌入式 半周长1.5m以内' },
    { tier: '2.0', label: '半周长2.0m以内', code: '2-308', qname: '成套配电箱安装 悬挂嵌入式 半周长2.0m以内' },
    { tier: '2.5', label: '半周长2.5m以内', code: '2-309', qname: '成套配电箱安装 悬挂嵌入式 半周长2.5m以内' }
  ];
  var BOX_DEFAULT_TIER = '1.0';
  var BOX_FLOOR = { code: '2-304', qname: '成套配电箱安装 落地式' };
  var BOX_LOW_VOLT = { code: '2-282', qname: '控制、继电、模拟及配电屏安装 电源屏（低压开关柜）' };
  var BOX_HIGH_VOLT = { code: '2-85', qname: '高压成套配电柜安装 单母线柜 电容器柜、其他柜' };

  // 识别配电箱/柜：返回 {isCabinet, lowVolt} 或 null
  function identifyBox(name) {
    if (!name) return null;
    for (var i = 0; i < BOX_GUI_KEYWORDS.length; i++) {
      if (name.indexOf(BOX_GUI_KEYWORDS[i]) >= 0) {
        return { isCabinet: true, lowVolt: name.indexOf('低压') >= 0 };
      }
    }
    for (var j = 0; j < BOX_XIANG_KEYWORDS.length; j++) {
      if (name.indexOf(BOX_XIANG_KEYWORDS[j]) >= 0) return { isCabinet: false, lowVolt: false };
    }
    return null;
  }
  var LIST_CODE = LIST.power; // 向后兼容（Node测试）

  // ---------- 电力电缆敷设：铜/铝 × 截面五档 ----------
  var POWER_QUOTA = {
    '铝': [
      { code: '2-566', name: '铝芯电力电缆敷设 电缆截面10mm²以内', max: 10 },
      { code: '2-567', name: '铝芯电力电缆敷设 电缆截面35mm²以内', max: 35 },
      { code: '2-568', name: '铝芯电力电缆敷设 电缆截面120mm²以内', max: 120 },
      { code: '2-569', name: '铝芯电力电缆敷设 电缆截面240mm²以内', max: 240 },
      { code: '2-570', name: '铝芯电力电缆敷设 电缆截面400mm²以内', max: Infinity }
    ],
    '铜': [
      { code: '2-576', name: '铜芯电力电缆敷设 电缆截面10mm²以内', max: 10 },
      { code: '2-577', name: '铜芯电力电缆敷设 电缆截面35mm²以内', max: 35 },
      { code: '2-578', name: '铜芯电力电缆敷设 电缆截面120mm²以内', max: 120 },
      { code: '2-579', name: '铜芯电力电缆敷设 电缆截面240mm²以内', max: 240 },
      { code: '2-580', name: '铜芯电力电缆敷设 电缆截面400mm²以内', max: Infinity }
    ]
  };

  // ---------- 控制电缆敷设：按总芯数（2-586=6芯，逐档至2-590=48芯）----------
  var CONTROL_QUOTA = [
    { code: '2-586', name: '控制电缆敷设 电缆6芯以内', max: 6 },
    { code: '2-587', name: '控制电缆敷设 电缆14芯以内', max: 14 },
    { code: '2-588', name: '控制电缆敷设 电缆24芯以内', max: 24 },
    { code: '2-589', name: '控制电缆敷设 电缆37芯以内', max: 37 },
    { code: '2-590', name: '控制电缆敷设 电缆48芯以内', max: 48 }
  ];

  /* ---------- 电力电缆终端头（用户2026-10-26确认，两段连续不重叠） ----------
   * 1kV低压：2-755(10) … 2-762(400)，截面增大编号递增，共8档；
   * 10kV高压：2-763(35) … 2-768(400)，截面增大编号递增，共6档。
   * 截面档：10/35/70/120/185/240/300/400（1kV 8档）；35/70/120/185/240/400（10kV 6档） */
  var HEAD_LV = [
    { code: '2-755', sec: 10 }, { code: '2-756', sec: 35 }, { code: '2-757', sec: 70 },
    { code: '2-758', sec: 120 }, { code: '2-759', sec: 185 }, { code: '2-760', sec: 240 },
    { code: '2-761', sec: 300 }, { code: '2-762', sec: 400 }
  ];
  var HEAD_HV = [
    { code: '2-763', sec: 35 }, { code: '2-764', sec: 70 }, { code: '2-765', sec: 120 },
    { code: '2-766', sec: 185 }, { code: '2-767', sec: 240 }, { code: '2-768', sec: 400 }
  ];

  // ---------- 配管 ----------
  // 电线管(JDG/KBG) DN15/20/25/32/40/50：明 2-1117~1122，暗 2-1123~1128
  var TUBE_DN = [15, 20, 25, 32, 40, 50];
  var TUBE_CODE = { surface: 1117, concealed: 1123 };
  // 镀锌钢管(SC/RC) DN15/20/25/32/40/50/70/80/100/125/150：明 2-1139~1149，暗 2-1150~1160
  var STEEL_DN = [15, 20, 25, 32, 40, 50, 70, 80, 100, 125, 150];
  var STEEL_CODE = { surface: 1139, concealed: 1150 };

  // ---------- 配线 ----------
  // 照明线路 铜芯 BV/BYJ：1.5/2.5/4 → 2-1318/1319/1320（编号确定）
  var LIGHT_SEC = [1.5, 2.5, 4];
  var LIGHT_CODE0 = 1318;
  // 动力线路 铜芯：按截面就近，编号自2-1335起（区间2-1335~1358，逐档编号为推断，需对照基价表）
  var POWER_WIRE_SEC = [0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
  var POWER_WIRE_CODE0 = 1335;
  // 多芯软导线 RYS/KYJY/KYY：以芯数为主（2/4/6/8/10/12/14/16），编号自2-1359起（区间至2-1373，推断）
  var SOFT_CORES = [2, 4, 6, 8, 10, 12, 14, 16];
  var SOFT_CODE0 = 1359;
  var SOFT_SEC = [0.5, 0.75, 1.0, 1.5];

  // ---------- 桥架：钢制槽式 宽度档（2-637~643，>800套1500档，逐档编号推断）----------
  var BRIDGE_W = [150, 300, 400, 500, 600, 800, 1500];
  var BRIDGE_CODE0 = 637;

  /* ============================================================
   * 照明器具（依据 DBD29-302-2020 第二册 第十三章 照明器具安装，子目名称/编号
   *           已对照中国建筑出版在线官方电子书逐页核准）
   * ----------------------------------------------------------
   * 普通灯具：吸顶灯具按灯罩周长（mm）
   *   2-1539 800以内 | 2-1540 1100以内 | 2-1541 1100以外
   * 其他普通灯具（固定子目）：
   *   2-1542 软线吊灯 | 2-1543 吊链灯 | 2-1544 防水吊灯
   *   2-1545 普通弯脖灯 | 2-1546 普通壁灯 | 2-1547 防水灯头 | 2-1548 座灯头
   * 工厂灯及防水防尘灯：
   *   工厂罩灯 2-1549 吸顶式 / 1550 弯杆式 / 1551 悬挂式 / 1552 吊管式 / 1553 吊链式
   *   防水防尘灯 2-1554 直杆式 / 1555 弯杆式 / 1556 吸顶式
   * 工厂其他灯具：投光灯 2-1560；混光灯 2-1561 吊杆/1562 吊链/1563 嵌入式
   *   密闭灯 安全灯 2-1570 直杆/1571 弯杆；防爆灯 2-1572 直杆/1573 弯杆
   *   高压水银防爆灯 2-1574 直杆/1575 弯杆；防爆荧光灯 2-1576
   * 荧光灯具安装：
   *   组装型 2-1761~1763 吊链式 单/双/三管；2-1764~1766 吸顶式 单/双/三管
   *   成套型 2-1768~1770 吊链式 单/双/三管；2-1771~1773 吊管式 单/双/三管；
   *          2-1774~1776 吸顶式 单/双/三管；2-1777~1780 嵌入式 单/双/三/四管
   * 医院灯具：2-1783 病房指示灯 / 1784 病房暗脚灯 / 1785 紫外线杀菌灯 / 1786 无影灯(吊装)
   * ============================================================ */
  // 吸顶灯具：灯罩周长 mm 上限
  var LAMP_CEIL_PERIM = [800, 1100, Infinity];
  var LAMP_CEIL_CODES = ['2-1539', '2-1540', '2-1541'];
  // 装饰灯具 五、标志、诱导装饰灯安装（2-1720~1723，示意图号171~174）
  // 依据：DBD29-302-2020 第二册 第十三章 四、装饰灯具安装 5.标志、诱导装饰灯安装
  var LAMP_SIGN_CODES = { top: '2-1720', rod: '2-1721', wall: '2-1722', embed: '2-1723' };
  var LAMP_SIGN_NAME = { top: '吸顶式', rod: '吊杆式', wall: '墙壁式', embed: '嵌入式' };
  // 应急照明/疏散指示/安全出口/标志/诱导灯 → 安装方式（名称未注明时按墙壁式，双头应急灯多为壁挂）
  function parseSignMount(name) {
    var n = name || '';
    if (/吸顶/.test(n)) return 'top';
    if (/吊杆/.test(n)) return 'rod';
    if (/嵌入/.test(n)) return 'embed';
    return 'wall';
  }
  // 其他普通灯具（关键字 → 固定子目）
  // 注意：更具体的"座灯头"必须排在泛化的"灯头"之前
  var LAMP_PLAIN = [
    { re: /软线吊灯/, code: '2-1542', name: '其他普通灯具安装 软线吊灯' },
    { re: /吊链灯/, code: '2-1543', name: '其他普通灯具安装 吊链灯' },
    { re: /防水吊灯|防水吊线灯/, code: '2-1544', name: '其他普通灯具安装 防水吊灯' },
    { re: /弯脖灯|弯脖子灯|普通弯脖/, code: '2-1545', name: '其他普通灯具安装 普通弯脖灯' },
    { re: /普通壁灯|一般壁灯|壁灯/, code: '2-1546', name: '其他普通灯具安装 普通壁灯' },
    { re: /座灯头|普通座灯/, code: '2-1548', name: '其他普通灯具安装 座灯头' },
    { re: /声光控灯头|声光控|防水灯头|灯头/, code: '2-1547', name: '其他普通灯具安装 防水灯头' }
  ];
  // 工厂灯（按安装方式 + 灯型）。方式→工厂罩灯/防水防尘灯编号
  var LAMP_FACTORY_HOOD = { top: '2-1549', bend: '2-1550', hang: '2-1551', pipe: '2-1552', chain: '2-1553' };
  var LAMP_FACTORY_WP = { top: '2-1556', bend: '2-1555', hang: '2-1554', pipe: '2-1554', chain: '2-1554' };
  var LAMP_FACTORY_HOOD_NAME = { top: '吸顶式', bend: '弯杆式', hang: '悬挂式', pipe: '吊管式', chain: '吊链式' };
  var LAMP_FACTORY_WP_NAME = { top: '吸顶式', bend: '弯杆式', hang: '直杆式', pipe: '直杆式', chain: '直杆式' };
  // 固定子目工厂/密闭/投光混光
  var LAMP_FACTORY_FIXED = [
    { re: /投光灯/, code: '2-1560', name: '工厂其他灯具安装 投光灯' },
    { re: /混光灯/, code: '2-1561', name: '工厂其他灯具安装 混光灯 吊杆式' },
    { re: /防爆荧光/, code: '2-1576', name: '密闭灯具安装 防爆荧光灯' },
    { re: /高压水银/, code: '2-1572', name: '密闭灯具安装 高压水银防爆灯 直杆式' },
    { re: /防爆灯/, code: '2-1572', name: '密闭灯具安装 防爆灯 直杆式' },
    { re: /安全灯/, code: '2-1570', name: '密闭灯具安装 安全灯 直杆式' }
  ];
  // 荧光灯具：组装/成套 × 安装方式 × 管数 → 编号
  // 组装型仅 吊链/吸顶，各1~3管；成套型方式全（吊链/吊管/吸顶/嵌入），嵌入有4管
  var FLUOR_GRID = {
    assembled: { chain: [1761, 1762, 1763], top: [1764, 1765, 1766] },
    complete: {
      chain: [1768, 1769, 1770], pipe: [1771, 1772, 1773],
      top: [1774, 1775, 1776], embed: [1777, 1778, 1779, 1780]
    }
  };
  var FLUOR_MOUNT_NAME = { chain: '吊链式', pipe: '吊管式', top: '吸顶式', embed: '嵌入式' };
  var FLUOR_TUBE_CN = { 1: '单管', 2: '双管', 3: '三管', 4: '四管' };
  // 医院灯具
  var LAMP_MEDICAL = [
    { re: /无影灯|手术灯/, code: '2-1786', name: '医院灯具安装 无影灯（吊装灯）' },
    { re: /病房指示|指示灯(?!.*疏散)/, code: '2-1783', name: '医院灯具安装 病房指示灯' },
    { re: /病房暗脚|暗脚灯|病房专用|病房灯/, code: '2-1784', name: '医院灯具安装 病房暗脚灯' },
    { re: /观片灯/, code: '2-1784', name: '医院灯具安装 病房暗脚灯' },
    { re: /紫外线|消毒灯|杀菌灯/, code: '2-1785', name: '医院灯具安装 紫外线杀菌灯' }
  ];

  /* ============================================================
   * 插座（DBD29-302-2020 第十三章 九、开关按钮插座安装·3插座 / 4防爆插座）
   * 普通插座（成套插座安装）：
   *   单相明插座15A：2孔~12孔 2-1817~1826（11档：2/3/4/5/6/7/8/9/10/11/12孔）
   *   单相明插座30A：3孔 2-1827 / 4孔 2-1828
   *   三相明插座15A 4孔 2-1829；三相明插座30A 4孔 2-1830
   *   单相暗插座15A：2孔~12孔 2-1831~1841（11档）
   *   单相暗插座30A：3孔 2-1842 / 4孔 2-1843 / 5孔(?)→ 实际30A仅3/4孔 2-1842/1843（见下注）
   *   三相暗插座15A 4孔 2-1845；三相暗插座30A 4孔 2-1846
   * 防爆插座（电流档 15/30/60A以内）：
   *   单相 2-1847/1848/1849；单相三孔 2-1850/1851/1852；三相四孔 2-1853/1854/1855
   * 注：暗装单相30A 基价为3孔2-1842、4孔2-1843；2-1844为30A单相暗插座末档（按表确认）。
   * ============================================================ */
  // 明装15A：2~11孔=2-1817~1826（10档，基价表明装无12孔）；暗装15A：2~12孔=2-1831~1841（11档）
  var OUT_HOLES_15A_SURFACE = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  var OUT_HOLES_15A_CONCEAL = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  // 普通插座编号矩阵（官方表逐档核准）
  // 明装：单相15A 2~12孔=2-1817~1826；单相30A 3孔=2-1827、4孔=2-1828；三相15A 4孔=2-1829；三相30A 4孔=2-1830
  var OUT_SURFACE_SINGLE15_CODE0 = 1817;
  var OUT_SURFACE = { single30: { 3: '2-1827', 4: '2-1828' }, three15: '2-1829', three30: '2-1830' };
  // 暗装：单相15A 2~12孔=2-1831~1841；单相30A 2孔=2-1842、3孔=2-1843；三相15A 4孔=2-1845；三相30A 4孔=2-1846
  var OUT_CONCEAL_SINGLE15_CODE0 = 1831;
  var OUT_CONCEAL = { single30: { 2: '2-1842', 3: '2-1843' }, three15: '2-1845', three30: '2-1846' };
  // 防爆：电流档 15/30/60A以内。单相1847/48/49，单相三孔1850/51/52，三相四孔1853/54/55
  var OUT_EX_AMP = [15, 30, 60];
  var OUT_EX_CODE = {
    single: [1847, 1848, 1849],
    single3: [1850, 1851, 1852],
    three: [1853, 1854, 1855]
  };

  /* ============================================================
   * 开关、按钮（清单 030413013 照明开关、按钮）官方子目 DBD29-302-2020：
   *   拉线开关 2-1797；扳把开关明装 2-1798；密闭开关(5A以内) 2-1813
   *   扳式暗开关(单控) 单~六联 = 2-1799~1804
   *   扳式暗开关(双控) 单~六联 = 2-1805~1810
   *   一般按钮 明装 2-1811 / 暗装 2-1812（照明器具章）
   *   控制按钮 普通型 2-347 / 防爆型 2-348（控制设备章，工业按钮）
   * ============================================================ */
  // 扳式暗开关（单控1799起/双控1805起），索引=联数1~6
  var SW_PLATE_CODE0 = { single: 1799, double: 1805 };
  var SW_TIER_CN = { 1: '单联', 2: '双联', 3: '三联', 4: '四联', 5: '五联', 6: '六联' };
  var SW_GANG_MAX = 6;
  // 特殊照明开关
  var SW_SPECIAL_CODE = { pull: '2-1797', surface: '2-1798', sealed: '2-1813' };
  // 按钮
  var BTN_CONTROL_CODE = { normal: '2-347', ex: '2-348' };   // 控制按钮（工业）普通/防爆
  var BTN_GENERAL_CODE = { surface: '2-1811', concealed: '2-1812' }; // 一般按钮 明/暗

  // ---------- 防雷接地（第二册 第九章）：清单码 + 定额 ----------
  var GROUND_LIST = {
    rod: '030410001',    // 接地极
    busbar: '030410002', // 接地母线
    down: '030410003',   // 引下线
    ring: '030410004',   // 均压环
    pot: '030410007',    // 等电位端子箱、测试板
    sys: '030416027',    // 接地装置
    test: '030410003'    // 断接卡子/测试点（按引下线清单计列）
  };
  var GROUND_QUOTA = {
    pot: { code: '2-369', name: '端子箱安装 户内' },
    busbar: { code: '2-830', name: '接地母线敷设 户内接地母线敷设' },
    sys: { code: '2-895', name: '接地系统测试 接地网' },
    down: { code: '2-880', name: '避雷引下线敷设 利用建筑物主筋引下' },
    ring: { code: '2-885', name: '避雷网安装 均压环敷设 利用圈梁钢筋' },
    rod: { code: '2-824', name: '接地极（板）制作、安装 角钢接地极 普通土' },
    test: { code: '2-881', name: '避雷引下线敷设 断接卡子制作、安装' }
  };
  var GROUND_TYPE_CN = {
    pot: '等电位', busbar: '接地母线', sys: '接地装置', down: '引下线',
    ring: '均压环/避雷网', rod: '接地极', test: '断接卡/测试点'
  };
  var GROUND_UNIT = { pot: '台', busbar: 'm', sys: '系统', down: 'm', ring: 'm', rod: '根', test: '套' };

  // ---------- 母线：低压封闭式插接母线槽 2-229~2-233 / 分线箱 2-234~2-237 ----------
  var BUSWAY_TIERS = [
    { max: 400, code: '2-229', label: '400A以内' },
    { max: 800, code: '2-230', label: '800A以内' },
    { max: 1250, code: '2-231', label: '1250A以内' },
    { max: 2000, code: '2-232', label: '2000A以内' },
    { max: 4000, code: '2-233', label: '4000A以内' }
  ];
  var BUSBOX_TIERS = [
    { max: 100, code: '2-234', label: '100A以内' },
    { max: 300, code: '2-235', label: '300A以内' },
    { max: 600, code: '2-236', label: '600A以内' },
    { max: 1000, code: '2-237', label: '1000A以内' }
  ];
  var BUS_LIST = { busway: '030403006', box: '030403007' }; // 低压封闭式插接母线槽 / 始端箱、分线箱

  // ============================================================
  // 分类识别
  // ============================================================
  // ---------- 灯具细分类（普通/装饰/荧光/工厂/医疗）----------
  // 优先级：医疗 > 工厂 > 荧光 > 装饰 > 普通（兜底任何"灯"）
  function classifyLamp(name) {
    // 医疗专用灯
    if (/无影灯|手术灯|观片灯|病房|紫外线|消毒灯|杀菌灯|医用灯/.test(name)) return 'lampMedical';
    // 工厂灯及防水防尘灯 / 工厂其他灯具 / 密闭防爆
    if (/防水防尘|工厂罩|工厂灯|工矿灯|厂房|高挂灯|密闭灯|投光灯|混光灯|防爆灯|防爆荧光|高压水银|安全灯|防潮灯/.test(name)) return 'lampFactory';
    // 荧光灯（T5/T8支架、格栅荧光、LED平板/长条格栅、荧光支架/灯管）
    if (/荧光灯|荧光支架|格栅|平板灯|支架灯|T\s*[58]\b|日光灯管?|灯管|嵌入式无主灯/.test(name)) {
      // "嵌入式无主灯" 用户归装饰灯，单独前置（见装饰判定），故这里剔除
      if (/无主灯/.test(name)) return 'lampDecor';
      return 'lampFluor';
    }
    // 装饰灯
    if (/筒灯|射灯|艺术|花灯|蜡烛灯|点光源|无主灯|标志灯|诱导灯|疏散|安全出口|应急照明|应急灯|应急疏散|消防应急|出口指示|装饰灯|挂片|串珠|吊式艺术|吸顶艺术|草坪灯|水下灯|几何形状/.test(name)) return 'lampDecor';
    // 普通灯（含各类吸顶/吊灯/壁灯/灯头/座灯/弯脖/圆球/半圆/简易LED），以及其他含"灯"兜底
    if (/灯|光源/.test(name)) return 'lampCommon';
    return '';
  }

  function isOutlet(name) {
    // 插座（含防爆插座）；排除"插座箱"（那是箱体设备）
    return /插座/.test(name) && !/插座箱/.test(name);
  }

  function classify(name) {
    // 插座优先（独立器具）
    if (isOutlet(name)) return 'outlet';
    // 照明开关、按钮（独立器具；在配电箱之前，"开关箱/开关柜"已在 isLightSwitch 排除）
    if (isButton(name) || isLightSwitch(name)) return 'switchBtn';
    // 防雷接地（等电位端子箱/接地母线/接地装置/引下线/均压环/避雷网/接地极/断接卡）——须在箱类、母线之前
    if (isGroundWork(name) && parseGroundType(name)) return 'ground';
    // 母线（母线槽/母线箱/插接箱）——须在箱类之前
    if (isBusWork(name)) return 'bus';
    // 配电箱（柜）：在灯具/电缆关键词之前识别（"插座箱"等箱体设备归此）
    var boxInfo = identifyBox(name);
    if (boxInfo) return boxInfo.isCabinet ? 'boxCabinet' : 'box';
    if (/电缆头|终端头/.test(name)) return 'head';
    // 灯具五类（在电缆/配线兜底之前）
    var lampCat = classifyLamp(name);
    if (lampCat) return lampCat;
    // 控制电缆：含明确控制型号或"控制电缆"字样
    if (/控制电缆|KVV|DJYP|KYJV|KGV|计算机电缆/.test(name)) return 'control';
    if (/桥架|线槽/.test(name)) return 'bridge';
    // 配线：多芯软导线型号 / 单芯电线型号(BV,BYJ,ZR-BV…) / 配线·穿线·导线关键词
    if (/RYS|RYJS|RVS|KYJY|KYY|多芯软导线/.test(name)) return 'wiring';
    if (/(?:^|[^A-Za-z])(?:WDZN?[ABCDE]?|ZN|Z[ABC]?|ZR|NH)?[-\s]?(?:BVVB|BVR|BYJ|BV)(?:[^A-Za-z]|$)/i.test(name)) return 'wiring';
    if (/配线|管内穿线|导线|穿线/.test(name)) return 'wiring';
    // 配管：JDG/KBG/电线管/镀锌钢管/焊接钢管，或独立的 SC/RC 代号
    if (/JDG|KBG|电线管|镀锌钢管|焊接钢管|配管|刚性阻燃管|半硬质塑料管|阻燃管|PVC管|塑料管/.test(name)) return 'conduit';
    if (/(?:^|[^A-Za-z])(?:SC|RC|PC|FPC|MT|CP)\s*[-\s]?\d{2,3}/.test(name)) return 'conduit';
    if (/电力电缆|电缆/.test(name)) return 'power';
    // 兜底：纯型号写法（如 WDZ-YJY-0.6/1kV-5×16）
    var pm = name.match(MODEL_RE);
    if (pm && /^(?:YJLHV|JLHV|YJLV|YJY|YJV|VLV|VV|BTTRZ|BTT[ZV]R?Z?|RTT[YZ]|RTTYZ|YTTWY?|BTLY|NG[AB]T[YZ])/i.test(stripPrefix(pm[0]))) return 'power';
    return '';
  }
  // 配线更精确的型号判定（供 classify 与特征共用）
  function isSoftWire(name) { return /RYS|RYJS|RVS|KYJY|KYY|多芯软导线/.test(name); }

  /* ================ 灯具 / 插座 解析 ================ */
  var CN_NUM = { '一': 1, '二': 2, '两': 2, '双': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '单': 1 };

  // 灯具方形/长方形尺寸（mm）：如 100*100、600×600、1200x300，返回周长mm
  function parseLampPerimeter(name) {
    var m = name.match(/(\d{2,4})\s*[xX×*]\s*(\d{2,4})/);
    if (m) return (parseInt(m[1], 10) + parseInt(m[2], 10)) * 2;
    var d = name.match(/[ΦφØ]?\s*(\d{2,4})\s*mm\s*(?:方形|正方形)/);
    if (d) return parseInt(d[1], 10) * 4;
    return null;
  }
  // 灯具功率（W）：1x9W / 9W / 2x3W（取单只功率）
  function parseLampWatt(name) {
    var t = String(name || '');
    var m = t.match(/(\d+(?:\.\d+)?)\s*[wW](?![a-zA-Z])/);
    if (m) return parseFloat(m[1]);
    m = t.match(/[x×*]\s*(\d+(?:\.\d+)?)\s*[wW]/);
    return m ? parseFloat(m[1]) : 0;
  }
  // 是否为LED平板灯（荧光灯清单、但按吸顶灯具周长套定额）
  function isPanelLamp(name) { return /平板灯/.test(name) && !/长条|格栅|支架/.test(name); }
  // 荧光灯管数
  function parseFluorTubes(name) {
    var m = name.match(/([一二两双三四单])\s*管/);
    if (m && CN_NUM[m[1]]) return CN_NUM[m[1]];
    if (/双管/.test(name)) return 2;
    if (/三管/.test(name)) return 3;
    if (/四管/.test(name)) return 4;
    if (/单管/.test(name)) return 1;
    return 1;
  }
  // 荧光灯安装方式：嵌入>吸顶>吊管>吊链
  function parseFluorMount(name) {
    if (/嵌入|嵌装|暗装在吊顶/.test(name)) return 'embed';
    if (/吸顶/.test(name)) return 'top';
    if (/吊管|吊杆/.test(name)) return 'pipe';
    if (/吊链|吊式|吊装/.test(name)) return 'chain';
    return 'chain'; // 默认吊链式
  }
  // 荧光灯一律成套型（用户口径：荧光灯均套用成套荧光灯，不再人工选组装/成套）
  function parseFluorKind() { return 'complete'; }

  // 工厂灯安装方式：弯杆/悬挂(直杆)/吸顶（默认吸顶式，名称明确注明弯杆/悬挂才改）
  function parseFactoryMount(name) {
    if (/弯管|弯杆/.test(name)) return 'bend';
    if (/悬挂|吊链|吊装|吊杆|直杆|高挂|挂式/.test(name)) return 'hang';
    return 'top'; // 默认吸顶式
  }
  // 是否防水防尘灯（决定工厂灯罩灯/防水防尘编号）
  function isWaterproofFactory(name) { return /防水防尘|防水|防潮|防尘|密闭/.test(name); }

  // 插座：防爆
  function isOutletEx(name) { return /防爆/.test(name); }
  // 插座：三相
  function isOutletThree(name) { return /三相|3相|四线|四孔/.test(name); }
  // 插座电流(A)
  function parseOutletAmp(name) {
    // 明确标注"30A/60A"才识别，避免把"12孔""15A"中的数字混淆；默认15A
    if (/60\s*[aA]/.test(name)) return 60;
    if (/30\s*[aA]/.test(name)) return 30;
    if (/15\s*[aA]/.test(name)) return 15;
    return 15;
  }
  // 插座孔数：中文"三孔/四孔/五孔"或"3孔/4孔"
  function parseOutletHoles(name) {
    // 先匹配纯阿拉伯数字（如 12孔），避免被中文"十"逻辑截断
    var md = name.match(/(\d{1,2})\s*孔/);
    if (md) return parseInt(md[1], 10);
    var m = name.match(/([一二两双三四五六七八九十]+)\s*孔/);
    if (!m) return null;
    var s = m[1];
    if (s === '十') return 10;
    if (s.indexOf('十') === 0 && s.length === 2) return 10 + (CN_NUM[s[1]] || 0);
    if (s.length === 2 && s[1] === '十') return (CN_NUM[s[0]] || 1) * 10;
    if (CN_NUM[s]) return CN_NUM[s];
    return null;
  }
  function isWireKw(name) { return /配线|穿线|BV|BYJ|RYS|KYJY|KYY|导线/.test(name); }

  /* ---------------- 开关 / 按钮 解析 ---------------- */
  // 是否为照明开关（排除配电箱/柜、行程/接近/转换等工业控制开关、隔离开关等）
  function isLightSwitch(name) {
    if (!/开关/.test(name)) return false;
    if (/配电箱|开关箱|开关柜|配电柜|插座箱/.test(name)) return false;
    if (/行程|接近|限位|转换开关|隔离开关|刀开关|负荷开关|断路器|空气开关|空开|漏电|开关电源|定时|时控|声光控开关.*灯|调速开关|调光|感应开关.*门|门禁|翘板开关箱|开关盒/.test(name)) return false;
    // 明确的照明开关品类
    if (/照明开关|墙壁开关|翘板|跷板|扳式|板式|扳把|单控|双控|单联|双联|三联|四联|五联|六联|拉线开关|密闭开关|声光控开关|延时开关|触摸开关|声控开关|一位|二位|三位|四位/.test(name)) return true;
    return true; // 名称含"开关"且非排除项，默认按照明开关
  }
  // 是否按钮（独立）
  function isButton(name) { return /按钮/.test(name) && !/配电箱|按钮盒/.test(name); }

  // 开关类型：pull拉线 / ex防爆 / sealed密闭 / plate扳式暗(默认)
  // 用户口径：除防爆开关外一律套扳式暗开关（按名称联数/单双控取子目），不再由人工选类型
  function parseSwType(name) {
    if (/拉线/.test(name)) return 'pull';
    if (/防爆/.test(name)) return 'ex';
    if (/密闭|密封|防水开关|防尘开关/.test(name)) return 'sealed';
    return 'plate';
  }
  // 单控/双控
  function parseSwCtrl(name) { return /双控/.test(name) ? 'double' : 'single'; }
  // 联数：先阿拉伯"N联/开/位"，再中文
  function parseSwGang(name) {
    var md = name.match(/(\d)\s*(?:联|开|位)/);
    if (md) return Math.min(SW_GANG_MAX, Math.max(1, parseInt(md[1], 10)));
    if (/六联|六位|六开/.test(name)) return 6;
    if (/五联|五位|五开/.test(name)) return 5;
    if (/四联|四位|四开/.test(name)) return 4;
    if (/三联|三位|三开/.test(name)) return 3;
    if (/双联|两位|两联|二联|双开/.test(name)) return 2;
    if (/单联|一位|一开/.test(name)) return 1;
    return 1;
  }
  // 按钮类型：控制按钮(工业，普通/防爆) 还是 一般按钮(明/暗)
  function parseBtnKind(name) {
    // 名称含"控制按钮"或工业特征→控制按钮；"一般按钮/照明按钮"→一般按钮
    if (/控制按钮|防爆按钮|工业按钮|启动按钮|停止按钮|急停|LA\d|LAY|NP2|XB2/.test(name)) return 'control';
    return 'general';
  }
  function parseBtnEx(name) { return /防爆/.test(name) ? 'ex' : 'normal'; }
  function parseBtnLay(name) { return /暗装|暗敷|暗插|嵌墙|暗$/.test(name) ? 'concealed' : 'surface'; }

  /* ---------- 防雷接地 / 母线 识别 ---------- */
  // 防雷接地关键词（不含"接地母线"以外的普通"接地线/接地跨接"，避免误吞配线）
  function isGroundWork(name) {
    if (!name) return false;
    return /等电位|接地母线|接地装置|接地网|接地极|引下线|主筋引下|均压|避雷网|避雷带|闪接带|断接卡|接地测试|测试点|测试箱|测试板|扁钢|圆钢/.test(name);
  }
  // 防雷接地子类型（顺序即优先级）
  function parseGroundType(name) {
    if (!name) return '';
    if (/等电位/.test(name)) return 'pot';
    if (/接地极/.test(name)) return 'rod';
    if (/接地装置|接地网|接地系统测试/.test(name)) return 'sys';
    if (/断接卡|测试点|测试箱|测试板|断接箱/.test(name)) return 'test';
    if (/引下线|主筋引下/.test(name)) return 'down';
    if (/接地母线|扁钢/.test(name)) return 'busbar';
    if (/均压|避雷网|避雷带|闪接带|圆钢/.test(name)) return 'ring';
    return '';
  }
  // 避雷网（计φ10圆钢主材）/ 均压环（不计主材）
  function parseGroundRing(name) {
    return /均压/.test(name) && !/避雷网|避雷带|闪接带|圆钢/.test(name) ? 'ring' : 'mesh';
  }
  // 母线：母线槽/母线（排除接地母线）；母线箱/插接箱/始端箱
  function isBusWork(name) {
    if (!name) return false;
    if (/接地母线/.test(name)) return false;
    return /母线/.test(name) || /插接箱|始端箱/.test(name);
  }
  function parseBusType(name) {
    return /母线箱|插接箱|始端箱|分线箱|进线箱/.test(name) ? 'box' : 'busway';
  }
  // 母线额定电流（A）
  function parseBusAmp(name) {
    if (!name) return null;
    var m = name.match(/(\d{2,5})\s*(?:A|a)(?![A-Za-z])/);
    if (m) return parseInt(m[1], 10);
    m = name.match(/(?:母线|插接箱|始端箱|分线箱|母线箱)[^\d]{0,8}(\d{2,5})/);
    if (m) return parseInt(m[1], 10);
    return null;
  }

  // ---------- 材质（铜/铝）----------
  var ALU_MODEL_RE = /(YJLV|VLV|YJLHV|JLHV|YHLV|JKLYJ|JKLJ|NRLH|WLH|BLV|BLX)/i;
  function detectMaterial(name) {
    if (/铝/.test(name)) return '铝';
    if (ALU_MODEL_RE.test(name)) return '铝';
    return '铜';
  }

  // ---------- 型号 ----------
  var MODEL_RE = /(?:WDZN[ABCDE]?|WDZ[ABCDE]?|ZN|Z[ABCDE]|ZR|NH)?[-\s]?(?:KVVRP|KVVP2?|KVV|DJY[PV]+[VPR2]*|KYJ[VY][PR2]*|YJLHV(?:22|23|32)?|JLHV(?:22|23)?|YJLV(?:22|23|32)?|YJY(?:22|23|32)?|YJV(?:22|23|32)?|VLV(?:22|23|32)?|VV(?:22|23|32)?|BTTRZ|BTT[ZV]R?Z?|RTT[YZ]|RTTYZ|YTTWY?|BTLY|NG[-\s]?[AB]T[YZ])/i;
  function extractModel(name) {
    var m = name.match(MODEL_RE);
    return m ? m[0].toUpperCase().replace(/^[-\s]+/, '') : '';
  }
  function normModel(m) {
    return (m || '').toUpperCase().replace(/-/g, '').replace(/\s/g, '');
  }
  function stripPrefix(m) {
    return (m || '').toUpperCase().replace(/^(?:WDZN?[ABCDE]?|ZN|Z[ABC]?|ZR|NH)[-\s]?/, '');
  }

  // ---------- 电压等级 ----------
  var VOLT_RE = /(\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?\s*[kK]?[vV]|\d+(?:\.\d+)?\s*[kK][vV])/;
  function extractVoltage(name) {
    var m = name.match(VOLT_RE);
    if (!m) return '';
    return m[0].replace(/\s+/g, '').toUpperCase();
  }
  function isHighVoltage(name) {
    return /10\s*k\s*v|8\.7\s*\/\s*15|35\s*k\s*v|高压/i.test(name);
  }

  // ---------- 规格（芯数×截面[+芯数×截面]）----------
  var SPEC_GROUP_RE = /(\d+)\s*[xX×*]\s*(\d+(?:\.\d+)?)(?:\s*\+\s*(?:E|PE)?\s*(\d+)\s*[xX×*]\s*(\d+(?:\.\d+)?)?)?/g;
  var BARE_EARTH_RE = /\+\s*(?:E|PE)\s*(\d+(?:\.\d+)?)/g;

  function parseSpec(name) {
    var probe = name.replace(VOLT_RE, ' ');
    var groups = [];
    var m;
    SPEC_GROUP_RE.lastIndex = 0;
    while ((m = SPEC_GROUP_RE.exec(probe)) !== null) {
      groups.push({
        cores: parseInt(m[1], 10),
        section: parseFloat(m[2]),
        cores2: m[3] !== undefined ? parseInt(m[3], 10) : null,
        section2: m[4] !== undefined ? parseFloat(m[4]) : null
      });
    }
    var bare = [];
    var be;
    BARE_EARTH_RE.lastIndex = 0;
    while ((be = BARE_EARTH_RE.exec(probe)) !== null) bare.push(parseFloat(be[1]));

    if (groups.length === 0) {
      var single = probe.match(/(?:^|[^0-9.])(\d{2,3})\s*(?:mm2|mm²|㎟|平方)/i);
      if (single) {
        return { spec: '1×' + single[1], cores: '1', totalCores: 1, section: parseFloat(single[1]), sections: [parseFloat(single[1])] };
      }
      return { spec: '', cores: '', totalCores: 0, section: null, sections: [] };
    }

    var g = groups[groups.length - 1];
    var sections = [g.section];
    var coresStr = String(g.cores);
    var total = g.cores;
    var specStr = g.cores + '×' + g.section;
    if (g.cores2 !== null) {
      sections.push(g.section2);
      total += g.cores2;
      coresStr += '+' + g.cores2;
      specStr += '+' + g.cores2 + '×' + g.section2;
    } else if (bare.length) {
      var eb = bare[bare.length - 1];
      if (sections.indexOf(eb) === -1) {
        sections.push(eb);
        total += 1;
        coresStr += '+1';
        specStr += '+E' + eb;
      }
    }
    return { spec: specStr, cores: coresStr, totalCores: total, section: Math.max.apply(null, sections), sections: sections };
  }

  // ---------- 配线：单根导线截面 / 软线芯数 ----------
  function parseWireSection(name, specInfo) {
    if (specInfo.section !== null) return specInfo.section; // n×s 形式
    var probe = name.replace(VOLT_RE, ' ');
    var m = probe.match(/(?:BVVB|BVR|BYJ|RVS|RYJS|RYS|KYJY|KYY|BV)[^0-9]{0,4}(\d+(?:\.\d+)?)/i);
    if (m) return parseFloat(m[1]);
    var m2 = probe.match(/(\d+(?:\.\d+)?)\s*mm2/i);
    return m2 ? parseFloat(m2[1]) : null;
  }
  function parseSoftCores(name, specInfo) {
    if (specInfo.totalCores > 0) return specInfo.totalCores;
    var m = name.match(/(二|两|三|四|五|六|七|八|九|十|零)?\s*芯/);
    return 0;
  }

  // ---------- 电缆头：主截面 ----------
  // 兼容："电缆头 截面150mm"、"终端头 50mm²"、"YJV-4×70"、"3*70电缆头" 等
  function parseHeadSection(name, specInfo) {
    if (specInfo.section !== null && specInfo.section > 0) return specInfo.section; // n×s 形式已解析
    var probe = name.replace(VOLT_RE, ' ');
    // ① 明确"截面xx"（mm 或 mm² 或平方，可有可无）
    var m1 = probe.match(/截面\s*(\d+(?:\.\d+)?)/);
    if (m1) return parseFloat(m1[1]);
    // ② 独立数字 + mm/mm²/平方（≥10，排除DN/年份等）
    var m2 = probe.match(/(\d{2,3}(?:\.\d+)?)\s*(?:mm2|mm²|㎟|平方|mm)/i);
    if (m2) return parseFloat(m2[1]);
    // ③ n*s / n×s 形式（parseSpec 未覆盖时的兜底，如 3*70）
    var m3 = probe.match(/\d+\s*[xX×*]\s*(\d{2,3}(?:\.\d+)?)/);
    if (m3) return parseFloat(m3[1]);
    return null;
  }

  // ---------- 配管：公称直径 DN ----------
  function parseDiameter(name) {
    var probe = name.replace(/[×xX]\s*\d{2,3}/g, ' '); // 去掉桥架式 200×100 的干扰
    var m = probe.match(/(?:JDG|KBG|SC|RC|DN|Dn|dn|电线管|镀锌钢管|钢管|φ|Φ|￠)[-\s]?(\d{2,3})/i);
    if (m) return parseInt(m[1], 10);
    var m2 = probe.match(/(?:^|[^0-9])(\d{2,3})\s*(?:mm)?(?:\s|$|厚|壁|规格)/);
    return m2 ? parseInt(m2[1], 10) : null;
  }
  function conduitIsSteel(name) {
    return /镀锌钢管|焊接钢管|(?:^|[^A-Za-z])(?:SC|RC)(?:\s*[-]?\s*\d|[^A-Za-z]|$)|钢管/.test(name);
  }
  // 在升序档表中取"以内"档索引；超出末档时夹到末档并由调用方告警
  function tierIndex(tiers, v) {
    for (var i = 0; i < tiers.length; i++) if (v <= tiers[i]) return i;
    return tiers.length - 1;
  }

  // ---------- 桥架：宽度/高度（宽×高）----------
  function parseBridgeWH(name) {
    var m = name.match(/(\d{3,4})\s*[×xX*]\s*(\d{2,4})/);
    if (m) return { w: parseInt(m[1], 10), h: parseInt(m[2], 10) };
    var m2 = name.match(/(?:宽|宽度|W[=\s]?)(\d{3,4})/);
    if (m2) return { w: parseInt(m2[1], 10), h: null };
    return { w: null, h: null };
  }
  function parseBridgeWidth(name) { return parseBridgeWH(name).w; }
  function parseBridgeHeight(name) { return parseBridgeWH(name).h; }

  // ============================================================
  // 定额匹配（按类别 + 行内选择状态）
  // item: { category, material, section, totalCores, diameter, bridgeWidth,
  //         highVoltage, layMode('surface'|'concealed'), wireType('lighting'|'power') }
  // 返回 { code, name, inferred }  inferred=true 表示编号为区间内推算需核对
  // ============================================================
  function matchQuota(it) {
    var i, idx, q, tiers, label, sec;

    // 配电柜（开关柜/低压柜/高压柜等）：锁定落地，含"低压"→2-282，其余→2-85
    if (it.category === 'boxCabinet') {
      var cv = it.lowVolt ? BOX_LOW_VOLT : BOX_HIGH_VOLT;
      return { code: cv.code, name: cv.qname, inferred: false };
    }
    // 配电箱：落地2-304；壁挂按半周长档2-305~309
    if (it.category === 'box') {
      if (it.form === 'floor') return { code: BOX_FLOOR.code, name: BOX_FLOOR.qname, inferred: false };
      var bt = BOX_PERIMETER_TIERS.filter(function (t) { return t.tier === String(it.perimeterTier); })[0] ||
               BOX_PERIMETER_TIERS.filter(function (t) { return t.tier === BOX_DEFAULT_TIER; })[0];
      return { code: bt.code, name: bt.qname, inferred: false };
    }

    if (it.category === 'power') {
      if (it.section === null) return { code: '', name: '', inferred: false };
      tiers = POWER_QUOTA[it.material] || POWER_QUOTA['铜'];
      q = tiers[tierIndex(tiers.map(function (t) { return t.max === Infinity ? 1e9 : t.max; }), it.section)];
      return { code: q.code, name: q.name, inferred: false };
    }

    if (it.category === 'control') {
      if (!it.totalCores) return { code: '', name: '', inferred: false, noTier: true };
      idx = tierIndex(CONTROL_QUOTA.map(function (t) { return t.max; }), it.totalCores);
      q = CONTROL_QUOTA[idx];
      var over = it.totalCores > 48;
      return { code: q.code, name: q.name, inferred: over, overRange: over };
    }

    if (it.category === 'head') {
      var hv = !!it.highVoltage;
      var rows = hv ? HEAD_HV : HEAD_LV;
      if (it.section === null) return { code: '', name: '', inferred: false };
      idx = tierIndex(rows.map(function (r) { return r.sec; }), it.section);
      var r = rows[idx];
      var vtag = hv ? '10kV' : '1kV';
      var overSec = it.section > 400;
      return {
        code: r.code,
        name: vtag + '户内热（冷）缩式电力电缆终端头 电缆截面' + r.sec + 'mm²以内',
        inferred: false,
        overRange: overSec
      };
    }

    if (it.category === 'conduit') {
      var steel = conduitIsSteel(it.name);
      var dnList = steel ? STEEL_DN : TUBE_DN;
      var code0 = steel ? STEEL_CODE[it.layMode] : TUBE_CODE[it.layMode];
      var kind = steel ? '镀锌钢管' : '电线管';
      if (it.diameter === null) return { code: '', name: '', inferred: false, noTier: true };
      idx = tierIndex(dnList, it.diameter);
      var dn = dnList[idx];
      var lay = it.layMode === 'surface' ? '明配' : '暗配';
      var overDN = it.diameter > dnList[dnList.length - 1];
      return {
        code: '2-' + (code0 + idx),
        name: kind + '敷设 砖、混凝土结构' + lay + ' 公称直径' + dn + 'mm以内',
        inferred: false, overRange: overDN
      };
    }

    if (it.category === 'wiring') {
      if (it.softWire) {
        if (!it.softCores) return { code: '', name: '', inferred: false, noTier: true };
        var ci = tierIndex(SOFT_CORES, it.softCores);
        var cs = SOFT_CORES[ci];
        var si = it.section === null ? SOFT_SEC.length - 1 : tierIndex(SOFT_SEC, it.section);
        var csec = SOFT_SEC[Math.min(si, SOFT_SEC.length - 1)];
        return {
          code: '2-' + (SOFT_CODE0 + ci),
          name: '管内穿线 多芯软导线 ' + cnNum(cs) + '芯 导线截面' + csec + 'mm²以内',
          inferred: true
        };
      }
      if (it.wireType === 'lighting') {
        if (it.section === null) return { code: '', name: '', inferred: false, noTier: true };
        idx = tierIndex(LIGHT_SEC, it.section);
        sec = LIGHT_SEC[idx];
        var overL = it.section > 4;
        return {
          code: '2-' + (LIGHT_CODE0 + idx),
          name: '管内穿线 照明线路 铜芯 导线截面' + sec + 'mm²以内',
          inferred: overL, overRange: overL
        };
      }
      // 动力
      if (it.section === null) return { code: '', name: '', inferred: false, noTier: true };
      idx = tierIndex(POWER_WIRE_SEC, it.section);
      sec = POWER_WIRE_SEC[idx];
      var overP = it.section > 240;
      return {
        code: '2-' + (POWER_WIRE_CODE0 + idx),
        name: '管内穿线 动力线路 铜芯 导线截面' + sec + 'mm²以内',
        inferred: true, overRange: overP
      };
    }

    if (it.category === 'bridge') {
      if (it.bridgeWidth === null) return { code: '', name: '', inferred: false, noTier: true };
      idx = tierIndex(BRIDGE_W, it.bridgeWidth);
      var w = BRIDGE_W[idx];
      var overW = it.bridgeWidth > 1500;
      return {
        code: '2-' + (BRIDGE_CODE0 + idx),
        name: '钢制槽式桥架安装 宽度' + w + 'mm以内',
        inferred: true, overRange: overW
      };
    }

    /* ---------- 灯具 ---------- */
    if (it.category === 'lampCommon') {
      var nm = it.name || '';
      // 其他普通灯具固定子目（软线吊灯/吊链灯/防水吊灯/弯脖/壁灯/灯头/座灯头）
      for (var pi = 0; pi < LAMP_PLAIN.length; pi++) {
        if (LAMP_PLAIN[pi].re.test(nm)) {
          return { code: LAMP_PLAIN[pi].code, name: LAMP_PLAIN[pi].name, inferred: false };
        }
      }
      // 圆球/半圆吸顶灯、简易LED吸顶灯、普通吸顶灯 → 吸顶灯具按周长
      var per = (it.lampPerimeter === null || it.lampPerimeter === undefined) ? 0 : it.lampPerimeter;
      var ci2 = per <= 800 ? 0 : (per <= 1100 ? 1 : 2);
      var perLabel = ci2 === 0 ? '800mm以内' : (ci2 === 1 ? '1100mm以内' : '1100mm以外');
      return { code: LAMP_CEIL_CODES[ci2], name: '吸顶灯具安装 灯罩周长' + perLabel, inferred: false };
    }

    if (it.category === 'lampFluor') {
      var fn = it.name || '';
      // LED平板灯（方形/长方形）→ 荧光灯清单 + 吸顶灯具按周长定额
      if (isPanelLamp(fn) || it.fluorPanel) {
        var pp = it.lampPerimeter || 0;
        var pci = pp <= 800 ? 0 : (pp <= 1100 ? 1 : 2);
        var pLabel = pci === 0 ? '800mm以内' : (pci === 1 ? '1100mm以内' : '1100mm以外');
        return { code: LAMP_CEIL_CODES[pci], name: '吸顶灯具安装（LED平板灯）灯罩周长' + pLabel, inferred: false };
      }
      // 管数 / 组装成套 / 安装方式（优先名称解析，行内选择可覆盖：it.fluorTubes/fluorKind/fluorMount）
      var tubes = it.fluorTubes || parseFluorTubes(fn);
      var kind = it.fluorKind || parseFluorKind(fn);
      var mount = it.fluorMount || parseFluorMount(fn);
      var ti2 = tubes - 1;
      var gridRow = FLUOR_GRID[kind][mount];
      var kindCn = kind === 'assembled' ? '组装型' : '成套型';
      if (!gridRow) {
        // 组装型无吊管/嵌入，回退到成套型
        gridRow = FLUOR_GRID.complete[mount] || FLUOR_GRID.complete.chain;
        kindCn = '成套型';
      }
      if (ti2 >= gridRow.length) ti2 = gridRow.length - 1; // 4管仅成套嵌入支持
      if (tubes === 4 && !(kind === 'complete' && mount === 'embed')) {
        // 非"成套嵌入式"无四管子目，回退成套嵌入
        gridRow = FLUOR_GRID.complete.embed; ti2 = 3; kindCn = '成套型'; mount = 'embed';
      }
      return {
        code: '2-' + gridRow[ti2],
        name: '荧光灯具安装 ' + kindCn + ' ' + FLUOR_MOUNT_NAME[mount] + ' ' + (FLUOR_TUBE_CN[ti2 + 1] || (ti2 + 1) + '管'),
        inferred: false
      };
    }

    if (it.category === 'lampFactory') {
      var ffn = it.name || '';
      for (var fi = 0; fi < LAMP_FACTORY_FIXED.length; fi++) {
        if (LAMP_FACTORY_FIXED[fi].re.test(ffn)) {
          return { code: LAMP_FACTORY_FIXED[fi].code, name: LAMP_FACTORY_FIXED[fi].name, inferred: false };
        }
      }
      var fmount = it.factoryMount || parseFactoryMount(ffn);
      if (isWaterproofFactory(ffn) || it.factoryType === 'waterproof') {
        return {
          code: LAMP_FACTORY_WP[fmount],
          name: '工厂灯及防水防尘灯安装 防水防尘灯 ' + LAMP_FACTORY_WP_NAME[fmount],
          inferred: false
        };
      }
      // 普通工厂罩灯（含厂房高挂工矿灯）
      return {
        code: LAMP_FACTORY_HOOD[fmount],
        name: '工厂灯及防水防尘灯安装 工厂罩灯 ' + LAMP_FACTORY_HOOD_NAME[fmount],
        inferred: false
      };
    }

    if (it.category === 'lampMedical') {
      var mn = it.name || '';
      for (var mi = 0; mi < LAMP_MEDICAL.length; mi++) {
        if (LAMP_MEDICAL[mi].re.test(mn)) {
          return { code: LAMP_MEDICAL[mi].code, name: LAMP_MEDICAL[mi].name, inferred: false };
        }
      }
      return { code: '2-1785', name: '医院灯具安装 紫外线杀菌灯', inferred: false };
    }

    if (it.category === 'lampDecor') {
      var dnm = it.name || '';
      // 应急照明 / 疏散指示 / 安全出口 / 标志 / 诱导灯 → 装饰灯具 5.标志、诱导装饰灯安装（2-1720~1723）
      if (/应急|疏散|安全出口|标志灯|诱导|出口指示/.test(dnm)) {
        var sm = parseSignMount(dnm);
        return {
          code: LAMP_SIGN_CODES[sm],
          name: '标志、诱导装饰灯安装 ' + LAMP_SIGN_NAME[sm] + '（示意图号171~174）',
          inferred: false
        };
      }
      // 筒灯 → 普通灯具 1.吸顶灯具（灯罩周长分档 2-1539~1541；天津2020基价第二册无筒灯专用子目）
      if (/筒灯/.test(dnm)) {
        var dp = (it.lampPerimeter === null || it.lampPerimeter === undefined) ? 0 : it.lampPerimeter;
        var dci = dp <= 800 ? 0 : (dp <= 1100 ? 1 : 2);
        var dpLabel = dci === 0 ? '800mm以内' : (dci === 1 ? '1100mm以内' : '1100mm以外');
        return { code: LAMP_CEIL_CODES[dci], name: '吸顶灯具安装（筒灯）灯罩周长' + dpLabel, inferred: false };
      }
      return { code: '', name: '', inferred: false };
    }

    /* ---------- 插座 ---------- */
    if (it.category === 'outlet') {
      var on = it.name || '';
      var surface = (it.layMode === 'surface'); // 行内选择：明装/暗装
      var amp = it.outAmp || parseOutletAmp(on);
      var three = it.outThree !== undefined ? it.outThree : isOutletThree(on);
      var holes = it.outHoles || parseOutletHoles(on);

      // 防爆插座（不分明装暗装；电流档15/30/60）
      if (isOutletEx(on)) {
        var ai = amp <= 15 ? 0 : (amp <= 30 ? 1 : 2);
        var exType = three ? 'three' : (/三孔/.test(on) && !/四孔/.test(on) ? 'single3' : 'single');
        var exName = three ? '三相四孔' : (exType === 'single3' ? '单相三孔' : '单相');
        var exCode = OUT_EX_CODE[exType][ai];
        return {
          code: '2-' + exCode,
          name: '防爆插座安装 ' + exName + ' ' + OUT_EX_AMP[ai] + 'A以内',
          inferred: false
        };
      }

      // 三相插座（固定4孔，仅15/30A）
      if (three) {
        var is30t = amp >= 25;
        if (surface) {
          var sc = is30t ? OUT_SURFACE.three30 : OUT_SURFACE.three15;
          return { code: sc, name: '三相明插座' + (is30t ? '30A' : '15A') + ' 4孔', inferred: false };
        }
        var cc = is30t ? OUT_CONCEAL.three30 : OUT_CONCEAL.three15;
        return { code: cc, name: '三相暗插座' + (is30t ? '30A' : '15A') + ' 4孔', inferred: false };
      }

      // 单相插座
      if (surface) {
        if (amp === 30) {
          var h30 = holes === 4 ? 4 : 3;
          return { code: OUT_SURFACE.single30[h30], name: '单相明插座30A ' + h30 + '孔', inferred: false };
        }
        var hs = holes || 3;
        var hsi = Math.max(0, Math.min(OUT_HOLES_15A_SURFACE.length - 1, hs - 2));
        var realHs = OUT_HOLES_15A_SURFACE[hsi];
        return { code: '2-' + (OUT_SURFACE_SINGLE15_CODE0 + hsi), name: '单相明插座15A ' + realHs + '孔', inferred: false };
      }
      // 暗装单相
      if (amp === 30) {
        var hc30 = holes === 2 ? 2 : 3;
        return { code: OUT_CONCEAL.single30[hc30], name: '单相暗插座30A ' + hc30 + '孔', inferred: false };
      }
      var hc = holes || 3;
      var hci = Math.max(0, Math.min(OUT_HOLES_15A_CONCEAL.length - 1, hc - 2));
      var realHc = OUT_HOLES_15A_CONCEAL[hci];
      return { code: '2-' + (OUT_CONCEAL_SINGLE15_CODE0 + hci), name: '单相暗插座15A ' + realHc + '孔', inferred: false };
    }

    /* ---------- 照明开关、按钮（030413013）---------- */
    if (it.category === 'switchBtn') {
      var snm = it.name || '';
      // —— 按钮 ——
      var isBtn = (it.swIsBtn !== undefined) ? it.swIsBtn : isButton(snm);
      if (isBtn) {
        var kind = it.btnKind || parseBtnKind(snm);
        if (kind === 'control') {
          // 控制按钮（工业）：普通型2-347 / 防爆型2-348
          var exk = it.btnEx || parseBtnEx(snm);
          return exk === 'ex'
            ? { code: BTN_CONTROL_CODE.ex, name: '按钮安装 防爆型', inferred: false }
            : { code: BTN_CONTROL_CODE.normal, name: '按钮安装 普通型', inferred: false };
        }
        // 一般按钮（照明）：明装2-1811 / 暗装2-1812
        var blay = it.btnLay || parseBtnLay(snm);
        return blay === 'concealed'
          ? { code: BTN_GENERAL_CODE.concealed, name: '一般按钮安装 暗装', inferred: false }
          : { code: BTN_GENERAL_CODE.surface, name: '一般按钮安装 明装', inferred: false };
      }
      // —— 开关 ——
      var swType = it.swType || parseSwType(snm);
      if (swType === 'pull') return { code: SW_SPECIAL_CODE.pull, name: '拉线开关', inferred: false };
      if (swType === 'surface') return { code: SW_SPECIAL_CODE.surface, name: '扳把开关 明装', inferred: false };
      if (swType === 'sealed') return { code: SW_SPECIAL_CODE.sealed, name: '密闭开关 5A以内', inferred: false };
      // 防爆开关：第二册第十三章无防爆开关专用子目，按密闭开关（5A以内）2-1813 计
      if (swType === 'ex') return { code: SW_SPECIAL_CODE.sealed, name: '密闭开关 5A以内（防爆开关套此子目）', inferred: false };
      // 扳式暗开关：单控1799起 / 双控1805起，按联数
      var ctrl = it.swCtrl || parseSwCtrl(snm);
      var gang = it.swGang || parseSwGang(snm);
      gang = Math.max(1, Math.min(SW_GANG_MAX, gang));
      var base = SW_PLATE_CODE0[ctrl] || SW_PLATE_CODE0.single;
      var ctrlCn = ctrl === 'double' ? '双控' : '单控';
      return {
        code: '2-' + (base + gang - 1),
        name: '扳式暗开关（' + ctrlCn + '）' + SW_TIER_CN[gang],
        inferred: false
      };
    }

    /* ---------- 防雷接地 ---------- */
    if (it.category === 'ground') {
      var gq = GROUND_QUOTA[it.gType];
      if (!gq) return { code: '', name: '', inferred: false };
      return { code: gq.code, name: gq.name, inferred: false };
    }

    /* ---------- 母线 ---------- */
    if (it.category === 'bus') {
      var tiersB = (it.bType === 'box') ? BUSBOX_TIERS : BUSWAY_TIERS;
      var ampB = it.busAmp;
      var idxB = -1, tb;
      if (it.busTier) {
        for (tb = 0; tb < tiersB.length; tb++) if (tiersB[tb].max === it.busTier) idxB = tb;
      }
      if (idxB < 0 && ampB !== null) idxB = tierIndex(tiersB.map(function (t) { return t.max; }), ampB);
      if (idxB < 0) {
        return it.bType === 'box'
          ? { code: '2-234', name: '封闭母线槽分线箱安装 分线箱100A以内', inferred: true, noTier: true }
          : { code: '2-229', name: '低压封闭式插接母线槽安装 每相电流400A以内', inferred: true, noTier: true };
      }
      var overB = (ampB !== null && ampB > tiersB[tiersB.length - 1].max);
      if (it.bType === 'box') {
        return { code: tiersB[idxB].code, name: '封闭母线槽分线箱安装 分线箱' + tiersB[idxB].label, inferred: overB, overRange: overB };
      }
      return { code: tiersB[idxB].code, name: '低压封闭式插接母线槽安装 每相电流' + tiersB[idxB].label, inferred: overB, overRange: overB };
    }

    return { code: '', name: '', inferred: false };
  }

  function cnNum(n) {
    var map = { 2: '二', 4: '四', 6: '六', 8: '八', 10: '十', 12: '十二', 14: '十四', 16: '十六' };
    return map[n] || String(n);
  }

  // ============================================================
  // 价格库（data/prices.js → window.CABLE_PRICE_PERIODS）
  // ============================================================
  var PLACEHOLDER_PERIOD = { period: 'pending', releaseLabel: '价格库待录入（收到天津信息价后更新）', items: [] };

  function getPeriods() {
    var p = (typeof window !== 'undefined' && window.CABLE_PRICE_PERIODS) || [];
    return p.length ? p : [PLACEHOLDER_PERIOD];
  }
  function getPeriod(periodKey) {
    var ps = getPeriods();
    for (var i = 0; i < ps.length; i++) if (ps[i].period === periodKey) return ps[i];
    return ps[0];
  }

  function mainCoresOf(cores) {
    var m = String(cores || '').match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }
  function baseFamily(model) {
    return normModel(model)
      .replace(/^(?:WDZN?[ABCDE]?|ZN|Z[ABCDE]?|ZR|NH)/, '')
      .replace(/(?:22|23|32)$/, '');
  }

  // ---------- 矿物绝缘电缆 / 电缆头 / 控制电缆 主材价（2026-10-29 新增）----------
  // 天津信息价无矿物绝缘电缆、电缆头、控制电缆条目 → 按合理市场价计入（source=market）
  var MINERAL_RE = /^(?:BTTRZ|BTT[ZV]R?Z?|RTT[YZ]|RTTYZ|YTTWY?|BTLY|NG-?[AB]T[YZ])/;
  function isMineralModel(model) { return MINERAL_RE.test(normModel(model)); }
  // 多芯折算系数：1~6 芯，6 表示 6 芯及以上
  function coreCoefOf(tbl, n) {
    if (!tbl) return 1;
    var k = Math.max(1, Math.min(6, Number(n) || 1));
    return tbl[k] !== undefined ? tbl[k] : (tbl[6] !== undefined ? tbl[6] : 1);
  }
  // 控制电缆型号系数（屏蔽/铠装/交联/软结构）
  function cableModelCoef(name, cfg) {
    var n = String(name || '').toUpperCase();
    if (/KVVP2|KVVP|DJYP|屏蔽/.test(n)) return (cfg.modelCoef || {}).shield || 1.12;
    if (/KVVRP/.test(n)) return (cfg.modelCoef || {}).shieldSoft || 1.15;
    if (/KYJV|交联/.test(n)) return (cfg.modelCoef || {}).xlpe || 1.15;
    if (/(?:22|23|32)(?!\d)|铠装/.test(n)) return (cfg.modelCoef || {}).armour || 1.25;
    if (/RVV|RVS|RYS|软/.test(n)) return (cfg.modelCoef || {}).soft || 0.95;
    return 1;
  }
  // 控制电缆 / 多芯软导线：按"铜重 + 绝缘护套加工"模型计市场价
  function controlCablePrice(it, e, label) {
    var cfg = (e || {}).controlCable;
    if (!cfg) return null;
    var n = it.totalCores || 0;
    var s = it.section;
    if (!n || s === null || s === undefined || isNaN(s)) return null;
    var perCore = s * cfg.copperKgPerMm2 * cfg.copperPrice + cfg.insulBase + cfg.insulPerMm2 * s;
    var k = cableModelCoef(it.name, cfg);
    var sheath = cfg.sheathBase + cfg.sheathPerCore * n;
    var price = Math.round((n * perCore + sheath) * k * 100) / 100;
    return {
      price: price,
      source: 'market',
      basis: (label || '控制电缆') + ' ' + n + '芯×' + s + 'mm²：铜重' + (n * s * cfg.copperKgPerMm2).toFixed(3) +
        'kg/m×' + cfg.copperPrice + '元/kg＋绝缘护套及加工（' + sheath.toFixed(2) + '元/m），型号系数' + k +
        ' → ' + price.toFixed(2) + '元/m，' + cfg.brand + '市场价（除税）'
    };
  }
  // 矿物绝缘电缆（BTTZ/BTTRZ/RTTZ/BTLY 等）：单芯市场价表 × 芯数 × 多芯共护套折算系数
  function lookupMineralPrice(periodKey, it) {
    if (!isMineralModel(it.model)) return null;
    var e = elecTable(periodKey);
    if (!e || !e.mineralCable) return null;
    if (it.section === null || isNaN(it.section)) return null;
    var cfg = e.mineralCable;
    var r = interpByKey(cfg.single, it.section);
    if (!r) return null;
    var n = mainCoresOf(it.cores) || 1;
    var k = coreCoefOf(cfg.coreCoef, n);
    var price = Math.round(r.price * n * k * 100) / 100;
    return {
      price: price,
      source: 'market',
      basis: '矿物绝缘电缆 ' + it.model + ' ' + n + '芯×' + it.section + 'mm²：单芯市场价' + r.price.toFixed(2) +
        '元/m × ' + n + '芯 × 多芯共护套折算' + k + ' = ' + price.toFixed(2) + '元/m，' + cfg.brand + '，除税' +
        (r.exact ? '' : '（截面无对应档，按相邻档插值）')
    };
  }
  // 电力电缆主材价：矿物绝缘电缆走专表，其余走信息价库
  function pricePower(periodKey, it) {
    return lookupMineralPrice(periodKey, it) || lookupPrice(periodKey, it.material, it.model, it.cores, it.section);
  }
  function normItem(it) {
    return {
      material: it.material,
      model: normModel(it.model),
      family: baseFamily(it.model),
      cores: (it.cores || '').replace(/\s/g, ''),
      mainCores: it.mainCores ? Number(it.mainCores) : mainCoresOf(it.cores),
      section: Number(it.section),
      price: Number(it.price),
      spec: it.spec || '',
      source: it.source === 'estimated' ? 'estimated' : 'official',
      basis: it.basis || ''
    };
  }

  function nearestEstimate(pool, section, scopeLabel) {
    if (!pool.length) return null;
    var lower = null, upper = null;
    pool.forEach(function (p) {
      if (p.section < section && (!lower || p.section > lower.section)) lower = p;
      if (p.section > section && (!upper || p.section < upper.section)) upper = p;
    });
    function ref(p) { return p.model + ' ' + p.cores + '芯×' + p.section + 'mm²'; }
    if (lower && upper) {
      var price = lower.price + (upper.price - lower.price) * (section - lower.section) / (upper.section - lower.section);
      return {
        price: Math.round(price * 100) / 100,
        basis: '参照' + ref(lower) + '与' + upper.cores + '芯×' + upper.section + 'mm²信息价' + scopeLabel + '插值估算'
      };
    }
    var pick = lower || upper;
    return { price: pick.price, basis: '参照' + ref(pick) + '信息价就近估算（' + scopeLabel + '，请人工复核）' };
  }

  function lookupPrice(periodKey, material, model, cores, section) {
    if (section === null || isNaN(section)) return null;
    var period = getPeriod(periodKey);
    if (!period.items || !period.items.length) return null;
    var items = period.items.map(normItem).filter(function (it) {
      return it.material === material && it.price > 0;
    });
    if (!items.length) return null;
    var nm = normModel(model);
    var fam = baseFamily(model);
    var mc = mainCoresOf(cores);
    cores = (cores || '').replace(/\s/g, '');

    var hit = items.filter(function (it) {
      return it.model === nm && it.cores === cores && it.section === section;
    })[0];
    if (hit) return { price: hit.price, source: hit.source, basis: hit.basis };

    hit = items.filter(function (it) {
      return it.family === fam && it.cores === cores && it.section === section;
    })[0];
    if (hit) return { price: hit.price, source: hit.source, basis: hit.basis };

    var pool, est;
    pool = items.filter(function (it) { return it.family === fam && it.mainCores === mc && it.cores === cores; });
    est = nearestEstimate(pool, section, '同型号同芯结构');
    if (est) return { price: est.price, source: 'estimated', basis: est.basis };

    pool = items.filter(function (it) { return it.mainCores === mc && it.cores === cores; });
    est = nearestEstimate(pool, section, '同芯结构近似型号');
    if (est) return { price: est.price, source: 'estimated', basis: est.basis };

    pool = items.filter(function (it) { return it.family === fam && it.mainCores === mc; });
    est = nearestEstimate(pool, section, '同主芯数近似结构');
    if (est) return { price: est.price, source: 'estimated', basis: est.basis };

    pool = items.filter(function (it) { return it.mainCores === mc; });
    est = nearestEstimate(pool, section, '同材质同芯数最接近档');
    if (est) return { price: est.price, source: 'estimated', basis: est.basis };

    return null;
  }

  // ============================================================
  // 电气材料信息价（配管/配线/桥架）——天津当月信息价，data/prices.js → period.elec
  // 有信息价读信息价(official)；规格无对应档时按相邻档插值估算(estimated)
  // ============================================================
  function elecTable(periodKey) {
    var p = getPeriod(periodKey);
    return (p && p.elec) || null;
  }
  // 在 {规格键:单价} 升序表中精确取值；无精确档则相邻档线性插值，越界取端档
  function interpByKey(table, key) {
    var keys = Object.keys(table).map(Number).filter(function (n) { return !isNaN(n); })
      .sort(function (a, b) { return a - b; });
    if (!keys.length) return null;
    key = Number(key);
    if (table[key] !== undefined) return { price: table[key], exact: true };
    var lower = null, upper = null;
    keys.forEach(function (k) {
      if (k < key) lower = k;
      if (k > key && upper === null) upper = k;
    });
    if (lower !== null && upper !== null) {
      var v = table[lower] + (table[upper] - table[lower]) * (key - lower) / (upper - lower);
      return { price: Math.round(v * 100) / 100, exact: false, lo: lower, hi: upper };
    }
    var pick = (lower !== null) ? lower : upper;
    return { price: table[pick], exact: false, clamp: pick };
  }

  function periodLabel(periodKey) {
    var p = getPeriod(periodKey);
    return (p.releaseLabel || p.period || '');
  }
  function lookupElecPrice(periodKey, it) {
    var e = elecTable(periodKey);
    if (!e) return null;
    var info = periodLabel(periodKey);
    // ---------- 配管 ----------
    if (it.category === 'conduit') {
      if (it.diameter === null) return null;
      if (it.conduitSteel) {
        if (!e.steelConduit) return null;
        var r = interpByKey(e.steelConduit, it.diameter);
        if (!r) return null;
        if (r.exact) return { price: r.price, source: 'official', basis: '天津' + info + '信息价 镀锌焊接钢管SC DN' + it.diameter + '（吨价×GB/T3091理论重量换算，除税）' };
        if (r.clamp !== undefined) return { price: r.price, source: 'estimated', basis: 'SC DN' + it.diameter + '无信息价档，按端档DN' + r.clamp + '信息价就近计，请人工复核' };
        return { price: r.price, source: 'estimated', basis: 'SC DN' + it.diameter + '无信息价档，按DN' + r.lo + '与DN' + r.hi + '信息价插值估算，请人工复核' };
      }
      if (!e.jdgConduit) return null;
      var rj = interpByKey(e.jdgConduit, it.diameter);
      if (!rj) return null;
      if (rj.exact) return { price: rj.price, source: 'official', basis: '天津' + info + '信息价 KBG/JDG电线管 DN' + it.diameter + '（JDG与KBG同价，除税）' };
      if (rj.clamp !== undefined) return { price: rj.price, source: 'estimated', basis: 'JDG/KBG DN' + it.diameter + '无信息价档，按端档DN' + rj.clamp + '信息价就近计，请人工复核' };
      return { price: rj.price, source: 'estimated', basis: 'JDG/KBG DN' + it.diameter + '无信息价档，按DN' + rj.lo + '与DN' + rj.hi + '信息价插值估算，请人工复核' };
    }
    // ---------- 配线 ----------
    if (it.category === 'wiring') {
      if (it.softWire) {
        // RYS/RVS 等双绞/多芯软线：信息价有 RVS(2芯) 按截面；其他多芯软线暂参考市场价
        if (it.wireModel === 'RVS' && e.rvsWire && it.section !== null) {
          var rr = interpByKey(e.rvsWire, it.section);
          if (rr) {
            if (rr.exact) return { price: rr.price, source: 'official', basis: '天津' + info + '信息价 RVS 2×' + it.section + ' 铜芯双绞软线（除税）' };
            return { price: rr.price, source: 'estimated', basis: 'RVS 2×' + it.section + '无信息价档，按相邻档插值估算，请人工复核' };
          }
        }
        // KYJY/KYY/RYS 等多芯软导线：信息价缺项，按"铜重+绝缘护套"模型计合理市场价
        var swr = controlCablePrice(it, e, '多芯软导线');
        if (swr) return swr;
        return null;
      }
      if (it.section === null) return null;
      var model = it.wireModel;
      // BYJ 无独立信息价 → 参照同截面 BV 信息价（交联线略贵，按BV价保守计并标注）
      var table = null, famLabel = '';
      if (model === 'BVR' && e.bvrWire) { table = e.bvrWire; famLabel = 'BVR'; }
      else if (e.bvWire) { table = e.bvWire; famLabel = (model === 'BYJ') ? 'BV(BYJ参照)' : 'BV'; }
      if (!table) return null;
      var rw = interpByKey(table, it.section);
      if (!rw) return null;
      var tag = (model === 'BVR') ? 'BVR' : 'BV';
      if (rw.exact) {
        if (model === 'BYJ') return { price: rw.price, source: 'estimated', basis: 'BYJ ' + it.section + 'mm²无独立信息价，参照同截面BV信息价计（交联聚乙烯线，建议人工复核）' };
        return { price: rw.price, source: 'official', basis: '天津' + info + '信息价 ' + tag + ' ' + it.section + 'mm² 铜芯塑料线（除税）' };
      }
      return { price: rw.price, source: 'estimated', basis: tag + ' ' + it.section + 'mm²无信息价档，按相邻档插值估算，请人工复核' };
    }
    // ---------- 桥架 ----------
    if (it.category === 'bridge') {
      if (it.bridgeWidth === null || !e.bridge) return null;
      var w = it.bridgeWidth, h = it.bridgeHeight;
      // 精确 宽x高
      if (h !== null && e.bridge[w + 'x' + h] !== undefined) {
        return { price: e.bridge[w + 'x' + h], source: 'official', basis: '天津' + info + '信息价 钢制槽式电缆桥架 ' + w + '×' + h + '（除税）' };
      }
      // 同宽度内取高度最接近（或该宽仅一档）
      var sameW = Object.keys(e.bridge).filter(function (k) { return parseInt(k, 10) === w; });
      if (sameW.length) {
        var bestK = sameW[0], bestDiff = Infinity;
        sameW.forEach(function (k) {
          var kh = parseInt(k.split('x')[1], 10);
          var diff = (h === null) ? 0 : Math.abs(kh - h);
          if (diff < bestDiff) { bestDiff = diff; bestK = k; }
        });
        var exactH = (h !== null && bestDiff === 0);
        return {
          price: e.bridge[bestK],
          source: exactH ? 'official' : 'estimated',
          basis: exactH
            ? '天津' + info + '信息价 钢制槽式电缆桥架 ' + bestK + '（除税）'
            : '桥架 ' + w + (h ? '×' + h : '') + ' 无完全对应信息价，按同宽规格 ' + bestK + ' 信息价' + (h ? '就近' : '') + '计，请人工复核'
        };
      }
      // 无同宽：按宽度最接近档（取其首档高度）
      var widths = {};
      Object.keys(e.bridge).forEach(function (k) {
        var kw = parseInt(k, 10), kh = parseInt(k.split('x')[1], 10);
        if (widths[kw] === undefined || kh < widths[kw].h) widths[kw] = { h: kh, k: k };
      });
      var wkeys = Object.keys(widths).map(Number).sort(function (a, b) { return a - b; });
      var bw = wkeys[0];
      wkeys.forEach(function (kw) { if (Math.abs(kw - w) < Math.abs(bw - w)) bw = kw; });
      return {
        price: e.bridge[widths[bw].k],
        source: 'estimated',
        basis: '桥架宽' + w + '无信息价档，按最接近宽度 ' + widths[bw].k + ' 信息价就近估算，请人工复核'
      };
    }
    // ---------- 照明开关、按钮 ----------
    if (it.category === 'switchBtn') {
      if (it.swIsBtn) {
        if (it.btnKind === 'control') {
          var cb = (e.buttonControl || {})[it.btnEx] || 18;
          return { price: cb, source: 'market', basis: (it.btnEx === 'ex' ? '防爆型控制按钮（LA39/LAY7等，国产中高档）' : '普通型控制按钮（LA39/LAY7等，国产中高档）') + '，信息价缺项按市场价（除税）' };
        }
        var gb = (e.buttonGeneral || {})[it.btnLay] || 9;
        return { price: gb, source: 'market', basis: '一般按钮（' + (it.btnLay === 'concealed' ? '暗装' : '明装') + '，国产中高档），信息价缺项按市场价（除税）' };
      }
      if (it.swType === 'pull') return { price: e.switchPull || 9, source: 'market', basis: '拉线开关，信息价缺项按国产中高档市场价（除税）' };
      if (it.swType === 'surface') return { price: e.switchSurface || 13, source: 'market', basis: '扳把开关明装，信息价缺项按国产中高档市场价（除税）' };
      if (it.swType === 'sealed') return { price: e.switchSealed || 26, source: 'market', basis: '密闭开关（防水防尘，5A以内），信息价缺项按国产中高档市场价（除税）' };
      if (it.swType === 'ex') return { price: e.switchEx || e.switchSealed || 45, source: 'market', basis: '防爆照明开关（Ex dⅡBT6，国产中高档），信息价缺项按市场价（除税）' };
      // 扳式暗开关（大跷板）：单~四联信息价，五/六联市场价；单控双控同价
      var g = Math.max(1, Math.min(6, it.swGang || 1));
      var sp = (e.switchPlate || {})[g] || { price: 20, basis: 'market' };
      var ctrlTxt = (it.swCtrl === 'double' ? '双控' : '单控') + SW_TIER_CN[g];
      if (sp.basis === 'info') {
        return { price: sp.price, source: 'official', basis: '天津' + info + '信息价 大跷板（扳式暗）开关 ' + ctrlTxt + '（含税中准价÷1.13除税，单/双控同价）' };
      }
      return { price: sp.price, source: 'market', basis: '扳式暗开关 ' + ctrlTxt + '，' + info + '信息价缺项，按国产中高档市场价（除税）' };
    }
    // ---------- 插座 ----------
    if (it.category === 'outlet') {
      if (it.outEx) {
        var ai = it.outAmp <= 15 ? 15 : (it.outAmp <= 30 ? 30 : 60);
        var exT = it.outThree ? 'three' : (/三孔/.test(it.name || '') && !/四孔/.test(it.name || '') ? 'single3' : 'single');
        var exv = (((e.outletEx || {})[exT]) || {})[ai];
        if (exv == null) return null;
        var exN = it.outThree ? '三相四孔' : (exT === 'single3' ? '单相三孔' : '单相');
        return { price: exv, source: 'market', basis: '防爆插座 ' + exN + ' ' + ai + 'A，信息价缺项按国产中高档市场价（除税）' };
      }
      if (it.outThree) {
        var t30 = it.outAmp >= 25;
        var tk = (it.layMode === 'surface' ? 'surface' : 'conceal') + (t30 ? 30 : 15);
        var tv = (e.outletThree || {})[tk];
        if (tv == null) return null;
        return { price: tv, source: 'market', basis: '三相四孔插座 ' + (t30 ? 30 : 15) + 'A ' + (it.layMode === 'surface' ? '明装' : '暗装') + '，信息价缺项按国产中高档市场价（除税）' };
      }
      if (it.outAmp === 30) {
        var sk = it.layMode === 'surface' ? 'surfaceSingle3' : ('concealSingle' + ((it.outHoles === 2) ? 2 : 3));
        var sv = (e.outlet30 || {})[sk];
        if (sv == null) return null;
        return { price: sv, source: 'market', basis: '单相插座30A ' + (it.layMode === 'surface' ? '明装' : '暗装') + '，信息价缺项按国产中高档市场价（除税）' };
      }
      // 单相15A
      var tbl15 = it.layMode === 'surface' ? e.outlet15Surface : e.outlet15Conceal;
      if (!tbl15) return null;
      var h = it.outHoles || 3;
      var hk = String(h);
      var pv15 = tbl15[hk];
      if (pv15 == null) {
        // 越界取端档
        var hks = Object.keys(tbl15).map(Number).sort(function (a, b) { return a - b; });
        pv15 = tbl15[String(h < hks[0] ? hks[0] : hks[hks.length - 1])];
      }
      // 暗装五孔、三孔为信息价；其余孔数及明装为市场价
      var isInfoHole = (it.layMode === 'concealed' && (h === 5 || h === 3));
      if (isInfoHole) {
        return { price: pv15, source: 'official', basis: '天津' + info + '信息价 暗插座 ' + (h === 5 ? '五孔' : '三孔') + ' 单相15A（含税中准价÷1.13除税）' };
      }
      return { price: pv15, source: 'market', basis: '单相插座15A ' + h + '孔 ' + (it.layMode === 'surface' ? '明装' : '暗装') + '，' + info + '信息价缺项，按国产中高档市场价（除税）' };
    }
    // ---------- 防雷接地 ----------
    if (it.category === 'ground') {
      var gt = it.gType;
      // 等电位端子箱（清单030410007 / 定额2-369）：局部45元、总等电位220元
      if (gt === 'pot') {
        var isMain = (it.potKind === 'main');
        return {
          price: isMain ? (e.potMain || 220) : (e.potLocal || 45),
          source: 'market',
          basis: (isMain ? '总等电位端子箱（MEB）' : '局部等电位端子箱（LEB，TD28等）') + '，天津' + info + '信息价缺项，按国产中高档市场价（除税）'
        };
      }
      // 接地母线（清单030410002 / 定额2-830）：镀锌扁钢-40×4 5.473元/m
      if (gt === 'busbar') {
        return {
          price: e.groundBusbar || 5.473,
          source: 'market',
          basis: '镀锌扁钢 -40×4 接地母线（理论重量1.256kg/m）综合价5.473元/m（除税），天津' + info + '信息价无镀锌扁钢，按市场价'
        };
      }
      // 避雷网（定额2-885）：主材按φ10圆钢信息价折算；均压环不计主材
      if (gt === 'ring' && it.gRingKind === 'mesh') {
        var rs = e.roundSteel10 || 3394.35;
        return {
          price: Math.round(rs * 0.617 / 1000 * 100) / 100,
          source: 'official',
          basis: '天津' + info + '信息价 圆钢HPB300 D10 3835.61元/t（含税）÷1.13=' + rs.toFixed(2) + '元/t（除税）×φ10理论重量0.617kg/m'
        };
      }
      // 接地极（角钢L50×5，2.5m/根，理论重量3.77kg/m）
      if (gt === 'rod') {
        var kg = 3.77 * 2.5;
        var ang = (e.groundAngleSteelKg || 4.6);
        var rodPrice = Math.round(kg * ang * 100) / 100;
        return {
          price: rodPrice,
          source: 'market',
          basis: '角钢接地极 L50×5，2.5m/根，理论重量3.77kg/m×2.5m=' + kg.toFixed(2) + 'kg × 镀锌角钢市场价' + ang +
            '元/kg（除税）= ' + rodPrice.toFixed(2) + '元/根'
        };
      }
      // 断接卡子（成品镀锌，含螺栓）
      if (gt === 'test') {
        return {
          price: (e.groundTestCard || 12.0),
          source: 'market',
          basis: '断接卡子（成品镀锌，含M12螺栓）市场价（除税）'
        };
      }
      // 引下线/均压环：利用建筑物结构钢筋（属土建专业），不计主材
      if (gt === 'down' || gt === 'ring') {
        return { price: null, source: 'none', basis: '利用建筑物结构钢筋（钢筋属土建专业），本项不计主材' };
      }
      return { price: null, source: 'none' };
    }

    // ---------- 母线 ----------
    if (it.category === 'bus') {
      if (it.bType === 'box') {
        return {
          price: e.busBox || 1946,
          source: 'market',
          basis: '封闭母线槽分线箱（插接箱' + (it.busAmp ? ' ' + it.busAmp + 'A' : '') + '）国产中高档市场价（除税），天津' + info + '信息价缺项'
        };
      }
      if (it.busAmp === null) return null; // 未识别额定电流，标待询价
      var bAmp = it.busAmp;
      var bPrice = Math.round(bAmp * 3 / 1.13 * 100) / 100;
      return {
        price: bPrice,
        source: 'market',
        basis: '低压封闭式插接母线槽 ' + bAmp + 'A，主材按额定电流×3元/A÷1.13除税计入（' + bAmp + '×3÷1.13=' + bPrice.toFixed(2) + '元/m）'
      };
    }

    // ---------- 电力电缆终端头（1kV/10kV 热缩式成套件，市场价）----------
    if (it.category === 'head') {
      if (it.section === null || isNaN(it.section)) return null;
      var hcfg = e.cableHead;
      if (!hcfg) return null;
      var hn = mainCoresOf(it.cores) || 1;
      // 矿物绝缘电缆终端头（铜护套密封终端）为专用成套件，按专表计
      if (isMineralModel(it.model) && hcfg.mineral) {
        var mr = interpByKey(hcfg.mineral, it.section);
        if (mr) {
          var mk = hn === 1 ? 1 : Math.round(hn * 0.95 * 100) / 100;
          var mprice = Math.round(mr.price * mk * 100) / 100;
          return {
            price: mprice,
            source: 'market',
            basis: '矿物绝缘电缆终端头 ' + it.model + ' ' + hn + '芯×' + it.section + 'mm²：单芯终端' +
              mr.price.toFixed(2) + '元/个 × ' + (hn === 1 ? '1' : hn + '芯×0.95') + ' = ' + mprice.toFixed(2) +
              '元/个，' + hcfg.mineralBrand + '（铜护套密封终端成套件，含端子、密封罐、接地），除税'
          };
        }
      }
      var htab = it.highVoltage ? hcfg.hv : hcfg.lv;
      var hr = interpByKey(htab, it.section);
      if (!hr) return null;
      var hk = coreCoefOf(hcfg.coreCoef, hn);
      var hprice = Math.round(hr.price * hk * 100) / 100;
      return {
        price: hprice,
        source: 'market',
        basis: (it.highVoltage ? '10kV' : '1kV') + '户内热（冷）缩式电力电缆终端头 电缆截面' + it.section +
          'mm²以内：成套件' + hr.price.toFixed(2) + '元/个 × 多芯折算系数' + hk + '（按' + hn + '芯）= ' + hprice.toFixed(2) +
          '元/个，' + hcfg.brand + '（含铜接线端子、热缩管、接地线），除税'
      };
    }

    // ---------- 控制电缆（信息价缺项，按铜重+绝缘护套模型计市场价）----------
    if (it.category === 'control') {
      var ccr = controlCablePrice(it, e, '控制电缆');
      if (ccr) return ccr;
    }

    // ---------- 灯具（成套灯具信息价缺项，均按国产中高档市场价；LED灯管/灯口除外）----------
    var lampMkt = function (v, label) {
      return { price: v, source: 'market', basis: label + '，信息价仅有LED灯管/灯口，成套灯具按国产中高档市场价（除税）' };
    };
    if (it.category === 'lampCommon') {
      var lq = matchQuota(it);
      if (lq && lq.code && e.lampPlain && e.lampPlain[lq.code] != null) {
        return lampMkt(e.lampPlain[lq.code], lq.name.replace(/^其他普通灯具安装\s*/, '') + '（成套）');
      }
      // 吸顶灯按周长
      var lp = it.lampPerimeter || 0;
      var lv = lp <= 800 ? e.lampCeilByPeri[800] : (lp <= 1100 ? e.lampCeilByPeri[1100] : e.lampCeilByPeri.inf);
      return lampMkt(lv, 'LED吸顶灯具（灯罩周长' + (lp <= 800 ? '800mm以内' : lp <= 1100 ? '1100mm以内' : '1100mm以外') + '）');
    }
    if (it.category === 'lampFluor') {
      if (isPanelLamp(it.name || '') || it.fluorPanel) {
        var pp2 = it.lampPerimeter || 0;
        var pv2 = pp2 <= 800 ? e.lampCeilByPeri[800] : (pp2 <= 1100 ? e.lampCeilByPeri[1100] : e.lampCeilByPeri.inf);
        return lampMkt(pv2, 'LED平板灯（灯罩周长' + (pp2 <= 800 ? '800mm以内' : pp2 <= 1100 ? '1100mm以内' : '1100mm以外') + '）');
      }
      var ft = Math.max(1, Math.min(4, it.fluorTubes || parseFluorTubes(it.name || '')));
      var fk = it.fluorKind === 'assembled' ? 'assembled' : 'complete';
      var fm = it.fluorMount || parseFluorMount(it.name || '');
      var frow = (e.lampFluor || {})[fm];
      // 组装型无吊管/嵌入 → 回退成套同方式（与定额回退一致）
      if (!frow || (fk === 'assembled' && (fm === 'pipe' || fm === 'embed'))) frow = (e.lampFluor || {}).chain;
      var fv = frow[ft];
      return lampMkt(fv, 'LED' + FLUOR_TUBE_CN[ft] + '荧光灯 ' + FLUOR_MOUNT_NAME[fm] + '（' + (fk === 'assembled' ? '组装型' : '成套型') + '）');
    }
    if (it.category === 'lampFactory') {
      var ffq = matchQuota(it);
      if (ffq && ffq.code && e.lampFactoryFixed && e.lampFactoryFixed[ffq.code] != null) {
        return lampMkt(e.lampFactoryFixed[ffq.code], ffq.name.replace(/^.*?安装\s*/, '') + '（成套）');
      }
      var ffm = it.factoryMount || parseFactoryMount(it.name || '');
      var fwp = (it.factoryType === 'waterproof' || isWaterproofFactory(it.name || ''));
      var ffv = (fwp ? e.lampFactoryWp : e.lampFactoryHood)[ffm];
      if (ffv == null) ffv = fwp ? 135.0 : 120.0;
      return lampMkt(ffv, (fwp ? '防水防尘灯' : '工厂罩灯') + ' ' + (fwp ? LAMP_FACTORY_WP_NAME[ffm] : LAMP_FACTORY_HOOD_NAME[ffm]));
    }
    if (it.category === 'lampMedical') {
      var mq = matchQuota(it);
      if (mq && mq.code && e.lampMedical && e.lampMedical[mq.code] != null) {
        return lampMkt(e.lampMedical[mq.code], mq.name.replace(/^医院灯具安装\s*/, ''));
      }
      return lampMkt((e.lampMedical || {})['2-1785'] || 180.0, '医院专用灯具（按紫外线杀菌灯档次估）');
    }
    if (it.category === 'lampDecor') {
      var dn = it.name || '';
      // 应急照明 / 疏散指示 / 安全出口 / 标志 / 诱导灯：按"标志灯"成套市场价（带蓄电池）
      if (/应急|疏散|安全出口|标志灯|诱导|出口指示/.test(dn)) {
        var sk = 'other';
        if (/安全出口/.test(dn)) sk = 'exit';
        else if (/楼层/.test(dn)) sk = 'floor';
        else if (/诱导/.test(dn)) sk = 'induce';
        else if (/疏散|指示/.test(dn)) sk = 'evacuate';
        else if (/应急/.test(dn)) sk = 'emergency';
        var sv = (e.lampSign || {})[sk];
        if (sv == null) sv = 60.0;
        var sLabel = { exit: '安全出口标志灯', floor: '楼层标志灯', induce: '诱导标志灯', evacuate: '疏散指示灯', emergency: '应急照明灯（双头）', other: '应急标志灯' }[sk];
        return lampMkt(sv, sLabel + '（成套，带蓄电池）');
      }
      // 筒灯：按功率档计（防潮/防水型另加系数）
      if (/筒灯/.test(dn)) {
        var dw = parseLampWatt(dn);
        var dtier = !dw ? '10' : (dw <= 6 ? '6' : (dw <= 10 ? '10' : (dw <= 15 ? '15' : (dw <= 24 ? '24' : '30'))));
        var dv = (e.lampDownlight || {})[dtier];
        if (dv == null) dv = 28.0;
        var damp = /防潮|防水|密闭/.test(dn);
        if (damp) dv = Math.round(dv * 1.25 * 100) / 100;
        return lampMkt(dv, 'LED筒灯' + (dw ? ' ' + dw + 'W' : '') + '（' + (dtier === '30' ? '24W以上' : dtier + 'W以内') + (damp ? '，防潮型' : '') + '，成套）');
      }
      var dk = null;
      if (/射灯/.test(dn)) dk = 'spot';
      else if (/蜡烛|点光源/.test(dn)) dk = 'candle';
      else if (/格栅/.test(dn)) dk = 'grille';
      else if (/无主灯|嵌入/.test(dn)) dk = 'embedded';
      else if (/花灯|艺术/.test(dn)) dk = 'art';
      else if (/草坪灯/.test(dn)) dk = 'lawn';
      else if (/水下/.test(dn)) dk = 'underwater';
      else if (/串珠|挂片|几何/.test(dn)) dk = 'bead';
      if (!dk) dk = 'other';
      var dv2 = (e.lampDecor || {})[dk];
      if (dv2 == null) dv2 = (e.lampDecor || {}).other;
      if (dv2 == null) dv2 = 90.0;
      var dlabel = { spot: 'LED射灯', candle: '蜡烛灯/点光源', grille: '艺术格栅装饰灯', embedded: '嵌入式无主灯', art: '艺术花灯', lawn: '草坪灯', underwater: '水下艺术装饰灯', bead: '挂片/串珠装饰灯', other: '其他装饰灯具' }[dk];
      return lampMkt(dv2, dlabel + '（成套）');
    }
    return null;
  }

  // ============================================================
  // 项目特征
  // ============================================================
  var CAT_LABEL = {
    power: '电力电缆', control: '控制电缆', head: '电力电缆头',
    conduit: '配管', wiring: '配线', bridge: '桥架',
    lampCommon: '普通灯', lampDecor: '装饰灯', lampFluor: '荧光灯',
    lampFactory: '工厂灯', lampMedical: '医疗专用灯', outlet: '插座',
    switchBtn: '照明开关、按钮',
    ground: '防雷接地', bus: '母线',
    box: '配电箱', boxCabinet: '配电柜'
  };
  var CAT_WORK = {
    power: '电缆敷设、电缆头制作安装及辅助工作',
    control: '控制电缆敷设及辅助工作',
    head: '电力电缆终端头制作、安装、接地、接线及辅助工作',
    conduit: '管路敷设、固定、接地连接及为完成该项所需的辅助工作',
    wiring: '管内穿线、接线、端子连接及辅助工作',
    bridge: '桥架组对、安装、接地、附件安装及辅助工作',
    lampCommon: '灯具安装、接线、固定、试亮及辅助工作',
    lampDecor: '装饰灯具安装、接线、固定、试亮及辅助工作',
    lampFluor: '荧光灯具安装、接线、固定、试亮及辅助工作',
    lampFactory: '工厂灯具安装、接线、固定、试亮及辅助工作',
    lampMedical: '医院专用灯具安装、接线、固定、调试及辅助工作',
    outlet: '测位画线、打眼、清扫盒子、装插座、接线、装盖及辅助工作',
    switchBtn: '测位画线、打眼、清扫盒子、装开关（按钮）、接线、装盖及辅助工作',
    ground: '平直、下料、测位、打眼、埋卡子、焊接、固定、刷漆、接地电阻测试及辅助工作',
    bus: '开箱、检查、测位、划线、打眼、固定、连接、接地、刷漆及辅助工作',
    box: '成套配电箱购置、运输、安装、接地、接线、调试及辅助工作',
    boxCabinet: '成套配电柜（屏）购置、运输、安装、接地、接线、调试及辅助工作'
  };
  // 配电箱安装方式描述
  function boxInstallSpec(it) {
    if (it.isCabinet) return '落地安装';
    if (it.form === 'floor') return '落地安装';
    var t = BOX_PERIMETER_TIERS.filter(function (x) { return x.tier === String(it.perimeterTier); })[0];
    return '壁挂（悬挂嵌入式）安装 ' + (t ? t.label : '');
  }
  function specText(it) {
    // 配电箱（柜）
    if (it.category === 'box' || it.category === 'boxCabinet') {
      return boxInstallSpec(it);
    }
    // 灯具/插座：不套用电缆的 型号-电压-截面mm² 描述
    if (/^lamp/.test(it.category)) {
      var lp = [];
      if (it.fluorPanel) lp.push('LED平板灯');
      if (it.lampPerimeter) lp.push('灯罩周长' + it.lampPerimeter + 'mm');
      if (it.category === 'lampFluor' && !it.fluorPanel) {
        lp.push(FLUOR_TUBE_CN[it.fluorTubes || 1] + ' ' + (FLUOR_MOUNT_NAME[it.fluorMount] || ''));
      }
      if (it.category === 'lampDecor') {
        var dsn = it.name || '';
        if (/应急|疏散|安全出口|标志灯|诱导|出口指示/.test(dsn)) {
          lp.push('标志、诱导灯 ' + LAMP_SIGN_NAME[parseSignMount(dsn)] + '（带蓄电池）');
        } else if (/筒灯/.test(dsn)) {
          var dwf = parseLampWatt(dsn);
          lp.push('筒灯' + (dwf ? ' ' + dwf + 'W' : '') + ' 嵌入式');
        }
      }
      return lp.join(' ');
    }
    if (it.category === 'outlet') {
      return (it.outEx ? '防爆 ' : '') + (it.outThree ? '三相' : '单相') + ' ' + it.outAmp + 'A' +
        (it.outHoles ? ' ' + it.outHoles + '孔' : (it.outThree ? ' 4孔' : '')) +
        (it.layMode === 'concealed' ? ' 暗装' : ' 明装');
    }
    if (it.category === 'switchBtn') {
      if (it.swIsBtn) {
        if (it.btnKind === 'control') return '控制按钮 ' + (it.btnEx === 'ex' ? '防爆型' : '普通型');
        return '一般按钮 ' + (it.btnLay === 'concealed' ? '暗装' : '明装');
      }
      if (it.swType === 'pull') return '拉线开关';
      if (it.swType === 'surface') return '扳把开关 明装';
      if (it.swType === 'sealed') return '密闭开关 5A以内';
      return '扳式暗开关 ' + (it.swCtrl === 'double' ? '双控' : '单控') + ' ' + SW_TIER_CN[it.swGang || 1];
    }
    // 防雷接地
    if (it.category === 'ground') {
      var gspec = {
        pot: (it.potKind === 'main' ? '总等电位端子箱（MEB）' : '局部等电位端子箱（LEB）'),
        busbar: '镀锌扁钢 -40×4 接地母线',
        sys: '接地网 接地系统测试',
        down: '利用建筑物主筋引下',
        ring: (it.gRingKind === 'mesh' ? '避雷网 φ10热镀锌圆钢' : '均压环 利用圈梁钢筋'),
        rod: '角钢接地极 普通土',
        test: '断接卡子制作安装'
      };
      return gspec[it.gType] || '';
    }
    // 母线
    if (it.category === 'bus') {
      if (it.bType === 'box') return '封闭母线槽分线箱（插接箱）' + (it.busAmp ? ' ' + it.busAmp + 'A' : ' 型号未注');
      return '低压封闭式插接母线槽' + (it.busAmp ? ' 每相电流' + it.busAmp + 'A' : ' 电流未注');
    }
    var parts = [];
    if (it.model) parts.push(it.model);
    if (it.voltage) parts.push(it.voltage);
    if (it.spec) parts.push(it.spec + 'mm²');
    if (it.category === 'conduit' && it.diameter !== null) parts.push('DN' + it.diameter);
    if (it.category === 'bridge' && it.bridgeWidth !== null) parts.push('宽' + it.bridgeWidth + 'mm');
    return parts.join('-');
  }
  function featureGLD(it) {
    return [
      '1.名称: ' + it.name,
      '2.规格型号: ' + specText(it),
      '3.其他: 满足招标图纸、招标文件、技术标准及相关图集规范要求'
    ].join('\n');
  }
  function featureJJ(it) {
    return '项目特征：1. ' + it.name + ' 2. 规格型号：' + specText(it) + ' 3. 其他详见招标文件、设计图纸及相关规范\n' +
      '工作内容：1. 购置、安装 2. ' + CAT_WORK[it.category] + ' 3. 参照图纸及招标文件技术要求 4. 满足施工及验收规范 5. 为完成该项所需辅助工作请在综合单价中考虑，达竣工交验标准';
  }
  function generateFeature(format, it) {
    return format === 'jianjing' ? featureJJ(it) : featureGLD(it);
  }

  // ============================================================
  // 输入解析（A序号 B项目名称 C工程量）
  // ============================================================
  function buildItem(name) {
    var category = classify(name);
    if (!category) return null;

    var it = {
      category: category,
      categoryLabel: CAT_LABEL[category],
      name: name,
      material: detectMaterial(name),
      model: extractModel(name),
      voltage: extractVoltage(name),
      highVoltage: isHighVoltage(name),
      spec: '', cores: '', totalCores: 0, section: null,
      diameter: null, bridgeWidth: null, bridgeHeight: null,
      conduitSteel: false, wireModel: '', softCores: 0, softWire: false,
      layMode: 'surface',       // 配管明敷/暗敷；插座明装/暗装
      wireType: 'lighting',     // 配线默认照明，用户可改
      // 灯具
      lampPerimeter: null, fluorPanel: false,
      fluorTubes: 0, fluorKind: '', fluorMount: '',
      factoryMount: '', factoryType: '',
      // 插座
      outEx: false, outThree: false, outAmp: 15, outHoles: null,
      // 开关、按钮
      swIsBtn: false, swType: 'plate', swCtrl: 'single', swGang: 1,
      btnKind: 'general', btnEx: 'normal', btnLay: 'surface',
      // 配电箱（柜）
      isCabinet: false, lowVolt: false, form: 'wall', perimeterTier: BOX_DEFAULT_TIER,
      listCode: LIST[category]
    };

    if (category === 'boxCabinet' || category === 'box') {
      var bi = identifyBox(name) || { isCabinet: category === 'boxCabinet', lowVolt: false };
      it.isCabinet = !!bi.isCabinet;
      it.lowVolt = !!bi.lowVolt;
      var nameFloor = name.indexOf('落地') >= 0;
      it.form = (it.isCabinet || nameFloor) ? 'floor' : 'wall';
      it.perimeterTier = (it.isCabinet || nameFloor) ? '' : BOX_DEFAULT_TIER;
    }

    if (category === 'ground') {
      it.gType = parseGroundType(name);
      it.gRingKind = it.gType === 'ring' ? parseGroundRing(name) : '';
      it.potKind = /总等电位|MEB/i.test(name) ? 'main' : 'local';
      it.listCode = GROUND_LIST[it.gType] || '';
    }
    if (category === 'bus') {
      it.bType = parseBusType(name);
      it.busAmp = parseBusAmp(name);
      it.busTier = null; // 行内选择的电流档上限（用于定额），主材价仍按实际额定电流
      it.listCode = BUS_LIST[it.bType] || '';
    }

    var specInfo = parseSpec(name);
    it.spec = specInfo.spec;
    it.cores = specInfo.cores;
    it.totalCores = specInfo.totalCores;
    it.section = specInfo.section;

    if (category === 'conduit') {
      it.diameter = parseDiameter(name);
      it.conduitSteel = conduitIsSteel(name);
    }
    if (category === 'bridge') {
      var wh = parseBridgeWH(name);
      it.bridgeWidth = wh.w;
      it.bridgeHeight = wh.h;
    }
    if (category === 'head') {
      it.section = parseHeadSection(name, specInfo);
      if (it.section !== null) it.spec = '1×' + it.section;
    }
    if (category === 'wiring') {
      it.softWire = isSoftWire(name);
      it.section = parseWireSection(name, specInfo);
      var wm = name.match(/(BVVB|BVR|BYJ|RVS|RYJS|RYS|KYJY|KYY|BV)/i);
      it.wireModel = wm ? wm[1].toUpperCase() : '';
      it.softCores = it.softWire ? (specInfo.totalCores || parseSoftCores(name, specInfo)) : 0;
    }
    if (category === 'lampCommon' || category === 'lampFluor') {
      it.lampPerimeter = parseLampPerimeter(name);
      it.fluorPanel = isPanelLamp(name);
      it.fluorTubes = parseFluorTubes(name);
      it.fluorKind = parseFluorKind(name);
      it.fluorMount = parseFluorMount(name);
    }
    if (category === 'lampFactory') {
      it.factoryMount = parseFactoryMount(name);
      it.factoryType = isWaterproofFactory(name) ? 'waterproof' : 'hood';
    }
    if (category === 'outlet') {
      it.outEx = isOutletEx(name);
      it.outThree = isOutletThree(name);
      it.outAmp = parseOutletAmp(name);
      it.outHoles = parseOutletHoles(name);
      // 插座默认暗装（名称明确注明"明装/明插座"才按明装），不再由人工选明暗
      it.layMode = /明装|明插座|明敷/.test(name) ? 'surface' : 'concealed';
    }
    if (category === 'switchBtn') {
      it.swIsBtn = isButton(name);
      if (it.swIsBtn) {
        it.btnKind = parseBtnKind(name);
        it.btnEx = parseBtnEx(name);
        it.btnLay = parseBtnLay(name);
      } else {
        it.swType = parseSwType(name);
        it.swCtrl = parseSwCtrl(name);
        it.swGang = parseSwGang(name);
      }
    }
    return it;
  }

  function buildWarn(it, quota) {
    var w = [];
    if (it.category === 'lampDecor' && !quota.code) {
      w.push('装饰灯已套清单030413002；该装饰灯具（花灯/射灯/艺术灯等）安装子目差异大，请按2020基价第二册第十三章装饰灯具章节手选定额');
    }
    if (it.category === 'lampDecor' && quota.code && /筒灯/.test(it.name || '')) {
      w.push('筒灯套' + quota.code + '（可改2-1540/1541）');
    }
    if (it.category === 'lampDecor' && quota.code && /应急|疏散|安全出口|标志灯|诱导|出口指示/.test(it.name || '')) {
      w.push('标志灯套' + quota.code + '（可改2-1720/1721/1723）');
    }
    if (it.category === 'ground') {
      if (!it.gType) w.push('未识别防雷接地子类型（等电位/接地母线/接地装置/引下线/均压环·避雷网/接地极/断接卡），请核对项目名称');
      if (it.gType === 'down') w.push('定额2-880以"根"为单位（清单030410003按延长米），请按引下线根数核对定额工程量');
      if (it.gType === 'test') w.push('定额2-881以"10套"为单位，清单按延长米计列时请换算');
    }
    if (it.category === 'switchBtn' && it.swType === 'ex') {
      w.push('第二册无防爆开关专用子目，防爆开关套密闭开关2-1813，请核对');
    }
    if (quota.noTier) {
      if (it.category === 'bus') w.push('未识别母线/分线箱额定电流(A)，暂按最小档计，请核对名称（如 母线 1000A）');
      if (it.category === 'control') w.push('未识别控制电缆芯数，请核对名称（如 KVV-7×1.5）');
      if (it.category === 'conduit') w.push('未识别配管公称直径(DN)，请核对名称（如 JDG20 / SC25）');
      if (it.category === 'wiring') w.push('未识别导线截面/芯数，请核对名称（如 BV-2.5 / RVS-2×1.5）');
      if (it.category === 'bridge') w.push('未识别桥架宽度，请核对名称（如 200×100）');
    }
    if (quota.overRange) {
      if (it.category === 'control') w.push('芯数超48，请改套2-591~594对应子目');
      if (it.category === 'head') w.push('电缆头截面超400mm²，请按基价表对应顶档子目核对');
      if (it.category === 'conduit') w.push('管径超本类最大档，请按基价表更大规格子目核对');
      if (it.category === 'wiring' && !it.softWire) w.push('导线截面超出常规档，请按基价表对应子目核对');
      if (it.category === 'bridge') w.push('桥架宽度超1500mm，请按基价表更大规格子目核对');
    }
    return w.join('；');
  }

  function parseRows(aoa, periodKey, format) {
    var results = [];
    var autoIdx = 0;
    for (var r = 0; r < aoa.length; r++) {
      var row = aoa[r] || [];
      var rawName = row[1];
      var name = (rawName === undefined || rawName === null) ? '' : String(rawName).trim();
      if (!name) continue;
      if ((/序号/.test(String(row[0] || ''))) && (/名称/.test(name))) continue;
      if (/项目名称|电缆名称|名称型号/.test(name) && /名称/.test(name) && !/\d/.test(name) && r < 5) continue;

      var it = buildItem(name);
      if (!it) { if (!results._dropped) results._dropped = []; results._dropped.push(name); continue; }

      autoIdx++;
      var seqRaw = row[0];
      it.index = (seqRaw !== undefined && seqRaw !== null && String(seqRaw).trim() !== '') ? String(seqRaw).trim() : String(autoIdx);

      var qtyRaw = row[2];
      var qty = parseFloat(qtyRaw);
      it.qtyWarn = false;
      if (isNaN(qty) || qty <= 0) { qty = 1; it.qtyWarn = true; }
      it.quantity = qty;
      // 单位：电缆/配管/配线/桥架/接地母线/均压环/引下线=m；电缆头/插座/开关按钮=个；灯具=套；配电箱（柜）/母线箱/等电位端子箱=台
      if (it.category === 'box' || it.category === 'boxCabinet') it.unit = '台';
      else if (it.category === 'bus') it.unit = (it.bType === 'box') ? '台' : 'm';
      else if (it.category === 'ground') it.unit = GROUND_UNIT[it.gType] || 'm';
      else if (/^lamp/.test(it.category)) it.unit = '套';
      else if (it.category === 'head' || it.category === 'outlet' || it.category === 'switchBtn') it.unit = '个';
      else it.unit = 'm';

      var quota = matchQuota(it);
      it.quotaCode = quota.code;
      it.quotaName = quota.name;
      it.codeInferred = !!quota.inferred;
      it.warn = buildWarn(it, quota);
      if (it.qtyWarn) it.warn = (it.warn ? it.warn + '；' : '') + '工程量缺失，暂按1' + it.unit + '计请核对';

      // 主材价：电力电缆走电缆价格库；配管/配线/桥架/开关/插座/灯具走电气材料价（信息价优先，缺项市场价）；
      // 配电箱（柜）价格留空由用户询价；控制电缆/电缆头暂不自动询价
      var priceInfo = null;
      if (it.category === 'power') {
        priceInfo = pricePower(periodKey, it);
      } else if (it.category !== 'box' && it.category !== 'boxCabinet') {
        priceInfo = lookupElecPrice(periodKey, it);
      }
      if (priceInfo) {
        it.price = priceInfo.price;
        it.priceSource = priceInfo.source;       // official | estimated | market
        it.priceBasis = priceInfo.basis || '';
      } else {
        it.price = null;
        // 配电箱（柜）价格空缺：标"未计价"；控制电缆/电缆头不自动询价；其余该计价但查不到（软线/装饰灯未识别）标"待询价"
        var pricedCats = { power: 1, conduit: 1, wiring: 1, bridge: 1, outlet: 1, switchBtn: 1,
          lampCommon: 1, lampFluor: 1, lampFactory: 1, lampMedical: 1, lampDecor: 1, ground: 1, bus: 1, head: 1, control: 1 };
        it.priceSource = pricedCats[it.category] ? 'pending' : 'na';
        it.priceBasis = '';
      }

      it.features = generateFeature(format, it);
      results.push(it);
    }
    results._periodKey = periodKey;
    results._format = format;
    return results;
  }

  // 行内选择变更后重算该条主材价（开关/插座/灯具/电缆等与选型相关）
  function recomputePrice(it, periodKey) {
    var info = null;
    if (it.category === 'power') {
      info = pricePower(periodKey, it);
    } else if (it.category !== 'box' && it.category !== 'boxCabinet') {
      info = lookupElecPrice(periodKey, it);
    }
    if (info) {
      it.price = info.price;
      it.priceSource = info.source;
      it.priceBasis = info.basis || '';
    } else {
      it.price = null;
      var cats = { power: 1, conduit: 1, wiring: 1, bridge: 1, outlet: 1, switchBtn: 1,
        lampCommon: 1, lampFluor: 1, lampFactory: 1, lampMedical: 1, lampDecor: 1, ground: 1, bus: 1, head: 1, control: 1 };
      it.priceSource = cats[it.category] ? 'pending' : 'na';
      it.priceBasis = '';
    }
  }

  // 行内选择变更后重算该条定额
  function recomputeQuota(it) {
    if (it.isCabinet) { it.form = 'floor'; it.perimeterTier = ''; }
    var q = matchQuota(it);
    it.quotaCode = q.code;
    it.quotaName = q.name;
    it.codeInferred = !!q.inferred;
    it.warn = buildWarn(it, q);
    if (it.qtyWarn) it.warn = (it.warn ? it.warn + '；' : '') + '工程量缺失，暂按1' + it.unit + '计请核对';
  }

  // ============================================================
  // 渲染
  // ============================================================
  var PRICED_CATS = { power: 1, conduit: 1, wiring: 1, bridge: 1, outlet: 1, switchBtn: 1,
    lampCommon: 1, lampFluor: 1, lampFactory: 1, lampMedical: 1, lampDecor: 1, ground: 1, bus: 1, head: 1, control: 1 };
  function priceText(item) {
    if (!PRICED_CATS[item.category]) return '<span class="tag tag-na">未计价</span>';
    if (item.priceSource === 'none') {
      var noneTip = item.priceBasis || '该项定额子目不计算主材费（工作内容已含）';
      return '<span class="tag tag-na" title="' + String(noneTip).replace(/"/g, '&quot;') + '">无主材</span>';
    }
    if (item.price === null) return '<span class="tag tag-pending">待询价</span>';
    var basisTip = item.priceBasis ? ' title="' + String(item.priceBasis).replace(/"/g, '&quot;') + '"' : '';
    if (item.priceSource === 'estimated') return '<span class="tag tag-est" ' + basisTip + '>估</span> <span ' + basisTip + '>¥' + item.price.toFixed(2) + '</span>';
    if (item.priceSource === 'market') return '<span class="tag tag-market" ' + basisTip + '>市场价</span> <span ' + basisTip + '>¥' + item.price.toFixed(2) + '</span>';
    return '<span class="tag tag-info" ' + basisTip + '>信息价</span> <span ' + basisTip + '>¥' + item.price.toFixed(2) + '</span>';
  }
  function inferTag(it) {
    return it.codeInferred ? '<span class="tag tag-infer" title="定额编号为区间内按截面/芯数/管径/宽度就近推算，名称已按规则生成，请对照2020预算基价第二册子目表核对">推</span>' : '';
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function opt(val, cur, label) {
    return '<option value="' + val + '"' + (val === cur ? ' selected' : '') + '>' + label + '</option>';
  }
  function sel(act, idx, html, cls) {
    return '<select class="cell-select' + (cls ? ' ' + cls : '') + '" data-act="' + act + '" data-idx="' + idx + '">' + html + '</select>';
  }

  // 敷设方式/选型 列
  function layCell(it) {
    // 配电柜：锁定落地
    if (it.category === 'boxCabinet') {
      return '<div class="lay-stack"><span class="lay-static">落地式（锁定）</span></div>';
    }
    // 配电箱：形式（落地/壁挂）+ 壁挂时半周长档
    if (it.category === 'box') {
      var formSel = sel('boxForm', it._i,
        opt('floor', it.form, '落地式') + opt('wall', it.form, '壁挂式'), 'lay-box');
      var html = '<div class="lay-stack">' + formSel;
      if (it.form === 'wall') {
        var ph = '';
        BOX_PERIMETER_TIERS.forEach(function (t) { ph += opt(t.tier, String(it.perimeterTier), t.label); });
        html += sel('boxPeri', it._i, ph, 'lay-box');
      }
      return html + '</div>';
    }
    if (it.category === 'conduit') {
      return sel('lay', it._i, opt('surface', it.layMode, '明敷') + opt('concealed', it.layMode, '暗敷'));
    }
    if (it.category === 'wiring') {
      if (it.softWire) return '<span class="lay-static">多芯软导线</span>';
      return sel('wire', it._i, opt('lighting', it.wireType, '照明线路') + opt('power', it.wireType, '动力线路'));
    }
    // 插座：明装/暗装按名称自动判定（防爆不分明暗），不再人工选
    if (it.category === 'outlet') {
      if (it.outEx) return '<span class="lay-static">防爆</span>';
      return '<span class="lay-static">' + (it.layMode === 'surface' ? '明装' : '暗装') + '</span>';
    }
    // 照明开关、按钮：按名称自动判定（防爆/拉线/密闭，其余扳式暗开关），不再人工选
    if (it.category === 'switchBtn') {
      if (it.swIsBtn) {
        var btxt = it.btnKind === 'control'
          ? ('控制按钮 ' + (it.btnEx === 'ex' ? '防爆型' : '普通型'))
          : ('一般按钮 ' + (it.btnLay === 'concealed' ? '暗装' : '明装'));
        return '<span class="lay-static">' + btxt + '</span>';
      }
      var stxt;
      if (it.swType === 'pull') stxt = '拉线开关';
      else if (it.swType === 'ex') stxt = '防爆开关 ' + SW_TIER_CN[it.swGang || 1];
      else if (it.swType === 'sealed') stxt = '密闭开关 5A以内';
      else stxt = '扳式暗 ' + (it.swCtrl === 'double' ? '双控' : '单控') + ' ' + SW_TIER_CN[it.swGang || 1];
      return '<span class="lay-static">' + stxt + '</span>';
    }
    // 防雷接地：按项目名称参数自动套用（等电位/接地母线/接地装置/引下线/均压环·避雷网/接地极/断接卡）
    if (it.category === 'ground') {
      var gtxt;
      if (!it.gType) gtxt = '待识别';
      else if (it.gType === 'pot') gtxt = (it.potKind === 'main' ? '总等电位' : '局部等电位');
      else if (it.gType === 'ring') gtxt = (it.gRingKind === 'mesh' ? '避雷网 φ10圆钢' : '均压环 圈梁钢筋');
      else gtxt = GROUND_TYPE_CN[it.gType] || '待识别';
      return '<span class="lay-static">' + gtxt + '</span>';
    }
    // 母线：按名称额定电流自动取档（母线槽400/800/1250/2000/4000A；分线箱100/300/600/1000A）
    if (it.category === 'bus') {
      if (it.busAmp === null || it.busAmp === undefined) return '<span class="lay-static">电流待识别</span>';
      var btiers2 = it.bType === 'box' ? BUSBOX_TIERS : BUSWAY_TIERS;
      var bi2 = tierIndex(btiers2.map(function (t) { return t.max; }), it.busAmp);
      var bTierNum = parseInt(btiers2[bi2].label, 10);
      var bTxt = (it.busAmp === bTierNum) ? (it.busAmp + 'A') : (it.busAmp + 'A（' + btiers2[bi2].label + '）');
      return '<span class="lay-static">' + bTxt + '</span>';
    }
    // 荧光灯：一律成套型，安装方式/管数按名称自动判定（平板灯按周长，无此项）
    if (it.category === 'lampFluor' && !it.fluorPanel) {
      return '<span class="lay-static">成套型 ' + (FLUOR_MOUNT_NAME[it.fluorMount] || '吊链式') + ' ' +
        (FLUOR_TUBE_CN[it.fluorTubes || 1] || '单管') + '</span>';
    }
    // 工厂灯：默认吸顶式，名称注明弯杆/悬挂才改
    if (it.category === 'lampFactory' && /工厂罩|防水防尘|防水|防尘|防潮|工矿|厂房|高挂/.test(it.name)) {
      var fmn = { top: '吸顶式', bend: '弯杆式', hang: '悬挂式' }[it.factoryMount || 'top'] || '吸顶式';
      return '<span class="lay-static">' + fmn + '</span>';
    }
    if (it.category === 'power' || it.category === 'control' || it.category === 'head') {
      return '<span class="mat-badge mat-' + it.material + '">' + it.material + '芯</span>';
    }
    return '—';
  }

  // 规格列按类别展示关键参数
  function specCell(it) {
    if (it.category === 'conduit') return it.diameter !== null ? 'DN' + it.diameter : '—';
    if (it.category === 'bridge') return it.bridgeWidth !== null ? '宽' + it.bridgeWidth : escapeHtml(it.spec || '—');
    if (it.category === 'wiring') {
      if (it.softWire) return (it.softCores ? cnNum(it.softCores) + '芯 ' : '') + (it.section !== null ? it.section + 'mm²' : '');
      return it.section !== null ? it.section + 'mm²' : (escapeHtml(it.spec) || '—');
    }
    if (it.category === 'control') return escapeHtml(it.spec || '—') + (it.totalCores ? '（' + it.totalCores + '芯）' : '');
    if (it.category === 'head') return (it.highVoltage ? '10kV ' : '1kV ') + (it.section !== null ? it.section + 'mm²' : '');
    // 配电箱（柜）：形式 + 半周长档
    if (it.category === 'boxCabinet') return '落地式（柜）';
    if (it.category === 'box') {
      if (it.form === 'floor') return '落地式';
      var bt = BOX_PERIMETER_TIERS.filter(function (t) { return t.tier === String(it.perimeterTier); })[0];
      return '壁挂 ' + (bt ? bt.label : '');
    }
    // 灯具：普通吸顶/平板灯显示灯罩周长；荧光灯显示管数；插座显示相/电流/孔
    if (/^lamp/.test(it.category)) {
      if (it.category === 'lampFluor') {
        if (it.fluorPanel) return it.lampPerimeter ? '周长' + it.lampPerimeter + 'mm' : '平板灯';
        return FLUOR_TUBE_CN[it.fluorTubes || 1] + ' ' + (FLUOR_MOUNT_NAME[it.fluorMount] || '');
      }
      if ((it.category === 'lampCommon') && it.lampPerimeter) return '周长' + it.lampPerimeter + 'mm';
      if (it.category === 'lampDecor') {
        var sdn = it.name || '';
        if (/应急|疏散|安全出口|标志灯|诱导|出口指示/.test(sdn)) return '标志诱导灯 ' + LAMP_SIGN_NAME[parseSignMount(sdn)];
        if (/筒灯/.test(sdn)) {
          var sw2 = parseLampWatt(sdn);
          return '筒灯' + (sw2 ? ' ' + sw2 + 'W' : '');
        }
        return '装饰灯';
      }
      return '—';
    }
    if (it.category === 'outlet') {
      return (it.outEx ? '防爆 ' : '') + (it.outThree ? '三相' : '单相') + ' ' + it.outAmp + 'A' + (it.outHoles ? ' ' + it.outHoles + '孔' : '');
    }
    if (it.category === 'switchBtn') {
      if (it.swIsBtn) {
        if (it.btnKind === 'control') return '控制按钮 ' + (it.btnEx === 'ex' ? '防爆型' : '普通型');
        return '一般按钮 ' + (it.btnLay === 'concealed' ? '暗装' : '明装');
      }
      if (it.swType === 'pull') return '拉线开关';
      if (it.swType === 'surface') return '扳把开关明装';
      if (it.swType === 'sealed') return '密闭开关 5A以内';
      if (it.swType === 'ex') return '防爆开关 ' + SW_TIER_CN[it.swGang || 1];
      return '扳式暗开关 ' + (it.swCtrl === 'double' ? '双控' : '单控') + ' ' + SW_TIER_CN[it.swGang || 1];
    }
    if (it.category === 'ground') {
      var gsc = {
        pot: (it.potKind === 'main' ? '总等电位' : '局部等电位'),
        busbar: '-40×4 镀锌扁钢',
        sys: '接地网',
        down: '主筋引下',
        ring: (it.gRingKind === 'mesh' ? 'φ10圆钢' : '圈梁钢筋'),
        rod: '角钢 L50×5',
        test: '断接卡子'
      };
      return gsc[it.gType] || '—';
    }
    if (it.category === 'bus') return it.busAmp ? it.busAmp + 'A' : '—';
    return escapeHtml(it.spec || '—');
  }

  function renderTable(data) {
    var tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    data.forEach(function (item, i) {
      item._i = i;
      var tr = document.createElement('tr');
      if (item.warn) tr.className = 'row-warn';
      tr.innerHTML =
        '<td>' + item.index + '</td>' +
        '<td>' + item.listCode + '</td>' +
        '<td class="cell-name" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</td>' +
        '<td>' + layCell(item) + '</td>' +
        '<td>' + escapeHtml(item.model || '—') + '</td>' +
        '<td>' + specCell(item) + '</td>' +
        '<td class="cell-sec">' + (item.section !== null && (item.category === 'power' || item.category === 'head' || item.category === 'control') ? item.section : '—') + '</td>' +
        '<td class="cell-qcode">' + (item.quotaCode || '—') + ' ' + inferTag(item) + '</td>' +
        '<td class="cell-qname" title="' + escapeHtml(item.quotaName) + '">' + escapeHtml(item.quotaName || '—') + '</td>' +
        '<td class="cell-price">' + priceText(item) + '</td>' +
        '<td>' + item.quantity + '</td>' +
        '<td class="cell-warn">' + (item.warn ? '<span title="' + escapeHtml(item.warn) + '">⚠️ ' + escapeHtml(item.warn) + '</span>' : '') + '</td>';
      tbody.appendChild(tr);
    });

    bindRowSelects(data);

    var cat = {};
    data.forEach(function (d) { cat[d.category] = (cat[d.category] || 0) + 1; });
    var pending = data.filter(function (d) { return PRICED_CATS[d.category] && d.price === null && d.priceSource !== 'none'; }).length;
    var total = data.reduce(function (s, d) { return s + (d.price === null ? 0 : d.price * d.quantity); }, 0);

    document.getElementById('totalCount').textContent = data.length;
    document.getElementById('catPower').textContent = cat.power || 0;
    var boxN = (cat.box || 0) + (cat.boxCabinet || 0);
    document.getElementById('catBox').textContent = boxN;
    document.getElementById('catOther').textContent = data.length - (cat.power || 0) - boxN;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('totalPrice').textContent = '¥' + total.toFixed(2);
  }

  function bindRowSelects(data) {
    document.querySelectorAll('#tableBody select.cell-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var idx = parseInt(sel.getAttribute('data-idx'), 10);
        var act = sel.getAttribute('data-act');
        var it = data[idx];
        if (!it) return;
        var needReprice = false;
        if (act === 'lay') { it.layMode = sel.value; needReprice = true; }
        if (act === 'wire') it.wireType = sel.value;
        // 荧光灯：成套/组装、安装方式、管数
        if (act === 'flKind') it.fluorKind = sel.value;
        if (act === 'flMount') it.fluorMount = sel.value;
        if (act === 'flTube') {
          it.fluorTubes = parseInt(sel.value, 10);
          // 组装型仅支持吊链/吸顶且最多3管，切换时做约束
          if (it.fluorKind === 'assembled' && (it.fluorMount === 'pipe' || it.fluorMount === 'embed')) it.fluorKind = 'complete';
          if (it.fluorKind === 'assembled' && it.fluorTubes > 3) it.fluorTubes = 3;
        }
        // 工厂灯：吸顶/弯杆/悬挂
        if (act === 'facMount') it.factoryMount = sel.value;
        // 配电箱：形式 / 半周长
        if (act === 'boxForm') {
          it.form = sel.value;
          if (it.form === 'floor') it.perimeterTier = '';
          else if (!it.perimeterTier) it.perimeterTier = BOX_DEFAULT_TIER;
        }
        if (act === 'boxPeri') it.perimeterTier = sel.value;
        // 开关、按钮
        if (act === 'swType') it.swType = sel.value;
        if (act === 'swCtrl') it.swCtrl = sel.value;
        if (act === 'swGang') it.swGang = parseInt(sel.value, 10);
        if (act === 'btnKind') it.btnKind = sel.value;
        if (act === 'btnEx') it.btnEx = sel.value;
        if (act === 'btnLay') { it.btnLay = sel.value; }
        // 防雷接地：子类型 / 等电位等级 / 均压环·避雷网
        if (act === 'gType') {
          it.gType = sel.value;
          it.listCode = GROUND_LIST[it.gType] || '';
          it.unit = GROUND_UNIT[it.gType] || 'm';
          if (it.gType === 'ring' && !it.gRingKind) it.gRingKind = 'mesh';
          needReprice = true;
        }
        if (act === 'potKind') { it.potKind = sel.value; needReprice = true; }
        if (act === 'gRing') { it.gRingKind = sel.value; needReprice = true; }
        // 母线：额定电流档（仅当用户实际改档时才同步主材电流，避免重复点选误改价格）
        if (act === 'busTier') {
          var newTierB = sel.value === '' ? null : parseInt(sel.value, 10);
          var tiersH = (it.bType === 'box') ? BUSBOX_TIERS : BUSWAY_TIERS;
          var oldTierB = it.busTier;
          if (!oldTierB && it.busAmp !== null) oldTierB = tiersH[tierIndex(tiersH.map(function (t) { return t.max; }), it.busAmp)].max;
          if (newTierB !== oldTierB) {
            it.busTier = newTierB;
            if (newTierB !== null) it.busAmp = newTierB;
            needReprice = true;
          }
        }
        if (act === 'swType' || act === 'swCtrl' || act === 'swGang' ||
            act === 'btnKind' || act === 'btnEx' || act === 'btnLay' ||
            act === 'flKind' || act === 'flMount' || act === 'flTube' || act === 'facMount') needReprice = true;
        recomputeQuota(it);
        if (needReprice) {
          recomputePrice(it, data._periodKey);
          it.features = generateFeature(data._format, it);
        }
        renderTable(data); // 重渲染保留选中值（已写回 it）
      });
    });
  }

  // ============================================================
  // 导出
  // ============================================================
  function num2(v) { return v === null || v === undefined ? '' : Number(v.toFixed(2)); }

  function exportJianjing(data) {
    // A序号 B清单编码 C项目名称 D定额编码 E定额名称 F主材价格 G数量 H项目特征
    var wsData = [['序号', '清单编码', '项目名称', '定额编码', '定额名称', '主材价格', '数量', '项目特征']];
    data.forEach(function (it) {
      wsData.push([it.index, it.listCode, it.name, it.quotaCode, it.quotaName,
        it.price === null ? '' : num2(it.price), it.quantity, it.features]);
    });
    var total = data.reduce(function (s, d) { return s + (d.price === null ? 0 : d.price * d.quantity); }, 0);
    wsData.push([]);
    wsData.push(['合计', '', '', '', '', num2(total), '', '']);

    var ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 8 }, { wch: 14 }, { wch: 42 }, { wch: 10 }, { wch: 36 }, { wch: 12 }, { wch: 8 }, { wch: 60 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '清单定额报价表');
    XLSX.writeFile(wb, '清单定额报价表_建经_' + today() + '.xlsx');
  }

  function exportGLD(data) {
    // 15列：A序号 B项目名称 C类型 D材质 E型号 F规格 G截面 H工程量
    //       I项目编码 J类型 K名称 L项目特征 M单位 N工程量 O主材单价
    var wsData = [['序号', '项目名称', '类型', '材质', '型号', '规格', '截面mm2', '工程量',
      '项目编码', '类型', '名称', '项目特征', '单位', '工程量', '主材单价']];

    var zIdx = 0;
    data.forEach(function (it) {
      // 有主材信息价的类别（电力电缆/配管/配线/桥架）带主材单价；配电箱（柜）设备费未计价但同样生成Z00741子目下设备行（单价0）
      var isBox = (it.category === 'box' || it.category === 'boxCabinet');
      // 有主材价的类别（电缆/配管/配线/桥架/开关/插座/灯具）带主材单价；配电箱（柜）设备费空缺但仍生成Z00741子目下设备行（单价0）
      var hasPrice = it.price !== null && PRICED_CATS[it.category];
      var hasMaterialRow = hasPrice || isBox;
      var secVal = (it.section !== null && (it.category === 'power' || it.category === 'head' || it.category === 'control')) ? it.section : '';
      var specVal = specCell(it);

      if (!it.quotaCode) {
        // 关键参数缺失、未套定额：单行待人工处理
        wsData.push([
          it.index, it.name, it.categoryLabel, (it.category==='power'||it.category==='control'||it.category==='head')?(it.material === '铝' ? '铝' : '铜'):'', it.model, specVal,
          secVal, it.quantity, '', '待人工处理', it.name, '', it.unit, it.quantity,
          hasPrice ? num2(it.price) : ''
        ]);
        return;
      }

      // 第1行：清单行（仅电力电缆带主材单价 O 列）
      wsData.push([
        it.index, it.name, it.categoryLabel, (it.category==='power'||it.category==='control'||it.category==='head')?(it.material === '铝' ? '铝' : '铜'):'', it.model, specVal,
        secVal, it.quantity,
        it.listCode, '清单行', it.name, it.features, it.unit, it.quantity,
        hasPrice ? num2(it.price) : (isBox ? 0 : '')
      ]);
      // 第2行：定额行
      wsData.push([
        it.index + '.1', '', '', '', '', '', '', '',
        it.quotaCode, '定额行', it.quotaName, '', it.unit, it.quantity, ''
      ]);
      // 第3行：子目下设备（主材/设备）——有信息价主材类或配电箱（柜）生成；配电箱设备未计价单价0
      if (hasMaterialRow) {
        zIdx++;
        wsData.push([
          it.index + '.2', '', '', '', '', '', '', '',
          'Z00741-' + String(zIdx).padStart(3, '0'), '子目下设备', it.name, '', it.unit, it.quantity,
          hasPrice ? num2(it.price) : 0
        ]);
      }
    });

    var total = data.reduce(function (s, d) { return s + (d.price === null ? 0 : d.price * d.quantity); }, 0);
    wsData.push([]);
    wsData.push(['合计', '', '', '', '', '', '', '', '', '', '', '', '', '', num2(total)]);

    var ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 8 }, { wch: 40 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 16 }, { wch: 9 }, { wch: 9 },
      { wch: 13 }, { wch: 10 }, { wch: 40 }, { wch: 52 }, { wch: 6 }, { wch: 9 }, { wch: 12 }
    ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '清单定额报价表');
    XLSX.writeFile(wb, '清单定额报价表_广联达_' + today() + '.xlsx');
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  }

  // ============================================================
  // 初始化 & 事件
  // ============================================================
  var exportData = [];

  function currentFormat() {
    return (document.querySelector('input[name="software"]:checked') || {}).value || 'guanglianda';
  }
  function currentPeriod() {
    return document.getElementById('periodSelect').value;
  }

  function refreshAll() {
    if (!window._rawAOA) return;
    exportData = parseRows(window._rawAOA, currentPeriod(), currentFormat());
    renderTable(exportData);
    var area = document.getElementById('resultArea');
    var btn = document.getElementById('btnGroup');
    if (exportData.length) {
      area.style.display = 'block';
      btn.style.display = 'flex';
      document.getElementById('statusBar').className = 'status-bar status-ok';
      var dropList = exportData._dropped || [];
      var dropTip = dropList.length ? ('；⚠ 另有 ' + dropList.length + ' 行未识别（' + dropList.slice(0, 3).join('、') + (dropList.length > 3 ? ' 等' : '') + '），未纳入结果，请核对B列项目名称') : '';
      document.getElementById('statusBar').textContent = '成功解析 ' + exportData.length + ' 条（配电箱柜/电缆/控制缆/电缆头/配管/配线/桥架/灯具/开关按钮/插座/防雷接地/母线）；请在"敷设方式/选型"列为配电箱、配管、配线、开关按钮、插座、荧光灯、工厂灯选择对应选项；黄色行为需人工核对项' + dropTip;
    } else {
      area.style.display = 'none';
      btn.style.display = 'none';
      document.getElementById('statusBar').className = 'status-bar status-err';
      var dl2 = exportData._dropped || [];
      document.getElementById('statusBar').textContent = '未在B列识别到电缆/电缆头/配管/配线/桥架类项目名称，请检查表头是否为：A序号 / B项目名称 / C工程量' +
        (dl2.length ? ('；未识别：' + dl2.slice(0, 3).join('、')) : '');
    }
  }

  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', function () {
    var sel = document.getElementById('periodSelect');
    getPeriods().forEach(function (p) {
      var opt = document.createElement('option');
      opt.value = p.period;
      opt.textContent = p.releaseLabel;
      sel.appendChild(opt);
    });

    var fileInput = document.getElementById('excelFile');
    var uploadArea = document.getElementById('uploadArea');

    fileInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (file) readFile(file);
    });
    uploadArea.addEventListener('dragover', function (e) { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', function () { uploadArea.classList.remove('dragover'); });
    uploadArea.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]);
    });
    uploadArea.addEventListener('click', function () { fileInput.click(); });

    document.querySelectorAll('input[name="software"]').forEach(function (radio) {
      radio.addEventListener('change', refreshAll);
    });
    sel.addEventListener('change', refreshAll);

    document.getElementById('exportBtn').addEventListener('click', function () {
      if (!exportData.length) { alert('没有数据可导出'); return; }
      if (currentFormat() === 'jianjing') exportJianjing(exportData);
      else exportGLD(exportData);
    });
    document.getElementById('resetBtn').addEventListener('click', function () { location.reload(); });
  });

  function readFile(file) {
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      document.getElementById('statusBar').className = 'status-bar status-err';
      document.getElementById('statusBar').textContent = '请上传 .xlsx / .xls 文件';
      document.getElementById('statusBar').style.display = 'block';
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
        var ws = wb.Sheets[wb.SheetNames[0]];
        window._rawAOA = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        document.getElementById('statusBar').style.display = 'block';
        refreshAll();
      } catch (err) {
        document.getElementById('statusBar').className = 'status-bar status-err';
        document.getElementById('statusBar').style.display = 'block';
        document.getElementById('statusBar').textContent = '文件解析失败：' + err.message;
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // 本地调试/自动化句柄（纯前端、本地计算，无安全影响）
  if (typeof window !== 'undefined') {
    window.__cable = {
      parseRows: parseRows, matchQuota: matchQuota, buildItem: buildItem,
      recomputeQuota: recomputeQuota, getPeriods: getPeriods,
      exportGLD: exportGLD, exportJianjing: exportJianjing,
      getData: function () { return exportData; },
      setAOA: function (aoa) {
        window._rawAOA = aoa;
        exportData = parseRows(aoa, currentPeriod(), currentFormat());
        renderTable(exportData);
        return exportData;
      },
      setLay: function (i, v) { exportData[i].layMode = v; recomputeQuota(exportData[i]); renderTable(exportData); },
      setWire: function (i, v) { exportData[i].wireType = v; recomputeQuota(exportData[i]); renderTable(exportData); },
      setBoxForm: function (i, v) { var it = exportData[i]; if (it.isCabinet) { it.form = 'floor'; it.perimeterTier = ''; recomputeQuota(it); renderTable(exportData); return; } it.form = v; it.perimeterTier = v === 'floor' ? '' : (it.perimeterTier || BOX_DEFAULT_TIER); recomputeQuota(it); renderTable(exportData); },
      setBoxPeri: function (i, v) { exportData[i].perimeterTier = v; recomputeQuota(exportData[i]); renderTable(exportData); }
    };
  }

  // 暴露给Node测试
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      detectMaterial: detectMaterial, extractModel: extractModel, extractVoltage: extractVoltage,
      parseSpec: parseSpec, matchQuota: matchQuota, lookupPrice: lookupPrice, parseRows: parseRows,
      getPeriods: getPeriods, LIST_CODE: LIST_CODE, LIST: LIST, classify: classify,
      buildItem: buildItem, parseDiameter: parseDiameter, parseBridgeWidth: parseBridgeWidth,
      isSoftWire: isSoftWire, recomputeQuota: recomputeQuota,
      lookupElecPrice: lookupElecPrice, parseBridgeWH: parseBridgeWH
    };
  }
})();
