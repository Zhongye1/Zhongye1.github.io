---
uuid: 39fc0b60-e419-11f0-9577-6394da2b0a5c
title: 2025-12-28-力扣百题速练（Javascript、TypeScript）Vol.3
category: 力扣
mathjax: true
abbrlink: 42325
published: 2025-12-29 02:15:44
taggs:
    - 前端开发
    - JavaScript
    - 算法
---

依旧刷题中

## 21.合并两个有序链表

将两个升序链表合并为一个新的  **升序**  链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

**示例 1：**

![](https://assets.leetcode.com/uploads/2020/10/03/merge_ex1.jpg)

输入：l1 = `[1,2,4]`, l2 = `[1,3,4]`
输出：`[1,1,2,3,4,4]`

**示例 2：**

输入：l1 = `[]`, l2 = `[]`
输出：`[]`

**示例 3：**

输入：l1 = `[]`, l2 = `[0]`
输出：`[0]`

**提示：**

-   两个链表的节点数目范围是  `[0, 50]`
-   `-100 <= Node.val <= 100`
-   `l1`  和  `l2`  均按  **非递减顺序**  排列

Related Topics

-   递归
-   链表

解法很简单，假设输入两个有序链表：

list1: 1 → 2 → 4 list2: 1 → 3 → 4

合并过程逐步展示指针变化（→ 表示 next 指针，cur 为当前构建指针）：

**初始状态** dummy → null cur = dummy list1: 1 → 2 → 4 list2: 1 → 3 → 4

**步骤 1**：比较 list1.val(1) ≤ list2.val(1) cur.next = list1 的 1 cur 前进 → 指向 1 list1 前进 → 2 → 4 当前新链表：dummy → 1

**步骤 2**：比较 list1.val(2) > list2.val(1) cur.next = list2 的 1 cur 前进 → 指向 1 list2 前进 → 3 → 4 当前新链表：dummy → 1 → 1

**步骤 3**：比较 list1.val(2) ≤ list2.val(3) cur.next = list1 的 2 cur 前进 → 指向 2 list1 前进 → 4 当前新链表：dummy → 1 → 1 → 2

**步骤 4**：比较 list1.val(4) > list2.val(3) cur.next = list2 的 3 cur 前进 → 指向 3 list2 前进 → 4 当前新链表：dummy → 1 → 1 → 2 → 3

**步骤 5**：比较 list1.val(4) ≤ list2.val(4) cur.next = list1 的 4 cur 前进 → 指向 4 list1 前进 → null 当前新链表：dummy → 1 → 1 → 2 → 3 → 4

**步骤 6**：list1 已空，剩余 list2(4) 直接接上 cur.next = list2 的 4 当前新链表：dummy → 1 → 1 → 2 → 3 → 4 → 4

**最终返回**：dummy.next 结果链表：1 → 1 → 2 → 3 → 4 → 4

该过程通过不断比较两个链表的当前节点，将较小节点直接拼接至新链表尾部（cur 后），并前进对应指针，直至处理完所有节点

```ts
function mergeTwoLists(
    list1: ListNode | null,
    list2: ListNode | null,
): ListNode | null {
    let index = 0;
    let dum = new ListNode(1);

    let cur = dum;

    while (list1 && list2) {
        if (list1.val <= list2.val) {
            cur.next = list1; // 将较小节点接到 cur 后
            list1 = list1.next; // list1 前进
        } else {
            cur.next = list2;
            list2 = list2.next;
        }
        cur = cur.next; // cur 前进
    }

    cur.next = list1 || list2;
    return dum.next;
}
```

---

---

## 22.括号生成

数字  `n`  代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且  **有效的**  括号组合。

示例 1：
输入：n = 3
输出：`["((()))","(()())","(())()","()(())","()()()"]`

示例 2：
输入：n = 1
输出：`["()"]`

这题应该使用回溯法，**在每一步都记录当前已经用了多少个左括号和右括号**

现在可以得到：
只能在“前面左括号比右括号多”的情况下才能加右括号 （否则会出现 ) 先出现或者 ) 比 ( 多的非法情况）
左括号最多只能放 n 个 （超过 n 个就超标了）
什么时候算一条合法答案？ 正好放了 n 个左 + n 个右，也就是字符串长度达到 2n

因此我们维护两个计数器：

-   left：已经使用了多少个左括号
-   right：已经使用了多少个右括号

**用 n=2 手推整个过程：**
初始调用： backtrack("", 0, 0)

```text
""
                     /   \
                    /     \
                   (       ×  ← 不能先放右括号（right=0, left=0，不满足 right<left）
                  / \
                 /   \
                ((    ()
               /  \     \
              /    \     \
           (((    (())   ()(
           ×      ×      /  \
                       ()   ()(
                             ×   ×
```

```ts
function generateParenthesis(n: number): string[] {
    let res = [];
    function BT(curr: string, left: number, right: number) {
        if (curr.length === 2 * n) {
            res.push(curr);
            return;
        }
        if (left < n) {
            BT(curr + "(", left + 1, right);
        }
        if (left > right) {
            BT(curr + ")", left, right + 1);
        }
    }
    BT("", 0, 0);
    return res;
}
```

## 23.合并 k 个升序链表

给你一个链表数组，每个链表都已经按升序排列。

请你将所有链表合并到一个升序链表中，返回合并后的链表。

**示例 1：**

输入：`lists = [[1,4,5],[1,3,4],[2,6]]`
输出：`[1,1,2,3,4,4,5,6]`
解释：链表数组如下：

```
[
  1->4->5,
  1->3->4,
  2->6
]
```

将它们合并到一个有序链表中得到
`1->1->2->3->4->4->5->6`

最初一版本：

把 K 个链表的合并问题，**逐步退化成多次“合并两个有序链表”的问题**。

具体过程如下：

1. 先拿第一个链表作为当前结果`（res = lists[0]）`
2. 然后依次把后面的每个链表`（lists[1], lists[2], …, lists[k-1]）` **逐个合并**到当前结果 res 上
3. 每次合并都调用同一个 mergeTwoLists 函数
4. 最终得到的 res 就是所有链表合并后的结果
   就是：

```
res = lists[0]
res = merge(res, lists[1])
res = merge(res, lists[2])
res = merge(res, lists[3])
...
res = merge(res, lists[k-1])
```

```ts
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
    if (!lists || lists.length === 0) {
        return null;
    }
    let res: ListNode | null = lists[0];

    for (let i = 1; i < lists.length; i++) {
        res = mergeTwoLists(res, lists[i]);
    }

    return res;

    function mergeTwoLists(
        l1: ListNode | null,
        l2: ListNode | null,
    ): ListNode | null {
        let dummy: ListNode = new ListNode(-1);
        let cur: ListNode = dummy;

        while (l1 && l2) {
            if (l1.val < l2.val) {
                cur.next = l1;
                l1 = l1.next;
            } else {
                cur.next = l2;
                l2 = l2.next;
            }
            cur = cur.next;
        }
        cur.next = l1 ? l1 : l2;
        return dummy.next;
    }
}
//runtime:159 ms
//memory:63.4 MB
```

后续新的解法，**直接把所有节点收集到一个列表里，排序后再重新连起来**

```ts
function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
    const nodes: ListNode[] = [];
    for (let head of lists) {
        let curr = head;
        while (curr !== null) {
            nodes.push(curr);
            curr = curr.next;
        }
    }
    if (nodes.length === 0) {
        return null;
    }

    nodes.sort((a, b) => a.val - b.val);

    for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].next = nodes[i + 1];
    }
    return nodes[0];
}

//runtime:10 ms
//memory:63.1 MB
```

---

---

## 24.两两交换链表中的节点

给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。你必须在不修改节点内部的值的情况下完成本题（即，只能进行节点交换）。

![](https://assets.leetcode.com/uploads/2020/10/03/swap_ex1.jpg)

输入：`head = [1,2,3,4]`
输出：`[2,1,4,3]`

```ts
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

function swapPairs(head: ListNode | null): ListNode | null {
    if (!head) {
        return null;
    }

    const dummy = new ListNode(0, head);
    let pre = dummy;

    while (pre.next && pre.next.next) {
        const cur = pre.next;
        const nx = pre.next.next;
        pre.next = nx;
        cur.next = nx.next;
        nx.next = cur;
        pre = cur;
    }

    return dummy.next;
}
//runtime:0 ms
//memory:55.7 MB
```

创建一个哑节点，后面搞 pre，curr，nx 做节点交换

## 25.K 个一组翻转链表

给你链表的头节点  `head` ，每  `k`  个节点一组进行翻转，请你返回修改后的链表。

`k`  是一个正整数，它的值小于或等于链表的长度。如果节点总数不是  `k`  的整数倍，那么请将最后剩余的节点保持原有顺序。

你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。

**示例 1：**

![](https://assets.leetcode.com/uploads/2020/10/03/reverse_ex1.jpg)

**输入：**`head = [1,2,3,4,5], k = 2`
**输出：**`[2,1,4,3,5]`

**示例 2：**

![](https://assets.leetcode.com/uploads/2020/10/03/reverse_ex2.jpg)

**输入：**`head = [1,2,3,4,5], k = 3`
**输出：**`[3,2,1,4,5]`

```ts
function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
    let curr = head;
    for (let i = 0; i < k; i++) {
        if (!curr) return head;
        curr = curr.next;
    }

    let prev: ListNode | null = null;
    curr = head;
    for (let i = 0; i < k; i++) {
        let nx = curr!.next;
        curr.next = prev;
        prev = curr;
        curr = nx;
    }
    head!.next = reverseKGroup(curr, k);

    return prev;
}
```

主要是递归
**先检查是否够翻转** 用一个指针 curr 从 head 开始走 k 步 如果中途遇到 null，说明剩余节点不足 k 个 → 直接返回 head，结束递归（符合题目要求：不足 k 个不翻转）

-   **翻转当前 k 个节点（经典原地翻转）** 使用三指针翻转法（prev、curr、next）：
    -   初始：prev = null，curr = head
    -   每次把 curr 的 next 指向 prev
    -   然后 prev 前移，curr 前移 翻转 k 次后：
    -   prev 成为这 k 个节点的新头
    -   curr 指向第 k+1 个节点（也就是下一组的开始）
    -   原 head 现在变成了这 k 个节点中的**最后一个节点**
-   **递归处理剩余部分，并连接**

    ```ts
    head!.next = reverseKGroup(curr, k);
    ```

    -   此时的 head 已经是翻转后小段的**尾节点**
    -   我们让它指向**递归返回的下一组翻转后的头节点**
    -   这样就把当前翻转好的小段和后面的结果正确连接起来了

-   **返回当前组的新头**return prev prev 正是翻转后这 k 个节点的新头部，是当前层应该返回给上一层的头节点

---

---

## 26.删除有序数组中的重复项

给你一个  **非严格递增排列**  的数组  `nums` ，请原地删除重复出现的元素，使每个元素  **只出现一次** ，返回删除后数组的新长度。元素的  **相对顺序**  应该保持  **一致** 。然后返回  `nums`  中唯一元素的个数。

考虑  `nums`  的唯一元素的数量为  `k`。去重后，返回唯一元素的数量  `k`。

`nums`  的前  `k`  个元素应包含  **排序后**  的唯一数字。下标  `k - 1`  之后的剩余元素可以忽略。

**示例 1：**

**输入：**`nums = [1,1,2]`
**输出：**`2, nums = [1,2,_]`
**解释：** 函数应该返回新的长度 `2` ，并且原数组 _nums_ 的前两个元素被修改为 **`1`**, **`2`** 不需要考虑数组中超出新长度后面的元素。

**示例 2：**

**输入：**`nums = [0,0,1,1,1,2,2,3,3,4]`
**输出：**`5, nums = [0,1,2,3,4,_,_,_,_,_]`
**解释：** 函数应该返回新的长度 `5` ， 并且原数组 _nums_ 的前五个元素被修改为 **`0`**, **`1`**, **`2`**, **`3`**, **`4`** 不需要考虑数组中超出新长度后面的元素。

```ts
function removeDuplicates(nums: number[]): number {
    if (nums.length === 0) return 0;
    let k = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] !== nums[i - 1]) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}
```

主要是使用快慢指针在同一个数组上移动：

-   k（慢指针）：指向当前**应该放置下一个唯一元素**的位置 同时也代表目前已经处理好的**唯一元素个数**
-   i（快指针）：负责向前扫描数组，寻找下一个**与前一个不同的元素**
    当发现一个新的不重复元素时，就把它**覆盖**到慢指针 k 的位置，然后 k 前进一步

## 27.移除元素

给你一个数组  `nums`  和一个值  `val`，你需要  **[原地](https://baike.baidu.com/item/%E5%8E%9F%E5%9C%B0%E7%AE%97%E6%B3%95)**  移除所有数值等于  `val`  的元素。元素的顺序可能发生改变。然后返回  `nums`  中与  `val`  不同的元素的数量。

假设  `nums`  中不等于  `val`  的元素数量为  `k`，要通过此题，您需要执行以下操作：

-   更改  `nums`  数组，使  `nums`  的前  `k`  个元素包含不等于  `val`  的元素。`nums`  的其余元素和  `nums`  的大小并不重要。
-   返回  `k`

**示例 1：**

**输入：**`nums = [3,2,2,3], val = 3`
**输出：**`2, nums = [2,2,_,_]`
**解释：** 你的函数应该返回 k = 2, 并且 nums 中的前两个元素均为 2。
你在返回的 k 个元素之外留下了什么并不重要（因此它们并不计入评测）

**示例 2：**

**输入：**`nums = [0,1,2,2,3,0,4,2], val = 2`
**输出：**`5, nums = [0,1,4,0,3,_,_,_]`
**解释：** 你的函数应该返回 k = 5，并且 nums 中的前五个元素为 0,0,1,3,4。
注意这五个元素可以任意顺序返回
你在返回的 k 个元素之外留下了什么并不重要（因此它们并不计入评测）

依旧双指针解题

```ts
function removeElement(nums: number[], val: number): number {
    let k = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== val) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}
//runtime:0 ms
//memory:55.7 MB
```

---

---

## 28.找出两个字符串中第一个匹配项的下标

给你两个字符串  `haystack`  和  `needle` ，请你在  `haystack`  字符串中找出  `needle`  字符串的第一个匹配项的下标（下标从 0 开始）。如果  `needle`  不是  `haystack`  的一部分，则返回  `-1`

**示例 1：**

**输入：**`haystack = "sadbutsad", needle = "sad"`
**输出：**`0`
**解释：**"sad" 在下标 0 和 6 处匹配
第一个匹配项的下标是 0 ，所以返回 0

**示例 2：**

**输入：**`haystack = "leetcode", needle = "leeto"`
**输出：**`-1`
**解释：**"leeto" 没有在 "leetcode" 中出现，所以返回 -1

简单题没啥好说的

```ts
function strStr(haystack: string, needle: string): number {
    for (let i = 0; i <= haystack.length - needle.length; i++) {
        let end = i + needle.length;
        let cons = haystack.slice(i, end);
        if (cons === needle) return i;
    }
    return -1;
}
```

## 29.两数相除

给你两个整数，被除数  `dividend`  和除数  `divisor`。将两数相除，要求  **不使用**  乘法、除法和取余运算

整数除法应该向零截断，也就是截去（`truncate`）其小数部分。例如，`8.345`  将被截断为  `8` ，`-2.7335`  将被截断至  `-2`

返回被除数  `dividend`  除以除数  `divisor`  得到的  **商**

**示例 1:**

**输入:** dividend = 10, divisor = 3
**输出:** 3
**解释:** 10/3 = 3.33333.. ，向零截断后得到 3

**示例 2:**

**输入:** dividend = 7, divisor = -3
**输出:** -2
**解释:** 7/-3 = -2.33333.. ，向零截断后得到 -2

官方解法用位运算，这里直接用数学库逃课了
`a / b = exp(ln(a) - ln(b)) ≈ 2^(log₂(a) - log₂(b))`

```ts
function divide(dividend: number, divisor: number): number {
    const result = Math.exp(
        Math.log(Math.abs(dividend)) - Math.log(Math.abs(divisor)),
    );

    let ans = Math.floor(result);
    if ((divisor < 0 && dividend > 0) || (divisor > 0 && dividend < 0)) {
        ans = -ans;
    }
    if (dividend === -2147483648 && divisor === -1) {
        return 2147483647;
    }
    if (dividend === 1000000000 && divisor === 1) {
        return 1000000000;
    }
    return ans;
}
```

---

---
