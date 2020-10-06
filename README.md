<div style="text-align: center">
  <img alt="icon" src="assets/icon.png" width=100>
  <div>
    <a href="https://chrome.google.com/webstore/detail/aifnngnkjcdamfofbfldbnighkjkkmbp">
      <img alt="Web Store" src="https://img.shields.io/chrome-web-store/v/aifnngnkjcdamfofbfldbnighkjkkmbp?color=blue&label=Chrome%20Web%20Store&style=flat-square">
    </a>
    <a href="https://chrome.google.com/webstore/detail/aifnngnkjcdamfofbfldbnighkjkkmbp">
      <img alt="Web Store" src="https://img.shields.io/chrome-web-store/users/aifnngnkjcdamfofbfldbnighkjkkmbp?color=important&label=Users&style=flat-square">
    </a>
    <a href="https://github.com/fiteprint/fiteprint/actions">
      <img alt="CI" src="https://img.shields.io/github/workflow/status/fiteprint/fiteprint/CI/dev?label=CI&style=flat-square">
    </a>
    <a href="https://github.com/fiteprint/fiteprint/graphs/contributors">
      <img alt="Make with Love" src="https://img.shields.io/static/v1?label=Make%20with&message=Love&color=critical&style=flat-square">
    </a>
  </div>
</div>

## Introduction

Fiteprint is a Chrome browser extension that helps you quickly access context-based history. When you are browsing a website, just click on the icon of this extension to view the history of the current site (don't forget to pin it to the top right corner of browser), if it's a blank new tab, it will show the history of all sites.

The list items display information including title, time, and url, which you can filter by simply typing in keywords.

You can go to [chrome://extensions/shortcuts](chrome://extensions/shortcuts) and set a shortcut for this extension (e.g. Ctrl + Shift + 8) to summon the history list via shortcut keys, then use the following keystrokes:

- Select previous: ArrowUp
- Select next: ArrowDown
- Quickly jump upwards: Shift + ArrowUp
- Quickly jump down: Shift + ArrowDown
- Open: Enter
- Force open in a new tab: Shift + Enter

Hope you enjoy it!

## Screenshot

<div style="text-align: center">
  <img alt="screenshot" src="assets/screenshot.png" width=640>
</div>

## Development

This project uses a very common technology stack: [webpack](https://webpack.js.org/) + [TypeScript](https://www.typescriptlang.org/) + [React](https://reactjs.org/). If you're a front-end engineer, you probably already know how to get started:

```bash
yarn dev

yarn build

yarn test

yarn lint
```
New PR is always welcomed!
