import { getHashCode } from 'common/string';
import { getUrlDomain, getUrlWithPathOnly, getMainDomain } from 'common/url';

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

export interface UpdateModeParams {
  domain: string;
  isStrict: boolean;
}

export interface IsStrictModeParams {
  domain: string;
}

export const CMD_GET_VISITED_ITEMS = 'getVisitedItems';
export const CMD_UPDATE_MODE = 'updateMode';
export const CMD_IS_STRICT_MODE = 'isStrictMode';

const UPDATE_INTERVAL = 1000;
const REFRESH_DURATION = 1000 * 60 * 5;

const LOOSE_MODE_DOMAINS_KEY = 'looseModeDomains';
const LOOSE_MODE_DOMAINS_LIMIT = 100;

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
  (msg: Message<any>, _, sendResponse) => {
    if (msg.cmd === CMD_GET_VISITED_ITEMS) {
      const { domain, limit } = msg.params as GetVisitedItemsParams;
      getVisitedItems(domain, limit).then(sendResponse);
      return true;
    }
    if (msg.cmd === CMD_UPDATE_MODE) {
      const { domain, isStrict } = msg.params as UpdateModeParams;
      updateMode(domain, isStrict).then(sendResponse);
      return true;
    }
    if (msg.cmd === CMD_IS_STRICT_MODE) {
      const { domain } = msg.params as IsStrictModeParams;
      isStrictMode(domain).then(sendResponse);
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
      if (!newKeyItemMap[item.key] && !newUrlItemMap[item.url]) {
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
    if (await isStrictMode(domain)) {
      items = items.filter(item => item.domain === domain);
    } else {
      const tail = '.' + getMainDomain(domain);
      items = items.filter(item => item.domain === domain || item.domain.endsWith(tail));
    }
  }
  if (limit) {
    items = items.slice(0, limit);
  }
  return items;
}

async function updateMode(domain: string, isStrict: boolean) {
  const mainDomain = getMainDomain(domain);
  const looseModeDomains = await getConfig(LOOSE_MODE_DOMAINS_KEY) || [];
  let domains = [];
  if (isStrict) {
    domains = looseModeDomains.filter((domain: string) => domain != mainDomain);
  } else {
    if (!looseModeDomains.includes(mainDomain)) {
      domains = [mainDomain, ...looseModeDomains];
    }
  }
  domains = domains.slice(0, LOOSE_MODE_DOMAINS_LIMIT - 1);
  await setConfig(LOOSE_MODE_DOMAINS_KEY, domains);
}

async function isStrictMode(domain: string): Promise<boolean> {
  const mainDomain = getMainDomain(domain);
  const looseModeDomains = await getConfig(LOOSE_MODE_DOMAINS_KEY) || [];
  return !looseModeDomains.includes(mainDomain);
}

async function setConfig(key: string, value: any) {
  return new Promise<void>(resolve => {
    chrome.storage.sync.set({ [key]: value }, () => resolve());
  });
}

async function getConfig(key: string): Promise<any> {
  return new Promise<any>(resolve => {
    chrome.storage.sync.get([key], res => resolve(res[key]));
  });
}
