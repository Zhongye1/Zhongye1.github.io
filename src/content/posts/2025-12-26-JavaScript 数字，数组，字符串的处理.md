---
uuid: d21722c0-e209-11f0-bf51-7b4c8d0f8062
title: 2025-12-26-JavaScript 数字，数组，字符串的处理
category: 算法
mathjax: true
abbrlink: 47427
published: 2025-12-26 11:20:25

---
## 字符串，数组，数字的转换

**数字（Number）**、**字符串（String）** 和 **数组（Array）** 之间的相互转换算是常见操作了，常见转换方向、推荐方法、示例代码及说明如下：

| 从 → 到                       | 方法                                                 | 示例代码                                                                                                              | 说明                                                               |
| ----------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Number → String               | String(num) 或 num.toString()                        | let str = String(123); // "123" let str = (123).toString(); // "123"                                                  | 最可靠方式。toString() 可指定进制，如 (10).toString(2) // "1010"。 |
| Number → Array                | String(num).split('')                                | let arr = String(123).split(''); // ["1", "2", "3"]                                                                   | 先转为字符串，再按字符拆分成数组（适用于单个数字的位拆分）。       |
| String → Number               | Number(str) 或 +str 或 parseInt(str, 10)             | let num = Number("123"); // 123 let num = +"123"; // 123 let num = parseInt("123", 10); // 123                        | +str 最简洁；parseInt 适合提取整数部分（忽略后缀非数字）。         |
| String → Array                | str.split(separator)                                 | let arr = "1,2,3".split(','); // ["1", "2", "3"] let arr = "123".split(''); // ["1", "2", "3"]                        | split('') 按单个字符拆分；split(',') 按逗号等分隔符拆分。          |
| Array → String                | arr.toString() 或 arr.join(separator)                | let str = [1,2,3].toString(); // "1,2,3" let str = [1,2,3].join(''); // "123" let str = [1,2,3].join('-'); // "1-2-3" | join() 更灵活，可自定义分隔符（默认逗号）。                        |
| Array → Number                | 先转为字符串，再转为数字（如 Number(arr.join(''))）  | let num = Number([1,2,3].join('')); // 123                                                                            | 适用于纯数字数组；若数组含非数字，返回 NaN。                       |
| Array(Number) → Array(String) | arr.map(String) 或 arr.map(num => num.toString())    | let strArr = [1,2,3].map(String); // ["1", "2", "3"]                                                                  | 逐元素转换为字符串，最常用方法。                                   |
| Array(String) → Array(Number) | arr.map(Number) 或 arr.map(str => parseInt(str, 10)) | let numArr = ["1","2","3"].map(Number); // [1, 2, 3]                                                                  | 逐元素转换为数字；parseInt 更安全处理可能含非纯数字字符串。        |

数组转数字本质是拼接字符串

```ts
const arr = ["2", "1", "22", "23"];

// 步骤1: 使用 join('') 无分隔符拼接成字符串 const str = arr.join(''); // "212223"

// 步骤2: 转换为数字 const num = Number(str); // 212223 // 或等价简写：const num = +arr.join('');

console.log(num); // 212223（number 类型）
```

数组转连续字符串本质也是拼接字符串

```TS
const arr: string[] = ['X', 'W', 'W'];

// 使用 join('')（最常用）
const str: string = arr.join(''); // "XWW"

// 使用 join() 无参数（默认逗号，但空字符串等价）
const str2: string = arr.join(); // 注意：默认会得到 "X,W,W"，必须传空字符串
```

## 字符串反转：

**ES6:**

```ts
const reverseString = (str: string): string => str.split("").reverse().join("");

// 使用示例
console.log(reverseString("hello")); // 'olleh'
```

**手动循环**（不依赖内置方法）：

```TS
function reverseString(str) {
  let reversed = '';
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}
```

## 数组反转（Array Reverse）:

**原地反转**：

```ts
const arr = [1, 2, 3, 4];
arr.reverse(); // arr 变为 [4, 3, 2, 1]
```

**手动实现**：

```JavaScript
function reverseArray(arr) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  return arr;
}
```

## 数字反转（leetcode # 7）

```ts
function reverseInt(x) {
    const sign = x < 0 ? -1 : 1;
    const reversed =
        sign *
        parseInt(Math.abs(x).toString().split("").reverse().join(""), 10);
    return reversed;
}
```

## 补充：

数组排序

```ts
nums.sort((a, b) => a - b);
```
