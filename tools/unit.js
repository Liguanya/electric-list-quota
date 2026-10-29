/* 六大类识别与定额映射 Node 单测 */
const path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'data', 'prices.js'));
const A = require(path.join(__dirname, '..', 'js', 'app.js'));

let pass = 0, fail = 0;
function ck(desc, got, want) {
  const ok = got === want;
  if (ok) { pass++; } else { fail++; console.log('  ✗ ' + desc + '  got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)); }
}

function one(name, opts) {
  const it = A.buildItem(name);
  if (opts) {
    if (opts.lay) it.layMode = opts.lay;
    if (opts.wire) it.wireType = opts.wire;
  }
  const q = A.matchQuota(it);
  return { cat: it.category, code: q.code, qname: q.name, inf: q.inferred, list: it.listCode, it };
}

console.log('== 分类识别 ==');
ck('YJV电力电缆', A.classify('铜芯电力电缆 YJV-0.6/1kV-4×35+1×16'), 'power');
ck('YJLV铝电缆', A.classify('铝芯电力电缆 YJLV-4×95'), 'power');
ck('KVV控制电缆', A.classify('KVV-7×1.5 控制电缆'), 'control');
ck('ZR-KVV', A.classify('ZR-KVV-5×10'), 'control');
ck('电缆头', A.classify('1kV户内热缩式电力电缆终端头 YJV-4×70'), 'head');
ck('JDG配管', A.classify('JDG20 电线管 砖混凝土结构明配'), 'conduit');
ck('SC25钢管', A.classify('SC25 镀锌钢管'), 'conduit');
ck('RC50钢管', A.classify('RC50 配管'), 'conduit');
ck('BV配线', A.classify('管内穿线 BV-2.5 铜芯'), 'wiring');
ck('BYJ配线', A.classify('WDZN-BYJ-4 配线'), 'wiring');
ck('RYS软线', A.classify('RYS-2×1.5 多芯软导线'), 'wiring');
ck('KYJY软线', A.classify('KYJY-4×1.0 配线'), 'wiring');
ck('桥架200×100', A.classify('钢制槽式桥架 200×100'), 'bridge');
ck('线槽', A.classify('金属线槽 100×50'), 'bridge');

console.log('== 清单编码 ==');
ck('电力清单', one('YJV-4×35').list, '030409001');
ck('控制清单', one('KVV-7×1.5').list, '030409002');
ck('电缆头清单', one('电缆头 YJV-4×70').list, '030409003');
ck('配管清单', one('JDG20').list, '030412001');
ck('桥架清单', one('桥架 200×100').list, '030412003');
ck('配线清单', one('BV-2.5').list, '030412004');

console.log('== 电力电缆定额 ==');
ck('铜4×35→2-577', one('YJV-4×35+1×16').code, '2-577');
ck('铝4×95→2-568', one('YJLV-4×95').code, '2-568');
ck('铜5×16→2-577', one('WDZ-YJY-5×16').code, '2-577');
ck('铜4×500→2-580顶档', one('YJV-4×500').code, '2-580');

console.log('== 控制电缆定额（按芯数）==');
ck('KVV5芯→2-586(6内)', one('ZR-KVV-5×10').code, '2-586');
ck('KVV7芯→2-587(14内)', one('KVV-7×1.5').code, '2-587');
ck('KVV24芯→2-588', one('KVV-24×1.0').code, '2-588');
ck('KVV37芯→2-589', one('KVV-37×1.0').code, '2-589');
ck('KVV48芯→2-590', one('KVV-48×0.75').code, '2-590');
ck('KVV61芯→2-590超档', one('KVV-61×0.5').code, '2-590');

console.log('== 电缆头（低压/高压）==');
let h1 = one('1kV户内热缩式电力电缆终端头 YJV-4×70');
ck('低压70→2-757', h1.code, '2-757');
ck('低压编号已确认非推断', h1.inf, false);
ck('低压10→2-755', one('1kV冷缩终端头 YJV-4×10').code, '2-755');
ck('低压400→2-762', one('1kV热缩终端头 YJV-4×400').code, '2-762');
let h2 = one('10kV高压电缆头 YJV22-3×70');
ck('高压70→2-764', h2.code, '2-764');
ck('高压35→2-763', one('10kV高压电缆终端头 YJV-3×35').code, '2-763');
ck('高压400→2-768', one('10kV高压电缆终端头 3×400').code, '2-768');
ck('高压清单仍030409003', h2.list, '030409003');

console.log('== 配管：明敷/暗敷 × 电线管/镀锌钢管 ==');
ck('JDG20明→2-1118', one('JDG20电线管', {lay:'surface'}).code, '2-1118');
ck('JDG15明→2-1117', one('JDG15', {lay:'surface'}).code, '2-1117');
ck('JDG50明→2-1122', one('JDG50电线管', {lay:'surface'}).code, '2-1122');
ck('JDG20暗→2-1124', one('JDG20', {lay:'concealed'}).code, '2-1124');
ck('JDG15暗→2-1123', one('JDG15', {lay:'concealed'}).code, '2-1123');
ck('JDG50暗→2-1128', one('JDG50', {lay:'concealed'}).code, '2-1128');
ck('SC15明→2-1139', one('SC15镀锌钢管', {lay:'surface'}).code, '2-1139');
ck('SC25明→2-1141', one('SC25镀锌钢管', {lay:'surface'}).code, '2-1141');
ck('SC150明→2-1149', one('SC150镀锌钢管', {lay:'surface'}).code, '2-1149');
ck('RC100暗→2-1158', one('RC100镀锌钢管', {lay:'concealed'}).code, '2-1158');
ck('SC150暗→2-1160', one('SC150', {lay:'concealed'}).code, '2-1160');
ck('明配名称含明配', /明配/.test(one('JDG20', {lay:'surface'}).qname), true);
ck('暗配名称含暗配', /暗配/.test(one('SC25', {lay:'concealed'}).qname), true);

console.log('== 配线：照明/动力/多芯软线 ==');
ck('BV1.5照明→2-1318', one('BV-1.5配线', {wire:'lighting'}).code, '2-1318');
ck('BYJ2.5照明→2-1319', one('WDZ-BYJ-2.5', {wire:'lighting'}).code, '2-1319');
ck('BV4照明→2-1320', one('BV-4', {wire:'lighting'}).code, '2-1320');
ck('BV2.5动力→2-13xx', (()=>{const c=one('BV-2.5',{wire:'power'}).code;return /^2-13\d\d$/.test(c);})(), true);
ck('BV240动力→2-1355', one('BV-240', {wire:'power'}).code, '2-1355');
ck('RVS2芯→2-1359', one('RYS-2×1.5').code, '2-1359');
ck('KYJY4芯→2-1360', one('KYJY-4×1.0').code, '2-1360');
ck('KYJY16芯→2-1366', one('KYJY-16×1.5').code, '2-1366');

console.log('== 桥架 ==');
ck('桥架150→2-637', one('槽式桥架 150×100').code, '2-637');
ck('桥架200→2-638', one('槽式桥架 200×100').code, '2-638');
ck('桥架800→2-642', one('槽式桥架 800×200').code, '2-642');
ck('桥架1500→2-643', one('槽式桥架 1500×300').code, '2-643');
ck('桥架2000→2-643超档', one('槽式桥架 2000×400').code, '2-643');

console.log('== 行内切换重算 ==');
{
  const it = A.buildItem('JDG20 电线管');
  it.layMode='surface'; let q=A.matchQuota(it); ck('切换前明2-1118', q.code,'2-1118');
  it.layMode='concealed'; q=A.matchQuota(it); ck('切换后暗2-1124', q.code,'2-1124');
}

console.log('== 电缆头：截面xxmm 等非标名称（用户反馈bug回归）==');
(function(){
  const cases=[
    ['电缆头 截面150mm','2-759'],['电缆头 截面50mm','2-757'],['电缆头 截面240mm²','2-760'],
    ['冷缩电缆头 3*120','2-758'],['1kV户内热缩终端头 YJV-4×70','2-757'],
    ['10kV高压电缆终端头 3×70','2-764'],['电缆头 截面400mm','2-762']
  ];
  cases.forEach(([n,code])=>ck(n+'→'+code, one(n).code, code));
  ck('头截面150解析为150', one('电缆头 截面150mm').it.section, 150);
})();

console.log('== 电气材料信息价（天津2026年第9期，除税）==');
(function(){
  const P='2026-09';
  function price(name){
    const it=A.buildItem(name);
    const pi=A.lookupElecPrice(P,it);
    return pi?{v:pi.price,s:pi.source}:null;
  }
  function approx(desc, got, want){ ck(desc+'≈'+want, Math.abs(got-want)<0.011, true); }
  // SC 镀锌钢管（吨价×理论重量换算米价）
  approx('SC150=71.23', price('SC150镀锌钢管').v, 71.23);
  approx('SC50=20.31', price('SC50镀锌钢管').v, 20.31);
  approx('SC25=9.57', price('SC25镀锌钢管').v, 9.57);
  ck('SC为信息价official', price('SC150镀锌钢管').s, 'official');
  // JDG/KBG
  approx('JDG25=10.93(同KBG)', price('JDG25').v, 10.93);
  approx('KBG25=10.93', price('KBG25').v, 10.93);
  approx('JDG20=6.35', price('JDG20').v, 6.35);
  // BV/BVR 单芯电线
  approx('BV2.5=2.46', price('BV-2.5').v, 2.46);
  approx('BV4=3.81', price('BV-4').v, 3.81);
  approx('BVR2.5=2.83', price('BVR-2.5').v, 2.83);
  ck('BV取BV价不取BVR', Math.abs(price('BV-2.5').v-2.46)<0.011 && Math.abs(price('BV-2.5').v-2.83)>0.1, true);
  ck('BV为信息价', price('BV-2.5').s, 'official');
  // BYJ 无独立信息价 → 参照BV(estimated)
  ck('BYJ2.5参照BV为估算', price('BYJ-2.5').s, 'estimated');
  approx('BYJ2.5≈BV2.5', price('BYJ-2.5').v, 2.46);
  // RVS 双绞软线信息价
  approx('RVS2×1.5=3.70', price('RVS-2×1.5').v, 3.70);
  ck('RVS为信息价', price('RVS-2×1.5').s, 'official');
  // RYS 多芯软线无信息价 → null（待询价）
  ck('RYS无信息价返回null', price('RYS-2×1.5'), null);
  // 桥架 宽×高精确
  approx('桥架400×200=233.87', price('电缆桥架 400×200').v, 233.87);
  approx('桥架200×100=80.12', price('桥架200×100').v, 80.12);
  ck('桥架400×200信息价', price('电缆桥架 400×200').s, 'official');
  // 桥架无对应宽度 → 就近估算
  ck('桥架250×100就近估算', price('桥架250×100').s, 'estimated');
  // 控制电缆/电缆头不查电气价
  ck('控制电缆不查电气价', A.lookupElecPrice(P, A.buildItem('KVV-7×1.5')), null);
  ck('电缆头不查电气价', A.lookupElecPrice(P, A.buildItem('电缆头 截面150mm')), null);
})();

// ============================================================
// 灯具：五类清单 + 定额（子目对照2020基价第二册官方电子书核准）
// ============================================================
(function lamp() {
  console.log('== 灯具清单分类与定额 ==');
  function lampQ(n, lay) { const it = A.buildItem(n); if (lay) it.layMode = lay; return { cat: it.category, lc: it.listCode, qc: A.matchQuota(it).code }; }
  // 普通灯
  ck('圆球吸顶灯类别', lampQ('圆球吸顶灯').cat, 'lampCommon');
  ck('圆球吸顶灯清单', lampQ('圆球吸顶灯').lc, '030413001');
  ck('圆球吸顶灯2-1539', lampQ('圆球吸顶灯').qc, '2-1539');
  ck('简易LED吸顶灯2-1539', lampQ('简易LED吸顶灯').qc, '2-1539');
  ck('软线吊灯2-1542', lampQ('软线吊灯').qc, '2-1542');
  ck('吊链灯2-1543', lampQ('吊链灯').qc, '2-1543');
  ck('普通壁灯2-1546', lampQ('普通壁灯').qc, '2-1546');
  ck('弯脖灯2-1545', lampQ('弯脖灯').qc, '2-1545');
  ck('普通座灯头2-1548', lampQ('普通座灯头').qc, '2-1548');
  ck('声光控灯头2-1547', lampQ('声光控灯头').qc, '2-1547');
  // 装饰灯：只套清单，定额留空
  ck('筒灯清单030413002', lampQ('筒灯 LED 3寸').lc, '030413002');
  ck('疏散指示灯装饰灯', lampQ('疏散指示灯(标志诱导灯)').cat, 'lampDecor');
  ck('装饰灯定额留空', lampQ('艺术花灯 水晶').qc, '');
  ck('嵌入式无主灯装饰', lampQ('嵌入式无主灯').cat, 'lampDecor');
  // 荧光灯
  ck('T8单管吊链2-1768', lampQ('T8支架灯 单管 吊链').qc, '2-1768');
  ck('双管吊管2-1772', lampQ('格栅荧光灯 双管 吊管').qc, '2-1772');
  ck('三管嵌入2-1779', lampQ('LED平板灯(长条格栅) 三管 嵌入').qc, '2-1779');
  ck('双管吸顶2-1775', lampQ('双管荧光支架 吸顶').qc, '2-1775');
  ck('四管仅成套嵌入2-1780', lampQ('四管荧光灯 嵌入').qc, '2-1780');
  // LED平板灯（荧光清单+吸顶灯具周长定额）
  ck('平板灯100×100周长400→2-1539', lampQ('LED平板灯 100*100').qc, '2-1539');
  ck('平板灯300×300周长1200→2-1541', lampQ('LED平板灯 300*300').qc, '2-1541');
  ck('平板灯600×600周长2400→2-1541', lampQ('LED平板灯 600×600').qc, '2-1541');
  // 工厂灯
  ck('防水防尘直杆2-1554', lampQ('防水防尘灯 直杆式').qc, '2-1554');
  ck('防水防尘弯杆2-1555', lampQ('防水防尘灯 弯管').qc, '2-1555');
  ck('防水防尘吸顶2-1556', lampQ('防水防尘灯 吸顶式').qc, '2-1556');
  ck('工厂罩灯吸顶2-1549', lampQ('工厂罩灯 吸顶').qc, '2-1549');
  ck('工矿灯悬挂2-1551', lampQ('厂房高挂工矿灯 悬挂').qc, '2-1551');
  ck('投光灯2-1560', lampQ('投光灯').qc, '2-1560');
  ck('防爆灯2-1572', lampQ('防爆灯').qc, '2-1572');
  // 医疗
  ck('无影灯2-1786', lampQ('无影灯 吊装').qc, '2-1786');
  ck('病房指示灯2-1783', lampQ('病房指示灯').qc, '2-1783');
  ck('紫外线2-1785', lampQ('紫外线消毒灯').qc, '2-1785');
  ck('观片灯2-1784', lampQ('观片灯').qc, '2-1784');
  ck('医疗清单030413007', lampQ('无影灯').lc, '030413007');
})();

// ============================================================
// 插座：单相/三相/防爆 × 孔数 × 电流 × 明装/暗装
// ============================================================
(function outlet() {
  console.log('== 插座清单定额 ==');
  function oc(n, lay) { const it = A.buildItem(n); it.layMode = lay; return { lc: it.listCode, qc: A.matchQuota(it).code }; }
  ck('插座清单030413014', oc('单相明插座15A 2孔', 'surface').lc, '030413014');
  ck('单相明15A 2孔2-1817', oc('单相明插座15A 2孔', 'surface').qc, '2-1817');
  ck('单相明15A 5孔2-1820', oc('单相明插座15A 5孔', 'surface').qc, '2-1820');
  ck('单相明15A 11孔2-1826', oc('单相明插座15A 11孔', 'surface').qc, '2-1826');
  ck('单相明30A 3孔2-1827', oc('单相明插座30A 3孔', 'surface').qc, '2-1827');
  ck('单相明30A 4孔2-1828', oc('单相明插座30A 4孔', 'surface').qc, '2-1828');
  ck('三相明15A 4孔2-1829', oc('三相明插座15A 4孔', 'surface').qc, '2-1829');
  ck('三相明30A 4孔2-1830', oc('三相明插座30A 4孔', 'surface').qc, '2-1830');
  ck('单相暗15A 2孔2-1831', oc('单相暗插座15A 2孔', 'concealed').qc, '2-1831');
  ck('单相暗15A 8孔2-1837', oc('单相暗插座15A 8孔', 'concealed').qc, '2-1837');
  ck('单相暗15A 12孔2-1841', oc('单相暗插座15A 12孔', 'concealed').qc, '2-1841');
  ck('单相暗30A 2孔2-1842', oc('单相暗插座30A 2孔', 'concealed').qc, '2-1842');
  ck('单相暗30A 3孔2-1843', oc('单相暗插座30A 3孔', 'concealed').qc, '2-1843');
  ck('三相暗15A 4孔2-1845', oc('三相暗插座15A 4孔', 'concealed').qc, '2-1845');
  ck('三相暗30A 4孔2-1846', oc('三相暗插座30A 4孔', 'concealed').qc, '2-1846');
  // 防爆（不分明暗）
  ck('防爆单相15A2-1847', oc('防爆插座 单相15A', 'surface').qc, '2-1847');
  ck('防爆单相30A2-1848', oc('防爆插座 单相30A以内', 'surface').qc, '2-1848');
  ck('防爆单相60A2-1849', oc('防爆插座 单相60A', 'surface').qc, '2-1849');
  ck('防爆单相三孔15A2-1850', oc('防爆插座 单相三孔 15A', 'surface').qc, '2-1850');
  ck('防爆单相三孔60A2-1852', oc('防爆插座 单相三孔60A', 'surface').qc, '2-1852');
  ck('防爆三相四孔15A2-1853', oc('防爆插座 三相四孔15A', 'surface').qc, '2-1853');
  ck('防爆三相四孔30A2-1854', oc('防爆插座 三相四孔30A', 'surface').qc, '2-1854');
  ck('防爆三相四孔60A2-1855', oc('防爆插座 三相四孔60A以内', 'surface').qc, '2-1855');
  // 名称"暗"自动识别
  ck('名称含暗默认暗装', A.buildItem('三相暗插座30A 4孔').layMode, 'concealed');
})();

// ============================================================
// 配电箱（柜）：识别 + 清单 + 形式/半周长定额（原配电箱网站逻辑并入）
// ============================================================
(function box() {
  console.log('== 配电箱（柜）==');
  function bq(n, form, peri) { const it = A.buildItem(n); if (form) it.form = form; if (peri) it.perimeterTier = peri; return { cat: it.category, lc: it.listCode, qc: A.matchQuota(it).code, it: it }; }
  // 识别与清单
  ck('配电箱类别box', bq('配电箱AL1').cat, 'box');
  ck('配电箱清单030402011', bq('配电箱AL1').lc, '030402011');
  ck('照明箱归box', bq('照明配电箱AL1').cat, 'box');
  ck('动力箱归box', bq('动力配电箱AP1').cat, 'box');
  ck('插座箱归box(非outlet)', bq('插座箱AX1').cat, 'box');
  ck('低压柜类别boxCabinet', bq('低压开关柜AA1').cat, 'boxCabinet');
  ck('配电柜清单030402010', bq('低压配电柜AN1').lc, '030402010');
  // 柜类定额
  ck('低压开关柜2-282', bq('低压开关柜AA1').qc, '2-282');
  ck('低压配电柜2-282', bq('低压配电柜AN1').qc, '2-282');
  ck('低压柜2-282', bq('低压柜').qc, '2-282');
  ck('高压开关柜2-85', bq('高压开关柜AH1').qc, '2-85');
  ck('高压柜2-85', bq('高压柜').qc, '2-85');
  ck('裸开关柜2-85', bq('开关柜').qc, '2-85');
  // 普通配电箱：默认壁挂1.0m→2-306
  ck('普通箱默认壁挂', bq('配电箱X').it.form, 'wall');
  ck('默认1.0m→2-306', bq('配电箱X').qc, '2-306');
  // 落地→2-304
  ck('普通箱落地2-304', bq('配电箱X', 'floor').qc, '2-304');
  // 壁挂半周长逐档
  ck('壁挂0.5→2-305', bq('配电箱X', 'wall', '0.5').qc, '2-305');
  ck('壁挂1.0→2-306', bq('配电箱X', 'wall', '1.0').qc, '2-306');
  ck('壁挂1.5→2-307', bq('配电箱X', 'wall', '1.5').qc, '2-307');
  ck('壁挂2.0→2-308', bq('配电箱X', 'wall', '2.0').qc, '2-308');
  ck('壁挂2.5→2-309', bq('配电箱X', 'wall', '2.5').qc, '2-309');
  // 柜类锁定落地（经 recomputeQuota：即便改form/peri仍锁定落地+精准定额）
  var cabit = A.buildItem('低压开关柜X'); cabit.form = 'wall'; cabit.perimeterTier = '0.5';
  var cm = A.matchQuota(cabit); // 直接 matchQuota 对柜类按 cabinetCode（不读form）
  ck('柜类直配仍2-282', cm.code, '2-282');
  // 通过 parseRows 走完整 recomputeQuota，验证 form 被强制回 floor
  var crow = A.parseRows([[1, '低压开关柜X', 1]], A.getPeriods()[0].period, 'jj')[0];
  crow.form = 'wall'; crow.perimeterTier = '0.5';
  A.recomputeQuota(crow);
  ck('柜类recompute强制floor', crow.form, 'floor');
  ck('柜类半周长清空', crow.perimeterTier, '');
  ck('柜类锁定2-282', crow.quotaCode, '2-282');
  var chrow = A.parseRows([[1, '高压柜', 1]], A.getPeriods()[0].period, 'jj')[0];
  ck('高压柜锁定2-85', chrow.quotaCode, '2-85');
  // 单位（parseRows 设置：配电箱=台）
  ck('配电箱单位台', A.parseRows([[1, '配电箱X', 1]], A.getPeriods()[0].period, 'jj')[0].unit, '台');
  ck('灯具单位套', A.parseRows([[1, '圆球吸顶灯', 1]], A.getPeriods()[0].period, 'jj')[0].unit, '套');
  ck('插座单位个', A.parseRows([[1, '单相暗插座15A 5孔', 1]], A.getPeriods()[0].period, 'jj')[0].unit, '个');
  ck('开关单位个', A.parseRows([[1, '开关，单控，双联', 1]], A.getPeriods()[0].period, 'jj')[0].unit, '个');
  ck('按钮单位个', A.parseRows([[1, '防爆按钮', 1]], A.getPeriods()[0].period, 'jj')[0].unit, '个');
  ck('电缆单位m', A.parseRows([[1, 'YJV-4×35 电力电缆', 1]], A.getPeriods()[0].period, 'jj')[0].unit, 'm');
  // parseRows：3列解析 + 序号透传 + 跳过表头
  var aoa = [['序号', '项目名称', '数量'], [5, '照明配电箱AL1', 2], ['', '动力配电箱AP1', 3], [7, '低压开关柜AA1', 1], [8, '高压开关柜AH1', 2]];
  var rows = A.parseRows(aoa, A.getPeriods()[0].period, 'jianjing');
  ck('解析4条(跳过表头)', rows.length, 4);
  ck('A列序号5透传', rows[0].index, '5');
  ck('数量2', rows[0].quantity, 2);
  ck('低压柜解析2-282', rows[2].quotaCode, '2-282');
  ck('高压柜解析2-85', rows[3].quotaCode, '2-85');
  // 不抢占原有类别
  ck('插座仍归outlet', A.classify('单相暗插座15A 5孔'), 'outlet');
  ck('电缆仍归power', A.classify('铜芯电力电缆 YJV-4×35'), 'power');
})();

// ============================================================
// 照明开关、按钮（清单 030413013）+ 主材价
// ============================================================
(function switchBtn() {
  console.log('== 照明开关、按钮 ==');
  function sq(n) { const it = A.buildItem(n); return { cat: it.category, lc: it.listCode, qc: A.matchQuota(it).code, it: it }; }
  // 分类与清单
  ck('开关归switchBtn', sq('扳式暗开关，单控，单联').cat, 'switchBtn');
  ck('按钮归switchBtn', sq('一般按钮 明装').cat, 'switchBtn');
  ck('开关清单030413013', sq('开关，双控，双联').lc, '030413013');
  ck('按钮清单030413013', sq('控制按钮').lc, '030413013');
  // 不抢占配电箱/工业开关：箱体与工业控制开关均不得识别为 switchBtn
  ck('开关箱不抢照明开关', A.classify('开关箱') !== 'switchBtn', true);
  ck('开关柜归柜类', A.classify('低压开关柜') === 'boxCabinet', true);
  ck('行程开关非照明开关', A.classify('行程开关') !== 'switchBtn', true);
  ck('隔离开关非照明开关', A.classify('隔离开关') !== 'switchBtn', true);
  // 扳式暗开关 单控 1~6联 = 2-1799~1804
  ['单联', '双联', '三联', '四联', '五联', '六联'].forEach(function (cn, i) {
    ck('单控' + cn + '=2-' + (1799 + i), sq('扳式暗开关，单控，' + cn).qc, '2-' + (1799 + i));
  });
  // 扳式暗开关 双控 1~6联 = 2-1805~1810
  ['单联', '双联', '三联', '四联', '五联', '六联'].forEach(function (cn, i) {
    ck('双控' + cn + '=2-' + (1805 + i), sq('开关，双控，' + cn).qc, '2-' + (1805 + i));
  });
  // 特殊开关
  ck('拉线开关2-1797', sq('拉线开关').qc, '2-1797');
  ck('扳把开关明装2-1798', sq('扳把开关明装').qc, '2-1798');
  ck('密闭开关2-1813', sq('密闭开关').qc, '2-1813');
  // 按钮：控制普通2-347 / 防爆2-348；一般明2-1811 / 暗2-1812
  ck('控制按钮普通2-347', sq('控制按钮 普通型').qc, '2-347');
  ck('防爆按钮2-348(官方核实)', sq('防爆按钮').qc, '2-348');
  ck('一般按钮明装2-1811', sq('一般按钮 明装').qc, '2-1811');
  ck('一般按钮暗装2-1812', sq('一般按钮 暗装').qc, '2-1812');

  console.log('== 开关/按钮/插座/灯具 主材价 ==');
  var PK = A.getPeriods()[0].period;
  function pr(n) { return A.parseRows([[1, n, 10]], PK, 'gld')[0]; }
  function approx(a, b) { return a !== null && Math.abs(a - b) < 0.01; }
  // 开关：单~四联信息价，五六联市场价
  var s1 = pr('扳式暗开关，单控，单联');
  ck('单联开关信息价11.14', approx(s1.price, 11.14) && s1.priceSource === 'official', true);
  ck('四联开关信息价31.32', (function () { var r = pr('开关，单控，四联'); return approx(r.price, 31.32) && r.priceSource === 'official'; })(), true);
  ck('六联开关市场价52', (function () { var r = pr('开关，双控，六联'); return approx(r.price, 52) && r.priceSource === 'market'; })(), true);
  ck('控制按钮普通市场价18', (function () { var r = pr('控制按钮 普通型'); return approx(r.price, 18) && r.priceSource === 'market'; })(), true);
  ck('防爆按钮市场价65', (function () { var r = pr('防爆按钮'); return approx(r.price, 65) && r.priceSource === 'market'; })(), true);
  ck('一般按钮暗装8.5', approx(pr('一般按钮 暗装').price, 8.5), true);
  // 插座：暗五孔/三孔信息价
  var o5 = pr('单相暗插座15A 五孔');
  ck('暗五孔信息价7.1定额2-1834', approx(o5.price, 7.1) && o5.priceSource === 'official' && o5.quotaCode === '2-1834', true);
  ck('暗三孔信息价6.6', (function () { var r = pr('单相暗插座15A 三孔'); return approx(r.price, 6.6) && r.priceSource === 'official'; })(), true);
  ck('明五孔市场价9', (function () { var r = pr('单相明插座15A 五孔'); return approx(r.price, 9) && r.priceSource === 'market'; })(), true);
  ck('防爆插座市场价42', approx(pr('防爆插座 单相15A').price, 42), true);
  // 灯具市场价
  ck('软线吊灯22', approx(pr('软线吊灯').price, 22), true);
  ck('双管嵌入荧光灯68', approx(pr('双管荧光灯 嵌入式').price, 68), true);
  ck('工厂罩弯杆110', approx(pr('工厂罩灯 弯杆式').price, 110), true);
  ck('投光灯280', approx(pr('投光灯').price, 280), true);
  ck('紫外线杀菌灯180', approx(pr('紫外线杀菌灯').price, 180), true);
  ck('筒灯28', approx(pr('LED筒灯').price, 28), true);
  // 配电箱（柜）价格留空
  var bx = pr('照明配电箱AL1');
  ck('配电箱价格留空', bx.price === null && bx.priceSource === 'na', true);
  // 控制电缆/电缆头不自动询价
  ck('控制电缆不询价', pr('KVV-7×1.5 控制电缆').price, null);
})();

/* ============================================================
   防雷接地（清单030410xxx / 定额2-369·824·830·880·881·885·895）
   ============================================================ */
(function () {
  var PK = A.getPeriods()[0].period;
  function pr(n) { return A.parseRows([[1, n, 10]], PK, 'gld')[0]; }
  function approx(a, b) { return a !== null && Math.abs(a - b) < 0.01; }
  console.log('\n== 防雷接地 ==');

  // 等电位端子箱
  var pot = pr('局部等电位端子箱');
  ck('等电位清单030410007', pot.listCode, '030410007');
  ck('等电位定额2-369', pot.quotaCode, '2-369');
  ck('等电位单位台', pot.unit, '台');
  ck('局部等电位45元', approx(pot.price, 45), true);
  var potM = pr('总等电位端子箱');
  ck('总等电位220元', approx(potM.price, 220), true);
  ck('等电位默认局部', pr('等电位联结').price, 45);

  // 接地母线（扁钢）
  var gb = pr('镀锌扁钢 4*40');
  ck('接地母线清单030410002', gb.listCode, '030410002');
  ck('接地母线定额2-830', gb.quotaCode, '2-830');
  ck('接地母线单位m', gb.unit, 'm');
  ck('接地母线5.473元/m', approx(gb.price, 5.473), true);
  ck('接地母线-40×4同识别', pr('接地母线 -40×4').quotaCode, '2-830');

  // 接地装置
  var gs = pr('接地装置');
  ck('接地装置清单030416027', gs.listCode, '030416027');
  ck('接地装置定额2-895', gs.quotaCode, '2-895');
  ck('接地装置单位系统', gs.unit, '系统');
  ck('接地装置无主材', gs.price === null && gs.priceSource === 'none', true);

  // 引下线
  var gd = pr('防雷引下线');
  ck('引下线清单030410003', gd.listCode, '030410003');
  ck('引下线定额2-880', gd.quotaCode, '2-880');
  ck('引下线无主材', gd.priceSource, 'none');

  // 均压环 / 避雷网
  var gr = pr('均压环 利用圈梁钢筋');
  ck('均压环清单030410004', gr.listCode, '030410004');
  ck('均压环定额2-885', gr.quotaCode, '2-885');
  ck('均压环不计主材', gr.priceSource, 'none');
  var gm = pr('避雷网 φ10镀锌圆钢');
  ck('避雷网同定额2-885', gm.quotaCode, '2-885');
  ck('避雷网φ10圆钢信息价2.09', approx(gm.price, 2.09) && gm.priceSource === 'official', true);
  ck('闪接带按避雷网计主材', approx(pr('闪接带 -25×4').price, 2.09), true);

  // 接地极
  var gr2 = pr('角钢接地极 L50×5');
  ck('接地极清单030410001', gr2.listCode, '030410001');
  ck('接地极定额2-824', gr2.quotaCode, '2-824');
  ck('接地极单位根', gr2.unit, '根');
  ck('接地极无主材', gr2.priceSource, 'none');

  // 断接卡 / 测试点
  var gt = pr('断接卡子');
  ck('断接卡定额2-881', gt.quotaCode, '2-881');
  ck('断接卡单位套', gt.unit, '套');
  ck('接地测试点同2-881', pr('接地测试点').quotaCode, '2-881');
})();

/* ============================================================
   母线（清单030403006/030403007，定额2-229~2-237）
   ============================================================ */
(function () {
  var PK = A.getPeriods()[0].period;
  function pr(n) { return A.parseRows([[1, n, 10]], PK, 'gld')[0]; }
  function approx(a, b) { return a !== null && Math.abs(a - b) < 0.01; }
  console.log('\n== 母线 ==');

  var b5 = pr('母线 500A');
  ck('母线清单030403006', b5.listCode, '030403006');
  ck('母线500A→2-230(800A以内)', b5.quotaCode, '2-230');
  ck('母线单位m', b5.unit, 'm');
  ck('母线500A主材1327.43', approx(b5.price, 1327.43), true);
  ck('母线2500A→2-233', pr('母线 2500A').quotaCode, '2-233');
  ck('母线400A→2-229', pr('母线 400A').quotaCode, '2-229');
  ck('母线1250A→2-231', pr('母线 1250A').quotaCode, '2-231');
  ck('母线2000A→2-232', pr('母线 2000A').quotaCode, '2-232');
  ck('母线4000A→2-233', pr('母线 4000A').quotaCode, '2-233');
  ck('母线2500A主材6637.17', approx(pr('母线 2500A').price, 6637.17), true);
  ck('母线未注电流→2-229且待询价', (function () { var r = pr('母线槽'); return r.quotaCode === '2-229' && r.price === null && r.priceSource === 'pending'; })(), true);

  var bx = pr('母线插接箱 100A');
  ck('母线箱清单030403007', bx.listCode, '030403007');
  ck('母线箱100A→2-234', bx.quotaCode, '2-234');
  ck('母线箱单位台', bx.unit, '台');
  ck('母线箱主材1946', approx(bx.price, 1946), true);
  ck('母线箱630A→2-237', pr('封闭母线始端箱 630A').quotaCode, '2-237');
  ck('母线箱无参数→2-234', pr('母线箱').quotaCode, '2-234');

  // 不误伤：接地母线不归母线类
  ck('接地母线不归母线类', pr('接地母线').category, 'ground');
  // 母线不误伤桥架/电缆
  ck('桥架仍归bridge', pr('钢制槽式桥架 200×100').category, 'bridge');
  ck('电缆仍归power', pr('WDZ-YJY-4×25+1×16').category, 'power');
})();

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
