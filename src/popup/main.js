const MAX_ITEM_COUNT = 10000
const FAST_ITEM_COUNT = 50

const SLOW_LIST_DELAY = 100
const FILTER_DELAY = 300

const HALF_SPACE_CHARS = '【（《“‘'
const TITLE_SPLITER_REG = /(\s*[\|\-·_/]\s*)/

;(async () => {
  const { url } = await getCurrentTab()
  const domain = getDomain(url)
  const items = await getItems(domain, url)

  initList(domain, items)
  initFilter(domain)
})()

async function getItems(domain, url) {
  const items = await getHistory(domain, MAX_ITEM_COUNT)
  const tabs = await queryDomainTabs(domain)

  const urlTabMap = tabs.reduce((map, tab) => {
    map[tab.url] = tab
    return map
  }, {})
  items.forEach(item => {
    item.current = item.url === url
    item.tab = urlTabMap[item.url]
  })

  return items
}

function initList(domain, items) {
  const titleSuffix = getTitleSuffix(items.map(item => item.title))

  const listElem = document.querySelector('.list')
  const itemTemplate = document.getElementById('item-template')

  const filteredList = items.filter(item => !item.current)
  const fastList = filteredList.slice(0, FAST_ITEM_COUNT)
  const slowList = filteredList.slice(FAST_ITEM_COUNT)

  const getItemElementsFragment = list => {
    const fragment = document.createDocumentFragment()
    list.forEach(item => {
      const itemBox = itemTemplate.content.cloneNode(true)
      const itemElem = itemBox.querySelector('.item')
      const titleElem = itemElem.querySelector('.title')
      const timeElem = itemElem.querySelector('.time')
      const urlElem = itemElem.querySelector('.url')

      const time = new Date(item.lastVisitTime)
      const title = (domain
        ? removeTitleSuffix(item.title, titleSuffix)
        : item.title
      ) || chrome.i18n.getMessage('noTitle')
      const url = domain ? item.urlWithoutOrigin : item.url

      titleElem.textContent = title
      if (HALF_SPACE_CHARS.indexOf((title.slice(0, 1))) !== -1) {
        titleElem.style.marginLeft = '-0.5em'
      }

      timeElem.textContent = dateFromNow(time)
      timeElem.title = time.toLocaleString()

      urlElem.textContent = url === '/' ? item.domain : getUrlForShowing(url)

      itemElem.title = item.title + '\n' + getUrlForShowing(item.url)
      itemElem.dataset.url = item.url
      itemElem.dataset.tabIndex = item.tab ? item.tab.index : ''
      itemElem.dataset.tabWindowId = item.tab ? item.tab.windowId : ''
      itemElem.dataset.filter = title.toLowerCase() + item.domain
      if (item.tab) {
        itemElem.classList.add('alive')
      }

      fragment.appendChild(itemElem)
    })
    return fragment
  }

  listElem.appendChild(getItemElementsFragment(fastList))
  setTimeout(() => {
    listElem.appendChild(getItemElementsFragment(slowList))
    listElem.classList.add('loaded')
    listElem.style.height = listElem.getBoundingClientRect().height + 'px'
  }, SLOW_LIST_DELAY)

  listElem.addEventListener('click', ({ target }) => {
    const itemElem = target.closest('.item')
    if (!itemElem) {
      return
    }
    if (itemElem.dataset.tabIndex) {
      chrome.tabs.highlight({
        tabs: +itemElem.dataset.tabIndex,
        windowId: +itemElem.dataset.tabWindowId
      })
      window.close()
    } else {
      chrome.tabs.create({
        url: itemElem.dataset.url
      })
    }
  }, true)

  const emptyElem = document.querySelector('.empty-item')
  emptyElem.textContent = chrome.i18n.getMessage('noBrowsingHistory')

  if (!filteredList.length) {
    document.body.classList.add('empty')
  }
}

function initFilter(domain) {
  const filterStyle = document.createElement('style')
  document.head.appendChild(filterStyle)

  const filterInput = document.querySelector('.filter-input')
  const placeholder = domain
    ? chrome.i18n.getMessage('filter') + ' ' + domain
    : chrome.i18n.getMessage('filterItems')
  filterInput.setAttribute('placeholder', placeholder)

  const listElem = document.querySelector('.list')
  const filterItems = debounce(value => {
    listElem.scrollTop = 0
    if (value) {
      filterStyle.innerHTML = '.list .item:not([data-filter*="'+ value +'"]) { height: 0; padding: 0 }'
    } else {
      filterStyle.innerHTML = ''
    }
  }, FILTER_DELAY)
  filterInput.addEventListener('input', () => {
    const value = filterInput.value.trim().toLowerCase()
    filterItems(value)
  })

  filterInput.addEventListener('click', () => {
    filterInput.classList.add('clicked')
  })

  filterInput.focus()
}

function getHistory(domain, limit) {
  return new Promise((resolve, _) => {
    chrome.runtime.sendMessage({
      cmd: 'getDomainMap',
      params: { domain, limit }
    }, resolve)
  })
}

function getCurrentTab() {
  return new Promise((resolve, _) => {
    chrome.tabs.query({
      currentWindow: true,
      active: true
    }, tabs => resolve(tabs[0]))
  })
}

// https://developer.chrome.com/extensions/tabs
function queryDomainTabs(domain) {
  return new Promise((resolve, _) => {
    chrome.tabs.query({
      currentWindow: true,
      url: domain ? `*://${domain}/*` : '<all_urls>'
    }, resolve)
  })
}

function getDomain(url) {
  return (!url || /^chrome/.test(url)) ? '' : new URL(url).hostname
}

function dateFromNow(date) {
  const diff = Date.now() - date.getTime()
  if (diff >= 1000 * 60 * 60 * 24) {
    return prefixZero(date.getMonth() + 1, 2) + '-' + prefixZero(date.getDate(), 2)
  }
  if (diff >= 1000 * 60 * 60) {
    return Math.floor(diff / (1000 * 60 * 60)) + ' ' + chrome.i18n.getMessage('hoursAgo')
  }
  if (diff >= 1000 * 60) {
    return Math.floor(diff / (1000 * 60)) + ' ' + chrome.i18n.getMessage('minutesAgo')
  }
  return chrome.i18n.getMessage('justNow')
}

function prefixZero(val, size) {
  return (Array(size).join(0) + val).slice(-size)
}

function getUrlForShowing(url) {
  try {
    return decodeURIComponent(url).replace(/\n/g, ' ')
  } catch {
    return url
  }
}

function getTitleSuffix(titles) {
  const suffixes = {}
  titles.forEach(title => {
    const parts = title.split(TITLE_SPLITER_REG)
    for (let i = 2; i < parts.length; i += 2) {
      const suffix = parts.slice(-i).join('')
      suffixes[suffix] = (suffixes[suffix] || 0) + 1
    }
  })
  const suffix = Object.keys(suffixes)
    .filter(suffix => suffixes[suffix] > titles.length / 2)
    .reduce((max, suffix) => suffix.length > max.length ? suffix : max, '')
  return suffix
}

function removeTitleSuffix(title, suffix) {
  if (title.length <= suffix.length || !suffix.length) {
    return title
  }
  if (title.endsWith(suffix)) {
    return title.slice(0, -suffix.length)
  }
  return title
}

function debounce(fn, delay) {
  let id = 0
  return (...args) => {
    clearTimeout(id)
    id = setTimeout(() => fn.apply(null, args), delay)
  }
}
