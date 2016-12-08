function expect (message, actual, expected) { console.log(actual === expected ? "√" : "X", message || "", actual, expected) }

const makeLRU = require("./source")

var lru = makeLRU()
expect("length when empty", lru.length(), 0)
expect("get non-existent key", lru.get("a"), undefined)

var value = lru.set("a", "A")
expect("set returns value", value, "A")
expect("length increments after adding key", lru.length(), 1)
expect("get existing key", lru.get("a"), "A")
lru.set("a", "aa")
expect("length unchanged after adding existing same key", lru.length(), 1)
expect("can replace value", lru.get("a"), "aa")

value = lru.remove("a")
expect("remove returns value", value, "aa")
expect("length decrements after removing key", lru.length(), 0)
expect("get removed key", lru.get("a"), undefined)

lru.remove("a")
expect("length does not decrement if no key to remove", lru.length(), 0)

lru.set("a", "A")
lru.set("b", "B")
lru.clear()
expect("clear deletes keys", lru.get("a"), undefined)
expect("clear resets length", lru.length(), 0)

var peekCbLru = makeLRU()
var callbackValue
peekCbLru.on("set", function (key, value) { callbackValue = value })
peekCbLru.clear()
peekCbLru.set("a", "A")
expect("clear does not remove listeners", callbackValue, "A")

var smallLru = makeLRU({max: 2})
smallLru.set("a", "A")
smallLru.set("b", "B")
smallLru.get("a")
smallLru.set("c", "C")
expect("max size never exceeded", smallLru.length(), 2)
expect("least recently used key expired when max size exceeded", smallLru.get("b"), undefined)
expect("get marks key recently used", smallLru.get("a"), "A")

smallLru = makeLRU({max: 2})
smallLru.set("a", "A")
smallLru.set("b", "B")
smallLru.peek("a")
smallLru.set("c", "C")
expect("peek does not change most recently used", smallLru.get("a"), undefined)
