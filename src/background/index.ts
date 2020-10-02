import { getHashCode } from 'common/string';
import { getUrlDomain, getUrlWithPathOnly } from 'common/url';

export interface VisitedItem {
  key: number;
  domain: string;
  title: string;
  url: string;
  lastVisitTime: number;
}

export interface Message<T> {
  cmd: string;
  params?: T;
}

export interface GetVisitedItemsParams {
  domain?: string;
  limit?: number;
}

export const CMD_GET_VISITED_ITEMS = 'getVisitedItems';

const UPDATE_INTERVAL = 1000;
const REFRESH_DURATION = 1000 * 60 * 5;

let visitedItems: VisitedItem[] = [];
let startTime = 0;
let removed = false;
let active = true;

chrome.history.onVisitRemoved.addListener(() => {
  removed = true;
  active = true;
});
chrome.history.onVisited.addListener(() => {
  active = true;
});
chrome.tabs.onUpdated.addListener(() => {
  active = true;
});

chrome.runtime.onMessage.addListener(
  ({ cmd, params }: Message<GetVisitedItemsParams>, _, sendResponse) => {
    if (cmd === CMD_GET_VISITED_ITEMS) {
      getVisitedItems(params.domain, params.limit).then(sendResponse);
      return true;
    }
  }
);

const update = async() => {
  if (active) {
    active = false;
    await refreshVistedItems(startTime);
    startTime = removed ? 0 : (Date.now() - REFRESH_DURATION);
    removed = false;
  }
  setTimeout(update, UPDATE_INTERVAL);
};
update();

async function refreshVistedItems(startTime: number) {
  const newItems = await getHistory(startTime);
  const newKeyItemMap: { [key: number]: VisitedItem } = {};
  const newUrlItemMap: { [key: string]: VisitedItem } = {};
  for (const item of newItems) {
    newKeyItemMap[item.key] = item;
    newUrlItemMap[item.url] = item;
  }
  const finalItems: VisitedItem[] = [];
  for (const item of newItems) {
    if (item === newKeyItemMap[item.key]) {
      finalItems.push(item);
    }
  }
  if (startTime) {
    for (const item of visitedItems) {
      if (!newUrlItemMap[item.url]) {
        finalItems.push(item);
      }
    }
  }
  visitedItems = finalItems;
}

function getHistory(startTime: number): Promise<VisitedItem[]> {
  return new Promise<VisitedItem[]>(resolve => {
    chrome.history.search({
      text: '',
      maxResults: 0,
      startTime,
    }, items => resolve(items.map(toVisitedItem)));
  });
}

function toVisitedItem(item: chrome.history.HistoryItem): VisitedItem {
  return {
    key: getHashCode(item.title + getUrlWithPathOnly(item.url)),
    domain: getUrlDomain(item.url),
    title: item.title,
    url: item.url,
    lastVisitTime: item.lastVisitTime,
  };
}

async function getVisitedItems(domain?: string, limit?: number): Promise<VisitedItem[]> {
  let items = visitedItems;
  if (domain) {
    items = items.filter(item => item.domain === domain);
  }
  if (limit) {
    items = items.slice(0, limit);
  }
  return items;
}
