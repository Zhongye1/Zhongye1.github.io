---
title: 2025-11-04-JavaScript 常用方法速查
mathjax: true
abbrlink: 36778
published: 2025-11-04 15:29:35
category: 前端
tags:
    - JavaScript
    - 速查
    - 前端
---


这是旧的一版，归档于 2025-11-04

### JavaScript 基本语法速查表

| 类别                 | 核心规则 / 语法                                    | 示例代码                                         | 关键说明 / 注意事项                                                          |
| -------------------- | -------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------- |
| **语句**             | 以分号 ; 结束；可多语句一行；空语句合法            | var a=1; var b=2; ;;;                            | 建议总是显式加分号，避免 ASI（自动分号插入）导致的意外行为                   |
| **表达式**           | 计算并返回值的式子，可作为语句                     | 1 + 3; var x = 1 + 2;                            | 表达式有返回值，语句通常无返回值                                             |
| **变量声明**         | var 声明；可分离声明与赋值                         | var a; a = 1;                                    | 未声明直接使用 → ReferenceError；无 var 赋值 → 创建全局变量（不推荐）        |
| **变量提升**         | var 声明提升到作用域顶部，赋值不提升               | console.log(a); var a=1; → undefined             | 相当于：var a; console.log(a); a=1;                                          |
| **重复声明**         | var 允许重复声明，后者覆盖                         | var x=1; var x=2; → x=2                          | 第二次声明无效，但带赋值则覆盖                                               |
| **标识符**           | 字母/$/\_ 开头，后续可加数字；区分大小写；中文合法 | var 临时变量 = 1; var π = 3.14;                  | 不可用保留字：break、function、let、this 等                                  |
| **注释**             | 单行 //；多行 //；历史兼容 <!-- -->                | // 单行 /_ 多行 _/                               | --> 仅行首生效，否则为运算符（如 n --> 0 实际为 n-- > 0）                    |
| **块级作用域**       | var 不支持块级作用域，变量泄漏至函数/全局          | { var a=1; } console.log(a); → 1                 | 现代推荐使用 let/const（本页未详述）                                         |
| **if 语句**          | if (条件) 语句; 或带 {}                            | if (x === 3) x++;                                | 条件强制转为布尔；避免 if (x = y)（赋值而非比较）；推荐常量在前 if (3 === x) |
| **if...else**        | 链式 else if；else 与最近 if 配对                  | if (n>0) … else if (n<0) … else …                | 悬垂 else 问题：无大括号时易出错                                             |
| **switch**           | switch (expr) { case 值: … break; default: … }     | case 1: … break;                                 | 严格相等 === 比较；无 break 则穿透；case 可为表达式                          |
| **三元运算符**       | 条件 ? expr1 : expr2                               | var s = n % 2 === 0 ? '偶' : '奇';               | 简洁替代简单 if…else；可嵌套但建议不超过两层                                 |
| **while 循环**       | while (条件) 语句;                                 | while (i < 10) i++;                              | 条件为假时立即退出；可写 while(true) 无限循环（需内部 break）                |
| **for 循环**         | for (init; cond; update) 语句;                     | for (var i=0; i<5; i++) …                        | 可省略任意部分：for(;;) → 无限循环；等价于 while + 递增                      |
| **do...while**       | 先执行一次，再判断                                 | do { … } while (cond);                           | 至少执行一次；注意 while 后必须加分号                                        |
| **break / continue** | break 跳出循环/块；continue 跳过本轮               | `if (i===5) break; if (i%2===0) continue;`       | 只影响最内层循环；标签可实现跳出多层                                         |
| **标签 (Label)**     | label: 语句；配合 break/continue label             | outer: for(…) { inner: for(…) { break outer; } } | 可跳出/继续指定层循环或代码块；常用于嵌套循环                                |

### JavaScript 常用方法速查

### 数组

| **方法**                               | **说明**                     | **示例**                                       | **返回值/副作用**        |
| -------------------------------------- | ---------------------------- | ---------------------------------------------- | ------------------------ |
| `push(...items)`                       | 末尾添加元素                 | `arr.push(4)` → 修改原数组                     | 返回新数组长度           |
| `pop()`                                | 删除末尾元素                 | `arr.pop()` → 修改原数组                       | 返回被删除元素           |
| `unshift(...items)`                    | 开头添加元素                 | `arr.unshift(0)` → 修改原数组                  | 返回新数组长度           |
| `shift()`                              | 删除开头元素                 | `arr.shift()` → 修改原数组                     | 返回被删除元素           |
| `slice(start, end)`                    | 截取数组片段（不修改原数组） | `arr.slice(1, 3)`                              | 返回新数组               |
| `splice(start, deleteCount, ...items)` | 删除/替换元素                | `arr.splice(1, 2, 'a')` → 修改原数组           | 返回被删除元素组成的数组 |
| `map(callback)`                        | 遍历并返回新数组             | `[1,2,3].map(x => x*2)` → `[2,4,6]`            | 新数组                   |
| `filter(callback)`                     | 过滤符合条件的元素           | `[1,2,3].filter(x => x>1)` → `[2,3]`           | 新数组                   |
| `reduce(callback, initialValue)`       | 累计计算（如求和、统计）     | `[1,2,3].reduce((sum, x) => sum + x, 0)` → `6` | 最终累计值               |
| `find(callback)`                       | 查找第一个符合条件的元素     | `[1,2,3].find(x => x>1)` → `2`                 | 元素或  `undefined`      |
| `findIndex(callback)`                  | 查找第一个符合条件的索引     | `[1,2,3].findIndex(x => x>1)` → `1`            | 索引或  `-1`             |
| `includes(value)`                      | 判断是否包含某元素（ES6）    | `[1,2,3].includes(2)` → `true`                 | 布尔值                   |
| `flat(depth)`                          | 扁平化嵌套数组（ES2019）     | `[1, [2]].flat()` → `[1, 2]`                   | 新数组                   |

### 字符串

| **方法**                         | **说明**                            | **示例**                                 | **返回值** |
| -------------------------------- | ----------------------------------- | ---------------------------------------- | ---------- |
| `split(separator)`               | 按分隔符拆分为数组                  | `"a,b,c".split(",")` → `["a", "b", "c"]` | 数组       |
| `substring(start, end)`          | 截取子字符串（不包含  `end`  索引） | `"Hello".substring(1, 3)` → `"el"`       | 新字符串   |
| `slice(start, end)`              | 截取子字符串（支持负数索引）        | `"Hello".slice(-3)` → `"llo"`            | 新字符串   |
| `replace(searchValue, newValue)` | 替换匹配内容（支持正则表达式）      | `"abc".replace("a", "A")` → `"Abc"`      | 新字符串   |
| `toUpperCase()`                  | 转为大写                            | `"hello".toUpperCase()` → `"HELLO"`      | 新字符串   |
| `toLowerCase()`                  | 转为小写                            | `"HELLO".toLowerCase()` → `"hello"`      | 新字符串   |
| `trim()`                         | 去除首尾空格（ES5）                 | `" hello ".trim()` → `"hello"`           | 新字符串   |
| `startsWith(str)`                | 判断是否以某字符串开头（ES6）       | `"hello".startsWith("he")` → `true`      | 布尔值     |
| `endsWith(str)`                  | 判断是否以某字符串结尾（ES6）       | `"hello".endsWith("lo")` → `true`        | 布尔值     |
| `padStart(length, padStr)`       | 头部填充字符串（ES2017）            | `"5".padStart(3, "0")` → `"005"`         | 新字符串   |

### 对象方法

| 方法                               | 描述                                                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Object.assign()                    | 方法用于将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。                                      |
| Object.create()                    | 方法创建一个新对象，使用现有的对象来提供新创建的对象的**proto**。                                                     |
| Object.defineProperties()          | 方法直接在一个对象上定义新的属性或修改现有属性，并返回该对象。                                                        |
| Object.defineProperty()            | 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。                                      |
| Object.entries()                   | 方法返回一个给定对象自身可枚举属性的键值对数组，其排列与使用 for…in 循环遍历该对象时返回的顺序一致。                  |
| Object.freeze()                    | 方法可以冻结一个对象。                                                                                                |
| Object.fromEntries()               | 方法把键值对列表转换为一个对象。                                                                                      |
| Object.getOwnPropertyDescriptor()  | 方法返回指定对象上一个自有属性对应的属性描述符。                                                                      |
| Object.getOwnPropertyDescriptors() | 方法用来获取一个对象的所有自身属性的描述符。                                                                          |
| Object.getOwnPropertyNames()       | 方法返回一个由指定对象的所有自身属性的属性名（包括不可枚举属性但不包括 Symbol 值作为名称的属性）组成的数组。          |
| Object.getOwnPropertySymbols()     | 方法返回一个给定对象自身的所有 Symbol 属性的数组。                                                                    |
| Object.getPrototypeOf()            | 方法返回指定对象的原型（内部[[Prototype]]属性的值）。                                                                 |
| Object.is()                        | 方法判断两个值是否为同一个值。                                                                                        |
| Object.isExtensible()              | 方法判断一个对象是否是可扩展的（是否可以在它上面添加新的属性）。                                                      |
| Object.isFrozen()                  | 方法判断一个对象是否被冻结。                                                                                          |
| Object.preventExtensions()         | 方法让一个对象变的不可扩展，也就是永远不能再添加新的属性。                                                            |
| Object.isSealed()                  | 方法判断一个对象是否被密封。                                                                                          |
| Object.keys()                      | 方法会返回一个由一个给定对象的自身可枚举属性组成的数组，数组中属性名的排列顺序和正常循环遍历该对象时返回的顺序一致 。 |
| Object.setPrototypeOf()            | 方法设置一个指定的对象的原型到另一个对象。                                                                            |
| Object.values()                    | 方法返回一个给定对象自身的所有可枚举属性值的数组。                                                                    |
| Object.seal()                      | 方法封闭一个对象，阻止添加新属性并将所有现有属性标记为不可配置。                                                      |

### Number 方法

Number 对象本身有一些静态属性和方法，而 Number 实例的方法是通过 Number.prototype 定义的，但通常我们使用数字字面量时可以直接调用这些方法（因为 JavaScript 会自动装箱）

| 名称           | 描述                                                 |
| -------------- | ---------------------------------------------------- |
| constructor    | 返回对创建此对象的 Number 函数的引用。               |
| isFinite()     | 检查值是否是有限数。                                 |
| isInteger()    | 检查值是否为整数。                                   |
| isNaN()        | 检查值是否为 Number.NaN。                            |
| parseFloat()   | 检查值是否为整数。                                   |
| parseInt()     | 检查值是否为整数。                                   |
| prototype      | 允许您向对象添加属性和方法。                         |
| toFixed(x)     | 把数字转换为字符串，结果的小数点后有指定位数的数字。 |
| toPrecision(x) | 把数字格式化为指定的长度。                           |
| toString()     | 把数字转换为字符串。                                 |
| valueOf()​     | 返回数字的原始值（基本数字值）。                     |

### Math 方法

Math 对象是一个静态对象，它包含了许多数学常数和函数。

| 方法名                              | 描述                                         |
| ----------------------------------- | -------------------------------------------- |
| Math.abs(x)                         | 返回一个数的绝对值。                         |
| Math.ceil(x)                        | 返回大于或等于一个数的最小整数（向上取整）。 |
| Math.floor(x)                       | 返回小于或等于一个数的最大整数（向下取整）。 |
| Math.round(x)                       | 返回一个数四舍五入后的整数。                 |
| Math.max([value1[, value2[, ...]]]) | 返回一组数中的最大值。                       |
| Math.min([value1[, value2[, ...]]]) | 返回一组数中的最小值。                       |
| Math.pow(x, y)                      | 返回 x 的 y 次幂。                           |
| Math.sqrt(x)                        | 返回一个数的平方根。                         |
| Math.random()                       | 返回一个 0 到 1 之间的伪随机数。             |
| Math.sin(x)                         | 返回一个数的正弦值。                         |
| Math.cos(x)                         | 返回一个数的余弦值。                         |
| Math.tan(x)                         | 返回一个数的正切值。                         |
| Math.log(x)                         | 返回一个数的自然对数。                       |
| Math.exp(x)                         | 返回 e 的 x 次幂。                           |

### Date 对象方法

Date 对象用于处理日期和时间

##### 静态方法

| 方法名                                                                  | 描述                                                                                    |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Date.now()                                                              | 返回自 1970 年 1 月 1 日 00:00:00 UTC 到当前时间的毫秒数。                              |
| Date.parse(dateString)                                                  | 解析一个表示日期的字符串，并返回从 1970-1-1 00:00:00 UTC 所经过的毫秒数。               |
| Date.UTC(year, month[, day[, hour[, minute[, second[, millisecond]]]]]) | 接受和构造函数最长形式的参数相同的参数，并返回从 1970-1-1 00:00:00 UTC 所经过的毫秒数。 |

##### 实例方法

| 方法名                             | 描述                                                              |
| ---------------------------------- | ----------------------------------------------------------------- |
| getFullYear()                      | 根据本地时间返回指定日期对象的年份。                              |
| getMonth()                         | 根据本地时间返回指定日期对象的月份（0-11）。                      |
| getDate()                          | 根据本地时间返回指定日期对象的日期（1-31）。                      |
| getDay()                           | 根据本地时间返回指定日期对象的星期（0-6）。                       |
| getHours()                         | 根据本地时间返回指定日期对象的小时（0-23）。                      |
| getMinutes()                       | 根据本地时间返回指定日期对象的分钟（0-59）。                      |
| getSeconds()                       | 根据本地时间返回指定日期对象的秒数（0-59）。                      |
| getMilliseconds()                  | 根据本地时间返回指定日期对象的毫秒数。                            |
| getTime()                          | 返回从 1970-1-1 00:00:00 UTC 到该日期经过的毫秒数。               |
| setFullYear(year, [month], [day])  | 根据本地时间设置指定日期对象的年份。                              |
| setMonth(month, [day])             | 根据本地时间设置指定日期对象的月份。                              |
| setDate(day)                       | 根据本地时间设置指定日期对象的日期。                              |
| setHours(hour, [min], [sec], [ms]) | 根据本地时间设置指定日期对象的小时。                              |
| setMinutes(min, [sec], [ms])       | 根据本地时间设置指定日期对象的分钟。                              |
| setSeconds(sec, [ms])              | 根据本地时间设置指定日期对象的秒数。                              |
| setMilliseconds(ms)                | 根据本地时间设置指定日期对象的毫秒数。                            |
| setTime(time)                      | 通过指定从 1970-1-1 00:00:00 UTC 开始经过的毫秒数来设置日期对象。 |
| toISOString()                      | 返回一个 ISO 格式的字符串：YYYY-MM-DDTHH:mm:ss.sssZ。             |
| toLocaleString()                   | 返回一个表示日期对象的字符串，该字符串与当地环境的语言相对应。    |

#### JSON 对象的方法

| 方法名                                     | 描述                           |
| ------------------------------------------ | ------------------------------ |
| JSON.parse(text[, reviver])                | 将一个 JSON 字符串转换为对象。 |
| JSON.stringify(value[, replacer[, space]]) | 将一个值转换为 JSON 字符串。   |

#### Map 对象的方法

| 方法名                         | 描述                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| set(key, value)                | 设置 Map 对象中键的值，返回该 Map 对象。                                              |
| get(key)                       | 返回键对应的值，如果不存在，则返回 undefined。                                        |
| has(key)                       | 返回一个布尔值，表示 Map 实例是否包含键对应的值。                                     |
| delete(key)                    | 删除 Map 中的元素，删除成功返回 true，否则返回 false。                                |
| clear()                        | 移除 Map 对象中的所有元素。                                                           |
| keys()                         | 返回一个新的 Iterator 对象，它按插入顺序包含了 Map 对象中每个元素的键。               |
| values()                       | 返回一个新的 Iterator 对象，它按插入顺序包含了 Map 对象中每个元素的值。               |
| entries()                      | 返回一个新的 Iterator 对象，它按插入顺序包含了 Map 对象中每个元素的[key, value]数组。 |
| forEach(callbackFn[, thisArg]) | 按插入顺序，为 Map 对象里的每一键值对调用一次 callbackFn 函数。                       |

#### Set 对象的方法

| 方法名                         | 描述                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| add(value)                     | 在 Set 对象尾部添加一个元素，返回该 Set 对象。                                                        |
| has(value)                     | 返回一个布尔值，表示该值在 Set 中存在与否。                                                           |
| delete(value)                  | 移除 Set 中与这个值相等的元素，返回 Set.prototype.has(value)在这个操作前返回的值。                    |
| clear()                        | 移除 Set 对象内的所有元素。                                                                           |
| keys()                         | 返回一个新的 Iterator 对象，该对象包含 Set 对象中的按插入顺序排列的所有元素的值。                     |
| values()                       | 与 keys()方法相同，返回一个新的 Iterator 对象。                                                       |
| entries()                      | 返回一个新的 Iterator 对象，该对象包含 Set 对象中的按插入顺序排列的所有元素的值的[value, value]数组。 |
| forEach(callbackFn[, thisArg]) | 按照插入顺序，为 Set 对象中的每一个值调用一次 callBackFn。                                            |

#### Promise 对象的方法

| 方法名                 | 描述                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Promise.all(iterable)  | 返回一个新的 Promise，它在 iterable 中所有的 Promise 都成功时才成功，只要有一个失败就失败。 |
| Promise.race(iterable) | 返回一个新的 Promise，它在 iterable 中任意一个 Promise 解决或拒绝时立即解决或拒绝。         |
| Promise.resolve(value) | 返回一个以给定值解析后的 Promise 对象。                                                     |
| Promise.reject(reason) | 返回一个带有拒绝原因的 Promise 对象。                                                       |

### **函数与高阶方法**

| **方法/语法**                  | **说明**                                 | **示例**                             |
| ------------------------------ | ---------------------------------------- | ------------------------------------ |
| `bind(thisArg, ...args)`       | 绑定  `this`  并返回新函数               | `func.bind(obj)` → 新函数            |
| `call(thisArg, ...args)`       | 立即调用函数并指定  `this`               | `func.call(obj, 1, 2)`               |
| `apply(thisArg, [args])`       | 立即调用函数并指定  `this`（参数为数组） | `func.apply(obj, [1, 2])`            |
| `setTimeout(callback, delay)`  | 延迟执行函数（返回定时器 ID）            | `setTimeout(() => {}, 1000)` → `ID`  |
| `setInterval(callback, delay)` | 循环执行函数（返回定时器 ID）            | `setInterval(() => {}, 1000)` → `ID` |

### RegExp 方法

| 方法名       | 描述                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| exec(string) | 在一个指定字符串中执行一个搜索匹配。返回一个结果数组或 null。                |
| test(string) | 执行一个检索，用来查看正则表达式与指定的字符串是否匹配。返回 true 或 false。 |

#### 其他

| 方法名                  | 描述                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| eval(string)            | 执行字符串形式的 JavaScript 代码。                                    |
| isNaN(value)            | 判断一个值是否是 NaN。注意：全局的 isNaN 会先将参数转换为数值再判断。 |
| isFinite(value)         | 判断一个值是否是有限数字。                                            |
| parseFloat(string)      | 将字符串解析成浮点数。                                                |
| parseInt(string, radix) | 将字符串解析成整数。                                                  |

【待补充】
