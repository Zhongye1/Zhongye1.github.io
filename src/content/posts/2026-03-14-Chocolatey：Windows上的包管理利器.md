---
uuid: 0213a810-1fcf-11f1-bb31-61446932a1bd
title: 2026-03-14-Windows 上的包管理利器 - Chocolatey
mathjax: true
abbrlink: 26594
published: 2026-03-15 01:55:37
category: 工具
tags:
    - Chocolatey
    - Windows
    - 包管理
---

Chocolatey 是一款专为 Windows 系统开发的、基于 NuGet 的包管理器工具，类似于 Node.js 的 npm，MacOS 的 brew，Ubuntu 的 apt-get，它简称为 choco。Chocolatey 的设计目标是成为一个去中心化的框架，便于开发者按需快速安装应用程序和工具。

Chocolatey 的官网： [https://chocolatey.org/](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fchocolatey.org%2F&objectId=2329788&objectType=1&contentType=undefined)

![alt text](https://pic1.zhimg.com/70/v2-5516e2e66847ae51dbb4a9cd4db0424e_1440w.avis?source=172ae18b&biz_tag=Post)

## 安装

### Command Prompt

```shell
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
```

### PowerShell

> 以**管理员**权限打开**Command Prompt**或**PowerShell**

```shell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

或者

```shell
Set-ExecutionPolicy RemoteSigned
iwr https://chocolatey.org/install.ps1 -UseBasicParsing | iex
```

> 在终端执行**choco** 检测是否安装成功

### 基本命令

```shell
choco search <keyword>  # 搜索 <keyword> 包
choco list <keyword>    # 列出 <keyword> 包
choco install <package1 package2 ...>   # 安装 <package1,package2 ...> 包
choco install <package>  -version <version>   # 安装 <package> 的指定版本
choco uninstall <package>   # 卸载 <package> 包
choco version <package> # 查看 <package> 包的版本情况
choco upgrade <package>    # 更新 <package> 包
choco pin <package>  # 固定 <package> 包的版本，防止被升级

# 列出本地已安装的包

choco list -local-only
choco list -lo

# 列出 Windows 系统已安装的软件

choco list -li
choco list -lai
# 升级所有已安装的包

choco upgrade all -y
```
