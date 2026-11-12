---
uuid: ea3dafa0-dc58-11f1-a740-7fa0f91f6d1d
title: 2026-09-11-重学 JavaScript Vol.2 - 数据结构与值
mathjax: true
abbrlink: 25474
published: 2026-09-11 10:34:56
category: 前端
description: JavaScript 数据结构与值：对象、数组、iterable、解构、Map/Set、JSON、拷贝与不变性、二进制与字符编码
cover: 'https://pica.zhimg.com/80/v2-86e48ab9a79eb6d9833074d99268ce2a_1440w.webp'
tags:
  - 前端
  - JavaScript
---

## 对象

### 对象与属性

JavaScript 中的对象是**键值对的集合**：每个属性有一个名字（键）和一个值。值可以是任意类型；当值是函数时，这个属性通常称为**方法**。

对象常用来描述现实世界中的实体。例如，用对象描述小明：

```js
const xiaoming = {
  name: '小明',
  birth: 1990,
  school: 'No.1 Middle School',
  height: 1.7,
  weight: 65,
  score: null,
}
```

对象字面量用 `{ ... }` 表示，键值对写成 `key: value`，多个键值对之间用逗号分隔。

属性可以看作挂在对象上的变量。访问属性有两种写法：

```js
objectName.propertyName // 点号：属性名必须是合法标识符
objectName['propertyName'] // 方括号：属性名可以是任意字符串或 Symbol
```

点号写法更简洁，日常使用最多；属性名包含空格、连字符、以数字开头或者需要运行时才能确定时，只能用方括号：

```js
const myCar = {}

myCar.make = 'Ford' // 点号
myCar.model = 'Mustang'

const key = 'year'
myCar[key] = 1969 // 键来自变量，只能用方括号
```

属性名是大小写敏感的，`myCar.make` 和 `myCar.Make` 是两个不同的属性。访问不存在的属性会得到 `undefined`，而不是 `null`；属性存在但值恰好是 `undefined` 时，读取结果一样，但它仍然是一个存在的属性：

```js
myCar.noProperty // undefined
```

对象有时也被称为**关联数组**，因为属性可以像数组下标一样用方括号访问。属性键只有两种类型：字符串和 `Symbol`；用方括号写其他类型的键时，会先转换成字符串：

```js
const myObj = {}
const str = 'myString'
const obj = {}

myObj.type = 'Dot syntax'
myObj['date created'] = 'String with space'
myObj[str] = 'String value' // 等价于 myObj['myString']
myObj[123] = 'Number key' // 等价于 myObj['123']
myObj[obj] = 'Object key' // 等价于 myObj['[object Object]']
myObj[''] = 'Empty string key'
```

把对象当作键时，JavaScript 会先把它转换成字符串（通常调用 `toString()`），再用结果作为键；上面的 `obj` 因此变成了 `'[object Object]'`。这也是普通对象不适合当字典的原因——不同的对象很容易转换成同一个字符串。

ES6 起，`Symbol` 也可以作为属性键。它不会被转换成字符串，只能用方括号访问：

```js
const id = Symbol('id')
myObj[id] = 123
myObj[id] // 123
```

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

> JS 的 new 到底是干什么的？ https://zhuanlan.zhihu.com/p/23987456

```
new的过程：
① 创建一个全新的空对象：{}
② 把该对象的原型指向构造函数的 prototype
③ 把 this 绑定到这个新对象，执行构造函数体
④ 返回这个新对象（如果构造函数没显式 return 对象的话）
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

### 枚举属性

有三种原生的方法用于列出或枚举对象的属性：

- `for...in` 循环：该方法依次访问一个对象及其原型链中所有可枚举的属性。
- `Object.keys(obj)`：该方法返回对象 `obj` 自身包含（不包括原型中）的所有可枚举属性的名称的数组。
- `Object.getOwnPropertyNames(obj)`：该方法返回对象 `obj` 自身包含（不包括原型中）的所有属性（无论是否可枚举）的名称的数组。

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

`this` 在一个方法中指调用的对象。当与 `form` 属性一起使用时，`this` 可以指代当前对象的父窗体。在下面的例子中，窗体 `myForm` 包含一个 `Text` 对象和一个按钮，当用户点击按键，`Text` 对象的值被设为窗体的名称。按钮的 `onclick` 事件处理器使用 `this.form` 以指代其父窗体，即 `myForm`：

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

一个 **getter** 是一个获取某个特定属性的值的方法。一个 **setter** 是一个设定某个属性的值的方法。可以为预定义的或用户定义的对象定义 getter 和 setter 以支持新增的属性。定义 getter 和 setter 的语法采用对象字面量语法。下面例子描述了 getter 和 setter 是如何为用户定义的对象 `o` 工作的：

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

### 原型与原型链

> 在编程中，继承是指将特性从父代传递给子代，以便新代码可以重用并基于现有代码的特性进行构建。JavaScript 使用对象实现继承。每个对象都有一条链接到另一个称作原型的对象的内部链。该原型对象有自己的原型，依此类推，直到原型是 null 的对象。根据定义，null 没有原型，并作为这条原型链中最后的一环。在运行时修改原型链的任何成员、甚至是换掉原型都是可能的，所以像静态分派这样的概念在 JavaScript 中不存在。
> 对于有基于类的语言（如 Java 或 C++）经验的开发者来说，JavaScript 有些令人困惑——因为它是动态的并且没有静态类型。尽管这个困惑通常被认为是 JavaScript 的弱点之一，但是原型继承模型实际上比类式模型更强大。例如，在原型模型的基础上构建类式模型（即类的实现方式）相当简单。
> 尽管类现在被广泛使用并成为 JavaScript 中新的范式，但是类并没有引入新的继承模式。尽管类抽象掉了大部分的原型机制，但是理解原型的底层工作机制仍然十分有用。
>
> https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain

在 JavaScript 中，原型（prototype）是一个非常重要的概念，它为对象提供了继承和共享属性的机制。每个 JavaScript 对象都有一个与之关联的原型对象，通过原型对象，可以实现属性和方法的共享，从而减少内存占用。

所有的 JavaScript 对象都会从一个 prototype（原型对象）中继承属性和方法。

#### 原型（prototype）

原型是一个对象，它是其他对象的模板或蓝图。
当一个对象试图访问一个属性或方法时，如果在该对象自身没有找到，JavaScript 会沿着原型链向上查找，直到找到对应的属性或方法，或者达到原型链的顶端 null 为止。

每个 JavaScript 对象（除了 null）都自动拥有一个隐藏的属性 `__proto__`，它指向该对象的原型对象。这个 `__proto__` 是实现继承的关键：

```js
let obj = {}
console.log(obj.__proto__) // 输出: [object Object], 即 obj 的原型是 Object.prototype
```

`__proto__` 是浏览器先行实现、后来收进 ES 的历史访问器，不属于推荐写法。

现代代码应改用标准的 `Object.getPrototypeOf()` / `Object.setPrototypeOf()`。

#### 构造函数与原型

构造函数负责批量创建对象，并写入每个实例独有的数据：

```js
// 这里 Person 是构造函数
function Person(first, last, age, eyeColor) {
  this.firstName = first
  this.lastName = last
  this.age = age
  this.eyeColor = eyeColor
}

// new Person(...) 在这里创建了两个独立对象 myFather 和 myMother
const myFather = new Person('John', 'Doe', 50, 'blue')
const myMother = new Person('Sally', 'Rally', 48, 'green')
```

现在这里的每个实例都自带一份完整的属性。

现在要为 `Person` 创建一个方法，名为 `sayHello`，假设把它放进构造函数：

```js
function Person(name) {
  this.name = name
  this.sayHello = function () {
    console.log(`Hello, my name is ${this.name}`)
  }
}

const a = new Person('Alice')
const b = new Person('Bob')

a.sayHello === b.sayHello // 这里会为 false，说明两个实例拿到的是两个独立函数
```

每个实例都会创建一份新的 `sayHello` 函数，1000 个实例就有 1000 份相同代码，浪费内存。

原型机制解决的正是这种重复，实现让所有实例共享方法。`sayHello` 只存在 Person.prototype 上一份，所有实例通过原型链共享它。

```js
function Person(name) {
  this.name = name // 实例自有属性
}

Person.prototype.sayHello = function () {
  console.log(`Hello, my name is ${this.name}`)
}

const alice = new Person('Alice')
const bob = new Person('Bob')

// 这里查找 alice.sayHello 的过程：
// ① alice 自身有没有 sayHello？→ 没有
// ② 去 alice 的原型 Person.prototype 找，并且找到了 sayHello
// ③ 调用它，this 指向 alice
alice.sayHello() // Hello, my name is Alice
bob.sayHello() // Hello, my name is Bob

console.log(alice.sayHello === bob.sayHello) // true -> 所有实例共享了这个 sayHello 方法
console.log(alice.hasOwnProperty('sayHello')) // false -> alice 自身有没有 sayHello 方法
console.log(Object.getPrototypeOf(alice) === Person.prototype)
// true -> 去 alice 的原型 Person.prototype 找，并且找到了 sayHello
console.log(Person.prototype.constructor === Person)
// true -> 构造函数创建时，JS 引擎自动给 Person.prototype 加了一个 constructor 属性，指回构造函数本身
```

换言之，原型机制把「每个实例各存一份公共行为」改成「所有实例沿原型链指向同一份」。比如数组的 `map`、对象的 `toString` 都挂在各自的 `Array.prototype`、`Object.prototype` 上。

现代前端中一般会用 class 语法糖或函数组件，很少手写构造函数 + 原型（Person.prototype.sayHello），不过了解后者有助于理解原型机制。

#### 原型链（prototype chain）

在 JavaScript 中，对象通过**原型链**来实现继承。当一个对象尝试访问一个属性或方法时，JavaScript 会首先检查该对象自身是否有这个属性或方法。如果没有，它会沿着原型链向上查找，直到找到同名属性或抵达 `null`：

```js
const obj = {}
console.log(obj.toString()) // [object Object]
```

`obj` 自身没有 `toString`，最终在 `Object.prototype` 上找到。内置对象同样挂在这条链上：

- `Date` 实例 → `Date.prototype` → `Object.prototype` → `null`
- `Array` 实例 → `Array.prototype` → `Object.prototype` → `null`
- `Person` 实例 → `Person.prototype` → `Object.prototype` → `null`

属性查找就沿这些箭头逐级深入，任意一层找到同名属性就停止；整条链都没有，才返回 `undefined`。

#### 修改原型

原型是普通对象，可以随时增删属性，所有已存在的实例都会立即看到变化：

下面给 Person.prototype 新增了一个 sayGoodbye 方法，而 bob 通过原型链访问到了它

```js
function Person(name) {
  this.name = name
}

Person.prototype.sayHello = function () {
  console.log('Hello, my name is ' + this.name)
}

let bob = new Person('Bob')
bob.sayHello() // 输出: Hello, my name is Bob

// 修改原型，新增了一个 sayGoodbye 方法
Person.prototype.sayGoodbye = function () {
  console.log('Goodbye from ' + this.name)
}

bob.sayGoodbye() // 输出: Goodbye from Bob
```

#### Object.create

Object.create 方法允许开发者创建一个新对象，并将其原型设置为指定的对象。

```js
let personPrototype = {
  sayHello: function () {
    console.log('Hello, my name is ' + this.name)
  },
}

let alice = Object.create(personPrototype)
alice.name = 'Alice'
alice.sayHello() // 输出: Hello, my name is Alice
```

这里 alice 的原型是 personPrototype，因此 alice 对象可以访问 sayHello 方法。

## 数组

> 关于数组更详细的说明推荐看这篇：https://www.yuque.com/cuggz/feplus/cp4k8o

![JS数组](https://pica.zhimg.com/v2-91cae2b7e99306e982b26d4c6bc38098_r.jpg)

### 数组与索引

数组是 JavaScript 中最常用的数据结构之一：它由一组有序的值构成，每个值都通过一个从 0 开始的整数索引来访问。例如，emp 数组以雇员编号为索引存放姓名：emp[0] 是 0 号员工的姓名，emp[1] 是 1 号员工的姓名，依此类推。

JavaScript 并没有独立的数组原始类型,数组是内置 Array 构造函数的实例，本质上是“以整数索引为属性名”的对象，只是在此之上额外提供了 length 属性和一组操作元素的方法（连接、反转、排序、遍历等）。

与许多静态类型语言不同，数组的每个位置都可以存放任意类型的值，长度也会随元素的增删而变化。因为数组本质上是对象，`typeof []` 返回的是 "object"，要可靠地判断一个值是否为数组，应使用 `Array.isArray(value)`。

```js
const a = [1, 'two', { three: 3 }, [4]]
a.length // 4

Array.isArray(a) // true
typeof a // "object"
```

ES2015 起，可以使用展开语法（spread syntax，`...`）把数组元素展开到新的数组字面量或其他可迭代上下文中：

```js
const a = [1, 2, 3]
const b = [0, ...a, 4] // [0, 1, 2, 3, 4]
```

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

console.log(emp) // [ 'Casey Jones', 'Phil Lesh', 'August West' ]
```

如果给数组运算符的是一个非整型数值，那么它将作为一个表示数组的对象的属性创建，而不是数组的元素：

```js
const arr = []
arr[3.4] = 'Oranges'

console.log(arr) // [ '3.4': 'Oranges' ]
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

`Array` 的方法按用途可以分为以下几类。

#### 原地修改（增删、排序与反转）

`push()` 方法在数组末尾添加一个或多个元素，并返回数组操作后的 `length`。`pop()` 方法从数组移出最后一个元素，并返回该元素。`shift()` 方法从数组移出第一个元素，并返回该元素。`unshift()` 方法在数组开头添加一个或多个元素，并返回数组的新长度：

```js
const myArray = ['1', '2']
myArray.push('3') // myArray 现在是 ["1", "2", "3"]
const last = myArray.pop() // myArray 现在是 ["1", "2"]，last 为 "3"

const first = myArray.shift() // myArray 现在是 ["2"]，first 为 "1"
myArray.unshift('4', '5')
// myArray 变成了 ["4", "5", "2"]
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

> (另外这个排序算法是稳定的（ECMAScript 规范），因引擎而异，如V8是 Timsort 算法)

#### 访问与查找

`at()` 方法返回数组中指定索引处的元素，如果索引超出范围，则返回 `undefined`。它主要用于从数组末尾访问元素的负下标：

```js
const myArray = ['a', 'b', 'c', 'd', 'e']
myArray.at(-2) // "d"，myArray 的倒数第二个元素
```

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

#### 截取、拼接与展平（返回新数组）

`slice()` 方法从数组提取一个片段，并作为一个新数组返回。第二个参数是结束索引，但不包含该索引处的元素：

```js
let myArray = ['a', 'b', 'c', 'd', 'e']
myArray = myArray.slice(1, 4) // [ "b", "c", "d"]
// 起始索引 1，结束索引 4（不含），所以取索引 1、2、3
```

`concat()` 方法连接两个或多个数组并返回一个新的数组：

```js
let myArray = ['1', '2', '3']
myArray = myArray.concat('a', 'b', 'c')
// myArray 现在是 ["1", "2", "3", "a", "b", "c"]
```

`flat()` 方法返回一个新数组，所有子数组元素递归地连接到其中，直到指定的深度：

```js
let myArray = [1, 2, [3, 4]]
myArray = myArray.flat()
// myArray 现在是 [1, 2, 3, 4]，因为子数组 [3, 4] 已被展平
```

`flatMap()` 方法先执行 `map()`，再执行深度为 1 的 `flat()`：

```js
const a1 = ['a', 'b', 'c']
const a2 = a1.map((item) => [item.toUpperCase(), item.toLowerCase()])
const a3 = a1.flatMap((item) => [item.toUpperCase(), item.toLowerCase()])

console.log(a2) // [ [ 'A', 'a' ], [ 'B', 'b' ], [ 'C', 'c' ] ]
console.log(a3) // ['A', 'a', 'B', 'b', 'C', 'c']
```

#### 迭代方法

`find()` 方法返回 `callback` 返回 `true` 的第一个元素；`findLast()` 返回最后一个元素；`findIndex()` 返回第一个元素的索引；`findLastIndex()` 返回最后一个元素的索引：

```js
function callback(item) {
  return typeof item === 'number'
}

const a1 = ['a', 10, 'b', 20, 'c', 30]
console.log(a1.find(callback)) // 10
console.log(a1.findLast(callback)) // 30
console.log(a1.findIndex(callback)) // 1
console.log(a1.findLastIndex(callback)) // 5
```

如果 `callback` 对数组中的每一个元素都返回 `true`，则 `every()` 方法返回 `true`。如果 `callback` 对数组中至少一个元素返回 `true`，则 `some()` 方法返回 `true`：

```js
function callback(value) {
  return typeof value === 'number'
}
const a1 = [1, 2, 3]
console.log(a1.every(callback)) // true
const a2 = [1, '2', 3]
console.log(a2.every(callback)) // false
console.log(a2.some(callback)) // true
```

`filter()` 方法返回一个新数组，其中包含 `callback` 返回 `true` 的元素：

```js
function callback(item) {
  return typeof item === 'number'
}

const a1 = ['a', 10, 'b', 20, 'c', 30]
const a2 = a1.filter(callback)
console.log(a2) // [10, 20, 30]
```

> map/reduce 的概念可以参考 Google 的知名论文 [MapReduce: Simplified Data Processing on Large Clusters](https://pdos.csail.mit.edu/6.824/papers/mapreduce.pdf)
>
> 简单说就是 map 把每个元素变成新的值，输出等长新数组；reduce 把所有元素聚合成一个结果，输出一个值

`map()` 方法返回由每个数组元素上执行 `callback` 的返回值所组成的新数组：

举例说明，比如我们有一个函数f(x)=x * x，要把这个函数作用在一个数组[1, 2, 3, 4, 5, 6, 7, 8, 9]上，就可以用map实现如下：

<img src='https://pic4.zhimg.com/80/v2-0a9e037a6dd6bede5e958e6d40fefae7_1440w.webp' style='width:300px ; margin-left: 0;'>

```js
function callback(x) {
  return x * x
}

let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
let results = arr.map(callback) // [1, 4, 9, 16, 25, 36, 49, 64, 81]
console.log(results)
```

`reduce()` 方法对数组中的每个值执行 `callback(accumulator, currentValue, currentIndex, Array)`，把整个数组归约成一个值，并返回最后一次 `callback` 调用的结果。

我个人理解是`reduce()`把结果继续和序列的下一个元素做累积计算，其效果就是：

```js
[x1, x2, x3, x4].reduce(f) = f(f(f(x1, x2), x3), x4)
```

最常见的用法是求和：

```js
function callback(accumulator, currentValue) {
  return accumulator + currentValue
}

const arr = [1, 3, 5, 7, 9]
console.log(arr.reduce(callback, 0)) // 25
```

第二个参数`0`是初始值（`initialValue`），它决定第一次调用回调时 `accumulator` 从什么开始：

- **传了初始值**：相当于在数组最前面插入这个值。第一次调用是 `callback(initialValue, arr[0])`，之后每次用上一次的返回值作为 `accumulator`，回调共执行 `arr.length` 次。
- **没传初始值**：把 `arr[0]` 直接当作 `accumulator`。第一次调用是 `callback(arr[0], arr[1])`，之后同理，回调共执行 `arr.length - 1` 次。

如果数组为空且没有初始值，`reduce()` 会抛出 `TypeError`；传入初始值则直接返回它。

`reduceRight()` 方法的工作原理类似于 `reduce()`，但从最后一个元素开始。`reduce` 和 `reduceRight` 是迭代数组方法中最不被人熟知的两个函数。它们应该使用在那些需要把数组的元素两两递归处理，并最终计算成一个单一结果的算法。

接受回调的 `forEach`、`map`、`filter` 等方法被称为**迭代方法**，因为它们以某种方式遍历整个数组。每个都接受第二个可选的参数 `thisArg`。如果提供，`thisArg` 将成为回调函数体中 `this` 关键字的值。`sort()` 不是迭代方法，因为它的回调函数只用于比较，不能基于元素顺序以任何特定顺序调用，也不接受 `thisArg` 形参。

#### 转换为字符串

`join()` 方法将数组中的所有元素连接成一个字符串：

```js
const myArray = ['Wind', 'Rain', 'Fire']
const list = myArray.join(' - ') // list 现在是 "Wind - Rain - Fire"
```

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

## 可迭代对象（iterable）

**迭代**，就是按顺序逐个访问集合中的元素。在 ES6 之前，只能靠"索引 + 循环"手动完成这件事，这时需初始化一个变量来记录每一次迭代在数据集合中的位置：

```js
let a = ['aaa', 'bbb', 'ccc']
// 这里变量 i 的唯一作用就是记录当前迭代到了集合的哪个位置，手动管理迭代状态
for (let i = 0; i < a.length; i++) {
  console.log(a[i])
}
```

索引式遍历存在局限：遍历逻辑和数据结构强绑定，换一种结构（如 Set、Map）就要重写；同时暴露了细节，调用方必须知道"怎么取下标、怎么取下一个"。

ES6 把"能否被遍历"抽象成了一个标准协议：**可迭代协议（Iterable Protocol）**。实现了这个协议的对象叫**可迭代对象**，可以用 `for...of`、展开运算符 `...`、解构和 `Array.from` 等统一语法来消费。

```js
const arr = [10, 20, 30]
for (let item of arr) {
  console.log(item)
}
// 输出：10, 20, 30
```

`for...of` 能运行的原因，就是数组实现了可迭代协议。这套协议让迭代状态（取到了第几个、取完了没有）由对象自己内部维护，调用方不再需要手动管理下标。

### 迭代器

在 JavaScript 中，**迭代器**是一个通过 `next()` 方法实现迭代器协议的对象，它定义一个序列，并在终止时可能附带一个返回值。`next()` 返回一个具有两个属性的对象：

- `value`：迭代序列的下一个值。
- `done`：如果已经迭代到序列中的最后一个值，则它为 `true`，否则为 `false`。`done` 为 `true` 时，`value` 就是迭代器的返回值（没有返回值时为 `undefined`）。

一旦创建，迭代器对象可以通过重复调用 `next()` 显式地迭代。迭代一个迭代器被称为消耗了这个迭代器，因为它通常只能执行一次：在产生终值后，对 `next()` 的额外调用应该继续返回 `{done: true}`。

ES5 实现一个迭代器：

```js
function myIterator(list) {
  var i = 0
  return {
    next: function () {
      var done = i >= list.length
      var value = !done ? list[i++] : undefined
      return {
        done: done,
        value: value,
      }
    },
  }
}

const iterator = myIterator([1, 2, 3])
// 它返回的对象有 next() 方法，符合迭代器协议，所以它是一个迭代器。
// 在这个手动实现的"迭代器"中，通过 `next()` 方法逐个产出值
iterator.next() // "{done: false, value: 1}"
iterator.next() // "{done: false, value: 2}"
iterator.next() // "{done: false, value: 3}"
iterator.next() // "{done: true, value: undefined}"
// 以后的调用都一样
iterator.next() // "{done: true, value: undefined}"
```

从上面代码可以看出，手写迭代器比较麻烦，而 ES6 新增的生成器可以更简单地创建迭代器对象。

此外，这个 `iterator` 只是迭代器，不是可迭代对象，因为它没有 `[Symbol.iterator]` 方法：

```js
const iter = myIterator([1, 2, 3])

// ❌ 不能用 for...of，因为没实现可迭代协议
for (const n of iter) {
} // TypeError

// ❌ 不能展开
;[...iter] // TypeError
```

### 可迭代对象

可迭代协议的判定标准是：对象自身或原型链上存在 `Symbol.iterator` 属性，且该属性的值是一个函数，调用后返回一个迭代器：

```js
const str = 'Hi'
console.log(str[Symbol.iterator]) // [Function: [Symbol.iterator]]

for (const ch of str) {
  console.log(ch) // H i
}
```

常见的可迭代对象：

- `Array`
- `String`
- `Map`
- `Set`
- `TypedArray`
- `arguments` 对象
- DOM 集合（如 `NodeList`）

相反，普通对象没有默认的迭代行为，不能直接用于 `for...of`：

```js
const plain = { a: 1, b: 2 }
console.log(plain[Symbol.iterator]) // undefined，没有默认的迭代行为

try {
  for (const value of plain) {
    console.log(value)
  }
} catch (error) {
  console.log(error.name, error.message) // TypeError plain is not iterable
}
```

照着迭代器协议补上 `[Symbol.iterator]()`，普通对象也能变成可迭代对象。下面的 `range` 在 `[Symbol.iterator]()` 里直接返回一个带 `next()` 的迭代器：

```js
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from
    const last = this.to
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { value: undefined, done: true }
      },
    }
  },
}

console.log([...range]) // [1, 2, 3, 4, 5]
for (const n of range) {
  console.log(n) // 1 2 3 4 5
}

const [first, second] = range
console.log(first, second) // 1 2
console.log(range[Symbol.iterator]() === range[Symbol.iterator]()) // false
```

展开、`for...of` 和解构都会调用 `[Symbol.iterator]()`；每次调用返回一个新的迭代器对象（最后一行比较为 `false`），所以 `range` 可以反复迭代。

### 生成器

生成器是一个特殊的函数，使用 `function*` 定义，调用后返回一个生成器对象。

普通函数遵循运行至完成（run-to-completion）模型：一旦调用，就会一直执行到 `return`、函数结束或抛出异常，中途不能暂停。

生成器函数不遵循这个模型——调用它时函数体并不执行，执行由 `next()` 驱动：每次调用 `next()`，函数体执行到下一个 `yield` 并暂停，`yield` 后面的值作为 `{ value, done: false }` 返回；暂停期间的局部变量和执行位置都会保留，下一次 `next()` 从暂停处继续。

```js
function* generateSequence() {
  yield 1
  yield 2
  yield 3
}
let sequence = generateSequence()
sequence.next() // "{done: false, value: 1}"
sequence.next() // "{done: false, value: 2}"
sequence.next() // "{done: false, value: 3}"
sequence.next() // "{done: true, value: undefined}"
// 以后的调用都一样
sequence.next() // "{done: true, value: undefined}"
```

把 `yield` 放进循环，暂停时循环变量的状态会被保留，下一次 `next()` 从原处继续，因此可以按需产出整个序列：

```js
function* generateRange(start = 0, end = Infinity, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i
  }
}

const numbers = generateRange(1, 10, 2)
numbers.next() // { done: false, value: 1 }
numbers.next() // { done: false, value: 3 }
```

它和前面的 `myIterator` 思路相同：都由 `next()` 逐个产出值；区别是生成器不需要手动维护 `i`、`list.length` 这些状态，暂停和恢复由引擎负责，因此还能表示无限序列。

`yield*` 可以把另一个可迭代对象的值逐个转交给当前生成器：

```js
function* gen() {
  yield* ['a', 'b', 'c']
}

console.log(gen().next()) // { value: 'a', done: false }
console.log([...gen()]) // ['a', 'b', 'c']
```

生成器对象同时满足两个协议：它有 `next()`，是迭代器；它的 `[Symbol.iterator]()` 返回自身，所以也是可迭代对象，可以直接用于 `for...of`、展开和解构：

```js
const it = generateSequence()

console.log(it[Symbol.iterator]() === it) // true

// 同一个生成器对象只能迭代一次
// 把可迭代对象 it 里的所有值逐个取出来，放进一个新数组
console.log([...it]) // [1, 2, 3]
console.log([...it]) // []

// 重新调用函数，拿到新的生成器对象，可以再迭代一次
console.log([...generateSequence()]) // [1, 2, 3]
console.log([...generateSequence()]) // [1, 2, 3]
```

第一次展开得到 `[1, 2, 3]`；第二次是空数组，因为 `[Symbol.iterator]()` 返回的就是 `it` 自己，而这个生成器已经被消耗完。只能迭代一次的可迭代对象通常都这样实现；需要重复迭代时，让 `[Symbol.iterator]()` 每次返回一个新的生成器。

### 自定义的可迭代对象

自定义可迭代对象最简洁的写法，是直接把 `[Symbol.iterator]` 写成生成器方法：

```js
const myIterable = {
  // 生成器方法
  [Symbol.iterator]: function* () {
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

console.log([...myIterable]) // [1, 2, 3]
```

## 解构赋值

解构语法是一种 JavaScript 语法，可以将数组中的值或对象的属性取出，赋值给其他变量。它可以在接收数据的位置使用，例如赋值的左侧或创建新标识符绑定的任何位置。

```js
let a, b, rest
;[a, b] = [10, 20]
// a = 10, b = 20

;[a, b, ...rest] = [10, 20, 30, 40, 50]
// rest = [30, 40, 50]
```

### 数组解构

数组解构按位置取值，可以跳过元素、设置默认值、收集剩余元素：

```js
const arr = [1, 2, 3]
const [first, second, third] = arr
// first = 1, second = 2, third = 3

const [x, , z] = arr
// x = 1, z = 3

const [p = 10, q = 20] = [1]
// p = 1, q = 20

const [head, ...tail] = arr
// head = 1, tail = [2, 3]
```

交换变量不需要中间变量：

```js
let a = 1
let b = 2
;[a, b] = [b, a]
// a = 2, b = 1
```

数组解构不只用于数组，任何可迭代对象都可以：

```js
const [firstChar, secondChar] = 'ab'
// firstChar = "a", secondChar = "b"

const [one, two] = new Set([1, 2])
```

### 对象解构

对象解构按属性名取值，可以与变量名不同，也可以设置默认值：

```js
const obj = { a: 1, b: 2, c: 3 }
const { a, b, c } = obj
// a = 1, b = 2, c = 3

const { a: x, b: y } = obj
// x = 1, y = 2

const { a: p = 10, d = 20 } = obj
// p = 1, d = 20
```

默认值只在属性不存在或值为 `undefined` 时生效；值为 `null` 时不使用默认值：

```js
const [a = 1] = []
const { b = 2 } = { b: undefined }
const { c = 2 } = { c: null }
// a = 1, b = 2, c = null
```

剩余属性收集对象剩余的可枚举自有属性：

```js
const { a, ...others } = { a: 1, b: 2, c: 3 }
// a = 1, others = { b: 2, c: 3 }
```

剩余属性必须是模式中的最后一个，并且不能有尾随逗号。

### 嵌套解构

数组和对象可以任意嵌套：

```js
const user = {
  name: 'Ada',
  address: { city: 'London', zip: 'N1' },
  hobbies: ['math', 'code'],
}

const {
  name,
  address: { city },
  hobbies: [firstHobby],
} = user
// name = "Ada", city = "London", firstHobby = "math"
```

解构对象时会沿着原型链查找属性：

```js
const base = { inherited: 1 }
const child = Object.create(base)
child.own = 2

const { inherited, own } = child
// inherited = 1, own = 2
```

### 函数参数解构

解构可以直接用在函数参数上，常用于配置对象：

```js
function draw({ x = 0, y = 0, size = 10 }) {
  console.log(x, y, size)
}

draw({ x: 1, size: 20 })
// 1 0 20
```

也可以和默认参数组合：

```js
function connect({ host = 'localhost', port = 80 } = {}) {
  return `${host}:${port}`
}

connect() // "localhost:80"
```

### 循环中的解构

`for...of` 可以直接解构每个元素，尤其是 `Map` 的 `[key, value]`：

```js
for (const [key, value] of new Map([
  ['a', 1],
  ['b', 2],
])) {
  console.log(key, value)
}
```

### 绑定模式与赋值模式

解构有两种模式：绑定模式和赋值模式。

绑定模式以声明关键字（`var`、`let` 或 `const`）开始，每个属性必须绑定到一个变量或继续解构：

```js
const obj = { a: 1, b: { c: 2 } }
const {
  a,
  b: { c: d },
} = obj
// 变量 a 和 d 被绑定
```

赋值模式不以关键字开头，每个解构属性被赋值给一个已存在的目标：

```js
const numbers = []
const obj = { a: 1, b: 2 }
;({ a: numbers[0], b: numbers[1] } = obj)
// numbers = [1, 2]
```

使用对象字面量解构而不带声明时，赋值语句周围必须添加括号 `( ... )`，否则左侧的 `{ a, b }` 会被当成块语句。在无分号风格中，括号表达式前面需要补一个分号。

## Map 和 Set

### Map

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
const mySet2 = new Set([1, 2, 3, 4])

console.log(Array.from(mySet)) // [1, "some text"]
console.log([...mySet2]) // [1, 2, 3, 4]
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

## JSON

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

## 拷贝与不变性

### 值与引用

原始值（字符串、数字、布尔、`null`、`undefined`、Symbol、BigInt）按值访问和复制；对象（包括数组、函数、`Map`、`Set`）按引用访问。赋值一个对象，只是复制了指向同一块内存的引用：

```js
const a = { x: 1 }
const b = a
b.x = 2
console.log(a.x) // 2
```

判断两个对象是否相等时，`===` 比较的是引用，而不是结构：

```js
const p = { x: 1 }
const q = { x: 1 }
p === q // false
p === p // true
```

### 浅拷贝

浅拷贝创建一个新对象，但只复制第一层属性；嵌套对象仍然共享引用：

```js
const original = { a: 1, nested: { b: 2 } }

const copy1 = { ...original }
const copy2 = Object.assign({}, original)

copy1.a = 10
copy1.nested.b = 20

console.log(original.a) // 1
console.log(original.nested.b) // 20
```

数组的浅拷贝可以用展开语法、`slice()` 或 `Array.from()`：

```js
const arr = [1, 2, 3]
const arrCopy = [...arr]
const arrCopy2 = arr.slice()
```

浅拷贝适合“只改第一层”的场景。需要完全独立的数据结构时，必须使用深拷贝。

### 深拷贝

深拷贝递归复制所有层级。常见做法有三种。

**JSON 序列化**：`JSON.parse(JSON.stringify(value))`。它简单，但限制很多：

- 会丢失 `undefined`、函数、Symbol；
- `Date` 会变成字符串；
- `Map`、`Set` 会变成 `{}`；
- 循环引用会抛出 `TypeError`；
- `NaN` 和 `Infinity` 会变成 `null`。

```js
const original = { date: new Date(), fn() {} }
const copy = JSON.parse(JSON.stringify(original))
// copy.date 是字符串，copy.fn 丢失
```

**`structuredClone()`** 是平台提供的结构化克隆算法，支持循环引用、`Date`、`RegExp`、`Map`、`Set`、`ArrayBuffer`、TypedArray 等，但仍然不能克隆函数、Symbol、DOM 节点和原型链：

```js
const original = {
  date: new Date(),
  map: new Map([['a', 1]]),
  nested: { value: 2 },
}
original.self = original

const copy = structuredClone(original)
console.log(copy.self === copy) // true
console.log(copy.date instanceof Date) // true
```

**手写递归**：适合需要保留原型、函数或自定义克隆逻辑的场景。基本思路是递归处理数组和对象，并用 `WeakMap` 记录已经克隆过的对象，避免循环引用导致无限递归。

```js
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value)

  const copy = Array.isArray(value) ? [] : {}
  seen.set(value, copy)

  for (const key of Reflect.ownKeys(value)) {
    copy[key] = deepClone(value[key], seen)
  }

  return copy
}
```

### 对象不变性

`const` 只阻止变量重新赋值，不阻止对象内容被修改：

```js
const config = { debug: true }
config.debug = false // 允许
```

JavaScript 提供三个逐级增强的完整性保护方法：

- `Object.preventExtensions(obj)`：禁止添加新属性，已有属性仍可修改和删除。
- `Object.seal(obj)`：禁止添加和删除属性，已有属性仍可修改。
- `Object.freeze(obj)`：禁止添加、删除和修改属性，是最高级别的保护。

```js
const obj = { a: 1 }

Object.preventExtensions(obj)
obj.b = 2 // 静默失败，严格模式下抛出 TypeError
console.log(obj) // { a: 1 }

Object.seal(obj)
delete obj.a // 静默失败，严格模式下抛出 TypeError

Object.freeze(obj)
obj.a = 2 // 静默失败，严格模式下抛出 TypeError
```

对应的检查方法：

```js
Object.isExtensible(obj) // false
Object.isSealed(obj) // true
Object.isFrozen(obj) // true
```

`Object.freeze()` 是浅冻结：嵌套对象仍然可以修改，需要递归冻结：

```js
function deepFreeze(obj) {
  for (const key of Reflect.ownKeys(obj)) {
    const value = obj[key]
    if (value && typeof value === 'object') deepFreeze(value)
  }
  return Object.freeze(obj)
}
```

访问器属性（getter/setter）不会被冻结成只读：getter 返回的值仍可能变化，setter 仍会被调用。冻结一个含有元素的 TypedArray 或 DataView 会抛出 `TypeError`，因为它们是内存视图。

## 二进制与字符编码

### 位运算

位运算符把操作数视为 32 位二进制串，运算后再返回标准的 JavaScript 数值：

| 运算符 | 用法      | 含义                                   |
| ------ | --------- | -------------------------------------- |
| `&`    | `a & b`   | 按位与，对应位都为 1 才返回 1          |
| `\|`   | `a \| b`  | 按位或，对应位只要有一个为 1 就返回 1  |
| `^`    | `a ^ b`   | 按位异或，对应位不同返回 1，相同返回 0 |
| `~`    | `~a`      | 按位非，反转所有位                     |
| `<<`   | `a << b`  | 左移，右侧补 0                         |
| `>>`   | `a >> b`  | 算术右移，左侧用符号位填充             |
| `>>>`  | `a >>> b` | 无符号右移，左侧补 0                   |

```js
15 & 9 // 9   (1111 & 1001 = 1001)
15 | 9 // 15  (1111 | 1001 = 1111)
15 ^ 9 // 6   (1111 ^ 1001 = 0110)
~15 // -16
9 << 2 // 36
;(9 >>
  (2 - // 2
    9)) >>
  2 // -3
19 >>> 2 // 4
```

位运算只对 32 位整数有效，超过 32 位的部分会被截断。超过 32 位的大整数应使用 `BigInt` 的位运算，`BigInt` 不支持 `>>>`。

### ArrayBuffer 与视图

二进制数据的底层是缓冲。`ArrayBuffer` 是一块内存的低级表示，不能直接读写；`SharedArrayBuffer` 可以被多个执行上下文共享。要访问缓冲中的内存，需要使用视图。

缓冲支持分配、复制、转移和调整大小：

```js
const buffer = new ArrayBuffer(16) // 分配 16 字节，初始化为 0
console.log(buffer.byteLength) // 16

const copy = buffer.slice(0, 8) // 复制前 8 字节
const moved = buffer.transfer() // 转移所有权，原 buffer 不再可用
```

视图有两种：

- **TypedArray**：`Int8Array`、`Uint8Array`、`Uint8ClampedArray`、`Int16Array`、`Uint16Array`、`Int32Array`、`Uint32Array`、`Float32Array`、`Float64Array`、`BigInt64Array`、`BigUint64Array`。它们提供与普通数组类似的方法，但长度固定。
- **DataView**：更底层的接口，可以在任意偏移量读写不同类型的数据，并显式控制字节序。

```js
const buffer = new ArrayBuffer(8)
const view = new Uint8Array(buffer)
view[0] = 255
view[1] = 128
console.log(view) // Uint8Array [255, 128, 0, 0, 0, 0, 0, 0]

const dataView = new DataView(buffer)
dataView.setInt16(0, 258, true) // 小端序写入
console.log(dataView.getInt16(0, true)) // 258
```

TypedArray 不支持 `push()`、`pop()`、`splice()` 等改变长度的方法，因为底层缓冲长度固定；`set()` 和 `subarray()` 用于在同一缓冲上高效读写和创建子视图。

### 字符编码

JavaScript 字符串以 UTF-16 码元序列存储。每个码元是 16 位无符号整数，字符串的 `length` 是码元数量，不一定等于 Unicode 字符数量。超出 BMP 的字符（如部分 emoji）由两个代理码元组成，`length` 为 2：

```js
console.log('😀'.length) // 2
console.log([...'😀'].length) // 1，按码点迭代
```

`codePointAt()` 和 `String.fromCodePoint()` 按码点处理；`charCodeAt()` 和 `String.fromCharCode()` 按 UTF-16 码元处理。正则表达式的 `u` 标志让模式按 Unicode 码点匹配，而不是按码元：

```js
/^.$/.test('😀') // false
/^.$/u.test('😀') // true
```

在 UTF-8 与 UTF-16 之间转换，浏览器和 Node.js 都提供 `TextEncoder` 和 `TextDecoder`：

```js
const encoder = new TextEncoder()
const bytes = encoder.encode('文本') // Uint8Array，UTF-8 字节
console.log(bytes) // Uint8Array [230, 150, 135, 230, 156, 172]

const decoder = new TextDecoder()
console.log(decoder.decode(bytes)) // "文本"
```

Base64 在浏览器中用 `btoa()`/`atob()` 处理 Latin-1 字符串，在 Node.js 中用 `Buffer.from(str, 'base64')`/`buffer.toString('base64')`。`btoa()` 不能直接处理非 Latin-1 字符，需要先用 `TextEncoder` 转成字节，再逐字节转成字符串：

```js
const bytes = new TextEncoder().encode('文本')
const binary = String.fromCharCode(...bytes)
console.log(btoa(binary)) // 5paH5pys
```

字符编码的完整历史（ASCII、GBK、Unicode、UTF-8）和乱码排查属于“字符编码”专题，这里只覆盖 JavaScript 中与二进制、字符串互转相关的部分。

## 总结

- **对象**：属性名最终都会转成字符串或 Symbol；点号访问合法标识符，方括号访问动态键；对象比较的是引用。
- **数组**：本质是“以索引为属性名”的对象，`length` 是最大索引加一且可写；遍历用 `for`、`for...of` 或 `forEach`，不要用 `for...in`。
- **iterable**：可迭代对象必须实现 `Symbol.iterator`，迭代器的 `next()` 返回 `{ value, done }`；生成器是创建迭代器最省事的方式，但一个生成器对象只能迭代一次。
- **解构**：数组按位置、对象按属性名取值，支持默认值、剩余、嵌套和函数参数解构。
- **Map 和 Set**：按插入顺序迭代，`Map` 的键可以是任意类型，`Set` 天然去重；`WeakMap`/`WeakSet` 持有弱引用、不可枚举。
- **JSON**：只支持双引号、无尾随逗号、无 `undefined`；`stringify` 会忽略函数和 symbol，循环引用抛 `TypeError`。
- **拷贝与不变性**：展开和 `Object.assign()` 是浅拷贝；深拷贝可用 `structuredClone()`，它有明确的支持范围；`freeze()`/`seal()`/`preventExtensions()` 提供逐级增强的保护。
- **二进制与编码**：位运算按 32 位整数处理；`ArrayBuffer` 配合 TypedArray/DataView 读写二进制；字符串以 UTF-16 存储，`TextEncoder`/`TextDecoder` 负责 UTF-8 转换。

## 参考

- [索引集合](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Indexed_collections)
- [使用对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_objects)
- [彻底搞懂JS原型与原型链](https://segmentfault.com/a/1190000042725370)
- [带键的集合](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Keyed_collections)
- [迭代器和生成器](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Iterators_and_generators)
- [zhuanlan.zhihu.com/p/55989130](https://zhuanlan.zhihu.com/p/55989130)
- [zhuanlan.zhihu.com/p/183124536](https://zhuanlan.zhihu.com/p/183124536)
- [JSON](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- [类型化数组](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Typed_arrays)
- [Object.freeze()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
- [内存管理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Memory_management)
- [解构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
