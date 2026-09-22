---
uuid: ad883950-e14e-11f0-a497-bfd03a5050bc
title: 2025-11-25 关于链表(Javascript)
mathjax: true
abbrlink: 33314
published: 2025-11-25 13:00:48
category: 数据结构
tags:
    - 数据结构
    - 链表
    - JavaScript
---

## 关于链表(Javascript)

链表是一种常见的数据结构，由一系列节点组成，每个节点包含数据和指向下一个节点的引用，在 JavaScript 中广泛应用于算法问题和实际开发

#### 链表的基本操作

##### 1. 单向链表的实现

下面是一个简单的单向链表的实现，包括节点定义和基本操作：

```javascript
// 定义节点类
class ListNode {
  constructor(value) {
    this.value = value; // 节点的值
    this.next = null; // 指向下一个节点的指针，初始为 null
  }
}

// 定义单向链表类
class LinkedList {
  constructor() {
    this.head = null; // 链表头节点，初始为 null
  }

  // 在链表末尾添加节点
  append(value) {
    const newNode = new ListNode(value); // 创建一个新的节点
    if (this.head === null) {
      // 如果链表为空，新的节点作为头节点
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next !== null) {
        // 遍历链表找到最后一个节点
        current = current.next;
      }
      current.next = newNode; // 将新的节点添加到最后一个节点的 next
    }
  }

  // 在链表头部添加节点
  prepend(value) {
    const newNode = new ListNode(value); // 创建一个新的节点
    newNode.next = this.head; // 新节点的 next 指向当前的头节点
    this.head = newNode; // 新节点作为头节点
  }

  // 删除指定值的节点
  delete(value) {
    if (this.head === null) return; // 如果链表为空，直接返回

    // 如果头节点就是要删除的节点
    if (this.head.value === value) {
      this.head = this.head.next;
      return;
    }

    let current = this.head;
    while (current.next !== null) {
      if (current.next.value === value) {
        // 找到要删除的节点
        current.next = current.next.next; // 将要删除的节点移出链表
        return;
      }
      current = current.next;
    }
  }

  // 打印链表
  print() {
    let current = this.head;
    while (current !== null) {
      process.stdout.write(`${current.value} -> `); // 输出当前节点的值
      current = current.next;
    }
    console.log("null"); // 表示链表结束
  }
}

// 示例：使用单向链表
const list = new LinkedList();
list.append(1);
list.append(2);
list.append(3);
list.prepend(0);
list.print(); // 输出 0 -> 1 -> 2 -> 3 -> null
list.delete(2);
list.print(); // 输出 0 -> 1 -> 3 -> null
```

##### 2. 双向链表的实现

下面是一个简单的双向链表的实现，包括节点定义和基本操作：

```javascript
// 定义双向节点类
class DoublyListNode {
  constructor(value) {
    this.value = value; // 节点的值
    this.next = null; // 指向下一个节点的指针，初始为 null
    this.prev = null; // 指向前一个节点的指针，初始为 null
  }
}

// 定义双向链表类
class DoublyLinkedList {
  constructor() {
    this.head = null; // 链表头节点，初始为 null
    this.tail = null; // 链表尾节点，初始为 null
  }

  // 在链表末尾添加节点
  append(value) {
    const newNode = new DoublyListNode(value); // 创建一个新的节点
    if (this.tail === null) {
      // 如果链表为空，新的节点作为头和尾节点
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode; // 将新的节点添加到尾节点的 next
      newNode.prev = this.tail; // 新节点的 prev 指向当前的尾节点
      this.tail = newNode; // 新节点作为新的尾节点
    }
  }

  // 在链表头部添加节点
  prepend(value) {
    const newNode = new DoublyListNode(value); // 创建一个新的节点
    if (this.head === null) {
      // 如果链表为空，新的节点作为头和尾节点
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.head.prev = newNode; // 头节点的 prev 指向新的节点
      newNode.next = this.head; // 新节点的 next 指向当前的头节点
      this.head = newNode; // 新节点作为新的头节点
    }
  }

  // 删除指定值的节点
  delete(value) {
    if (this.head === null) return; // 如果链表为空，直接返回

    // 如果头节点就是要删除的节点
    if (this.head.value === value) {
      this.head = this.head.next;
      if (this.head !== null) {
        this.head.prev = null;
      } else {
        this.tail = null; // 如果链表为空，更新尾节点
      }
      return;
    }

    let current = this.head;
    while (current !== null) {
      if (current.value === value) {
        // 找到要删除的节点
        if (current.next !== null) {
          current.next.prev = current.prev;
        } else {
          this.tail = current.prev; // 更新尾节点
        }
        current.prev.next = current.next;
        return;
      }
      current = current.next;
    }
  }

  // 打印链表
  print() {
    let current = this.head;
    while (current !== null) {
      process.stdout.write(`${current.value} <-> `); // 输出当前节点的值
      current = current.next;
    }
    console.log("null"); // 表示链表结束
  }
}

// 示例：使用双向链表
const dList = new DoublyLinkedList();
dList.append(1);
dList.append(2);
dList.append(3);
dList.prepend(0);
dList.print(); // 输出 0 <-> 1 <-> 2 <-> 3 <-> null
dList.delete(2);
dList.print(); // 输出 0 <-> 1 <-> 3 <-> null
```


##### 查找某个元素

**问题描述**：在链表中查找指定值的节点，并返回其位置索引。

```javascript
/**
 * 查找指定值的节点
 * @param {LinkedList} list - 单向链表
 * @param {any} value - 要查找的值
 * @returns {number} - 节点的位置索引，如果未找到返回-1
 */
function findElement(list, value) {
  let current = list.head;
  let index = 0;

  while (current !== null) {
    if (current.value === value) {
      return index; // 找到值，返回索引
    }
    current = current.next;
    index++;
  }

  return -1; // 未找到，返回-1
}

// 示例：查找元素
const searchList = new LinkedList();
searchList.append(1);
searchList.append(2);
searchList.append(3);
searchList.append(4);

console.log(findElement(searchList, 3)); // 输出 2
console.log(findElement(searchList, 5)); // 输出 -1
```

##### 2. 在指定位置插入元素

**问题描述**：在链表的指定位置插入新节点。

```javascript
/**
 * 在指定位置插入节点
 * @param {LinkedList} list - 单向链表
 * @param {number} position - 插入位置（从0开始）
 * @param {any} value - 要插入的值
 * @returns {boolean} - 插入成功返回true，否则返回false
 */
function insertAtPosition(list, position, value) {
  if (position < 0) {
    return false; // 位置无效
  }

  if (position === 0) {
    // 在头部插入
    const newNode = new ListNode(value);
    newNode.next = list.head;
    list.head = newNode;
    return true;
  }

  let current = list.head;
  let index = 0;

  // 找到指定位置的前一个节点
  while (current !== null && index < position - 1) {
    current = current.next;
    index++;
  }

  // 如果位置超出链表长度
  if (index !== position - 1 && current === null) {
    return false;
  }

  // 插入新节点
  const newNode = new ListNode(value);
  newNode.next = current.next;
  current.next = newNode;
  return true;
}

// 示例：在指定位置插入元素
const insertList = new LinkedList();
insertList.append(1);
insertList.append(2);
insertList.append(4);

insertList.print(); // 输出 1 -> 2 -> 4 -> null
insertAtPosition(insertList, 2, 3); // 在索引2的位置插入3
insertList.print(); // 输出 1 -> 2 -> 3 -> 4 -> null
insertAtPosition(insertList, 0, 0); // 在开头插入0
insertList.print(); // 输出 0 -> 1 -> 2 -> 3 -> 4 -> null
```

##### 3. 查找指定位置的元素

**问题描述**：获取链表中指定位置的元素值。

```javascript
/**
 * 获取指定位置的元素
 * @param {LinkedList} list - 单向链表
 * @param {number} position - 位置索引（从0开始）
 * @returns {any|undefined} - 位置上的值，如果位置无效返回undefined
 */
function getElementAtPosition(list, position) {
  if (position < 0 || list.head === null) {
    return undefined; // 位置无效或链表为空
  }

  let current = list.head;
  let index = 0;

  while (current !== null && index < position) {
    current = current.next;
    index++;
  }

  if (index === position && current !== null) {
    return current.value;
  }

  return undefined; // 位置超出链表长度
}

// 示例：获取指定位置的元素
const positionList = new LinkedList();
positionList.append(10);
positionList.append(20);
positionList.append(30);

console.log(getElementAtPosition(positionList, 0)); // 输出 10
console.log(getElementAtPosition(positionList, 2)); // 输出 30
console.log(getElementAtPosition(positionList, 5)); // 输出 undefined
```

##### 4. 删除指定位置的元素

**问题描述**：删除链表中指定位置的节点。

```javascript
/**
 * 删除指定位置的节点
 * @param {LinkedList} list - 单向链表
 * @param {number} position - 要删除的位置（从0开始）
 * @returns {boolean} - 删除成功返回true，否则返回false
 */
function deleteAtPosition(list, position) {
  if (position < 0 || list.head === null) {
    return false; // 位置无效或链表为空
  }

  if (position === 0) {
    // 删除头节点
    list.head = list.head.next;
    return true;
  }

  let current = list.head;
  let index = 0;

  // 找到指定位置的前一个节点
  while (current !== null && index < position - 1) {
    current = current.next;
    index++;
  }

  // 如果位置超出链表长度
  if (index !== position - 1 || current.next === null) {
    return false;
  }

  // 删除节点
  current.next = current.next.next;
  return true;
}

// 示例：删除指定位置的元素
const deleteList = new LinkedList();
deleteList.append(1);
deleteList.append(2);
deleteList.append(3);
deleteList.append(4);

deleteList.print(); // 输出 1 -> 2 -> 3 -> 4 -> null
deleteAtPosition(deleteList, 2); // 删除索引2的位置（值为3）
deleteList.print(); // 输出 1 -> 2 -> 4 -> null
deleteAtPosition(deleteList, 0); // 删除索引0的位置（值为1）
deleteList.print(); // 输出 2 -> 4 -> null
```

##### 5. 获取链表长度

**问题描述**：计算链表中节点的数量。

```javascript
/**
 * 获取链表长度
 * @param {LinkedList} list - 单向链表
 * @returns {number} - 链表长度
 */
function getListLength(list) {
  let current = list.head;
  let length = 0;

  while (current !== null) {
    length++;
    current = current.next;
  }

  return length;
}

// 示例：获取链表长度
const lengthList = new LinkedList();
lengthList.append(1);
lengthList.append(2);
lengthList.append(3);

console.log(getListLength(lengthList)); // 输出 3
lengthList.append(4);
console.log(getListLength(lengthList)); // 输出 4
```

---
---
### 其他操作

- 查找元素：根据值查找节点位置
- 指定位置插入：在特定位置插入新节点
- 指定位置获取：获取特定位置的节点值
- 指定位置删除：删除特定位置的节点
- 递归反转：使用递归方式反转链表
- 获取长度：统计链表中节点的数量
##### 反转链表

**问题描述**：反转一个单向链表

- 初始化 prev 为 null（新链表的尾部）。
- current 从链表头节点开始。
- 在循环中：
- 循环结束后，prev 指向原链表的尾节点（新头节点），更新 list.head = prev。

其实就是三指针原地反转

![alt text](https://pic4.zhimg.com/v2-6a742659e12b185569b64a1f773bd993_b.webp)

```javascript
/**
 * 反转单向链表
 * @param {LinkedList} list - 单向链表
 * @returns {LinkedList} - 反转后的链表
 */
function reverseLinkedList(list) {
  let prev = null;
  let current = list.head;
  while (current !== null) {
    let next = current.next; // 暂存下一个节点
    current.next = prev; // 将当前节点的 next 指向前一个节点
    prev = current; // 更新前一个节点为当前节点
    current = next; // 继续遍历下一个节点
  }
  list.head = prev; // 更新头节点为最后一个非空节点
  return list;
}

// 示例：反转链表
const rList = new LinkedList();
rList.append(1);
rList.append(2);
rList.append(3);
rList.print(); // 输出 1 -> 2 -> 3 -> null
reverseLinkedList(rList);
rList.print(); // 输出 3 -> 2 -> 1 -> null
```

##### 合并两个有序链表

**问题描述**：合并两个有序链表，使结果链表仍然有序。

```javascript
/**
 * 合并两个有序链表
 * @param {LinkedList} l1 - 第一个有序链表
 * @param {LinkedList} l2 - 第二个有序链表
 * @returns {LinkedList} - 合并后的有序链表
 */
function mergeTwoLists(l1, l2) {
  let dummy = new ListNode(0); // 创建一个哨兵节点
  let current = dummy;

  let p1 = l1.head;
  let p2 = l2.head;

  // 遍历两个链表
  while (p1 !== null && p2 !== null) {
    if (p1.value < p2.value) {
      current.next = p1; // 将较小值的节点添加到结果链表中
      p1 = p1.next;
    } else {
      current.next = p2;
      p2 = p2.next;
    }
    current = current.next;
  }

  // 将剩余的节点连接到结果链表中
  if (p1 !== null) {
    current.next = p1;
  }
  if (p2 !== null) {
    current.next = p2;
  }

  let mergedList = new LinkedList();
  mergedList.head = dummy.next; // 哨兵节点的 next 为合并后的头节点
  return mergedList;
}

// 示例：合并两个有序链表
const list1 = new LinkedList();
list1.append(1);
list1.append(3);
list1.append(5);
const list2 = new LinkedList();
list2.append(2);
list2.append(4);
list2.append(6);

const mergedList = mergeTwoLists(list1, list2);
mergedList.print(); // 输出 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> null
```


更新中
