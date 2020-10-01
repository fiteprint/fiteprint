import React, { useState, useEffect, useCallback } from 'react';

import { getUrlDomain, isChromeUrl } from 'common/url';
import { getVisitedItems } from 'background/bridge';
import VisitedItemList, { ItemData } from './components/VisitedItemList';

export default function App(): JSX.Element {
  const [items, setItems] = useState<ItemData[]>([]);
  const [shouldShowIcon, setShouldShowIcon] = useState(false);

  const init = useCallback(async() => {
    const tab = await getCurrentTab();
    const domain = getDomain(tab.url);
    const visitedItems = await getVisitedItems(domain);
    const tabs = await getDomainTabs(domain);
    const tabMap = tabs.reduce((m: {[key: string]: chrome.tabs.Tab}, tab) => {
      m[tab.url] = tab;
      return m;
    }, {});
    const items = visitedItems
      .filter(item => item.url !== tab.url)
      .map(item => Object.assign({}, item, {
        tabIndex: tabMap[item.url] ? tabMap[item.url].index : -1,
      }));
    setItems(items);
    setShouldShowIcon(!domain);
  }, []);

  useEffect(() => {
    init();
  }, []);

  return (
    <VisitedItemList items={items} showIcon={shouldShowIcon} />
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
