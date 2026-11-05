/* ============================================================
 * 天津造价信息 2026年1-10期 合并（data/periods-2026.js）
 * 作用：把官方期刊提取的电缆/桥架/电线价格按期并入 CABLE_PRICE_PERIODS
 * 口径：除税价（中间价÷1.13）；电线由 km 价折算元/m
 * ============================================================ */
(function () {
  var T = (typeof window !== 'undefined' && window.TJ_PERIODS_2026) || [];
  var P = (typeof window !== 'undefined' && window.CABLE_PRICE_PERIODS) || [];
  if (!T.length || !P.length) return;
  var tpl = P[0];
  function norm(x) { var a = String(x || '').split('-'); return (parseInt(a[0], 10) || 0) + '-' + (parseInt(a[1], 10) || 0); }
  function cp(o) { return JSON.parse(JSON.stringify(o)); }
  function parseSpec(spec) {
    var m = /^(\d+(?:\+\d+)?)\s*x\s*([\d.]+)(?:\+\d+x([\d.]+))?$/.exec(spec);
    if (!m) return null;
    var cores = m[1], section = parseFloat(m[2]);
    if (m[3]) cores = cores.indexOf('+') >= 0 ? cores : (cores + '+1');
    return { cores: cores, section: section };
  }
  T.forEach(function (p) {
    var exist = null;
    for (var i = 0; i < P.length; i++) if (norm(P[i].period) === norm(p.period)) exist = P[i];
    if (exist) exist.period = p.period;
    var o = exist || cp(tpl);
    o.period = p.period;
    o.releaseLabel = p.label;
    o.source = 'tj-info';
    // 电缆
    if (p.cable && p.cable.length) {
      o.items = p.cable.map(function (c) {
        var sp = parseSpec(c.spec) || {};
        return {
          material: '铜', model: c.model,
          cores: sp.cores || '', section: sp.section || null,
          spec: c.spec, unit: 'm', price: c.price, source: 'info'
        };
      });
    }
    // 桥架（按 宽x高）
    if (p.bridge && Object.keys(p.bridge).length) {
      o.elec = o.elec || {};
      o.elec.bridge = {};
      Object.keys(p.bridge).forEach(function (k) { o.elec.bridge[k] = p.bridge[k]; });
    }
    // 电线（BV/BVR/BYJ，元/m）
    if (p.wire) {
      o.elec = o.elec || {};
      var map = { BV: 'bvWire', BVR: 'bvrWire', BYJ: 'byjWire', BVV: 'bvvWire', RVS: 'rvsWire' };
      Object.keys(p.wire).forEach(function (k) {
        var parts = k.split('|');           // BV|1x2.5
        var tgt = map[parts[0]];
        if (!tgt) return;
        var sec = parts[1].replace(/^\d+x/, '');
        o.elec[tgt] = o.elec[tgt] || {};
        o.elec[tgt][sec] = p.wire[k];
      });
    }
    o.infoCount = (o.items ? o.items.length : 0);
    if (!exist) P.push(o);
  });
  function pk(s) { var a = String(s || '').split('-'); return (parseInt(a[0], 10) || 0) * 100 + (parseInt(a[1], 10) || 0); }
  P.sort(function (a, b) { return pk(b.period) - pk(a.period); });
})();
