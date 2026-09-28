// Utilidades comunes: anotaciones y calculadora de ahorro
(function () {
  // Botón de anotaciones UX
  const btn = document.querySelector('[data-toggle-notes]');
  if (btn) {
    btn.addEventListener('click', () => {
      const on = document.body.classList.toggle('notes');
      btn.setAttribute('aria-pressed', on);
    });
  }

  // Calculadora: aportación mensual + años al 2,20 % bruto anual
  const RATE = 0.022;
  const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' });

  function futureValue(monthly, years) {
    const r = Math.pow(1 + RATE, 1 / 12) - 1; // tipo mensual equivalente
    const n = years * 12;
    return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  }

  document.querySelectorAll('[data-calc]').forEach((root) => {
    const m = root.querySelector('[name="monthly"]');
    const y = root.querySelector('[name="years"]');
    const out = (k) => root.querySelector(`[data-out="${k}"]`);

    function paint() {
      const monthly = +m.value, years = +y.value;
      const total = futureValue(monthly, years);
      const paid = monthly * years * 12;
      const interest = total - paid;
      if (out('monthly')) out('monthly').textContent = eur.format(monthly);
      if (out('years')) out('years').textContent = years + (years === 1 ? ' año' : ' años');
      if (out('total')) out('total').textContent = eur.format(total);
      if (out('paid')) out('paid').textContent = eur.format(paid);
      if (out('interest')) out('interest').textContent = eur.format(interest);
      const bar = out('bar');
      if (bar) bar.style.width = Math.max(4, (interest / total) * 100) + '%';
      // Gráfica de evolución: aportado vs. intereses por año
      const chart = out('chart');
      if (chart) {
        const step = years > 20 ? 2 : 1;
        let html = '';
        for (let k = step; k <= years; k += step) {
          const t = futureValue(monthly, k), p = monthly * 12 * k;
          const h = (t / total) * 100, hp = (p / t) * 100;
          html += `<div class="bar" style="height:${h}%" title="Año ${k}: ${eur.format(t)}"><i style="height:${hp}%"></i></div>`;
        }
        chart.innerHTML = html;
      }
      root.querySelectorAll('[data-years-set]').forEach((b) => {
        b.setAttribute('aria-pressed', +b.dataset.yearsSet === years);
      });
      const num = root.querySelector('[name="monthly-num"]');
      if (num && document.activeElement !== num) num.value = monthly;
      [m, y].forEach((el) => {
        const p = ((el.value - el.min) / (el.max - el.min)) * 100;
        el.style.setProperty('--p', p + '%');
      });
    }
    m.addEventListener('input', paint);
    y.addEventListener('input', paint);
    root.querySelectorAll('[data-years-set]').forEach((b) => b.addEventListener('click', () => { y.value = b.dataset.yearsSet; paint(); }));
    const num = root.querySelector('[name="monthly-num"]');
    if (num) num.addEventListener('input', () => { const v = Math.min(+m.max, Math.max(+m.min, +num.value || 0)); m.value = v; paint(); });
    paint();
  });

  // Pestañas simples (momentos vitales)
  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const btns = tabs.querySelectorAll('[role="tab"]');
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => {
        x.setAttribute('aria-selected', x === b);
        document.getElementById(x.getAttribute('aria-controls')).hidden = x !== b;
      });
    }));
  });
})();
