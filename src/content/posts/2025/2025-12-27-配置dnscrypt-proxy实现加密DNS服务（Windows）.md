---
uuid: 679d8e00-e346-11f0-bc84-e1466639a44a
title: 2025-11-15-配置 dnscrypt-proxy 实现加密 DNS 服务（Windows）
mathjax: true
abbrlink: 32233
published: 2025-11-15 01:06:37
category: 笔记
tags:
    - DNS
    - 加密
    - 网络安全
    - Windows
---

## 简介

随着互联网的飞速发展，网络安全问题日益成为公众关注的焦点。从个人用户到企业机构，如何保护网络通信的安全性成为了不可忽视的问题。而在这之中，域名系统（DNS）作为互联网的基础服务之一，其安全性直接影响着整个网络环境的安全性。

DNS（Domain Name System），即域名系统，负责将人类易于记忆的域名转换为计算机可以识别的 IP 地址（如 192.168.1.1）。这一过程看似简单，但实际上 DNS 在互联网中扮演着至关重要的角色。然而，传统的 DNS 通信并不加密，这使得它成为了网络安全的一个薄弱环节。

近年来，随着网络安全威胁的不断增加，尤其是中间人攻击、DNS 劫持和数据窃取等恶意行为的频发，传统的明文 DNS 通信方式已经无法满足现代网络的安全需求。为了应对这一挑战，加密 DNS 技术应运而生。加密 DNS 通过在客户端与 DNS 服务器之间建立加密通道，确保了 DNS 查询的安全性。

### 一、传统 DNS 的安全性问题

在深入了解加密 DNS 之前，我们需要先认识传统 DNS 通信中存在的安全漏洞，以及这些漏洞可能带来的风险。

**中间人攻击（ManintheMiddle, MitM）**
传统的 DNS 通信是通过明文进行的，这意味着在数据传输过程中，任何处于客户端与 DNS 服务器之间的中间人都可以轻松截获和篡改 DNS 查询内容。这种中间人攻击可能导致以下后果：

**DNS 劫持**
攻击者可以将原本正常的域名解析请求重定向到恶意网站。
数据窃取：攻击者可以直接获取用户的网络使用信息，甚至窃取敏感数据。

**DNS 缓存投毒（Cache Poisoning）**
DNS 服务器通常会缓存查询结果以提高效率。然而，如果攻击者能够污染这一缓存，将导致后续的所有相关请求都被重定向到恶意地址。这种攻击方式不仅影响单个用户，还可能波及整个网络。

**数据泄露风险**
由于传统 DNS 通信缺乏加密保护，用户的每一次 DNS 查询都会暴露其访问的网站信息。这使得用户的上网行为可以被轻易监控，进而导致隐私泄露。

**缺乏身份验证机制**
传统的 DNS 协议中缺少有效的身份验证机制，攻击者可以伪造 DNS 响应，从而欺骗客户端或服务器，实施各类恶意活动。

### 二、加密 DNS 的优势

为了应对上述问题，加密 DNS 技术应运而生。通过在客户端与 DNS 服务器之间建立加密通道，加密 DNS 能够有效保护 DNS 通信的安全性，防止中间人攻击和其他恶意行为。

**数据传输加密**
加密 DNS（如 DNS over TLS  或  DNS over HTTPS）利用现代加密协议（如 TLS/SSL）对 DNS 查询和响应进行加密。这使得即使在中间人攻击的情况下，攻击者也无法窃取或篡改 DNS 通信内容。

**防止缓存投毒**
加密 DNS 通过严格的认证机制确保了 DNS 响应的真实性，从而有效防范 DNS 缓存投毒攻击。

**保护用户隐私**
加密 DNS 可以防止用户的 DNS 查询被第三方窃取或监控。这对于注重隐私的个人用户和企业用户来说尤为重要。

**增强网络安全性**
通过加密 DNS 通信，整个网络的安全性得到显著提升。这不仅保护了用户的上网行为，还为企业的内部网络提供了更高的安全防护。

---
---

## 配置 dnscrypt-proxy

DNS 加密方案有 DNS over HTTPS（DoH）以及 DNS over TLS（DoT）两种，dnsmasq 似乎是不支持这两种方式的。而 dnscrypt-proxy 是一个灵活的本地 DNS 代理工具，支持 DNSCrypt、DNS over HTTPS (DoH)、DNS over TLS (DoT) 等加密协议，可有效防止 DNS 查询被窃听、篡改或污染。

#### 1. 下载与解压

- 访问 GitHub 发布页面：https://github.com/DNSCrypt/dnscrypt-proxy/releases/latest
- 下载适用于 Windows 的压缩包（通常为 dnscrypt-proxy-win64-\*.zip）。
- 解压到任意目录，例如 C:\dnscrypt-proxy。
- 目录中将包含 dnscrypt-proxy.exe、example-dnscrypt-proxy.toml 等文件。

#### 2. 配置 dnscrypt-proxy.toml

配置文件应该为 `dnscrypt-proxy.toml`
修改 dnscrypt-proxy 监听的端口，因为 53 端口已经被 dnsmasq 占用，这里修改成 5353

```bash
listen_addresses = ['127.0.0.1:5353']
```

来到 sources 这一块，把自带的远程源全部注释掉，不然每次启动都要到远程源下载可用服务器列表，影响启动速度，自带源又都放在 github 上，下不到就会启动失败，用自己配的自定义服务器就行，下面会写

```bash
[sources]

  ## An example of a remote source from https://github.com/DNSCrypt/dnscrypt-resolvers

  # [sources.'public-resolvers']
  #   urls = ['https://raw.githubusercontent.com/DNSCrypt/dnscrypt-resolvers/master/v3/public-resolvers.md', 'https://download.dnscrypt.info/resolvers-list/v3/public-resolvers.md', 'https://ipv6.download.dnscrypt.info/resolvers-list/v3/public-resolvers.md', 'https://download.dnscrypt.net/resolvers-list/v3/public-resolvers.md']
  #   cache_file = '/var/cache/dnscrypt-proxy/public-resolvers.md'
  #   minisign_key = 'RWQf6LRCGA9i53mlYecO4IzT51TGPpvWucNSCh1CBM0QTaLn73Y7GFO3'
  #   refresh_delay = 72
  #   prefix = ''

  ## Anonymized DNS relays

  # [sources.'relays']
  #   urls = ['https://raw.githubusercontent.com/DNSCrypt/dnscrypt-resolvers/master/v3/relays.md', 'https://download.dnscrypt.info/resolvers-list/v3/relays.md', 'https://ipv6.download.dnscrypt.info/resolvers-list/v3/relays.md', 'https://download.dnscrypt.net/resolvers-list/v3/relays.md']
  #   cache_file = '/var/cache/dnscrypt-proxy/relays.md'
  #   minisign_key = 'RWQf6LRCGA9i53mlYecO4IzT51TGPpvWucNSCh1CBM0QTaLn73Y7GFO3'
  #   refresh_delay = 72
  #   prefix = ''
```

来到最底下，加上自定义服务器，可用的服务器可以在这里找到
https://dnscrypt.info/public-servers

```bash
[static]

[static.'aliyun']
stamp = 'sdns://AgAAAAAAAAAACTIyMy41LjUuNSCY49XlNq8pWM0vfxT3BO9KJ20l4zzWXy5l9eTycnwTMA5kbnMuYWxpZG5zLmNvbQovZG5zLXF1ZXJ5'

[static.'txyun']
stamp = 'sdns://AgAAAAAAAAAACjEuMTIuMTIuMTIgj0tzmXxLBOpQ_q-pGiQx1CvKa1TCO8-du_VyJJOU4QwHZG9oLnB1YgovZG5zLXF1ZXJ5'
```

来到这一块，配置使用自定义服务器

```bash
# server_names = ['scaleway-fr', 'google', 'yandex', 'cloudflare']
server_names = ['aliyun', 'txyun']
```

**引导解析器（bootstrap_resolvers）**：用于初始加载公共解析器列表。若默认解析器（Quad9 和 Google）被阻断或不可用，推荐修改为可靠组合：

```bash
bootstrap_resolvers = ['1.1.1.1:53', '1.0.0.1:53', '8.8.8.8:53', '9.9.9.10:9953']
```

（Cloudflare 高度可靠；Quad9 的 9953 端口可绕过端口 53 阻断。）
修改检测网络是否连通的地址，可以是任意 ip 的任意端口，哪怕没有响应，只要端口是打开的，就认为网络连通

```bash
# netprobe_address = '9.9.9.9:53'
netprobe_address = '223.5.5.5:53'
```

因为集群环境没有 ipv6，顺便禁用 ipv6 的 AAAA 查询

```bash
# block_ipv6 = false
block_ipv6 = true
```

启用 dns 查询日志（可选）

```bash
[query_log]
  file = '/var/log/dnscrypt-proxy/query.log'
```

#### 3. 测试运行

以管理员身份打开命令提示符，导航到解压目录：

```powershell
cd C:\[dir]\dnscrypt-proxy
```

运行代理：

```powershell
dnscrypt-proxy.exe
```

观察控制台输出，应出现 “Source [public-resolvers] loaded” 和 “dnscrypt-proxy is ready”。

测试解析：

```powershell
nslookup example.com 127.0.0.1
```

若成功，返回正常 IP 地址。按 Ctrl+C 停止测试。

#### 4. 安装为 Windows 服务（开机自动运行）

在同一管理员命令提示符中执行：

```powershell
dnscrypt-proxy.exe -service install
```

启动服务：

```powershell
dnscrypt-proxy.exe -service start
```

设置自动启动（可选，默认已自动）：
使用 services.msc（Win + R 输入）找到 “dnscrypt-proxy” 服务，属性中设为 “自动” 或 “自动（延迟启动）”。
或命令：

```powershell
sc config dnscrypt-proxy start= delayed-auto
```

#### 5. 配置系统 DNS

打开网络设置：右键网络图标 > “打开网络和 Internet 设置” > “更改适配器选项”。
右键当前网络适配器 > 属性 > Internet 协议版本 4 (TCP/IPv4) > 属性。

![alt text](https://picx.zhimg.com/v2-080621fc2c11e65c8283b78fae7a135d_r.jpg)

选择 “使用下面的 DNS 服务器地址”：
首选 DNS 服务器：127.0.0.1，备选 DNS 服务器：可留空或设为公共非加密（如 1.1.1.1）
然后确认并应用

若要清空 DNS 缓存：

```powershell
ipconfig /flushdns
```

#### 6. 管理

**服务管理**：

- 启动/停止/重启：dnscrypt-proxy.exe -service start/stop/restart
- 状态查询：sc query dnscrypt-proxy（显示 RUNNING 或 STOPPED）
- 图形化：services.msc 中管理 “dnscrypt-proxy”。
- 卸载：dnscrypt-proxy.exe -service uninstall
- 更新时：停止服务，替换可执行文件，重启服务。

此配置后所有 DNS 查询将通过本地 127.0.0.1 代理转发至上游加密服务器实现隐私保护
