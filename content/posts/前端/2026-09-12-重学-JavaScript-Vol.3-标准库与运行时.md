---
uuid: 726d3800-dc54-11f1-a70b-d3a1bc617592
title: 2026-09-12-重学 JavaScript Vol.3 - 标准库与运行时
mathjax: true
abbrlink: 40104
published: 2026-09-12 10:34:56
category: 前端
description: JavaScript 标准库与运行时：Date/RegExp/JSON/Math、错误处理、事件循环、Promise/async 与模块
cover: ''
tags:
  - 前端
  - JavaScript
---

## 标准对象

JavaScript 的标准库由一组内置对象组成。日常使用最多的是 `Date`、`RegExp`、`JSON` 和 `Math`。

### Date

MDN 目前把 `Date` 标记为历史遗留对象，建议新代码关注现代替代方案（Temporal）。不过现有代码和浏览器 API 仍大量使用 `Date`，理解它的行为仍然必要。

JavaScript 没有日期数据类型。但是，可以使用 `Date` 对象及其方法在应用程序里处理日期和时间。`Date` 对象有大量方法用以设置、获取和操作日期。它没有任何属性。

JavaScript 处理日期的方式和 Java 类似。这两种语言有着许多相同的日期方法，并且都将日期存储为自 1970 年 1 月 1 日午夜时分（UTC 时间）以来的毫秒数，而 Unix 时间戳则表示从同一时刻开始至今的秒数。1970 年 1 月 1 日午夜时分（UTC 时间）的这一时刻被称为“纪元”。

`Date` 对象范围从相对于纪元的 -100,000,000 天起到 100,000,000 天为止。

创建 `Date` 对象：

```js
const dateObjectName = new Date([parameters])
```

不使用 `new` 关键词调用 `Date` 会返回一个表示当前日期和时间的字符串。

`parameters` 可以是以下几种之一：

- 不传参数：创建当前日期和时间。例如，`today = new Date()`。
- 一个表示日期的字符串，可以用多种格式表达日期。具体格式因各引擎不同而各异，但始终支持以下格式：`YYYY-MM-DDTHH:mm:ss.sssZ`。若省略小时、分钟或秒的具体数值，则对应值会被设置为 0。
- 一组表示年、月、日的整数。例如，`xmas95 = new Date(1995, 11, 25)`。
- 一组表示年、月、日、时、分、秒的整数。

```js
const today = new Date()
const xmas95 = new Date('1995-12-25')
const alsoXmas95 = new Date(1995, 11, 25, 9, 30, 0)
```

`Date` 对象处理日期和时间的方法分为以下几大类：

- “set”方法，用于设置 `Date` 对象中的日期和时间值。
- “get”方法，用于获取 `Date` 对象中的日期和时间值。
- “to”方法，用于返回 `Date` 对象中的字符串值。
- `parse` 和 `UTC` 方法，用于解析 `Date` 字符串。

可以通过“get”和“set”方法以分别获取和设置秒、分钟、小时、月份第几天、星期几、月份和年份。其中 `getDay` 方法返回星期几，但没有对应的 `setDay` 方法，因为星期几是自动设置的。这些方法使用整数表示自身值，范围如下：

- 秒和分钟：0 到 59
- 小时：0 到 23
- 星期：0（星期日）到 6（星期六）
- 日期：1 到 31（月份第几天）
- 月份：0（一月）到 11（十二月）

```js
const xmas95 = new Date('1995-12-25')
xmas95.getMonth() // 11
xmas95.getFullYear() // 1995
```

`getTime` 和 `setTime` 方法在日期对比上非常有用。`getTime` 方法返回 `Date` 对象自纪元以来的毫秒数。例如，以下代码展示了今年的剩余天数：

```js
const today = new Date()
const endYear = new Date(1995, 11, 31, 23, 59, 59, 999)
endYear.setFullYear(today.getFullYear())
const msPerDay = 24 * 60 * 60 * 1000
let daysLeft = (endYear.getTime() - today.getTime()) / msPerDay
daysLeft = Math.round(daysLeft)
```

`parse` 方法适用于将日期字符串的值赋给现存的 `Date` 对象：

```js
const ipoDate = new Date()
ipoDate.setTime(Date.parse('Aug 9, 1995'))
```

以下示例中，`JSClock()` 函数返回以数字时钟形式表示的时间：

```js
function JSClock() {
  const time = new Date()
  const hour = time.getHours()
  const minute = time.getMinutes()
  const second = time.getSeconds()
  let temp = String(hour % 12)
  if (temp === '0') {
    temp = '12'
  }
  temp += (minute < 10 ? ':0' : ':') + minute
  temp += (second < 10 ? ':0' : ':') + second
  temp += hour >= 12 ? ' P.M.' : ' A.M.'
  return temp
}
```

常用方法可以分为：

- 获取：`getFullYear()`、`getMonth()`、`getDate()`、`getDay()`、`getHours()`、`getMinutes()`、`getSeconds()`、`getMilliseconds()`、`getTime()`、`getTimezoneOffset()`
- 设置：`setFullYear()`、`setMonth()`、`setDate()`、`setHours()`、`setMinutes()`、`setSeconds()`、`setMilliseconds()`、`setTime()`
- 转换：`toString()`、`toISOString()`、`toJSON()`、`toLocaleDateString()`、`toLocaleTimeString()`、`toUTCString()`
- 静态：`Date.now()`、`Date.parse()`、`Date.UTC()`

### RegExp

正则表达式是用于匹配字符串中字符组合的模式。在 JavaScript 中，正则表达式也是对象。这些模式被用于 `RegExp` 的 `exec` 和 `test` 方法，以及 `String` 的 `match`、`matchAll`、`replace`、`search` 和 `split` 方法。

#### 创建正则表达式

可以使用以下两种方法构建一个正则表达式。

使用一个正则表达式字面量，其由包含在斜杠之间的模式组成：

```js
const re = /ab+c/
```

脚本加载后，正则表达式字面量就会被编译。当正则表达式保持不变时，使用此方法可获得更好的性能。

或者调用 `RegExp` 对象的构造函数：

```js
const re = new RegExp('ab+c')
```

在脚本运行过程中，用构造函数创建的正则表达式会被编译。如果正则表达式将会改变，或者它将会从用户输入等来源中动态地产生，就需要使用构造函数来创建正则表达式。

#### 模式

简单模式是由想直接找到的字符构成。比如，`/abc/` 这个模式就能且仅能匹配 "abc" 字符按照顺序同时出现的情况。在 "Hi, do you know your abc's?" 和 "The latest airplane designs evolved from slabcraft." 中会匹配成功，匹配的子字符串是 "abc"；但在 "Grab crab" 中会匹配失败。

需要匹配一个不确定的字符串时，可以在模式中使用特殊字符。比如 `/ab*c/` 匹配一个单独的 "a" 后面跟了零个或者多个 "b"，同时后面跟着 "c" 的字符串。在字符串 "cbbabbbbcdebc" 中，这个模式匹配了子字符串 "abbbbc"。

常见的特殊字符：

| 字符        | 含义                                               |
| ----------- | -------------------------------------------------- |
| `\`         | 转义下一个字符，或表示预定义字符类                 |
| `^`         | 匹配输入的开始；多行模式下也匹配换行符后紧跟的位置 |
| `$`         | 匹配输入的结束；多行模式下也匹配换行符前的位置     |
| `*`         | 前一项出现零次或多次                               |
| `+`         | 前一项出现一次或多次                               |
| `?`         | 前一项出现零次或一次                               |
| `{n}`       | 前一项恰好出现 n 次                                |
| `{n,}`      | 前一项至少出现 n 次                                |
| `{n,m}`     | 前一项出现 n 到 m 次                               |
| `.`         | 匹配除换行符之外的任意单个字符                     |
| `\d` / `\D` | 数字 / 非数字                                      |
| `\w` / `\W` | 字母、数字或下划线 / 其补集                        |
| `\s` / `\S` | 空白字符 / 非空白字符                              |
| `[abc]`     | 字符集合，匹配其中任意一个字符                     |
| `[^abc]`    | 反向字符集合，匹配不在集合中的字符                 |
| `(x)`       | 捕获组，匹配并记住 x                               |
| `(?:x)`     | 非捕获组，匹配 x 但不记住                          |
| `x\|y`      | 匹配 x 或 y                                        |
| `\b` / `\B` | 词边界 / 非词边界                                  |

#### 转义

如果需要使用任何特殊字符的字面值（例如，搜索字符 `*`），必须通过在它前面放一个反斜杠来转义它。例如，要搜索 "a" 后跟 `*` 后跟 "b"，应该使用 `/a\*b/`——反斜杠“转义”字符 `*`，使其成为文字而非特殊符号。

类似地，如果正在编写正则表达式文字并且需要匹配斜杠（`/`），那么需要转义它（否则，斜杠是正则终止符）。要搜索字符串 "/example/" 后跟一个或多个字母字符，需要使用 `/\/example\/[a-z]+/i`。

要匹配文本符号反斜杠，需要转义反斜杠。例如，要匹配字符串 "C:\"，其中 "C" 可以是任何字母，需要使用 `/[A-Z]:\\/`。

如果将 `RegExp` 构造函数与字符串文字一起使用，请记住反斜杠是字符串文字中的转义，因此要在正则表达式中使用它，需要在字符串文字级别转义它。`/a\*b/` 和 `new RegExp("a\\*b")` 创建的表达式是相同的。

将用户输入转义为正则表达式中的一个字面字符串，可以通过简单的替换来实现：

```js
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // $& 表示整个被匹配的字符串
}
```

#### 分组与反向引用

正则表达式模式使用括号，将导致相应的子匹配被记住。例如，`/a(b)c/` 可以匹配字符串 "abc"，并且记得 "b"。访问这些括号中匹配的子串，使用数组元素 `[1]` 到 `[n]`。

```js
const re = /(\w+)\s(\w+)/
const str = 'John Smith'
const newstr = str.replace(re, '$2, $1')
console.log(newstr) // "Smith, John"
```

括号中的 `?:` 表示非捕获组，这种模式匹配的子字符串将不会被记住。例如，`(?:\d+)` 匹配一次或多次数字字符，但是不能记住匹配的字符。

具名捕获组可以通过 `(?<name>...)` 声明，匹配结果会挂在 `groups` 属性上：

```js
const re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
const result = re.exec('2026-11-09')
console.log(result.groups.year) // "2026"
```

#### 使用正则表达式

| 方法                | 描述                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| `RegExp.exec()`     | 在字符串中执行查找匹配，返回一个数组（未匹配到则返回 `null`）。                    |
| `RegExp.test()`     | 在字符串中测试是否匹配，返回 `true` 或 `false`。                                   |
| `String.match()`    | 在字符串中执行查找匹配，返回一个数组，在未匹配到时会返回 `null`。                  |
| `String.matchAll()` | 在字符串中执行查找所有匹配，返回一个迭代器。                                       |
| `String.search()`   | 在字符串中测试匹配，返回匹配到的位置索引，或者在失败时返回 `-1`。                  |
| `String.replace()`  | 在字符串中执行查找匹配，并且使用替换字符串替换掉匹配到的子字符串。                 |
| `String.split()`    | 使用正则表达式或者一个固定字符串分隔一个字符串，并将分隔后的子字符串存储到数组中。 |

当想要知道在一个字符串中的一个匹配是否被找到时，可以使用 `test` 或 `search` 方法；想得到更多的信息（但是比较慢）则可以使用 `exec` 或 `match` 方法。如果使用 `exec` 或 `match` 方法并且匹配成功了，那么这些方法将返回一个数组并且更新相关的正则表达式对象的属性。如果匹配失败，那么 `exec` 方法返回 `null`。

```js
const myRe = /d(b+)d/g
const myArray = myRe.exec('cdbbdbsbz')
// ["dbbd", "bb"]，index 为 1，input 为 "cdbbdbsbz"
```

如果不需要访问正则表达式的属性，也可以这样写：

```js
const myArray = /d(b+)d/g.exec('cdbbdbsbz')
```

通过字符串构建正则表达式：

```js
const myRe = new RegExp('d(b+)d', 'g')
const myArray = myRe.exec('cdbbdbsbz')
```

匹配成功后，返回的数组包含匹配到的字符串和所有被记住的子字符串，还带有 `index`（匹配到的以 0 开始的索引值）和 `input`（初始字符串）属性。正则表达式对象的 `lastIndex` 属性表示开始下一个匹配的起始索引值，这个属性只有在使用 `g` 参数时可用：

```js
const myRe = /d(b+)d/g
const myArray = myRe.exec('cdbbdbsbz')
console.log(myRe.lastIndex) // 5
```

如果使用对象字面量创建正则表达式但不分配给变量，那么每一次使用时都会创建一个新的正则表达式实例，之后将不能访问这个实例的属性：

```js
const myArray = /d(b+)d/g.exec('cdbbdbsbz')
console.log(/d(b+)d/g.lastIndex) // 0
```

#### 标志

正则表达式有六个可选参数（`flags`）允许全局和不分大小写搜索等。这些参数既可以单独使用也能以任意顺序一起使用，并且被包含在正则表达式实例中。

| 标志 | 描述                                                       |
| ---- | ---------------------------------------------------------- |
| `g`  | 全局搜索。                                                 |
| `i`  | 不区分大小写搜索。                                         |
| `m`  | 多行搜索。                                                 |
| `s`  | 允许 `.` 匹配换行符。                                      |
| `u`  | 使用 Unicode 码的模式进行匹配。                            |
| `y`  | 执行“粘性（sticky）”搜索，匹配从目标字符串的当前位置开始。 |

为了在正则表达式中包含标志，请使用以下语法：

```js
const re = /pattern/flags
```

或者：

```js
const re = new RegExp('pattern', 'flags')
```

标志是一个正则表达式的一部分，它们在接下来的时间将不能添加或删除。

```js
const re = /\w+\s/g
const str = 'fee fi fo fum'
const myArray = str.match(re)
console.log(myArray) // ["fee ", "fi ", "fo "]
```

使用 `.exec()` 方法时，与 `g` 标志关联的行为是不同的：`g` 标志与 `.exec()` 方法一起使用可以获得迭代进展。

```js
let xArray
while ((xArray = re.exec(str))) console.log(xArray)
// ["fee ", index: 0, input: "fee fi fo fum"]
// ["fi ", index: 4, input: "fee fi fo fum"]
// ["fo ", index: 7, input: "fee fi fo fum"]
```

`m` 标志用于指定多行输入字符串应该被视为多个行。如果使用 `m` 标志，`^` 和 `$` 匹配的开始或结束输入字符串中的每一行，而不是整个字符串的开始或结束。

### JSON

`JSON` 命名空间对象包含用于解析 JavaScript 对象表示法（JSON）和将值转换为 JSON 字符串的静态方法。

与大多数全局对象不同，`JSON` 不是一个构造函数。不能将它与 `new` 运算符一起使用，也不能将 `JSON` 对象作为函数调用。`JSON` 的所有属性和方法都是静态的（就像 `Math` 对象一样）。

#### JavaScript 与 JSON 的区别

JSON 是一种语法，用来序列化对象、数组、数值、字符串、布尔值和 `null`。它基于 JavaScript 语法，但与之不同：大部分 JavaScript 不是 JSON。例如：

- 对象和数组：属性名称必须是双引号括起来的字符串；禁止出现尾随逗号。
- 数值：禁止出现前导零。小数点后必须至少有一位数字。不支持 `NaN` 和 `Infinity`。
- 其他：只允许双引号字符串，不支持 `undefined` 或注释。

#### JSON.parse()

`JSON.parse()` 解析 JSON 字符串并返回对应的值，可以额外传入一个转换函数，用来将生成的值和其属性，在返回之前进行某些修改。

```js
const jsonText = '{"name":"Firefox","version":1}'
const obj = JSON.parse(jsonText)
console.log(obj.name) // "Firefox"
```

还原日期等特殊值时，可以在 reviver 中处理：

```js
const data = JSON.parse('{"date":"2026-11-09"}', (key, value) =>
  key === 'date' ? new Date(value) : value,
)
```

#### JSON.stringify()

`JSON.stringify()` 将一个 JavaScript 对象或值转换为 JSON 字符串。如果指定了一个 replacer 函数，则可以选择性地替换值；如果 replacer 是数组，则可选择性地仅包含数组指定的属性。

```js
JSON.stringify({ x: 5, y: 6 }) // '{"x":5,"y":6}'
JSON.stringify({ x: [10, undefined, function () {}, Symbol('')] })
// '{"x":[10,null,null,null]}'
```

转换规则：

- 转换值如果有 `toJSON()` 方法，该方法定义什么值将被序列化。
- 非数组对象的属性不能保证以特定的顺序出现在序列化后的字符串中。
- 布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值。
- `undefined`、任意的函数以及 symbol 值，在序列化过程中会被忽略（出现在非数组对象的属性值中时）或者被转换成 `null`（出现在数组中时）。函数、`undefined` 被单独转换时，会返回 `undefined`。
- 对包含循环引用的对象执行此方法，会抛出 `TypeError`。
- 所有以 symbol 为属性键的属性都会被完全忽略掉。
- `Date` 日期调用了 `toJSON()` 将其转换为了 string 字符串（同 `Date.toISOString()`），因此会被当做字符串处理。
- `NaN` 和 `Infinity` 格式的数值及 `null` 都会被当做 `null`。
- 其他类型的对象，包括 `Map`/`Set`/`WeakMap`/`WeakSet`，仅会序列化可枚举的属性。
- 尝试转换 `BigInt` 类型的值会抛出 `TypeError`。

第三个参数 `space` 控制缩进，用于美化输出：

```js
console.log(JSON.stringify({ x: 5 }, null, 2))
// {
//   "x": 5
// }
```

### Math

内置的 `Math` 对象提供了用于数学常量和函数的属性和方法。例如，`Math` 对象的 `PI` 属性值为 π（3.141…）：

```js
Math.PI
```

同理，标准数学函数也是 `Math` 的方法。这些包括三角函数、对数、指数和其他函数。例如：

```js
Math.sin(1.56)
```

需要注意的是 `Math` 的所有三角函数都以弧度制接收参数。常用方法包括：

- 绝对值与符号：`abs()`、`sign()`
- 三角函数：`sin()`、`cos()`、`tan()`、`asin()`、`acos()`、`atan()`、`atan2()`
- 指数与对数：`pow()`、`exp()`、`log()`、`log10()`、`log2()`、`sqrt()`、`cbrt()`
- 舍入：`floor()`、`ceil()`、`round()`、`trunc()`、`fround()`
- 最值与随机：`min()`、`max()`、`random()`
- 其他：`hypot()`

## 错误处理

### 错误类型

当运行时错误产生时，`Error` 对象会被抛出。`Error` 对象也可用于用户自定义的异常的基础对象。除了通用的 `Error` 构造函数外，JavaScript 还有其他类型的错误构造函数：

- `EvalError`：与 `eval()` 有关。
- `RangeError`：数值变量或参数超出其有效范围。
- `ReferenceError`：无效引用。
- `SyntaxError`：语法错误。
- `TypeError`：变量或参数不属于有效类型。
- `URIError`：给 `encodeURI()` 或 `decodeURI()` 传递的参数无效。
- `AggregateError`：包裹了由一个操作产生且需要报告的多个错误，例如 `Promise.any()` 产生的错误。
- `InternalError`：代表 JavaScript 引擎内部错误（非标准）。

### throw 语句

使用 `throw` 语句抛出异常：

```js
throw new Error('消息')
```

`throw` 的表达式可以是任意值，不一定非要是 `Error` 对象。但为了保留 `name`、`message`、`stack` 等信息，抛出自定义异常时应当使用 `Error` 构造函数或其子类。

### try...catch...finally

`try...catch` 语句用于标记一段要尝试的语句块，并指定抛出异常时的一个或多个响应。如果抛出了异常，`try...catch` 语句会捕获它。

`try...catch` 语句由 `try` 块（其包含一个或多个语句）和 `catch` 块（其包含在 `try` 块中抛出异常时要执行的语句）组成。

换句话说，希望 `try` 块执行成功——但如果它没有执行成功，那么希望将控制转移到 `catch` 块。如果 `try` 块中的语句（或者在 `try` 块中调用的函数里）抛出了异常，那么控制**立马**转移到 `catch` 块。如果 `try` 块没有抛出异常，`catch` 块就会被跳过。`finally` 块总会紧跟在 `try` 和 `catch` 块之后执行，但会在 `try...catch` 语句后面的语句之前执行。

下列示例使用了 `try...catch` 语句。示例调用的函数是根据传递的值从数组中获取一个月份名称。如果该值与月份数值（`1`-`12`）不相符，会抛出带有 `"无效的月份数值"` 值的异常，然后在 `catch` 块的语句中设 `monthName` 变量为 `"未知"`：

```js
function getMonthName(mo) {
  mo-- // 将月份调整为数组索引（这样的话，0 = 一月，11 = 十二月）
  const months = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ]
  if (months[mo]) {
    return months[mo]
  } else {
    throw new Error('无效的月份数值') // 在这使用 throw 关键字
  }
}

try {
  // 要尝试的语句
  monthName = getMonthName(myMonth) // 可能抛出异常的函数
} catch (e) {
  monthName = '未知'
  logMyErrors(e) // 将异常对象传递给错误处理器
}
```

#### catch 块

`catch` 块指定的标识符（上述语句中的 `exception`）会存储由 `throw` 语句指定的值。可以用这个标识符来获取抛出的异常的信息。在进入 `catch` 块时 JavaScript 会创建这个标识符。标识符只存在于 `catch` 块的存续期间里。当 `catch` 块执行完成时，标识符不再可用。

```js
try {
  throw '自定义异常' // 生成一个异常
} catch (err) {
  // 处理异常的表达式
  logMyErrors(err) // 将异常对象传递给错误处理器
}
```

在 `catch` 块中将错误输出到控制台时，建议使用 `console.error()` 而不是 `console.log()` 进行调试。它会将消息格式化为错误，并将其添加到页面生成的错误消息列表。

#### finally 块

`finally` 块包含的语句在 `try` 和 `catch` 块执行**之后**执行。此外，`finally` 块在 `try…catch…finally` 语句后面的代码**之前**执行。

也应该注意，`finally` 块**无论是否**抛出异常都会执行。如果抛出了一个异常，就算没有 `catch` 块处理抛出的异常，`finally` 块里的语句也会执行。可以用 `finally` 块来令脚本在异常发生时优雅地退出。例如，可能需要释放脚本绑定的资源：

```js
openMyFile()
try {
  writeMyFile(theData) // 这可能会抛出错误
} catch (e) {
  handleError(e) // 如果错误出现了，处理它
} finally {
  closeMyFile() // 总是关闭资源
}
```

如果 `finally` 块返回一个值，该值会是整个 `try…catch…finally` 流程的返回值，不管在 `try` 和 `catch` 块中的 `return` 语句返回了什么：

```js
function f() {
  try {
    console.log(0)
    throw 'bogus'
  } catch (e) {
    console.log(1)
    // 这个 return 语句会被挂起直到 finally 块结束
    return true
    console.log(2) // 不可达
  } finally {
    console.log(3)
    return false // 覆盖前面的“return”
    console.log(4) // 不可达
  }
  // 现在执行“return false”
  console.log(5) // 不可达
}
console.log(f()) // 0、1、3、false
```

用 `finally` 块覆盖返回值也适用于在 `catch` 块内抛出或重新抛出的异常：

```js
function f() {
  try {
    throw 'bogus'
  } catch (e) {
    console.log('捕获内部的“bogus”')
    // 这个 return 语句会被挂起直到 finally 块结束
    throw e
  } finally {
    return false // 覆盖前面的“throw”
  }
  // 现在执行“return false”
}

try {
  console.log(f())
} catch (e) {
  // 这永远不会抵达！
  console.log('捕获外部的“bogus”')
}

// 日志：
// 捕获内部的“bogus”
// false
```

#### 嵌套 try...catch

可以嵌套一个或多个 `try ... catch` 语句。如果一个内部 `try` 块**没有**对应的 `catch` 块，它**必须**有一个 `finally` 块，并且包围的 `try...catch` 语句的 `catch` 块会被检查是否能处理该异常。

### Error 对象

根据错误类型，也许可以用 `name` 和 `message` 属性获取更精炼的信息。`name` 属性提供了常规的 `Error` 类（如 `DOMException` 或 `Error`），而 `message` 通常提供的信息比将错误对象转换成字符串得到的信息更简明。

在抛出自定义异常时，为了充分利用那些属性（比如 `catch` 块不能分辨是自定义异常还是系统异常时），可以使用 `Error` 构造函数：

```js
function doSomethingErrorProne() {
  if (ourCodeMakesAMistake()) {
    throw new Error('消息')
  } else {
    doSomethingToGetAJavaScriptError()
  }
}

try {
  doSomethingErrorProne()
} catch (e) {
  console.error(e.name) // 'Error'
  console.error(e.message) // “消息”，或者一个 JavaScript 错误消息
}
```

`Error` 的实例属性包括：

- `message`：错误消息。对于用户创建的 `Error` 对象，这是构造函数的第一个参数提供的字符串。
- `name`：错误名称。这是由构造函数决定的。
- `cause`：表示导致当前错误被抛出的原因——通常是另一个错误。对于用户创建的 `Error` 对象，这是构造函数的第二个参数提供的值。
- `stack`：非标准的堆栈跟踪属性，主流引擎都实现了它。

### 自定义错误

可以通过继承 `Error` 创建自定义错误类型：

```js
class ValidationError extends Error {
  constructor(message, options) {
    super(message, options)
    this.name = 'ValidationError'
  }
}

try {
  throw new ValidationError('字段不合法')
} catch (e) {
  console.log(e.name) // 'ValidationError'
  console.log(e.message) // '字段不合法'
  console.log(e instanceof ValidationError) // true
}
```

可以通过判断异常的类型来特定处理某一类的异常，即判断 `constructor` 属性，当使用现代 JavaScript 引擎时，可使用 `instanceof` 关键字：

```js
try {
  foo.bar()
} catch (e) {
  if (e instanceof EvalError) {
    console.error(e.name + ': ' + e.message)
  } else if (e instanceof RangeError) {
    console.error(e.name + ': ' + e.message)
  }
  // ... 其他分支
  else {
    // 所有分支都不匹配时，保留原始错误
    throw e
  }
}
```

有时，对于代码块的错误需要根据其原因进行不同的处理，但错误的原因又较为相似（例如：错误的类型和消息均相同）。如果无法控制原有错误的抛出，一种方法是捕获错误然后抛出一个新的错误，并在新的错误中给出更加具体的错误消息。原始错误应该被传递到新的 `Error` 的构造函数的 `option` 参数（`cause` 属性）中，这确保了原始的错误和堆栈追踪信息在上层的 `try/catch` 块中可用：

```js
function doWork() {
  try {
    doFailSomeWay()
  } catch (err) {
    throw new Error('Failed in some way', { cause: err })
  }
  try {
    doFailAnotherWay()
  } catch (err) {
    throw new Error('Failed in another way', { cause: err })
  }
}

try {
  doWork()
} catch (err) {
  console.log(err.cause)
}
```

`AggregateError` 用于把多个错误打包成一个，`Promise.any()` 在全部 Promise 都被拒绝时就会抛出它。它有一个 `errors` 属性，包含所有被聚合的错误。

### 异步代码中的错误

同步代码中的错误可以用 `try...catch` 捕获。异步回调中抛出的错误不会传播到回调外部，必须在回调内部处理。Promise 的拒绝会沿着链传递到最近的 `catch()` 或 `then()` 的第二个参数；`async` 函数中 `await` 的拒绝则可以用普通的 `try...catch` 捕获。具体写法在异步一节展开。

## 异步

### 事件循环

JavaScript 是单线程的：单个代理是一个线程，这意味着解释器一次只能处理一条语句。当代码都是同步的时候，这没有问题，因为总是能取得进展。但如果代码需要执行异步操作，那么除非该操作完成，否则就无法取得进展。如果整个程序因此而停止，就会影响用户体验——JavaScript 作为 Web 脚本语言的特性要求它**永不阻塞**。因此，处理异步操作完成的代码被定义为回调。该回调定义了一个**任务**，一旦动作完成，该任务就会被放入一个**任务队列**，或者用 HTML 术语来说，一个事件循环。

每次，代理都会从队列中拉出一个作业并执行它。作业执行完毕后，可能会创建更多作业，这些作业会被添加到队列的末尾。也可以通过完成异步平台机制（如计时器、I/O 和事件）来添加作业。当栈为空时，作业被视为已完成；然后，下一个作业会从队列中拉出。作业可能不会以统一的优先级被拉出——例如，HTML 事件循环会将作业分成两类：**任务**和**微任务**。微任务具有更高的优先级，在任务队列被拉出之前，微任务队列会先被排空。如果任务队列为空，代理将等待更多任务的添加。

每个作业都会在处理其他作业之前被完全处理。这在推理程序时提供了一些很好的特性，包括无论函数何时运行，它都不会被抢占，并且会在任何其他代码运行之前完全运行（并且可以修改函数操作的数据）。例如：

```js
const promise = Promise.resolve()
let i = 0
promise.then(() => {
  i += 1
  console.log(i)
})
promise.then(() => {
  i += 1
  console.log(i)
})
```

在本例中，创建了一个已解决的 promise，这意味着附加到该 promise 上的任何回调都会被立即调度为作业。这两个回调似乎会导致条件竞争，但实际上，输出是完全可预测的：将依次输出 `1` 和 `2`。这是因为每个作业都会在下一个作业执行之前运行完成。

这种模式的一个缺点是，如果作业完成时间过长，Web 应用程序就无法处理点击或滚动等用户交互。浏览器通过“脚本运行时间过长”对话框来缓解这一问题。一个好的做法是缩短作业处理时间，并尽可能将一个作业分解为多个作业。

事件循环模型提供的另一个重要保证是 JavaScript 的执行永远不会阻塞。处理 I/O 通常是通过事件和回调来执行的，因此当应用程序在等待 IndexedDB 查询返回或 `fetch()` 请求返回时，它仍然可以处理用户输入等其他事情。异步操作完成后执行的代码总是以回调函数的形式提供（例如，promise 的 `then()` 处理程序、`setTimeout()` 中的回调函数或事件处理程序），它定义了操作完成后添加到作业队列中的作业。

Promise 回调被处理为**微任务**，而 `setTimeout()` 回调被处理为**任务**：

```js
const promise = new Promise((resolve, reject) => {
  console.log('Promise 执行函数')
  resolve()
}).then((result) => {
  console.log('Promise 回调（.then）')
})

setTimeout(() => {
  console.log('新一轮事件循环：Promise（已完成）', promise)
}, 0)

console.log('Promise（队列中）', promise)
```

上述代码的输出如下：

```plain
Promise 执行函数
Promise（队列中）Promise {<pending>}
Promise 回调（.then）
新一轮事件循环：Promise（已完成）Promise {<fulfilled>}
```

### Promise

`Promise` 是一个对象，它代表了一个异步操作的最终完成或者失败。本质上 Promise 是一个函数返回的对象，可以在它上面绑定回调函数，这样就不需要在一开始把回调函数作为参数传入这个函数了。

假设现在有一个名为 `createAudioFileAsync()` 的函数，它接收一些配置和两个回调函数，然后异步地生成音频文件。一个回调函数在文件成功创建时被调用，另一个则在出现异常时被调用：

```js
// 成功的回调函数
function successCallback(result) {
  console.log('音频文件创建成功：' + result)
}

// 失败的回调函数
function failureCallback(error) {
  console.log('音频文件创建失败：' + error)
}

createAudioFileAsync(audioSettings, successCallback, failureCallback)
```

如果重写 `createAudioFileAsync()` 为返回 Promise 的形式，可以把回调函数附加到它上面：

```js
createAudioFileAsync(audioSettings).then(successCallback, failureCallback)
```

#### 链式调用

连续执行两个或者多个异步操作是一个常见的需求，在上一个操作执行成功之后，开始下一个的操作，并带着上一步操作所返回的结果。在旧的回调风格中，这种操作会导致经典的回调地狱：

```js
doSomething(function (result) {
  doSomethingElse(
    result,
    function (newResult) {
      doThirdThing(
        newResult,
        function (finalResult) {
          console.log(`得到最终结果：${finalResult}`)
        },
        failureCallback,
      )
    },
    failureCallback,
  )
}, failureCallback)
```

有了 Promise，就可以通过一个 Promise 链来解决这个问题。这就是 Promise API 的优势，因为回调函数是附加到返回的 Promise 对象上的，而不是传入一个函数中。

`then()` 函数会返回一个和原来不同的**新的 Promise**：

```js
const promise = doSomething()
const promise2 = promise.then(successCallback, failureCallback)
```

第二个 promise（`promise2`）不仅表示 `doSomething()` 函数的完成，也代表了传入的 `successCallback` 或者 `failureCallback` 的完成，这两个函数也可以是返回 Promise 对象的异步函数。这样的话，在 `promise2` 上新增的排在该 promise 后面的回调函数会通过 `successCallback` 或 `failureCallback` 返回。

就像这样，可以创建一个更长的处理链，其中的每个 Promise 都代表了链中的一个异步过程的完成。此外，`then` 的参数是可选的，`catch(failureCallback)` 等同于 `then(null, failureCallback)`——所以如果错误处理代码对所有步骤都是一样的，可以把它附加到链的末尾：

```js
doSomething()
  .then(function (result) {
    return doSomethingElse(result)
  })
  .then(function (newResult) {
    return doThirdThing(newResult)
  })
  .then(function (finalResult) {
    console.log(`得到最终结果：${finalResult}`)
  })
  .catch(failureCallback)
```

使用箭头函数可以写得更短：

```js
doSomething()
  .then((result) => doSomethingElse(result))
  .then((newResult) => doThirdThing(newResult))
  .then((finalResult) => {
    console.log(`得到最终结果：${finalResult}`)
  })
  .catch(failureCallback)
```

`doSomethingElse` 和 `doThirdThing` 可以返回任何值——如果它们返回的是 Promise，那么会首先等待这个 Promise 的敲定，然后下一个回调函数会接收到它的兑现值，而不是 Promise 本身。在 `then` 回调中始终返回 Promise 是非常重要的，即使 Promise 总是兑现为 `undefined`。如果上一个处理器启动了一个 Promise 但并没有返回它，那么就没有办法再追踪它的敲定状态了，这个 Promise 就是“漂浮”的：

```js
doSomething()
  .then((url) => {
    // fetch(url) 前缺少 `return` 关键字。
    fetch(url)
  })
  .then((result) => {
    // result 是 undefined，因为上一个处理器没有返回任何东西。
    // 无法得知 fetch() 的返回值，也无法知道它是否成功。
  })
```

通过返回 `fetch` 调用的结果（一个 Promise），既可以追踪它的完成状态，也可以在它完成时接收到它的值：

```js
doSomething()
  .then((url) => {
    // 添加 `return` 关键字
    return fetch(url)
  })
  .then((result) => {
    // result 是一个 Response 对象
  })
```

如果有竞态条件的话，使 Promise 漂浮的情况会更糟——如果上一个处理器的 Promise 没有返回，那么下一个 `then` 处理器会被提前调用，而它读取的任何值都可能是不完整的。因此，一个经验法则是，每当操作遇到一个 Promise，就返回它，并把它的处理推迟到下一个 `then` 处理器中。

#### 错误处理

通常，一遇到异常抛出，浏览器就会顺着 Promise 链寻找下一个 `onRejected` 失败回调函数或者由 `.catch()` 指定的回调函数。这和以下同步代码的工作原理非常相似：

```js
try {
  let result = syncDoSomething()
  let newResult = syncDoSomethingElse(result)
  let finalResult = syncDoThirdThing(newResult)
  console.log(`得到最终结果：${finalResult}`)
} catch (error) {
  failureCallback(error)
}
```

这种异步代码的对称性在 `async`/`await` 语法中达到了极致：

```js
async function foo() {
  try {
    const result = await doSomething()
    const newResult = await doSomethingElse(result)
    const finalResult = await doThirdThing(newResult)
    console.log(`得到最终结果：${finalResult}`)
  } catch (error) {
    failureCallback(error)
  }
}
```

`finally()` 方法用于在 Promise 链结束后执行清理逻辑，无论成功还是失败：

```js
doSomething()
  .then((result) => doSomethingElse(result))
  .catch(failureCallback)
  .finally(() => {
    console.log('清理')
  })
```

当一个 Promise 拒绝事件未被任何处理器处理时，它会冒泡到调用栈的顶部。在 Web 上，当 Promise 被拒绝时，会派发 `unhandledrejection` 事件；当一个被拒绝的 promise 在触发了 `unhandledrejection` 事件之后才附加处理器时，会派发 `rejectionhandled` 事件。在 Node.js 中，对应的是 `unhandledRejection` 事件。

#### 组合

有四个组合工具可用来并发异步操作：`Promise.all()`、`Promise.allSettled()`、`Promise.any()` 和 `Promise.race()`。

可以同时启动所有操作，再等待它们全部完成：

```js
Promise.all([func1(), func2(), func3()]).then(([result1, result2, result3]) => {
  /* 使用 result1、result2 和 result3 */
})
```

如果数组中的某个 Promise 被拒绝，`Promise.all()` 就会立即拒绝返回的 Promise，并终止其他操作。这可能会导致一些意外的状态或行为。`Promise.allSettled()` 是另一个组合工具，它会等待所有操作完成后再处理返回的 Promise。

- `Promise.all()`：全部兑现时兑现为结果数组；任意一个拒绝就立即拒绝。
- `Promise.allSettled()`：等待全部敲定，返回 `{ status, value }` 或 `{ status, reason }` 数组。
- `Promise.any()`：第一个兑现时兑现；全部拒绝时抛出 `AggregateError`。
- `Promise.race()`：第一个敲定的 Promise 决定结果，无论兑现还是拒绝。

所有的这些方法都是并发运行 Promise 的——一系列 Promise 同时启动，而不是彼此等待。顺序执行也是可能的，这需要一些巧妙的 JavaScript 手段：

```js
;[func1, func2, func3]
  .reduce((p, f) => p.then(f), Promise.resolve())
  .then((result3) => {
    /* 使用 result3 */
  })
```

在这个例子中，使用 `reduce` 把一个异步函数数组变为一个 Promise 链。上面的代码等同于：

```js
Promise.resolve()
  .then(func1)
  .then(func2)
  .then(func3)
  .then((result3) => {
    /* 使用 result3 */
  })
```

顺序组合还可以使用 async/await 更简洁地完成：

```js
let result
for (const f of [func1, func2, func3]) {
  result = await f(result)
}
/* 使用最后的结果（即 result3）*/
```

然而，在顺序组合 Promise 前，请考虑是否真的有必要——因为它们会阻塞彼此，除非一个 Promise 的执行依赖于另一个 Promise 的结果，否则最好并发运行 Promise。

#### 在旧式回调 API 中创建 Promise

可以通过 Promise 的构造函数从零开始创建 `Promise`。这种方式（通过构造函数的方式）应当只在封装旧 API 的时候用到。

理想状态下，所有的异步函数应该会返回 Promise。但有一些 API 仍然使用旧方式来传入成功（或者失败）的回调。最典型的例子就是 `setTimeout()` 函数：

```js
setTimeout(() => saySomething('10 秒钟过去了'), 10 * 1000)
```

混用旧式回调和 Promise 可能会造成运行时序问题。如果 `saySomething` 函数失败了，或者包含了编程错误，那就没有办法捕获它了。这得怪 `setTimeout()`。幸运的是，可以将 `setTimeout()` 封装入 Promise 内。最好的做法是，将这些有问题的函数封装起来，留在底层，并且永远不要再直接调用它们：

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

wait(10 * 1000)
  .then(() => saySomething('10 秒钟'))
  .catch(failureCallback)
```

通常，Promise 的构造函数接收一个执行函数（executor），可以在这个执行函数里手动地解决（resolve）或拒绝（reject）一个 Promise。既然 `setTimeout()` 并不会真的执行失败，那么可以在这种情况下忽略拒绝的情况。

#### 时序保证

Promise 的回调被放入微任务队列，传入 `then()` 的函数永远不会被同步调用，即使 Promise 已经被解决了：

```js
Promise.resolve().then(() => console.log(2))
console.log(1) // 1, 2
```

传入 `then()` 的函数不会立即运行，而是被放入微任务队列中，这意味着它会在稍后运行（仅在创建该函数的函数退出后，且 JavaScript 执行堆栈为空时），也就是在控制权返回事件循环之前：

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

wait().then(() => console.log(4))
Promise.resolve()
  .then(() => console.log(2))
  .then(() => console.log(3))
console.log(1) // 1, 2, 3, 4
```

### async/await

`async function` 声明创建一个绑定到给定名称的新异步函数。函数体内允许使用 `await` 关键字，这使得可以更简洁地编写基于 promise 的异步代码，并且避免了显式地配置 promise 链的需要。

```js
async function name(param0) {
  statements
}
```

`async function` 声明创建一个 `AsyncFunction` 对象。每次调用异步函数时，都会返回一个新的 `Promise` 对象，该对象将会被解决为异步函数的返回值，或者被拒绝为异步函数中未捕获的异常。

异步函数可以包含零个或者多个 `await` 表达式。`await` 表达式通过暂停执行使返回 promise 的函数表现得像同步函数一样，直到返回的 promise 被兑现或拒绝。返回的 promise 的解决值会被当作该 `await` 表达式的返回值。使用 `async`/`await` 关键字就可以使用普通的 `try`/`catch` 代码块捕获异步代码中的错误。

`await` 关键字只在常规 JavaScript 代码中的异步函数内有效。如果在异步函数体之外使用它，则会抛出 `SyntaxError`。`await` 可以单独与 JavaScript 模块一起使用。

`async`/`await` 的目的在于简化使用基于 promise 的 API 时所需的语法。`async`/`await` 的行为就好像搭配使用了生成器和 promise。

异步函数总是返回一个 promise。如果一个异步函数的返回值看起来不是 promise，那么它将会被隐式地包装在一个 promise 中：

```js
async function foo() {
  return 1
}
```

类似于：

```js
function foo() {
  return Promise.resolve(1)
}
```

即使异步函数的返回值看起来像是被包装在了一个 `Promise.resolve` 中，它们也不是等价的。如果给定的值是一个 promise，异步函数会返回一个不同的**引用**，而 `Promise.resolve` 会返回相同的引用：

```js
const p = new Promise((res, rej) => {
  res(1)
})

async function asyncReturn() {
  return p
}

function basicReturn() {
  return Promise.resolve(p)
}

console.log(p === basicReturn()) // true
console.log(p === asyncReturn()) // false
```

异步函数的函数体可以被看作是由零个或者多个 await 表达式分割开来的。从顶层代码直到（并包括）第一个 await 表达式（如果有的话）都是同步运行的。因此，不包含 await 表达式的异步函数是同步运行的。然而，如果函数体内包含 await 表达式，则异步函数就一定会异步完成：

```js
async function foo() {
  await 1
}
```

等价于：

```js
function foo() {
  return Promise.resolve().then(() => undefined)
}
```

每个 await 表达式之后的代码可以被认为存在于 `.then` 回调中。通过这种方式，可以通过函数的每个可重入步骤来逐步构建 promise 链。而返回值构成了链中的最后一个环。

在接下来的示例中，依次 await 两个 promise，整个 `foo` 函数的执行将会被分为三个阶段：

1. `foo` 函数的第一行将会同步执行，其中 await 配置了待定的 promise。然后 `foo` 的进程将被暂停，并将控制权交还给调用 `foo` 的函数。
2. 一段时间后，当第一个 promise 被兑现或拒绝的时候，控制权将重新回到 `foo` 内。第一个 promise 的兑现结果（如果没有被拒绝的话）将作为 await 表达式的返回值。程序继续执行，并计算第二个 await 表达式。同样的，`foo` 的进程将被暂停，并交出控制权。
3. 一段时间后，当第二个 promise 被兑现或拒绝的时候，控制权将重新回到 `foo`。第二个 promise 的兑现结果将作为第二个 await 表达式的返回值。程序继续执行到返回表达式（如果有的话）。

```js
async function foo() {
  const result1 = await new Promise((resolve) => setTimeout(() => resolve('1')))
  const result2 = await new Promise((resolve) => setTimeout(() => resolve('2')))
}
```

#### 顺序与并发

多个独立的异步任务，顺序 await 会串行执行；先启动再统一 await 则并发执行：

```js
// 串行：总耗时约为两者之和
const user = await fetchUser()
const posts = await fetchPosts(user.id)

// 并发：总耗时约为两者中较慢的那个
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()])
```

`async`/`await` 的并发语义与普通 Promise 链相同。异步函数中的 `await` 不会停止整个程序，只会停止依赖其值的部分，因此在 `await` 挂起时，其他异步任务仍可运行。

### 异步迭代

`for await...of` 语句在异步可迭代对象上创建循环，每次迭代都会等待值就绪。它把 `await` 与 `for...of` 结合起来，适合按顺序处理异步产生的数据流：

```js
async function process(stream) {
  for await (const chunk of stream) {
    console.log(chunk)
  }
}
```

对象要实现异步迭代，需要提供 `[Symbol.asyncIterator]()` 方法，其 `next()` 返回一个 Promise，兑现为 `{ value, done }`。

## 模块

### 模块化的背景

JavaScript 程序本来很小——在早期，它们大多被用来执行独立的脚本任务，在 Web 页面需要的地方提供一定交互，所以一般不需要多大的脚本。过了几年，现在有了运行大量 JavaScript 脚本的复杂程序，还有一些被用在其他环境（例如 Node.js）。

复杂的项目需要一种将 JavaScript 程序拆分为可按需导入的单独模块的机制。Node.js 已经提供这个能力很长时间了，还有很多的 JavaScript 库和框架已经开始了模块的使用（例如，CommonJS 和基于 AMD 的其他模块系统，如 RequireJS、webpack 和 Babel）。

所有现代浏览器都原生支持模块特性，无需转译。这是一件好事——浏览器可以优化模块的加载，使其比使用库进行所有额外的客户端处理和额外的网络开销更高效。不过，这并不意味着像 webpack 这样的打包工具就过时了——打包工具仍然在将代码分割成合理大小的块方面做得很好，并且能够进行其他优化，如极简化、无用代码消除和摇树优化。

一个典型的模块化示例文件结构如下：

```plain
index.html
main.js
modules/
    canvas.js
    square.js
```

模块文件使用 `.js` 扩展名；在一些环境中也会看到 `.mjs`，它可以更清晰地指出哪些文件是模块。为了让模块在浏览器中正常工作，服务器需要正确处理 `Content-Type` 标头，其应该包含 JavaScript 的 MIME 类型 `text/javascript`。

### 导出

为了获得模块的功能，要做的第一件事就是把它们导出来。这可以使用 `export` 语句来完成。

最简单的方法是把 `export` 放到想要导出的项前面，比如：

```js
export const name = 'square'

export function draw(ctx, length, x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, length, length)

  return { length, x, y, color }
}
```

可以导出函数、`var`、`let`、`const` 和类。`export` 要放在最外层；比如不能在函数内使用 `export`。

更方便的导出模块的方法是，在模块文件末尾使用一个 `export` 语句，以花括号括起来并用逗号分隔的形式列出所有需导出的功能：

```js
export { name, draw, reportArea, reportPerimeter }
```

### 导入

从模块中导出一些功能后，需要将它们导入到脚本中才能使用。最简单的方法如下所示：

```js
import { name, draw, reportArea, reportPerimeter } from './modules/square.js'
```

可以使用 `import` 语句，然后用花括号括起来的用逗号分割的功能列表，然后是关键字 `from`，然后是**模块标识符**（module specifier）。

模块标识符提供一个 JavaScript 环境可以解析为模块文件路径的字符串。在浏览器中，它可以是一个相对于站点根目录的路径，也可以使用点（`.`）语法表示“当前位置”，然后紧跟想要找的文件的相对路径。相对路径更短，并且使 URL 可移植——如果将其移动站点目录中的其他位置，示例仍然有效。

例如：

```plain
/js-examples/module-examples/basic-modules/modules/square.js
```

变成了：

```plain
./modules/square.js
```

因为导入了这些功能到脚本文件，可以像定义在相同的文件中一样去使用它：

```js
const myCanvas = create('myCanvas', document.body, 480, 320)
const reportList = createReportList(myCanvas.id)

const square1 = draw(myCanvas.ctx, 50, 50, 100, 'blue')
reportArea(square1.length, reportList)
reportPerimeter(square1.length, reportList)
```

在某些模块系统中，模块的路径不是相对或绝对路径，并且没有文件扩展名，比如 `modules/square`。如果定义了导入映射，则可以在浏览器环境中使用这种语法。

### 默认导出

到目前为止，导出的功能都是由**具名导出**组成——每个项目（无论是函数、常量等）在导出时都由其名称引用，并且该名称也用于在导入时引用它。

还有一种导出类型叫做**默认导出**——这样可以很容易地使模块提供默认功能，并且还可以帮助 JavaScript 模块与现有的 CommonJS 和 AMD 模块系统进行互操作。

在基本模块 `square.js` 中，可以找到一个名为 `randomSquare()` 的函数，用于创建一个随机颜色、大小和位置的正方形。希望将其作为默认导出，因此在文件底部这样编写：

```js
export default randomSquare
```

注意，不要大括号。也可以把 `export default` 放到函数前面，定义它为一个匿名函数：

```js
export default function (ctx) {
  // ...
}
```

在 `main.js` 文件中，通过以下代码导入默认函数：

```js
import randomSquare from './modules/square.js'
```

同样，没有大括号，因为每个模块只允许有一个默认导出。上面的那一行相当于下面的缩写：

```js
import { default as randomSquare } from './modules/square.js'
```

### 重命名与命名空间

在 `import` 和 `export` 语句的大括号中，可以使用 `as` 关键字为功能指定新名称，从而更改在顶级模块中使用的标识名称：

```js
// module.js 中
export { function1 as newFunctionName, function2 as anotherNewFunctionName }

// main.js 中
import { newFunctionName, anotherNewFunctionName } from '/modules/module.js'
```

```js
// module.js 中
export { function1, function2 }

// main.js 中
import {
  function1 as newFunctionName,
  function2 as anotherNewFunctionName,
} from './modules/module.js'
```

当多个模块导出同名功能时，直接导入会产生冲突：

```js
import { name, draw } from './modules/square.js'
import { name, draw } from './modules/circle.js'
// SyntaxError: redeclaration of import name
```

这时可以重命名导入，使它们是唯一的：

```js
import { name as squareName, draw as drawSquare } from './modules/square.js'

import { name as circleName, draw as drawCircle } from './modules/circle.js'
```

另一种方式是使用命名空间导入，将每一个模块功能导入到一个模块功能对象中：

```js
import * as Square from './modules/square.js'
import * as Circle from './modules/circle.js'

const square1 = Square.draw(myCanvas.ctx, 50, 50, 100, 'blue')
Square.reportArea(square1.length, reportList)
```

### 合并模块

有时会想要将模块聚合在一起。可能有多个级别的依赖项，希望简化事物，将多个子模块组合到一个父模块中。这可以在父模块中用以下形式的导出语法：

```js
export * from 'x.js'
export { name } from 'x.js'
```

例如，有一个名为 `shapes.js` 的模块，它将 `circle.js`、`square.js` 和 `triangle.js` 中的所有功能聚合在一起：

```js
export { Square } from './shapes/square.js'
export { Triangle } from './shapes/triangle.js'
export { Circle } from './shapes/circle.js'
```

`shapes.js` 中引用的导出基本上通过文件重定向，并且实际上并不存在，因此无法在同一文件中编写任何有用的相关代码。在 `main.js` 中，可以通过一行导入所有三个模块：

```js
import { Square, Circle, Triangle } from './modules/shapes.js'
```

### 模块与经典脚本的区别

- 模块自动使用严格模式，因此模块内部的行为与标准脚本不同。
- 加载模块脚本时不需要使用 `defer` 属性，模块会自动延迟加载。
- 模块功能的导入范围仅限于被导入的脚本文件，无法在全局范围内访问。因此，这些功能只能在导入它们的脚本文件中使用，无法通过 JavaScript 控制台直接访问。
- 模块定义的变量是模块范围内的，除非明确附加到全局对象。另一方面，全局定义的变量在模块内是可用的。
- 本地测试需要注意：如果通过本地加载 HTML 文件（比如一个 `file://` 路径的文件），会遇到 CORS 错误，因为 JavaScript 模块安全性需要。需要通过一个服务器来测试。
- 模块顶层作用域中的 `this` 是 `undefined`，而不是全局对象。
- 导入声明是提升的，导入的值在模块代码中声明之前就可用，并且导入模块的副作用在模块代码的其余部分开始运行之前就已经产生。尽管如此，最好还是将所有导入放在代码的顶部，这样更容易分析依赖关系。

在 HTML 中，通过 `type="module"` 声明模块入口：

```html
<script type="module" src="main.js"></script>
```

模块不一定需要 `import`/`export` 语句——唯一需要的是入口点有 `type="module"`。模块脚本会自动按依赖顺序加载，并在文档解析完成后执行。

### 动态导入

动态模块加载允许仅在需要时动态加载模块，而不必预先加载所有模块。这有一些明显的性能优势。

这个功能允许将 `import()` 作为函数调用，将模块的路径作为参数传入。它返回一个 `Promise`，会兑现为一个可以访问其导出的模块对象：

```js
import('/modules/mymodule.js').then((module) => {
  // 使用模块做一些事情。
})
```

动态导入的另一个优点是它们始终可用，即使在经典脚本环境中也是如此。因此，如果 HTML 中有一个现有的 `<script>` 标签没有 `type="module"`，仍然可以通过动态导入重用作为模块分发的代码：

```html
<script>
  import('./modules/square.js').then((module) => {
    // 使用模块做一些事情。
  })
  // 其他操作全局范围的代码，还没有准备好重构为模块。
  var btn = document.querySelector('.square')
</script>
```

由于 promise 兑现会返回一个模块对象，因此模块的导出成为对象的属性，需要在构造函数之前追加模块名来访问，例如 `Module.Square(/* … */)`。

### 顶层 await

顶层 await 是模块中可用的一个特性。这意味着可以在模块顶层使用 `await` 关键字。它允许模块像大异步函数一样运行，这意味着代码可以在父模块中使用之前进行评估，但不会阻止兄弟模块的加载。

例如，在一个单独的 `colors.json` 文件中声明调色板：

```json
{
  "yellow": "#F4D03F",
  "green": "#52BE80",
  "blue": "#5499C7",
  "red": "#CD6155",
  "orange": "#F39C12"
}
```

然后创建一个名为 `getColors.js` 的模块，该模块使用 fetch 请求加载 `colors.json` 文件并将数据作为对象返回：

```js
// fetch 请求
const colors = fetch('../data/colors.json').then((response) => response.json())

export default await colors
```

注意这里的最后一行导出。在指定要导出的常量 `colors` 之前使用了 `await` 关键字。这意味着包含此模块的任何其他模块将在使用之前等待 `colors` 下载和解析完成。然而，它不会阻止其他模块的加载——兄弟模块会在 `colors` 被获取时继续加载。

### 循环导入

当两个模块互相导入时，就形成了循环导入。ES 模块使用**实时绑定**：导入的不是值的副本，而是指向导出变量的引用。只要在代码执行到使用该绑定时已经完成初始化，循环导入就可以正常工作；如果在初始化完成之前访问，则会得到暂时性死区的错误。循环依赖通常说明模块边界需要重新划分，应尽量避免。

### CommonJS 对比

Node.js 长期使用的模块系统是 CommonJS：

```js
// 导出
module.exports = { name, draw }
// 或
exports.name = name

// 导入
const { name, draw } = require('./square.js')
```

两种模块系统的主要区别：

| 维度       | ES 模块                            | CommonJS                       |
| ---------- | ---------------------------------- | ------------------------------ |
| 语法       | `import` / `export`                | `require()` / `module.exports` |
| 加载时机   | 静态分析，导入声明提升             | 运行时同步加载                 |
| 绑定       | 实时绑定，导出值变化会反映到导入方 | 导出时复制值的引用             |
| 顶层 await | 支持                               | 不支持                         |
| 浏览器     | 原生支持，需要 `type="module"`     | 需要打包工具转换               |

ES 模块是语言标准，CommonJS 是 Node.js 的约定。新代码通常优先使用 ES 模块；在 Node.js 中可以通过文件扩展名 `.mjs` 或在 `package.json` 中设置 `"type": "module"` 来启用。

## 总结

- **标准对象**：`Date` 以毫秒数存储自纪元以来的时间，月份从 0 开始；`RegExp` 用字面量或构造函数创建，`exec`/`test` 与 `String` 的 `match`/`replace`/`split` 配合；`JSON` 只支持双引号、无尾随逗号、无 `undefined`，`stringify` 会忽略函数和 symbol、循环引用抛 `TypeError`；`Math` 的三角函数使用弧度。
- **错误处理**：`throw` 抛出 `Error` 或任意值；`try...catch...finally` 中 `finally` 总会执行，且其 `return` 会覆盖之前的返回值；用 `instanceof` 分支处理特定错误，未知错误重新抛出；`cause` 保留原始错误链。
- **异步**：事件循环分任务与微任务，微任务先清空；Promise 的 `then` 总是异步执行，返回新 Promise，链中忘记 `return` 会产生“漂浮”的 Promise；`all`/`allSettled`/`any`/`race` 处理并发；`async`/`await` 用同步写法表达 Promise 链，`await` 只暂停当前函数。
- **模块**：`export`/`import` 是静态声明并提升；默认导出每个模块只有一个；`import * as` 提供命名空间；模块自动严格模式、自动延迟加载、有独立作用域；`import()` 动态加载返回 Promise；顶层 `await` 让模块在求值时等待异步依赖。

## 参考

- [表达日期与时间](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Representing_dates_times)
- [正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions)
- [JSON](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- [Error](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [使用 Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
- [async function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [JavaScript 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [执行模型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Execution_model)

