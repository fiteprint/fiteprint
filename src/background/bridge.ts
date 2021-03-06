import {
  CMD_GET_VISITED_ITEMS,
  CMD_UPDATE_MODE,
  CMD_IS_STRICT_MODE,
  VisitedItem,
  Message,
  GetVisitedItemsParams,
  UpdateModeParams,
  IsStrictModeParams,
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

export function updateMode(domain: string, isStrict: boolean): Promise<void> {
  return new Promise<void>(resolve => {
    const msg: Message<UpdateModeParams> = {
      cmd: CMD_UPDATE_MODE,
      params: { domain, isStrict },
    };
    chrome.runtime.sendMessage(msg, resolve);
  });
}

export function isStrictMode(domain: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    const msg: Message<IsStrictModeParams> = {
      cmd: CMD_IS_STRICT_MODE,
      params: { domain },
    };
    chrome.runtime.sendMessage(msg, resolve);
  });
}
