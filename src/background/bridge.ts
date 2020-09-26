import * as background from '.';

export const CMD_GET_VISITED_ITEMS = 'getVisitedItems';

chrome.runtime.onMessage.addListener(({ cmd }, _, sendResponse) => {
  if (cmd === CMD_GET_VISITED_ITEMS) {
    sendResponse(background.getVisitedItems());
  }
});

export function getVisitedItems(): Promise<background.VisitedItem[]> {
  return new Promise<background.VisitedItem[]>(resolve => {
    chrome.runtime.sendMessage({
      cmd: CMD_GET_VISITED_ITEMS,
    }, resolve);
  });
}
