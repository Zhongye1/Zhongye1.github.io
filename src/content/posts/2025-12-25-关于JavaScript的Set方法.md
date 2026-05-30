---
uuid: 00d730c0-e163-11f0-a1ae-d9dba5bd8c7d
title: 2025-12-25-ES6-关于JavaScript的Set 方法
category: 归档
mathjax: true
abbrlink: 27040
published: 2025-12-25 15:26:18
---
# JavaScript Set 方法详解

## 1. Set 是什么？

**Set**​ 是 ES6 引入的一种新的数据结构，它类似于数组，但**成员的值都是唯一的**，没有重复的值。

```ts
// 创建一个 Set
const mySet = new Set();

// 或者从数组创建
const setFromArray = new Set([1, 2, 3, 3, 4]); // 会自动去重
console.log(setFromArray); // Set(4) {1, 2, 3, 4}
```

## 2. Set 的基本方法

### 2.1 添加元素：`add()`

```ts
const set = new Set();

// 添加单个元素
set.add(1);
set.add(2);
set.add(2); // 重复添加，不会被添加进去

// 链式调用
set.add(3).add(4).add(5);

// 可以添加任意类型的值
set.add("hello");
set.add({ name: "John" });
set.add([1, 2, 3]);
set.add(NaN); // NaN 在 Set 中也是唯一的
set.add(NaN); // 不会添加第二个 NaN

console.log(set.size); // 查看大小
```

### 2.2 删除元素：`delete()`

```ts
const set = new Set([1, 2, 3, 4, 5]);

// 删除指定值
set.delete(3); // 删除 3
console.log(set); // Set(4) {1, 2, 4, 5}

// 删除不存在的值返回 false
console.log(set.delete(10)); // false

// 删除对象引用需要相同的引用
const obj = { name: "John" };
set.add(obj);
console.log(set.delete({ name: "John" })); // false，因为不是同一个引用
console.log(set.delete(obj)); // true，删除成功
```

### 2.3 检查存在：`has()`

```ts
const set = new Set([1, 2, 3, 4, 5]);

console.log(set.has(2)); // true
console.log(set.has(10)); // false

// 对于 NaN，Set 能正确处理
set.add(NaN);
console.log(set.has(NaN)); // true
```

### 2.4 清空 Set：`clear()`

```ts
const set = new Set([1, 2, 3, 4, 5]);
console.log(set.size); // 5

set.clear();
console.log(set.size); // 0
console.log(set); // Set(0) {}
```

## 3. Set 的遍历方法

### 3.1 `forEach()`

```ts
const set = new Set(["apple", "banana", "orange"]);

// 遍历每个元素
set.forEach((value, key, set) => {
  // Set 的 key 和 value 相同
  console.log(`${key}: ${value}`);
});

// 输出：
// apple: apple
// banana: banana
// orange: orange
```

### 3.2 `keys()`、`values()`、`entries()`

```ts
const set = new Set(["a", "b", "c"]);

// keys() - 返回键名的遍历器
for (let key of set.keys()) {
  console.log(key); // a, b, c
}

// values() - 返回键值的遍历器（Set 的键和值相同）
for (let value of set.values()) {
  console.log(value); // a, b, c
}

// entries() - 返回键值对的遍历器
for (let entry of set.entries()) {
  console.log(entry); // ['a', 'a'], ['b', 'b'], ['c', 'c']
}
```

## 4. Set 的特性

### 4.1 唯一性

```ts
// 自动去重
const arr = [1, 2, 2, 3, 3, 3, 4, 5];
const uniqueSet = new Set(arr);
console.log([...uniqueSet]); // [1, 2, 3, 4, 5]

// 对象引用不同，不算重复
const obj1 = { id: 1 };
const obj2 = { id: 1 };
const objSet = new Set([obj1, obj2, obj1]);
console.log(objSet.size); // 2，obj1 和 obj2 被认为是不同的
```

### 4.2 与数组的对比

```ts
// 查找元素
const arr = [1, 2, 3, 4, 5];
const set = new Set(arr);

// 数组查找是 O(n)
console.log(arr.includes(3)); // true，需要遍历

// Set 查找是 O(1)
console.log(set.has(3)); // true，哈希查找，更快

// 判断是否重复
const hasDuplicates = (array) => {
  return new Set(array).size !== array.length;
};

console.log(hasDuplicates([1, 2, 3, 3])); // true
console.log(hasDuplicates([1, 2, 3, 4])); // false
```

### 4.3 迭代顺序

```ts
// Set 的遍历顺序就是插入顺序
const set = new Set();
set.add(3);
set.add(1);
set.add(2);

for (let item of set) {
  console.log(item); // 3, 1, 2（插入顺序）
}

// 与对象不同，对象的键顺序不保证
const obj = { 3: "a", 1: "b", 2: "c" };
console.log(Object.keys(obj)); // ['1', '2', '3']（数字键会排序）
```

## 5. 实际应用场景

### 5.1 数组去重（最常用）

```ts
// 传统方法
function uniqueArray(arr) {
  return [...new Set(arr)];
}

// 使用
const numbers = [1, 2, 3, 3, 4, 4, 5];
console.log(uniqueArray(numbers)); // [1, 2, 3, 4, 5]

// 字符串去重
const str = "hello world";
const uniqueChars = [...new Set(str)].join("");
console.log(uniqueChars); // 'helo wrd'
```

### 5.2 求交集、并集、差集

```ts
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

// 并集
const union = new Set([...setA, ...setB]);
console.log([...union]); // [1, 2, 3, 4, 5, 6]

// 交集
const intersection = new Set([...setA].filter((x) => setB.has(x)));
console.log([...intersection]); // [3, 4]

// 差集（A 有 B 没有）
const difference = new Set([...setA].filter((x) => !setB.has(x)));
console.log([...difference]); // [1, 2]
```

### 5.3 数据筛选

```ts
// 从数组中过滤出唯一的元素
const data = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 1, name: "Alice" }, // 重复
  { id: 3, name: "Charlie" },
];

// 基于 id 去重
const seen = new Set();
const uniqueData = data.filter((item) => {
  if (seen.has(item.id)) {
    return false;
  } else {
    seen.add(item.id);
    return true;
  }
});

console.log(uniqueData);
// [
//     { id: 1, name: 'Alice' },
//     { id: 2, name: 'Bob' },
//     { id: 3, name: 'Charlie' }
// ]
```

### 5.4 标签/分类系统

```ts
class TagSystem {
  constructor() {
    this.tags = new Set();
  }

  addTag(tag) {
    this.tags.add(tag.toLowerCase());
    return this;
  }

  removeTag(tag) {
    this.tags.delete(tag.toLowerCase());
    return this;
  }

  hasTag(tag) {
    return this.tags.has(tag.toLowerCase());
  }

  getAllTags() {
    return [...this.tags];
  }

  merge(otherTagSystem) {
    otherTagSystem.tags.forEach((tag) => this.tags.add(tag));
    return this;
  }
}

// 使用
const articleTags = new TagSystem();
articleTags.addTag("JavaScript").addTag("Tutorial").addTag("JavaScript"); // 不会重复添加

console.log(articleTags.getAllTags()); // ['javascript', 'tutorial']
```

## 6. Set 性能优势

```ts
// 测试查找性能
const largeArray = Array.from({ length: 1000000 }, (_, i) => i);
const largeSet = new Set(largeArray);

console.time("Array查找");
largeArray.includes(999999);
console.timeEnd("Array查找"); // 约 0.5-1ms

console.time("Set查找");
largeSet.has(999999);
console.timeEnd("Set查找"); // 约 0.01ms

// 测试重复检查性能
const checkDuplicatesArray = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
};

const checkDuplicatesSet = (arr) => {
  return new Set(arr).size !== arr.length;
};

const testArray = Array.from({ length: 10000 }, () =>
  Math.floor(Math.random() * 1000)
);

console.time("数组检查重复");
checkDuplicatesArray(testArray);
console.timeEnd("数组检查重复"); // 慢

console.time("Set检查重复");
checkDuplicatesSet(testArray);
console.timeEnd("Set检查重复"); // 快
```

## 7. WeakSet

### 7.1 与 Set 的区别

```ts
// Set 可以存储任何类型的值
const set = new Set();
let obj = { name: "John" };
set.add(obj);
console.log(set.size); // 1

// WeakSet 只能存储对象引用
const weakSet = new WeakSet();
weakSet.add(obj); // OK
// weakSet.add(1); // TypeError: Invalid value used in weak set

// WeakSet 的引用是弱引用，不会阻止垃圾回收
obj = null; // 清除引用
// 等待垃圾回收后，weakSet 中的对应项会自动被移除
```

### 7.2 WeakSet 的方法

```ts
const weakSet = new WeakSet();
const obj1 = {};
const obj2 = {};

weakSet.add(obj1);
weakSet.add(obj2);

console.log(weakSet.has(obj1)); // true
weakSet.delete(obj1);
console.log(weakSet.has(obj1)); // false

// WeakSet 没有 size 属性，不能遍历
// console.log(weakSet.size); // undefined
// weakSet.forEach(...) // 没有 forEach 方法
```

### 7.3 WeakSet 的应用场景

```ts
// 1. 存储 DOM 节点，避免内存泄漏
const weakSet = new WeakSet();

document.querySelectorAll("button").forEach((button) => {
  weakSet.add(button);
  button.addEventListener("click", () => {
    if (weakSet.has(button)) {
      console.log("按钮在集合中");
    }
  });
});

// 当按钮从 DOM 中移除时，会被自动垃圾回收
// weakSet 中的引用也会自动移除

// 2. 私有属性模拟
const privateData = new WeakSet();

class User {
  constructor(name) {
    this.name = name;
    privateData.add(this); // 标记为"初始化"
  }

  isInitialized() {
    return privateData.has(this);
  }
}

const user = new User("Alice");
console.log(user.isInitialized()); // true
```

## 8. 常见的一些陷阱和注意事项

### 8.1 NaN 的处理

```ts
const set = new Set();
set.add(NaN);
console.log(set.has(NaN)); // true

// 注意：NaN === NaN 为 false，但 Set 认为 NaN 等于自身
```

### 8.2 对象引用

```ts
const set = new Set();
const obj1 = { id: 1 };
const obj2 = { id: 1 };

set.add(obj1);
set.add(obj2);

console.log(set.size); // 2，因为 obj1 和 obj2 是不同的对象引用
console.log(set.has({ id: 1 })); // false，新对象不是同一个引用
```

### 8.3 类型转换

```ts
const set = new Set();
set.add(1);
set.add("1");

console.log(set.size); // 2，1 和 '1' 类型不同，不会去重
console.log(set.has(1)); // true
console.log(set.has("1")); // true
```

### 8.4 遍历时修改

```ts
const set = new Set([1, 2, 3]);

// 在遍历时删除元素
for (let item of set) {
  if (item === 2) {
    set.delete(item); // 当前正在遍历的元素可以安全删除
  }
  console.log(item); // 1, 2, 3（会正常遍历完）
}

// 在遍历时添加元素可能有问题
for (let item of set) {
  if (item === 1) {
    set.add(4); // 添加的元素在本次遍历中可能不会被访问
  }
}
```

## 9. 与其它数据结构的转换

### 9.1 Set 与 Array

```ts
// Set → Array
const set = new Set([1, 2, 3]);
const arr1 = Array.from(set);
const arr2 = [...set];
console.log(arr1, arr2); // [1, 2, 3]

// Array → Set
const array = [1, 2, 2, 3, 3, 3];
const newSet = new Set(array);
console.log([...newSet]); // [1, 2, 3]
```

### 9.2 Set 与 String

```ts
// 字符串去重并排序
const str = "javascript";
const uniqueSorted = [...new Set(str)].sort().join("");
console.log(uniqueSorted); // 'aijprstv'
```

### 9.3 Set 与 Map

```ts
// 使用 Set 存储 Map 的键
const map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);

const keysSet = new Set(map.keys());
console.log([...keysSet]); // ['a', 'b', 'c']
```

## 10. 综合示例

```ts
// 实现一个简单的权限系统
class PermissionSystem {
  constructor() {
    this.permissions = new Set();
  }

  // 添加权限
  addPermission(permission) {
    this.permissions.add(permission);
    return this;
  }

  // 批量添加权限
  addPermissions(permissionsArray) {
    permissionsArray.forEach((p) => this.permissions.add(p));
    return this;
  }

  // 检查是否有某个权限
  hasPermission(permission) {
    return this.permissions.has(permission);
  }

  // 检查是否有所有指定权限
  hasAllPermissions(requiredPermissions) {
    return requiredPermissions.every((p) => this.permissions.has(p));
  }

  // 检查是否有任一指定权限
  hasAnyPermission(permissions) {
    return permissions.some((p) => this.permissions.has(p));
  }

  // 获取所有权限
  getAllPermissions() {
    return [...this.permissions];
  }

  // 移除权限
  removePermission(permission) {
    this.permissions.delete(permission);
    return this;
  }

  // 清空所有权限
  clearPermissions() {
    this.permissions.clear();
    return this;
  }
}

// 使用示例
const userPermissions = new PermissionSystem();
userPermissions
  .addPermissions(["read", "write", "delete"])
  .addPermission("execute");

console.log(userPermissions.hasPermission("write")); // true
console.log(userPermissions.hasAllPermissions(["read", "write"])); // true
console.log(userPermissions.getAllPermissions()); // ['read', 'write', 'delete', 'execute']
```

---
---

总之

- 高效查找：`has()`方法的时间复杂度是 O(1)
- 遍历时按插入顺序输出
- 需要去重时，优先考虑 Set
- 需要快速查找元素是否存在时，用 Set 代替数组
- 存储唯一值集合时，Set 是最佳选择
- 需要存储对象引用并自动清理时，考虑 WeakSet
