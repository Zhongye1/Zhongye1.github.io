---
uuid: 39948050-e142-11f0-8dff-b364c748d078
title: 2025-11-27-JavaScript 实现哈希表
mathjax: true
abbrlink: 39960
published: 2025-11-27 11:31:39
category: 数据结构
tags:
    - 数据结构
    - 哈希表
    - JavaScript
---

# JavaScript 实现哈希表

**哈希表**（Hash Table，散列表）是一种通过键（Key）直接访问值（Value）的数据结构，通过哈希函数将键映射到表中的位置

### 哈希函数

```ts
// 简单的哈希函数示例
function hashString(key, tableSize) {
  let hash = 17;
  for (let i = 0; i < key.length; i++) {
    hash = (13 * hash * key.charCodeAt(i)) % tableSize;
  }
  return hash;
}
```

## 用 JavaScript 实现哈希表

```js
class HashTable {
  constructor(size = 53) {
    this.keyMap = new Array(size);
  }

  // 哈希函数
  _hash(key) {
    let total = 0;
    const PRIME = 31;
    const MAX_LENGTH = 100;

    for (let i = 0; i < Math.min(key.length, MAX_LENGTH); i++) {
      const char = key[i];
      const value = char.charCodeAt(0) - 96; // a=1, b=2...
      total = (total * PRIME + value) % this.keyMap.length;
    }
    return total;
  }

  // 插入键值对
  set(key, value) {
    const index = this._hash(key);

    if (!this.keyMap[index]) {
      this.keyMap[index] = [];
    }

    // 检查键是否已存在，存在则更新
    for (let i = 0; i < this.keyMap[index].length; i++) {
      if (this.keyMap[index][i][0] === key) {
        this.keyMap[index][i][1] = value;
        return;
      }
    }

    this.keyMap[index].push([key, value]);
  }

  // 获取值
  get(key) {
    const index = this._hash(key);

    if (this.keyMap[index]) {
      for (let i = 0; i < this.keyMap[index].length; i++) {
        if (this.keyMap[index][i][0] === key) {
          return this.keyMap[index][i][1];
        }
      }
    }
    return undefined;
  }

  // 删除键值对
  delete(key) {
    const index = this._hash(key);

    if (!this.keyMap[index]) return false;

    for (let i = 0; i < this.keyMap[index].length; i++) {
      if (this.keyMap[index][i][0] === key) {
        this.keyMap[index].splice(i, 1);
        if (this.keyMap[index].length === 0) {
          delete this.keyMap[index];
        }
        return true;
      }
    }
    return false;
  }

  // 获取所有键
  keys() {
    const keysArr = [];
    for (let i = 0; i < this.keyMap.length; i++) {
      if (this.keyMap[i]) {
        for (let j = 0; j < this.keyMap[i].length; j++) {
          if (!keysArr.includes(this.keyMap[i][j][0])) {
            keysArr.push(this.keyMap[i][j][0]);
          }
        }
      }
    }
    return keysArr;
  }

  // 获取所有值
  values() {
    const valuesArr = [];
    for (let i = 0; i < this.keyMap.length; i++) {
      if (this.keyMap[i]) {
        for (let j = 0; j < this.keyMap[i].length; j++) {
          if (!valuesArr.includes(this.keyMap[i][j][1])) {
            valuesArr.push(this.keyMap[i][j][1]);
          }
        }
      }
    }
    return valuesArr;
  }
}
```

### 自动扩容

```js
class EnhancedHashTable {
  constructor(initialCapacity = 8, loadFactor = 0.75) {
    this.capacity = initialCapacity;
    this.loadFactor = loadFactor;
    this.size = 0;
    this.buckets = new Array(this.capacity);
  }

  _hash(key) {
    let hashCode = 0;
    const PRIME = 31;

    // 处理不同类型的键
    const keyStr = typeof key === "string" ? key : JSON.stringify(key);

    for (let i = 0; i < keyStr.length; i++) {
      hashCode = (PRIME * hashCode + keyStr.charCodeAt(i)) % this.capacity;
    }
    return hashCode;
  }

  _resize() {
    const oldBuckets = this.buckets;
    this.capacity *= 2;
    this.buckets = new Array(this.capacity);
    this.size = 0;

    for (const bucket of oldBuckets) {
      if (bucket) {
        for (const [key, value] of bucket) {
          this.set(key, value);
        }
      }
    }
  }

  set(key, value) {
    // 检查是否需要扩容
    if (this.size / this.capacity >= this.loadFactor) {
      this._resize();
    }

    const index = this._hash(key);

    if (!this.buckets[index]) {
      this.buckets[index] = [];
    }

    // 更新或添加
    for (let i = 0; i < this.buckets[index].length; i++) {
      if (this.buckets[index][i][0] === key) {
        this.buckets[index][i][1] = value;
        return;
      }
    }

    this.buckets[index].push([key, value]);
    this.size++;
  }

  get(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];

    if (bucket) {
      for (const [k, v] of bucket) {
        if (k === key) return v;
      }
    }
    return undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  clear() {
    this.buckets = new Array(this.capacity);
    this.size = 0;
  }

  // 获取负载因子
  getLoadFactor() {
    return this.size / this.capacity;
  }
}
```

### 支持任何类型键的通用哈希表

```js
class UniversalHashTable {
  constructor(size = 53) {
    this.table = new Array(size);
  }

  // 通用哈希函数，支持多种类型
  _hash(key) {
    if (typeof key === "number") {
      return key % this.table.length;
    }

    if (typeof key === "string") {
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash = hash & hash; // 转为32位整数
      }
      return Math.abs(hash) % this.table.length;
    }

    if (typeof key === "object" && key !== null) {
      // 对象使用JSON字符串化
      return this._hash(JSON.stringify(key));
    }

    return 0;
  }

  // 双重哈希解决冲突
  _hash2(key) {
    return 7 - (this._hash(key) % 7);
  }

  // 使用线性探测开放寻址
  _findSlot(key, forInsert = false) {
    let index = this._hash(key);
    let step = 1;

    while (this.table[index] !== undefined) {
      if (this.table[index] !== null && this.table[index].key === key) {
        return index; // 找到键
      }

      if (
        forInsert &&
        (this.table[index] === null || this.table[index] === undefined)
      ) {
        return index; // 找到可插入的空槽
      }

      // 线性探测
      index = (index + 1) % this.table.length;
      step++;

      if (step > this.table.length) {
        throw new Error("Hash table is full");
      }
    }

    return forInsert ? index : -1;
  }

  set(key, value) {
    const index = this._findSlot(key, true);
    this.table[index] = { key, value };
  }

  get(key) {
    const index = this._findSlot(key, false);
    return index !== -1 ? this.table[index].value : undefined;
  }

  delete(key) {
    const index = this._findSlot(key, false);
    if (index !== -1) {
      this.table[index] = null; // 标记为删除
      return true;
    }
    return false;
  }
}
```

## 使用 JavaScript 内置结构

使用 Object

```js
// 最简单的哈希表实现
const hashTable = {};
hashTable["key1"] = "value1";
hashTable["key2"] = "value2";

// 获取
const value = hashTable["key1"];

// 删除
delete hashTable["key1"];
```

使用 Map

```js
// ES6 Map 是更好的哈希表实现
const map = new Map();

// 设置键值对
map.set("name", "Alice");
map.set(42, "The Answer");
map.set({ id: 1 }, "Object Key");

// 获取
console.log(map.get("name")); // Alice

// 检查是否存在
console.log(map.has(42)); // true

// 删除
map.delete(42);

// 大小
console.log(map.size);

// 遍历
map.forEach((value, key) => {
  console.log(key, value);
});

// 清空
map.clear();
```

使用 Set（类似哈希集合）

```js
// 用于存储唯一值
const set = new Set();

set.add(1);
set.add(2);
set.add(2); // 重复，不会被添加

console.log(set.has(1)); // true
console.log(set.size); // 2

set.delete(1);
```

## 性能优化

选择合适的哈希函数

```js
// 更好的字符串哈希函数（djb2算法）
function hashDJB2(str, tableSize) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash) % tableSize;
}
```

优化冲突处理

```js
class OptimizedHashTable {
  constructor(size = 53) {
    this.table = new Array(size);
    this.deleted = Symbol("deleted"); // 特殊标记删除
  }

  // 二次探测
  _probe(index, i, tableSize) {
    return (index + i * i) % tableSize;
  }

  // 双重哈希
  _doubleHash(index, i, tableSize, key) {
    const hash2 = 1 + (this._hash2(key) % (tableSize - 1));
    return (index + i * hash2) % tableSize;
  }
}
```

## 实际应用

频率计数器

```js
function frequencyCounter(arr) {
  const frequency = new Map();

  for (const item of arr) {
    frequency.set(item, (frequency.get(item) || 0) + 1);
  }

  return frequency;
}

// 使用
const arr = ["apple", "banana", "apple", "orange", "banana", "banana"];
const freq = frequencyCounter(arr);
console.log(freq.get("banana")); // 3
```

缓存实现（LRU Cache）

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map(); // 哈希表 + 维护顺序
  }

  get(key) {
    if (!this.cache.has(key)) return -1;

    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value); // 更新为最近使用

    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, value);
  }
}
```

分组算法

```js
function groupBy(array, keyFn) {
  const groups = new Map();

  for (const item of array) {
    const key = typeof keyFn === "function" ? keyFn(item) : item[keyFn];

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(item);
  }

  return groups;
}

// 使用
const people = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 25 },
];

const groupedByAge = groupBy(people, "age");
console.log(groupedByAge.get(25));
// [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 25 }]
```

## 复杂度

| 操作   | Object | Map  | 自定义哈希表 |
| ------ | ------ | ---- | ------------ |
| 插入   | O(1)   | O(1) | O(1)-O(n)    |
| 查找   | O(1)   | O(1) | O(1)-O(n)    |
| 删除   | O(1)   | O(1) | O(1)-O(n)    |
| 遍历键 | O(n)   | O(n) | O(n)         |

最坏情况（所有键冲突）会退化为 O(n)
