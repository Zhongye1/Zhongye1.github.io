---
uuid: 726d3800-dc54-11f1-a70b-d3a1bc617592
title: 2026-09-14-重学 JavaScript Vol.5 - 运行机制
mathjax: true
abbrlink: 40104
published: 2026-09-14 10:34:56
category: 前端
description: JavaScript 运行机制：执行上下文与调用栈、错误处理、事件循环、Promise/async、模块、垃圾回收与内存泄漏
cover: 'https://pica.zhimg.com/80/v2-86e48ab9a79eb6d9833074d99268ce2a_1440w.webp'
tags:
  - 前端
  - JavaScript
---

## 执行上下文与调用栈

JavaScript 是单线程的：单个代理是一个线程，解释器一次只能处理一条语句。每个作业通过调用相关的回调进入，回调中的代码可以创建变量、调用函数或退出。每个函数都需要跟踪自己的变量环境和返回位置，为此引擎需要一个栈来跟踪执行上下文。

**执行上下文**（也称为栈帧）是执行的最小单位，它跟踪以下信息：

- 代码求值状态；
- 包含此代码的模块或脚本、函数，以及当前执行的生成器；
- 当前的域；
- 绑定，包括 `var`、`let`、`const`、`function`、`class` 定义的变量，私有标识符，以及 `this` 引用。

考虑下面的程序：

```js
function foo(b) {
  const a = 10
  return a + b + 11
}

function bar(x) {
  const y = 3
  return foo(x * y)
}

const baz = bar(7) // 将 42 赋值给 baz
```

执行过程如下：

1. 任务启动时，创建第一个栈帧，其中定义了变量 `foo`、`bar` 和 `baz`。它使用参数 `7` 调用 `bar`。
2. 为 `bar` 调用创建第二个栈帧，其中包含参数 `x` 和局部变量 `y` 的绑定。它先计算 `x * y`，然后使用结果调用 `foo`。
3. 为 `foo` 调用创建第三个栈帧，其中包含参数 `b` 和局部变量 `a` 的绑定。它计算 `a + b + 11`，然后返回结果。
4. 当 `foo` 返回时，最上面的帧从栈中弹出，调用表达式 `foo(x * y)` 解析为返回值，`bar` 继续执行并返回。
5. 当 `bar` 返回时，最上面的帧从栈中弹出，`bar(7)` 解析为返回值，用来初始化 `baz`。
6. 到达作业源代码末尾，入口点的栈帧被弹出，栈为空，作业完成。

### 生成器与重入

栈帧弹出后并不一定会永远消失。生成器函数会把挂起的执行上下文保存在生成器对象内部，调用 `next()` 时再把上下文推回栈：

```js
function* gen() {
  console.log(1)
  yield
  console.log(2)
}

const g = gen()
g.next() // 输出 1
g.next() // 输出 2
```

调用 `gen()` 只创建一个挂起的执行上下文，不执行函数体。第一次 `next()` 把上下文推入栈，执行到 `yield` 后挂起并移出栈；第二次 `next()` 再推回栈，从上次中断的位置继续。生成器的状态机细节见 Vol.3《函数与闭包》的“生成器”一节。

### 运行至完毕

每个作业都会在处理其他作业之前被完全处理。这提供了一些很好的特性：函数不会被抢占，并且会在任何其他代码运行之前完全运行。例如：

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

两个回调看起来像竞态，但输出是可预测的 `1`、`2`：每个作业运行完毕之后才轮到下一个作业，绝不会出现两次 `i += 1` 之后再输出。

这种模式的缺点是，如果作业运行时间过长，页面就无法处理点击、滚动等交互。浏览器会用“脚本运行时间过长”提示来缓解，正确的做法是把长任务拆成多个短任务。

### 闭包与作用域

执行上下文还解释了闭包：每当创建一个函数，它会在内部记住当前执行上下文的变量绑定，这些绑定可以超越执行上下文存活：

```js
let f

{
  let x = 10
  f = () => x
}

console.log(f()) // 10
```

块执行结束后，`x` 的绑定仍然被 `f` 引用，因此不会被回收。闭包的完整讨论见 Vol.3《函数与闭包》。

### 调用栈溢出

调用栈的深度是有限的。无限递归或过深的递归会抛出 `RangeError: Maximum call stack size exceeded`：

```js
function recurse() {
  recurse()
}

recurse() // RangeError
```

尾调用优化（PTC）在规范中存在，但只有 Safari（JavaScriptCore）实现，其他引擎仍会为每次调用压栈。需要处理深递归时，应改成循环或显式栈。

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

## 垃圾回收与内存泄漏

### 内存生命周期

JavaScript 的内存生命周期和其他语言一样：分配、使用、释放。分配发生在创建值的时候，使用发生在读写值的时候，释放由垃圾回收器自动完成。

原始值和对象都会占用内存，但对象的生命周期更复杂，因为对象之间可以互相引用。自动判断一块内存是否“不再需要”在一般情况下是不可判定的，因此垃圾回收器实现的是一个有边界的近似方案。

### 标记清除

现代 JavaScript 引擎使用标记清除算法。算法从一组**根**对象（在 JavaScript 中是全局对象）出发，找到所有从根可达的对象，再找到这些对象可达的对象，依此类推；所有不可达的对象都会被回收。

标记清除解决了引用计数无法处理的循环引用问题：

```js
function f() {
  const x = {}
  const y = {}
  x.a = y
  y.a = x
}

f()
```

函数返回后，`x` 和 `y` 都不再被全局对象可达，因此可以被回收，尽管它们互相引用。

现代引擎在标记清除的基础上做了分代、增量、并发和并行回收等优化，但算法本身仍然是“从根出发找可达对象”。

### 弱引用

`WeakMap`、`WeakSet`、`WeakRef` 和 `FinalizationRegistry` 提供了观察或利用垃圾回收的间接手段。

`WeakMap` 的键和 `WeakSet` 的值是弱引用：如果对象只被弱引用，垃圾回收器仍然可以回收它；对象被回收后，对应的条目也会消失。这使它们适合把额外数据绑定到对象上，而不阻止对象被回收：

```js
const cache = new WeakMap()

function process(obj) {
  if (cache.has(obj)) return cache.get(obj)

  const result = expensive(obj)
  cache.set(obj, result)
  return result
}
```

`WeakRef` 持有一个对象的弱引用，通过 `deref()` 读取；对象被回收后 `deref()` 返回 `undefined`。`FinalizationRegistry` 可以在对象被回收后执行清理回调，但回调的执行时机不确定，不能用于关键资源释放。

### 常见内存泄漏

1. **意外的全局变量**：未声明的赋值会创建全局变量，永远可达。严格模式可以把这类错误变成异常。
2. **未清理的定时器和事件监听器**：`setInterval()`、`addEventListener()` 持有的回调如果引用了大对象，组件销毁后仍然可达。应在销毁时调用 `clearInterval()`、`removeEventListener()`。
3. **闭包持有大对象**：闭包会保留整个作用域链，即使只用到其中一个小变量。长期存活的闭包应避免捕获不必要的大对象。
4. **游离的 DOM 引用**：从文档中移除的 DOM 节点如果仍被 JavaScript 变量引用，就不会被回收。
5. **无上限的缓存**：用普通 `Map` 缓存对象会阻止键被回收；缓存对象适合用 `WeakMap`，或者给缓存设置容量上限和淘汰策略。
6. **未取消的异步请求**：请求返回后回调仍持有组件状态；应在组件销毁时取消请求（例如 `AbortController`）。

### 排查方法

浏览器 DevTools 的 Memory 面板可以做堆快照（Heap Snapshot）、分配时间线（Allocation instrumentation）和分配采样（Allocation sampling）。常用流程是：

1. 执行操作前拍一次堆快照；
2. 执行疑似泄漏的操作；
3. 再拍一次快照，比较两次快照之间的对象数量和保留大小；
4. 在 Retainers 面板查看对象为什么仍然可达。

Node.js 可以用 `--inspect` 连接调试器，或用 `process.memoryUsage()` 观察堆使用量：

```bash
node --expose-gc --inspect index.js
```

内存泄漏的根因通常不是“垃圾回收器没工作”，而是某条引用链让对象一直可达。找到那条引用链，比反复调用 `global.gc()` 更有用。

## 总结

- **执行上下文**：每个函数调用创建栈帧，保存变量环境、返回位置和 `this`；栈帧按调用顺序压栈和弹出，生成器会保存挂起的上下文。
- **错误处理**：`throw` 抛出 `Error` 或任意值；`finally` 总会执行且其 `return` 会覆盖之前的返回值；用 `instanceof` 分支处理特定错误，未知错误重新抛出；`cause` 保留原始错误链。
- **异步**：事件循环分任务与微任务，微任务先清空；Promise 的 `then` 总是异步执行，链中忘记 `return` 会产生“漂浮”的 Promise；`all`/`allSettled`/`any`/`race` 处理并发。
- **模块**：`export`/`import` 是静态声明并提升；模块自动严格模式、延迟加载、有独立作用域；`import()` 动态加载返回 Promise；顶层 `await` 让模块在求值时等待异步依赖。
- **垃圾回收**：现代引擎使用标记清除，从根对象出发回收不可达对象；`WeakMap`/`WeakSet`/`WeakRef` 提供弱引用；常见泄漏来自全局变量、未清理的定时器/监听器、游离 DOM 和无上限缓存。

## 参考

- [执行模型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Execution_model)
- [控制流与错误处理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [Error](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [使用 Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
- [async function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [JavaScript 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [内存管理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Memory_management)
