import {
  CMD_GET_VISITED_ITEMS,
  VisitedItem,
  Message,
  GetVisitedItemsParams,
} from '.';

export function getVisitedItems(domain?: string, limit?: number): Promise<VisitedItem[]> {
  return new Promise<VisitedItem[]>(resolve => {
    const msg: Message<GetVisitedItemsParams> = {
      cmd: CMD_GET_VISITED_ITEMS,
      params: { domain, limit },
    };
    chrome.runtime.sendMessage(msg, resolve);
  });
}
