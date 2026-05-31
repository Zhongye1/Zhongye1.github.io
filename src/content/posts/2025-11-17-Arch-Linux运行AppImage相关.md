---
uuid: 1f51b700-c359-11f0-8c7c-dbe8bd99c6cd
title: 2025-11-17-Arch-Linux运行AppImage相关
mathjax: true
abbrlink: 11830
published: 2025-11-17 09:59:59
category: 工具
tags:
    - Arch Linux
    - AppImage
    - Linux
---

> [AppImage](https://link.zhihu.com/?target=https%3A//appimage.org/)是一种可执行文件格式，类似于 Windows 的 exe 文件，macOS 的 app 文件，不过 AppImage 是运行在 Linux 上的可执行文件，而且是可以运行在不同发行版本的 Linux，如 Ubuntu, Debian, openSUSE, RHEL, CentOS, Fedora, Arch Linux ...

运行时

1. 切换到文件路径 `cd [文件路径]`
2. 设置文件可以执行权限，`chmod +x my.AppImage`
3. 运行 AppImage `./my.AppImage`

第一次执行的时候可能会碰到`FUSE`相关的问题

```log
dlopen(): error loading libfuse.so.2

AppImages require FUSE to run.
You might still be able to extract the contents of this AppImage
if you run it with the --appimage-extract option.
See https://github.com/AppImage/AppImageKit/wiki/FUSE
for more information
```

此时在 Arch Linux 上需要安装`fuse2`

```bash
sudo pacman -S fuse2
```

更多关于 FUSE 的问题可以查看：[I get some errors related to something called “FUSE”](https://link.zhihu.com/?target=https%3A//docs.appimage.org/user-guide/troubleshooting/fuse.html)

在 Arch Linux 中创建 Desktop Entry（桌面条目）可以让你在应用启动器（如 GNOME、KDE 等）中显示应用图标。以下是创建步骤：



#### **创建 `.desktop`文件**

在以下目录之一创建 `.desktop`文件：

**系统级**（所有用户可用）：`/usr/share/applications/`
**用户级**（仅当前用户可用）：`~/.local/share/applications/`

例如，为用户创建条目：

```
mkdir -p ~/.local/share/applications
nano ~/.local/share/applications/myapp.desktop
```

---
---

模板参考（以 VSCode 为例）：

```
[Desktop Entry]
Version=1.0
Type=Application
Name=My Application
Comment=应用描述
Exec=/path/to/application/executable
Icon=/path/to/icon/image.png
Terminal=false
Categories=Utility;Development;
```

**`Type`**: 固定为 `Application`（也可以是 `Link`或 `Directory`）
**`Name`**: 显示在菜单中的名称
**`Exec`**: 可执行文件的**绝对路径**（支持参数，如 `%F`表示文件）
**`Icon`**: 图标路径（支持绝对路径或主题图标名，如 `firefox`）
**`Terminal`**: 是否在终端中运行（`true/false`）
**`Categories`**: 应用分类（参考 [freedesktop 规范](https://standards.freedesktop.org/menu-spec/latest/apa.html)）

#### 设置权限

```
chmod +x ~/.local/share/applications/myapp.desktop
```

#### **验证语法**

```
desktop-file-validate ~/.local/share/applications/myapp.desktop
```

#### **更新数据库**

```
update-desktop-database ~/.local/share/applications/
```

这时候就可以看到桌面上有相关的应用了
