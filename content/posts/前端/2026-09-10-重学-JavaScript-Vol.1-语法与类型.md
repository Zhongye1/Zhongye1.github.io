---
uuid: ccea7c20-dc36-11f1-bb09-6bc5226f813c
title: 2026-09-10-重学 JavaScript Vol.1 - 语法与类型
mathjax: true
abbrlink: 24453
published: 2026-09-10 10:34:56
category: 前端
description: JavaScript 基本语法、数据类型、变量与作用域、类型转换、字符串、操作符、条件与循环
cover: 'https://pica.zhimg.com/80/v2-86e48ab9a79eb6d9833074d99268ce2a_1440w.webp'
tags:
  - 前端
  - JavaScript
---

## 基本语法

JavaScript 的大部分语法从 Java、C 和 C++ 借鉴而来，但同时也受到 Awk、Perl 和 Python 的影响。

JavaScript 是**区分大小写**的，并使用 **Unicode** 字符集。举个例子，可以将单词 Früh（在德语中意思是“早”）用作变量名。

```js
const Früh = 'foobar'
```

但是，由于 JavaScript 是大小写敏感的，因此变量 `früh` 和 `Früh` 则是两个不同的变量。

在 JavaScript 中，指令被称为语句，并用分号（`;`）进行分隔。

如果一条语句独占一行的话，那么分号是可以省略的。但如果一行中有多条语句，那么这些语句*必须*用分号进行分隔。

ECMAScript 规定了在语句的末尾自动插入分号（ASI）。然而，在一条语句的末尾总是加上分号被认为是最佳实践，即使是在非严格需要的时候。这个习惯可以大大减少代码出问题的可能性。

从左往右扫描 JavaScript 脚本的源文本，会将其转换为输入元素（token、控制字符、行终止符、注释和空白字符，空白字符指的是空格、制表符和换行符等）序列。

### 注释

**注释**语法和 C++ 以及许多其他语言的注释语法一样：

```js
// 单行注释

/* 这是一个更长的，
 * 多行注释
 */
```

块注释不能嵌套。这个情况通常是在注释中意外地包含了 `*/` 序列，而它会结束这段注释。

```js
/* 然而，不能，/* 嵌套注释 */ 语法错误 */
```

在这个例子中，需要破坏 `*/` 模式。例如，插入反斜杠：

```js
/* 可以通过转义正斜杠 /* 嵌套注释 *\/ */
```

注释的行为类似于空白字符，在脚本执行过程中会被忽略。

一些 JavaScript 文件的开头也可能见到像 `#!/usr/bin/env node` 这样的第三种注释。它叫做 **hashbang 注释**，是一种用于指定执行脚本的特定 JavaScript 引擎路径的特殊注释。

### 代码块

最基本的语句是用于组合语句的**块语句**。块由一对花括号界定：

```js
{
  statement1
  statement2
  // …
  statementN
}
```

块语句通常用于控制流语句（`if`、`for`、`while`）。

```js
while (x < 10) {
  x++
}
```

这里，`{ x++ }` 就是块语句。

用 `var` 声明的变量不是块级作用域的，而是函数作用域或脚本作用域的，且设置它们的效果会超越到块本身之外。例如：

```js
var x = 1
{
  var x = 2
}
console.log(x) // 2
```

会输出 `2`，因为块中 `var x` 语句和块前面的 `var x` 语句的作用域是一样的。在 C 或 Java 中，等效的代码会输出 `1`。使用 `let` 或 `const` 会消除这个作用域效果。

## 数据类型和变量

### 数据类型

最新的 ECMAScript 标准定义了 8 种数据类型：

- 七种基本数据类型：
  1. Boolean。`true` 和 `false`。
  2. null。一个表示空值的特殊关键字。因为 JavaScript 是区分大小写的，所以 `null` 和 `Null`、`NULL` 或其他变体是不一样的。
  3. undefined。一个未定义值的顶级属性。
  4. Number。整数或浮点数。例如，`42` 或 `3.14159`。
  5. BigInt。任意精度的整数。例如，`9007199254740992n`。
  6. String。表示文本值的字符序列。例如，`"Howdy"`。
  7. Symbol。其实例是唯一且不可变的数据类型。
- 以及 Object。

虽然这些数据类型相对来说比较少，但是它们可以在程序中实现有用的功能。函数是这门语言的另一个基本元素。虽然函数从技术上讲是一种对象，但对象可以当作存放值的命名容器，函数则当作程序能够执行的过程。

除了 `null` 以外，所有的原始类型都可以使用 `typeof` 运算符进行测试。`typeof null` 返回 `"object"`，因此必须使用 `=== null` 来测试 `null`。

| 类型      | `typeof` 返回值 | 对象包装器 |
| --------- | --------------- | ---------- |
| Null      | `"object"`      | 不适用     |
| Undefined | `"undefined"`   | 不适用     |
| Boolean   | `"boolean"`     | Boolean    |
| Number    | `"number"`      | Number     |
| BigInt    | `"bigint"`      | BigInt     |
| String    | `"string"`      | String     |
| Symbol    | `"symbol"`      | Symbol     |

除了 `null` 和 `undefined` 以外，所有的原始类型都有对应的对象包装类型，它们为处理原始值提供了有用的方法。当在原始值上访问属性时，JavaScript 会自动将值包装成对应的包装对象，并访问对象上的属性。然而，在 `null` 或 `undefined` 上访问属性时，会抛出 `TypeError` 异常，这需要使用可选链运算符。

### 原始类型

#### Undefined 与 Null

Undefined 类型只有一个值：`undefined`。

从概念上讲，`undefined` 表示**值**缺失，`null` 表示**对象**缺失（这也解释了 `typeof null === "object"`）。当某些东西没有值时，JavaScript 语言通常默认为 `undefined`：

- 没有值的 `return` 语句（`return;`），隐式返回 `undefined`。
- 访问不存在的对象属性（`obj.iDontExist`），返回 `undefined`。
- 变量声明时没有初始化（`let x;`），隐式初始化为 `undefined`。
- 许多像 `Array.prototype.find()` 和 `Map.prototype.get()` 的方法，当没有找到元素时，返回 `undefined`。

`null` 在核心语言中使用频率少得多。最重要的地方是原型链的末端，其次是与原型交互的方法，如 `Object.getPrototypeOf()`、`Object.create()` 等，接受或返回 `null` 而不是 `undefined`。

`null` 是一个关键字，但 `undefined` 是一个普通的标识符，这个标识符恰好是一个全局属性。实际上区别很小，因为 `undefined` 不应该被重新定义或者遮蔽。

#### Boolean

Boolean 类型表示一个逻辑实体并且包括两个值：`true` 和 `false`。布尔值通常用于条件运算，包括三元运算符、`if...else`、`while` 等。

#### Number

Number 类型是一种基于 IEEE 754 标准的双精度 64 位二进制格式的值。它能够存储 2<sup>-1074</sup>（`Number.MIN_VALUE`）和 2<sup>1023</sup> × (2 - 2<sup>-52</sup>)（`Number.MAX_VALUE`）之间的正浮点数，以及相同范围的负浮点数，但是它仅能安全地存储在 -(2<sup>53</sup> − 1)（`Number.MIN_SAFE_INTEGER`）到 2<sup>53</sup> − 1（`Number.MAX_SAFE_INTEGER`）范围内的整数。超出这个范围，JavaScript 将不能安全地表示整数；相反，它们将由双精度浮点近似值表示。可以使用 `Number.isSafeInteger()` 检查一个数是否在安全的整数范围内。

超出表示范围的值会自动转换：

- 大于 `Number.MAX_VALUE` 的正值被转换为 `+Infinity`。
- 小于 `Number.MIN_VALUE` 的正值被转换为 `+0`。
- 小于 `-Number.MAX_VALUE` 的负值被转换为 `-Infinity`。
- 大于 `-Number.MIN_VALUE` 的负值被转换为 `-0`。

Number 类型仅有一个具有多个表现形式的值：`-0` 和 `+0` 都表示 `0`（其中 `0` 是 `+0` 的别名）。实际上，这两者之间几乎没有区别；例如，`+0 === -0` 是 `true`。然而，除以 0 时会看到区别：

```js
console.log(42 / +0) // Infinity
console.log(42 / -0) // -Infinity
```

`NaN`（“Not a Number”）是一个特殊种类的数字值，当算术运算的结果不能表示为数字时，通常会遇到它。它也是 JavaScript 中唯一不等于自身的值。

虽然 number 在概念上是一个“数学的值”，并且总是隐式的编码为浮点类型，但是 JavaScript 提供了位运算符。当应用位运算符时，number 首先转换为 32 位整数。

数值字面量有四种类型：十进制、二进制、八进制和十六进制。

```js
1234567890 // 十进制
0b10000000000000000000000000000000 // 二进制，2147483648
0o755 // 八进制，493
0xabcdef123456 // 十六进制，188900967593046
1e3 // 指数形式，1000
1_000_000_000_000 // 数值分隔符，等价于 1000000000000
```

以 `0` 开头的旧式八进制写法（例如 `0777`）属于遗留语法，在严格模式下会引发语法错误，应当改用 `0o` 前缀。

#### BigInt

BigInt 类型是 JavaScript 中的数字原始类型，它可以表示任意大小的整数。使用 BigInt，可以安全地存储和操作巨大的整数，即便是超过 Number 的安全整数限制（`Number.MAX_SAFE_INTEGER`）。

BigInt 通过在整数末尾添加 `n` 或调用 `BigInt()` 函数创建。

```js
// BigInt
const x = BigInt(Number.MAX_SAFE_INTEGER) // 9007199254740991n
x + 1n === x + 2n // false，因为 9007199254740992n 和 9007199254740993n 不相等

// Number
Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2 // true，因为都等于 9007199254740992
```

大多数运算符都可以处理 BigInt，包括 `+`、`*`、`-`、`**` 和 `%`——唯一被禁止的是 `>>>`。BigInt 并不严格等于有着相同数学值的 Number，而是非严格相等。如果在算术表达式中将 BigInt 值和常规 number 值混合，或者它们相互隐式转换，则抛出 `TypeError`。

BigInt 不能表示小数，除法运算的结果会被四舍五入为零：

```js
5n / 2n // 2n，BigInt 不存在 2.5
```

`Math` 函数不能用于 BigInt 值；它们仅适用于 number。选择 BigInt 还是 number 取决于具体用例和输入的范围：number 的精度通常已足以满足大多数日常任务的需求，而 BigInt 最适合处理二进制数据。

#### String

String 类型表示文本数据并编码为 UTF-16 码元的 16 位无符号整数值序列。字符串中的每个元素在字符串中占据一个位置。第一个元素的索引为 `0`，下一个的索引为 `1`，依此类推。字符串的长度是其中的 UTF-16 码元的数量，这可能与 Unicode 字符的实际数量不符。

JavaScript 字符串是不可变的。这意味着一旦字符串被创建，就不可能修改它。字符串方法会基于当前字符串的内容创建一个新的字符串——例如，使用 `substring()` 获取原始字符串的子字符串，或使用串联运算符（`+`）或 `concat()` 将两个字符串串联。

#### Symbol

Symbol 是一种**唯一**并且**不可变**的原始值，并且可以用作对象属性的键。在某些程序语言中，Symbol 也被称作“原子”。symbol 的目的是创建唯一的属性键，保证不会与其他代码中的键产生冲突。

### 变量声明

JavaScript 有三种变量声明方式：

- `var`：声明一个变量，可选择将其初始化为一个值。
- `let`：声明一个块级作用域的局部变量，可选择将其初始化为一个值。
- `const`：声明一个块级作用域的只读命名常量。

#### 标识符

在应用程序中，变量被用作值的符号名。变量的名字又叫做标识符，其需要遵守一定的规则。

JavaScript 标识符通常以字母、下划线（`_`）或者美元符号（`$`）开头；后续的字符也可以是数字（`0`-`9`）。因为 JavaScript 是区分大小写的，所以字母包含从 `A` 到 `Z` 的大写字母和从 `a` 到 `z` 的小写字母。

合法的标识符示例：`Number_hits`、`temp99`、`$credit` 和 `_name`。

#### 声明与初始化

在 `let x = 42` 这样的语句中，`let x` 称作**声明**，`= 42` 称作**初始化器**。声明允许在后续的代码中访问变量时不会抛出 `ReferenceError`，而初始化器会给变量赋值。在 `var` 和 `let` 声明中，初始化器是可选的。如果声明变量时没有进行初始化，变量会被赋值为 `undefined`。

```js
let x
console.log(x) // 输出“undefined”
```

本质上，`let x = 42` 等价于 `let x; x = 42`。

`const` 声明总是需要初始化器，因为它们禁止在声明后进行任何类型的赋值，以及隐式地将其初始化为 `undefined` 很可能是程序员犯的错。

```js
const x // SyntaxError: Missing initializer in const declaration
```

应该总是在声明变量后使用它们。JavaScript 过去允许给未声明的变量赋值，而这会创建一个未声明的全局变量。这在严格模式下是一个错误，应该彻底避免使用它。

#### 变量作用域

变量作用域（Variable Scope）指的是某个具体变量有效的访问范围

一个变量可能属于下列作用域之一：

- 全局作用域：在脚本模式中运行的所有代码的默认作用域。
- 模块作用域：在模块模式中运行的代码的作用域。
- 函数作用域：由函数创建的作用域。
- 块级作用域：用一对花括号创建的作用域（块）。用 `let` 或 `const` 声明的变量属于这个作用域。

在函数外部声明的变量被称作**全局**变量，因为当前文档中任何其他代码都能使用它。在函数内声明的变量被称作**局部**变量，因为它仅在那个函数内可用。

`let` 和 `const` 声明也会被限制在声明所在的块语句中：

```js
if (Math.random() > 0.5) {
  const y = 5
}
console.log(y) // ReferenceError: y is not defined
```

然而，用 `var` 创建的变量不是块级作用域的，而只是块所在的 **函数（或全局作用域）** 的：

```js
if (true) {
  var x = 5
}
console.log(x) // x 是 5
```

#### 变量提升

变量提升是指在 JavaScript 代码执行过程中，JavaScript 引擎把变量的声明部分和函数的声明部分提升到代码开头的行为。变量被提升后，会给变量设置默认值为 undefined。正是由于 JavaScript 存在变量提升这种特性，导致了很多与直觉不太相符的代码，这也是 JavaScript 的一个设计缺陷。虽然 ECMAScript6 已经通过引入块级作用域并配合使用 let、const 关键字，避开了这种设计缺陷，但是由于 JavaScript 需要向下兼容，所以变量提升在很长时间内还会继续存在。

通俗来讲就是在代码执行前，引擎先扫一遍当前作用域，把所有声明登记好——于是“声明”看起来被搬到了作用域顶部

用 `var` 声明的变量会被**提升**，意味着可以在该变量所在的作用域的任意地方引用该变量，即使还没有到达变量声明的地方。`var` 声明看起来好像被提升到该变量的函数或全局作用域的顶部。然而，如果在声明变量之前访问该变量，其值总是 `undefined`，因为只有该变量的**声明**和**默认初始化（为 `undefined`）**被提升，而不是它的**值赋值**。

```js
console.log(x === undefined) // true
var x = 3

;(function () {
  console.log(x) // undefined
  var x = '局部值'
})()
```

上面的例子可以被解释为：

```js
var x
console.log(x === undefined) // true
x = 3

;(function () {
  var x
  console.log(x) // undefined
  x = '局部值'
})()
```

由于存在变量提升，一个函数中所有的 `var` 语句应尽可能地放在接近函数顶部的地方。这个最佳实践会提升代码的清晰度。

`let` 和 `const` 是否被提升是个定义争论。在变量声明之前引用块中的变量，将总是抛出 `ReferenceError`，因为该变量位于从块的开始到声明所在的**暂时性死区**中（从作用域开头到声明语句之间这段区域叫暂时性死区）：

```js
console.log(x) // ReferenceError
const x = 3

console.log(y) // ReferenceError
let y = 3
```

与 `var` 声明不同（其仅提升声明，不提升其值），函数声明是全部被提升——可以在该函数的作用域中的任何地方安全地调用函数。

#### 全局变量

实际上，全局变量是**全局对象**的属性。

在网页中，全局对象是 `window`，所以可以用 `window.variable` 语法读取和设置全局变量。在所有的环境中，`globalThis` 变量（其自身也是一个全局变量）可以被用于读取和设置全局变量。这为不同 JavaScript 运行时提供了一个一致的接口。

因此，可以通过指定 `window` 或 `frame` 的名字，在当前 window 或 frame 访问另一个 window 或 frame 中声明的变量。例如，如果在文档中声明了一个叫 `phoneNumber` 的变量，那么就可以在 `iframe` 中使用 `parent.phoneNumber` 引用它。

#### 常量

可以用 `const` 关键字创建一个只读命名常量。常量标识符的语法和任何变量标识符的语法相同：必须以字母、下划线或美元符号（`$`）开头并可以包含字母、数字或下划线。

```js
const PI = 3.14
```

常量不可以通过赋值来改变其值或在脚本运行时被重新声明。必须为其初始化一个值。常量的作用域规则和 `let` 块级作用域变量的一致。

在同一作用域中，不能使用与变量名或函数名相同的名字来声明常量。例如：

```js
function f() {}
const f = 5 // 错误

function g() {
  const h = 5
  var h // 错误
}
```

然而，`const` 仅阻止**重新赋值**，而不阻止**修改**。被赋值为常量的对象的属性是不受保护的，所以下面的语句执行时不会产生错误：

```js
const MY_OBJECT = { key: '值' }
MY_OBJECT.key = '其他值'

const MY_ARRAY = ['HTML', 'CSS']
MY_ARRAY.push('JAVASCRIPT')
console.log(MY_ARRAY) // ['HTML', 'CSS', 'JAVASCRIPT']
```

### 动态类型与类型转换

> 关于 JavaScript 类型转换更详细的说明我觉得可以参考 https://www.yuque.com/cuggz/feplus/ny9beh

JavaScript 是一门**动态类型**语言。这意味着声明变量时不必指定变量的数据类型。这也意味着在脚本执行期间会根据需要自动转换数据类型。

```js
let answer = 42
answer = '不客气，感谢所有的鱼！'
```

因为 JavaScript 是动态类型的，这种赋值方式并不会提示出错。

在使用 `+` 运算符的表达式中涉及数字和字符串，JavaScript 会把数字转换成字符串。例如：

```js
x = '答案是 ' + 42 // "答案是 42"
y = 42 + ' 是答案' // "42 是答案"
z = '37' + 7 // "377"
```

在使用其他运算符时，JavaScript **不**会把数字转换成字符串。例如：

```js
'37' - 7 // 30
'37' * 7 // 259
```

将字符串转换为数字可以使用 `parseInt()` 和 `parseFloat()`。`parseInt` 只返回整数，因此它在处理小数时用途有限。另外，`parseInt` 的最佳实践是总是带上**进制**参数，这个参数用于指定使用哪一种进制：

```js
parseInt('101', 2) // 5
```

将字符串转换为数字的另一种方法是使用 `+`（一元加）运算符：

```js
;+'1.1' + +'1.1' // 2.2
```

JavaScript 是一门弱类型语言。这意味着可以经常使用与预期类型不同的值，JavaScript 语言会把它转换为正确的类型。**原始值强制转换**用于得到期望的原始值，但对实际的类型应该是什么并没有强烈的偏好。如果值已经是原始值，则此操作不会进行任何转换。对象将依次调用它的 `[Symbol.toPrimitive]()`（将 `"default"` 作为 hint 值）、`valueOf()` 和 `toString()` 方法，将其转换为原始值。

```js
console.log({} + []) // "[object Object]"
```

把对象转换为原始值有三条路径，区别主要在于调用方法的顺序：

- 原始值强制转换：`[Symbol.toPrimitive]("default")` → `valueOf()` → `toString()`
- 数字类型强制转换：`[Symbol.toPrimitive]("number")` → `valueOf()` → `toString()`
- 字符串强制转换：`[Symbol.toPrimitive]("string")` → `toString()` → `valueOf()`

### 相等比较

JavaScript 提供三种不同的值比较运算：`===` 严格相等、`==` 宽松相等、`Object.is()`。

- 双等号（`==`）将执行类型转换，并且会按照 IEEE 754 标准对 `NaN`、`-0` 和 `+0` 进行特殊处理（故 `NaN != NaN`，且 `-0 == +0`）。
- 三等号（`===`）做的比较与双等号相同（包括对 `NaN`、`-0` 和 `+0` 的特殊处理）但不进行类型转换；如果类型不同，则返回 `false`。
- `Object.is()` 既不进行类型转换，也不对 `NaN`、`-0` 和 `+0` 进行特殊处理（这使它和 `===` 在除了那些特殊数字值之外的情况具有相同的表现）。

严格相等比较两个值是否相等。两个被比较的值在比较前都不进行隐式转换。如果两个被比较的值具有不同的类型，则认为这两个值不相等。对于数字，严格相等使用稍微不同的语义处理两个特殊情况：`+0` 和 `-0` 被认为是相等的；`NaN` 与其他任何值都不相等，包括它自己。等式 `(x !== x)` 成立的唯一情况是 `x` 的值为 `NaN`。

除了 `===` 之外，数组索引查找方法也使用严格相等，包括 `Array.prototype.indexOf()`、`Array.prototype.lastIndexOf()` 和 `case` 匹配。这意味着不能使用 `indexOf(NaN)` 查找数组中 `NaN` 值的索引，也不能将 `NaN` 用作 `case` 值在 `switch` 语句中匹配任何内容：

```js
console.log([NaN].indexOf(NaN)) // -1
switch (NaN) {
  case NaN:
    console.log('Surprise') // 没有任何输出
}
```

在大多数情况下，不建议使用宽松相等。使用严格相等进行比较的结果更容易预测，并且由于缺少类型强制转换可以更快地执行。

```js
const num = 0
const big = 0n
const str = '0'
const obj = new String('0')

console.log(num == str) // true
console.log(big == num) // true
console.log(str == big) // true
console.log(num == obj) // true
```

同值相等由 `Object.is` 方法提供。语言内部期望一个值等于另一个时，几乎所有地方都使用同值相等。零值相等类似于同值相等，但 `+0` 和 `-0` 被视为相等。`Map` 和 `Set` 的键值相等判断基于 SameValueZero 算法。

### 严格模式

ECMAScript 5 的**严格模式**是采用具有限制性 JavaScript 变体的一种方式，从而使代码隐式地脱离“马虎模式/稀松模式/懒散模式”（sloppy）模式。严格模式不仅仅是一个子集：它的产生是为了形成与正常代码不同的语义。严格模式对正常的 JavaScript 语义做了一些更改：

1. 严格模式通过**抛出错误**来消除了一些原有**静默错误**。
2. 严格模式修复了一些导致 JavaScript 引擎难以执行优化的缺陷：有时候，相同的代码，严格模式可以比非严格模式下**运行得更快**。
3. 严格模式**禁用了**在 ECMAScript 的未来版本中可能会定义的一些语法。

严格模式可以应用到整个脚本或个别函数中。为整个脚本文件开启严格模式，需要在所有语句之前放一个特定语句 `"use strict";`（或 `'use strict';`）：

```js
// 整个脚本都开启严格模式的语法
'use strict'
const v = '这是一个严格模式的脚本！'
```

要给某个函数开启严格模式，得把特定语句放在函数体所有语句之前：

```js
function myStrictFunction() {
  // 函数级别严格模式语法
  'use strict'
  function nested() {
    return '这个函数也一样！'
  }
  return `这是一个严格模式的函数！${nested()}`
}
```

严格模式下无法再意外创建全局变量。在非严格模式下，在赋值中错误拼写的变量会在全局对象上创建一个新属性并继续“工作”。在严格模式下，意外创建全局变量的赋值会抛出错误：

```js
'use strict'
let mistypeVariable

// 假设全局变量 mistypeVarible 不存在，由于“mistypeVariable”拼写错误（缺少“a”），这行会抛出 ReferenceError
mistypeVarible = 17
```

## 字符串

### 字符串的表示

JavaScript 的字符串类型用于表示文本数据。它是一组由 16 位无符号整数值（UTF-16 码元）组成的“元素”。字符串中的每个元素在字符串中占据一个位置。第一个元素位于索引 `0`，下一个位于索引 `1`，依此类推。字符串的长度即为其中包含的元素数量。可以通过字符串字面量或字符串对象来创建字符串。

JavaScript 字符串是不可变的。这意味着一旦字符串被创建，就不可能修改它。字符串方法会基于当前字符串的内容创建一个新的字符串——例如，使用 `substring()` 获取原始字符串的子字符串，或使用串联运算符（`+`）或 `concat()` 将两个字符串串联。

### 字符串字面量

在源代码中，可以使用单引号或双引号来声明字符串：

```js
'foo'
'bar'
```

字符串被限定在同种引号之间（也即，必须是成对单引号或成对双引号）。在字符串字面量中，大多数字符都可以直接输入。唯一的例外是反斜杠（`\`，用于开始转义序列）、用于包围字符串的引号（该引号会结束字符串），以及换行符（如果其前未加反斜杠，则会导致语法错误）。

可以在字符串字面量值上使用 `String` 对象的所有方法。JavaScript 会自动将字符串字面量转换为一个临时字符串对象，调用该方法，然后废弃掉那个临时的字符串对象。也可以使用字符串字面量的 `length` 属性：

```js
// 将打印字符串中的字符个数（包括空格）
console.log('John 的猫'.length) // 结果为：7
```

### 特殊字符与转义

除了普通字符，字符串中也可以使用特殊字符，例如：

```js
'一行\n另一行'
```

下表列举了可以在 JavaScript 字符串中使用的特殊字符：

| 字符        | 意思                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| `\0`        | 空字节                                                                                                 |
| `\b`        | 退格符                                                                                                 |
| `\f`        | 换页符                                                                                                 |
| `\n`        | 换行符                                                                                                 |
| `\r`        | 回车符                                                                                                 |
| `\t`        | 制表符                                                                                                 |
| `\v`        | 垂直制表符                                                                                             |
| `\'`        | 撇号或单引号                                                                                           |
| `\"`        | 双引号                                                                                                 |
| `\\`        | 反斜杠字符                                                                                             |
| `\XXX`      | 由从 `0` 到 `377` 最多三位八进制数 `XXX` 表示的 Latin-1 字符。例如，`\251` 是版权符号的八进制序列。    |
| `\xXX`      | 由从 `00` 和 `FF` 的两位十六进制数字 `XX` 表示的 Latin-1 字符。例如，`\xA9` 是版权符号的十六进制序列。 |
| `\uXXXX`    | 由四位十六进制数字 `XXXX` 表示的 Unicode 字符。例如，`\u00A9` 是版权符号的 Unicode 序列。              |
| `\u{XXXXX}` | Unicode 码位转义。例如，`\u{2F804}` 相当于 Unicode 转义 `\uD87E\uDC04`。                               |

对于那些未出现在表格中的字符，其所带的前导反斜杠将被忽略。但是，这一用法已被废弃，应当避免使用。

通过在引号前加上反斜杠，可以在字符串中插入引号，这就是**引号转义**。例如：

```js
const quote = 'He read "The Cremation of Sam McGee" by R.W. Service.'
console.log(quote)
```

代码的运行结果为：

```plain
He read "The Cremation of Sam McGee" by R.W. Service.
```

要在字符串中插入反斜杠字面量，必须转义反斜杠。例如，要把文件路径 `c:\temp` 赋值给一个字符串，可以采用如下方式：

```js
const home = 'c:\\temp'
```

也可以在换行之前加上反斜杠以转义换行。这样反斜杠和换行都不会出现在字符串的值中：

```js
const str =
  'this string \
is broken \
across multiple \
lines.'
console.log(str) // this string is broken across multiple lines.
```

### 十六进制与 Unicode 转义

可以使用转义序列创建更复杂的字符串。

**十六进制转义序列**：`\x` 后的数字将被解释为十六进制数。

```js
'\xA9' // "©"
```

**Unicode 转义序列**：要求在 `\u` 之后至少跟四个十六进制数字。

```js
'\u00A9' // "©"
```

**Unicode 码位转义**：使用 Unicode 码位转义符时，任何字符都可以通过十六进制数进行转义，从而支持使用最高达 `0x10FFFF` 的 Unicode 码点。而使用四位数的 Unicode 转义符时，通常需要分别写出两个代理字符才能达到相同的效果。

```js
'\u{2F804}'

// 相同效果，但仅使用简单 Unicode 转义
'\uD87E\uDC04'
```

### 模板字面量

字面量是脚本中按字面意思直接给出的固定值（不是变量）。JavaScript 的字面量包括数组、布尔、数字、对象、RegExp 和字符串。

模板字面量使用反引号（`` ` ``）代替双引号或单引号进行包围，允许嵌入表达式，支持多行字符串和字符串插值。模板字面量可以包含占位符，占位符由美元符号和花括号（`${表达式}`）表示。

#### 多行文本

在源代码中插入的任何换行符都属于模板字面量的一部分。如果使用普通字符串，则必须采用以下语法才能生成多行字符串：

```js
console.log(
  '字符串文本第一行\n\
字符串文本第二行',
)
// "字符串文本第一行
// 字符串文本第二行"
```

若要在多行字符串中实现相同的效果，现在可以这样写：

```js
console.log(`字符串文本第一行
字符串文本第二行`)
// "字符串文本第一行
// 字符串文本第二行"
```

#### 嵌入表达式

要在普通字符串中嵌入表达式，请使用以下语法：

```js
const five = 5
const ten = 10
console.log('十五是 ' + (five + ten) + ' 而不是 ' + (2 * five + ten) + '。')
// "十五是 15 而不是 20。"
```

现在，借助模板字面量，可以利用这种语法糖，使类似的替换操作更加易于阅读：

```js
const five = 5
const ten = 10
console.log(`十五是 ${five + ten} 而不是 ${2 * five + ten}。`)
// "十五是 15 而不是 20。"
```

#### 带标签的模板

带标签的模板是用于指定模板字面量并调用“标签”函数解析模板字面量的紧凑语法。模板标签函数的名字在模板字面量的前面，模板标签函数会接收到字符串片段和一组相关的值：

```js
function tag(strings, ...values) {
  console.log(strings) // ["Hello ", "!"]
  console.log(values) // ["JavaScript"]
}

tag`Hello ${'JavaScript'}!`
```

因为带标签的模板字面量就是函数调用的语法糖，上面的写法等价于：

```js
tag(['Hello ', '!'], 'JavaScript')
```

### String 对象

可以直接在字符串值上调用方法：

```js
console.log('hello'.toUpperCase()) // HELLO
```

`String` 值上有这些方法：

- 查询：获取特定字符串索引处的字符或字符编码。方法包括 `at()`、`charAt()`、`charCodeAt()` 和 `codePointAt()`。
- 搜索：获取符合特定模式的子字符串信息，或检测特定子字符串是否存在。方法包括 `indexOf()`、`lastIndexOf()`、`startsWith()`、`endsWith()`、`includes()`、`match()`、`matchAll()` 和 `search()`。
- 组合：将字符串组合成一个更长的字符串。方法包括 `padStart()`、`padEnd()`、`concat()` 和 `repeat()`。
- 分解：将字符串拆分为较短的字符串。方法包括 `split()`、`slice()`、`substring()`、`substr()`、`trim()`、`trimStart()` 和 `trimEnd()`。
- 转换：根据当前字符串的内容返回一个新字符串。方法包括 `toLowerCase()`、`toUpperCase()`、`toLocaleLowerCase()`、`toLocaleUpperCase()`、`normalize()` 和 `toWellFormed()`。

在处理字符串时，还有另外两个对象提供了重要的字符串操作功能：`RegExp` 和 `Intl`。它们分别在正则表达式和国际化中进行了介绍。

## 操作符与表达式

### 算术运算符

算术运算符使用数值作为操作数并返回一个数值。标准算术运算符是 `+`、`-`、`*`、`/`；除零会产生 `Infinity`。除此之外还有：

| 运算符      | 描述                                         | 示例                              |
| ----------- | -------------------------------------------- | --------------------------------- |
| `%`         | 求余，返回相除之后的余数                     | `12 % 5` 返回 `2`                 |
| `++`        | 自增。前缀返回加一后的值，后缀返回原值再自增 | `++x`、`x++`                      |
| `--`        | 自减，前后缀规则同自增                       | `--x`、`x--`                      |
| `-`（一元） | 返回操作数的负值                             | `-x`                              |
| `+`（一元） | 如果操作数不是数值，尝试将其转换为数值       | `+'3'` 返回 `3`，`+true` 返回 `1` |
| `**`        | 指数运算                                     | `2 ** 3` 返回 `8`                 |

```js
1 / 2 // 0.5
1 / 2 == 1.0 / 2.0 // true
```

### 比较运算符

比较运算符比较它的操作数并返回一个基于表达式是否为真的逻辑值。字符串比较基于标准的字典顺序，使用 Unicode 值。多数情况下，如果两个操作数不是相同的类型，JavaScript 会尝试把它们转换为恰当的类型再比较；`===` 和 `!==` 不会转换类型。

```js
const var1 = 3
const var2 = 4

3 == var1 // true
'3' == var1 // true
3 === var1 // true
var1 !== '3' // true
var2 > var1 // true
'12' > 2 // true
```

`==` 与 `===` 的区别、`NaN` 和 `-0` 的特殊行为，在“数据类型和变量”的“相等比较”一节已经展开。

### 逻辑运算符

逻辑运算符常用于布尔值之间；当操作数都是布尔值时，返回值也是布尔值。不过 `&&` 和 `||` 返回的是一个特定的操作数的值，所以当它们用于非布尔值的时候，返回值可能是非布尔值。

| 运算符 | 范例               | 描述                                                            |
| ------ | ------------------ | --------------------------------------------------------------- |
| `&&`   | `expr1 && expr2`   | 如果 `expr1` 能被转换为 `false`，返回 `expr1`；否则返回 `expr2` |
| `\|\|` | `expr1 \|\| expr2` | 如果 `expr1` 能被转换为 `true`，返回 `expr1`；否则返回 `expr2`  |
| `!`    | `!expr`            | 如果操作数能转换为 `true` 则返回 `false`；否则返回 `true`       |

能被转换为 `false` 的值有 `null`、`0`、`NaN`、空字符串（`""`）和 `undefined`。

```js
'Cat' && 'Dog' // "Dog"
false && 'Cat' // false
'Cat' || 'Dog' // "Cat"
false || 'Cat' // "Cat"
!'' // true
```

短路求值：`false && anything` 被短路求值为 `false`，`true || anything` 被短路求值为 `true`，`anything` 部分不会被求值，因此不会产生副作用。

`??`（空值合并）只在左侧为 `null` 或 `undefined` 时返回右侧，不会把 `0`、`""`、`false` 当作空值：

```js
0 ?? 42 // 0
null ?? 42 // 42
```

`?.`（可选链）在左侧为 `null` 或 `undefined` 时短路，返回 `undefined`，而不是抛出错误：

```js
const user = { profile: { name: 'Ada' } }
user.profile?.name // "Ada"
user.account?.name // undefined
```

### 赋值运算符

赋值运算符将它右边操作数的值赋给它左边的操作数。最简单的赋值运算符是等于（`=`）。复合赋值运算符是“先运算再赋值”的简写：

| 简写          | 含义               |
| ------------- | ------------------ |
| `x += y`      | `x = x + y`        |
| `x -= y`      | `x = x - y`        |
| `x *= y`      | `x = x * y`        |
| `x /= y`      | `x = x / y`        |
| `x %= y`      | `x = x % y`        |
| `x **= y`     | `x = x ** y`       |
| `x <<= y`     | `x = x << y`       |
| `x >>= y`     | `x = x >> y`       |
| `x >>>= y`    | `x = x >>> y`      |
| `x &= y`      | `x = x & y`        |
| `x \|= y`     | `x = x \| y`       |
| `x ^= y`      | `x = x ^ y`        |
| `x &&= f()`   | `x && (x = f())`   |
| `x \|\|= f()` | `x \|\| (x = f())` |
| `x ??= f()`   | `x ?? (x = f())`   |

逻辑赋值运算符带有短路语义：只有左侧满足条件时才会求值右侧。

### 字符串运算符

连接操作符（`+`）连接两个字符串值，返回两个操作数串的结合。`+=` 也可以用来拼接字符串：

```js
console.log('my ' + 'string') // "my string"

let myString = 'alpha'
myString += 'bet' // "alphabet"
```

当 `+` 的一侧是字符串时，另一侧会被转换为字符串；这一点在“数据类型和变量”的类型转换一节已经说明。

### 条件（三元）运算符

条件运算符是 JavaScript 中唯一需要三个操作数的运算符。运算的结果根据给定条件在两个值中取其一：

```js
condition ? value1 : value2
```

如果条件为真，结果取值 1；否则取值 2。

```js
const status = age >= 18 ? 'adult' : 'minor'
```

### 逗号操作符

逗号操作符（`,`）对两个操作数进行求值并返回最终操作数的值。它常常用在 `for` 循环中，在每次循环时对多个变量进行更新：

```js
const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const a = [x, x, x, x, x]

for (let i = 0, j = 9; i <= j; i++, j--) {
  console.log(`a[${i}][${j}] = ${a[i][j]}`)
}
```

### 一元操作符

一元操作符仅对应一个操作数。

`delete` 删除一个对象的属性或者数组中某一个键值：

```js
const myObj = { a: 1, b: 2 }
delete myObj.a
console.log(myObj) // { b: 2 }
```

`typeof` 返回操作数类型的字符串：

```js
typeof 42 // "number"
typeof 'str' // "string"
typeof undefined // "undefined"
typeof null // "object"
typeof [] // "object"
typeof function () {} // "function"
```

`void` 对表达式求值并返回 `undefined`，常用于只需要执行副作用、不需要返回值的场景。

### 关系运算符

`in` 判断属性是否存在于对象（包括原型链）中：

```js
const car = { make: 'Ford', model: 'Mustang' }
'make' in car // true
'toString' in car // true，来自原型链
```

`instanceof` 判断构造函数的 `prototype` 是否出现在对象的原型链上：

```js
const date = new Date()
date instanceof Date // true
date instanceof Object // true
```

### 位运算符与优先级

位运算符把操作数视为 32 位二进制串，包括 `&`、`|`、`^`、`~`、`<<`、`>>`、`>>>`。完整的位运算规则和 TypedArray 场景放在“数据结构与值”一卷的“二进制与字符编码”一节展开。

运算符优先级决定表达式的求值顺序。常见顺序从高到低大致是：成员访问/`new`/函数调用 → 一元 → 乘除/求余/指数 → 加减 → 移位 → 关系 → 相等 → 位与/异或/或 → 逻辑与/或/空值合并 → 条件 → 赋值 → 逗号。复杂表达式应使用括号显式分组，而不是依赖优先级记忆。

## 条件判断

### if...else 语句

条件语句是一组会在指定的条件为真时执行的指令。JavaScript 支持两种条件语句：`if...else` 和 `switch`。

使用 `if` 语句在逻辑条件为 `true` 时执行语句。使用可选的 `else` 子句在条件为 `false` 时执行语句。`if` 语句看起来像这样：

```js
if (condition) {
  statement1
} else {
  statement2
}
```

这里，`condition` 可以是任何能求值为 `true` 或 `false` 的表达式。如果 `condition` 求值为 `true`，执行 `statement1`。否则，执行 `statement2`。`statement1` 和 `statement2` 可以是任何的语句，包括继续嵌套的 `if` 语句。

也可以使用 `else if` 组合语句按顺序测试多个条件，就像下面一样：

```js
if (condition1) {
  statement1
} else if (condition2) {
  statement2
} else if (conditionN) {
  statementN
} else {
  statementLast
}
```

在多个条件的情况下，只有第一个求值为 `true` 的逻辑条件才会被执行。想要执行多个语句，将其组合在一个块语句中（`{ /* … */ }`）。

一般而言，总是使用块语句是最佳实践——**特别是**嵌套 `if` 语句的时候：

```js
if (condition) {
  // condition 为真时的语句
  // …
} else {
  // condition 为假时的语句
  // …
}
```

一般而言，最好不要将赋值（例如，`x = y`）作为 `if...else` 的条件：

```js
if ((x = y)) {
  // 在这里添加语句
}
```

然而，在极少数情况下，确实会需要这么做。

### 假值

下面这些值求值为 `false`（也叫做**假**值）：

- `false`
- `undefined`
- `null`
- `0`
- `NaN`
- 空字符串（`""`）

所有其他的值——包括所有的对象——在被传递给条件语句时会求值为 `true`。

请不要混淆原始布尔值 `true` 和 `false` 与 `Boolean` 对象的真和假。例如：

```js
const b = new Boolean(false)
if (b) {
  // 这个条件求值为 true
}
if (b == true) {
  // 这个条件求值为 false
}
```

### if...else 示例

在下列示例中，如果 `Text` 对象中的字符数为 3，函数 `checkData` 将返回 `true`；否则，显示警告并返回 `false`：

```js
function checkData() {
  if (document.form1.threeChar.value.length === 3) {
    return true
  } else {
    alert(`请正好输入 3 个字符。${document.form1.threeChar.value}是无效的`)
    return false
  }
}
```

### switch 语句

`switch` 语句允许程序求一个表达式的值并且尝试将表达式的值和 `case` 标签进行匹配。如果匹配成功，程序会执行相关的语句。`switch` 语句看起来像这样：

```js
switch (expression) {
  case label1:
    statements1
    break
  case label2:
    statements2
    break
  // …
  default:
    statementsDefault
}
```

JavaScript 求值上面的 `switch` 语句的过程如下：

- 程序首先查找一个与 `expression` 的值匹配的 `case` 子句标签，然后将控制权转移到该子句，执行相关的语句。
- 如果没有匹配的标签，程序会去找可选的 `default` 子句：
  - 如果找到了 `default` 子句，程序会将控制权转移到该子句，执行相关的语句。
  - 如果没有找到 `default` 子句，程序会继续执行 `switch` 语句后面的语句。
  - `default` 子句通常是最后一个子句，当然这不是必须的。

每个 `case` 子句会关联一个可选的 `break` 语句，它能保证在匹配的语句被执行后程序可以跳出 `switch` 并且继续执行 `switch` 后面的语句。如果 `break` 被忽略，程序会在 `switch` 语句内继续执行（将会执行下一个 `case` 的语句，依此类推）。

在下列示例中，如果 `fruitType` 等于 `"Bananas"`，程序将该值与 `case "Bananas"` 匹配，并执行相关语句。当执行到 `break` 时，程序结束 `switch` 并执行 `switch` 后面的语句。如果不写 `break`，那么程序将会执行 `case "Cherries"` 下的语句：

```js
switch (fruitType) {
  case 'Oranges':
    console.log('橙子是 $0.59 一磅')
    break
  case 'Apples':
    console.log('苹果是 $0.32 一磅')
    break
  case 'Bananas':
    console.log('香蕉是 $0.48 一磅')
    break
  case 'Cherries':
    console.log('樱桃是 $3.00 一磅')
    break
  case 'Mangoes':
    console.log('芒果是 $0.56 一磅。')
    break
  case 'Papayas':
    console.log('木瓜是 $2.79 一磅。')
    break
  default:
    console.log(`对不起，${fruitType} 卖完了。`)
}
console.log('还有其他喜欢的吗？')
```

`throw`、`try...catch` 和 `Error` 对象属于错误处理的内容，见第五篇《运行时》。

## 循环

### 循环模型

循环提供了一种快速和简单的方式去做一些重复的事。可以把循环想成一种计算机化的游戏，告诉某人在一个方向上走 X 步，然后在另一个方向上走 Y 步；例如，“向东走 5 步”可以用一个循环来这样表达：

```js
for (let step = 0; step < 5; step++) {
  // 运行 5 次，step 值从 0 到 4。
  console.log('向东走一步')
}
```

循环有很多种类，但本质上它们都做的是同一件事：它们把一个动作重复了很多次（实际上重复的次数有可能为 0）。各种循环机制提供了不同的方法去确定循环的开始和结束。不同情况下，某一种类型循环会比其他的循环用起来更简单。

JavaScript 中提供了这些循环语句：`for`、`do...while`、`while`、`label`、`break`、`continue`、`for...in`、`for...of`。

### for 语句

一个 `for` 循环会一直重复执行，直到指定的循环条件为 `false`。JavaScript 的 `for` 循环和 Java、C 的 `for` 循环是很相似的。一个 `for` 语句是这个样子的：

```js
for (initialization; condition; afterthought) statement
```

当一个 `for` 循环执行的时候，会发生以下过程：

1. 如果有初始化表达式 `initialization`，它将被执行。这个表达式通常会初始化一个或多个循环计数器，但语法上是允许一个任意复杂度的表达式的。这个表达式也可以声明变量。
2. 计算 `condition` 表达式的值。如果 `condition` 的值是 `true`，循环中的语句会被执行。如果 `condition` 的值是 `false`，`for` 循环终止。如果 `condition` 表达式整个都被省略掉了，`condition` 的值会被认为是 `true`。
3. 循环中的 `statement` 被执行。如果需要执行多条语句，可以使用块（`{ ... }`）来包裹这些语句。
4. 如果有更新表达式 `afterthought`，执行更新表达式。
5. 回到步骤 2。

下面的函数包含一个含有 `for` 循环去计算一个滑动列表中被选中项目的个数（一个 `<select>` 元素允许选择多项）。`for` 循环声明了变量 `i` 并将它的初始值设为 `0`。它检查 `i` 是否比 `<select>` 元素中的选项数量少，执行了随后的 `if` 语句，然后在每次完成循环后，`i` 的值增加 1：

```html
<form name="selectForm">
  <label for="musicTypes">选择一些音乐类型，然后点击下面的按钮：</label>
  <select id="musicTypes" name="musicTypes" multiple="multiple">
    <option selected="selected">R&amp;B</option>
    <option>爵士</option>
    <option>布鲁斯</option>
    <option>新纪元</option>
    <option>古典</option>
    <option>歌剧</option>
  </select>
  <button id="btn" type="button">选择了多少个选项？</button>
</form>
```

```js
function countSelected(selectObject) {
  let numberSelected = 0
  for (let i = 0; i < selectObject.options.length; i++) {
    if (selectObject.options[i].selected) {
      numberSelected++
    }
  }
  return numberSelected
}

const btn = document.getElementById('btn')

btn.addEventListener('click', () => {
  const musicTypes = document.selectForm.musicTypes
  console.log(`选择了 ${countSelected(musicTypes)} 个选项。`)
})
```

### while 与 do...while

一个 `while` 语句只要指定的条件求值为真（`true`）就会一直执行它的语句块：

```js
while (condition) statement
```

如果这个条件变为假，循环里的 `statement` 将会停止执行并把控制权交回给 `while` 语句后面的代码。条件检测会在每次 `statement` 执行之前发生。如果条件返回为真，`statement` 会被执行并紧接着再次测试条件。如果条件返回为假，执行将停止并把控制权交回给 `while` 后面的语句。

只要 `n` 小于 3，下面的 `while` 循环就会一直执行：

```js
let n = 0
let x = 0
while (n < 3) {
  n++
  x += n
}
```

在每次循环里，`n` 会增加 1，并被加到 `x` 上。所以，`x` 和 `n` 的变化是：

- 第一次完成后：`n` = 1，`x` = 1
- 第二次完成后：`n` = 2，`x` = 3
- 第三次完成后：`n` = 3，`x` = 6

在三次完成后，条件 `n < 3` 的结果不再为真，所以循环终止了。要避免无穷循环，保证循环的条件结果最终会变成假；否则，循环永远不会停止：

```js
// 无限循环并不好！
while (true) {
  console.log('Hello, world!')
}
```

`do...while` 语句一直重复直到指定的条件求值得到假值（`false`）：

```js
do statement
while (condition)
```

`statement` 在检查条件之前会执行一次。要执行多条语句（语句块），要使用块语句（`{ ... }`）包括起来。如果 `condition` 为真（`true`），`statement` 将再次执行。在每个执行的结尾会进行条件的检查。当 `condition` 为假（`false`），执行会停止并且把控制权交回给 `do...while` 后面的语句。在下面的例子中，这个 `do` 循环将至少重复一次，并且一直重复直到 `i` 不再小于 5：

```js
let i = 0
do {
  i += 1
  console.log(i)
} while (i < 5)
```

### label 语句

一个 `label` 提供了一个在程序中其他位置引用它的标识符。例如，可以用 `label` 标识一个循环，然后使用 `break` 或者 `continue` 来指出程序是否该停止循环还是继续循环。`label` 语句的语法看起来像这样：

```js
label: statement
```

`label` 的值可以是任何的非保留字的 JavaScript 标识符，`statement` 可以是任意想要标识的语句（块）。在这个例子里，标记 `markLoop` 标识了一个 `while` 循环：

```js
markLoop: while (theMark == true) {
  doSomething()
}
```

举一个比较典型的例子，看完后即明白 label 的应用。未添加 label 时：

```js
var num = 0
for (var i = 0; i < 10; i++) {
  // i 循环
  for (var j = 0; j < 10; j++) {
    // j 循环
    if (i == 5 && j == 5) {
      break // i = 5，j = 5 时，会跳出 j 循环
    } // 但 i 循环会继续执行，等于跳出之后又继续执行更多次 j 循环
    num++
  }
}

alert(num) // 输出 95
```

添加 label 后：

```js
var num = 0
outPoint: for (var i = 0; i < 10; i++) {
  for (var j = 0; j < 10; j++) {
    if (i == 5 && j == 5) {
      break outPoint // 在 i = 5，j = 5 时，跳出所有循环，
      // 返回到整个 outPoint 下方，继续执行
    }
    num++
  }
}

alert(num) // 输出 55
```

使用 `continue` 语句，则可达到与未添加 label 相同的效果，但在这种有多层循环的情况下，循环的跳出进入流程更为明晰一些：

```js
var num = 0
outPoint: for (var i = 0; i < 10; i++) {
  for (var j = 0; j < 10; j++) {
    if (i == 5 && j == 5) {
      continue outPoint
    }
    num++
  }
}
alert(num) // 95
```

从 `alert(num)` 的值可以看出，`continue outPoint;` 语句的作用是跳出当前循环，并跳转到 `outPoint`（标签）下的 `for` 循环继续执行。

### break 语句

使用 `break` 语句来终止循环、`switch`，或者是链接到 label 语句。

- 使用不带 label 的 `break` 时，它会立即终止当前所在的 `while`、`do-while`、`for` 或者 `switch` 并把控制权交回这些结构后面的语句。
- 使用带 label 的 `break` 时，它会终止指定的带标记（label）的语句。

`break` 语句的语法看起来像这样：

```js
break
break label
```

下面的例子循环数组里的元素，直到找到一个等于 `theValue` 的值：

```js
for (let i = 0; i < a.length; i++) {
  if (a[i] === theValue) {
    break
  }
}
```

终止一个 label：

```js
let x = 0
let z = 0
labelCancelLoops: while (true) {
  console.log('外循环：' + x)
  x += 1
  z = 1
  while (true) {
    console.log('内循环：' + z)
    z += 1
    if (z === 10 && x === 10) {
      break labelCancelLoops
    } else if (z === 10) {
      break
    }
  }
}
```

### continue 语句

`continue` 语句可以用来继续执行（跳过代码块的剩余部分并进入下一循环）一个 `while`、`do-while`、`for` 或者 `label` 语句。

- 使用不带 label 的 `continue` 时，它终止当前 `while`、`do-while` 或者 `for` 语句到结尾的这次的循环并且继续执行下一次循环。
- 使用带 label 的 `continue` 时，它会应用被 label 标识的循环语句。

`continue` 语句的语法看起来像这样：

```js
continue
continue label
```

以下示例展示了一个 `while` 循环，其中当 `i` 的值为 `3` 时执行 `continue` 语句。因此，`n` 的值分别是 `1`、`3`、`7` 和 `12`：

```js
let i = 0
let n = 0
while (i < 5) {
  i++
  if (i === 3) {
    continue
  }
  n += i
  console.log(n)
}
// 输出：
// 1 3 7 12
```

### for...in 语句

`for...in` 语句循环一个指定的变量来循环一个对象所有可枚举的属性。JavaScript 会为每一个不同的属性执行指定的语句：

```js
for (variable in object) {
  statements
}
```

下面的函数通过它的参数得到一个对象和这个对象的名字。然后循环这个对象的所有属性并且返回一个列出属性名和该属性值的字符串：

```js
function dumpProps(obj, objName) {
  let result = ''
  for (const i in obj) {
    result += `${objName}.${i} = ${obj[i]}<br>`
  }
  result += '<hr>'
  return result
}
```

对于一个拥有 `make` 和 `model` 属性的 `car` 对象来说，执行结果 `result` 是：

```plain
car.make = Ford
car.model = Mustang
```

虽然使用 `for...in` 来迭代数组元素听起来很诱人，但是它返回的东西除了数字索引外，还有可能是自定义的属性名字。因此还是用带有数字索引的传统的 `for` 循环来迭代一个数组比较好，因为，如果想改变数组对象，比如添加属性或者方法，`for...in` 语句迭代的是自定义的属性，而不是数组的元素。

### for...of 语句

`for...of` 语句在可迭代对象（包括 `Array`、`Map`、`Set`、`arguments` 等等）上创建了一个循环，对值的每一个独特属性调用一次迭代：

```js
for (variable of object) {
  statement
}
```

下面的这个例子展示了 `for...of` 和 `for...in` 两种循环语句之间的区别。`for...in` 循环遍历的结果是数组元素的下标，而 `for...of` 遍历的结果是元素的值：

```js
const arr = [3, 5, 7]
arr.foo = 'hello'

for (const i in arr) {
  console.log(i) // 输出 "0", "1", "2", "foo"
}

for (const i of arr) {
  console.log(i) // 输出 "3", "5", "7"
}

// 注意 for...of 的输出没有出现 "hello"
```

## 总结

- **基本语法**：语句用分号分隔，可以省略但建议保留；注释与 C++ 一致，不能嵌套块注释；块语句组合多条语句，`var` 不受块作用域限制。
- **数据类型**：8 种类型（7 种原始类型加 Object）；`typeof null === "object"`；动态类型会在运行时自动转换。
- **变量与作用域**：`var` 只有函数作用域并存在提升，`let`/`const` 是块级作用域并有暂时性死区；严格模式把静默错误变成异常。
- **类型转换与相等**：`+` 遇到字符串就拼接，其余算术运算符倾向转数字；比较优先用 `===`，`Object.is()` 处理 `NaN` 和 `-0`。
- **字符串**：底层是 UTF-16 码元序列，字符串不可变；模板字面量解决多行与插值。
- **操作符**：算术、比较、逻辑、赋值、字符串、三元、逗号、一元和关系运算符；`&&`/`||` 返回操作数本身并短路，`??` 只处理 `null`/`undefined`，`?.` 在空值处短路。
- **控制流**：`false`、`undefined`、`null`、`0`、`NaN`、`""` 是假值；`switch` 忘记 `break` 会继续执行；循环用 `label` 配合 `break`/`continue` 控制嵌套。

## 参考

- [语法与类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Grammar_and_types)
- [表达式与运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_operators)
- [JavaScript 数据结构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Data_structures)
- [相等比较和相同](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness)
- [严格模式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)
- [数字与字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Numbers_and_strings)
