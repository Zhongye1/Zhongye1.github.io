---
uuid: ccea7c20-dc36-11f1-bb09-6bc5226f813c
title: 2026-09-10-重学 JavaScript Vol.1 - 语言基础
mathjax: true
abbrlink: 24453
published: 2026-09-10 10:34:56
category: 前端
description: JavaScript 语言基础：语法、类型、字符串、数组、对象、控制流、Map/Set 与 iterable
cover: ''
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

### 动态类型与类型转换

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

然而，用 `var` 创建的变量不是块级作用域的，而只是块所在的**函数（或全局作用域）**的：

```js
if (true) {
  var x = 5
}
console.log(x) // x 是 5
```

#### 变量提升

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

`let` 和 `const` 是否被提升是个定义争论。在变量声明之前引用块中的变量，将总是抛出 `ReferenceError`，因为该变量位于从块的开始到声明所在的“暂时性死区”中：

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

#### 严格模式

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

### 模板字面量

模板字面量是一种允许嵌入表达式的字符串字面量。可以使用多行字符串和字符串插值功能。模板字面量使用反引号（`` ` ``）代替双引号或单引号进行包围。模板字面量可以包含占位符。这些占位符由美元符号和花括号（`${表达式}`）表示。

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

## 数组

### 数组与索引

**数组**是由名称和索引引用的值构成的有序列表。例如，考虑一个名为 `emp` 的数组，它包含按数字雇员编号索引的雇员姓名。所以 `emp[0]` 是 0 号员工，`emp[1]` 是 1 号员工，以此类推。

JavaScript 中没有明确的数组数据类型。但是，可以使用预定义的 `Array` 对象及其方法来处理应用程序中的数组。`Array` 对象具有以各种方式操作数组的方法，例如连接、反转和排序。它有一个用于确定数组长度的属性和用于正则表达式的其他属性。

### 创建数组

以下语句创建了等效的数组：

```js
const arr1 = new Array(element0, element1, /* … ,*/ elementN)
const arr2 = Array(element0, element1, /* … ,*/ elementN)
const arr3 = [element0, element1, /* … ,*/ elementN]
```

`element0, element1, …, elementN` 是数组元素的值列表。当指定这些值时，数组将用它们作为数组的元素初始化。数组的 `length` 属性被设置为参数的数量。

括号语法称为“数组字面量”或“数组初始化式”。它比其他形式的数组创建更短，因此通常是首选。

为了创建一个长度不为 0，但是又没有任何元素的数组，可选以下任何一种方式：

```js
// 这种方式...
const arr1 = new Array(arrayLength)

// ...与这种方式会形成相同数组
const arr2 = Array(arrayLength)

// 这个效果也一样
const arr3 = []
arr3.length = arrayLength
```

以上代码中，`arrayLength` 必须为一个 `Number`。否则，将会创建一个只有单个元素（内含提供的值）的数组。调用 `arr.length` 会返回 `arrayLength`，但数组不包含任何元素。

如果希望用单个元素初始化一个数组，而这个元素恰好又是 `Number`，那么必须使用括号语法。当单个 `Number` 传递给 `Array()` 构造函数时，将会被解释为 `arrayLength`，并非单个元素：

```js
// 创建一个只有唯一元素的数组：数字 42。
const arr = [42]

// 创建一个没有元素的数组，且数组的长度被设置成 42。
const arr = Array(42)

// 上面的代码与下面的代码等价：
const arr = []
arr.length = 42
```

如果 `N` 不是一个整数，调用 `Array(N)` 将会报 `RangeError` 错误：

```js
const arr = Array(9.3) // RangeError: Invalid array length
```

如果需要创建任意类型的单元素数组，安全的方式是使用数组字面量。或者在向数组添加单个元素之前先创建一个空的数组。也可以使用 `Array.of()` 静态方法来创建包含单个元素的数组：

```js
const wisenArray = Array.of(9.3) // wisenArray 只包含一个元素：9.3
```

### 访问元素与 length

因为元素也是属性，可以使用属性访问器来访问。假设定义了以下数组：

```js
const myArray = ['Wind', 'Rain', 'Fire']
```

数组的第一个元素可以引用为 `myArray[0]`，将数组的第二个元素引用为 `myArray[1]`，等等。元素的索引从零开始。

也可以使用属性访问器来访问数组的其他属性，就像对象一样：

```js
const arr = ['one', 'two', 'three']
arr[2] // three
arr['length'] // 3
```

可以通过给数组元素赋值来填充数组，例如：

```js
const emp = []
emp[0] = 'Casey Jones'
emp[1] = 'Phil Lesh'
emp[2] = 'August West'
```

如果给数组运算符的是一个非整型数值，那么它将作为一个表示数组的对象的属性创建，而不是数组的元素：

```js
const arr = []
arr[3.4] = 'Oranges'
console.log(arr.length) // 0
console.log(Object.hasOwn(arr, 3.4)) // true
```

在实现层面，JavaScript 实际上是将元素作为标准的对象属性来存储，把数组索引作为属性名。

`length` 属性是特殊的，如果存在最后一个元素，则其值总是大于其索引的正整数。记住，JavaScript 数组索引是基于 0 的：它们从 `0` 开始，而不是 `1`。这意味着 `length` 属性将比最大的索引值大 1：

```js
const cats = []
cats[30] = ['Dusty']
console.log(cats.length) // 31
```

也可以给 `length` 属性赋值。写一个小于数组元素数量的值将截断数组，写 `0` 会彻底清空数组：

```js
const cats = ['Dusty', 'Misty', 'Twiggy']
console.log(cats.length) // 3

cats.length = 2
console.log(cats) // [ 'Dusty', 'Misty' ] - Twiggy 已经被移除了

cats.length = 0
console.log(cats) // 输出 []，猫名称的数组现在已经空了

cats.length = 3
console.log(cats) // 输出 [ <3 empty items> ]
```

### 遍历数组

一种常见的操作是遍历数组的值，以某种方式处理每个值。最简单的方法如下：

```js
const colors = ['red', 'green', 'blue']
for (let i = 0; i < colors.length; i++) {
  console.log(colors[i])
}
```

如果确定数组中没有一个元素求值为 `false`（例如，数组只包含 DOM 节点），可以选择一个更高效的土法子：

```js
const divs = document.getElementsByTagName('div')
for (let i = 0, div; (div = divs[i]); i++) {
  /* 以某种方式处理 div */
}
```

这避免了检查数组长度的开销，并确保 `div` 变量在每次循环时都被重新赋值给当前项，从而增加了便利性。

`forEach()` 方法提供了遍历数组元素的其他方法：

```js
const colors = ['red', 'green', 'blue']
colors.forEach((color) => console.log(color))
// red
// green
// blue
```

传递给 `forEach` 的函数对数组中的每个元素执行一次，数组元素作为参数传递给该函数。未赋值的值不会在 `forEach` 循环迭代。

注意，在数组定义时省略的元素不会在 `forEach` 遍历时被列出，但是手动赋值为 `undefined` 的元素是**会**被列出的：

```js
const sparseArray = ['first', 'second', , 'fourth']

sparseArray.forEach((element) => {
  console.log(element)
})
// first
// second
// fourth

if (sparseArray[2] === undefined) {
  console.log('sparseArray[2] 是 undefined') // true
}

const nonsparseArray = ['first', 'second', undefined, 'fourth']

nonsparseArray.forEach((element) => {
  console.log(element)
})
// first
// second
// undefined
// fourth
```

由于 JavaScript 元素被保存为标准对象属性，因此不建议使用 `for...in` 循环遍历 JavaScript 数组，因为普通元素和所有可枚举属性都将被列出。

### 数组方法

`Array` 对象具有下列方法。

`concat()` 方法连接两个或多个数组并返回一个新的数组：

```js
let myArray = ['1', '2', '3']
myArray = myArray.concat('a', 'b', 'c')
// myArray 现在是 ["1", "2", "3", "a", "b", "c"]
```

`join()` 方法将数组中的所有元素连接成一个字符串：

```js
const myArray = ['Wind', 'Rain', 'Fire']
const list = myArray.join(' - ') // list 现在是 "Wind - Rain - Fire"
```

`push()` 方法在数组末尾添加一个或多个元素，并返回数组操作后的 `length`。`pop()` 方法从数组移出最后一个元素，并返回该元素。`shift()` 方法从数组移出第一个元素，并返回该元素。`unshift()` 方法在数组开头添加一个或多个元素，并返回数组的新长度：

```js
const myArray = ['1', '2']
myArray.push('3') // myArray 现在是 ["1", "2", "3"]
const last = myArray.pop() // myArray 现在是 ["1", "2"]，last 为 "3"

const first = myArray.shift() // myArray 现在是 ["2"]，first 为 "1"
myArray.unshift('4', '5')
// myArray 变成了 ["4", "5", "2"]
```

`slice()` 方法从数组提取一个片段，并作为一个新数组返回：

```js
let myArray = ['a', 'b', 'c', 'd', 'e']
myArray = myArray.slice(1, 4) // [ "b", "c", "d"]
// 从索引 1 开始，提取所有的元素，直到索引 3 为止
```

`at()` 方法返回数组中指定索引处的元素，如果索引超出范围，则返回 `undefined`。它主要用于从数组末尾访问元素的负下标：

```js
const myArray = ['a', 'b', 'c', 'd', 'e']
myArray.at(-2) // "d"，myArray 的倒数第二个元素
```

`splice()` 方法从数组移除一些元素，并（可选地）替换它们。它返回从数组中删除的元素：

```js
const myArray = ['1', '2', '3', '4', '5']
myArray.splice(1, 3, 'a', 'b', 'c', 'd')
// myArray 现在是 ["1", "a", "b", "c", "d", "5"]
// 本代码从 1 号索引开始（或元素“2”所在的位置），
// 移除 3 个元素，然后将后续元素插入到那个位置上。
```

`reverse()` 方法原地颠倒数组元素的顺序：第一个数组元素变为最后一个数组元素，最后一个数组元素变为第一个数组元素。它返回对数组的引用：

```js
const myArray = ['1', '2', '3']
myArray.reverse()
// 将原数组颠倒，myArray = [ "3", "2", "1" ]
```

`flat()` 方法返回一个新数组，所有子数组元素递归地连接到其中，直到指定的深度：

```js
let myArray = [1, 2, [3, 4]]
myArray = myArray.flat()
// myArray 现在是 [1, 2, 3, 4]，因为子数组 [3, 4] 已被展平
```

`sort()` 方法对数组的元素进行适当的排序，并返回对数组的引用：

```js
const myArray = ['Wind', 'Rain', 'Fire']
myArray.sort()
// 对数组排序，myArray = ["Fire", "Rain", "Wind"]
```

`sort()` 也可以接受回调函数来决定如何比较数组元素。使用两个参数调用回调函数，它们是来自数组的两个值。该函数比较这两个值并返回正数、负数或零，表示这两个值的顺序。例如，以下命令将根据字符串的最后一个字母对数组进行排序：

```js
const sortFn = (a, b) => {
  if (a[a.length - 1] < b[b.length - 1]) {
    return -1 // 负数 => a < b，a 在 b 之前
  } else if (a[a.length - 1] > b[b.length - 1]) {
    return 1 // 正数 => a > b，a 在 b 之后
  }
  return 0 // 0 => a = b，a 和 b 保持原来的顺序
}
myArray.sort(sortFn)
// 对数组排序，myArray = ["Wind","Fire","Rain"]
```

- 如果 `a` 小于 `b`，返回 `-1`（或任何负数）
- 如果 `a` 大于 `b`，返回 `1`（或任何正数）
- 如果 `a` 和 `b` 相等，返回 `0`。

`indexOf()` 方法在数组中搜索 `searchElement` 并返回第一个匹配的索引：

```js
const a = ['a', 'b', 'a', 'b', 'a']
console.log(a.indexOf('b')) // 1

// 再试一次，这次从最后一次匹配之后开始
console.log(a.indexOf('b', 2)) // 3
console.log(a.indexOf('z')) // -1, 因为找不到 'z'
```

`lastIndexOf()` 方法的工作原理类似于 `indexOf`，但这是从末尾开始，反向搜索：

```js
const a = ['a', 'b', 'c', 'd', 'a', 'b']
console.log(a.lastIndexOf('b')) // 5

// 再试一次，这次从最后一次匹配之前开始
console.log(a.lastIndexOf('b', 4)) // 1
console.log(a.lastIndexOf('z')) // -1
```

`map()` 方法返回由每个数组元素上执行 `callback` 的返回值所组成的新数组：

```js
const a1 = ['a', 'b', 'c']
const a2 = a1.map((item) => item.toUpperCase())
console.log(a2) // ['A', 'B', 'C']
```

`flatMap()` 方法先执行 `map()`，再执行深度为 1 的 `flat()`：

```js
const a1 = ['a', 'b', 'c']
const a2 = a1.flatMap((item) => [item.toUpperCase(), item.toLowerCase()])
console.log(a2) // ['A', 'a', 'B', 'b', 'C', 'c']
```

`filter()` 方法返回一个新数组，其中包含 `callback` 返回 `true` 的元素：

```js
const a1 = ['a', 10, 'b', 20, 'c', 30]
const a2 = a1.filter((item) => typeof item === 'number')
console.log(a2) // [10, 20, 30]
```

`find()` 方法返回 `callback` 返回 `true` 的第一个元素；`findLast()` 返回最后一个元素；`findIndex()` 返回第一个元素的索引；`findLastIndex()` 返回最后一个元素的索引：

```js
const a1 = ['a', 10, 'b', 20, 'c', 30]
console.log(a1.find((item) => typeof item === 'number')) // 10
console.log(a1.findLast((item) => typeof item === 'number')) // 30
console.log(a1.findIndex((item) => typeof item === 'number')) // 1
console.log(a1.findLastIndex((item) => typeof item === 'number')) // 5
```

如果 `callback` 对数组中的每一个元素都返回 `true`，则 `every()` 方法返回 `true`。如果 `callback` 对数组中至少一个元素返回 `true`，则 `some()` 方法返回 `true`：

```js
function isNumber(value) {
  return typeof value === 'number'
}
const a1 = [1, 2, 3]
console.log(a1.every(isNumber)) // true
const a2 = [1, '2', 3]
console.log(a2.every(isNumber)) // false
console.log(a2.some(isNumber)) // true
```

`reduce()` 方法对数组中的每个值执行 `callback(accumulator, currentValue, currentIndex, Array)`，目的是将列表中的元素减少到单个值。`reduce` 函数返回 `callback` 函数返回的最终值。如果指定了 `initialValue`，则调用 `callback`，并将 `initialValue` 作为第一个参数值，将数组中第一个元素的值作为第二个参数值。如果没有指定 `initialValue`，那么 `callback` 的前两个参数值将是数组的第一个和第二个元素。之后的每一次调用，第一个参数的值将是前一个调用中返回的 `callback`，第二个参数的值将是数组中的下一个值。

```js
const a = [10, 20, 30]
const total = a.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
console.log(total) // 60
```

`reduceRight()` 方法的工作原理类似于 `reduce()`，但从最后一个元素开始。`reduce` 和 `reduceRight` 是迭代数组方法中最不被人熟知的两个函数。它们应该使用在那些需要把数组的元素两两递归处理，并最终计算成一个单一结果的算法。

接受回调的 `forEach`、`map`、`filter` 等方法被称为**迭代方法**，因为它们以某种方式遍历整个数组。每个都接受第二个可选的参数 `thisArg`。如果提供，`thisArg` 将成为回调函数体中 `this` 关键字的值。`sort()` 不是迭代方法，因为它的回调函数只用于比较，不能基于元素顺序以任何特定顺序调用，也不接受 `thisArg` 形参。

### 稀疏数组

数组可以包含“空槽”，这与用值 `undefined` 填充的槽不一样。空槽可以通过以下方式之一创建：

```js
// Array 构造函数：
const a = Array(5) // [ <5 empty items> ]

// 数组字面量中的连续逗号：
const b = [1, 2, , , 5] // [ 1, 2, <2 empty items>, 5 ]

// 直接给大于 array.length 的索引设置值以形成空槽：
const c = [1, 2]
c[4] = 5 // [ 1, 2, <2 empty items>, 5 ]

// 通过直接设置 .length 拉长一个数组：
const d = [1, 2]
d.length = 5 // [ 1, 2, <3 empty items> ]

// 删除一个元素：
const e = [1, 2, 3, 4, 5]
delete e[2] // [ 1, 2, <1 empty item>, 4, 5 ]
```

在某些操作中，空槽的行为就像它们被填入了 `undefined` 那样：

```js
const arr = [1, 2, , , 5] // 创建一个稀疏数组

// 通过索引访问
console.log(arr[2]) // undefined

// For...of
for (const i of arr) {
  console.log(i)
}
// 输出：1 2 undefined undefined 5

// 展开运算
const another = [...arr] // "another" 为 [ 1, 2, undefined, undefined, 5 ]
```

在其他方法，特别是数组迭代方法时，空槽是被跳过的：

```js
const mapped = arr.map((i) => i + 1) // [ 2, 3, <2 empty items>, 6]
arr.forEach((i) => console.log(i)) // 1 2 5
const filtered = arr.filter(() => true) // [ 1, 2, 5]
const hasFalsy = arr.some((k) => !k) // false

// 属性迭代
const keys = Object.keys(arr) // [ '0', '1', '4']
for (const key in arr) {
  console.log(key)
}
// 输出：'0' '1' '4'
// 在对象中使用展开，使用属性枚举，而不是数组的迭代器
const objectSpread = { ...arr } // { '0': 1, '1': 2, '4': 5 }
```

### 多维数组与类数组对象

数组是可以嵌套的，这就意味着一个数组可以作为一个元素被包含在另外一个数组里面。利用 JavaScript 数组的这个特性，可以创建多维数组。以下代码创建了一个二维数组：

```js
const a = new Array(4)
for (let i = 0; i < 4; i++) {
  a[i] = new Array(4)
  for (let j = 0; j < 4; j++) {
    a[i][j] = '[' + i + ',' + j + ']'
  }
}
```

这个例子创建的数组拥有以下行数据：

```plain
Row 0: [0,0] [0,1] [0,2] [0,3]
Row 1: [1,0] [1,1] [1,2] [1,3]
Row 2: [2,0] [2,1] [2,2] [2,3]
Row 3: [3,0] [3,1] [3,2] [3,3]
```

数组也可以像对象那样使用，以存储相关信息：

```js
const arr = [1, 2, 3]
arr.property = 'value'
console.log(arr.property) // "value"
```

一些 DOM 集合（如 `NodeList`）和函数内部的 `arguments` 对象是**类数组对象**：它们有 `length` 属性和数字索引，但没有数组的方法。可以用 `Array.from()` 把它们转换成真正的数组，再使用 `map`、`filter` 等方法。

## 对象

### 对象与属性

JavaScript 的设计是一个简单的基于对象的范式。一个对象就是一系列属性的集合，一个属性包含一个名和一个值。一个属性的值可以是函数，这种情况下属性也被称为**方法**。

一个 JavaScript 对象有很多属性。一个对象的属性可以被解释成一个附加到对象上的变量。对象的属性和普通的 JavaScript 变量基本没什么区别，仅仅是属性属于某个对象。属性定义了对象的特征。可以通过点符号来访问一个对象的属性：

```js
objectName.propertyName
```

和其他 JavaScript 变量一样，对象的名字（可以是普通的变量）和属性的名字都是大小写敏感的。可以在定义一个属性的时候就给它赋值：

```js
const myCar = new Object()
myCar.make = 'Ford'
myCar.model = 'Mustang'
myCar.year = 1969
```

对象中未赋值的属性的值为 `undefined`（而不是 `null`）：

```js
myCar.noProperty // undefined
```

JavaScript 对象的属性也可以通过方括号访问或者设置。对象有时也被叫作关联数组，因为每个属性都有一个用于访问它的字符串值：

```js
myCar['make'] = 'Ford'
myCar['model'] = 'Mustang'
myCar['year'] = 1969
```

一个对象的属性名可以是任何有效的 JavaScript 字符串，或者可以被转换为字符串的任何类型，包括空字符串。然而，一个属性的名称如果不是一个有效的 JavaScript 标识符（例如，一个由空格或连字符，或者以数字开头的属性名），就只能通过方括号标记访问。这个标记法在属性名称是动态判定（属性名只有到运行时才能判定）时非常有用。

请注意，方括号中的所有键都将转换为字符串类型，因为 JavaScript 中的对象只能使用 String 类型作为键类型。例如：

```js
const myObj = new Object()
const str = 'myString'
const rand = Math.random()
const obj = new Object()

myObj.type = 'Dot syntax'
myObj['date created'] = 'String with space'
myObj[str] = 'String value'
myObj[rand] = 'Random Number'
myObj[obj] = 'Object'
myObj[''] = 'Even an empty string'
```

当将键 `obj` 添加到 `myObj` 时，JavaScript 将调用 `obj.toString()` 方法，并将此结果字符串用作新键。

### 枚举属性

有三种原生的方法用于列出或枚举对象的属性：

- `for...in` 循环：该方法依次访问一个对象及其原型链中所有可枚举的属性。
- `Object.keys(o)`：该方法返回对象 `o` 自身包含（不包括原型中）的所有可枚举属性的名称的数组。
- `Object.getOwnPropertyNames(o)`：该方法返回对象 `o` 自身包含（不包括原型中）的所有属性（无论是否可枚举）的名称的数组。

在 ECMAScript 5 之前，没有原生的方法枚举一个对象的所有属性。然而，可以通过以下函数完成：

```js
function listAllProperties(o) {
  let objectToInspect
  let result = []

  for (
    objectToInspect = o;
    objectToInspect !== null;
    objectToInspect = Object.getPrototypeOf(objectToInspect)
  ) {
    result = result.concat(Object.getOwnPropertyNames(objectToInspect))
  }

  return result
}
```

这在展示“隐藏”（在原型中的不能通过对象访问的属性，因为另一个同名的属性存在于原型链的早期）的属性时很有用。如果只想列出可访问的属性，那么只需要去除数组中的重复元素即可。

### 创建对象

#### 使用对象初始化器

除了通过构造函数创建对象之外，也可以通过对象初始化器创建对象。使用对象初始化器也被称作通过字面值创建对象。对象初始化器与 C++ 术语相一致。通过对象初始化器创建对象的语法如下：

```js
const obj = {
  property_1: value_1, // property_# 可以是一个标识符...
  2: value_2, // 或一个数字...
  ['property' + 3]: value_3, // 或一个可计算的 key 名...
  // ...,
  'property n': value_n, // 或一个字符串
}
```

这里 `obj` 是新对象的名称，每一个 `property_i` 是一个标识符（可以是一个名称、数字或字符串字面量），并且每个 `value_i` 是一个其值将被赋予 `property_i` 的表达式。`obj` 与赋值是可选的；如果不需要在其他地方引用对象，就不需要将它赋给一个变量。注意在接受一条语句的地方，可能需要将对象字面量括在括号里，从而避免将字面量与块语句相混淆。

如果一个对象是通过在顶级脚本的对象初始化器创建的，则 JavaScript 在每次遇到包含该对象字面量的表达式时都会创建对象。同样的，在函数中的初始化器在每次函数调用时也会被创建。

以下创建了有三个属性的 `myHonda` 对象。注意它的 `engine` 属性也是一个拥有自己属性的对象：

```js
const myHonda = { color: 'red', wheels: 4, engine: { cylinders: 4, size: 2.2 } }
```

#### 使用构造函数

作为另一种方式，可以通过两步来创建对象：

1. 通过创建一个构造函数来定义对象的类型。首字母大写是非常普遍而且很恰当的惯用法。
2. 通过 `new` 创建对象实例。

为了定义对象类型，为对象类型创建一个函数以声明类型的名称、属性和方法。例如，要为汽车创建一个类型，并且将这类对象称为 `car`，并且拥有属性 `make`、`model` 和 `year`，可以创建如下的函数：

```js
function Car(make, model, year) {
  this.make = make
  this.model = model
  this.year = year
}
```

注意通过使用 `this` 将传入函数的值赋给对象的属性。现在可以像这样创建一个 `mycar` 对象：

```js
const mycar = new Car('Eagle', 'Talon TSi', 1993)
```

该语句创建了 `mycar` 并且将指定的值赋给它的属性。因而 `mycar.make` 的值是字符串 `"Eagle"`，`mycar.year` 的值是整数 `1993`，依此类推。

一个对象的属性值可以是另一个对象。例如，假设按如下方式定义了 `person` 对象：

```js
function Person(name, age, sex) {
  this.name = name
  this.age = age
  this.sex = sex
}
```

然后按如下方式创建了两个 `person` 实例：

```js
const rand = new Person('Rand McKinnon', 33, 'M')
const ken = new Person('Ken Jones', 39, 'M')
```

那么，可以重写 `car` 的定义以包含一个拥有它的 `owner` 属性：

```js
function Car(make, model, year, owner) {
  this.make = make
  this.model = model
  this.year = year
  this.owner = owner
}

const car1 = new Car('Eagle', 'Talon TSi', 1993, rand)
const car2 = new Car('Nissan', '300ZX', 1992, ken)
```

注意在创建新对象时，上面的语句将 `rand` 和 `ken` 作为 `owner` 的参数值，而不是传入字符串字面量或整数值。接下来如果想找出 `car2` 的拥有者的姓名，可以访问 `car2.owner.name`。

注意总是可以为之前定义的对象增加新的属性。例如，语句 `car1.color = "black"` 为 `car1` 增加了 `color` 属性，并将其值设为 `"black"`。然而，这并不影响其他的对象。想要为某个类型的所有对象增加新属性，必须将属性加入到 `car` 对象类型的定义中。

#### 使用 Object.create 方法

对象也可以用 `Object.create()` 方法创建。该方法非常有用，因为它允许为创建的对象选择一个原型对象，而不用定义构造函数：

```js
// Animal properties and method encapsulation
const Animal = {
  type: 'Invertebrates', // 属性默认值
  displayType() {
    // 用于显示 type 属性的方法
    console.log(this.type)
  },
}

// 创建一种新的动物——animal1
const animal1 = Object.create(Animal)
animal1.displayType() // Output: Invertebrates

// 创建一种新的动物——Fishes
const fish = Object.create(Animal)
fish.type = 'Fishes'
fish.displayType() // Output: Fishes
```

### 增强的对象字面量

对象字面量支持一组简写语法，包括在创建时设置原型、`foo: foo` 赋值的简写、定义方法、支持 `super` 调用以及使用表达式计算属性名。总之，这些也使对象字面量和类声明更加紧密地联系起来，让基于对象的设计从这些便利中更加受益：

```js
const obj = {
  // __proto__
  __proto__: theProtoObj,
  // “handler: handler”的简写
  handler,
  // 方法
  toString() {
    // Super 调用
    return 'd ' + super.toString()
  },
  // 计算（动态的）属性名
  ['prop_' + (() => 42)()]: 42,
}
```

### 方法、this 与访问器

一个**方法**是关联到某个对象的函数，或者简单地说，一个方法是一个值为某个函数的对象属性。定义方法就像定义普通的函数，除了它们必须被赋给对象的某个属性：

```js
objectName.methodname = function_name

const myObj = {
  myMethod(params) {
    // ...do something
  },
  // 或者这样写也可以
  myOtherMethod(params) {
    // ...do something else
  },
}
```

可以在对象的上下文中像这样调用方法：

```js
object.methodname(params)
```

JavaScript 有一个特殊的关键字 `this`，它可以在方法中使用以指代当前对象。例如，假设有一个名为 `validate` 的函数，它根据给出的最大与最小值检查某个对象的 `value` 属性：

```js
function validate(obj, lowval, hival) {
  if (obj.value < lowval || obj.value > hival) {
    alert('Invalid Value!')
  }
}
```

然后，可以在每个元素的 `onchange` 事件处理器中调用 `validate`，并通过 `this` 传入相应元素，代码如下：

```html
<input type="text" name="age" size="3" onChange="validate(this, 18, 99)" />
```

总的说来，`this` 在一个方法中指调用的对象。当与 `form` 属性一起使用时，`this` 可以指代当前对象的父窗体。在下面的例子中，窗体 `myForm` 包含一个 `Text` 对象和一个按钮，当用户点击按键，`Text` 对象的值被设为窗体的名称。按钮的 `onclick` 事件处理器使用 `this.form` 以指代其父窗体，即 `myForm`：

```html
<form name="myForm">
  <p>
    <label>Form name:<input type="text" name="text1" value="Beluga" /></label>
  </p>
  <p>
    <input
      name="button1"
      type="button"
      value="Show Form Name"
      onclick="this.form.text1.value = this.form.name"
    />
  </p>
</form>
```

一个 getter 是一个获取某个特定属性的值的方法。一个 setter 是一个设定某个属性的值的方法。可以为预定义的或用户定义的对象定义 getter 和 setter 以支持新增的属性。定义 getter 和 setter 的语法采用对象字面量语法。下面例子描述了 getter 和 setter 是如何为用户定义的对象 `o` 工作的：

```js
const o = {
  a: 7,
  get b() {
    return this.a + 1
  },
  set c(x) {
    this.a = x / 2
  },
}

console.log(o.a) // 7
console.log(o.b) // 8
o.c = 50
console.log(o.a) // 25
```

`o` 对象的属性如下：

- `o.a` — 数字
- `o.b` — 返回 `o.a` + 1 的 getter
- `o.c` — 由 `o.c` 的值所设置 `o.a` 值的 setter

请注意在一个对象字面量语法中定义 getter 和 setter 使用 `[gs]et property()` 的方式，而不是误以为在获取和设置某个属性自身。定义一个已经声明的函数作为 getter 和 setter 方法，使用 `Object.defineProperty()`（或者 `Object.prototype.__defineGetter__` 旧语法回退）。

### 删除属性与比较对象

可以用 `delete` 操作符删除一个**不是继承而来**的属性。下面的例子说明如何删除一个属性：

```js
// 创建一个新对象 myobj，它有两个属性 a 和 b。
const myobj = new Object()
myobj.a = 5
myobj.b = 12

// 移除 a 属性，只留下 b 属性。
delete myobj.a
```

如果一个全局变量不是用 `var` 关键字声明的话，也可以用 `delete` 删除它：

```js
g = 17
delete g
```

在 JavaScript 中，对象是一种引用类型。两个独立声明的对象永远也不会相等，即使他们有相同的属性，只有在比较一个对象和这个对象的引用时，才会返回 `true`：

```js
// 两个变量，两个具有同样的属性、但不相同的对象
const fruit = { name: 'apple' }
const fruitbear = { name: 'apple' }

fruit == fruitbear // return false
fruit === fruitbear // return false
```

```js
// 两个变量，同一个对象
const fruit = { name: 'apple' }
const fruitbear = fruit // 将 fruit 的对象引用（reference）赋值给 fruitbear
// fruit 与 fruitbear 都指向同样的对象
fruit == fruitbear // return true
fruit === fruitbear // return true
```

### 原型链

所有的 JavaScript 对象至少继承于一个对象。被继承的对象被称作原型，并且继承的属性可通过构造函数的 `prototype` 对象找到。对象的原型指向另一个对象或者 `null`——从概念上讲，它是对象的隐藏属性，通常表示为 `[[Prototype]]`。对象的 `[[Prototype]]` 的属性也可以在对象自身上访问。更完整的讨论放在第二篇《函数与对象模型》展开。

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

### 示例

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

`throw`、`try...catch` 和 `Error` 对象属于错误处理的内容，不在本篇展开。

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

## Map 和 Set

### Map

本章将介绍由键索引的数据集合；`Map` 和 `Set` 对象包含可按插入顺序迭代的元素。

`Map` 对象就是一个简单的键/值对映射集合，可以按照数据插入时的顺序遍历所有的元素。

下面的代码演示了使用 `Map` 进行的一些基本操作。可以使用 `for...of` 循环来在每一次迭代中得到 `[key, value]` 数组：

```js
const sayings = new Map()
sayings.set('dog', 'woof')
sayings.set('cat', 'meow')
sayings.set('elephant', 'toot')
sayings.size // 3
sayings.get('dog') // woof
sayings.get('fox') // undefined
sayings.has('bird') // false
sayings.delete('dog')
sayings.has('dog') // false

for (const [key, value] of sayings) {
  console.log(`${key} goes ${value}`)
}
// "cat goes meow"
// "elephant goes toot"

sayings.clear()
sayings.size // 0
```

### Object 和 Map 的比较

一般地，`Object` 会被用于将字符串类型映射到值。`Object` 允许设置键值对、根据键获取值、删除键、检测某个键是否存在。不过，`Map` 对象还有一些优点，可以更好地应用于映射关系表示中：

- `Object` 的键均为字符串或 Symbol 类型，在 `Map` 里键可以是任意类型。
- 必须手动计算 `Object` 的大小，但是可以很容易地获取 `Map` 的大小（`size`）。
- `Map` 的遍历遵循元素的插入顺序。
- `Object` 有原型，所以映射中有一些缺省的键（可以用 `map = Object.create(null)` 回避）。

这三条提示可以帮助决定用 `Map` 还是 `Object`：

- 如果键在运行时才能知道，或者所有的键类型相同，所有的值类型相同，那就使用 `Map`。
- 如果需要将原始值存储为键，则使用 `Map`，因为 `Object` 将每个键视为字符串，不管它是一个数字值、布尔值还是任何其他原始值。
- 如果存在需要对个别元素进行操作的逻辑，使用 `Object`。

### WeakMap

`WeakMap` 是键/值对的集合，其键必须是对象或非注册符号，其值为任意 JavaScript 类型，并且不会对其键创建强引用。也就是说，一个对象作为键出现在 `WeakMap` 中并不会阻止该对象被垃圾回收。一旦作为键的对象被收集，其在任何 `WeakMap` 中的相应值也会被垃圾收集，只要它们没有在其他地方被强引用。唯一可用作 `WeakMap` 键的原始类型是 symbol，更具体地说，是非注册 symbol，因为非注册 symbol 保证是唯一的，并且不能被重新创建。

`WeakMap` API 与 `Map` API 基本相同。不过，`WeakMap` 不允许观察其键的有效性，这也是它不允许枚举的原因。因此，没有任何方法可以获取 `WeakMap` 中的键的列表。如果有的话，该列表将取决于垃圾回收的状态，从而引入非确定性。

`WeakMap` 对象的一个用例是存储一个对象的私有数据或隐藏实现细节。对象内部的私有数据和方法被存储在 `WeakMap` 类型的 `privates` 变量中。所有暴露出的原型和实例都是公开的，而其他内容都是外界不可访问的，因为模块并未导出 `privates` 对象：

```js
const privates = new WeakMap()

function Public() {
  const me = {
    // 这里是私有数据
  }
  privates.set(this, me)
}

Public.prototype.method = function () {
  const me = privates.get(this)
  // 处理 `me` 中的私有数据
  // …
}

module.exports = Public
```

### Set

`Set` 对象是一组唯一值的集合，可以按照添加顺序来遍历。`Set` 中的值只能出现一次；它在集合 `Set` 中是唯一的。以下代码演示了 `Set` 的基本操作：

```js
const mySet = new Set()
mySet.add(1)
mySet.add('some text')
mySet.add('foo')

mySet.has(1) // true
mySet.delete('foo')
mySet.size // 2

for (const item of mySet) {
  console.log(item)
}
// 1
// "some text"
```

### 数组和 Set 之间的转换

可以使用 `Array.from()` 或展开语法来完成集合到数组的转换。同样，`Set` 的构造函数接受数组作为参数，可以完成从 `Array` 到 `Set` 的转换。`Set` 对象存储**唯一值**，所以数组转换为 `Set` 时，任何重复值将会被删除：

```js
Array.from(mySet)
;[...mySet2]

mySet2 = new Set([1, 2, 3, 4])
```

一般情况下，在 JavaScript 中使用数组来存储一组元素，而新的 `Set` 对象有这些优势：

- 根据值（`arr.splice(arr.indexOf(val), 1)`）删除数组元素效率低下。
- `Set` 对象允许根据值删除元素，而数组中必须使用基于元素下标的 `splice` 方法。
- 数组的 `indexOf` 方法无法找到 `NaN` 值。
- `Set` 对象存储唯一值，所以不需要手动处理包含重复值的情况。

### WeakSet

`WeakSet` 对象是可收集垃圾值的集合，包括对象和非注册 symbol。`WeakSet` 中的值只能出现一次。它在 `WeakSet` 的集合中是唯一的。与 `Set` 对象的主要区别有：

- 与 `Set` 相反，`WeakSet` 是**对象或 symbol 的集合**，而不是任何类型的任意值的集合。
- `WeakSet` 的**弱**是指集合中的对象是弱引用的。如果 `WeakSet` 中存储的一个对象不存在其他的引用，那么它就会被垃圾回收。这也意味着集合中不再存储当前对象。
- `WeakSet` 不可枚举。

`WeakSet` 对象的用例有限。它们不会泄露内存，因此可以安全地使用 DOM 元素作为键，并将其标记用于跟踪等目的。

### Map 和 Set 的键值相等

`Map` 对象和 `Set` 对象的键和值的等值判断都基于 SameValueZero 算法：

- 等价的作用类似于严格相等运算符 `===`。
- `-0` 和 `+0` 相等。
- `NaN` 与自身相等（与 `===` 有所不同）。

## iterable

### 迭代器

迭代器和生成器将迭代的概念直接带入核心语言，并提供了一种机制来自定义 `for...of` 循环的行为。

在 JavaScript 中，**迭代器**是一个对象，它定义一个序列，并在终止时可能附带一个返回值。更具体地说，迭代器是通过使用 `next()` 方法实现了迭代器协议的任何一个对象，该方法返回具有两个属性的对象：

- `value`：迭代序列的下一个值。
- `done`：如果已经迭代到序列中的最后一个值，则它为 `true`。如果 `value` 和 `done` 一起出现，则它就是迭代器的返回值。

一旦创建，迭代器对象可以通过重复调用 `next()` 显式地迭代。迭代一个迭代器被称为消耗了这个迭代器，因为它通常只能执行一次：在产生终值后，对 `next()` 的额外调用应该继续返回 `{done: true}`。

JavaScript 中最常见的迭代器是数组迭代器，它按顺序返回关联数组中的每个值。

虽然很容易想象所有迭代器都可以表示为数组，但事实并非如此。数组必须完整分配，而迭代器则是按需分配。因此，迭代器可以表示无限大小的序列，例如 0 和 `Infinity` 之间的整数范围。

下面的例子展示了具体做法。它允许创建一个简单的范围迭代器，以定义一个从 `start`（闭）到 `end`（开），以 `step` 为步长的整数序列。它的最终返回值是它创建的序列的大小，由变量 `iterationCount` 跟踪：

```js
function makeRangeIterator(start = 0, end = Infinity, step = 1) {
  let nextIndex = start
  let iterationCount = 0

  const rangeIterator = {
    next() {
      let result
      if (nextIndex < end) {
        result = { value: nextIndex, done: false }
        nextIndex += step
        iterationCount++
        return result
      }
      return { value: iterationCount, done: true }
    },
  }
  return rangeIterator
}
```

使用这个迭代器看起来像这样：

```js
let it = makeRangeIterator(1, 10, 2)

let result = it.next()
while (!result.done) {
  console.log(result.value) // 1 3 5 7 9
  result = it.next()
}

console.log(`已迭代序列的大小：${result.value}`) // 5
```

反射性地知道特定对象是否是迭代器是不可能的。如果需要这样做，请使用**可迭代对象**。

### 生成器函数

虽然自定义迭代器是一个有用的工具，但由于需要显式地维护其内部状态，因此创建时要格外谨慎。**生成器函数**（Generator 函数）提供了一个强大的替代选择：它允许定义一个非连续执行的函数作为迭代算法。生成器函数使用 `function*` 语法编写。

最初调用时，生成器函数不执行任何代码，而是返回一种称为**生成器**的特殊迭代器。通过调用 `next()` 方法消耗该生成器时，生成器函数将执行，直至遇到 `yield` 关键字。

可以根据需要多次调用该函数，并且每次都返回一个新的生成器，但每个生成器只能迭代一次。

现在可以调整上面的例子了。此代码的行为并没有改变，但更容易编写和阅读：

```js
function* makeRangeIterator(start = 0, end = Infinity, step = 1) {
  let iterationCount = 0
  for (let i = start; i < end; i += step) {
    iterationCount++
    yield i
  }
  return iterationCount
}
```

### 可迭代对象

若一个对象拥有迭代行为，比如在 `for...of` 中会循环一些值，那么那个对象便是一个可迭代对象。一些内置类型，如 `Array` 或 `Map` 拥有默认的迭代行为，而其他类型（比如 `Object`）则没有。

为了实现**可迭代**，对象必须实现 `[Symbol.iterator]()` 方法，这意味着这个对象（或其原型链中的任意一个对象）必须具有一个键值为 `Symbol.iterator` 的属性。

程序员应知道一个可迭代对象可以多次迭代，还是只能迭代一次。只能迭代一次的可迭代对象（例如生成器）通常从它们的 `[Symbol.iterator]()` 方法中返回 `this`，而那些可以多次迭代的方法必须在每次调用 `[Symbol.iterator]()` 时返回一个新的迭代器：

```js
function* makeIterator() {
  yield 1
  yield 2
}

const it = makeIterator()

for (const itItem of it) {
  console.log(itItem)
}

console.log(it[Symbol.iterator]() === it) // true

// 这个例子展示了生成器（迭代器）是可迭代对象，
// 它有一个 [Symbol.iterator]() 方法返回 it（它自己），
// 因此，it 对象只能迭代*一次*。

// 如果将它的 [Symbol.iterator]() 方法改为一个返回新的迭代器/生成器对象的函数/生成器，
// 它（it）就可以迭代多次了。

it[Symbol.iterator] = function* () {
  yield 2
  yield 1
}
```

#### 自定义的可迭代对象

可以像这样实现自己的可迭代对象：

```js
const myIterable = {
  *[Symbol.iterator]() {
    yield 1
    yield 2
    yield 3
  },
}

for (const value of myIterable) {
  console.log(value)
}
// 1
// 2
// 3

;[...myIterable] // [1, 2, 3]
```

#### 内置可迭代对象

`String`、`Array`、`TypedArray`、`Map` 和 `Set` 都是内置可迭代对象，因为它们的原型对象都拥有一个 `Symbol.iterator` 方法。

#### 用于可迭代对象的语法

一些语句和表达式专用于可迭代对象，例如 `for...of` 循环、展开语法、`yield*` 和解构语法：

```js
for (const value of ['a', 'b', 'c']) {
  console.log(value)
}
// "a"
// "b"
// "c"

;[...'abc'] // ["a", "b", "c"]

function* gen() {
  yield* ['a', 'b', 'c']
}

gen().next() // { value: "a", done: false }

;[a, b, c] = new Set(['a', 'b', 'c'])
a // "a"
```

### 高级生成器

生成器会**按需**计算它们 `yield` 的值，这使得它们能够高效地表示一个计算成本很高的序列，甚至是前文所示的一个无限序列。

`next()` 方法也接受一个参数用于修改生成器内部状态。传递给 `next()` 的参数值会被 `yield` 接收。注意，传给**第一个** `next()` 的值会被忽略。

下面的是斐波那契数列生成器，它使用了 `next(x)` 来重启序列：

```js
function* fibonacci() {
  let current = 0
  let next = 1
  while (true) {
    const reset = yield current
    ;[current, next] = [next, next + current]
    if (reset) {
      current = 0
      next = 1
    }
  }
}

const sequence = fibonacci()
console.log(sequence.next().value) // 0
console.log(sequence.next().value) // 1
console.log(sequence.next().value) // 1
console.log(sequence.next().value) // 2
console.log(sequence.next().value) // 3
console.log(sequence.next().value) // 5
console.log(sequence.next().value) // 8
console.log(sequence.next(true).value) // 0
console.log(sequence.next().value) // 1
console.log(sequence.next().value) // 1
console.log(sequence.next().value) // 2
```

可以通过调用其 `throw()` 方法强制生成器抛出异常，并传递应该抛出的异常值。这个异常将从当前挂起的生成器的上下文中抛出，就好像当前挂起的 `yield` 是一个 `throw value` 语句。

如果该异常没有在生成器内部被捕获，则它将通过 `throw()` 的调用向上传播，对 `next()` 的后续调用将导致 `done` 属性为 `true`。

生成器的 `return()` 方法可返回给定的值并终结这个生成器。

## 总结

- **基本语法**：语句用分号分隔，可以省略但建议保留；注释与 C++ 一致，不能嵌套块注释；块语句组合多条语句，`var` 不受块作用域限制。
- **数据类型和变量**：8 种类型（7 种原始类型加 Object）；`typeof null === "object"`；动态类型会在运行时自动转换，`+` 遇到字符串就拼接，其余算术运算符倾向转数字；比较优先用 `===`。
- **变量声明**：`var` 只有函数作用域并存在提升，`let`/`const` 是块级作用域并有暂时性死区；`const` 只禁止重新赋值，不禁止修改对象内容；严格模式把静默错误变成异常。
- **字符串**：底层是 UTF-16 码元序列，长度是码元数而不一定是字符数；字符串不可变，所有方法都返回新字符串；模板字面量解决多行与插值。
- **数组**：本质是“以索引为属性名”的对象，`length` 是最大索引加一且可写；遍历用 `for`、`for...of` 或 `forEach`，不要用 `for...in`；空槽与 `undefined` 在迭代方法中的行为不同。
- **对象**：属性名最终都会转成字符串或 Symbol；点号访问合法标识符，方括号访问动态键；`this` 在方法中指向调用对象；对象比较的是引用。
- **条件判断**：`false`、`undefined`、`null`、`0`、`NaN`、`""` 是假值，其余包括对象都为真；`switch` 忘记 `break` 会继续执行下一个 `case`。
- **循环**：`for`、`while`、`do...while` 决定循环的起止，`label` 配合 `break`/`continue` 控制多层嵌套；`for...in` 枚举键，`for...of` 迭代值。
- **Map 和 Set**：按插入顺序迭代，`Map` 的键可以是任意类型，`Set` 天然去重；`WeakMap`/`WeakSet` 持有弱引用、不可枚举；键值相等使用 SameValueZero。
- **iterable**：可迭代对象必须实现 `Symbol.iterator`，迭代器的 `next()` 返回 `{ value, done }`；生成器用 `function*` 与 `yield` 把状态维护交给引擎，并且可以表示无限序列。

## 参考

- [语法与类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Grammar_and_types)
- [JavaScript 数据结构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Data_structures)
- [相等比较和相同](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness)
- [严格模式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)
- [数字与字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Numbers_and_strings)
- [索引集合](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Indexed_collections)
- [使用对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_objects)
- [控制流与错误处理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [循环与迭代](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Loops_and_iteration)
- [带键的集合](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Keyed_collections)
- [迭代器和生成器](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Iterators_and_generators)
- [迭代协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols)
