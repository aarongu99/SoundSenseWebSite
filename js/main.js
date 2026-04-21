// Reveal on scroll
(function(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return;}
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{rootMargin:'0px 0px -60px 0px',threshold:0.08});
  els.forEach(e=>io.observe(e));
})();

// Nav bg on scroll
(function(){
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if(window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

// Hamburger menu toggle
(function(){
  const toggle = document.querySelector('.nav-menu-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  const open = () => {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu.hidden) open(); else close();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      close();
      toggle.focus();
    }
  });

  // Close when clicking outside the menu or toggle
  document.addEventListener('click', (e) => {
    if (menu.hidden) return;
    if (menu.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });

  // Close after a menu link is clicked (before navigation happens)
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });
})();

// FAQ accordion
(function(){
  document.querySelectorAll('.faq-item').forEach(item=>{
    const btn = item.querySelector('.faq-trigger');
    const ans = item.querySelector('.faq-answer');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      if(isOpen){
        item.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
        ans.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });
})();

// Interactive phone dashboard — ported from SoundSense prototype
(function(){
  const phone = document.querySelector('[data-phone]');
  if (!phone) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Status cycle data
  const statusCycle = [
    { urgency: 'critical',  text: 'Fire alarm detected',       sub: 'Kitchen · 12 min ago',   ms: 4200 },
    { urgency: 'calm',      text: 'All quiet. No new alerts.', sub: '5 sounds detected today', ms: 5200 },
    { urgency: 'important', text: 'Doorbell. Front door.',     sub: 'just now',                ms: 3400 },
    { urgency: 'calm',      text: 'All clear. Home is quiet.', sub: 'Monitoring 6 sounds',     ms: 5000 },
    { urgency: 'info',      text: 'Microwave beep. Kitchen.',  sub: '30 sec ago',              ms: 3400 },
    { urgency: 'calm',      text: 'All quiet. Listening.',     sub: 'No alerts in the last hour', ms: 5200 },
  ];
  const urgPal = {
    critical:  { rgb: '212,71,60',   text: '#D4473C' },
    important: { rgb: '194,149,107', text: '#A87D55' },
    info:      { rgb: '91,148,200',  text: '#5B94C8' },
    calm:      { rgb: '91,154,79',   text: '#5B9A4F' },
  };

  // Element refs
  const dbEl        = phone.querySelector('[data-db]');
  const dbLabelEl   = phone.querySelector('[data-db-label]');
  const statusTxt   = phone.querySelector('[data-status-text]');
  const statusSub   = phone.querySelector('[data-status-sub]');
  const rings       = phone.querySelectorAll('[data-sonar-ring]');
  const halo        = phone.querySelector('[data-sonar-halo]');
  const center      = phone.querySelector('[data-sonar-center]');
  const waveBars    = phone.querySelectorAll('[data-wave-bar]');
  const toastEl     = phone.querySelector('[data-toast]');

  // Simulated state
  let dbLevel = 32, dbTarget = 32, tick = 0;
  let statusIdx = 0;
  let statusTimer = null;
  let toastTimer = null;

  function setStatusVisuals(idx){
    const s = statusCycle[idx];
    const p = urgPal[s.urgency] || urgPal.calm;
    statusTxt.textContent = s.text;
    statusTxt.style.color = p.text;
    statusSub.textContent = s.sub;
    rings.forEach(r => { r.style.borderColor = 'rgba(' + p.rgb + ', 0.18)'; });
    if (halo) halo.style.borderColor = 'rgba(' + p.rgb + ', 0.28)';
  }

  function cycleStatus(){
    statusIdx = (statusIdx + 1) % statusCycle.length;
    setStatusVisuals(statusIdx);
    statusTimer = setTimeout(cycleStatus, statusCycle[statusIdx].ms);
  }

  // dB simulation — random-walk smoothed toward a drifting target
  function dbLoop(){
    tick++;
    if (tick % 80 === 0) dbTarget = 55 + Math.random() * 25;
    else if (tick % 80 === 12) dbTarget = 25 + Math.random() * 15;
    else dbTarget += (Math.random() - 0.5) * 4;
    dbTarget = Math.max(20, Math.min(85, dbTarget));
    dbLevel += (dbTarget - dbLevel) * 0.15;
    if (tick % 3 === 0) {
      const lvl = Math.round(dbLevel);
      dbEl.textContent = lvl;
      dbLabelEl.textContent = 'dB ' + (lvl < 30 ? 'silent' : lvl < 45 ? 'quiet' : lvl < 60 ? 'moderate' : 'loud');
    }
    // Scale the sonar halo + center with dB level
    const n = Math.max(0, Math.min(1, (dbLevel - 20) / 60));
    if (halo)   halo.style.transform   = 'scale(' + (1 + n * 0.22).toFixed(3) + ')';
    if (center) center.style.transform = 'scale(' + (1 + n * 0.12).toFixed(3) + ')';
    requestAnimationFrame(dbLoop);
  }

  // Wave bars — heights tied to current dB level
  function animateWaveBars(){
    const norm = Math.max(0, Math.min(1, (dbLevel - 20) / 60));
    const base = [5, 12, 9, 16, 6, 6, 12, 9, 16, 5];
    waveBars.forEach((bar, i) => {
      const h = base[i] * (0.3 + norm * 0.9 + Math.random() * 0.25);
      bar.style.height = Math.max(3, h) + 'px';
    });
  }

  function showToast(msg){
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // Click handlers: quick actions
  phone.querySelectorAll('[data-quick-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.getAttribute('data-quick-action');
      const copy = ({
        'Zones':  'Zones → manage where SoundSense is active',
        'Train':  'Train → teach the app a new sound',
        'Sounds': 'Sounds → browse and customize sound library',
        'Alerts': 'Alerts → tune haptics, visuals, urgency',
      })[label] || label;
      showToast(copy);
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 160);
    });
  });

  // Click handlers: recent event rows + view all
  phone.querySelectorAll('[data-event-row]').forEach(row => {
    row.addEventListener('click', () => {
      const label = row.getAttribute('data-event-row');
      showToast(label);
    });
  });

  // Click handlers: tab bar (active state + toast; does not switch screens)
  const tabs = phone.querySelectorAll('[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('pd-tab-active');
        const dot = t.querySelector('.pd-tab-dot');
        if (dot) dot.remove();
      });
      tab.classList.add('pd-tab-active');
      if (!tab.querySelector('.pd-tab-dot')) {
        const dot = document.createElement('span');
        dot.className = 'pd-tab-dot';
        tab.appendChild(dot);
      }
      showToast(tab.getAttribute('data-tab'));
    });
  });

  // Start loops
  setStatusVisuals(0);
  if (!reduceMotion) {
    statusTimer = setTimeout(cycleStatus, statusCycle[0].ms);
    requestAnimationFrame(dbLoop);
    setInterval(animateWaveBars, 150);
  } else {
    // In reduced-motion mode: render one stable frame and do nothing else.
    dbEl.textContent = 32;
    dbLabelEl.textContent = 'dB quiet';
  }
})();
