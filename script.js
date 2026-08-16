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
