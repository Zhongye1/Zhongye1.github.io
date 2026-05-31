---
title: typora图床设置
tags:
  - null
categories:
  - 博客美化
mathjax: true
abbrlink: 32d01401
date: 2024-07-31 12:56:23
description: typora+picgo+兰空图床打造markdown写作环境
cover: https://image.imtop1.moe/ZZOkbW.webp
---



兰空图床安装可以去看另一篇文章 [搭建一个属于自己的图床](https://blog.imtop1.moe/archives/299/)

## 一、安装和配置picgo

1. 首先到picgo的官方仓库下载安装包 [Molunerfinn/PicGo: A simple & beautiful tool for pictures uploading built by vue-cli-electron-builder (github.com)](https://github.com/Molunerfinn/PicGo) 安装过程一路next就ok，安装完成后的界面：

   [![picgo0](https://image.imtop1.moe/oPOFUp.webp)](https://image.imtop1.moe/oPOFUp.webp)

2. 安装兰空图床插件

   这里可以直接到picgo的插件设置里面搜索兰空安装插件，或者是直接到官方github下载并且手动安装，链接：[hellodk34/picgo-plugin-lankong: A PicGo uploader for 兰空图床 lsky-pro，支持 V1 和 V2。 (github.com)](https://github.com/hellodk34/picgo-plugin-lankong)教程在链接里面有。

   [![pic1](https://image.imtop1.moe/euJ6uz.webp)](https://image.imtop1.moe/euJ6uz.webp)

3. 获取兰空图床token

   这里使用postman请求一个token，信息按照图片里的填就ok，记得把域名换成你自己图床的域名。

   [![pic2](https://image.imtop1.moe/mV6yuf.webp)](https://image.imtop1.moe/mV6yuf.webp)

   1. 设置picgo

   打开图床设置，选择lankong，照着写即可。

   [![pic3](https://image.imtop1.moe/pZXL24.webp)](https://image.imtop1.moe/pZXL24.webp)

4. 检测效果

   图床选lankong，随便上传一张图片，看看能不能成功。

   [![pic4](https://image.imtop1.moe/X08dZe.webp)](https://image.imtop1.moe/X08dZe.webp)

   [![pic5](https://image.imtop1.moe/HDM3Ef.webp)](https://image.imtop1.moe/HDM3Ef.webp)

## 二、对接typora

打开typora，前往偏好设置，进行如下设置：

[![pic6](https://image.imtop1.moe/ZZOkbW.webp)](https://image.imtop1.moe/ZZOkbW.webp)

并点击验证图片上传选项：

[![pic7](https://image.imtop1.moe/L8Z6yw.webp)](https://image.imtop1.moe/L8Z6yw.webp)

能出现如图界面说明成功了。

现在你往typora拖拽图片能自动上传到兰空图床
