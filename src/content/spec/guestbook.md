---
title: "留言板"
description: "在这里留下你的足迹"
---

<script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>

来都来了，在这里留下你的足迹！

**本站总访问量<span id="busuanzi_value_site_pv"></span>次**

**本站访客数<span id="busuanzi_value_site_uv"></span>人次**

<img src="https://picx.zhimg.com/v2-68ff3d189ef7ec060222261a98892e67_720w.webp?source=d16d100b" width="50%">

<div class="container" style="font-size:20px">
    <div id="current-datetime">
        <p> Hello, it is <span id="current-date"></span>  -  <span id="current-time"></span>  -  <span id="current-day-of-week"></span> now!<br> Without you here again.</p>
    </div>
    <div id="elapsed-time">
        <p>今年已经过去了<span id="elapsed-days"></span>天 <span id="elapsed-hours"></span>小时 <span id="elapsed-minutes"></span>分钟 <span id="elapsed-seconds"></span>秒 <span id="elapsed-milliseconds"></span>ms</p>
    </div>
    <div id="percentage">
        <p>今年已经过去<span id="elapsed-percentage"></span>%</p>
    </div>

<script>
function updateElapsedTime() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0, 0, 0, 0, 0);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 0, 0, 0, 0, 0);
    const elapsedTime = now - startOfYear;
    const totalYearTime = endOfYear - startOfYear;
    const elapsedDays = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
    const elapsedHours = Math.floor((elapsedTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const elapsedSeconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
    const elapsedMilliseconds = Math.floor((elapsedTime % 10)); // 精确到0.1毫秒
    const elapsedPercentage = (elapsedTime / totalYearTime) * 100;

    document.getElementById('elapsed-days').innerText = elapsedDays;
    document.getElementById('elapsed-hours').innerText = elapsedHours;
    document.getElementById('elapsed-minutes').innerText = elapsedMinutes;
    document.getElementById('elapsed-seconds').innerText = elapsedSeconds;
    document.getElementById('elapsed-milliseconds').innerText = elapsedMilliseconds.toFixed(1);
    document.getElementById('elapsed-percentage').innerText = elapsedPercentage.toFixed(10); // 修改为两位小数
    
    // 更新当前时间和日期以及星期
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 注意月份从0开始
    const day = now.getDate().toString().padStart(2, '0');
    const dayOfWeek = ['Sun', 'Mon.', 'Tues.', 'Wed.', 'Thur.', 'Fri.', 'Sat.'][now.getDay()];
    
    document.getElementById('current-time').innerText = `${hours}:${minutes}:${seconds}`;
    document.getElementById('current-date').innerText = `${year}-${month}-${day}`;
    document.getElementById('current-day-of-week').innerText = dayOfWeek;
}

// 每1秒更新一次
const timerInterval = setInterval(updateElapsedTime, 1);
updateElapsedTime(); // 初始化显示
</script>

<img src="https://picx.zhimg.com/v2-1e47d2da440013ae7d4262f54c26dd52_720w.webp?source=d16d100b" width="50%">

_Yeah don't believe anything that psychiatrist says that anime girl you keep seeing is real and she does love you._
