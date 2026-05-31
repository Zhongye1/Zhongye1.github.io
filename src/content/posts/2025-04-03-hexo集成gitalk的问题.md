---
uuid: 973537f0-1054-11f0-9870-e9f6383d9f4a
title: hexo集成gitalk时的Error Validation Failed问题
abbrlink: 18261
published: 2025-04-03 14:26:34
category: 博客
tags:
    - 博客
    - Hexo
    - Gitalk
    - 评论系统
---

## hexo 集成 gitalk 时 Error: Validation Failed 问题

Hexo 集成 Gitalk 后，某些文章下方的评论显示`Error: Validation Failed`

Gitalk 会限制 Label name 的长度，有些文章生成的 URL 长度会超过限制，所以导致这个问题

![img](https://user-images.githubusercontent.com/16487416/38803021-8740f06c-41a0-11e8-955c-eb3ee9cc07d9.png)

## 解决方案

可以集成一个对文章生成唯一 id 的插件

### hexo-abbrlink

在博客根目录下安装

```
npm install --save hexo-abbrlink
```

并修改配置文件`_config.yml`

```
permalink: [EveryWordsYouWant]/:abbrlink/
```

再 _hexo cl && hexo g && hexo d_ 即可

![img](https://pica.zhimg.com/80/v2-0b7a582d36baa6ffd77cccb429f6f244_720w.webp)
