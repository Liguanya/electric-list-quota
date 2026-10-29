/* ============================================================
 * 电缆主材价格库（天津市工程造价信息 · 中准价 · 除税价）
 * ------------------------------------------------------------
 * 【每月更新方式】
 *   每月天津造价信息发布后，在下方 CABLE_PRICE_PERIODS 数组最前面
 *   用 unshift 思路"追加"一期对象即可，网站期号下拉会自动识别。
 *   历史月份保留不动，结算时可选择施工同期信息价，保证可追溯。
 *
 * 【单条数据字段】
 *   material  材质："铜" / "铝"
 *   model     电缆型号：YJV / YJV22 / YJY / YJLV / YJLV22 / VV / ...
 *   cores     芯结构："1" / "3" / "4" / "5" / "3+2" / "4+1" / ...
 *   section   主芯标称截面(mm²)：数字，如 35 / 120 / 240
 *   spec      网站匹配/展示用规格串（如 "4x35+1x16"、"5x16"）
 *   unit      单位：电缆固定 "m"
 *   price     ★组价采用：中准价【除税价】，单位 元/m，数值
 *   price_incl 选填：含税中准价（便于核对，网站不直接用）
 *   source    "official"=官方价 / "estimated"=估算价
 *   basis     估算依据说明（official 可省略）
 *
 * 【在库数据 · 2026年第9期，共204条】
 *   铜芯102条：官方中准价（含税÷1.13折除税）
 *   铝芯102条：信息价无铝芯，按常规市场价估算（电缆宝2026-10现货价
 *             4×70/4×95/4×240 锚点幂函数拟合全规格，÷1.13除税），
 *             source=estimated，测试中可调整
 * 【缺规格估算】库中未直接命中的规格，系统仍会按"同型号→同芯结构→
 *   相邻截面"自动插值/就近取值，并在结果中标注估算依据。
 * ============================================================ */
window.CABLE_PRICE_PERIODS = [
  {
    "period": "2026-09",
    "releaseLabel": "2026年第9期",
    "items": [
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 2.5,
        "spec": "3x2.5+2x1.5",
        "unit": "m",
        "price_incl": 17.11,
        "price": 15.14,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 4,
        "spec": "3x4+2x2.5",
        "unit": "m",
        "price_incl": 25.57,
        "price": 22.63,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 6,
        "spec": "3x6+2x4",
        "unit": "m",
        "price_incl": 38.54,
        "price": 34.11,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 10,
        "spec": "3x10+2x6",
        "unit": "m",
        "price_incl": 62.01,
        "price": 54.88,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 16,
        "spec": "3x16+2x10",
        "unit": "m",
        "price_incl": 92.32,
        "price": 81.7,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 25,
        "spec": "3x25+2x16",
        "unit": "m",
        "price_incl": 134.59,
        "price": 119.11,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 35,
        "spec": "3x35+2x16",
        "unit": "m",
        "price_incl": 170.64,
        "price": 151.01,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 50,
        "spec": "3x50+2x25",
        "unit": "m",
        "price_incl": 217.15,
        "price": 192.17,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 70,
        "spec": "3x70+2x35",
        "unit": "m",
        "price_incl": 303.43,
        "price": 268.52,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 95,
        "spec": "3x95+2x50",
        "unit": "m",
        "price_incl": 433.84,
        "price": 383.93,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 120,
        "spec": "3x120+2x70",
        "unit": "m",
        "price_incl": 550.41,
        "price": 487.09,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 150,
        "spec": "3x150+2x70",
        "unit": "m",
        "price_incl": 636.14,
        "price": 562.96,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 185,
        "spec": "3x185+2x95",
        "unit": "m",
        "price_incl": 830.56,
        "price": 735.01,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3+2",
        "section": 240,
        "spec": "3x240+2x120",
        "unit": "m",
        "price_incl": 1071.23,
        "price": 947.99,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 2.5,
        "spec": "4x2.5+1x1.5",
        "unit": "m",
        "price_incl": 17.69,
        "price": 15.65,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 4,
        "spec": "4x4+1x2.5",
        "unit": "m",
        "price_incl": 29.21,
        "price": 25.85,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 6,
        "spec": "4x6+1x4",
        "unit": "m",
        "price_incl": 39.04,
        "price": 34.55,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 10,
        "spec": "4x10+1x6",
        "unit": "m",
        "price_incl": 65.06,
        "price": 57.58,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 16,
        "spec": "4x16+1x10",
        "unit": "m",
        "price_incl": 98.16,
        "price": 86.87,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 25,
        "spec": "4x25+1x16",
        "unit": "m",
        "price_incl": 139.88,
        "price": 123.79,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 35,
        "spec": "4x35+1x16",
        "unit": "m",
        "price_incl": 180.6,
        "price": 159.82,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 50,
        "spec": "4x50+1x25",
        "unit": "m",
        "price_incl": 252.16,
        "price": 223.15,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 70,
        "spec": "4x70+1x35",
        "unit": "m",
        "price_incl": 349.86,
        "price": 309.61,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 95,
        "spec": "4x95+1x50",
        "unit": "m",
        "price_incl": 483.91,
        "price": 428.24,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 120,
        "spec": "4x120+1x70",
        "unit": "m",
        "price_incl": 610.66,
        "price": 540.41,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 150,
        "spec": "4x150+1x70",
        "unit": "m",
        "price_incl": 731.98,
        "price": 647.77,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 185,
        "spec": "4x185+1x95",
        "unit": "m",
        "price_incl": 925.49,
        "price": 819.02,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4+1",
        "section": 240,
        "spec": "4x240+1x120",
        "unit": "m",
        "price_incl": 1186.42,
        "price": 1049.93,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 1.5,
        "spec": "3x1.5",
        "unit": "m",
        "price_incl": 10.67,
        "price": 9.44,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 2.5,
        "spec": "3x2.5",
        "unit": "m",
        "price_incl": 14.65,
        "price": 12.96,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 4,
        "spec": "3x4",
        "unit": "m",
        "price_incl": 20.25,
        "price": 17.92,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 6,
        "spec": "3x6",
        "unit": "m",
        "price_incl": 27.82,
        "price": 24.62,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 10,
        "spec": "3x10",
        "unit": "m",
        "price_incl": 40.76,
        "price": 36.07,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 16,
        "spec": "3x16",
        "unit": "m",
        "price_incl": 64.22,
        "price": 56.83,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 25,
        "spec": "3x25",
        "unit": "m",
        "price_incl": 90.97,
        "price": 80.5,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 35,
        "spec": "3x35",
        "unit": "m",
        "price_incl": 128.85,
        "price": 114.03,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 50,
        "spec": "3x50",
        "unit": "m",
        "price_incl": 175.1,
        "price": 154.96,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 70,
        "spec": "3x70",
        "unit": "m",
        "price_incl": 234.48,
        "price": 207.5,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 95,
        "spec": "3x95",
        "unit": "m",
        "price_incl": 315.82,
        "price": 279.49,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 120,
        "spec": "3x120",
        "unit": "m",
        "price_incl": 406.12,
        "price": 359.4,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 150,
        "spec": "3x150",
        "unit": "m",
        "price_incl": 494.28,
        "price": 437.42,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 185,
        "spec": "3x185",
        "unit": "m",
        "price_incl": 622.43,
        "price": 550.82,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "3",
        "section": 240,
        "spec": "3x240",
        "unit": "m",
        "price_incl": 815.68,
        "price": 721.84,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 1.5,
        "spec": "4x1.5",
        "unit": "m",
        "price_incl": 12.14,
        "price": 10.74,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 2.5,
        "spec": "4x2.5",
        "unit": "m",
        "price_incl": 14.41,
        "price": 12.75,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 4,
        "spec": "4x4",
        "unit": "m",
        "price_incl": 25.48,
        "price": 22.55,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 6,
        "spec": "4x6",
        "unit": "m",
        "price_incl": 36.24,
        "price": 32.07,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 10,
        "spec": "4x10",
        "unit": "m",
        "price_incl": 51.37,
        "price": 45.46,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 16,
        "spec": "4x16",
        "unit": "m",
        "price_incl": 79.95,
        "price": 70.75,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 25,
        "spec": "4x25",
        "unit": "m",
        "price_incl": 122.48,
        "price": 108.39,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 35,
        "spec": "4x35",
        "unit": "m",
        "price_incl": 158.77,
        "price": 140.5,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 50,
        "spec": "4x50",
        "unit": "m",
        "price_incl": 222.15,
        "price": 196.59,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 70,
        "spec": "4x70",
        "unit": "m",
        "price_incl": 312.82,
        "price": 276.83,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 95,
        "spec": "4x95",
        "unit": "m",
        "price_incl": 402.03,
        "price": 355.78,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 120,
        "spec": "4x120",
        "unit": "m",
        "price_incl": 521.23,
        "price": 461.27,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 150,
        "spec": "4x150",
        "unit": "m",
        "price_incl": 653.24,
        "price": 578.09,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 185,
        "spec": "4x185",
        "unit": "m",
        "price_incl": 806.13,
        "price": 713.39,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "4",
        "section": 240,
        "spec": "4x240",
        "unit": "m",
        "price_incl": 1042.61,
        "price": 922.66,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 1.5,
        "spec": "5x1.5",
        "unit": "m",
        "price_incl": 18.09,
        "price": 16.01,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 2.5,
        "spec": "5x2.5",
        "unit": "m",
        "price_incl": 22.71,
        "price": 20.1,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 4,
        "spec": "5x4",
        "unit": "m",
        "price_incl": 28.02,
        "price": 24.8,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 6,
        "spec": "5x6",
        "unit": "m",
        "price_incl": 39.76,
        "price": 35.19,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 10,
        "spec": "5x10",
        "unit": "m",
        "price_incl": 69.22,
        "price": 61.26,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 16,
        "spec": "5x16",
        "unit": "m",
        "price_incl": 100.34,
        "price": 88.8,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 25,
        "spec": "5x25",
        "unit": "m",
        "price_incl": 157.15,
        "price": 139.07,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 35,
        "spec": "5x35",
        "unit": "m",
        "price_incl": 203.47,
        "price": 180.06,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 50,
        "spec": "5x50",
        "unit": "m",
        "price_incl": 290.22,
        "price": 256.83,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 70,
        "spec": "5x70",
        "unit": "m",
        "price_incl": 397.42,
        "price": 351.7,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 95,
        "spec": "5x95",
        "unit": "m",
        "price_incl": 531.82,
        "price": 470.64,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 120,
        "spec": "5x120",
        "unit": "m",
        "price_incl": 671.12,
        "price": 593.91,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 150,
        "spec": "5x150",
        "unit": "m",
        "price_incl": 803.08,
        "price": 710.69,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 185,
        "spec": "5x185",
        "unit": "m",
        "price_incl": 988.65,
        "price": 874.91,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV",
        "cores": "5",
        "section": 240,
        "spec": "5x240",
        "unit": "m",
        "price_incl": 1278.2,
        "price": 1131.15,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 2.5,
        "spec": "3x2.5+2x1.5",
        "unit": "m",
        "price_incl": 29.22,
        "price": 25.86,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 4,
        "spec": "3x4+2x2.5",
        "unit": "m",
        "price_incl": 32.37,
        "price": 28.65,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 6,
        "spec": "3x6+2x4",
        "unit": "m",
        "price_incl": 47.69,
        "price": 42.2,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 10,
        "spec": "3x10+2x6",
        "unit": "m",
        "price_incl": 68.82,
        "price": 60.9,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 16,
        "spec": "3x16+2x10",
        "unit": "m",
        "price_incl": 98.35,
        "price": 87.04,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 25,
        "spec": "3x25+2x16",
        "unit": "m",
        "price_incl": 140.78,
        "price": 124.58,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 35,
        "spec": "3x35+2x16",
        "unit": "m",
        "price_incl": 184.27,
        "price": 163.07,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 50,
        "spec": "3x50+2x25",
        "unit": "m",
        "price_incl": 250.86,
        "price": 222.0,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 70,
        "spec": "3x70+2x35",
        "unit": "m",
        "price_incl": 348.4,
        "price": 308.32,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 95,
        "spec": "3x95+2x50",
        "unit": "m",
        "price_incl": 475.01,
        "price": 420.36,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 120,
        "spec": "3x120+2x70",
        "unit": "m",
        "price_incl": 590.0,
        "price": 522.12,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 150,
        "spec": "3x150+2x70",
        "unit": "m",
        "price_incl": 699.46,
        "price": 618.99,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 185,
        "spec": "3x185+2x95",
        "unit": "m",
        "price_incl": 901.11,
        "price": 797.44,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 240,
        "spec": "3x240+2x120",
        "unit": "m",
        "price_incl": 1152.7,
        "price": 1020.09,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "3+2",
        "section": 300,
        "spec": "3x300+2x150",
        "unit": "m",
        "price_incl": 1443.21,
        "price": 1277.18,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 2.5,
        "spec": "4x2.5+1x1.5",
        "unit": "m",
        "price_incl": 28.54,
        "price": 25.26,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 4,
        "spec": "4x4+1x2.5",
        "unit": "m",
        "price_incl": 34.52,
        "price": 30.55,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 6,
        "spec": "4x6+1x4",
        "unit": "m",
        "price_incl": 49.11,
        "price": 43.46,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 10,
        "spec": "4x10+1x6",
        "unit": "m",
        "price_incl": 72.43,
        "price": 64.1,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 16,
        "spec": "4x16+1x10",
        "unit": "m",
        "price_incl": 111.25,
        "price": 98.45,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 25,
        "spec": "4x25+1x16",
        "unit": "m",
        "price_incl": 153.85,
        "price": 136.15,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 35,
        "spec": "4x35+1x16",
        "unit": "m",
        "price_incl": 205.66,
        "price": 182.0,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 50,
        "spec": "4x50+1x25",
        "unit": "m",
        "price_incl": 251.54,
        "price": 222.6,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 70,
        "spec": "4x70+1x35",
        "unit": "m",
        "price_incl": 370.42,
        "price": 327.81,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 95,
        "spec": "4x95+1x50",
        "unit": "m",
        "price_incl": 530.93,
        "price": 469.85,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 120,
        "spec": "4x120+1x70",
        "unit": "m",
        "price_incl": 646.5,
        "price": 572.12,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 150,
        "spec": "4x150+1x70",
        "unit": "m",
        "price_incl": 782.12,
        "price": 692.14,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 185,
        "spec": "4x185+1x95",
        "unit": "m",
        "price_incl": 1006.46,
        "price": 890.67,
        "source": "official"
      },
      {
        "material": "铜",
        "model": "YJV22",
        "cores": "4+1",
        "section": 240,
        "spec": "4x240+1x120",
        "unit": "m",
        "price_incl": 1318.46,
        "price": 1166.78,
        "source": "official"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 1.5,
        "spec": "3x1.5",
        "unit": "m",
        "price": 0.24,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 2.5,
        "spec": "3x2.5",
        "unit": "m",
        "price": 0.42,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 4,
        "spec": "3x4",
        "unit": "m",
        "price": 0.71,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 6,
        "spec": "3x6",
        "unit": "m",
        "price": 1.12,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 10,
        "spec": "3x10",
        "unit": "m",
        "price": 1.97,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 16,
        "spec": "3x16",
        "unit": "m",
        "price": 3.33,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 25,
        "spec": "3x25",
        "unit": "m",
        "price": 5.46,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 35,
        "spec": "3x35",
        "unit": "m",
        "price": 7.94,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 50,
        "spec": "3x50",
        "unit": "m",
        "price": 11.79,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 70,
        "spec": "3x70",
        "unit": "m",
        "price": 17.14,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 95,
        "spec": "3x95",
        "unit": "m",
        "price": 24.06,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 120,
        "spec": "3x120",
        "unit": "m",
        "price": 31.18,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 150,
        "spec": "3x150",
        "unit": "m",
        "price": 39.96,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 185,
        "spec": "3x185",
        "unit": "m",
        "price": 50.44,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3",
        "section": 240,
        "spec": "3x240",
        "unit": "m",
        "price": 67.34,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 1.5,
        "spec": "4x1.5",
        "unit": "m",
        "price": 0.31,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 2.5,
        "spec": "4x2.5",
        "unit": "m",
        "price": 0.54,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 4,
        "spec": "4x4",
        "unit": "m",
        "price": 0.92,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 6,
        "spec": "4x6",
        "unit": "m",
        "price": 1.44,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 10,
        "spec": "4x10",
        "unit": "m",
        "price": 2.54,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 16,
        "spec": "4x16",
        "unit": "m",
        "price": 4.28,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 25,
        "spec": "4x25",
        "unit": "m",
        "price": 7.03,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 35,
        "spec": "4x35",
        "unit": "m",
        "price": 10.21,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 50,
        "spec": "4x50",
        "unit": "m",
        "price": 15.18,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 70,
        "spec": "4x70",
        "unit": "m",
        "price": 22.05,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 95,
        "spec": "4x95",
        "unit": "m",
        "price": 30.96,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 120,
        "spec": "4x120",
        "unit": "m",
        "price": 40.13,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 150,
        "spec": "4x150",
        "unit": "m",
        "price": 51.41,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 185,
        "spec": "4x185",
        "unit": "m",
        "price": 64.9,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4",
        "section": 240,
        "spec": "4x240",
        "unit": "m",
        "price": 86.65,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 1.5,
        "spec": "5x1.5",
        "unit": "m",
        "price": 0.39,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 2.5,
        "spec": "5x2.5",
        "unit": "m",
        "price": 0.69,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 4,
        "spec": "5x4",
        "unit": "m",
        "price": 1.16,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 6,
        "spec": "5x6",
        "unit": "m",
        "price": 1.83,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 10,
        "spec": "5x10",
        "unit": "m",
        "price": 3.22,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 16,
        "spec": "5x16",
        "unit": "m",
        "price": 5.43,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 25,
        "spec": "5x25",
        "unit": "m",
        "price": 8.92,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 35,
        "spec": "5x35",
        "unit": "m",
        "price": 12.96,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 50,
        "spec": "5x50",
        "unit": "m",
        "price": 19.26,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 70,
        "spec": "5x70",
        "unit": "m",
        "price": 27.98,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 95,
        "spec": "5x95",
        "unit": "m",
        "price": 39.28,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 120,
        "spec": "5x120",
        "unit": "m",
        "price": 50.92,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 150,
        "spec": "5x150",
        "unit": "m",
        "price": 65.24,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 185,
        "spec": "5x185",
        "unit": "m",
        "price": 82.35,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "5",
        "section": 240,
        "spec": "5x240",
        "unit": "m",
        "price": 109.95,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 2.5,
        "spec": "3x2.5+2x1.5",
        "unit": "m",
        "price": 0.57,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 4,
        "spec": "3x4+2x2.5",
        "unit": "m",
        "price": 0.96,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 6,
        "spec": "3x6+2x4",
        "unit": "m",
        "price": 1.5,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 10,
        "spec": "3x10+2x6",
        "unit": "m",
        "price": 2.65,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 16,
        "spec": "3x16+2x10",
        "unit": "m",
        "price": 4.47,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 25,
        "spec": "3x25+2x16",
        "unit": "m",
        "price": 7.34,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 35,
        "spec": "3x35+2x16",
        "unit": "m",
        "price": 10.66,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 50,
        "spec": "3x50+2x25",
        "unit": "m",
        "price": 15.85,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 70,
        "spec": "3x70+2x35",
        "unit": "m",
        "price": 23.03,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 95,
        "spec": "3x95+2x50",
        "unit": "m",
        "price": 32.33,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 120,
        "spec": "3x120+2x70",
        "unit": "m",
        "price": 41.9,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 150,
        "spec": "3x150+2x70",
        "unit": "m",
        "price": 53.69,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 185,
        "spec": "3x185+2x95",
        "unit": "m",
        "price": 67.77,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "3+2",
        "section": 240,
        "spec": "3x240+2x120",
        "unit": "m",
        "price": 90.49,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 2.5,
        "spec": "4x2.5+1x1.5",
        "unit": "m",
        "price": 0.63,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 4,
        "spec": "4x4+1x2.5",
        "unit": "m",
        "price": 1.06,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 6,
        "spec": "4x6+1x4",
        "unit": "m",
        "price": 1.66,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 10,
        "spec": "4x10+1x6",
        "unit": "m",
        "price": 2.93,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 16,
        "spec": "4x16+1x10",
        "unit": "m",
        "price": 4.94,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 25,
        "spec": "4x25+1x16",
        "unit": "m",
        "price": 8.11,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 35,
        "spec": "4x35+1x16",
        "unit": "m",
        "price": 11.79,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 50,
        "spec": "4x50+1x25",
        "unit": "m",
        "price": 17.52,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 70,
        "spec": "4x70+1x35",
        "unit": "m",
        "price": 25.46,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 95,
        "spec": "4x95+1x50",
        "unit": "m",
        "price": 35.73,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 120,
        "spec": "4x120+1x70",
        "unit": "m",
        "price": 46.32,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 150,
        "spec": "4x150+1x70",
        "unit": "m",
        "price": 59.35,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 185,
        "spec": "4x185+1x95",
        "unit": "m",
        "price": 74.91,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV",
        "cores": "4+1",
        "section": 240,
        "spec": "4x240+1x120",
        "unit": "m",
        "price": 100.02,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 2.5,
        "spec": "3x2.5+2x1.5",
        "unit": "m",
        "price": 0.62,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 4,
        "spec": "3x4+2x2.5",
        "unit": "m",
        "price": 1.05,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 6,
        "spec": "3x6+2x4",
        "unit": "m",
        "price": 1.64,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 10,
        "spec": "3x10+2x6",
        "unit": "m",
        "price": 2.9,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 16,
        "spec": "3x16+2x10",
        "unit": "m",
        "price": 4.88,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 25,
        "spec": "3x25+2x16",
        "unit": "m",
        "price": 8.02,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 35,
        "spec": "3x35+2x16",
        "unit": "m",
        "price": 11.65,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 50,
        "spec": "3x50+2x25",
        "unit": "m",
        "price": 17.31,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 70,
        "spec": "3x70+2x35",
        "unit": "m",
        "price": 25.15,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 95,
        "spec": "3x95+2x50",
        "unit": "m",
        "price": 35.31,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 120,
        "spec": "3x120+2x70",
        "unit": "m",
        "price": 45.77,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 150,
        "spec": "3x150+2x70",
        "unit": "m",
        "price": 58.64,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 185,
        "spec": "3x185+2x95",
        "unit": "m",
        "price": 74.02,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 240,
        "spec": "3x240+2x120",
        "unit": "m",
        "price": 98.83,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "3+2",
        "section": 300,
        "spec": "3x300+2x150",
        "unit": "m",
        "price": 126.63,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 2.5,
        "spec": "4x2.5+1x1.5",
        "unit": "m",
        "price": 0.68,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 4,
        "spec": "4x4+1x2.5",
        "unit": "m",
        "price": 1.15,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 6,
        "spec": "4x6+1x4",
        "unit": "m",
        "price": 1.8,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 10,
        "spec": "4x10+1x6",
        "unit": "m",
        "price": 3.18,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 16,
        "spec": "4x16+1x10",
        "unit": "m",
        "price": 5.36,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 25,
        "spec": "4x25+1x16",
        "unit": "m",
        "price": 8.8,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 35,
        "spec": "4x35+1x16",
        "unit": "m",
        "price": 12.79,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 50,
        "spec": "4x50+1x25",
        "unit": "m",
        "price": 19.01,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 70,
        "spec": "4x70+1x35",
        "unit": "m",
        "price": 27.62,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 95,
        "spec": "4x95+1x50",
        "unit": "m",
        "price": 38.78,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 120,
        "spec": "4x120+1x70",
        "unit": "m",
        "price": 50.26,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 150,
        "spec": "4x150+1x70",
        "unit": "m",
        "price": 64.4,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 185,
        "spec": "4x185+1x95",
        "unit": "m",
        "price": 81.29,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      },
      {
        "material": "铝",
        "model": "YJLV22",
        "cores": "4+1",
        "section": 240,
        "spec": "4x240+1x120",
        "unit": "m",
        "price": 108.54,
        "source": "estimated",
        "basis": "常规市场价估算(电缆宝2026-10铝芯现货价锚点70/95/240拟合,除税);测试可调"
      }
    ],
  // ===== 天津2026年第9期 电气材料信息价（来源：天津市住建委《2026年9月京津冀建设工程人工、材料市场价格》）=====
  // 官方发布为含税中准价，除税价=含税/1.13；SC镀锌焊接钢管按吨报价，已用GB/T3091理论重量换算为米价。
  elec: {
    // SC/RC 镀锌焊接钢管（元/m，吨价×国标理论重量，除税）
    steelConduit: {
      15: 5.31,
      20: 6.8,
      25: 9.57,
      32: 13.1,
      40: 15.07,
      50: 20.31,
      65: 27.03,
      80: 31.81,
      100: 41.01,
      125: 58.58,
      150: 71.23,
    },
    // JDG/KBG 套接紧定/扣压式镀锌钢电线管（元/m，除税；JDG与KBG同价）
    jdgConduit: {
      15: 5.12,
      20: 6.35,
      25: 10.93,
      32: 12.72,
      40: 15.84,
      50: 20.32,
    },
    // BV 铜芯聚氯乙烯绝缘电线（单芯，元/m，除税；km价/1000）
    bvWire: {
      '1': 1.23,
      '1.5': 1.62,
      '2.5': 2.46,
      '4': 3.81,
      '6': 5.79,
      '10': 10.38,
      '16': 15.79,
      '25': 23.2,
      '35': 31.69,
      '50': 47.27,
      '70': 70.85,
      '95': 92.56,
      '120': 116.26,
      '150': 143.57,
      '185': 179.11,
    },
    // BVR 铜芯聚氯乙烯绝缘软电线（单芯，元/m，除税）
    bvrWire: {
      '0.75': 0.91,
      '1': 1.24,
      '1.5': 1.81,
      '2.5': 2.83,
      '4': 4.28,
      '6': 6.34,
      '10': 10.59,
      '16': 16.47,
      '25': 25.88,
      '35': 35.09,
      '50': 50.55,
    },
    // RVS 铜芯双绞软线（2芯，元/m，除税）
    rvsWire: {
      '0.3': 1.0,
      '0.4': 1.19,
      '0.5': 1.47,
      '0.7': 1.85,
      '1': 2.61,
      '1.5': 3.7,
    },
    // 钢制槽式电缆桥架（元/m，除税；键=宽x高）
    bridge: {
      '100x50': 40.78,
      '100x75': 47.69,
      '100x100': 52.87,
      '150x100': 66.62,
      '200x100': 80.12,
      '200x150': 110.58,
      '300x100': 138.76,
      '300x150': 156.53,
      '400x100': 164.11,
      '400x150': 203.66,
      '400x200': 233.87,
      '500x100': 244.98,
      '500x200': 257.99,
      '600x100': 279.6,
      '600x200': 302.1,
      '800x200': 343.46,
    },
    // ===== 照明开关（大跷板/翘板开关，元/个，除税）=====
    // 单~四联为天津2026年9月信息价（大跷板开关，含税中准价÷1.13）；五/六联信息价缺项按中高档市场价；
    // 单控双控价格相同；明装扳把、拉线、密闭开关信息价缺项按市场价。
    switchPlate: {        // 扳式暗开关（单控/双控同价），按联数
      1: { price: 11.14, basis: 'info' },
      2: { price: 16.94, basis: 'info' },
      3: { price: 24.27, basis: 'info' },
      4: { price: 31.32, basis: 'info' },
      5: { price: 42.0, basis: 'market' },
      6: { price: 52.0, basis: 'market' },
    },
    switchSurface: 13.0,  // 扳把开关明装（中高档市场价）
    switchPull: 9.0,      // 拉线开关（市场价）
    switchSealed: 26.0,   // 密闭开关5A以内（防爆防尘，市场价）
    buttonControl: { normal: 18.0, ex: 65.0 },   // 控制按钮 普通型/防爆型（LAY7/LA39等，市场价，元/个）
    buttonGeneral: { surface: 9.5, concealed: 8.5 }, // 一般按钮 明装/暗装（市场价，元/个）
    // ===== 插座（元/个，除税）=====
    // 单相15A暗装：五孔/三孔为信息价（暗插座五孔8.02/三孔7.46÷1.13），其余孔数按中高档市场价；明装略高。
    outlet15Conceal: { 2: 6.0, 3: 6.6, 4: 6.9, 5: 7.1, 6: 9.5, 7: 11.0, 8: 12.5, 9: 14.0, 10: 16.0, 11: 18.0, 12: 20.0 },
    outlet15Surface: { 2: 7.5, 3: 8.0, 4: 8.5, 5: 9.0, 6: 11.5, 7: 13.0, 8: 14.5, 9: 16.0, 10: 18.5, 11: 20.5 },
    outlet30: { surfaceSingle3: 22.0, concealSingle2: 19.0, concealSingle3: 22.0 }, // 单相30A（大功率，市场价）
    outletThree: { surface15: 28.0, surface30: 36.0, conceal15: 25.0, conceal30: 33.0 }, // 三相四孔 明/暗×15/30A
    outletEx: {           // 防爆插座 单相/单相三孔/三相四孔 × 15/30/60A（市场价）
      single:  { 15: 42.0, 30: 55.0, 60: 72.0 },
      single3: { 15: 48.0, 30: 62.0, 60: 80.0 },
      three:   { 15: 78.0, 30: 105.0, 60: 138.0 },
    },
    // ===== 灯具（元/套，除税；信息价仅有LED灯管/灯口，成套灯具均为国产中高档市场价）=====
    lampCeilByPeri: { 800: 85.0, 1100: 145.0, inf: 260.0 }, // 吸顶灯具（圆球/半圆/简易LED/LED平板灯）按灯罩周长档
    lampPlain: {           // 普通灯固定子目
      '2-1542': 22.0,      // 软线吊灯
      '2-1543': 35.0,      // 吊链灯
      '2-1544': 30.0,      // 防水吊灯
      '2-1545': 28.0,      // 弯脖灯
      '2-1546': 45.0,      // 普通壁灯
      '2-1547': 16.0,      // 声光控/防水灯头
      '2-1548': 8.0,       // 普通座灯头
    },
    lampFluor: {           // 荧光灯（成套/组装 × 安装方式 × 单~四管），中高档LED
      chain:  { 1: 55.0, 2: 78.0, 3: 105.0, 4: 135.0 }, // 吊链式
      pipe:   { 1: 60.0, 2: 85.0, 3: 112.0, 4: 145.0 }, // 吊管式
      top:    { 1: 52.0, 2: 72.0, 3: 98.0, 4: 125.0 },  // 吸顶式
      embed:  { 1: 48.0, 2: 68.0, 3: 92.0, 4: 118.0 },  // 嵌入式（含LED平板灯/格栅灯盘）
    },
    lampFactoryHood: { top: 120.0, bend: 110.0, hang: 100.0, pipe: 105.0, chain: 115.0 }, // 工厂罩灯
    lampFactoryWp:   { top: 135.0, bend: 125.0, hang: 115.0, pipe: 118.0, chain: 128.0 }, // 防水防尘灯
    lampFactoryFixed: {     // 工厂灯固定子目
      '2-1560': 280.0,     // 投光灯
      '2-1561': 320.0,     // 混光灯
      '2-1576': 220.0,     // 防爆荧光灯
      '2-1572': 260.0,     // 高压水银灯/防爆灯
      '2-1570': 180.0,     // 安全灯
    },
    lampMedical: { '2-1783': 65.0, '2-1784': 120.0, '2-1785': 180.0, '2-1786': 1200.0 }, // 病房指示/暗脚观片/紫外线/无影
    lampDecor: {            // 装饰灯（有市场价；定额子目待选用）
      spot: 35.0,           // 射灯（LED）
      candle: 25.0,         // 蜡烛灯/点光源
      grille: 60.0,         // 吊式/吸顶艺术格栅装饰灯
      embedded: 90.0,       // 嵌入式无主灯（磁吸/线性，按套估）
      art: 120.0,           // 艺术花灯（按套估）
      lawn: 85.0,           // 草坪灯（按套估）
      underwater: 260.0,    // 水下艺术装饰灯（按套估）
      bead: 110.0,          // 挂片/串珠装饰灯（按套估）
      other: 90.0,          // 其他装饰灯具兜底
    },
    // 筒灯（LED，成套，元/套，除税）：按单只功率分档，防潮/防水型×1.25
    lampDownlight: { '6': 22.0, '10': 28.0, '15': 38.0, '24': 52.0, '30': 68.0 },
    // 应急照明/标志灯（成套，带蓄电池，元/套，除税）
    // 定额：装饰灯具 5.标志、诱导装饰灯安装 2-1720吸顶/2-1721吊杆/2-1722墙壁/2-1723嵌入
    lampSign: { exit: 65.0, evacuate: 55.0, floor: 55.0, induce: 50.0, emergency: 78.0, other: 60.0 },

    // 接地极角钢 / 断接卡子（2026-10-29 新增，元/kg、元/套，除税）
    groundAngleSteelKg: 4.6,
    groundTestCard: 12.0,

    // ===== 矿物绝缘电缆 BTTZ/BTTRZ/RTTZ/BTLY（2026-10-29 新增）=====
    // 天津信息价无矿物绝缘电缆条目 → 合理市场价（除税）
    // single：单芯 1×S 元/m；多芯 = 单芯价 × 芯数 × coreCoef（多芯共护套/共绝缘层折算）
    mineralCable: {
      brand: '国产中高档（铜芯铜护套氧化镁绝缘，BTTZ/BTTRZ系列）',
      single: {
        1: 12.0, 1.5: 13.5, 2.5: 15.0, 4: 17.0, 6: 20.0, 10: 26.0, 16: 35.0,
        25: 48.0, 35: 62.0, 50: 84.0, 70: 112.0, 95: 148.0, 120: 180.0,
        150: 218.0, 185: 265.0, 240: 338.0, 300: 418.0, 400: 552.0
      },
      coreCoef: { 1: 1.0, 2: 0.9, 3: 0.87, 4: 0.85, 5: 0.84, 6: 0.83 }
    },
    // ===== 电力电缆终端头（1kV/10kV 户内热（冷）缩式成套件，元/个，除税）=====
    // 含铜接线端子、热缩管、接地线；多芯按 coreCoef 折算（单芯×0.65）
    cableHead: {
      brand: '国产中高档（热缩式终端头成套件）',
      lv: { 10: 26.0, 35: 32.0, 70: 44.0, 120: 60.0, 185: 80.0, 240: 98.0, 300: 118.0, 400: 145.0 },
      hv: { 35: 125.0, 70: 160.0, 120: 200.0, 185: 250.0, 240: 298.0, 400: 390.0 },
      coreCoef: { 1: 0.65, 2: 0.9, 3: 1.0, 4: 1.15, 5: 1.3, 6: 1.45 },
      // 矿物绝缘电缆终端头（铜护套密封终端成套件，元/个，单芯；多芯=单芯×芯数×0.95）
      mineralBrand: '国产中高档（BTTZ专用铜护套密封终端）',
      mineral: {
        1.5: 60.0, 2.5: 65.0, 4: 70.0, 6: 78.0, 10: 88.0, 16: 100.0, 25: 118.0,
        35: 135.0, 50: 158.0, 70: 190.0, 95: 225.0, 120: 258.0, 150: 295.0,
        185: 340.0, 240: 400.0, 300: 470.0, 400: 570.0
      }
    },
    // ===== 控制电缆 / 多芯软导线（铜重+绝缘护套加工模型，元/m，除税）=====
    controlCable: {
      brand: '国产中高档（KVV/KVVP/KYJV系列）',
      copperKgPerMm2: 0.0089,  // 铜密度8.9g/cm³ → 每mm²·m铜重0.0089kg
      copperPrice: 70.0,       // 电解铜除税价 元/kg
      insulBase: 0.20,         // 每芯绝缘/成缆加工 元/m
      insulPerMm2: 0.03,       // 每芯每mm²绝缘加工附加 元/m
      sheathBase: 2.0,         // 护套/绕包/包装 元/m
      sheathPerCore: 0.12,     // 每芯护套附加 元/m
      modelCoef: { shield: 1.12, shieldSoft: 1.15, xlpe: 1.15, armour: 1.25, soft: 0.95 }
    },

    // ===== 防雷接地（2026-10-29 新增）=====
    potLocal: 45.0,         // 局部等电位端子箱 LEB（TD28等）元/台 市场价
    potMain: 220.0,         // 总等电位端子箱 MEB 元/台 市场价
    groundBusbar: 5.473,    // 镀锌扁钢 -40×4 接地母线 元/m（1.256kg/m 折算）
    roundSteel10: 3394.35,  // 圆钢 HPB300 D10 除税 元/t（3835.61含税÷1.13，天津2026年9月信息价）
    roundSteel10PerM: 2.09, // 避雷网 φ10圆钢 元/m（0.617kg/m × 3394.35元/t）

    // ===== 母线（2026-10-29 新增）=====
    busBox: 1946.0,         // 封闭母线槽分线箱（插接箱）元/台 市场价
    busPricePerA: 3.0,      // 母线主材单价系数：额定电流(A) × 3 ÷ 1.13 元/m
  },
        "source": "tjj-info"
  }
];
