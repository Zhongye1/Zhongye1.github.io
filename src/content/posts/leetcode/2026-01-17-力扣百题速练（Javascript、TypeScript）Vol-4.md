---
uuid: 38565450-f3b4-11f0-b54e-479bc980e366
title: 2026-01-17-力扣百题速练（Javascript、TypeScript）Vol-4
mathjax: true
abbrlink: 19198
published: 2026-01-17 22:53:01
category: 力扣
tags:
    - 力扣
    - 算法
    - JavaScript
    - 滑动窗口
---

依旧刷题

## 30.串联所有单词的字串

给定一个字符串 `s` 和一个字符串数组 `words`**。** `words` 中所有字符串 **长度相同**

`s` 中的 **串联子串** 是指一个包含 `words` 中所有字符串以任意顺序排列连接起来的子串

- 例如，如果 `words = ["ab","cd","ef"]`， 那么 `"abcdef"`， `"abefcd"`，`"cdabef"`， `"cdefab"`，`"efabcd"`， 和 `"efcdab"` 都是串联子串。 `"acdbef"` 不是串联子串，因为他不是任何 `words` 排列的连接。

返回所有串联子串在 `s` 中的开始索引。你可以以 **任意顺序** 返回答案。

**示例 1：**

**输入：**`s = "barfoothefoobarman", words = ["foo","bar"]`
**输出：**`[0,9]`
**解释：**`因为 words.length == 2 ` 同时 `words[i].length == 3`，连接的子字符串的长度必须为 6
子串 "barfoo" 开始位置是 0。它是 words 中以 `["bar","foo"]` 顺序排列的连接
子串 "foobar" 开始位置是 9。它是 words 中以 `["foo","bar"]` 顺序排列的连接
输出顺序无关紧要。返回 `[9,0]` 也是可以的

**示例 2：**

**输入：**`s = "wordgoodgoodgoodbestword", words = ["word","good","best","word"]`
**输出：**`[]`
**解释：** 因为 `words.length == 4` 并且 `words[i].length == 4`，所以串联子串的长度必须为 16
s 中没有子串长度为 16 并且等于 words 的任何顺序排列的连接。
所以我们返回一个空数组。

**示例 3：**

**输入：** `s = "barfoofoobarthefoobarman", words = ["bar","foo","the"]`
**输出：** `[6,9,12]`
**解释：** 因为 words.length == 3 并且 words[i].length == 3，所以串联子串的长度必须为 9
子串 "foobarthe" 开始位置是 6。它是 words 中以 `["foo","bar","the"]` 顺序排列的连接
子串 "barthefoo" 开始位置是 9。它是 words 中以 `["bar","the","foo"]` 顺序排列的连接
子串 "thefoobar" 开始位置是 12。它是 words 中以 `["the","foo","bar"]` 顺序排列的连接

滑动窗口 + 哈希表解题

```ts
function findSubstring(s: string, words: string[]): number[] {
    const result: number[] = [];
    if (s.length === 0 || words.length === 0) return result;

    const wordLen = words[0].length; // 每个单词长度
    const totalLen = wordLen * words.length; // 总共需要匹配的长度
    const wordCount = new Map<string, number>(); // 目标单词的频率表

    // 统计目标单词出现次数
    for (const word of words) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }

    // 对每一种可能的起点偏移量进行滑动窗口
    for (let i = 0; i < wordLen; i++) {
        // 当前窗口内已经匹配到的单词数
        let matchCount = 0;
        // 当前窗口的单词频率统计（临时）
        const window = new Map<string, number>();

        // 滑动窗口右边界
        for (let right = i; right + wordLen <= s.length; right += wordLen) {
            // 取出当前单词
            const word = s.substring(right, right + wordLen);

            // 如果这个单词根本不在目标集合里，直接跳过整个窗口
            if (!wordCount.has(word)) {
                // 重置窗口
                window.clear();
                matchCount = 0;
                continue;
            }

            // 记录当前窗口单词出现次数
            window.set(word, (window.get(word) || 0) + 1);

            // 如果当前单词出现次数 ≤ 需要的次数，匹配数+1
            if (window.get(word)! <= wordCount.get(word)!) {
                matchCount++;
            }

            // 窗口大小超过目标长度，需要左移
            if (right - i + wordLen > totalLen) {
                const leftWord = s.substring(i, i + wordLen);
                if (wordCount.has(leftWord)) {
                    if (window.get(leftWord)! <= wordCount.get(leftWord)!) {
                        matchCount--;
                    }
                    window.set(leftWord, window.get(leftWord)! - 1);
                    if (window.get(leftWord) === 0) {
                        window.delete(leftWord);
                    }
                }
                i += wordLen; // 左边界移动
            }

            // 完美匹配
            if (matchCount === words.length) {
                result.push(i);
            }
        }
    }

    return result;
}
```

---
---

## 31.下一个排列

整数数组的一个 **排列** 就是将其所有成员以序列或线性顺序排列。

- 例如，`arr = [1,2,3]` ，以下这些都可以视作 `arr` 的排列：`[1,2,3]`、`[1,3,2]`、`[3,1,2]`、`[2,3,1]` 

整数数组的 **下一个排列** 是指其整数的下一个字典序更大的排列。更正式地，如果数组的所有排列根据其字典顺序从小到大排列在一个容器中，那么数组的 **下一个排列** 就是在这个有序容器中排在它后面的那个排列。如果不存在下一个更大的排列，那么这个数组必须重排为字典序最小的排列（即，其元素按升序排列）。

- 例如，`arr = [1,2,3]` 的下一个排列是 `[1,3,2]` 。
- 类似地，`arr = [2,3,1]` 的下一个排列是 `[3,1,2]` 。
- 而 `arr = [3,2,1]` 的下一个排列是 `[1,2,3]` ，因为 `[3,2,1]` 不存在一个字典序更大的排列。

给你一个整数数组 `nums` ，找出 `nums` 的下一个排列。
必须原地修改，只允许使用额外常数空间。

**示例 1：**
**输入：**`nums = [1,2,3]`
**输出：**`[1,3,2]`

**示例 2：**
**输入：**`nums = [3,2,1]`
**输出：**`[1,2,3]`

**示例 3：**
**输入：**`nums = [1,1,5]`
**输出：**`[1,5,1]`

从右向左，找到第一个位置i，使得`nums[i] < nums[i+1]`，那么`nums[i :-1]`就是我们需要变换的区域
在`nums[i+1 : -1]`自右向左中找到第一个大于`nums[i]`的元素，将它与`nums[i]`交换，此时`nums[i+1 : -1]`是降序的
将`nums[i+1 : -1]`升序排列，即将它们逆序

**解题的话，这道题目其实是一道找规律的题目**

对比一下这两个数字，探究一下是怎样变化的：
143652
145236

后四位都发生了改变，以保证让这个数大一点点。观察到前两位是没有变化的，也就是如果这个数字是3652，那么下一个排列也是5236，与前面的数字暂时无关。
所以，我们其实要关注的是最小的变换区域。这个区域应该是从右向左找，以确保变换后的排列与当前的排列是紧邻的。那么怎样找到这一区域呢？

为什么52不能是变换区域？因为52已经是这两个数字能组成的最大排列了，所以没法再进一步变大，因此不能变换
以此类推，为什么652也不能是变换区域呢？同样是因为已经达到了最大排列

总结一下，降序排列的部分已经达到了最大的排列，不能再增大。也正是处于这一点，我们最终找到了3652，其中3与6不是降序排列的，并且是从右向左查找过程中的第一个升序段，以保证变换的区域最小。

**如何变换？**
我们已经弄清楚了怎样确定变换区域，因此下面将目光集中到这一小段上：

```
3652 ——> 5236
```

我们想要让3652增大，但只增大最小的幅度。由于652已经达到最大，因此以3开头已经达到最大了，所以如果想继续增大，不能再以3开头，要在剩下的数字中比3大、但是只能大一点点的数字进行开头，所以这个数字应该是大于3的数字中最小的，也就是5

现在已经知道了要怎样找下一个开头，接下来仅剩的问题就是除了开头以外的数字怎样排列。换了一个开头，现在其实需要的是这个新的开头的最小排列，因此剩下的数字升序排列就是符合要求的

**算法总结**

**从右向左，找到第一个位置i，使得`nums[i] < nums[i+1]`，那么`nums[i :-1]`就是我们需要变换的区域**
**在`nums[i+1 : -1]`自右向左中找到第一个大于`nums[i]`的元素，将它与`nums[i]`交换，此时`nums[i+1 : -1]`是降序的**
**将`nums[i+1 : -1]`升序排列，即将它们逆序**

感觉面试根本现场想不到，解题思路要背

```ts
function nextPermutation(nums: number[]): void {
    let index = -1;

    for (let i = nums.length - 2; i >= 0; i--) {
        if (nums[i] < nums[i + 1]) {
            index = i;
            break;
        }
    }
    for (let j = nums.length - 1; j > index; j--) {
        if (nums[j] > nums[index]) {
            [nums[index], nums[j]] = [nums[j], nums[index]];
            break;
        }
    }

    let left = index + 1;
    let right = nums.length - 1;
    while (left < right) {
        [nums[left], nums[right]] = [nums[right], nums[left]];
        left++;
        right--;
    }
}
```


## 32. 最长有效括号

给你一个只包含 `'('` 和 `')'` 的字符串，找出最长有效（格式正确且连续）括号 子串 的长度。

左右括号匹配，即每个左括号都有对应的右括号将其闭合的字符串是格式正确的，比如 `"(()())"`。

**示例 1：**

**输入：**`s = "(()"`
**输出：**`2`
**解释：** 最长有效括号子串是 "()"

**示例 2：**

**输入：**`s = ")()())"`
**输出：**`4`
**解释：** 最长有效括号子串是 "()()"

**示例 3：**

**输入：**`s = ""`
**输出：**`0`

解题的话用栈记录「还没匹配的左括号下标」+ 「上一个有效结束位置」
遇到右括号就计算长度，并更新 max_len

```
case     栈操作                 何时更新答案                     长度怎么算
──────   ──────────────────     ─────────────────────────────   ────────────
遇 '('   stack.push(i);         不更新                          —
遇 ')'   先 pop()               —                               —
         ① 弹成功，栈还有东西   更新答案                        i - stack.top()
         ② 弹成功，栈空了       更新答案                        i - (-1) 即 i+1
         ③ 弹失败（栈本来就空） 不更新，把自己当新墙            stack.push(i);
```

```ts
function longestValidParentheses(s: string): number {
    let maxLen = 0;

    for (let i = 0; i < s.length; i++) {
        if (s[i] === "(") {
            stack.push(i);
        } else {
            stack.pop();
            if (stack.length === 0) {
                stack.push(i);
            } else {
                const length = i - stack[stack.length - 1];
                maxLen = Math.max(maxLen, length);
            }
        }
    }
    return maxLen;
}
```

---
---

## 33.搜索旋转排序数组

整数数组 `nums` 按升序排列，数组中的值 **互不相同** 。

在传递给函数之前，`nums` 在预先未知的某个下标 `k`（`0 <= k < nums.length`）上进行了 **向左旋转**，使数组变为 `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]`（下标 **从 0 开始** 计数）。例如， `[0,1,2,4,5,6,7]` 下标 `3` 上向左旋转后可能变为 `[4,5,6,7,0,1,2]` 。

给你 **旋转后** 的数组 `nums` 和一个整数 `target` ，如果 `nums` 中存在这个目标值 `target` ，则返回它的下标，否则返回 `-1` 。

你必须设计一个时间复杂度为 `O(log n)` 的算法解决此问题。

**示例 1：**

**输入：**`nums = [4,5,6,7,0,1,2], target = 0`
**输出：**`4`

**示例 2：**

**输入：**`nums = [4,5,6,7,0,1,2], target = 3`
**输出：**`-1`

**示例 3：**

**输入：** `nums = [1], target = 0`
**输出：** `-1`

主要就是二分的思想，从left和right出发，在 while(left <= right) 循环中，每次计算 mid 后

```
if nums[mid] == target → 直接返回 mid

否则进行分支判断：

情况1：nums[left] <= nums[mid]    ← 左半部分 [left...mid] 是升序的
    此时左边这段是连续有序的
    判断 target 是否落在这段有序区间内：
        如果 nums[left] <= target < nums[mid]  → target 在左半 → right = mid-1
        否则                                 → target 不在左半 → left = mid+1

情况2：nums[left] > nums[mid]     ← 左半部分无序，则右半部分 [mid...right] 必然有序
    判断 target 是否落在右半有序区间内：
        如果 nums[mid] < target <= nums[right]  → target 在右半 → left = mid+1
        否则                                 → target 不在右半 → right = mid-1
```

算法实现如下

```ts
function search(nums: number[], target: number): number {
    let left = 0;
    let right = nums.length - 1;

    let mid = Math.floor(left + right / 2);

    if (nums[mid] === nums[target]) {
        return nums[target];
    }

    // 判断左半边是否有序
    if (nums[left] <= nums[mid]) {
        // 左半边有序
        if (target >= nums[left] && target < nums[mid]) {
            // target 在有序的左半边
            right = mid - 1;
        } else {
            // target 在可能无序的右半边
            left = mid + 1;
        }
    } else {
        // 右半边有序
        if (target > nums[mid] && target <= nums[right]) {
            // target 在有序的右半边
            left = mid + 1;
        } else {
            // target 在可能无序的左半边
            right = mid - 1;
        }
    }
}
```


### 34.在排序数组中找出元素的第一个与最后一个位置

给你一个按照非递减顺序排列的整数数组 `nums`，和一个目标值 `target`。请你找出给定目标值在数组中的开始位置和结束位置。

如果数组中不存在目标值 `target`，返回 `[-1, -1]`。

你必须设计并实现时间复杂度为 `O(log n)` 的算法解决此问题。

**示例 1：**

**输入：**`nums = [`5,7,7,8,8,10]`, target = 8`
**输出：**`[3,4]`

**示例 2：**

**输入：**`nums = [`5,7,7,8,8,10]`, target = 6`
**输出：**`[-1,-1]`

**示例 3：**

**输入：**`nums = [], target = 0`
**输出：**`[-1,-1]`

主要就是二分的思想

从left和right出发,在 while(left <= right) 循环中，每次计算 mid
`if nums[mid] == target`,找到任意一个 target 后，向两侧暴力扩展

以当前 mid 作为初始的左右指针起点（lindex = mid, rindex = mid）
向左扫描：只要左边相邻位置仍然等于 target，就继续左移
向右扫描：只要右边相邻位置仍然等于 target，就继续右移

```ts
function searchRange(nums: number[], target: number): number[] {
    let lf = 0;
    let rg = nums.length - 1;

    while (lf <= rg) {
        let mid = Math.floor((lf + rg) / 2);
        if (nums[mid] === target) {
            let lindex = mid;
            let rindex = mid;
            while (lindex >= 0 && nums[lindex - 1] === target) {
                lindex--;
            }
            while (rindex < nums.length && nums[rindex + 1] === target) {
                rindex++;
            }
            return [lindex, rindex];
        }
        if (target > nums[mid]) {
            lf = mid + 1;
        } else if (target < nums[mid]) {
            rg = mid - 1;
        }
    }
    return [-1, -1];
}
```

---
---

## 35.搜索插入位置

给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

请必须使用时间复杂度为 `O(log n)` 的算法

**示例 1:**

**输入:** `nums = [1,3,5,6], target = 5`
**输出:** `2`

**示例 2:**

**输入:** `nums = [1,3,5,6], target = 2`
**输出:** `1`

**示例 3:**

**输入:** `nums = [1,3,5,6], target = 7`
**输出:** `4`

非常经典的二分查找

```ts
function searchInsert(nums: number[], target: number): number {
    let left = 0;
    let right = nums.length - 1;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) {
            return mid;
        }
        if (nums[mid] > target) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return left;
}
```


## 36.有趣的数独

请你判断一个 `9 x 9` 的数独是否有效。只需要 **根据以下规则** ，验证已经填入的数字是否有效即可。

1. 数字 `1-9` 在每一行只能出现一次。
2. 数字 `1-9` 在每一列只能出现一次。
3. 数字 `1-9` 在每一个以粗实线分隔的 `3x3` 宫内只能出现一次。（请参考示例图）

**注意：**

- 一个有效的数独（部分已被填充）不一定是可解的。
- 只需要根据以上规则，验证已经填入的数字是否有效即可。
- 空白格用 `'.'` 表示。

**示例 1：**

![](https://assets.leetcode.cn/aliyun-lc-upload/uploads/2021/04/12/250px-sudoku-by-l2g-20050714svg.png)

**输入：**

```
board =
[["5","3",".",".","7",".",".",".","."]
,["6",".",".","1","9","5",".",".","."]
,[".","9","8",".",".",".",".","6","."]
,["8",".",".",".","6",".",".",".","3"]
,["4",".",".","8",".","3",".",".","1"]
,["7",".",".",".","2",".",".",".","6"]
,[".","6",".",".",".",".","2","8","."]
,[".",".",".","4","1","9",".",".","5"]
,[".",".",".",".","8",".",".","7","9"]]
```

**输出：** true

**示例 2：**

**输入：**

```
board =
[["8","3",".",".","7",".",".",".","."]
,["6",".",".","1","9","5",".",".","."]
,[".","9","8",".",".",".",".","6","."]
,["8",".",".",".","6",".",".",".","3"]
,["4",".",".","8",".","3",".",".","1"]
,["7",".",".",".","2",".",".",".","6"]
,[".","6",".",".",".",".","2","8","."]
,[".",".",".","4","1","9",".",".","5"]
,[".",".",".",".","8",".",".","7","9"]]
```

**输出：** false
**解释：** 除了第一行的第一个数字从 **5** 改为 **8** 以外，空格内其他数字均与 示例1 相同。 但由于位于左上角的 3x3 宫内有两个 8 存在, 因此这个数独是无效的。

解法很通俗

判断数组有无重复项直接用这个

```ts
const hasDuplicate = (nums) => new Set(nums).size !== nums.length;
```

```ts
function isValidSudoku(board: string[][]): boolean {
    let vali = true;
    for (let ine = 0; ine < 9; ine++) {
        linevali(ine);
        rowvali(ine);
        nnvali(0, 0);
        nnvali(3, 0);
        nnvali(6, 0);

        nnvali(0, 3);
        nnvali(3, 3);
        nnvali(6, 3);

        nnvali(0, 6);
        nnvali(3, 6);
        nnvali(6, 6);
    }

    function KT(arr: number[]) {
        if (new Set(arr).size !== arr.length) {
            vali = false;
        }
    }
    function linevali(num: number) {
        let stk = [];
        for (let i = 0; i < 9; i++) {
            if (board[num][i] !== ".") {
                stk.push(board[num][i]);
            }
        }
        KT(stk);
    }
    function rowvali(num: number) {
        let stk = [];
        for (let i = 0; i < 9; i++) {
            if (board[i][num] !== ".") {
                stk.push(board[i][num]);
            }
        }
        KT(stk);
    }
    function nnvali(HT: number, ST: number) {
        let stk = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[HT + i][ST + j] !== ".") {
                    stk.push(board[HT + i][ST + j]);
                }
            }
        }
        KT(stk);
    }
    return vali;
}
```

---
---

## 37.解数独

（TODO）


## 38.外观数列

「外观数列」是一个数位字符串序列，由递归公式定义：

- `countAndSay(1) = "1"`
- `countAndSay(n)` 是 `countAndSay(n-1)` 的行程长度编码。

[行程长度编码](https://baike.baidu.com/item/%E8%A1%8C%E7%A8%8B%E9%95%BF%E5%BA%A6%E7%BC%96%E7%A0%81/2931940)（RLE）是一种字符串压缩方法，其工作原理是通过将连续相同字符（重复两次或更多次）替换为字符重复次数（运行长度）和字符的串联。例如，要压缩字符串 `"3322251"` ，我们将 `"33"` 用 `"23"` 替换，将 `"222"` 用 `"32"` 替换，将 `"5"` 用 `"15"` 替换并将 `"1"` 用 `"11"` 替换。因此压缩后字符串变为 `"23321511"`。

给定一个整数 `n` ，返回 **外观数列** 的第 `n` 个元素。

**示例 1：**
**输入：**`n = 4`
**输出：**`"1211"`

**解释：**
countAndSay(1) = "1"
countAndSay(2) = "1" 的行程长度编码 = "11"
countAndSay(3) = "11" 的行程长度编码 = "21"
countAndSay(4) = "21" 的行程长度编码 = "1211"

**示例 2：**
**输入：**`n = 1`
**输出：**`"1"`

**解释：**
这是基本情况。

解题的主要步骤：

1. 从初始字符串 "1" 开始
2. 每一轮生成新字符串时：
    - 遍历上一轮字符串
    - 统计**连续相同字符**的个数
    - 遇到不同字符就把「计数+前一个字符」拼接到结果中
    - 最后一组也加上
3. 重复 n-1 次

```ts
function countAndSay(n: number): string {
    let current = "1";
    for (let i = 2; i <= n; i++) {
        let next = "";
        let count = 1;
        for (let j = 1; j < current.length; j++) {
            if (current[j] === current[j - 1]) {
                count++;
            } else {
                next += count + current[j - 1];
                count = 1;
            }
        }

        next += count + current[current.length - 1];
        current = next;
    }

    return current;
}
//runtime:5 ms
//memory:58.6 MB
```

---
---

## 39.组合总和

给你一个 **无重复元素** 的整数数组 `candidates` 和一个目标整数 `target` ，找出 `candidates` 中可以使数字和为目标数 `target` 的 所有 **不同组合** ，并以列表形式返回。你可以按 **任意顺序** 返回这些组合。

`candidates` 中的 **同一个** 数字可以 **无限制重复被选取** 。如果至少一个数字的被选数量不同，则两种组合是不同的。

对于给定的输入，保证和为 `target` 的不同组合数少于 `150` 个

**示例 1：**

**输入：**`candidates = [2,3,6,7], target = 7`
**输出：**`[[2,2,3],[7]]`
**解释：**
2 和 3 可以形成一组候选，2 + 2 + 3 = 7 。注意 2 可以使用多次
7 也是一个候选， 7 = 7
仅有这两种组合

**示例 2：**

**输入:** `candidates = [2,3,5], target = 8`
**输出:** `[[2,2,2,2],[2,3,3],[3,5]]`

**示例 3：**

**输入:** `candidates = [2], target = 1`
**输出:** `[]`

```ts
function combinationSum(candidates: number[], target: number): number[][] {
    const result: number[][] = [];
    const path: number[] = [];

    candidates.sort((a, b) => a - b);

    function bt(start: number, remain: number) {
        if (remain === 0) {
            result.push([...path]);
            return;
        }
        if (remain < 0) {
            return;
        }
        for (let i = start; i < candidates.length; i++) {
            if (candidates[i] > remain) {
                break;
            }
            path.push(candidates[i]);
            bt(i, remain - candidates[i]);
            path.pop();
        }
    }
    bt(0, target);
    return result;
}
```
