(async () => {
  const items = await getHistory()
  const map = getDomainMap(items)

  let lastStartTime = nextHistoryStartTime()
  let removed = false
  let active = false

  chrome.runtime.onMessage.addListener(({ cmd, params }, _, sendResponse) => {
    if (cmd === 'getDomainMap') {
      const { domain, limit } = params
      sendResponse((map[domain] || []).slice(0, limit))
    }
  })

  chrome.history.onVisitRemoved.addListener(() => {
    removed = true
  })
  chrome.tabs.onUpdated.addListener(() => {
    active = true
  })
  chrome.tabs.onRemoved.addListener(() => {
    active = true
  })

  const update = async () => {
    if (active) {
      active = false
      const newItems = await getHistory(lastStartTime)
      updateDomainMap(map, newItems, lastStartTime)
      if (removed) {
        removed = false
        lastStartTime = 0
      } else {
        lastStartTime = nextHistoryStartTime()
      }
    }
    setTimeout(update, 1000)
  }
  update()
})()

function nextHistoryStartTime() {
  return Date.now() - 1000 * 60 * 5
}

// https://developer.chrome.com/extensions/history
function getHistory(startTime = 0) {
  return new Promise((resolve, _) => {
    chrome.history.search({
      text: '',
      maxResults: 0,
      startTime
    }, resolve)
  })
}

function getDomainMap(items) {
  const map = {}
  items.forEach(item => {
    addItem(map, item)
  })
  Object.keys(map).forEach(domain => {
    uniqueDomainItems(map, domain)
  })
  return map
}

function updateDomainMap(map, items, lastStartTime) {
  if (!items.length) {
    return
  }
  removeItemsAfter(map, lastStartTime)
  const domains = {}
  for (let i = items.length - 1; i >= 0; i--) {
    domains[addItem(map, items[i], true)] = true
  }
  Object.keys(domains).forEach(domain => {
    uniqueDomainItems(map, domain)
  })
  uniqueDomainItems(map, '')
}

function removeItemsAfter(map, time) {
  Object.keys(map).forEach(domain => {
    map[domain] = map[domain].filter(item => item.lastVisitTime <= time)
  })
}

function addItem(map, item, onTop) {
  const domain = getDomain(item.url)
  const node = {
    domain,
    title: item.title.trim(),
    url: item.url,
    urlWithoutOrigin: getUrlWithoutOrigin(item.url),
    lastVisitTime: item.lastVisitTime,
    key: getKey(item.title, item.url)
  }
  const method = onTop ? 'unshift' : 'push'
  map[domain] = map[domain] || []
  map[domain][method](node)
  map[''] = map[''] || []
  map[''][method](node)
  return domain
}

function uniqueDomainItems(map, domain) {
  const keyMap = {}
  const urlMap = {}
  map[domain] = map[domain].filter(item => {
    const has = keyMap[item.key] || urlMap[item.url]
    keyMap[item.key] = true
    keyMap[item.url] = true
    return !has
  })
}

function getDomain(url) {
  return new URL(url).hostname
}

function getUrlWithoutOrigin(url) {
  return url.slice(new URL(url).origin.length) || '/'
}

function getUrlWithoutQuery(url) {
  return url.replace(/(\/)?[\?#].*$/, '')
}

function getKey(title, url) {
  return getHashCode(title + getUrlWithoutQuery(url))
}

function getHashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
