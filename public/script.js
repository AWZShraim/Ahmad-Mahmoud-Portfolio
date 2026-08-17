// rollout bar animation
const fill = document.getElementById('fill');
const pct = document.getElementById('pct');
const stages = document.querySelectorAll('#stages span');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) {
  fill.style.width = '100%'; pct.textContent = '100%';
  stages.forEach(s => s.classList.add('hit'));
} else {
  let current = 0;
  const steps = [25, 50, 75, 100];
  function step(i){
    if(i >= steps.length) return;
    const target = steps[i];
    fill.style.width = target + '%';
    const start = current, dur = 1000, t0 = performance.now();
    function tick(t){
      const p = Math.min((t - t0)/dur, 1);
      pct.textContent = Math.round(start + (target - start)*p) + '%';
      if(p < 1) requestAnimationFrame(tick);
      else { current = target; stages[i].classList.add('hit'); setTimeout(()=>step(i+1), 500); }
    }
    requestAnimationFrame(tick);
  }
  setTimeout(()=>step(0), 600);
}

// scroll reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// starfield
(function(){
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [], comets = [], w, h, dpr;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(220, Math.round((w * h) / 3800));
    stars = Array.from({length: count}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.3,
      base: Math.random() * 0.4 + 0.35,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.2,
      hue: Math.random() < 0.15 ? '124,155,255' : '255,255,255'
    }));
  }

  function drawStatic(){
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${s.hue},${s.base})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    resize();
    drawStatic();
    window.addEventListener('resize', () => { resize(); drawStatic(); });
    return;
  }

  function maybeSpawnComet(){
    if (Math.random() < 0.004 && comets.length < 2) {
      const fromLeft = Math.random() < 0.5;
      comets.push({
        x: fromLeft ? -20 : w + 20,
        y: Math.random() * h * 0.5,
        vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 3),
        vy: 2 + Math.random() * 2,
        life: 1
      });
    }
  }

  function tick(t){
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      const a = s.base + Math.sin(t * 0.001 * s.speed + s.phase) * 0.3;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${s.hue},${Math.max(0, a)})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    maybeSpawnComet();
    comets.forEach(c => {
      const grad = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * 6, c.y - c.vy * 6);
      grad.addColorStop(0, `rgba(255,255,255,${c.life})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - c.vx * 6, c.y - c.vy * 6);
      ctx.stroke();
      c.x += c.vx; c.y += c.vy; c.life -= 0.012;
    });
    comets = comets.filter(c => c.life > 0 && c.x > -40 && c.x < w + 40 && c.y < h + 40);

    requestAnimationFrame(tick);
  }

  resize();
  requestAnimationFrame(tick);
  window.addEventListener('resize', resize);
})();
