# About
This is a **Least-Recently Used cache** with **event hooks** and an optional **expiry** mode that removes keys if they aren't used within the specified time.

# Install
```shell
npm install --save lru-events
```
# Use
```js
var makeLRU = require("lru-events")
var lru = makeLRU()
var smallLru = makeLRU({max: 2})
var lruWithOptions = makeLRU({max: 2, expiryIfUnused: 5*60*1000})

smallLru.set("a", "A")
smallLru.set("b", "B")
smallLru.get("a") // "A"
smallLru.set("c", "C")
smallLru.get("a") // "A"
smallLru.get("b") // undefined
smallLru.get("c") // "C"
```
# API
```haskell
clear :: () -> () -- does not clear event handlers; event callback takes no args.
get :: Key -> Value
length :: () -> Int -- event callback takes length.
on :: String -> (Key -> Value -> ()) -- callbacks generally take Key and Value args.
peek :: Key -> Value -- does not change recently used order or expiry times
remove :: Key -> Value
set :: Key -> Value  -> Value
```

# Defaults
```js
options = {
  max: 1000, // number of items before the least-recently used gets evicted.
  expiryIfUnused: Infinity // in milliseconds
}
```
