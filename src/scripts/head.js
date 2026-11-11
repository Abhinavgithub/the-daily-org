// Run in the <head> of every page, before it is first drawn (Layout.astro prints this file as it is, and lists its
// hash in the page's Content Security Policy, so the browser runs it and nothing slipped in beside it).

// Turning the page between editions. The browser animates between the old
// page and this one (see src/styles/_page-turn.scss); this decides which way.
// Each page notes its edition as it is left, and the next one compares.
(() => {
  const KEY = 'last-edition';
  const root = document.documentElement;
  const edition = root.dataset.edition || '';
  addEventListener('pagereveal', (event) => {
    const transition = event.viewTransition;
    if (!transition) return;
    let last = '';
    try {
      last = sessionStorage.getItem(KEY) || '';
    } catch {}
    // Only one edition to another is a turned page. Any other move within the paper fades from one sheet to the next.
    root.dataset.turn = !edition || !last || last === edition ? 'fade' : edition > last ? 'newer' : 'older';
    transition.finished.finally(() => delete root.dataset.turn);
  });
  const leave = () => {
    try {
      sessionStorage.setItem(KEY, edition);
    } catch {}
  };
  addEventListener('pageswap', leave);
  addEventListener('pagehide', leave);
})();

// Set before first paint so the page never flashes the wrong theme.
try {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
} catch {}
