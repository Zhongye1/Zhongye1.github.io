---
uuid: 093daea0-1054-11f0-9848-0b39a1ee406d
title: 给你的网站加上 Github Contributions Chart！
cover: https://pic4.zhimg.com/80/v2-bb2a92057c6171cdd105d23228fca75f_720w.webp
mathjax: true
description: 给你的网站加上 Github Contributions Chart！
abbrlink: 14584
published: 2024-07-12 20:02:50
category: 笔记
tags:
  - 博客
  - GitHub
  - 数据可视化
---

Github 的提交记录这个小绿色日历实际上是我最喜欢的数据可视化之一，来看一下 Github “提交狂魔” [@ruanyf](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fqq52o.me%2Fgo%2FaHR0cHM6Ly9naXRodWIuY29tL3J1YW55Zg%3D%3D&source=article&objectId=1430371) 的提交记录

<img src="https://ghchart.rshah.org/ruanyf" />

<img src="https://ghchart.rshah.org/409ba5/ruanyf" />

以上是如何做到的呢？可以用现成的 API（感谢作者`2016rshah`提供此 API），官网地址：[https://ghchart.rshah.org/](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fqq52o.me%2Fgo%2FaHR0cHM6Ly9naGNoYXJ0LnJzaGFoLm9yZy8%3D&source=article&objectId=1430371)

源码在 Github 上开源，仓库地址：[https://github.com/2016rshah/githubchart-api](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fqq52o.me%2Fgo%2FaHR0cHM6Ly9naXRodWIuY29tLzIwMTZyc2hhaC9naXRodWJjaGFydC1hcGk%3D&source=article&objectId=1430371)

#### 使用

怎么使用这个 API 呢？很简单，使用`img`标签引用即可

```javascript
<img src="https://ghchart.rshah.org/Zhongye1" />
```

**将`src`中的`Zhongye1`使用自己的 Github 用户名替换即可**

也支持修改配色，只需在用户名前加上所需的十六进制颜色代码即可。例如，如果想要一个基于十六进制颜色的蓝色主题图表`#409ba5`

## 自定义颜色

例如，如果你想要一个基于十六进制颜色的蓝色主题图表 `#409ba5`，只需在用户名前加上所需的十六进制颜色代码即可。例如，如果想要一个基于十六进制颜色的蓝色主题图表`#409ba5`

```javascript
<img src="https://ghchart.rshah.org/409ba5/Zhongye1" />
```

效果是这样的

<img src="https://ghchart.rshah.org/409ba5/Zhongye1" />

<center>Zhongye1's Github Chart </center>

<img src="https://pic1.zhimg.com/v2-9927aa01d3a3b97a0fc9ba5d4a4c1d47_720w.webp?source=d16d100b"   width=15% >
=15% >
