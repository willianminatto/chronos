/**
 * Position of an element inside a positioned ancestor, from layout offsets.
 * Unlike `getBoundingClientRect`, it ignores transforms, so it stays correct
 * while the element or the ancestor is being animated or pinned.
 */
export function offsetWithin(element: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: Element | null = element;

  while (node instanceof HTMLElement && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }

  return { x, y };
}
