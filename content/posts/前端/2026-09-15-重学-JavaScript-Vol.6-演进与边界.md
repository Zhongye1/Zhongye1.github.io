---
uuid: ea4f14c0-dc58-11f1-b6cd-45d1ef570bf2
title: 2026-09-15-重学 JavaScript Vol.6 - 演进与边界
mathjax: true
abbrlink: 45679
published: 2026-09-15 10:34:56
category: 前端
description: JavaScript 演进与边界：ES6–ES13 版本地图、TC39 提案流程、语言中的奇怪设计、Intl 与元编程应用
cover: ''
tags:
  - 前端
  - JavaScript
---

## ES6–ES13 版本地图

ECMAScript 从 2015 年开始按年发布，ES6 对应 ES2015，ES13 对应 ES2022。版本号不再按“大版本”跳跃，而是每年一个快照。下面按版本列出主要新增内容，并标注在本系列中的位置。

| 版本   | 别名 | 主要新增                                                                                                                                                                   | 本系列位置                 |
| ------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| ES2015 | ES6  | `let`/`const`、箭头函数、`class`、模板字面量、解构、默认/剩余/展开参数、`for...of`、`Map`/`Set`、`Promise`、模块、`Symbol`、生成器、`Proxy`/`Reflect`、二进制/八进制字面量 | Vol.1–Vol.4                |
| ES2016 | ES7  | 指数运算符 `**`、`Array.prototype.includes()`                                                                                                                              | Vol.1、Vol.2               |
| ES2017 | ES8  | `async`/`await`、`Object.values()`/`entries()`、`padStart()`/`padEnd()`、函数参数尾逗号、`SharedArrayBuffer`/`Atomics`                                                     | Vol.2、Vol.5               |
| ES2018 | ES9  | 异步迭代 `for await...of`、对象剩余/展开、`Promise.finally()`、正则命名捕获组/后行断言/`s` 标志/Unicode 属性转义                                                           | Vol.2、Vol.3、Vol.5        |
| ES2019 | ES10 | `Array.prototype.flat()`/`flatMap()`、`Object.fromEntries()`、`trimStart()`/`trimEnd()`、可选 `catch` 绑定、`Symbol.description`、JSON 超集                                | Vol.2、Vol.3               |
| ES2020 | ES11 | `BigInt`、动态 `import()`、空值合并 `??`、可选链 `?.`、`Promise.allSettled()`、`globalThis`、`import.meta`                                                                 | Vol.1、Vol.3、Vol.5        |
| ES2021 | ES12 | `String.prototype.replaceAll()`、`Promise.any()`、`WeakRef`、`FinalizationRegistry`、逻辑赋值运算符、数值分隔符                                                            | Vol.1、Vol.2、Vol.5        |
| ES2022 | ES13 | 顶层 `await`、类字段/私有方法/静态块、`Array.prototype.at()`、`Object.hasOwn()`、正则 `d` 标志、`Error` 的 `cause`                                                         | Vol.1、Vol.2、Vol.4、Vol.5 |

使用这张表时需要注意两点：

- 版本号描述的是“规范在当年收录了什么”，不是“浏览器在某年才支持什么”。实际可用性要看目标运行时的兼容性。
- 新语法并不都需要单独记忆。`let`/`const`、箭头函数、`class`、`Promise`、模块这些已经在主线展开；这张表只负责建立“哪一年、哪一批特性”的索引。

## TC39 提案流程

ECMAScript 由 TC39 委员会维护，提案从想法到进入规范通常经过五个阶段：

- **Stage 0（Strawperson）**：非正式想法，尚未进入委员会议程。
- **Stage 1（Proposal）**：问题、动机、示例和初步方案，指定一名负责人。
- **Stage 2（Draft）**：正式草案，描述语法和语义，开始编写规范文本。
- **Stage 3（Candidate）**：规范文本完成，等待实现反馈和用户测试；浏览器可能开始实现。
- **Stage 4（Finished）**：至少两个独立实现通过测试，提案被接受，进入下一版规范。

可以在 TC39 的 proposals 仓库查看每个提案的阶段和负责人。Stage 3 的特性可能在浏览器中已经可用，但不保证最终语法不变；生产代码使用前应确认目标环境和构建工具的兼容性。

## 语言中的奇怪设计

JavaScript 有一些反直觉的行为，它们大多来自历史包袱、类型转换规则或 IEEE 754：

**`typeof null === "object"`**：`null` 是原始值，但 `typeof` 返回 `"object"`，这是早期实现的 bug，因为兼容性保留至今。判断 `null` 应使用 `value === null`。

**`NaN !== NaN`**：`NaN` 是唯一不等于自身的值。判断 `NaN` 使用 `Number.isNaN()`，而不是 `=== NaN`。

**`0.1 + 0.2 !== 0.3`**：浮点数采用 IEEE 754 双精度表示，`0.1` 和 `0.2` 不能精确表示，相加得到 `0.30000000000000004`。比较浮点数应使用误差范围：

```js
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON // true
```

**宽松相等的类型转换**：

```js
'' == 0 // true
'0' == false // true
null == undefined // true
null === undefined // false
[] == false // true
[1] == 1 // true
```

这些结果来自 `==` 的隐式转换规则。新代码应优先使用 `===`，只在明确需要 `null`/`undefined` 同时判断时使用 `value == null`。

**`+` 的字符串拼接**：`+` 只要有一侧是字符串就做拼接，其他算术运算符则倾向转数字：

```js
'37' + 7 // "377"
'37' - 7 // 30
```

**自动分号插入（ASI）**：换行可能改变语义，最典型的是 `return` 后换行：

```js
function f() {
  return
  {
    value: 1
  }
}
// 返回 undefined，而不是对象
```

**`-0` 与 `+0`**：`+0 === -0` 为 `true`，但 `Object.is(+0, -0)` 为 `false`，`1 / -0` 为 `-Infinity`。

**稀疏数组**：`[1, , 3]` 中间是空槽，不是 `undefined`；`map()`、`forEach()` 会跳过空槽，`for...of` 和展开语法则把空槽当作 `undefined`。

**`sort()` 默认按字符串排序**：`[10, 2, 1].sort()` 得到 `[1, 10, 2]`，数字排序必须传比较函数。

**`arguments` 不是数组**：它有索引和 `length`，但没有 `map()`、`filter()` 等方法；可以使用 `Array.from(arguments)` 转换，或直接使用剩余参数。

## Intl

`Intl` 是 ECMAScript 国际化 API 的命名空间，提供语言敏感的字符串比较、数字格式化和日期时间格式化。构造函数的第一个参数是 `locales`（BCP 47 语言标记或数组），第二个参数是 `options`。

```js
const number = 1234567.89

new Intl.NumberFormat('zh-CN').format(number)
// "1,234,567.89"

new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
}).format(number)
// "1.234.567,89 €"

new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'full',
  timeStyle: 'short',
}).format(new Date())
// "2026年11月10日星期二 00:00"
```

常用构造函数：

- `Intl.Collator`：语言敏感的字符串比较，适合排序。
- `Intl.NumberFormat`：数字、货币、百分比、单位格式化。
- `Intl.DateTimeFormat`：日期和时间格式化。
- `Intl.ListFormat`：列表连接词（如“A、B 和 C”）。
- `Intl.RelativeTimeFormat`：相对时间（如“3 天前”）。
- `Intl.PluralRules`：复数规则。
- `Intl.Segmenter`：按语言规则切分文本（词、句、字素）。

```js
new Intl.Collator('de').compare('ä', 'z') // -1
new Intl.ListFormat('zh-CN', { type: 'conjunction' }).format(['A', 'B', 'C'])
// "A、B和C"
new Intl.RelativeTimeFormat('zh-CN').format(-3, 'day')
// "3天前"
```

`String.prototype.localeCompare()`、`Number.prototype.toLocaleString()` 和 `Date.prototype.toLocaleString()` 是 `Intl` 的便捷入口。国际化格式化依赖运行时的 ICU 数据，不同环境的结果可能略有差异。

## 元编程应用

元编程指“让代码操作代码本身”。JavaScript 提供三类能力：

**符号钩子**：`Symbol.iterator` 定义迭代行为，`Symbol.asyncIterator` 定义异步迭代，`Symbol.toPrimitive` 定义类型转换，`Symbol.toStringTag` 定义 `Object.prototype.toString()` 的输出：

```js
const range = {
  from: 1,
  to: 3,
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) yield i
  },
}

;[...range] // [1, 2, 3]
```

**Proxy 与 Reflect**：拦截对象操作，适合做校验、日志、响应式和虚拟对象。前面的“属性、描述符与元编程”一节已经展开。

**属性描述符**：通过 `Object.defineProperty()` 改变属性的可写、可枚举、可配置行为，或定义 getter/setter。框架常用它实现只读属性、懒加载属性和依赖收集。

```js
const obj = {}
let _value = 1

Object.defineProperty(obj, 'value', {
  get() {
    return _value
  },
  set(next) {
    _value = next
  },
  enumerable: true,
  configurable: false,
})
```

元编程的代价是可读性和可调试性下降。使用时应把拦截逻辑集中在少数边界（如框架、状态库、SDK），不要让业务代码充满隐式行为。

## 总结

- **版本地图**：ES6 对应 ES2015，ES13 对应 ES2022；每个版本的主要语法和 API 可以按表定位。
- **TC39**：提案从 Stage 0 到 Stage 4，Stage 4 才会进入下一版规范。
- **奇怪设计**：`typeof null`、`NaN !== NaN`、浮点误差、`==` 隐式转换、ASI、`-0` 和稀疏数组都来自历史或规范细节。
- **Intl**：语言敏感的排序、数字、日期、列表和相对时间格式化。
- **元编程**：`Symbol` 钩子、`Proxy`/`Reflect` 和属性描述符让代码可以操作对象行为。

## 参考

- [表达式与运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_operators)
- [解构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
- [Object.freeze()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
- [类型化数组](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Typed_arrays)
- [内存管理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Memory_management)
- [元编程](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Meta_programming)
- [属性的可枚举性和所有权](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties)
- [Intl](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [ECMAScript 提案](https://github.com/tc39/proposals)
