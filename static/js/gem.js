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
