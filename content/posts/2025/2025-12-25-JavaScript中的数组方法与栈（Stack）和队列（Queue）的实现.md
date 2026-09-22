---
uuid: d935da50-e16f-11f0-9b30-811c9d6eaab4
title: 2025-11-29-JavaScript中的数组方法与栈和队列的实现
mathjax: true
abbrlink: 28254
published: 2025-11-29 16:58:15
category: 数据结构
tags:
    - 数据结构
    - 栈
    - 队列
    - JavaScript
---

JavaScript 中的数组方法完全可以用来实现栈（Stack）和队列（Queue）的基本功能

这是因为栈和队列本质上是对“插入”和“删除”操作位置的限制，而数组的push、pop、unshift、shift这些方法正好提供了在**两端**高效操作的能力

先简单回顾一下这四种数组方法

|方法|操作位置|操作类型|返回值|时间复杂度|
|---|---|---|---|---|
|`push()`|尾部|添加|新长度|O(1)|
|`pop()`|尾部|删除|被删除元素|O(1)|
|`unshift()`|头部|添加|新长度|O(n)|
|`shift()`|头部|删除|被删除元素|O(n)|

### 1. 实现栈（Stack）——后进先出（LIFO，Last In First Out）

主要使用数组的**末尾**操作实现：

|操作|数组方法|示例代码|时间复杂度|
|---|---|---|---|
|入栈（push）|array.push(item)|stack.push(1)|O(1)|
|出栈（pop）|array.pop()|const item = stack.pop()|O(1)|

示例：

```JavaScript
const stack = [];
stack.push(1);    // [1]
stack.push(2);    // [1, 2]
stack.push(3);    // [1, 2, 3]
console.log(stack.pop());  // 3
console.log(stack.pop());  // 2
console.log(stack);        // [1]
```

### 2. 实现队列（Queue）——先进先出（FIFO，First In First Out）


#### 方式一：**头部删除 + 尾部插入**

|操作|数组方法|示例代码|时间复杂度|
|---|---|---|---|
|入队（enqueue）|array.push(item)|queue.push(1)|O(1)|
|出队（dequeue）|array.shift()|const item = queue.shift()|O(n)|

问题：shift() 会导致数组所有元素向前移动，时间复杂度为 O(n)，频繁操作时性能很差

#### 方式二：**尾部插入 + 头部删除**

|操作|数组方法|示例代码|时间复杂度|
|---|---|---|---|
|入队|array.unshift(item)|queue.unshift(1)|O(n)|
|出队|array.pop()|const item = queue.pop()|O(1)|

同样存在 O(n) 操作

如果需要高效队列，可以使用**双端队列**实现或第三方库，有几种方式

1. **使用两个数组模拟**（常见面试实现）：
    - 一个栈用于入队，一个栈用于出队，需要时倒腾
2. **使用 JavaScript 的 Deque（双端队列）库**：
    - 如 js-deque 或其他库，支持 O(1) 的头尾操作
3. **ES6+ 原生替代**：虽然没有内置 Queue，但可以用 Array + 手动索引模拟环形队列（较复杂）
