---
uuid: ea4836f0-dc58-11f1-b979-f5869f5b7987
title: 2026-09-13-重学 JavaScript Vol.4 - 对象模型
mathjax: true
abbrlink: 50284
published: 2026-09-13 10:34:56
category: 前端
description: JavaScript 对象模型：原型链、构造函数、class、继承、属性描述符、Proxy/Reflect、Date/RegExp/Math
cover: 'https://pica.zhimg.com/80/v2-86e48ab9a79eb6d9833074d99268ce2a_1440w.webp'
tags:
  - 前端
  - JavaScript
---

这是「重学 JavaScript」系列的第四篇，讲原型链、类与继承、属性描述符、Proxy/Reflect 与标准对象。函数与闭包见第三篇，运行时见第五篇。

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

## 属性、描述符与元编程

### 属性描述符

对象的每个属性都有一组内部特性。数据属性由 `value`、`writable`、`enumerable`、`configurable` 描述；访问器属性由 `get`、`set`、`enumerable`、`configurable` 描述。

```js
const obj = { a: 1 }

Object.getOwnPropertyDescriptor(obj, 'a')
// {
//   value: 1,
//   writable: true,
//   enumerable: true,
//   configurable: true
// }
```

- `value`：属性的值。
- `writable`：是否可以通过赋值修改。
- `enumerable`：是否可以通过 `for...in`、`Object.keys()` 等枚举。
- `configurable`：是否可以删除、是否可以改成访问器属性、是否可以修改这些特性。

`Object.defineProperty()` 可以精确控制属性：

```js
const user = {}

Object.defineProperty(user, 'name', {
  value: 'Ada',
  writable: false,
  enumerable: true,
  configurable: false,
})

user.name = 'Bob' // 静默失败，严格模式下抛出 TypeError
console.log(user.name) // "Ada"
```

定义 getter/setter：

```js
const temperature = {
  celsius: 20,
  get fahrenheit() {
    return this.celsius * 1.8 + 32
  },
  set fahrenheit(value) {
    this.celsius = (value - 32) / 1.8
  },
}

console.log(temperature.fahrenheit) // 68
temperature.fahrenheit = 212
console.log(temperature.celsius) // 100
```

`Object.defineProperties()` 一次定义多个属性，`Object.getOwnPropertyDescriptors()` 一次读取所有自有属性的描述符。后者常与 `Object.create()` 组合，用来完整复制属性特性：

```js
const copy = Object.create(Object.getPrototypeOf(source), Object.getOwnPropertyDescriptors(source))
```

### 可枚举性与所有权

属性有两个维度：**可枚举性**（enumerable）和**所有权**（own vs inherited）。不同 API 覆盖的组合不同：

| API                                    | 可枚举自有   | 可枚举继承 | 不可枚举自有 | 不可枚举继承 |
| -------------------------------------- | ------------ | ---------- | ------------ | ------------ |
| `Object.keys()`/`values()`/`entries()` | ✅           | ❌         | ❌           | ❌           |
| `Object.getOwnPropertyNames()`         | ✅           | ❌         | ✅           | ❌           |
| `Object.getOwnPropertySymbols()`       | ✅（symbol） | ❌         | ✅（symbol） | ❌           |
| `Reflect.ownKeys()`                    | ✅           | ❌         | ✅           | ❌           |
| `for...in`                             | ✅           | ✅         | ❌           | ❌           |
| `in`                                   | ✅           | ✅         | ✅           | ✅           |

```js
const proto = { inherited: 1 }
const obj = Object.create(proto, {
  own: { value: 2, enumerable: true },
  hidden: { value: 3, enumerable: false },
})

Object.keys(obj) // ["own"]
Object.getOwnPropertyNames(obj) // ["own", "hidden"]
for (const key in obj) console.log(key) // "own", "inherited"
'hidden' in obj // true
```

对象展开和 `Object.assign()` 只复制可枚举的自有属性，因此会丢掉不可枚举属性和原型。需要完整复制时，使用 `Object.getOwnPropertyDescriptors()`。

### Proxy

`Proxy` 对象可以拦截某些操作并实现自定义行为。它接收两个参数：`target`（被代理的对象）和 `handler`（包含陷阱的对象）：

```js
const handler = {
  get(target, name) {
    return name in target ? target[name] : 42
  },
}

const p = new Proxy({}, handler)
p.a = 1

console.log(p.a, p.b) // 1, 42
```

常用陷阱包括：

- `get`/`set`：读取和写入属性。
- `has`：`in` 运算符。
- `deleteProperty`：`delete` 操作。
- `ownKeys`：`Object.keys()`、`Reflect.ownKeys()` 等。
- `apply`/`construct`：函数调用和 `new`。
- `getPrototypeOf`/`setPrototypeOf`：原型读取和设置。

代理必须遵守目标对象的不变式。例如，目标对象不可扩展时，`ownKeys` 不能返回不存在的键；不可配置属性不能被报告为可配置。违反不变式会抛出 `TypeError`。

`Proxy.revocable()` 创建一个可撤销的代理，调用 `revoke()` 后代理不再可用：

```js
const { proxy, revoke } = Proxy.revocable({}, {})
revoke()
proxy.a // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

### Reflect

`Reflect` 提供了一组与对象内部操作对应的方法，行为与语言内部算法一致。它常与 `Proxy` 配合，在陷阱中转发默认行为：

```js
const handler = {
  get(target, name, receiver) {
    console.log(`读取 ${String(name)}`)
    return Reflect.get(target, name, receiver)
  },
  set(target, name, value, receiver) {
    console.log(`写入 ${String(name)} = ${value}`)
    return Reflect.set(target, name, value, receiver)
  },
}

const p = new Proxy({}, handler)
p.a = 1
console.log(p.a)
```

`Reflect` 的常用方法包括 `Reflect.get()`、`Reflect.set()`、`Reflect.has()`、`Reflect.deleteProperty()`、`Reflect.ownKeys()`、`Reflect.apply()`、`Reflect.construct()`、`Reflect.defineProperty()`。

与直接操作对象相比，`Reflect` 的返回值更可预测：例如 `Reflect.defineProperty()` 返回布尔值而不是抛出异常，`Reflect.set()` 也返回布尔值。它适合在元编程中做“转发 + 增强”，而不是直接替代普通属性访问。

### 元编程的应用

`Proxy` 和 `Reflect` 常用于：

- 参数校验：在 `set` 陷阱中检查类型和范围。
- 日志与埋点：在 `get`/`set`/`apply` 中记录访问。
- 响应式系统：Vue 3 的 `reactive` 基于 `Proxy` 拦截读写。
- 默认值与只读视图：`get` 返回默认值，`set` 抛出错误。
- 虚拟对象：把属性访问转发到远程或懒加载的数据源。

元编程能力很强，但会隐藏真实的属性访问路径，调试和性能分析都会变复杂。框架和库适合使用，业务代码应谨慎。

## 标准对象

JavaScript 的标准库由一组内置对象组成。日常使用最多的是 `Date`、`RegExp` 和 `Math`；`JSON` 作为数据格式放在第二篇《数据结构与值》。

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

## 总结

- **面向对象**：属性查找沿 `[[Prototype]]` 链进行，赋值创建自有属性；构造函数通过 `prototype` 复用方法；`class` 支持私有字段、访问器、静态成员和 `extends`/`super`。
- **属性与描述符**：数据属性和访问器属性由 `value`/`writable`/`enumerable`/`configurable` 或 `get`/`set` 描述；`Object.defineProperty()` 可以精确控制属性行为。
- **可枚举性与所有权**：`Object.keys()` 只取可枚举自有属性，`getOwnPropertyNames()` 含不可枚举自有属性，`for...in` 会遍历原型链上的可枚举属性。
- **Proxy 与 Reflect**：`Proxy` 拦截对象操作，`Reflect` 转发默认行为；常用于校验、日志、响应式和虚拟对象。
- **标准对象**：`Date` 以毫秒数存储自纪元时间、月份从 0 开始；`RegExp` 用字面量或构造函数创建，`exec`/`test` 与 `String` 方法配合；`Math` 的三角函数使用弧度。

## 参考

- [使用类](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_classes)
- [继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)
- [属性的可枚举性和所有权](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties)
- [元编程](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Meta_programming)
- [表达日期与时间](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Representing_dates_times)
- [正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions)
- [数字与字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Numbers_and_strings)
