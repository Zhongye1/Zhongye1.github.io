---
uuid: fc8d2090-e24a-11f0-83d7-7339c4cb9ff5
title: 2025-12-26-力扣百题速练（Javascript、TypeScript）Vol.2
mathjax: true
abbrlink: 39620
published: 2025-12-26 13:57:08
category: 力扣
tags:
    - 力扣
    - 算法
    - JavaScript
    - 双指针
---

这里是力扣速刷第二期awa
说是速刷其实卡了挺久


<img src='https://picx.zhimg.com/v2-1e47d2da440013ae7d4262f54c26dd52_720w.webp?source=d16d100b' style='height=100px'>


## 11. 盛最多水的容器

给定一个长度为  `n`  的整数数组  `height` 。有  `n`  条垂线，第  `i`  条线的两个端点是  `(i, 0)`  和  `(i, height[i])` 
找出其中的两条线，使得它们与  `x`  轴共同构成的容器可以容纳最多的水
返回容器可以储存的最大水量

输入：[1,8,6,2,5,4,8,3,7] 
输出：49 
解释：图中垂直线代表输入数组 [1,8,6,2,5,4,8,3,7]。在此情况下，容器能够容纳水（表示为蓝色部分）的最大值为 49

最开始直接暴力解

```ts
function maxArea(height: number[]): number {
  let res = 0;
  let i = 0;
  let j = 1;

  for (i = 0; i < height.length - 1; i++) {
    for (j = 1; j < height.length; j++) {
      let xin = (j - i) * Math.min(height[i], height[j]);
      if (xin > res) {
        res = xin;
      }
    }
  }
  return res;
}
```

后面想了一下，做了些改进

```ts
function maxArea(height: number[]): number {
  let res = 0;
  let i = 0;
  let j = height.length - 1;

  while (i < j) {
    let fin = Math.min(height[i], height[j]) * (j - i);
    if (fin > res) {
      res = fin;
    }
    if (height[i] < height[j]) {
      i++;
    } else {
      j--;
    }
  }
  return res;
}
```

初始时宽度最大，若当前面积不是最大，则必须通过增加高度来补偿宽度损失
移动较短指针是因为：保持较短边不动，宽度只会变小，面积不可能增大；只有移动较短边才可能遇到更高的高度，从而提升面积

经典双指针加贪心的题

---
---

## 12.整数转罗马数字

七个不同的符号代表罗马数字，其值如下：

| 符号 | 值   |
| ---- | ---- |
| I    | 1    |
| V    | 5    |
| X    | 10   |
| L    | 50   |
| C    | 100  |
| D    | 500  |
| M    | 1000 |

罗马数字是通过添加从最高到最低的小数位值的转换而形成的。将小数位值转换为罗马数字有以下规则：

- 如果该值不是以 4 或 9 开头，请选择可以从输入中减去的最大值的符号，将该符号附加到结果，减去其值，然后将其余部分转换为罗马数字。
- 如果该值以 4 或 9 开头，使用  **减法形式**，表示从以下符号中减去一个符号，例如 4 是 5 (`V`) 减 1 (`I`): `IV` ，9 是 10 (`X`) 减 1 (`I`)：`IX`。仅使用以下减法形式：4 (`IV`)，9 (`IX`)，40 (`XL`)，90 (`XC`)，400 (`CD`) 和 900 (`CM`)。
- 只有 10 的次方（`I`, `X`, `C`, `M`）最多可以连续附加 3 次以代表 10 的倍数。你不能多次附加 5 (`V`)，50 (`L`) 或 500 (`D`)。如果需要将符号附加 4 次，请使用  **减法形式**。

给定一个整数，将其转换为罗马数字。

**示例 1：**

\*\*输入：num = 3749

**输出：** "MMMDCCXLIX"

**解释：**

3000 = MMM 由于 1000 (M) + 1000 (M) + 1000 (M)
700 = DCC 由于 500 (D) + 100 (C) + 100 (C)
40 = XL 由于 50 (L) 减 10 (X)
9 = IX 由于 10 (X) 减 1 (I)
注意：49 不是 50 (L) 减 1 (I) 因为转换是基于小数位

**示例 2：**

\*\*输入：num = 58

**输出：**"LVIII"

**解释：**

50 = L
8 = VIII

**示例 3：**

\*\*输入：num = 1994

**输出：**"MCMXCIV"

**解释：**

1000 = M
900 = CM
90 = XC
4 = IV

最初想法是尝试通过**逐位处理数字**的方式将整数转换为罗马数字：

1. **将数字转换为字符串并反转**： 使用 reverseString(num.toString()) 将数字从高位到低位变为低位到高位（例如 1994 → "4991"）,从个位开始依次处理每个数位（个位、十位、百位、千位）
2. **为每个数位定义对应的罗马符号**：
   - `个位（i===0）：1→"I", 5→"V", 10→"X"`
   - `十位（i===1）：1→"X", 5→"L", 10→"C"`
   - `百位（i===2）：1→"C", 5→"D", 10→"M"`
   - `千位（i===3）：直接用 "M" 重复`
3. **根据当前位上的数字（0-9）生成对应罗马表示**：
   - 1-3：重复添加 "1" 的符号（curr1）
   - 4：curr1 + curr2（如 "IV"）
   - 5：curr2（如 "V"）
   - 6-8：curr2 + 重复 (digit-5) 次 curr1
   - 9：curr1 + curr3（如 "IX"）
4. **使用数组 + unshift 收集符号**： 因为已反转数字，低位先处理，使用 unshift（从数组头部插入）试图让高位符号最终出现在前面
5. **最后 join 成字符串返回**

```ts
function intToRoman(num: number): string {
  let curr1 = "";
  let curr2 = "";
  let curr3 = "";
  const reverseString = (str: string): string =>
    str.split("").reverse().join("");

  let top = reverseString(num.toString());
  let l = top.length;

  let finalstr: string[] = [];
  let i = 0;

  function nums(pos: number) {
    const di = Number(top[pos]);
    if (di === 0) return;

    if (di <= 3) {
      for (let j = 0; j < di; j++) {
        finalstr.unshift(curr1);
      }
    } else if (di === 4) {
      finalstr.unshift(curr1 + curr2);
    } else if (di === 5) {
      finalstr.unshift(curr2);
    } else if (di <= 8) {
      for (let j = 0; j < di - 5; j++) {
        finalstr.unshift(curr1);
      }
      finalstr.unshift(curr2);
    } else if (di === 9) {
      finalstr.unshift(curr1 + curr3);
    }
  }
  while (i < l) {
    if (i === 0) {
      curr1 = "I";
      curr2 = "V";
      curr3 = "X";
      nums(i);
      i++;
    }

    if (i === 1) {
      curr1 = "X";
      curr2 = "L";
      curr3 = "C";
      nums(i);
      i++;
    }

    if (i === 2) {
      curr1 = "C";
      curr2 = "D";
      curr3 = "M";
      nums(i);
      i++;
    }

    if (i === 3) {
      const vas = Number(top[i]);
      for (let j = 0; j < vas; j++) {
        finalstr.unshift("M");
      }
      i++;
    }
  }
  return finalstr.join("");
}
```

题目标准解法是**贪心算法 + 值-符号映射表**，从高位到低位匹配最大可能值，这个写法确实没有想出来：

```TypeScript
function intToRoman(num: number): string {
    const valueSymbols: [number, string][] = [
        [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
        [100,  "C"], [90,  "XC"], [50,  "L"], [40,  "XL"],
        [10,   "X"], [9,   "IX"], [5,   "V"], [4,   "IV"],
        [1,    "I"]
    ];

    let result = '';
    for (const [value, symbol] of valueSymbols) {
        while (num >= value) {
            result += symbol;
            num -= value;
        }
    }
    return result;
}
```


## 13. 罗马数字转整数

罗马数字包含以下七种字符: `I`， `V`， `X`， `L`，`C`，`D`  和  `M`。

**字符** **数值**
I 1
V 5
X 10
L 50
C 100
D 500
M 1000

例如， 罗马数字  `2`  写做  `II` ，即为两个并列的 1 。`12`  写做  `XII` ，即为  `X` + `II` 。 `27`  写做  `XXVII`, 即为  `XX` + `V` + `II` 。

通常情况下，罗马数字中小的数字在大的数字的右边。但也存在特例，例如 4 不写做  `IIII`，而是  `IV`。数字 1 在数字 5 的左边，所表示的数等于大数 5 减小数 1 得到的数值 4 。同样地，数字 9 表示为  `IX`。这个特殊的规则只适用于以下六种情况：

- `I`  可以放在  `V` (5) 和  `X` (10) 的左边，来表示 4 和 9。
- `X`  可以放在  `L` (50) 和  `C` (100) 的左边，来表示 40 和 90。
- `C`  可以放在  `D` (500) 和  `M` (1000) 的左边，来表示 400 和 900。

给定一个罗马数字，将其转换成整数。

**示例 1:**

**输入:** s = "III"
**输出:** 3

**示例 2:**

**输入:** s = "IV"
**输出:** 4

**示例 3:**

**输入:** s = "IX"
**输出:** 9

**示例 4:**

**输入:** s = "LVIII"
**输出:** 58
**解释:** L = 50, V= 5, III = 3.

**示例 5:**

**输入:** s = "MCMXCIV"
**输出:** 1994
**解释:** M = 1000, CM = 900, XC = 90, IV = 4.

直接从左到右遍历字符串，比较当前符号与下一个符号的值：

- 如果当前值 < 下一个值，则减去当前值（形成减法组合）。
- 否则加上当前值

```ts
function romanToInt(s: string): number {
  const map = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let res = 0;

  for (let i = 0; i < s.length; i++) {
    const current = map[s[i]];
    const next = map[s[i + 1]];

    if (next && current < next) {
      res += next - current;
      i++;
    } else {
      res += current;
    }
  }
  return res;
}
```

---
---

## 14. 最长公共前缀

编写一个函数来查找字符串数组中的最长公共前缀

如果不存在公共前缀，返回空字符串  `""`

**示例 1：**

输入：strs = ["flower","flow","flight"]
输出："fl"

**示例 2：**

输入：strs = ["dog","racecar","car"]
输出：""
解释：输入不存在公共前缀

题解比较简单，如下

```ts
function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) return "";

  for (let i = 0; i < strs[0].length; i++) {
    const char = strs[0][i];
    for (let j = 1; j < strs.length; j++) {
      if (i === strs[j].length || strs[j][i] !== char) {
        return strs[0].substring(0, i);
      }
    }
  }
  return strs[0];
}
```

主要就是注意一个写法，在 JavaScript（以及 TypeScript）中，`strs[0][i]` 是一种链式索引访问（chained indexing）的写法，用于访问二维结构或嵌套可索引对象中的元素

假设 `strs = ["flower", "flow", "flight"]`，循环变量 `i = 2` 时：

- `strs[0] → "flower"`
- `strs[0][2] → "flower"` 的第 2 个字符 → `'o'`

同理：

- `strs[1][2] → "flow"[2] → 'o'`
- `strs[2][2] → "flight"[2] → 'i'`

通过比较 `strs[0][i] `与其他字符串的 `strs[j][i]` 是否相等，来判断第 i 位置是否仍属于公共前缀

### 等价的写法

```ts
const firstStr = strs[0];
firstStr[i];

// 使用 charAt 方法
strs[0].charAt(i);

// 使用 at 方法 ES2022+
strs[0].at(i);
```


## 15. 三数之和

一个整数数组  `nums` ，判断是否存在三元组  `[nums[i], nums[j], nums[k]]`  满足  `i != j`、`i != k`  且  `j != k` ，同时还满足  `nums[i] + nums[j] + nums[k] == 0` ，返回所有和为  `0`  且不重复的三元组，且答案中不可以包含重复的三元组

示例 1：
输入：`nums = [-1,0,1,2,-1,-4]`
输出：`[[-1,-1,2],[-1,0,1]]`
解释：
`nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0 `
`nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0 `
`nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0 `
不同的三元组是 `[-1,0,1] `和 `[-1,-1,2] `

示例 2：
输入：`nums = [0,1,1]`
输出：`[]`
解释：唯一可能的三元组和不为 0

示例 3：
输入：`nums = [0,0,0]`
输出：`[[0,0,0]]`
解释：唯一可能的三元组和为 0

最开始是想直接 n^3 暴力解，然后用 Set 去重

```ts
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const result: number[][] = [];
  const seen = new Set<string>();

  for (let i = 0; i < nums.length - 2; i++) {
    for (let j = i + 1; j < nums.length - 1; j++) {
      for (let k = j + 1; k < nums.length; k++) {
        if (nums[i] + nums[j] + nums[k] === 0) {
          const triplet = [nums[i], nums[j], nums[k]];
          const key = triplet.join(",");
          if (!seen.has(key)) {
            seen.add(key);
            result.push(triplet);
          }
        }
      }
    }
  }

  return result;
}
```

很明显，时间复杂度特别高，直接爆了

解法的话依旧双指针降维

### 第一步：排序

排序后可以：利用有序数组的特性，通过指针移动快速缩小范围

比如原数组是 `[-1,0,1,2,-1,-4]`，排序后变成 `[-4,-1,-1,0,1,2]`。这时候，相同的元素（比如两个 `-1`）会挨在一起，方便后续去重（重复元素会相邻，容易跳过）

### 第二步：固定一个数，双指针找另外两个数

排序后，我们固定第一个数 `nums[i]`，然后用左指针 `left` 指向 `i+1`，右指针 `right` 指向数组末尾。三个数的和 `sum = nums[i] + nums[left] + nums[right]`：

- 如果 `sum < 0`：说明需要更大的数，左指针右移（`left++`）；
- 如果 `sum > 0`：说明需要更小的数，右指针左移（`right--`）；
- 如果 `sum = 0`：找到一个有效三元组，记录结果。

### 第三步：去重

具体分三种情况：

#### 1. 固定数 `nums[i]` 重复

比如排序后的数组是 `[-4,-1,-1,0,1,2]`，当 `i=1`（`nums[i]=-1`）时，和 `i=2`（`nums[i]=-1`）时的情况是一样的。这时候需要跳过重复的 `nums[i]`。

**判断条件**：如果 `i > 0` 且 `nums[i] === nums[i-1]`，说明当前 `nums[i]` 和前一个数重复，直接跳过。

#### 2. 左指针 `nums[left]` 重复

假设已经找到 `i=0`（`nums[i]=-4`），`left=1`（`nums[left]=-1`），`right=5`（`nums[right]=2`），此时和为 `-4 + (-1) + 2 = -3`，不满足条件。左指针右移到 `left=2`（`nums[left]=-1`），这时候 `nums[left]` 和前一个 `left` 位置的数重复，需要跳过。

**判断条件**：当找到和为 0 的三元组后，需要循环判断 `nums[left] === nums[left+1]`，如果是，左指针右移，直到遇到不同的数。

#### 3. 右指针 `nums[right]` 重复

同样，找到和为 0 的三元组后，如果 `nums[right]` 和前一个 `right` 位置的数重复（比如 `nums[right]=1` 和 `nums[right-1]=1`），需要跳过。

**判断条件**：循环判断 `nums[right] === nums[right-1]`，如果是，右指针左移，直到遇到不同的数。

1. **先排序**：nums.sort((a, b) => a - b)，使得相同元素相邻，便于跳过重复。
2. **外层循环跳过重复的 i**：如果当前 nums[i] 与前一个相同，则跳过（避免同一值的 i 产生重复三元组）。
3. **内层双指针移动时跳过重复的 left 和 right**：找到一个有效三元组后，跳过所有相同的 left 和 right 值。

```ts
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b); // 先排序，关键一步
  const result: number[][] = [];

  for (let i = 0; i < nums.length - 2; i++) {
    // 跳过重复的 nums[i]
    if (i > 0 && nums[i] === nums[i - 1]) {
      continue;
    }

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]); //加入结果

        // 跳过重复的 left
        while (left < right && nums[left] === nums[left + 1]) {
          left++;
        }
        // 跳过重复的 right
        while (left < right && nums[right] === nums[right - 1]) {
          right--;
        }

        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}
```

## 16. 最接近的三数之和

给你一个长度为  `n`  的整数数组  `nums`  和 一个目标值  `target`。请你从  `nums`  中选出三个整数，使它们的和与  `target`  最接近，返回这三个数的和
假定每组输入只存在恰好一个解

示例：
输入：nums = `[-1,2,1,-4]` , `target = 1`
输出：2
解释：与 target 最接近的和是 2 (-1 + 2 + 1 = 2)

解法和三数之和一样都是双指针解题
多一些判断而已

```ts
function threeSumClosest(nums: number[], target: number): number {
  nums.sort((a, b) => a - b);
  let closestSum = nums[0] + nums[1] + nums[2];
  let minDiff = Math.abs(closestSum - target);

  for (let i = 0; i < nums.length - 2; i++) {
    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      const diff = Math.abs(sum - target);

      if (diff < minDiff) {
        minDiff = diff;
        closestSum = sum;
      }

      if (sum < target) {
        left++;
      } else if (sum > target) {
        right--;
      } else {
        return sum;
      }
    }
  }
  return closestSum;
}
```

---
---

## 17.电话号码的的数字组合

给定一个仅包含数字  `2-9`  的字符串，返回所有它能表示的字母组合。答案可以按  **任意顺序**  返回。

给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。

<img src="https://pic.leetcode.cn/1752723054-mfIHZs-image.png" alt="电话按键" width="300" />

示例 1：
输入：digits = "23"
输出：["ad","ae","af","bd","be","bf","cd","ce","cf"]

示例 2：
输入：digits = "2"
输出：["a","b","c"]

练度不够，还得继续练

主要解法是迭代法：

- 外层循环遍历 digits 中的每一个数字（从左到右）。
- 对于当前数字 digit：
- 一轮结束后，将 temp 赋值给 result，成为下一轮的“已有组合”。

```ts
function letterCombinations(digits: string): string[] {
  if (digits.length === 0) return [];

  const map: { [key: string]: string } = {
    "2": "abc",
    "3": "def",
    "4": "ghi",
    "5": "jkl",
    "6": "mno",
    "7": "pqrs",
    "8": "tuv",
    "9": "wxyz",
  };

  let result: string[] = [""];

  for (const digit of digits) {
    const letters = map[digit];
    const temp: string[] = [];

    for (const prev of result) {
      for (const letter of letters) {
        temp.push(prev + letter);
      }
    }
    result = temp;
  }

  return result;
}
```

从“空组合”开始，依次将每个新数字的字母可能性“横向扩展”到所有已有组合上，最终得到所有完整组合


## 18.四数之和

给你一个由  `n`  个整数组成的数组  `nums` ，和一个目标值  `target` 。请你找出并返回满足下述全部条件且**不重复**的四元组  `[nums[a], nums[b], nums[c], nums[d]]` （若两个四元组元素一一对应，则认为两个四元组重复）：

- `0 <= a, b, c, d < n`
- `a`、`b`、`c`  和  `d`  互不相同
- `nums[a] + nums[b] + nums[c] + nums[d] == target`

输入：`nums = [1,0,-1,0,-2,2]`, `target = 0`
输出：`[[-2,-1,1,2] , [-2,0,0,2] , [-1,0,0,1]]`

输入：`nums = [2,2,2,2,2]`, `target = 8`
输出：`[[2,2,2,2]]`

**就是三数之和的基础上再套上一层 for 循环**

题解

```ts
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
function(nums, target) {
    nums.sort((a, b) => a - b);  // 先排序
    const n = nums.length;
    const result = [];

    if (n < 4) return result;

    for (let i = 0; i < n - 3; i++) {
        // 去重 i
        if (i > 0 && nums[i] === nums[i - 1]) continue;

        // 剪枝：当前四个最小值之和已大于 target，直接终止
        if (nums[i] + nums[i + 1] + nums[i + 2] + nums[i + 3] > target) break;

        // 剪枝：当前 i 与后面三个最大值之和小于 target，跳过本次 i
        if (nums[i] + nums[n - 3] + nums[n - 2] + nums[n - 1] < target) continue;

        for (let j = i + 1; j < n - 2; j++) {
            // 去重 j
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;

            // 剪枝
            if (nums[i] + nums[j] + nums[j + 1] + nums[j + 2] > target) break;
            if (nums[i] + nums[j] + nums[n - 2] + nums[n - 1] < target) continue;

            let left = j + 1;
            let right = n - 1;

            while (left < right) {
                const sum = nums[i] + nums[j] + nums[left] + nums[right];

                if (sum === target) {
                    result.push([nums[i], nums[j], nums[left], nums[right]]);

                    // 去重 left
                    while (left < right && nums[left] === nums[left + 1]) left++;
                    // 去重 right
                    while (left < right && nums[right] === nums[right - 1]) right--;

                    left++;
                    right--;
                } else if (sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
    }

    return result;
};
```

---
---

## 19. 删除链表的第 n 个节点

给你一个链表，删除链表的倒数第  `n`  个结点，并且返回链表的头结点

输入：head = [1,2,3,4,5], n = 2
输出：[1,2,3,5]

输入：head = [1], n = 1
输出：[]

自己写的一版，思路主要是遍历一趟链表搞到 length，再用 n 确定 index 来定位要删的位置，最后再删掉该节点

```ts
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  let len = 0;
  let curr = head;
  while (curr !== null) {
    len++;
    curr = curr.next;
  }

  if (len === n) {
    return head?.next ?? null;
  }

  let index = len - n - 1;
  let delindex = 0;

  let del = head;
  let prev = new ListNode(0);
  prev.next = head;
  while (del !== null) {
    prev = prev.next;
    del = del.next;
    if (delindex === index) {
      prev.next = del.next;
    }
    delindex++;
  }
  return head;
}
```

题解的话主要是用快慢指针,这个思路挺不错的其实

- 引入虚拟头结点 dummy
- 让 fast 指针先走 n 步
- 然后 slow 与 fast 同步移动，当 fast 到达末尾时，slow 指向的就是倒数第 n 个节点的前一个节点
- 执行 slow.next = slow.next.next 删除目标节点

```ts
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  // 边界：空链表或 n 无效直接返回
  if (head === null) return null;

  const dummy = new ListNode(0);
  dummy.next = head;

  let fast: ListNode | null = dummy;
  let slow: ListNode | null = dummy;

  // fast 先走 n 步
  for (let i = 0; i < n; i++) {
    fast = fast!.next; // n 合法时不会为 null
  }

  // fast 和 slow 同步移动，直到 fast 到达末尾
  while (fast!.next !== null) {
    fast = fast!.next;
    slow = slow!.next;
  }

  // 此时 slow 指向倒数第 n 个节点的前一个节点
  if (slow!.next !== null) {
    slow!.next = slow!.next.next;
  }

  return dummy.next;
}
```


## 20.有效的括号

给定一个只包括  `'('`，`')'`，`'{'`，`'}'`，`'['`，`']'`  的字符串  `s` ，判断字符串是否有效

有效字符串需满足：

1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 每个右括号都有一个对应的相同类型的左括号。

示例 1：
输入：`s = "()"`
输出：true

示例 2：
输入：`s = "()[]{}"`
输出：true

示例 3：
输入：`s = "(]"`
输出：false

示例 4：
输入：`s = "([])"`
输出：true

示例 5：
输入：`s = "([)]"`
输出：false

提示：

- `1 <= s.length <= 104`
- `s`  仅由括号  `'()[]{}'`  组成

思路不难，主要就是栈匹配问题

- 开括号 → 入栈 `stk.push(s[i])`
- 闭括号 → 元素出栈 `stk.pop()` 进行匹配  
- 若栈空或栈顶不匹配 → 立即返回 false；否则弹出栈顶
- 遍历结束 → 栈空返回 true，否则 false

```ts
function isValid(s: string): boolean {
  let stk: string[] = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(" || s[i] === "[" || s[i] === "{") {
      stk.push(s[i]);
    } else if (s[i] === ")" || s[i] === "]" || s[i] === "}") {
      if (stk.length === 0) {
        return false;
      }
      let curr = stk.pop()!;
      if (curr === "(" && s[i] === ")") {
      } else if (curr === "[" && s[i] === "]") {
      } else if (curr === "{" && s[i] === "}") {
      } else {
        return false;
      }
    }
  }
  return stk.length === 0;
}
```

