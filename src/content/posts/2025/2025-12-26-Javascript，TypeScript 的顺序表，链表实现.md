---
uuid: 9d053150-e211-11f0-b4dd-8b5a45240b4b
title: 2025-12-26-Javascript/TypeScript 的顺序表，链表实现
mathjax: true
abbrlink: 46758
published: 2025-12-26 12:16:12
category: 数据结构
tags:
    - 数据结构
    - 顺序表
    - 链表
    - TypeScript
---


JavaScript 原生提供了 Array 作为高效的动态顺序表实现，但为了理解底层原理，通常需要手动实现。链表则需要完全手动实现，因为 JavaScript 无内置链表结构。

以下分别提供两种数据结构的完整实现，包括基本操作（插入、删除、查找、遍历等），并附带说明。

## 1. 顺序表（基于数组的动态顺序表）

顺序表的核心是连续存储，使用数组实现

```JavaScript
// 创建顺序表
const seqList = [];

// 添加元素
seqList.push(10);
seqList.push(20);
seqList.push(30);

// 在索引 1 处插入 15
seqList.splice(1, 0, 15);  // [10, 15, 20, 30]

// 修改索引 2 处的元素
seqList[2] = 25;           // [10, 15, 25, 30]

// 删除索引 0 处的元素
seqList.splice(0, 1);      // [15, 25, 30]

// 输出长度和内容
console.log('长度:', seqList.length);  // 3
console.log('内容:', seqList);         // [15, 25, 30]
```

手动实现如下：

```JavaScript
class SequentialList {
    constructor(capacity = 10) {
        this.data = new Array(capacity);  // 存储元素
        this.size = 0;                    // 当前元素个数
        this.capacity = capacity;         // 当前容量
    }

    // 获取长度
    getSize() {
        return this.size;
    }

    // 判断是否为空
    isEmpty() {
        return this.size === 0;
    }

    // 扩容（当 size === capacity 时）
    resize(newCapacity) {
        const newData = new Array(newCapacity);
        for (let i = 0; i < this.size; i++) {
            newData[i] = this.data[i];
        }
        this.data = newData;
        this.capacity = newCapacity;
    }

    // 在索引 index 处插入元素
    add(index, element) {
        if (index < 0 || index > this.size) {
            throw new Error('索引越界');
        }
        if (this.size === this.capacity) {
            this.resize(this.capacity * 2);  // 扩容为两倍
        }
        // 从后向前移动元素
        for (let i = this.size - 1; i >= index; i--) {
            this.data[i + 1] = this.data[i];
        }
        this.data[index] = element;
        this.size++;
    }

    // 在末尾添加元素
    append(element) {
        this.add(this.size, element);
    }

    // 删除索引 index 处的元素并返回
    remove(index) {
        if (index < 0 || index >= this.size) {
            throw new Error('索引越界');
        }
        const removed = this.data[index];
        // 从前向后移动元素
        for (let i = index + 1; i < this.size; i++) {
            this.data[i - 1] = this.data[i];
        }
        this.size--;
        // 可选：缩容（避免频繁缩容，通常当 size == capacity / 4 时缩为一半）
        if (this.size > 0 && this.size === Math.floor(this.capacity / 4)) {
            this.resize(Math.floor(this.capacity / 2));
        }
        return removed;
    }

    // 获取索引处元素
    get(index) {
        if (index < 0 || index >= this.size) {
            throw new Error('索引越界');
        }
        return this.data[index];
    }

    // 设置索引处元素
    set(index, element) {
        if (index < 0 || index >= this.size) {
            throw new Error('索引越界');
        }
        this.data[index] = element;
    }

    // 遍历打印
    print() {
        let str = 'SequentialList: [';
        for (let i = 0; i < this.size; i++) {
            str += this.data[i];
            if (i !== this.size - 1) str += ', ';
        }
        str += ']';
        console.log(str);
    }
}

// 使用示例
const seqList = new SequentialList();
seqList.append(1);
seqList.append(2);
seqList.add(1, 3);
seqList.print();  // SequentialList: [1, 3, 2]
```

## 2. 链表（单向链表）

链表使用节点分散存储，支持高效的插入和删除（O(1)），但随机访问较慢（O(n)）

```JavaScript
// 节点类
class ListNode {
    constructor(val = null, next = null) {
        this.val = val;
        this.next = next;
    }
}

class LinkedList {
    constructor() {
        this.head = new ListNode();  // 虚拟头结点，便于操作
        this.size = 0;
    }

    getSize() {
        return this.size;
    }

    isEmpty() {
        return this.size === 0;
    }

    // 在索引 index 处插入元素
    add(index, element) {
        if (index < 0 || index > this.size) {
            throw new Error('索引越界');
        }
        let prev = this.head;
        for (let i = 0; i < index; i++) {
            prev = prev.next;
        }
        const node = new ListNode(element);
        node.next = prev.next;
        prev.next = node;
        this.size++;
    }

    // 在链表头部添加元素
    addFirst(element) {
        this.add(0, element);
    }

    // 在链表末尾添加元素
    addLast(element) {
        this.add(this.size, element);
    }

    // 获取索引处元素
    get(index) {
        if (index < 0 || index >= this.size) {
            throw new Error('索引越界');
        }
        let cur = this.head.next;
        for (let i = 0; i < index; i++) {
            cur = cur.next;
        }
        return cur.val;
    }

    // 设置索引处元素
    set(index, element) {
        if (index < 0 || index >= this.size) {
            throw new Error('索引越界');
        }
        let cur = this.head.next;
        for (let i = 0; i < index; i++) {
            cur = cur.next;
        }
        cur.val = element;
    }

    // 删除索引处元素并返回
    remove(index) {
        if (index < 0 || index >= this.size) {
            throw new Error('索引越界');
        }
        let prev = this.head;
        for (let i = 0; i < index; i++) {
            prev = prev.next;
        }
        const removedNode = prev.next;
        prev.next = removedNode.next;
        removedNode.next = null;
        this.size--;
        return removedNode.val;
    }

    // 遍历打印
    print() {
        let str = 'LinkedList: [';
        let cur = this.head.next;
        while (cur) {
            str += cur.val;
            if (cur.next) str += ' -> ';
            cur = cur.next;
        }
        str += ']';
        console.log(str);
    }
}

// 使用示例
const linkedList = new LinkedList();
linkedList.addLast(1);
linkedList.addLast(2);
linkedList.add(1, 3);
linkedList.print();  // LinkedList: [1 -> 3 -> 2]
```

---
---
## LRU 缓存的实现（使用双向链表 + HashMap）

LRU（Least Recently Used）缓存是一种常见的数据结构，用于实现固定容量缓存，当容量满时淘汰最近最少使用的元素。在 JavaScript 中，最高效的实现方式是结合**双向链表**（控制访问顺序）和**Map**（或对象）作为哈希表（实现 O(1) 访问）

### JS实现：

```JavaScript
class LRUCache {
    /**
     * 构造函数
     * @param {number} capacity - 缓存的最大容量
     */
    constructor(capacity) {
        this.capacity = capacity;        // 缓存容量
        this.cache = new Map();          // 使用 Map 作为哈希表，保持插入顺序并支持 O(1) 操作
        this.head = {};                  // 双向链表的虚拟头节点
        this.tail = {};                  // 双向链表的虚拟尾节点
        this.head.next = this.tail;      // 初始化链表：head <-> tail
        this.tail.prev = this.head;
    }

    /**
     * 将节点移动到链表头部（表示最近使用）
     * @private
     * @param {Object} node - 要移动的节点
     */
    _moveToHead(node) {
        // 先从当前位置移除
        node.prev.next = node.next;
        node.next.prev = node.prev;

        // 插入到头部
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }

    /**
     * 从链表尾部移除节点（淘汰最久未使用的）
     * @private
     * @returns {Object} 被移除的节点
     */
    _removeTail() {
        const lastNode = this.tail.prev;
        lastNode.prev.next = this.tail;
        this.tail.prev = lastNode.prev;
        return lastNode;
    }

    /**
     * 获取缓存值
     * @param {any} key - 键
     * @returns {any} 值，如果不存在返回 -1
     */
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            return -1;  // 未找到
        }
        // 刷新访问顺序：将节点移到头部
        this._moveToHead(node);
        return node.value;
    }

    /**
     * 放入缓存
     * @param {any} key - 键
     * @param {any} value - 值
     */
    put(key, value) {
        const existingNode = this.cache.get(key);

        if (existingNode) {
            // 已存在：更新值并移到头部
            existingNode.value = value;
            this._moveToHead(existingNode);
        } else {
            // 不存在：创建新节点
            const newNode = { key, value, prev: null, next: null };
            this.cache.set(key, newNode);

            // 插入到头部
            newNode.next = this.head.next;
            newNode.prev = this.head;
            this.head.next.prev = newNode;
            this.head.next = newNode;

            // 检查容量是否超出
            if (this.cache.size > this.capacity) {
                const tailNode = this._removeTail();  // 移除尾部节点
                this.cache.delete(tailNode.key);      // 从哈希表中删除
            }
        }
    }

    // 可选：打印当前缓存顺序（用于调试）
    printCache() {
        const result = [];
        let current = this.head.next;
        while (current !== this.tail) {
            result.push(`${current.key}:${current.value}`);
            current = current.next;
        }
        console.log('LRU Cache (most recent -> least recent):', result.join(' -> '));
    }
}

// 使用示例
const cache = new LRUCache(3);
cache.put(1, 1);
cache.put(2, 2);
cache.put(3, 3);
cache.printCache();  // 3:3 -> 2:2 -> 1:1

console.log(cache.get(2));  // 2（刷新顺序）
cache.printCache();         // 2:2 -> 3:3 -> 1:1

cache.put(4, 4);            // 容量满，淘汰最久未使用的 1
cache.printCache();         // 4:4 -> 2:2 -> 3:3
```


### TS实现

使用双向链表结合 Map（Map 在 TypeScript 中天然支持泛型）实现 O(1) 时间复杂度的 get 和 put 操作


```TypeScript
// 双向链表节点接口
interface Node<K, V> {
    key: K;
    value: V;
    prev: Node<K, V> | null;
    next: Node<K, V> | null;
}

class LRUCache<K = number, V = number> {
    private capacity: number;                // 缓存容量
    private cache: Map<K, Node<K, V>>;        // 哈希表：键到节点的映射
    private head: Node<K, V>;                // 虚拟头节点
    private tail: Node<K, V>;                // 虚拟尾节点

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map<K, Node<K, V>>();
        this.head = { key: null as any, value: null as any, prev: null, next: null };
        this.tail = { key: null as any, value: null as any, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    // 将节点移动到头部（最近使用）
    private moveToHead(node: Node<K, V>): void {
        // 从当前位置移除
        node.prev!.next = node.next;
        node.next!.prev = node.prev!;

        // 插入头部
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    // 移除尾部节点（最久未使用）
    private removeTail(): Node<K, V> {
        const lastNode = this.tail.prev!;
        lastNode.prev!.next = this.tail;
        this.tail.prev = lastNode.prev;
        return lastNode;
    }

    // 获取值
    get(key: K): V | -1 {
        const node = this.cache.get(key);
        if (!node) {
            return -1;
        }
        this.moveToHead(node);  // 刷新访问顺序
        return node.value;
    }

    // 放入键值对
    put(key: K, value: V): void {
        const existingNode = this.cache.get(key);

        if (existingNode) {
            existingNode.value = value;  // 更新值
            this.moveToHead(existingNode);
        } else {
            const newNode: Node<K, V> = { key, value, prev: null, next: null };
            this.cache.set(key, newNode);

            // 插入头部
            newNode.next = this.head.next;
            newNode.prev = this.head;
            this.head.next!.prev = newNode;
            this.head.next = newNode;

            // 超出容量时淘汰
            if (this.cache.size > this.capacity) {
                const tailNode = this.removeTail();
                this.cache.delete(tailNode.key);
            }
        }
    }

    // 调试：打印缓存顺序（最近 -> 最久）
    printCache(): void {
        const result: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            result.push(`${current!.key}:${current!.value}`);
            current = current!.next;
        }
        console.log('LRU Cache:', result.join(' -> '));
    }
}

// 使用示例
const cache = new LRUCache<number, number>(3);
cache.put(1, 1);
cache.put(2, 2);
cache.put(3, 3);
cache.printCache();  // 3:3 -> 2:2 -> 1:1
console.log(cache.get(2));  // 2
cache.printCache();         // 2:2 -> 3:3 -> 1:1
```



## 链表反转的实现

单向链表的反转实现，包括迭代和递归两种方式

### JS实现

```JavaScript
// 单向链表节点定义
class ListNode {
    constructor(val = null, next = null) {
        this.val = val;
        this.next = next;
    }
}

// 创建链表的辅助函数
function createLinkedList(arr) {
    if (arr.length === 0) return null;
    let head = new ListNode(arr[0]);
    let current = head;
    for (let i = 1; i < arr.length; i++) {
        current.next = new ListNode(arr[i]);
        current = current.next;
    }
    return head;
}

// 打印链表的辅助函数
function printLinkedList(head) {
    const result = [];
    let current = head;
    while (current) {
        result.push(current.val);
        current = current.next;
    }
    console.log('LinkedList:', result.join(' -> '));
}

// 方法一：迭代反转（推荐，空间复杂度 O(1)）
function reverseListIterative(head) {
    let prev = null;         // 前驱指针
    let current = head;      // 当前指针
    let next = null;         // 临时存储下一节点

    while (current !== null) {
        next = current.next; // 保存下一节点
        current.next = prev; // 反转指针
        prev = current;      // 前驱前进
        current = next;      // 当前前进
    }
    return prev;  // prev 成为新头节点
}

// 方法二：递归反转
function reverseListRecursive(head) {
    // 递归终止条件：空链表或只有一个节点
    if (head === null || head.next === null) {
        return head;
    }

    // 递归反转后续链表
    const newHead = reverseListRecursive(head.next);

    // 反转当前节点与下一节点的指向
    head.next.next = head;
    head.next = null;

    return newHead;  // 新头节点始终是原链表的尾节点
}

// 使用示例
const list = createLinkedList([1, 2, 3, 4, 5]);
printLinkedList(list);  // 1 -> 2 -> 3 -> 4 -> 5

const reversedIterative = reverseListIterative(list);
printLinkedList(reversedIterative);  // 5 -> 4 -> 3 -> 2 -> 1

const list2 = createLinkedList([6, 7, 8]);
printLinkedList(list2);  // 6 -> 7 -> 8

const reversedRecursive = reverseListRecursive(list2);
printLinkedList(reversedRecursive);  // 8 -> 7 -> 6
```


### TS实现

```ts
// 单向链表节点类型
class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode) {
        this.val = val ?? 0;
        this.next = next ?? null;
    }
}

// 创建链表辅助函数
function createLinkedList(arr: number[]): ListNode | null {
    if (arr.length === 0) return null;
    const head = new ListNode(arr[0]);
    let current = head;
    for (let i = 1; i < arr.length; i++) {
        current.next = new ListNode(arr[i]);
        current = current.next;
    }
    return head;
}

// 打印链表辅助函数
function printLinkedList(head: ListNode | null): void {
    const result: number[] = [];
    let current = head;
    while (current) {
        result.push(current.val);
        current = current.next;
    }
    console.log('LinkedList:', result.join(' -> '));
}

// 迭代反转（推荐，空间 O(1)）
function reverseListIterative(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null;
    let current: ListNode | null = head;

    while (current !== null) {
        const next = current.next;  // 保存下一节点
        current.next = prev;        // 反转指针
        prev = current;             // 前驱前进
        current = next;             // 当前前进
    }
    return prev;  // 新头节点
}

// 递归反转
function reverseListRecursive(head: ListNode | null): ListNode | null {
    if (head === null || head.next === null) {
        return head;
    }
    const newHead = reverseListRecursive(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}

// 使用示例
const list = createLinkedList([1, 2, 3, 4, 5]);
printLinkedList(list);  // 1 -> 2 -> 3 -> 4 -> 5

const reversedIter = reverseListIterative(list);
printLinkedList(reversedIter);  // 5 -> 4 -> 3 -> 2 -> 1

const list2 = createLinkedList([6, 7, 8]);
const reversedRec = reverseListRecursive(list2);
printLinkedList(reversedRec);  // 8 -> 7 -> 6
```





DFA:

- **顺序表**：适合随机访问（O(1)），插入/删除较慢（O(n)），实现简单，内存连续
- **链表**：适合频繁插入/删除（O(1)），随机访问慢（O(n)），内存分散，支持动态扩展, 链表常用于特定算法（如 LRU 缓存、链表反转等）

