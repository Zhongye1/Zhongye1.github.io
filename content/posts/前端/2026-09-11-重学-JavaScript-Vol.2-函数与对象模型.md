---
uuid: 7262d7c0-dc54-11f1-af3c-7b4438dbe452
title: 2026-09-11-重学 JavaScript Vol.2 - 函数与对象模型
mathjax: true
abbrlink: 47930
published: 2026-09-11 10:34:56
category: 前端
description: JavaScript 函数、闭包与面向对象：函数声明与参数、作用域链、闭包、原型链、类与继承
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

### 高阶函数与回调

函数在 JavaScript 中是一等值：可以作为参数传递、作为返回值返回、存入对象或数组。接收函数作为参数、或返回函数的函数通常称为**高阶函数**。数组的 `map()`、`filter()`、`reduce()`、`sort()` 都接受回调函数，第一篇的数组一节已经介绍过；闭包则解释了回调为什么能“记住”创建时的变量。

生成器的内容在第一篇的 iterable 一节已经介绍过：`function*` 与 `yield` 把迭代器的状态维护交给引擎，适合表示按需计算的序列。

## 面向对象

### 原型与原型链

JavaScript 对象是动态的属性（称为**自有属性**）“包”。JavaScript 对象有一条指向原型对象的链。当试图访问对象的属性时，不仅在该对象上查找属性，还会在该对象的原型上查找属性，以及原型的原型，依此类推，直到找到一个名字匹配的属性或到达原型链的末尾。

根据 ECMAScript 标准，符号 `someObject.[[Prototype]]` 用于指定 `someObject` 的原型。使用 `Object.getPrototypeOf()` 和 `Object.setPrototypeOf()` 函数分别访问和修改 `[[Prototype]]` 内部插槽。这与 JavaScript 访问器 `__proto__` 是等价的，后者是非标准的，但许多 JavaScript 引擎实际上实现了它。为了保持简洁和避免困惑，这里使用 `obj.[[Prototype]]` 表示法，它对应于 `Object.getPrototypeOf(obj)`。

不应将它与函数的 `func.prototype` 属性弄混，后者表明的是指定函数作为构造函数时创建的所有对象**实例**的 `[[Prototype]]`。

有几种可以指定对象的 `[[Prototype]]` 的方法。`{ __proto__: ... }` 语法是标准且未被弃用的。在像 `{ a: 1, b: 2, __proto__: c }` 这样的对象字面量中，值 `c`（其必须为 `null` 或另一个对象）将变成字面量所表示的对象的 `[[Prototype]]`，而其他像 `a` 和 `b` 这样的键将变成对象的**自有属性**。

```js
const o = {
  a: 1,
  b: 2,
  // __proto__ 设置了 [[Prototype]]。在这里它被指定为另一个对象字面量。
  __proto__: {
    b: 3,
    c: 4,
  },
}

// { a: 1, b: 2 } ---> { b: 3, c: 4 } ---> Object.prototype ---> null

console.log(o.a) // 1
// o 上有自有属性“a”吗？有，且其值为 1。

console.log(o.b) // 2
// o 上有自有属性“b”吗？有，且其值为 2。
// 原型也有“b”属性，但其没有被访问。
// 这被称为属性遮蔽（Property Shadowing）

console.log(o.c) // 4
// o 上没有自有属性“c”，检查其原型，原型上有“c”，其值为 4。

console.log(o.d) // undefined
// 一路查到 Object.prototype 和 null，都没有“d”，返回 undefined。
```

给对象设置属性会创建自有属性。获取和设置行为规则的唯一例外是当它被 getter 或 setter 拦截时。

同理，可以创建更长的原型链，并在所有的原型链上查找属性：

```js
const o = {
  a: 1,
  b: 2,
  __proto__: {
    b: 3,
    c: 4,
    __proto__: {
      d: 5,
    },
  },
}

// { a: 1, b: 2 } ---> { b: 3, c: 4 } ---> { d: 5 } ---> Object.prototype ---> null

console.log(o.d) // 5
```

JavaScript 中定义“方法”的形式和基于类的语言定义方法的形式不同。在 JavaScript 中，对象可以以属性的形式添加函数。继承的函数与其他属性一样，包括属性遮蔽（在这种情况下，是一种**方法重写**的形式）。

当执行继承的函数时，`this` 值指向继承对象，而不是将该函数作为其自有属性的原型对象：

```js
const parent = {
  value: 2,
  method() {
    return this.value + 1
  },
}

console.log(parent.method()) // 3
// 当调用 parent.method 时，“this”指向了 parent

const child = {
  __proto__: parent,
}
console.log(child.method()) // 3
// 调用 child.method 时，“this”指向了 child。
// child 没有名为“value”的自有属性，该属性会在 [[Prototype]] 上被找到。

child.value = 4 // 将 child 上的属性“value”赋值为 4。
// 这会遮蔽 parent 上的“value”属性。
console.log(child.method()) // 5
// 因为 child 现在拥有“value”属性，“this.value”现在表示 child.value
```

### 构造函数

原型的强大之处在于，如果一组属性应该出现在每一个实例上，那就可以复用它们——尤其是对于方法。假设要创建多个盒子，其中每一个盒子都是一个对象，包含一个可以通过 `getValue` 函数访问的值。一个简单的实现可能是：

```js
const boxes = [
  {
    value: 1,
    getValue() {
      return this.value
    },
  },
  {
    value: 2,
    getValue() {
      return this.value
    },
  },
  {
    value: 3,
    getValue() {
      return this.value
    },
  },
]
```

这是不够好的，因为每一个实例都有自己的、做相同事情的函数属性，这是冗余且不必要的。相反，可以将 `getValue` 移动到所有盒子的 `[[Prototype]]` 上：

```js
const boxPrototype = {
  getValue() {
    return this.value
  },
}

const boxes = [
  { value: 1, __proto__: boxPrototype },
  { value: 2, __proto__: boxPrototype },
  { value: 3, __proto__: boxPrototype },
]
```

这样，所有盒子的 `getValue` 方法都会引用相同的函数，降低了内存使用率。但是，为每个对象创建手动绑定 `__proto__` 仍旧非常不方便。这时，就可以使用**构造函数**，它会自动为每个构造的对象设置 `[[Prototype]]`。构造函数是使用 `new` 调用的函数：

```js
// 构造函数
function Box(value) {
  this.value = value
}

// 使用 Box() 构造函数创建的所有盒子都将具有的属性
Box.prototype.getValue = function () {
  return this.value
}

const boxes = [new Box(1), new Box(2), new Box(3)]
```

`new Box(1)` 是通过 `Box` 构造函数创建的一个**实例**。`Box.prototype` 与之前创建的 `boxPrototype` 并无太大区别——它只是一个普通的对象。通过构造函数创建的每一个实例都会自动将构造函数的 `prototype` 属性作为其 `[[Prototype]]`。即，`Object.getPrototypeOf(new Box()) === Box.prototype`。`Constructor.prototype` 默认具有一个自有属性：`constructor`，它引用了构造函数本身。即，`Box.prototype.constructor === Box`。这允许在任何实例中访问原始构造函数。

如果构造函数返回非原始值，则该值将成为 `new` 表达式的结果。在这种情况下，可能无法正确绑定 `[[Prototype]]`——但在实践中应该很少发生。

用类将上面的构造函数重写为：

```js
class Box {
  constructor(value) {
    this.value = value
  }

  // 在 Box.prototype 上创建方法
  getValue() {
    return this.value
  }
}
```

类是构造函数的语法糖，这意味着仍然可以修改 `Box.prototype` 来改变所有实例的行为。因为 `Box.prototype` 引用的对象和所有实例的 `[[Prototype]]` 是同一个对象，所以可以通过改变 `Box.prototype` 来改变所有实例的行为：

```js
function Box(value) {
  this.value = value
}
Box.prototype.getValue = function () {
  return this.value
}
const box = new Box(1)

// 在创建实例后修改 Box.prototype
Box.prototype.getValue = function () {
  return this.value + 1
}
box.getValue() // 2
```

有个推论是：**重新赋值** `Constructor.prototype`（`Constructor.prototype = ...`）是一个不好的主意，原因有两点：

- 在重新赋值之前创建的实例的 `[[Prototype]]` 引用的对象与重新赋值之后创建的实例的 `[[Prototype]]` 引用的对象现在是不同的——改变一个的 `[[Prototype]]` 不再改变另一个的 `[[Prototype]]`。
- 除非手动重新设置 `constructor` 属性，否则无法再通过 `instance.constructor` 追踪到构造函数，这可能会破坏用户期望的行为。一些内置操作也会读取 `constructor` 属性，如果没有设置，它们可能无法按预期工作。

`Constructor.prototype` 仅在构造实例时有用。它与 `Constructor.[[Prototype]]` 无关，后者是构造函数的**自有**原型，即 `Function.prototype`。也就是说，`Object.getPrototypeOf(Constructor) === Function.prototype`。

JavaScript 中的一些字面量语法会创建隐式设置 `[[Prototype]]` 的实例：

```js
// 对象字面量（没有 `__proto__` 键）自动将 `Object.prototype` 作为它们的 `[[Prototype]]`
const object = { a: 1 }
Object.getPrototypeOf(object) === Object.prototype // true

// 数组字面量自动将 `Array.prototype` 作为它们的 `[[Prototype]]`
const array = [1, 2, 3]
Object.getPrototypeOf(array) === Array.prototype // true

// 正则表达式字面量自动将 `RegExp.prototype` 作为它们的 `[[Prototype]]`
const regexp = /abc/
Object.getPrototypeOf(regexp) === RegExp.prototype // true
```

另一个创建对象的方式是 `Object.create()`，它允许直接为创建的对象选择一个原型对象，而不用定义构造函数：

```js
const Animal = {
  type: 'Invertebrates',
  displayType() {
    console.log(this.type)
  },
}

const animal1 = Object.create(Animal)
animal1.displayType() // Invertebrates

const fish = Object.create(Animal)
fish.type = 'Fishes'
fish.displayType() // Fishes
```

### 类

类通过 `new` 运算符创建对象。每个对象都有一些属性（数据或方法），这些属性是由类添加的。类本身也有一些属性（数据或方法），这些属性通常用于与实例进行交互。这些对应于类的三个关键特征：

- 构造函数；
- 实例方法和实例字段；
- 静态方法和静态字段。

类通常通过**类声明**来创建：

```js
class MyClass {
  // 类主体……
}
```

在类体内，有若干特性可用：

```js
class MyClass {
  // 构造函数
  constructor() {
    // 构造函数主体
  }
  // 实例字段
  myField = 'foo'
  // 实例方法
  myMethod() {
    // myMethod 主体
  }
  // 静态字段
  static myStaticField = 'bar'
  // 静态方法
  static myStaticMethod() {
    // myStaticMethod 主体
  }
  // 静态块
  static {
    // 静态初始化代码
  }
  // 字段、方法、静态字段、静态方法、静态块都可以使用“私有”形式
  #myPrivateField = 'bar'
}
```

用函数构造器表达，上面的模式大致可以转换为：

```js
function MyClass() {
  this.myField = 'foo'
  // 构造函数主体
}
MyClass.myStaticField = 'bar'
MyClass.myStaticMethod = function () {
  // myStaticMethod 主体
}
MyClass.prototype.myMethod = function () {
  // myMethod 主体
}

;(function () {
  // 静态初始化代码
})()
```

私有字段和方法是类中的新特性，在函数构造器中并没有与之等价的语法。

声明一个类之后，可以使用 `new` 运算符来创建它的实例：

```js
const myInstance = new MyClass()
console.log(myInstance.myField) // 'foo'
myInstance.myMethod()
```

典型函数构造器可以使用 `new` 来构造，也可以不使用 `new` 来调用。然而，对于类的“调用”则必须使用 `new`，否则会导致错误：

```js
const myInstance = MyClass() // TypeError: Class constructor MyClass cannot be invoked without 'new'
```

与函数声明不同，类声明并不会被提升（或者，在某些解释器中，可以被提升，但是有暂时性死区的限制），这意味着不能在声明之前使用类：

```js
new MyClass() // ReferenceError: Cannot access 'MyClass' before initialization

class MyClass {}
```

该行为与使用 `let` 和 `const` 声明变量类似。类似于函数，类声明也有其表达式形式：

```js
const MyClass = class {
  // 类主体……
}
```

#### 构造函数

类最重要的工作之一就是作为对象的“工厂”。在类中，实例的创建是通过构造函数来完成的。例如，创建一个名为 `Color` 的类，它代表了一个特定的颜色。用户通过传入一个 RGB 三元组来创建颜色：

```js
class Color {
  constructor(r, g, b) {
    // 将 RGB 值作为 `this` 的属性
    this.values = [r, g, b]
  }
}
```

在类的构造函数里，`this` 的值指向新创建的实例。可以赋予它新的属性，或者读取已有的属性。`this` 的值将自动作为 `new` 的结果返回。不建议从构造函数中返回任何值——因为如果返回一个非原始类型的值，它将成为 `new` 表达式的值，而 `this` 的值将被丢弃。

```js
class MyClass {
  constructor() {
    this.myField = 'foo'
    return {}
  }
}

console.log(new MyClass().myField) // undefined
```

#### 实例方法与私有字段

如果一个类只有构造函数，那么它与一个只创建普通对象的 `createX` 工厂函数并没有太大的区别。然而，类的强大之处在于它们可以作为“模板”，自动将方法分配给实例：

```js
class Color {
  constructor(r, g, b) {
    this.values = [r, g, b]
  }
  getRed() {
    return this.values[0]
  }
}

const red = new Color(255, 0, 0)
console.log(red.getRed()) // 255
```

直接访问实例上的 `values` 数组会破坏封装：

```js
const red = new Color(255, 0, 0)
red.values[0] = 0
console.log(red.values[0]) // 0
```

在面向对象编程中，有一个叫做“封装”的哲学。这是说不应该访问对象的底层实现，而是使用抽象方法来与之交互。如果突然决定将颜色表示为 HSL 而不是 RGB，用户对 `values` 数组代表 RGB 值的假设不再成立，这可能会打破他们的代码逻辑。因此，类的实现者应该隐藏实例的内部数据结构，以保持 API 的简洁性。在类中，这是通过**私有字段**来实现的。

私有字段是以 `#`（井号）开头的标识符。井号是这个字段名的必要部分，这也就意味着私有字段永远不会与公共字段或方法发生命名冲突。为了在类中的任何地方引用一个私有字段，必须在类体中**声明**它。除此之外，私有字段与普通属性几乎是等价的：

```js
class Color {
  // 声明：每个 Color 实例都有一个名为 #values 的私有字段。
  #values
  constructor(r, g, b) {
    this.#values = [r, g, b]
  }
  getRed() {
    return this.#values[0]
  }
  setRed(value) {
    this.#values[0] = value
  }
}

const red = new Color(255, 0, 0)
console.log(red.getRed()) // 255
```

在类外访问私有字段会导致语法错误，且该错误可以在早期被捕获。因为 `#privateField` 是一个特殊语法，所以解释器可以在执行代码之前做一些静态分析，找到所有访问私有字段的地方：

```js
console.log(red.#values) // SyntaxError: Private field '#values' must be declared in an enclosing class
```

JavaScript 中的私有字段是**硬私有**的：如果类没有实现暴露这些私有字段的方法，也就没有任何机制可以从类外访问它们。这意味着可以对类的私有字段做任何重构，只要暴露的方法的行为保持不变即可。

在将 `values` 字段私有化之后，可以在 `getRed` 和 `setRed` 方法中添加一些逻辑。例如，可以在 `setRed` 中添加一个检查逻辑，以确保它是一个有效的 R 值：

```js
class Color {
  #values
  constructor(r, g, b) {
    this.#values = [r, g, b]
  }
  setRed(value) {
    if (value < 0 || value > 255) {
      throw new RangeError('无效的 R 值')
    }
    this.#values[0] = value
  }
}

const red = new Color(255, 0, 0)
red.setRed(1000) // RangeError：无效的 R 值
```

类方法可以读取其他实例的私有字段，只要它们属于同一个类即可：

```js
class Color {
  #values
  constructor(r, g, b) {
    this.#values = [r, g, b]
  }
  redDifference(anotherColor) {
    // #values 不一定要从 this 访问：
    // 也可以访问属于同一个类的其他实例的私有字段。
    return this.#values[0] - anotherColor.#values[0]
  }
}

const red = new Color(255, 0, 0)
const crimson = new Color(220, 20, 60)
red.redDifference(crimson) // 35
```

#### 访问器字段

`color.getRed()` 和 `color.setRed()` 允许读取和写入颜色的红色值。在 JavaScript 中，使用方法来简单地访问属性仍然有些不便。**访问器字段**允许像访问“实际属性”一样操作某些东西：

```js
class Color {
  constructor(r, g, b) {
    this.values = [r, g, b]
  }
  get red() {
    return this.values[0]
  }
  set red(value) {
    this.values[0] = value
  }
}

const red = new Color(255, 0, 0)
red.red = 0
console.log(red.red) // 0
```

这就像是对象有了一个 `red` 属性——但实际上，实例上并没有这样的属性。实例只有两个方法，分别以 `get` 和 `set` 为前缀，而这使得可以像操作属性一样操作它们。

如果一个字段仅有一个 getter 而没有 setter，它将是只读的：

```js
class Color {
  constructor(r, g, b) {
    this.values = [r, g, b]
  }
  get red() {
    return this.values[0]
  }
}

const red = new Color(255, 0, 0)
red.red = 0
console.log(red.red) // 255
```

在严格模式下，`red.red = 0` 这一行将抛出类型错误。在非严格模式下，赋值将被静默忽略。

#### 公共字段与静态属性

公共字段使得实例可以获得属性，且它们常常独立于构造函数的参数：

```js
class MyClass {
  luckyNumber = Math.random()
}
console.log(new MyClass().luckyNumber) // 0.5
console.log(new MyClass().luckyNumber) // 0.3
```

公共字段几乎等价于将一个属性赋值给 `this`。例如，上面的例子也可以转换为：

```js
class MyClass {
  constructor() {
    this.luckyNumber = Math.random()
  }
}
```

**静态属性**是一组在类本身上定义的特性，而不是在类的实例上定义的特性。这些特性包括静态方法、静态字段、静态 getter 与 setter。例如，对于 `Color` 类，可以创建一个静态方法，它检查给定的三元组是否是有效的 RGB 值：

```js
class Color {
  static isValid(r, g, b) {
    return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255
  }
}

Color.isValid(255, 0, 0) // true
Color.isValid(1000, 0, 0) // false
```

静态属性与实例属性的区别在于：它们有 `static` 前缀，且不能从实例中访问：

```js
console.log(new Color(0, 0, 0).isValid) // undefined
```

有一个特殊结构叫做**静态初始化块**，它是一个在类第一次加载时运行的代码块：

```js
class MyClass {
  static {
    MyClass.myStaticProperty = 'foo'
  }
}

console.log(MyClass.myStaticProperty) // 'foo'
```

静态初始化块几乎等价于在类声明之后立即执行一些代码。唯一的区别是它们可以访问静态私有元素。

#### 扩展与继承

类的一个关键特性（除了私有字段）是**继承**，这意味着一个对象可以“借用”另一个对象的大部分行为，同时覆盖或增强某些部分的逻辑。

例如，假定需要为 `Color` 类引入透明度支持。可能会尝试添加一个新的字段来表示它的透明度。然而，这意味着每个实例——即使是大多数不透明的实例（那些 alpha 值为 1 的实例）——都必须有额外的 alpha 值，这并不是很优雅。此外，如果特性继续增长，`Color` 类将变得非常臃肿且难以维护。

所以，在面向对象编程中，更愿意创建一个**派生类**。派生类可以访问父类的所有公共属性。在 JavaScript 中，派生类是通过 `extends` 子句声明的，它指示它扩展自哪个类：

```js
class ColorWithAlpha extends Color {
  #alpha
  constructor(r, g, b, a) {
    super(r, g, b)
    this.#alpha = a
  }
  get alpha() {
    return this.#alpha
  }
  set alpha(value) {
    if (value < 0 || value > 1) {
      throw new RangeError('Alpha 值必须在 0 与 1 之间')
    }
    this.#alpha = value
  }
}
```

有几件事情需要注意。首先，在构造函数中，调用了 `super(r, g, b)`。在访问 `this` 之前，必须调用 `super()`，这是 JavaScript 的要求。`super()` 调用父类的构造函数来初始化 `this`——这里大致相当于 `this = new Color(r, g, b)`。`super()` 之前也可以有代码，但不能在 `super()` 之前访问 `this`——JavaScript 会阻止访问未初始化的 `this`。

在父类完成对 `this` 的修改后，派生类才可以对其进行自己的逻辑。这里添加了一个名为 `#alpha` 的私有字段，并提供了一对 getter/setter 来与之交互。

派生类会继承父类的所有方法。例如，父类的 `get red()` 访问器即使没有在 `ColorWithAlpha` 中声明，仍然可以访问，因为这个行为是由父类指定的：

```js
const color = new ColorWithAlpha(255, 0, 0, 0.5)
console.log(color.red) // 255
```

派生类也可以覆盖父类的方法。例如，所有类都隐式继承自 `Object` 类，它定义了一些基本方法，例如 `toString()`。然而，基本的 `toString()` 方法在大多数情况下打印 `[object Object]`：

```js
console.log(red.toString()) // [object Object]
```

所以，可以覆盖它，以便在打印颜色时打印它的 RGB 值：

```js
class Color {
  #values
  // …
  toString() {
    return this.#values.join(', ')
  }
}

console.log(new Color(255, 0, 0).toString()) // '255, 0, 0'
```

在派生类内，可以使用 `super` 访问父类的方法。这允许在避免代码重复的情况下增强父类的方法：

```js
class ColorWithAlpha extends Color {
  #alpha
  // …
  toString() {
    // 调用父类的 toString()，并以此构建新的返回值
    return `${super.toString()}, ${this.#alpha}`
  }
}

console.log(new ColorWithAlpha(255, 0, 0, 0.5).toString()) // '255, 0, 0, 0.5'
```

用 `extends` 时，静态方法也会继承，因此也可以覆盖或增强它们：

```js
class ColorWithAlpha extends Color {
  static isValid(r, g, b, a) {
    return super.isValid(r, g, b) && a >= 0 && a <= 1
  }
}

console.log(ColorWithAlpha.isValid(255, 0, 0, -1)) // false
```

派生类无权访问父类的私有字段——这是 JavaScript 私有字段的一个关键特性（“硬私有”）。私有字段的有效范围被严格限制在类体内，所以任何外部代码都无权访问：

```js
class ColorWithAlpha extends Color {
  log() {
    console.log(this.#values) // SyntaxError: Private field '#values' must be declared in an enclosing class
  }
}
```

一个类只能至多扩展自一个父类。这可以防止多重继承中的问题，例如菱形问题。然而，由于 JavaScript 的动态性，仍然可以通过类组合和混入来实现多重继承的效果。

派生类的实例同时也是父类的实例，可用 `instanceof` 运算符来验证：

```js
const color = new ColorWithAlpha(255, 0, 0, 0.5)
console.log(color instanceof Color) // true
console.log(color instanceof ColorWithAlpha) // true
```

原型链的尽头是 `null`：普通对象的 `[[Prototype]]` 最终指向 `Object.prototype`，而 `Object.prototype.[[Prototype]]` 是 `null`。`instanceof` 检查的正是构造函数的 `prototype` 是否出现在对象的原型链上。

## 总结

- **函数**：函数声明与函数表达式；函数声明整体提升，表达式不提升；参数按值传递，对象和数组的内部修改对外可见；`arguments` 是类数组；默认参数和剩余参数替代手工检查；箭头函数没有自己的 `this`。
- **闭包**：内部函数持有外部函数作用域，外部函数返回后变量仍然存活；循环中 `var` 共享同一环境是经典陷阱，函数工厂或 `let` 可以隔离。
- **面向对象**：属性查找沿 `[[Prototype]]` 链进行，赋值创建自有属性；构造函数通过 `prototype` 复用方法；`class` 是构造函数的语法糖，支持私有字段、访问器、静态成员和 `extends`/`super`。

## 参考

- [函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions)
- [闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Closures)
- [使用类](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_classes)
- [继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)

