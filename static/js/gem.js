'use strict';
const videos = [...document.querySelectorAll('video')];
videos.forEach(video => video.addEventListener('play', () => {
  videos.forEach(other => { if (other !== video) other.pause(); });
}));

const filters = [...document.querySelectorAll('[data-filter]')];
const demos = [...document.querySelectorAll('[data-category]')];
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  filters.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  let count = 0;
  demos.forEach(card => {
    const visible = category === 'all' || card.dataset.category.split(' ').includes(category);
    card.hidden = !visible;
    if (visible) count++;
    else card.querySelector('video').pause();
  });
  document.getElementById('filter-status').textContent = `Showing ${count} demonstration${count === 1 ? '' : 's'}`;
}));

document.getElementById('copy-citation').addEventListener('click', async () => {
  const code = document.getElementById('citation-text');
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(code.textContent);
    status.textContent = 'BibTeX copied.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    status.textContent = 'Citation selected. Press Ctrl+C (or ⌘C) to copy.';
  }
});

// Enhance the result galleries; their image links remain usable without JS.
document.querySelectorAll('.result-group').forEach((group, groupIndex) => {
  const heading = group.querySelector('h3');
  const track = group.querySelector('.figure-grid');
  const slides = [...track.querySelectorAll('.figure-card')];
  if (slides.length < 2) return;

  heading.id = `result-title-${groupIndex}`;
  track.id = `result-track-${groupIndex}`;
  group.setAttribute('role', 'region');
  group.setAttribute('aria-roledescription', 'carousel');
  group.setAttribute('aria-labelledby', heading.id);
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';
  const dots = document.createElement('div');
  dots.className = 'carousel-dots';
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', 'Choose a result');
  const status = document.createElement('span');
  status.className = 'carousel-count';
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  let current = 0;
  let settleTimer;

  const render = () => {
    slides.forEach((slide, i) => { slide.tabIndex = i === current ? 0 : -1; });
    [...dots.children].forEach((dot, i) => {
      dot.setAttribute('aria-pressed', String(i === current));
    });
    status.textContent = `${current + 1} / ${slides.length}`;
  };
  const go = (index) => {
    current = (index + slides.length) % slides.length;
    render();
    track.scrollTo({
      left: current * track.clientWidth,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  };
  const arrow = (label, symbol, change) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'carousel-arrow';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-controls', track.id);
    button.textContent = symbol;
    button.addEventListener('click', () => go(current + change));
    return button;
  };
  slides.forEach((slide, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'carousel-dot';
    button.setAttribute('aria-label', `Show ${slide.querySelector('h4').textContent}`);
    button.setAttribute('aria-controls', track.id);
    button.addEventListener('click', () => go(i));
    dots.append(button);
  });
  controls.append(arrow('Previous result', '←', -1), dots, status, arrow('Next result', '→', 1));
  group.append(controls);
  group.classList.add('carousel-ready');
  track.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
      render();
    }, 150);
  }, { passive: true });
  group.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') go(0);
    else if (event.key === 'End') go(slides.length - 1);
    else go(current + (event.key === 'ArrowRight' ? 1 : -1));
    if (slides.includes(document.activeElement)) slides[current].focus({ preventScroll: true });
  });
  new ResizeObserver(() => {
    clearTimeout(settleTimer);
    track.scrollTo({ left: current * track.clientWidth, behavior: 'instant' });
  }).observe(track);
  render();
});
