// Runs in the browser. The exact figure behind a bar, shown beside it on hover
// and on keyboard focus. A mark opts in with `data-tip` (the figure) and
// `data-tip-label` (what it is).

export function tips(): void {
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.setAttribute('role', 'status');
  tip.hidden = true;
  const value = document.createElement('b');
  const name = document.createElement('span');
  tip.append(value, name);
  document.body.append(tip);

  function show(mark: HTMLElement) {
    value.textContent = mark.dataset.tip ?? '';
    name.textContent = mark.dataset.tipLabel ?? '';
    tip.hidden = false;
    const box = mark.getBoundingClientRect();
    const width = tip.offsetWidth;
    const left = Math.min(Math.max(8, box.left + box.width / 2 - width / 2), innerWidth - width - 8);
    const above = box.top - tip.offsetHeight - 8;
    tip.style.left = `${left + scrollX}px`;
    tip.style.top = `${(above < 8 ? box.bottom + 8 : above) + scrollY}px`;
  }
  const hide = () => (tip.hidden = true);
  const markAt = (target: EventTarget | null) => (target instanceof Element ? target.closest<HTMLElement>('[data-tip]') : null);
  const over = (event: Event) => {
    const mark = markAt(event.target);
    if (mark) show(mark);
    else hide();
  };

  document.addEventListener('pointerover', over);
  document.addEventListener('focusin', over);
  document.addEventListener('focusout', hide);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide();
  });
  addEventListener('scroll', hide, { passive: true });
}
