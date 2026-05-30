---
uuid: 093d8792-1054-11f0-9848-0b39a1ee406d
title: LiteLoaderQQNT
    - Github项目
mathjax: true
abbrlink: 12035
cover: "https://pic2.zhimg.com/v2-f9301711f5a93d812954b0c703e0386d_b.webp"
description: 为你的QQ添加各种插件，并实现动态背景、美化主题、增加功能等功能
published: 2024-06-25 11:03:08
---

# LiteLoaderQQNT

LiteLoaderQQNT 是 QQNT 的插件加载器，一般在 QQNT 的环境内简称为 LiteLoader。
它可以让你自由地为 QQNT 添加各种插件，并实现例如美化主题、增加功能等各种功能。

（比如防撤回，设置动态背景啥的

![动图](https://pic2.zhimg.com/v2-f9301711f5a93d812954b0c703e0386d_b.webp)

_（波奇可爱捏_

# 安装[](https://liteloaderqqnt.github.io/guide/install.html#安装)

_此文档为 LiteLoaderQQNT 1.1.x 编写_

---

---

## （法一）（推荐）第三方工具[](https://liteloaderqqnt.github.io/guide/install.html#第三方工具)

一些社区开发的安装工具来帮助你快速安装，或跳过此条目来阅读官方安装教程

link LiteLoaderQQNT 快速安装, https://github.com/Mzdyl/LiteLoaderQQNT_Install/, https://avatars.githubusercontent.com/u/95263282?v=4

## （法二）

你需要先下载 LiteLoaderQQNT 到任意位置，以下有两种方式

-   **通过 Release**

    前往 LiteLoaderQQNT 仓库，在 Release 中 Latest 内，下载 `LiteLoaderQQNT.zip` 文件，将压缩包内 LiteLoaderQQNT 目录解压到任意位置

    LiteLoaderQQNT：https://github.com/LiteLoaderQQNT/LiteLoaderQQNT

-   **通过 Clone**

    使用 Git 工具将 LiteLoaderQQNT 仓库 Clone 到本地任意位置

    shell

    ```
    git clone --depth 1 https://github.com/LiteLoaderQQNT/LiteLoaderQQNT.git
    ```

找到 QQNT 安装目录，编辑 `resources\app\app_launcher\index.js` 文件，在最前端插入一行`require(String.raw`此处为你 LiteLoaderQQNT 目录路径`);`

javascript

```
require(String.raw`C:\LiteloaderQQNT`); // 此处换成你 LiteLoaderQQNT 目录位置
require('./launcher.node').load('external_index', module);
```

请确保拥有 QQNT 安装目录的读写权限！如果不想给予 QQNT 安装目录读写权限

-   按照下文 `存储位置` 一节进行设置
-   将 `LiteLoaderQQNT/src/preload.js` 复制到 `QQNT/resources/app/versions/此处为版本号/application/preload.js`

LiteLoaderQQNT 会在第二步骤的文件不一致或没有文件时自动复制，也就是说在更新本体后需再进行一次这步骤

---

---

# 插件[](https://liteloaderqqnt.github.io/guide/plugins.html#插件)

此文档为 LiteLoaderQQNT 1.1.x 编写

## 安装[](https://liteloaderqqnt.github.io/guide/plugins.html#安装)

### 方式一：手动安装[](https://liteloaderqqnt.github.io/guide/plugins.html#手动安装)

如果你有现成的插件，请先确保是与 LiteLoaderQQNT 兼容的，并且拥有对应依赖插件

将插件目录移动到 `LiteLoaderQQNT/plugins` 文件夹内，如果插件是压缩包请先解压

### 方式二（推荐）：LiteLoaderQQNT Plugin 插件安装助手

可以先手动安装第三方插件市场类插件，在其中安装插件

### https://github.com/ltxhhz/LL-plugin-list-viewer/

## 功能

-   插件列表查看
-   插件检查更新
-   插件安装（支持镜像）
-   插件卸载
-   插件查找

[![img](https://github.com/ltxhhz/LL-plugin-list-viewer/raw/main/imgs/1.png)](https://github.com/ltxhhz/LL-plugin-list-viewer/blob/main/imgs/1.png)

-   依赖查找

[![gif](https://github.com/ltxhhz/LL-plugin-list-viewer/raw/main/imgs/2.gif)](https://github.com/ltxhhz/LL-plugin-list-viewer/blob/main/imgs/2.gif)

## 使用方法

### 法一：下载发行版

https://github.com/ltxhhz/LL-plugin-list-viewer/releases/tag/v1.3.1

1. 下载发行版并解压
2. 将文件夹移动至 `LiteLoaderQQNT数据目录/plugins/` 下面
3. 重启 QQNT

### 法二：使用 git clone

1. clone 本仓库 `git clone https://github.com/ltxhhz/LL-plugin-list-viewer.git`
2. 运行以下命令

```
npm i
npm run build
```

1. 如果 clone 到了 `plugins` 目录下，修改 `manifest.json` 中 `inject` 为

```
"injects": {
    "main": "./dist/main/index.js",
    "preload": "./dist/preload/index.js",
    "renderer": "./dist/renderer/index.js"
}
```

> 否则可以将 `dist` 目录移动到 `LiteLoaderQQNT数据目录/plugins/` 目录下

### 使用

**安装完后打开 QQ 打开设置页面选择插件列表即可**

# 附录

## 寻找插件[](https://liteloaderqqnt.github.io/guide/plugins.html#寻找)

### 插件列表[](https://liteloaderqqnt.github.io/guide/plugins.html#插件列表)

官方维护着一份插件列表，收录了已知的大部分插件，可在官网首页中查看详情

### 通过搜索[](https://liteloaderqqnt.github.io/guide/plugins.html#通过搜索)

LiteLoaderQQNT 的插件基本发布在 GitHub，善用搜索可以快速的找到所需插件

比如在搜索框键入关键词`LiteLoader`和`插件`，即可找到大量[LiteLoaderQQNT 生态的插件](https://github.com/search?q=LiteLoader+插件&type=repositories)

### 官网首页[](https://liteloaderqqnt.github.io/guide/plugins.html#官网首页)

LiteLoaderQQNt 官网下面已列出全部已收录插件，点击卡片即可跳转至对应仓库

### 插件市场[](https://liteloaderqqnt.github.io/guide/plugins.html#插件市场)

有一些第三方插件市场，手动安装后可列出大量插件

## 修补[](https://liteloaderqqnt.github.io/guide/install.html#修补)

**此条目仅需 Windows 用户查看，其他系统无需继续阅读此条目**

由于 Windows 系统平台 QQNT 被添加文件完整性验证，你需要额外步骤来解除限制,有下列四种方式：

-   **DLLHijackMethod**

    在 Release 下载 dll 文件，重命名为 dbghelp.dll 放入 QQ.exe 同级目录下即可
    https://github.com/LiteLoaderQQNT/QQNTFileVerifyPatch/tree/DLLHijackMethod

-   **QQNTFileVerifyPatch**

    在 Release 下载 exe 文件，运行将弹出文件选择框，进入 QQNT 安装目录选择 QQ.exe 开始修补，每次更新都需要重新修补
    https://github.com/LiteLoaderQQNT/QQNTFileVerifyPatch

-   **PatcherNFixer**

    在 Release 下载 zip 文件，解压后运行 exe 将弹出图形化界面，根据软件界面提示选择相应选项与修补方式，每次更新都需要重新修补
    https://github.com/xh321/LiteLoaderQQNT-PatcherNFixer

-   **V8Killer**

    此方式目前过于麻烦，且需要自行寻找对应的 RVA 偏移量，只说明此方式的可行性，需自行探索使用方式
    https://github.com/ShellWen/v8_killer

## 检查[](https://liteloaderqqnt.github.io/guide/install.html#检查)

**按照上述教程完成安装后，有两种方法检查 LiteLoaderQQNT 是否成功安装**

-   运行 QQNT 并打开设置，查看左侧列表是否出现 `LiteLoaderQQNT` 选项
-   使用终端运行 QQNT 查看是否有 LiteLoaderQQNT 相关内容输出显示

如果有显示，即安装成功，玩的开心！

## 存储目录[](https://liteloaderqqnt.github.io/guide/install.html#存储目录)

支持设置 `LITELOADERQQNT_PROFILE` 环境变量指定 `data` `plugins` `config.json` 存储位置，即可不在本体目录进行读写操作，比如 MacOS 与 Linux 平台 QQNT，以及类似于 flatpak 打包的 QQNT，让其实现成为可能

如果你想将本体与存储目录合并在一起（便携软件）需将 `LITELOADERQQNT_PROFILE` 环境变量删除，将 `data` `plugins` `config.json` 移动回本体根目录下

## 更新 QQNT[](https://liteloaderqqnt.github.io/guide/install.html#更新qqnt)

每次更新 QQNT 都需要重新根据上述教程重新修补

## 版本支持[](https://liteloaderqqnt.github.io/guide/introduction.html#版本支持)

支持 QQNT 桌面端 全架构 最低 `20667` 版本到官网最新版
更老的版本也支持，只是设置界面样式会崩坏，不介意也可以用

## 外部链接[](https://liteloaderqqnt.github.io/guide/introduction.html#外部链接)

### Telegram[](https://liteloaderqqnt.github.io/guide/introduction.html#telegram)

群聊：https://t.me/LiteLoaderQQNT
频道：https://t.me/LiteLoaderQQNT_Channel

### LiteLoaderQQNT[](https://liteloaderqqnt.github.io/guide/introduction.html#liteloaderqqnt)

框架本体：https://github.com/LiteLoaderQQNT/LiteLoaderQQNT
插件模板：https://github.com/LiteLoaderQQNT/Plugin-Template
插件列表：https://github.com/LiteLoaderQQNT/Plugin-List

ist
