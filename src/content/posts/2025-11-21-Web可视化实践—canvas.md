---
uuid: 69b00720-c6a6-11f0-b614-1b2a61f63ef4
title: 2025-11-21-Web可视化实践—canvas
mathjax: true
abbrlink: 14933
published: 2025-11-21 14:50:48
category: 前端
description: 本文主要从本文主要从 Faster、KonvaJS、LeaferJS 三个渲染引擎来介绍 Canvas ，作为对渲染层的入门。个渲染引擎来介绍 Canvas ，作为对渲染层的入门。
cover: https://picx.zhimg.com/80/v2-029fc3ce7fddbf94c1f63091b6a89cbd_720w.webp
tags:
    - Canvas
    - 前端
---

# 关于Canvas

## 前言

HTML5 canvas 是浏览器原生提供的一块位图绘图区域，通过 JavaScript 脚本在其上进行像素级的 2D/3D 绘制，常用于图表、游戏、数据可视化、图像处理、动画特效等场景。它在 HTML 中只是一个矩形容器，所有内容都由脚本动态生成，绘制结果是栅格图像，本文主要从 Faster、KonvaJS、LeaferJS 三个渲染引擎来介绍 Canvas ，作为对渲染层的入门。

## 2\. Canvas vs DOM

Canvas 相对于 DOM 既有优势，也有一定的劣势，下面列举了几条两者的差异点：

### 2\.1 绘制

Canvas 是一张画布，里面的内容都是调用 Canvas API 绘制的，所以更像是我们拿起画笔来作画，绘制比较灵活，但调用方式很繁琐。

比如想绘制一个文本，就需要调一些不太容易理解的 API：

```JavaScript
context.font = '24px STheiti, SimHei';
context.fillText('hello, world', 24, 66);
```

DOM 更像是我们调用一些现有的 UI 控件去做绘制，DOM 没有提供的就比较难做，但胜在浏览器提供的能力很完善。

但是，使用 Canvas 意味着很多能力需要从零实现，布局系统、事件系统、文本排版等等，对开发来说不算是友好。

### 2\.2 布局

在 DOM 中，我们可以很方便的使用各种布局，比如 Flex 布局、Grid 布局、绝对/相对定位等等。但在 Canvas 里面只有绝对定位，这也很容易理解，画笔肯定都是相对于画布的。

### 2\.3 事件

Canvas 在 DOM 树里面只是一个 \<canvas\>\</canvas\> 的 DOM 节点，所有的鼠标事件只能触发在 canvas 节点上面。具体里面绘制的是什么内容，有没有点击在某个图形上面，都无法感知。

而 DOM 提供了丰富的事件能力，支持事件冒泡和捕获，我们也很容易给某个节点绑定一些事件。

### 2\.4 文本排版

对文本的处理可能是 Canvas 里面最难的点，Chrome 针对 DOM 文本有很好的排版，但在 Canvas 里面文本是没有排版的，比如最简单的换行能力，都需要 Canvas 自己去实现，毕竟 Canvas 没有文本节点的概念。

总之，使用 Canvas 做页面渲染，有点儿像重新实现浏览器渲染引擎和排版引擎。

## Canvas 渲染引擎

为了解决上述这些痛点，诞生了例如 Konva、ZRender、Fabric 等 Canvas 库，对 Canvas API 进行了一系列的封装。

Canvas 渲染引擎一般包括下面几个特点：

1. 封装

将 Canvas API 的调用封装成更简单、清晰的形式，贴近于我们使用 DOM 的方式。

比如想绘制一个文本，直接调用封装好的 Text 类就行了，我们不需要关心是如何绘制的。

```JavaScript
const simpleText = new Text({
        x: 100,
        y: 15,
        text: 'hello, world',
        fontSize: 30,
        fontFamily: 'Calibri',
        fill: 'green'
      });
```

2. 性能

虽然封装之后的 API 很贴近 DOM 语法，但也意味着开发者很难去做一些底层的性能优化。因此，大部分 Canvas 渲染引擎都会内置了一些性能优化手段。

常见的性能优化手段有分层渲染、离屏渲染、局部渲染、批量渲染等等。

3. 事件拾取

针对 Canvas 内部绘制的元素，渲染引擎一般会提供事件拾取的能力，通过模拟一套冒泡/捕获机制，让开发体验更加接近 DOM。

## **4\. 封装**

### **4\.1 虚拟节点**

目前主流的 Canvas 渲染引擎都会将要绘制的图形封装成类，以方便开发者去调用，复用性也比较强。每个实例可以当做一个虚拟节点，类似于 DOM 节点。

使用 Konva 的例子：

```JavaScript
// first we need to create a stage
var stage = new Konva.Stage({
  container: 'container',   // id of container <div>
  width: 500,
  height: 500
});

// then create layer
var layer = new Konva.Layer();

// create our shape
var circle = new Konva.Circle({
  x: stage.width() / 2,
  y: stage.height() / 2,
  radius: 70,
  fill: 'red',
  stroke: 'black',
  strokeWidth: 4
});

// add the shape to the layer
layer.add(circle);

// add the layer to the stage
stage.add(layer);

// draw the image
layer.draw();
```

在此基础上，可以进一步针对 React/Vue 语法进行封装，提供声明式的调用和组合的能力。

使用 React\-Konva 的例子（通过 react\-reconciler 实现）：

```JavaScript
import React, { Component } from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';

class ColoredRect extends React.Component {
  state = {
    color: 'green',
  };
  handleClick = () => {
    this.setState({
      color: Konva.Util.getRandomColor(),
    });
  };
  render() {
    return (
      <Rect
        x={20}
        y={20}
        width={50}
        height={50}
        fill={this.state.color}
        shadowBlur={5}
        onClick={this.handleClick}
      />
    );
  }
}

class App extends Component {
  render() {
    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Text text="Try click on rect" />
          <ColoredRect />
        </Layer>
      </Stage>
    );
  }
}

render(<App />, document.getElementById('root'));
```

有些渲染引擎直接支持 DSL：

```JavaScript

import { FStatelessWidget } from '@faster/core'
import { Center, FText } from '@faster/widget'

class MyWidget extends FStatelessWidget {
  describe() {
    return (
      <Center>
        <FText text="Hello" />
      </Center>
    )
  }
}
```

除了内置的图形类，很多渲染引擎还会提供自定义绘制图形类的能力。

以 Konva 为例，每个图形类都需要实现 sceneFunc 方法，在这个方法里面去调用 Canvas API 来进行绘制。

如果需要自定义新的图形，就可以继承 Shape 来实现 sceneFunc 方法。

Konva 里面圆形绘制类的实现：

```JavaScript
export class Circle extends Shape<CircleConfig> {
  _sceneFunc(context) {
    context.beginPath();
    context.arc(0, 0, this.attrs.radius || 0, 0, Math.PI * 2, false);
    context.closePath();
    context.fillStrokeShape(this);
  }
}
```

参照 DOM 树的结构，每个 Konva 应用包括一个舞台 Stage、多个画布 Layer、多个分组 Group，以及若干的叶子节点 Shape，这些虚拟节点关联起来最终形成了一棵树。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=MzIzYzU5YjVmY2I5OWVmNGFhZmUzNDI0ZGM1M2FhNThfZTFmOWRmNzIwZTVkNmEwMjYxOGYyODE4YzZiYThmZGVfSUQ6NzI1NDk2MDM0ODAxOTYyMTg5MF8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

在 Konva 中，一个 Stage 就是根节点，Layer 对应一个 Canvas 画布，Group 是指多个 Shape 的集合，它本身不会进行绘制，但同一个 Group 里面的 Shape 可以一起应用旋转、缩放等变换。

Shape 则是指具体的绘制节点，比如 Rect、Circle、Text 等等。

### **4\.2 包围盒**

既然有了虚拟节点，那知道每个节点的位置和大小也比较重要，它会涉及到判断两个图形是否相交、事件等等。

有时候元素的形状不是很规则，如果直接对不规则元素进行碰撞检测会比较麻烦，所以就有了一个近似的算法，就是在物体外侧加上包围盒，如图：

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=OGJmYjgyYzZkZDNkOWI1ZjRjZTM3YjgwMTBmOGFlNzRfNWJjNDRiMjE2MDZiZWI3NGNmNjI1NzdlOWFlOWJkZTBfSUQ6NzI1NDk2MDMzOTA3MzE1NTA3Nl8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

目前主流的包围盒有 AABB 和 OBB 两种。

AABB 包围盒：

实现方式简单，直接用最大最小的横纵坐标来生成包围盒，但不会跟着元素旋转，因此空白区域比较多，也不够准确。

也是目前平面项目里面使用的方式。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=MTZkNzI4OTE0NzdkNTBlOWRlYjRjMDQ4M2Y5OWM2YTFfMmEwMDU3NTVhNmM0NGNhZGNmOTk3ODQ5ZDlkYjJlMzNfSUQ6NzI1NDk2MDM0MDkzNTQ1ODgxN18xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

OBB 包围盒：

实现方式相对复杂，通过构建协方差矩阵来计算出新的坐标轴方向，将其顶点投射到坐标轴上面来得到新的包围盒。

OBB 包围盒更加准确一些，但实现也比较复杂一些。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=ZjViMGUyNGY4ZmZjNDAxYWIxZTA0OTljYWVhOTFiY2FfNTNhZmVlZjFjNzdiNzlhYjI5YzJkMWQ3MzkyNjdmZjlfSUQ6NzI1NDk2MDMzOTQ2NzQ2ODgwNF8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

碰撞检测：

两个包围盒在所有轴（与边平行）上的投影都发生重叠，则判定为碰撞；否则，没有发生碰撞。（分离轴定律）

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=ZmI2Njk2ZGExNDA1YWY2Yjg4ZDEzODQ1YTFkNDIyZDVfNjE1Njk1ZmQxZGQzOTk4MTRlNmZhZTVhNmZlN2FhMjNfSUQ6NzI1NDk2MDM0MDUyODU2MjE3OV8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

### **4\.3 布局系统**

绘制 Canvas 的时候一般都是给定相对于画布左上角的绝对位置，为了方便理解，大多数渲染引擎提供的 x、y 都是相对父节点的位置。

对于图片编辑器来说，相对坐标比较契合。对于其他业务，比如文档来说，就没那么契合了，大量的坐标计算会让可维护性变差。

因此，在 AntV 和 SpriteJS 这类 Canvas 渲染引擎里面，都内置支持了盒模型的语法糖，底层会将盒模型属性进行一次计算转换成 x、y。

以 AntV 为例子，布局能力是基于 Facebook 开源的 Yoga 排版引擎（React Native）来实现的，它支持一套非常完整的盒模型和 Flex 布局语法。

```JavaScript
const container = new Rect({
   style: {
       width: 500, // Size
       height: 300,
       display: 'flex', // Declaring the use of flex layouts
       justifyContent: 'center',
       alignItems: 'center',
       x: 0,
       y: 0,
       fill: '#C6E5FF',
   },
});
```

它的语法更加接近于 Flutter，本质上是模仿 Flutter 来实现的。它实现了 Padding、Column、Row、Margin、Expanded、Flex、GridView 等 Widget。

下面的示例是 Faster 的：

```JavaScript
<Center>
  <Column>
    <SizedBox width={50} height={50}>
      <FBackground color="red"></FBackground>
    </SizedBox>
    <SizedBox width={50} height={50}>
      <FBackground color="green"></FBackground>
    </SizedBox>
    <SizedBox width={50} height={50}>
      <FBackground color="#c9c9c9">
          <Padding padding={[8, 4]}>
            <FText text="Hello World" />
          </Padding>
      </FBackground>
    </SizedBox>
  </>
</Center>
```

通过实现盒模型和 Flex 布局，可以让 Canvas 的布局能力更上一层楼。不仅可以减少代码中的大量计算，也可以让大家从 DOM 开发无缝衔接进来。

## 5\.文本

对文本的处理可能是 Canvas 里面最难的点，Chrome 针对 DOM 文本有很好的排版，但在 Canvas 里面文本是没有排版的，比如最简单的换行能力，都需要 Canvas 自己去实现，毕竟 Canvas 没有文本节点的概念。

### 5\.1 宽度测量

宽度测量会影响 Canvas 文本换行，需要根据宽度计算出换行点。比较简单的做法是对文本的每个字符进行遍历，用 measureText 测量宽度和 letter\-spacing 累加起来，然后决定在哪个字符后面换行。这种做法耗时比较高，也不准确。

在文字排版中，有个概念叫 Kerning，不同的字体有不同的规则。kerning 意思是字偶间距，简单来说就是特定的两个字母之间的距离。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=ZjU4OTdlMWQ5MTFjODUxNDc5MGQ4MDYxMDFjZjgwYjJfNzRmYzZiYjU5ZTM4YmJlZThjZGIwNWZkNDQ1NGEwMmNfSUQ6NzI2NTYwNDEwMjM4OTY5NDQ5Ml8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

对于第二行的 A 和 V 来说，单纯的累加单个字符的宽度和对这两个字符一起测量得到的结果是不一样的，下图是一个简单的验证，所以累加宽度是错误的做法。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=Yzc3YTVlYzBjNzFjZWViN2RiNmUxZGVlZmNhYWUzOWJfOTY3YjgxMmE2MmU4NDk5MTY1MWRlODk4MDE4ZDQ1MzhfSUQ6NzI2NTYwNDEwNTI3ODY2ODgwMl8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

在 opentype 中，可以看到某个字体的 kerning 映射表。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=YjliNjc4NTFhZGU3ZTJiNWIxNDFlZjBlZGE5MmVmYjlfODk5NWI5M2M2MzAwMmJlNmVkYTZkYTZiOTdkNDUzY2JfSUQ6NzI2NTYwNDEwNDc4MTAwNDgyOF8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

在 Konva 和 LeaferJS 中通过对文本进行二分查找，来找到需要在哪个字符后面换行。这种做法也有自己的弊端。

1. 对于长度大于 1 的字符来说，测量不准确，会将其断开。

2. 根据词来换行的时候，处理不够完善，对于是否是一个词的判断不够准确。

3. 大量重复测量，浪费性能。

对于长度大于 1 的字符，无法准确测量，可能就会出现一个 emoji 表情错误分割的情况。

```TypeScript
console.log('👨‍👩‍👦'.length); // output: 8

console.log(Array.from('🐕🦺'));  // output: [ "🐕", "", "🦺" ]
// 泰语
console.log(Array.from('สุ'));  // output: [ "ส", "ุ" ]
```

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=ZDVhNDBkYmVhYjRjZWVlZWE1YjdiZTk2ZDYyM2M5YjVfODRlOTViYWFkOTE2MTYyNWJkMGFhZmFhMjRkODQ4YWRfSUQ6NzI2NTYwNDEwNTI0MTQyNzk3MF8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

这些从人类视觉角度被认为是单个字符的图形或文字，在Unicode中被称为字素簇（Grapheme Cluster）。

如果要以字素簇为单位分割字符串，目前来说有两个方案。第一个方案是原生API——Intl\.Segmenter目前这个提案处于Stage 4，并且Chrome和Safari已经支持。示例如下：

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=MzM1NDhjNjZiNmE3YzJlOTcyMzlmNWJiN2FlMTRlM2FfYjAyOGI3YWRhZjNlOTcwMTQ4MTU2ZjcxODE4ZTg1NzNfSUQ6NzI2NTYwNDEwNTk3NTg4OTkyMV8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

另一种方法就是利用一些开源库，比如： graphemer\-breaker、line\-breaker 等库，他们是根据 Unicode 规定的算法对文本进行划分的。

另一个问题是换行点不对，插入一个逗号，此时可能因为放不下这个逗号，会将逗号都放到下一行，因为逗号不能作为一行的首个字符。在 Konva 和 LeaferJS 中这里就是错误的，因为它们只针对空格和中划线做了特殊处理。

最后一个弊端是利用二分查找，很多字符的宽度会被多次测量，比如下方这段文字，如果二分查找了10次，文本内容就被测量了10次。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=MWRiNzA2YWZmOWQ4MzRhOTIwMjAyZDlhNDdhNmFhODVfN2ZmMDYzMDU4MWNhMTUwMTRhZThkYzYzYzRjZGI1NDlfSUQ6NzI2NTYwNDEwNTI0MTQ2MDczOF8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

那么怎么解决这三个问题呢？我们需要一种切词算法。

Unicode 官方给了一种标准的换行算法，根据当前文本的 Unicode 编码，给出一个 break opportunities（换行机会）。有一个 LineBreak 的映射表：http://www\.unicode\.org/Public/12\.0\.0/ucd/LineBreak\.txt

| **字符**  | **十六进制unicode** | **换行类** | **描述**                                                                                                                                  |
| --------- | ------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| "a"<br>   | 0061<br>            | AL<br>     | **_Alphabetic_**<br>Are alphabetic characters or symbols that are used with alphabetic characters<br>是字母字符或与字母字符一起使用的符号 |
| "\\n"<br> | 000A<br>            | LF<br>     | **_Line Feed_**<br>Cause a line break \(after\)<br>换行（在后方）                                                                         |

只知道当前字符也是不够的，应该要通过比较前后两个字符，将这些换行机会进行组合，得出来当前是否支持换行。具体做法如下：

1. 先将官方给的 LineBreak\.txt 下载解析出来，将 unicode 编码范围和换行类构建一颗 Unicode Trie（字典树）

2. 遍历整个字符串，通过 charCodeAt 获得 unicode 编码，从 Unicode Trie 里面读取换行类

3. 获取下一个字符串的换行类，按照一定规则来判断当前是否可以换行。

通过这种方式，将一段文本拆分成独立的词，首先解决了前两个问题。针对每个词去做宽度的缓存，由于词是有限的，在大文档中很容易遇到重复的词，这样就不需要重复测量宽度了，解决了第三个问题。

感兴趣的可以参考开源库：https://github\.com/foliojs/linebreak 和 https://github\.com/foliojs/unicode\-trie

## **6\. 事件拾取**

Canvas 本身是一块画布，所以里面的内容都是画出来的，在 DOM 树里面也只是一个 Canvas 的节点，所以如何才能知道当前点击的是哪个图形呢？

前面说了 Canvas 渲染引擎都会封装虚拟节点，每个节点都有自己的包围盒，所以为实现 Canvas 的事件系统提供了可能性。

主流的 Canvas 渲染引擎都是针对 Canvas 节点或者上层节点进行事件委托，监听用户相关的事件（mouseDown、click、touch等等）之后，通过拾取来匹配到当前触发的元素，将事件分发出去。

目前主流的几种事件实现方式分别是取色值法和几何法。

### **6\.1 取色值法**

取色值法是 Konva 采用的实现方式，它的实现方式非常简单，匹配精确度很高，适合不规则图形的匹配。

取色值法的原理如下：

1. 在主 Canvas 创建一个图形的时候，会为这个图形生成一个随机的 colorKey（十六进制的颜色），同时建立类似于 Map\<colorKey, Shape\> 的映射。

```JavaScript
getRandomColor() {
    var randColor = ((Math.random() * 0xffffff) << 0).toString(16);
    while (randColor.length < 6) {
      randColor = ZERO + randColor;
    }
    return HASH + randColor;
  },
```

1. 绘制的同时会在内存里的 hitCanvas 同样位置绘制一个一模一样的图形，填充色是刚才的 colorKey。

2. 当用户鼠标点击 Canvas 画布的时候，可以拿到鼠标触发的 x、y，将其传给内存里面的 hitCanvas。

3. 内存里面的 hitCanvas 通过 getImageData 来获取到当前的颜色，进而通过 colorKey 来匹配到对应的图形。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=MGEzZjMzOTc5Njc3NDNjM2UyZTZmMWQyZGY0YTY5ODhfM2U4MzQ5OWZhMzcwMWIwNWE5OTlhOTMwOWEzNzZmZjRfSUQ6NzI1NDk2MDM0NzM4MjEwNDA2NV8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

从上述原理可以看出来，Konva 对于不规则图形的匹配依然会很精确，但缺点也很明显，每次都需要绘制两份，导致绘制性能变差。如果有两个图形互相覆盖，取色值法也只能拿到上方的图形。

同时，getImageData 耗时比较高，在频繁触发的场景（onWheel）会导致帧率下降严重。

### **6\.2 几何法**

因为需要进行一系列几何计算，所以这里称之为几何法。几何法有很多种实现方式，这里主要讲解引射线法。

几何法是 AntV 采用的实现方式，实现方式相对复杂一些，针对不规则图形的匹配效率偏低。

引射线法的实现原理如下：

1. 从目标点出发向一侧发出一条射线，看这条射线和多边形所有边的交点数目。

2. 如果有奇数个交点，则说明在内部，如果有偶数个交点，则说明在外部。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=YmI2M2EzYjA3YmQwZjE4YzYxNzMxNmVmMTAwNzJmODNfNDY1ZDk0Y2JhNDU3MjQ0YzRmNzExYzdhOGZhZDE1ZTFfSUQ6NzI1NDk2MDM0MDExODU2ODk2NF8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

为什么奇数是在内部，偶数是在外部呢？我们假设射线与这个图形的交点，进入图形叫做穿入，离开图形叫做穿出。

在图形内部发出的射线，一定会有穿出但没有穿入的情况。但在外部发出的射线，穿入和穿出是相对的。

但是射线刚好穿过顶点的情况比较特殊，因此需要单独进行判断。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=MTBiODZiOWI0ZGVlZGNmMzI1YjYxZGQzODk4ZmIwYmZfYjhlNDdkMzU1NWExNmNjZWQzMDlmNmUxNjlmNDI5MmJfSUQ6NzI1NDk2MDM0MjU0Njg0MTYwM18xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

几何法的优势在于不需要在内存里面进行重复绘制，但依赖于复杂的几何计算，因此有大量不规则图形的情况下性能会差一些。

为了避免大量计算的问题，一般的渲染引擎会先根据 AABB 包围盒来进行匹配，如果匹配到了某个图形的包围盒，这个时候再去做更精准的碰撞检测。

### 6\.3 引申

前面说过，先根据 AABB 包围盒进行匹配，如果页面中元素过多，每次都需要遍历所有的图形，在频繁触发的场景下性能表现也会不佳。

#### 6\.3\.1 R 树

R树是一种高效的空间索引结构，它可以用于处理多维空间数据的查询和插入操作。R树的核心思想是将空间数据划分为一系列的矩形区域（合并相邻的包围盒），并将这些矩形区域组织成一棵树形结构。这样，在查询时可以利用树的结构快速定位到包含查询点的矩形区域，从而避免了对整个数据集的遍历。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=MTQ3MmE5Y2VmZmEwNjgzMDJiNzU1ODg0Njk4NTQwNmFfMmVjODYwNmY2ZWJjNDQ4N2Q2YjRhZGFiZjg0NmYzZjNfSUQ6NzI2NTE5Mjg3MDkxMDAzMzkyMV8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

使用 R 树可以先去查询到 AABB 包围盒，然后再对命中的这个图形做更精准的碰撞检测。

#### 6\.3\.2 四叉树

和 R 树类似，本质上都是划分空间来减少查找，将空间区域划分四份，子区域继续划分四份。四叉树在构建时，每个图形需要判定落在哪个四叉树的叶子节点中，使用包围盒进判定，要么遍历所有的叶子节点判定图形包围盒和叶子包围盒是否相交，要么通过图形包围盒的四个点来判定，需要对图形进行横向和纵向叶子包围盒的占用，然后在每个相交的叶子中插入当前图形。后面所有的拾取都可以通过四叉树来加速，可以降低大量点是否在包围盒中的计算。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=OTA0Y2I2ODZiYWU1N2MzMmY2ZmJiMTEwYzc4Njk1MTBfNTJhYzk1OGE4YjkzYmE1OTk2MmFiNjE5ZTEzMmIzYThfSUQ6NzI2NTE5MTcyMjkwMzc4MTM3N18xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

四叉树和 R 树都需要提前构建，不适用于频繁变化（动画）的场景，这种场景下频繁去插入、删除节点带来的开销比较大。

### 6\.4 混合拾取

这个是 LeaferJS 里面使用的方案，核心是空间划分\+ isPointInPath。在 LeaferJS 里面，每个 Group 都是一个 Branch（分支），每个图形节点都是一个 Leaf（叶子），通过 Branch 可以找到对应的 Leaf。

每个 Branch 都有自己的包围盒，在碰撞检测的时候，会先检测当前坐标在哪个 Branch 里面，这一步等同于做空间划分。

找到 Branch 之后，会对下面的 Leaf 做碰撞检测，碰撞检测的原理是在一个离屏 hitCanvas 上面绘制一份当前的 Leaf 节点，利用 Canvas 的 isPointInPath 来检测坐标点是否在刚刚绘制的路径里面。

因为在 `beginPath` 之后，绘制的路径都会被添加到这个路径集合里，`isPointInPath(x, y)` 方法判断的就是x、y 点是否在这个路径集合的所有路径里。

每个 Leaf 节点都会有一个自己的 hitCanvas，所以只要节点 Layout 没有发生变化，这个 hitCanvas 就不需要重新绘制。

取色值法会在首次渲染的时候就把所有图形在 hitCanvas 里面绘制出来，但 LeaferJS 是在每次事件拾取的时候动态绘制，等于将总耗时进行了分摊。对于频繁变化的场景，比 Konva 这种取色值适用性更强一些。

## 7\. 性能优化

由于 Canvas 渲染引擎都会进行大量的封装，所以开发者想针对底层做性能优化是非常难的，需要渲染引擎自身去支持一些优化。

### **7\.1 异步批量渲染**

Faster 和 Konva、LeaferJS 里面都支持异步渲染，将大量绘制进行批量处理。

```JavaScript
const rect = new Rect({ /... });
// 多次修改属性，可能会触发多次渲染
rect.x(100);
rect.fill('red');
rect.y(100);
// 由于每次修改图形的属性或者添加、销毁子节点都会触发渲染
// 为了避免同时修改多个属性时导致的重复渲染，因此约定每次在下一帧进行批量绘制。
 batchDraw() {
    if (!this._waitingForDraw) {
      this._waitingForDraw = true;
      Util.requestAnimFrame(() => {
        this.draw();
        this._waitingForDraw = false;
      });
    }
    return this;
  }
```

这种渲染方式类似于 React 的 setState，避免短时间内多次 setState 导致多次 render。

### 7\.2 减少状态机切换

Canvas 的 context 本质上是一个状态机，每次调用 context 来设置不同的属性（font 、fillStyle、strokeStyle、lineWidth 等）都是状态机的切换，有一定的开销。

那有没有可能减少状态机的切换呢？可以针对画布上的元素来进行归类，将属性一样的元素归为一类，一次性绘制出来，避免了状态机的切换，可以提高绘制的性能。

这种优化手段在表格业务中非常常见，可以根据绘制内容，划分为以下的收集器和渲染器：

- 线段数据收集和绘制（如表头、边框线等）

- 矩形数据收集和绘制（如背景色）

- 图像数据收集和绘制（如图片）

- 文本数据收集和绘制（如文字内容）

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=Y2NjZGNmNmI5MmNmZDlmMTk2MGYzYTYwNzkzOGY2MmNfYzgyYmE2YzgxZTM0ODc1ODE1NWYyZjExMTdkMjhlZjdfSUQ6NzI2NTE5ODMwMzY0NDUzMjczOF8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

对于有明确层级关系的业务场景，收集渲染就不太适用了。比如平面里面每个图层都可以修改图层顺序，这种情况不适合一次性绘制出来。

### 7\.3 分层渲染

分层渲染不是 Canvas 的专属，在 DOM 中也会利用 will\-change 来做分层。分层渲染的核心就是将不变的部分和变化的部分进行分离。

比如表格中，选区和 hover 态都是变化的部分。里面的线段、文本等都是相对不变的部分。

### **7\.4 离屏渲染**

离屏渲染也是一种优化手段，利用离屏 Canvas 来缓存绘制内容，从而减少绘制的耗时。这种渲染优化方式在表格业务中也比较常见。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=NTJkNjFjNzI2OTkxZTg3NzFhZjJkNDk1OTllNDFjYjdfYzE4YzFlOWU2NzVlZDE3NjAzZmJhYWRhOGZhMDU3MGJfSUQ6NzI2MDM2NzcyMDQ2MDY0ODQ1MF8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

1. 首次绘制的时候，在离屏 Canvas 里面也绘制一份

2. 滚动的时候，不变的部分通过离屏 Canvas 绘制，新增的部分调用 Canvas API 绘制

3. 将两者绘制合成到主画布上，再将主画布的内容绘制回离屏 Canvas

4. 重复上述过程

在 Konva 中也提供了离屏渲染的能力，主要是针对 Group 级别来做的，可以通过调用 cache 方法来开启。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=YTE3OGU4MzI5YzM3Y2MyOGUyNDIzNTgwMTQyZWE0NmFfMjQ2YTM2ODdiYmY3NmMyOWJkMmU4N2Q1N2M3ZmY0ZjlfSUQ6NzI2MDM2NzcxOTUxNzYzNDU2NF8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

这种离屏渲染的调用方式比较简单，Group 的粒度可以由开发者自己决定，但一个 Group 就是一个离屏 Canvas，占用内存比较多，也不适合频繁变化的场景。但是很适合多维表格的卡片视图（看板视图、卡片视图）。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=YTQ3MmY3YWI0YTRlNWE3YzBhOTc3MjdkZTZiYjY5ZDhfMzdlZDFhMzhhZjg2M2ZiOGFhM2MxYmVmMWU2NzFjMjFfSUQ6NzI2NTM1MTU1NzY1NzQyNzk3Ml8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

### **7\.5 局部渲染**

对于 Konva 来说，每次重新渲染都是对整个 Canvas 做清除，然后重新绘制，性能相对比较差。

Canvas 里面提供了 clip 属性，支持对画布进行裁剪，可以限制只能访问裁剪区域。利用这个特性，可以提前计算出来需要更新的区域，只限制重绘这部分区域，从而做到局部渲染。

Faster 和 LeaferJS 里面都实现了局部渲染的能力。

1. 每当有节点更新的时候，计算变化前后的包围盒，进行包围盒合并后计算出重绘区域

2. 使用 clip 限制重绘区域

3. 判断每个节点是否和这个重绘区域相交，如果相交，那就渲染这个节点

4. 下图中需要重绘的节点有 circle1、rect2、circle2、rect3

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=OGJiNjkxYzcwZmEzMjk5ODhhM2Y0ZjVlMTc5MzdhOTFfZjRkMzU4NjhhZGFlNTQ2OWYyOTJmNzNjNWZkMmEwZGVfSUQ6NzI2MDM2ODQ3MDE4MDA1Mjk5NV8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

## **8\.** **服务端渲染**

主流的服务端渲染方式有两种，一种是用 node\-canvas 来输出一张图片，在 Echarts 等库中都有使用，但它不是基于 Skia 的，文本排版不够准确，且对于需要自适应浏览器窗口的场景无法处理。因此它更适合一些对排版要求不高的场景。

```TypeScript
const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(200, 200)
const ctx = canvas.getContext('2d')

// Write "Awesome!"
ctx.font = '30px Impact'
ctx.rotate(0.1)
ctx.fillText('Awesome!', 50, 100)

// Draw line under text
var text = ctx.measureText('Awesome!')
ctx.strokeStyle = 'rgba(0,0,0,0.5)'
ctx.beginPath()
ctx.lineTo(50, 102)
ctx.lineTo(50 + text.width, 102)
ctx.stroke()

// Draw cat with lime helmet
loadImage('examples/images/lime-cat.jpg').then((image) => {
  ctx.drawImage(image, 50, 0, 70, 70)

  console.log('<img src="' + canvas.toDataURL() + '" />')
})
```

另一种就是通过 SVG 来模拟 Canvas 的效果，输出 SVG DOM 字符串。但它的实现会比较麻烦，也无法 100% 还原 Canvas 的效果。

很多 Canvas 渲染引擎本身也支持 SVG 渲染，即使不支持，也可以通过 canvas2svg 这个库来进行转换。

```TypeScript
var ctx = new C2S(500,500);

//draw your canvas like you would normally
ctx.fillStyle="red";
ctx.fillRect(100,100,100,100);

//serialize your SVG
var mySerializedSVG = ctx.getSerializedSvg();

//If you really need to you can access the shadow inline SVG created by calling:
var svg = ctx.getSvg();
```

对于更加通用的场景来说，在浏览器端使用 Canvas 渲染，服务端使用 SVG 渲染是更好的形式。当然如果追求更精准，也可以走 Puppeteer 的形式，主要看业务场景。

在新版 ECharts 里面，针对 SVG 服务端渲染的能力，还支持了 Virtual DOM 来代替 JSDOM，最后转换成 DOM 字符串。

使用了完全不同于 node\-canvas 和 SVG 的解决方式，由于他们在底层都使用了 Faster 渲染引擎，所有的绘制元素都是 Widget，可以脱水转换成下面 FVG 格式，是一种“伪”服务端渲染。

![Image](https://internal-api-drive-stream.larkoffice.com/space/api/box/stream/download/authcode/?code=ODViY2M5NzkyZDJiZTA4N2NhOTI5YzcwOTc0MmIxMjFfNzdlZjlmODI3NWY5NjFjZTM2Y2U4NzMzY2NjNzg0YTFfSUQ6NzI2MDM3NTEwNzQzOTkxOTEwOF8xNzgxMjkxNzgyOjE3ODEzNzgxODJfVjM)

首屏加载是下面这么几步：

获取首屏数据 \-\> 资源加载 \-\> 首屏数据反序列化 \-\> 初始化 Model 层 \-\> 渲染层计算排版数据 \-\> Canvas 渲染

里面直出了 FVG 数据，首屏加载了很小的用于转换 FVG 到 Widget 的 JS 文件，转换成 Widget 后就开始进行渲染。

相当于直接省略了 Mutation 反序列化、初始化 Model、计算排版数据等阶段，将 FVG 转换成 Widget 进行 Canvas 渲染，这一步非常接近于 React 的 hydrate，很巧妙。
