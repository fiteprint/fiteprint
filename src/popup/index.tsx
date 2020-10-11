import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { getUrlDomain, isChromeUrl } from 'common/url';
import App from './App';
import './ga';
import './style.css';

(async() => {
  const tab = await getCurrentTab();
  const domain = getDomain(tab.url);
  ReactDOM.render(
    <App domain={domain} />,
    document.getElementById('app')
  );
})();

function getCurrentTab(): Promise<chrome.tabs.Tab> {
  return new Promise(resolve => {
    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, tabs => resolve(tabs[0]));
  });
}

function getDomain(url: string): string {
  return isChromeUrl(url) ? '' : getUrlDomain(url);
}
