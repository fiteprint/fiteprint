import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

import { getVisitedItems, updateMode, isStrictMode } from 'background/bridge';
import VisitedItemList, { ItemData } from './components/VisitedItemList';
import FilterBar from './components/FilterBar';

interface Props {
  domain: string;
}

const TITLE_SPLITER_REG = /(\s*[|\-·_/]\s*)/;
const FILTER_DELAY = 300;
const MAX_HEIGHT = 557;

const Placeholder = styled.div`
  height: ${MAX_HEIGHT}px;
`;

export default function App({ domain }: Props): JSX.Element {
  const [items, setItems] = useState<ItemData[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStrict, setIsStrict] = useState(true);

  const init = useCallback(async() => {
    const [visitedItems, tabs, strict] = await Promise.all([
      getVisitedItems(domain),
      getAllTabs(),
      isStrictMode(domain),
    ]);
    const tabMap = tabs.reduce((m: {[key: string]: chrome.tabs.Tab}, tab) => {
      m[tab.url] = tab;
      return m;
    }, {});
    const highlightedTab = tabs.find(tab => tab.highlighted);
    const titles = visitedItems.map(item => item.title);
    const suffix = domain ? getTitleSuffix(titles) : '';
    const items = visitedItems
      .filter(item => item.url !== highlightedTab?.url)
      .map(item => Object.assign({}, item, {
        shortTitle: removeTitleSuffix(item.title, suffix),
        shortUrl: getShortUrl(item.url, domain),
        tabIndex: tabMap[item.url] ? tabMap[item.url].index : -1,
      }));
    setItems(items);
    setFilteredItems(items);
    setLoading(false);
    setIsStrict(strict);
  }, []);

  useEffect(() => {
    init();
  }, []);

  const handleInput = debounce((value: string) => {
    setFilteredItems(filterItems(items, value));
  }, FILTER_DELAY);

  const handleSwitchMode = async() => {
    await updateMode(domain, !isStrict);
    init();
  };

  return (
    <>
      {!loading &&
        <VisitedItemList
          items={filteredItems}
          total={items.length}
          domain={domain}
        />
      }
      {!loading && items.length > 0 &&
        <FilterBar
          domain={domain}
          isStrict={isStrict}
          canSwitchMode={!!domain}
          onSwitchMode={handleSwitchMode}
          onInput={handleInput} />
      }
      {loading && !domain &&
        <Placeholder />
      }
    </>
  );
}

function filterItems(items: ItemData[], value: string): ItemData[] {
  const keywords = value.toLowerCase().trim().split(/\s+/);
  if (!keywords.length) {
    return items;
  }
  return items.filter(item => {
    const title = item.shortTitle.toLowerCase();
    const url = item.shortUrl.toLowerCase();
    for (const keyword of keywords) {
      if (!title.includes(keyword) && !url.includes(keyword)) {
        return false;
      }
    }
    return true;
  });
}

function getAllTabs(): Promise<chrome.tabs.Tab[]> {
  return new Promise(resolve => {
    chrome.tabs.query({
      currentWindow: true,
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

function getShortUrl(url: string, domain: string): string {
  return url.replace(/^.*?\/\/(www\.)?|\/$/g, '') || domain;
}

function debounce(fn: (...args: any[]) => void, delay: number) {
  let id = 0;
  return (...args: any[]) => {
    clearTimeout(id);
    id = window.setTimeout(() => fn(...args), delay);
  };
}
