module.exports = makeLRU
function makeLRU (userOptions) {
  var lruLength = 0
  var keysToLinks = {}
  var leastRecentLink
  var mostRecentLink
  var eventsToCallbacks = {}
  userOptions = userOptions || {}
  var options = {
    expiryIfUnused: userOptions.expiryIfUnused || Infinity,
    max: userOptions.max || 1000,
  }

  var lru = {
    clear: clear,
    get: get,
    length: length,
    on: on,
    peek: peek,
    remove: remove,
    set: set,
    _debug: _debug
  }
  return lru

  // Methods

  function clear () {
    keysToLinks = {}
    leastRecentLink = null
    lruLength = 0
    mostRecentLink = null
    trigger("clear")
  }

  function get (key) {
    var link = keysToLinks[key]
    var keyExists = Boolean(link)
    if (keyExists) {
      var expired = link.lastUsedAt + options.expiryIfUnused < Date.now()
      if (expired) {
        remove(link)
        link = undefined
      } else {
        makeMostRecent(link)
      }
    }
    var value = link && link.value
    trigger("get", key, value)
    return value
  }

  function length () {
    trigger("peek", undefined, lruLength)
    return lruLength
  }

  function on (event, callback) {
    if (!eventsToCallbacks[event]) {
      eventsToCallbacks[event] = []
    }
    eventsToCallbacks[event].push(callback)
    // TODO return something to let the user unsubscribe
  }

  function peek (key) {
    var value = keysToLinks[key] && keysToLinks[key].value
    trigger("peek", key, value)
    return value
  }

  function remove (key) {
    var link = keysToLinks[key]
    var value = link && link.value
    var keyExists = Boolean(link)
    if (keyExists) {
      delete keysToLinks[key]
      removeLinkFromList(link)
      lruLength = lruLength - 1
    }
    trigger("remove", key, value)
    return value
  }

  function set (key, value) {
    var link = keysToLinks[key]
    var keyExists = Boolean(link)
    if (!keyExists) {
      link = makeLink(key)
      keysToLinks[key] = link
      lruLength = lruLength + 1
    }
    if (!leastRecentLink) {
      leastRecentLink = link
    }
    makeMostRecent(link)
    if (lruLength > options.max) {
      remove(leastRecentLink.key)
    }
    link.value = value
    trigger("set", key, value)
    return value
  }

  // Helpers

  function trigger (event, key, value) {
    if (eventsToCallbacks[event]) {
      eventsToCallbacks[event].forEach(callback => callback(key, value))
    }
  }

  function makeMostRecent (link) {
    link.lastUsedAt = Date.now()
    removeLinkFromList(link)
    addLinkToHead(link)
  }

  function removeLeastRecent () {
    delete keysToLinks[leastRecentLink.key]
    removeLinkFromList(leastRecentLink)
  }

  function makeLink (key) {
    return {
      key: key,
      lessRecent: null,
      moreRecent: null,
      value: null,
      lastUsedAt: Date.now(),
    }
  }

  function addLinkToHead (link) {
    if (mostRecentLink) {
      link.lessRecent = mostRecentLink
      mostRecentLink.moreRecent = link
      mostRecentLink = link
    } else {
      mostRecentLink = link
      leastRecentLink = link
    }
  }

  function removeLinkFromList (link) {
    var less = link.lessRecent
    var more = link.moreRecent
    if (link === leastRecentLink) { leastRecentLink = more }
    if (link === mostRecentLink) { mostRecentLink = less }
    if (less) { less.moreRecent = more }
    if (more) { more.lessRecent = less }
  }

  function _debug () {
    return {
      keysToLinks: keysToLinks,
      lruLength: lruLength,
      leastRecentLink: leastRecentLink && leastRecentLink.key,
      mostRecentLink: mostRecentLink && mostRecentLink.key,
      eventsToCallbacks: eventsToCallbacks,
      options: options,
    }
  }
}
