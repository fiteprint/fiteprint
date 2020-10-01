import React, { useState, useEffect, useCallback } from 'react';

import { getUrlDomain, isChromeUrl } from 'common/url';
import { getVisitedItems } from 'background/bridge';
import VisitedItemList from './components/VisitedItemList';

export default function App(): JSX.Element {
  const [items, setItems] = useState([]);
  const [shouldShowIcon, setShouldShowIcon] = useState(false);

  const init = useCallback(async() => {
    const tab = await getCurrentTab();
    const domain = isChromeUrl(tab.url) ? '' : getUrlDomain(tab.url);
    setShouldShowIcon(!domain);
    setItems(await getVisitedItems(domain));
  }, []);

  useEffect(() => {
    init();
  }, []);

  return (
    <VisitedItemList items={items} showIcon={shouldShowIcon} />
  );
}

function getCurrentTab(): Promise<chrome.tabs.Tab> {
  return new Promise(resolve => {
    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, tabs => resolve(tabs[0]));
  });
}
