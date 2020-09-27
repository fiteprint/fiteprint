import { CMD_GET_VISITED_ITEMS, VisitedItem } from '.';

export function getVisitedItems(): Promise<VisitedItem[]> {
  return new Promise<VisitedItem[]>(resolve => {
    chrome.runtime.sendMessage({
      cmd: CMD_GET_VISITED_ITEMS,
    }, resolve);
  });
}
