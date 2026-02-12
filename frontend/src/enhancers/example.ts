/**
 * Example progressive enhancement script.
 *
 * Finds elements with `data-enhance="example"` and adds interactive
 * behavior on top of the server-rendered markup. The page works
 * fully without this script — JavaScript only enhances the experience.
 */

function enhance(root: HTMLElement): void {
  const list = root.querySelector('ul');
  if (!list) return;

  const items = list.querySelectorAll('li');
  items.forEach((item) => {
    item.addEventListener('click', () => {
      item.classList.toggle('highlighted');
    });
  });

  root.dataset['enhanced'] = 'true';
}

function init(): void {
  const targets = document.querySelectorAll<HTMLElement>(
    '[data-enhance="example"]',
  );
  targets.forEach(enhance);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
