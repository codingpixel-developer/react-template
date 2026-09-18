import type { DropdownOption } from './dropdownTypes';

export function getDropdownOptions<T extends DropdownOption>(
  pages: readonly (readonly T[])[],
  selectedItem?: T | null,
  search = '',
): T[] {
  const firstPage = pages[0] ?? [];
  const pinned =
    selectedItem && !firstPage.some((item) => item.id === selectedItem.id);
  const seen = new Set<string | number>();
  const options: T[] = [];
  if (pinned) {
    options.push(selectedItem);
    seen.add(selectedItem.id);
  }
  const term = search.trim().toLocaleLowerCase();
  for (const page of pages) {
    for (const item of page) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      if (
        item.id === selectedItem?.id ||
        item.label.toLocaleLowerCase().includes(term)
      ) {
        options.push(item.id === selectedItem?.id ? selectedItem : item);
      }
    }
  }
  return options;
}
