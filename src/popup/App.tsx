import React, { useState, useEffect, useCallback } from 'react';

import { getUrlDomain, isChromeUrl, getUrlWithoutOrigin } from 'common/url';
import { getVisitedItems } from 'background/bridge';
import VisitedItemList, { ItemData } from './components/VisitedItemList';
import FilterBar from './components/FilterBar';

const TITLE_SPLITER_REG = /(\s*[|\-·_/]\s*)/;
const FILTER_DELAY = 300;

export default function App(): JSX.Element {
  const [items, setItems] = useState<ItemData[]>([]);
  const [filterItems, setFilterItems] = useState<ItemData[]>([]);
  const [shouldShowIcon, setShouldShowIcon] = useState(false);
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(true);

  const init = useCallback(async() => {
    const tab = await getCurrentTab();
    const domain = getDomain(tab.url);
    const visitedItems = await getVisitedItems(domain);
    const tabs = await getDomainTabs(domain);
    const tabMap = tabs.reduce((m: {[key: string]: chrome.tabs.Tab}, tab) => {
      m[tab.url] = tab;
      return m;
    }, {});
    const titles = visitedItems.map(item => item.title);
    const suffix = domain ? getTitleSuffix(titles) : '';
    const items = visitedItems
      .filter(item => item.url !== tab.url)
      .map(item => Object.assign({}, item, {
        shortTitle: removeTitleSuffix(item.title, suffix),
        shortUrl: (domain ? getUrlWithoutOrigin(item.url): item.url) || domain,
        tabIndex: tabMap[item.url] ? tabMap[item.url].index : -1,
      }));
    setItems(items);
    setFilterItems(items);
    setShouldShowIcon(!domain);
    setDomain(domain);
    setLoading(false);
  }, []);

  useEffect(() => {
    init();
  }, []);

  const handleInput = debounce((value: string) => {
    const keyword = value.toLowerCase();
    if (keyword) {
      setFilterItems(items.filter(item =>
        item.shortTitle.toLowerCase().includes(keyword)
        || item.shortUrl.toLowerCase().includes(keyword)
      ));
    } else {
      setFilterItems(items);
    }
  }, FILTER_DELAY);

  return (
    <>
      {!loading &&
        <VisitedItemList
          items={filterItems}
          total={items.length}
          showIcon={shouldShowIcon}
        />
      }
      {!loading && items.length > 0 &&
        <FilterBar
          domain={domain}
          onInput={handleInput}
        />
      }
    </>
  );
}

function getDomain(url: string): string {
  return isChromeUrl(url) ? '' : getUrlDomain(url);
}

function getCurrentTab(): Promise<chrome.tabs.Tab> {
  return new Promise(resolve => {
    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, tabs => resolve(tabs[0]));
  });
}

function getDomainTabs(domain: string): Promise<chrome.tabs.Tab[]> {
  return new Promise(resolve => {
    chrome.tabs.query({
      currentWindow: true,
      url: domain ? `*://${domain}/*` : '<all_urls>',
    }, resolve);
  });
}

function getTitleSuffix(titles: string[]): string {
  const suffixCountMap: { [key: string]: number } = {};
  titles.forEach(title => {
    const parts = title.split(TITLE_SPLITER_REG);
    for (let i = 2; i < parts.length; i += 2) {
      const suffix = parts.slice(-i).join('');
      suffixCountMap[suffix] = (suffixCountMap[suffix] || 0) + 1;
    }
  });
  const suffix = Object.keys(suffixCountMap)
    .filter(suffix => suffixCountMap[suffix] > titles.length / 2)
    .reduce((max, suffix) => suffix.length > max.length ? suffix : max, '');
  return suffix;
}

function removeTitleSuffix(title: string, suffix: string): string {
  if (title.length <= suffix.length || !suffix.length) {
    return title;
  }
  if (title.endsWith(suffix)) {
    return title.slice(0, -suffix.length);
  }
  return title;
}

function debounce(fn: (...args: any[]) => void, delay: number) {
  let id = 0;
  return (...args: any[]) => {
    clearTimeout(id);
    id = window.setTimeout(() => fn(...args), delay);
  };
}
