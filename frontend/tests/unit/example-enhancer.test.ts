import { describe, it, expect, beforeEach } from 'vitest';

describe('example enhancer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section data-enhance="example">
        <h2>Features</h2>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </section>
    `;
  });

  it('should find the enhance target element', () => {
    const target = document.querySelector('[data-enhance="example"]');
    expect(target).not.toBeNull();
  });

  it('should contain list items within the section', () => {
    const items = document.querySelectorAll(
      '[data-enhance="example"] li',
    );
    expect(items).toHaveLength(2);
  });

  it('should toggle highlighted class on click', () => {
    const item = document.querySelector(
      '[data-enhance="example"] li',
    ) as HTMLElement;
    expect(item).not.toBeNull();

    item.classList.toggle('highlighted');
    expect(item.classList.contains('highlighted')).toBe(true);

    item.classList.toggle('highlighted');
    expect(item.classList.contains('highlighted')).toBe(false);
  });
});
