---
uuid: 7262d7c0-dc54-11f1-af3c-7b4438dbe452
title: 2026-09-12-重学 JavaScript Vol.3 - 函数与闭包
mathjax: true
abbrlink: 47930
published: 2026-09-12 10:34:56
category: 前端
description: JavaScript 函数与闭包：函数定义与参数、作用域链、闭包、this 绑定规则、高阶函数与生成器
cover: ''
tags:
  - 前端
  - JavaScript
---

## 函数

函数是 JavaScript 中的基本组件之一。JavaScript 中的函数类似于过程——一组执行任务或计算值的语句。但要成为函数，这个过程应该接受输入并返回与输入存在某些明显关系的输出。要使用一个函数，必须将其定义在希望调用它的作用域内。

### 定义函数

#### 函数声明

函数定义（也称为函数声明或函数语句）由 `function` 关键字，并跟随以下部分组成：

- 函数名称。
- 函数参数列表，包围在括号中并由逗号分隔。
- 定义函数的 JavaScript 语句，用大括号括起来，`{ /* … */ }`。

```js
function square(number) {
  return number * number
}
```

函数 `square` 接收一个名为 `number` 的参数。这个函数只有一个语句，其表示该函数将函数的参数（即 `number`）自乘后返回。函数的 `return` 语句指定了函数的返回值：`number * number`。

参数本质上是**按值**传递给函数的——因此，即使函数体的代码为传递给函数的参数赋了新值，这个改变也不会反映到全局或调用该函数的代码中。

如果将对象作为参数传递，而函数改变了这个对象的属性，这样的改变对函数外部是可见的：

```js
function myFunc(theObject) {
  theObject.make = 'Toyota'
}

const mycar = {
  make: 'Honda',
  model: 'Accord',
  year: 1998,
}

console.log(mycar.make) // "Honda"
myFunc(mycar)
console.log(mycar.make) // "Toyota"
```

数组同理：

```js
function myFunc(theArr) {
  theArr[0] = 30
}

const arr = [45]

console.log(arr[0]) // 45
myFunc(arr)
console.log(arr[0]) // 30
```

#### 函数表达式

虽然上面的函数声明在语法上是一个语句，但函数也可以由函数表达式创建。这样的函数可以是匿名的；它不必有一个名称。例如，函数 `square` 也可这样来定义：

```js
const square = function (number) {
  return number * number
}

console.log(square(4)) // 16
```

然而，也可以为函数表达式提供名称，并且可以用于在函数内部代指其本身，或者在调试器堆栈跟踪中识别该函数：

```js
const factorial = function fac(n) {
  return n < 2 ? 1 : n * fac(n - 1)
}

console.log(factorial(3)) // 6
```

当将函数作为参数传递给另一个函数时，函数表达式很方便。下面的例子演示了一个叫 `map` 的函数，该函数接收函数作为第一个参数，接收数组作为第二个参数：

```js
function map(f, a) {
  const result = new Array(a.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = f(a[i])
  }
  return result
}

const cube = function (x) {
  return x * x * x
}

const numbers = [0, 1, 2, 5, 10]
console.log(map(cube, numbers)) // [0, 1, 8, 125, 1000]
```

在 JavaScript 中，可以根据条件来定义一个函数。比如下面的代码，当 `num` 等于 `0` 的时候才会定义 `myFunc`：

```js
let myFunc
if (num === 0) {
  myFunc = function (theObject) {
    theObject.make = 'Toyota'
  }
}
```

除了上述的定义函数方法外，也可以在运行时用 `Function` 构造函数从一个字符串创建一个函数，很像 `eval()` 函数。

当一个函数是一个对象的属性时，称之为**方法**。

### 调用函数

定义的函数并不会自动执行它。定义了函数仅仅是赋予函数以名称并明确函数被调用时该做些什么。

调用函数才会以给定的参数真正执行这些动作：

```js
square(5)
```

上述语句使用参数 `5` 来调用函数。函数执行完它的语句会返回值 `25`。

函数一定要处于调用它们的作用域中，但是函数的声明可以被提升（出现在调用语句之后）。函数声明的范围是声明它的函数（或者，如果它是在顶层声明的，则为整个程序）之内。

函数的参数并不局限于字符串或数字。也可以将整个对象传递给函数。函数可以调用其本身，例如用递归计算阶乘：

```js
function factorial(n) {
  if (n === 0 || n === 1) {
    return 1
  } else {
    return n * factorial(n - 1)
  }
}

console.log(factorial(1)) // 1
console.log(factorial(5)) // 120
```

函数本身就是对象，因此这些对象也有方法。`call()` 和 `apply()` 方法可用于动态调用函数、处理数量可变的实参，或指定运行时的 `this`。

### 函数提升

考虑以下示例：

```js
console.log(square(5)) // 25

function square(n) {
  return n * n
}
```

尽管 `square()` 函数在声明之前被调用，但此代码的运行并没有任何错误。这是因为 JavaScript 解释器会将整个函数声明提升到当前作用域的顶部。函数提升仅适用于函数**声明**，而不适用于函数**表达式**：

```js
console.log(square(5)) // ReferenceError: Cannot access 'square' before initialization
const square = function (n) {
  return n * n
}
```

### 函数作用域

在函数内定义的变量不能在函数之外的任何地方访问，因为变量仅仅在该函数的作用域内定义。相对应的，一个函数可以访问定义在其范围内的任何变量和函数。

换言之，定义在全局域中的函数可以访问所有定义在全局域中的变量。在另一个函数中定义的函数也可以访问在其父函数中定义的所有变量和父函数有权访问的任何其他变量：

```js
const num1 = 20
const num2 = 3
const name = 'Chamakh'

function multiply() {
  return num1 * num2
}

console.log(multiply()) // 60

function getScore() {
  const num1 = 2
  const num2 = 3

  function add() {
    return `${name} 的得分为 ${num1 + num2}`
  }

  return add()
}

console.log(getScore()) // "Chamakh 的得分为 5"
```

### 闭包

在一个函数里面可以嵌套另外一个函数。嵌套（内部）函数对其容器（外部）函数是私有的。它自身也形成了一个**闭包**：闭包是可以拥有独立变量以及绑定了这些变量的环境的表达式。

既然嵌套函数是一个闭包，就意味着一个嵌套函数可以“继承”容器函数的参数和变量。换句话说，内部函数包含外部函数的作用域：

- 内部函数只可以在外部函数中访问。
- 内部函数形成了一个闭包：它可以访问外部函数的参数和变量，但是外部函数却不能使用它的参数和变量。

```js
function addSquares(a, b) {
  function square(x) {
    return x * x
  }
  return square(a) + square(b)
}

console.log(addSquares(2, 3)) // 13
```

由于内部函数形成了闭包，因此可以调用外部函数并为外部函数和内部函数指定参数：

```js
function outside(x) {
  function inside(y) {
    return x + y
  }
  return inside
}

const fnInside = outside(3)
console.log(fnInside(5)) // 8
console.log(outside(3)(5)) // 8
```

注意到上例中 `inside` 被返回时 `x` 是怎么被保留下来的。一个闭包必须保存它可见作用域中所有参数和变量。因为每一次调用传入的参数都可能不同，每一次对外部函数的调用实际上重新创建了一遍这个闭包。只有当返回的 `inside` 没有再被引用时，内存才会被释放。

#### 多层嵌套与命名冲突

函数可以被多层嵌套。函数 `A` 可以包含函数 `B`，后者可以再包含函数 `C`。这里的函数 `B` 和 `C` 都形成了闭包，所以 `B` 可以访问 `A`，`C` 可以访问 `B`。此外，因为 `C` 可以访问 `B`（而 `B` 可以访问 `A`），所以 `C` 也可以访问 `A`。因此，闭包可以包含多个作用域；它们递归地包含了所有包含它的函数作用域。这个称之为**作用域链**。

```js
function A(x) {
  function B(y) {
    function C(z) {
      console.log(x + y + z)
    }
    C(3)
  }
  B(2)
}
A(1) // 打印 6（即 1 + 2 + 3）
```

反过来却不是这样。`A` 不能访问 `C`，因为 `A` 不能访问 `B` 中的参数和变量，`C` 是 `B` 中的一个变量，所以 `C` 是 `B` 私有的。

当同一个闭包作用域下两个参数或者变量同名时，就会产生**命名冲突**。更近的作用域有更高的优先权，所以最近的优先级最高，最远的优先级最低。这就是作用域链。链的第一个元素就是最里面的作用域，最后一个元素便是最外层的作用域：

```js
function outside() {
  const x = 5
  function inside(x) {
    return x * 2
  }
  return inside
}

console.log(outside()(10)) // 20（而不是 10）
```

命名冲突发生在语句 `return x * 2` 上，`inside` 的参数 `x` 和 `outside` 的变量 `x` 发生了冲突。这里的作用域链是 `{inside、outside、全局对象}`。因此 `inside` 的 `x` 优先于 `outside` 的 `x`。

#### 用闭包保存状态

闭包可以返回一个包含用于操作外部函数内部变量的方法的对象：

```js
const createPet = function (name) {
  let sex

  const pet = {
    setName(newName) {
      name = newName
    },

    getName() {
      return name
    },

    getSex() {
      return sex
    },

    setSex(newSex) {
      if (
        typeof newSex === 'string' &&
        (newSex.toLowerCase() === 'male' || newSex.toLowerCase() === 'female')
      ) {
        sex = newSex
      }
    },
  }

  return pet
}

const pet = createPet('Vivie')
console.log(pet.getName()) // Vivie

pet.setName('Oliver')
pet.setSex('male')
console.log(pet.getSex()) // male
console.log(pet.getName()) // Oliver
```

在上面的代码中，外部函数的 `name` 变量对内部函数来说是可访问的，而除了通过内部函数本身，没有其他任何方法可以取得内部的变量。内部函数的内部变量就像对外部参数和变量的保险柜。

使用闭包时需要注意命名冲突：如果一个闭包的函数定义了一个和外部的某个变量名称相同的变量，那么这个闭包将无法引用外部作用域中的这个变量。内部作用域的变量“覆盖”外部作用域，直至程序退出内部作用域。

#### 在循环中创建闭包

在引入 `let` 关键字之前，在循环中创建闭包会发生一个常见问题：

```js
function showHelp(help) {
  document.getElementById('help').textContent = help
}

function setupHelp() {
  var helpText = [
    { id: 'email', help: 'Your email address' },
    { id: 'name', help: 'Your full name' },
    { id: 'age', help: 'Your age (you must be over 16)' },
  ]

  for (var i = 0; i < helpText.length; i++) {
    var item = helpText[i]
    document.getElementById(item.id).onfocus = function () {
      showHelp(item.help)
    }
  }
}

setupHelp()
```

这段代码没有达到预期效果：无论聚焦在哪个字段上，显示的都是关于年龄的信息。原因是赋值给 `onfocus` 的函数创建了闭包，这些闭包由函数定义和从 `setupHelp` 函数作用域中捕获的环境组成。三个闭包在循环中创建，但每个都共享同一个词法环境，这个环境有一个不断改变值的变量 `item`。这是因为 `item` 变量用 `var` 声明，并由于声明提升，因此拥有函数作用域。而 `item.help` 的值是在 `onfocus` 回调执行时决定。因为循环在事件触发之前早已执行完毕，所以 `item` 变量对象（由三个闭包共享）已经指向了 `helpText` 的最后一项。

解决方案是使用更多的闭包，特别是函数工厂：

```js
function makeHelpCallback(help) {
  return function () {
    showHelp(help)
  }
}

// 循环中：
// document.getElementById(item.id).onfocus = makeHelpCallback(item.help)
```

`makeHelpCallback` 函数为每一个回调创建了一个**新的词法环境**，在每个新的词法环境中，`help` 指向 `helpText` 数组中对应的字符串。更简单的做法是直接用 `let` 或 `const` 声明循环变量。

### arguments 对象

函数的实际参数会被保存在一个类似数组的 `arguments` 对象中。在函数内，可以按如下方式找出传入的参数：

```js
arguments[i]
```

其中 `i` 是参数的序号，从 `0` 开始。所以第一个传入函数的参数会是 `arguments[0]`。参数的数量由 `arguments.length` 表示。

使用 `arguments` 对象，可以处理比声明更多的参数来调用函数。这在事先不知道会需要将多少参数传递给函数时十分有用：

```js
function myConcat(separator) {
  let result = ''
  for (let i = 1; i < arguments.length; i++) {
    result += arguments[i] + separator
  }
  return result
}

console.log(myConcat('、', '红', '橙', '蓝'))
// "红、橙、蓝、"
```

`arguments` 变量只是“类数组”，而不是数组。它与数组类似，有索引编号和 `length` 属性，但并不具备 `Array` 对象的所有数组操作方法。

### 函数参数

#### 默认参数

在 JavaScript 中，函数参数的默认值是 `undefined`。在过去，用于设定默认参数的一般策略是在函数的主体中测试参数值是否为 `undefined`，如果是则赋予这个参数一个默认值：

```js
function multiply(a, b) {
  b = typeof b !== 'undefined' ? b : 1
  return a * b
}

console.log(multiply(5)) // 5
```

使用**默认参数**，在函数体的手动检查就不再必要：

```js
function multiply(a, b = 1) {
  return a * b
}

console.log(multiply(5)) // 5
```

#### 剩余参数

**剩余参数**语法允许将不确定数量的参数表示为数组。在下面的示例中，`multiply` 函数使用剩余参数收集从第二个参数开始到最后的参数，然后将它们与第一个参数相乘：

```js
function multiply(multiplier, ...theArgs) {
  return theArgs.map((x) => multiplier * x)
}

const arr = multiply(2, 1, 2, 3)
console.log(arr) // [2, 4, 6]
```

### 箭头函数

箭头函数表达式相比函数表达式具有较短的语法，且没有它自己的 `this`、`arguments`、`super` 和 `new.target`。箭头函数总是匿名的。有两个因素会影响对箭头函数的引入：**更简洁的函数**和 `this` 的**无绑定性**。

在一些函数模式中，更简洁的函数很受欢迎：

```js
const a = ['Hydrogen', 'Helium', 'Lithium', 'Beryllium']

const a2 = a.map(function (s) {
  return s.length
})
console.log(a2) // [8, 6, 7, 9]

const a3 = a.map((s) => s.length)
console.log(a3) // [8, 6, 7, 9]
```

在箭头函数出现之前，每一个新函数都定义了自己的 `this` 值。这在面向对象的编程风格中并不理想：

```js
function Person() {
  this.age = 0

  setInterval(function growUp() {
    // 在非严格模式下，growUp() 函数将 `this` 定义为“全局对象”
    this.age++
  }, 1000)
}
```

在 ECMAScript 3/5 中，通过把 `this` 的值赋值给一个变量可以修复这个问题：

```js
function Person() {
  const self = this
  self.age = 0

  setInterval(function growUp() {
    self.age++
  }, 1000)
}
```

箭头函数没有自己的 `this`，而是使用封闭执行上下文的 `this` 值：

```js
function Person() {
  this.age = 0

  setInterval(() => {
    this.age++ // 这里的 `this` 正确地指向 person 对象
  }, 1000)
}
```

### this 与绑定规则

`this` 的值取决于它出现的上下文：函数、类或全局。在函数内部，`this` 的值取决于函数如何被调用。可以把 `this` 看作是函数的一个隐藏参数，是语言在函数体被执行时创建的绑定。

#### 默认绑定

如果函数没有被任何对象访问就直接调用，`this` 在严格模式下是 `undefined`，在非严格模式下会被替换为全局对象（`globalThis`）：

```js
function getThis() {
  'use strict'
  return this
}

console.log(getThis()) // undefined
```

非严格模式下，`this` 替换规则会保证 `this` 总是一个对象：`undefined` 或 `null` 被替换为 `globalThis`，原始值被替换为对应的包装对象。

#### 隐式绑定

如果函数调用的形式是 `obj.f()`，那么 `this` 指向 `obj`。函数是同一个函数，但根据调用方式不同，`this` 的值会不同：

```js
function getThis() {
  return this
}

const obj1 = { name: 'obj1' }
const obj2 = { name: 'obj2' }

obj1.getThis = getThis
obj2.getThis = getThis

console.log(obj1.getThis().name) // "obj1"
console.log(obj2.getThis().name) // "obj2"
```

`this` 指向的是调用函数的对象，而不是拥有该函数作为自有属性的对象。通过原型链访问方法时，`this` 仍然是实际调用它的对象：

```js
const obj3 = {
  __proto__: obj1,
  name: 'obj3',
}

console.log(obj3.getThis().name) // "obj3"
```

#### 显式绑定

`call()`、`apply()` 和 `Reflect.apply()` 可以显式设置 `this` 的值；`bind()` 创建一个新函数，无论之后如何调用，`this` 都保持不变：

```js
function greet(greeting) {
  return `${greeting}, ${this.name}`
}

const user = { name: 'Ada' }

greet.call(user, 'Hello') // "Hello, Ada"
greet.apply(user, ['Hi']) // "Hi, Ada"

const boundGreet = greet.bind(user)
boundGreet('Hey') // "Hey, Ada"
```

#### 构造函数绑定

当一个函数被用作构造函数（使用 `new` 关键字）时，无论构造函数是在哪个对象上被访问的，其 `this` 都会被绑定到正在构造的新对象上。除非构造函数返回另一个非原始值，不然 `this` 的值会成为 `new` 表达式的值：

```js
function C() {
  this.a = 37
}

const o = new C()
console.log(o.a) // 37
```

#### 箭头函数

箭头函数不会创建自己的 `this`，它保留闭合词法上下文的 `this` 值。使用 `call()`、`bind()` 或 `apply()` 调用箭头函数时，`thisArg` 参数会被忽略：

```js
const globalObject = this
const foo = () => this

console.log(foo() === globalObject) // true
console.log(foo.call({ name: 'obj' }) === globalObject) // true
```

#### 类与静态上下文

类构造函数总是通过 `new` 调用，`this` 是正在创建的新实例。实例方法的行为像对象字面量中的方法，`this` 是方法被访问的对象；如果方法没有转移到另一个对象，通常是类的一个实例。

静态方法不是实例的属性，而是类本身的属性，因此静态方法中的 `this` 是类（或子类）：

```js
class Counter {
  static count = 0

  static increment() {
    this.count++
  }
}

Counter.increment()
console.log(Counter.count) // 1
```

回调函数中的 `this` 由调用回调的 API 决定。数组的迭代方法、`Promise` 构造函数等通常以 `undefined` 作为 `this` 调用回调；数组迭代方法还接受一个可选的 `thisArg` 参数，用来指定回调的 `this`。

### 高阶函数

函数在 JavaScript 中是一等值：可以作为参数传递、作为返回值返回、存入对象或数组。接收函数作为参数、或返回函数的函数通常称为**高阶函数**。数组的 `map()`、`filter()`、`reduce()`、`sort()` 都接受回调函数；闭包解释了回调为什么能“记住”创建时的变量。

#### map/reduce

`map()` 对每个元素执行回调，把返回值组成一个新数组，长度与原数组一致：

```js
const numbers = [1, 2, 3, 4]
const doubled = numbers.map((x) => x * 2)
// [2, 4, 6, 8]

const strings = numbers.map(String)
// ["1", "2", "3", "4"]
```

`map()` 的回调接收三个参数：当前元素、索引、原数组。直接把接受多个参数的函数传给 `map()` 容易踩坑，因为 `map()` 会把索引当作第二个参数传进去：

```js
;['1', '2', '3'].map(parseInt)
// [1, NaN, NaN]
// parseInt("1", 0) -> 1
// parseInt("2", 1) -> NaN
// parseInt("3", 2) -> NaN
```

正确写法是显式包一层：

```js
;['1', '2', '3'].map((x) => parseInt(x, 10))
// [1, 2, 3]
```

`reduce()` 把数组元素两两递归处理，最终计算成一个单一结果。回调接收累积器、当前值、当前索引和原数组；第二个参数是累积器的初始值：

```js
const total = [1, 2, 3, 4].reduce((acc, x) => acc + x, 0)
// 10

const product = [1, 2, 3, 4].reduce((acc, x) => acc * x, 1)
// 24
```

没有提供初始值时，累积器从第一个元素开始，当前值从第二个元素开始。空数组且没有初始值会抛出 `TypeError`。

`reduce()` 可以实现 `map()` 和 `filter()`，这也说明了高阶函数之间的等价关系：

```js
const map = (arr, fn) => arr.reduce((acc, x) => [...acc, fn(x)], [])
const filter = (arr, fn) => arr.reduce((acc, x) => (fn(x) ? [...acc, x] : acc), [])
```

#### filter

`filter()` 用谓词函数筛选元素，回调返回 `true` 的元素组成新数组，返回 `false` 的元素被丢弃。原数组不变：

```js
const numbers = [1, 2, 3, 4, 5, 6]
const evens = numbers.filter((x) => x % 2 === 0)
// [2, 4, 6]
```

用 `filter()` 去重，利用 `indexOf()` 只返回第一个匹配位置：

```js
const unique = (arr) => arr.filter((x, i) => arr.indexOf(x) === i)
unique([1, 2, 1, 3, 2]) // [1, 2, 3]
```

筛选素数：

```js
const isPrime = (n) => {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false
  }
  return true
}

;[2, 3, 4, 5, 6, 7].filter(isPrime) // [2, 3, 5, 7]
```

#### sort

`sort()` 默认把元素转换为字符串，再按 UTF-16 码元顺序比较。这会让数字排序出现反直觉的结果：

```js
;[10, 2, 1].sort()
// [1, 10, 2]，因为 "10" < "2"
```

数字排序必须提供比较函数：

```js
;[10, 2, 1].sort((a, b) => a - b)
// [1, 2, 10]
```

比较函数的契约是：返回负数表示 `a` 排在 `b` 前面，返回正数表示 `a` 排在 `b` 后面，返回 `0` 表示两者顺序不变。按对象属性排序：

```js
const users = [
  { name: 'Ada', age: 36 },
  { name: 'Bob', age: 24 },
  { name: 'Cara', age: 30 },
]

users.sort((a, b) => a.age - b.age)
// Bob, Cara, Ada
```

现代 JavaScript 引擎的 `sort()` 是稳定排序：比较结果相等的元素会保持原来的相对顺序。`sort()` 会原地修改数组并返回同一个数组的引用，需要保留原数组时应先复制。

#### Array

`every()` 和 `some()` 都返回布尔值，并且会短路：`every()` 遇到第一个 `false` 就停止，`some()` 遇到第一个 `true` 就停止：

```js
const numbers = [1, 2, 3, 4]

numbers.every((x) => x > 0) // true
numbers.every((x) => x > 2) // false

numbers.some((x) => x > 3) // true
numbers.some((x) => x > 10) // false
```

`find()` 返回第一个满足条件的元素，`findIndex()` 返回它的索引；找不到时分别返回 `undefined` 和 `-1`。它们与 `indexOf()` 的区别是：`find()`/`findIndex()` 接受谓词函数，`indexOf()` 按严格相等查找值：

```js
const users = [{ id: 1 }, { id: 2 }, { id: 3 }]

users.find((u) => u.id === 2) // { id: 2 }
users.findIndex((u) => u.id === 2) // 1
users.findIndex((u) => u.id === 9) // -1
```

`forEach()` 对每个元素执行回调并返回 `undefined`。它不能 `break`，也不能用 `return` 提前结束整个循环；需要提前终止时应使用 `for...of`、`some()` 或 `every()`：

```js
;[1, 2, 3].forEach((x) => {
  if (x === 2) return // 只跳过本次回调，不会结束循环
  console.log(x)
})
// 1
// 3
```

完整的方法签名、`thisArg` 参数和稀疏数组行为，见 Vol.2《数据结构与值》的“数组”一节。

## 生成器

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

- **函数**：函数声明整体提升，表达式不提升；参数按值传递，对象和数组的内部修改对外可见；`arguments` 是类数组；默认参数和剩余参数替代手工检查。
- **闭包**：内部函数持有外部函数作用域，外部函数返回后变量仍然存活；循环中 `var` 共享同一环境是经典陷阱，函数工厂或 `let` 可以隔离。
- **this**：默认绑定在严格模式下是 `undefined`，隐式绑定指向调用对象，`call`/`apply`/`bind` 可以显式指定；箭头函数没有自己的 `this`，`new` 绑定到新实例。
- **高阶函数**：`map` 一对一映射，`reduce` 把元素归约为单一值，`filter` 用谓词筛选，`sort` 默认按字符串排序；`every`/`some` 短路，`forEach` 不能 `break`。
- **生成器**：`function*` 与 `yield` 把迭代器状态维护交给引擎，适合按需计算和无限序列。

## 参考

- [函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions)
- [闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Closures)
- [this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
- [迭代器和生成器](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Iterators_and_generators)
