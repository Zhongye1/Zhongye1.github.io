---
abbrlink: 6951
uuid: 8d3f6a52-5b1e-4c77-9a0d-2e7c41b6f903
title: 再谈计算机组成原理 Vol.3 - 多核、一致性与内存序
mathjax: false
published: 2026-10-19 20:50:00
category: 笔记
description: '从 MESI 到内存屏障，多个核心是怎么看到同一份数据的'
cover: ''
tags:
  - 计组
  - 并发
---

## CPU 缓存一致性

### CPU Cache 的数据写入

随着时间的推移，CPU 和内存的访问性能相差越来越大，于是就在 CPU 内部嵌入了 CPU Cache（高速缓存），CPU Cache 离 CPU 核心相当近，因此它的访问速度是很快的，于是它充当了 CPU 与内存之间的缓存角色。

CPU Cache 通常分为三级缓存：L1 Cache、L2 Cache、L3 Cache，级别越低的离 CPU 核心越近，访问速度也快，但是存储容量相对就会越小。其中，在多核心的 CPU 里，每个核心都有各自的 L1/L2 Cache，而 L3 Cache 是所有核心共享使用的。

![多核心 CPU 的 L1/L2/L3 缓存结构](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost2/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/%E5%AD%98%E5%82%A8%E7%BB%93%E6%9E%84/CPU-Cache.png)

CPU Cache 是由很多个 Cache Line 组成的，Cache Line 是 CPU 从内存读取数据的基本单位，而 Cache Line 是由各种标志（Tag）+ 数据块（Data Block）组成

![Cache Line 的组成：有效位、组标记、数据块](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E7%BC%93%E5%AD%98%E4%B8%80%E8%87%B4%E6%80%A7/Cache%E7%9A%84%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.png)

考虑性能的话当然期望 CPU 读取数据的时候，都是尽可能地从 CPU Cache 中读取，而不是每一次都要从内存中获取数据。所以要尽可能写出缓存命中率高的代码，这样就有效提高程序的性能，具体的做法可以见上一篇文章。

事实上，数据不光是只有读操作，还有写操作，那么如果数据写入 Cache 之后，内存与 Cache 相对应的数据将会不同，这种情况下 Cache 和内存数据都不一致了，于是我们是要把 Cache 中的数据同步到内存里的。

所以开发者要考虑在什么时机才把 Cache 中的数据写回到内存呢？为了应对这个问题有两种针对写入数据的方法：

- 写直达（_Write Through_）
- 写回（_Write Back_）

#### 写直达

保持内存与 Cache 一致性最简单的方式是，**把数据同时写入内存和 Cache 中**，这种方法称为**写直达（*Write Through*）**。

![写直达：数据同时写入 Cache 与内存](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E7%BC%93%E5%AD%98%E4%B8%80%E8%87%B4%E6%80%A7/%E5%86%99%E7%9B%B4%E8%BE%BE.png)

在这个方法里，写入前会先判断数据是否已经在 CPU Cache 里面了：

- 如果数据已经在 Cache 里面，先将数据更新到 Cache 里面，再写入到内存里面；
- 如果数据没有在 Cache 里面，就直接把数据更新到内存里面。

写直达法很直观，也很简单，但是问题明显，无论数据在不在 Cache 里面，每次写操作都会写回到内存，这样写操作将会花费大量的时间，无疑性能会受到很大的影响。

#### 写回

因为写直达由于每次写操作都会把数据写回到内存而导致影响性能，于是为了要减少数据写回内存的频率，就出现了**写回（*Write Back*）的方法**。

在写回机制中，**当发生写操作时，新的数据仅仅被写入 Cache Block 里，只有当修改过的 Cache Block「被替换」时才需要写到内存中**，减少了数据写回内存的频率，这样便可以提高系统的性能。

![写回：脏块被替换时才写回内存](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E7%BC%93%E5%AD%98%E4%B8%80%E8%87%B4%E6%80%A7/%E5%86%99%E5%9B%9E1.png)

具体的做法：

- 如果当发生写操作时，数据已经在 CPU Cache 里的话，则把数据更新到 CPU Cache 里，同时标记 CPU Cache 里的这个 Cache Block 为脏（Dirty）的，这个脏的标记代表这个时候，我们 CPU Cache 里面的这个 Cache Block 的数据和内存是不一致的，这种情况是不用把数据写到内存里的；
- 如果当发生写操作时，数据所对应的 Cache Block 里存放的是「别的内存地址的数据」的话，就要检查这个 Cache Block 里的数据有没有被标记为脏的：
  - 如果是脏的话，我们就要把这个 Cache Block 里的数据写回到内存，然后再把当前要写入的数据，先从内存读入到 Cache Block 里（注意，这一步不是没用的，具体为什么要这一步，可以看这个[回答](https://stackoverflow.com/questions/26672661/for-write-back-cache-policy-why-data-should-first-be-read-from-memory-before-w)），然后再把当前要写入的数据写入到 Cache Block，最后也把它标记为脏的；
  - 如果不是脏的话，把当前要写入的数据先从内存读入到 Cache Block 里，接着将数据写入到这个 Cache Block 里，然后再把这个 Cache Block 标记为脏的就好了。

可以发现写回这个方法，在把数据写入到 Cache 的时候，只有在缓存不命中，同时数据对应的 Cache 中的 Cache Block 为脏标记的情况下，才会将数据写到内存中，而在缓存命中的情况下，则在写入后 Cache 后，只需把该数据对应的 Cache Block 标记为脏即可，而不用写到内存里。

这样的好处是，如果我们大量的操作都能够命中缓存，那么大部分时间里 CPU 都不需要读写内存，自然性能相比写直达会高很多。

为什么缓存没命中时，还要定位 Cache Block？这是因为此时是要判断数据即将写入到 cache block 里的位置，是否被「其他数据」占用了此位置，如果这个「其他数据」是脏数据，那么就要帮忙把它写回到内存。

CPU 缓存与内存使用「写回」机制的流程图如下，左半部分就是读操作的流程，右半部分就是写操作的流程，也就是上面讲的内容。

![Cache 读操作与写回策略的完整流程](https://cdn.xiaolincoding.com/gh/xiaolincoder/redis/%E5%85%AB%E8%82%A1%E6%96%87/writeback.png)

### 缓存一致性问题

现在 CPU 都是多核的，由于 L1/L2 Cache 是多个核心各自独有的，那么会带来多核心的**缓存一致性（*Cache Coherence*）** 的问题，如果不能保证缓存一致性的问题，就可能造成结果错误。

那缓存一致性的问题具体是怎么发生的呢？这里以一个含有两个核心的 CPU 作为例子看一看。

假设 A 号核心和 B 号核心同时运行两个线程，都操作共同的变量 i（初始值为 0 ）。

![两个核心同时操作共享变量 i](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E7%BC%93%E5%AD%98%E4%B8%80%E8%87%B4%E6%80%A7/%E7%BC%93%E5%AD%98%E4%B8%80%E8%87%B4%E6%80%A7%E9%97%AE%E9%A2%98%E4%BE%8B%E5%AD%90.png)

这时如果 A 号核心执行了 `i++` 语句的时候，为了考虑性能，使用了前面所说的写回策略，先把值为 `1` 的执行结果写入到 L1/L2 Cache 中，然后把 L1/L2 Cache 中对应的 Block 标记为脏的，这个时候数据其实没有被同步到内存中的，因为写回策略，只有在 A 号核心中的这个 Cache Block 要被替换的时候，数据才会写入到内存里。

如果这时旁边的 B 号核心尝试从内存读取 i 变量的值，则读到的将会是错误的值，因为刚才 A 号核心更新 i 值还没写入到内存中，内存中的值还依然是 0。**这个就是所谓的缓存一致性问题，A 号核心和 B 号核心的缓存，在这个时候是不一致，从而会导致执行结果的错误。**

![A 核更新未写回，B 核读到旧值](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E7%BC%93%E5%AD%98%E4%B8%80%E8%87%B4%E6%80%A7/%E7%BC%93%E5%AD%98%E4%B8%80%E8%87%B4%E6%80%A7%E9%97%AE%E9%A2%98%E4%BE%8B%E5%AD%902.png)

那么，要解决这一问题，就需要一种机制，来同步两个不同核心里面的缓存数据。要实现的这个机制的话，要保证做到下面这 2 点：

- 第一点，某个 CPU 核心里的 Cache 数据更新时，必须要传播到其他核心的 Cache，这个称为**写传播（*Write Propagation*）**；
- 第二点，某个 CPU 核心里对数据的操作顺序，必须在其他核心看起来顺序是一样的，这个称为**事务的串行化（*Transaction Serialization*）**。

第一点写传播很容易就理解，当某个核心在 Cache 更新了数据，就需要同步到其他核心的 Cache 里。而对于第二点事务的串行化，我们举个例子来理解它。

假设我们有一个含有 4 个核心的 CPU，这 4 个核心都操作共同的变量 i（初始值为 0 ）。A 号核心先把 i 值变为 100，而同一时间 B 号核心把 i 值变为 200，这里两个修改，都会「传播」到 C 和 D 号核心。

![四个核心接收更新事件的顺序不同](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E7%BC%93%E5%AD%98%E4%B8%80%E8%87%B4%E6%80%A7/%E4%BA%8B%E4%BB%B6%E9%A1%BA%E5%BA%8F%E9%97%AE%E9%A2%98.png)

那么问题就来了，C 号核心先收到了 A 号核心更新数据的事件，再收到 B 号核心更新数据的事件，因此 C 号核心看到的变量 i 是先变成 100，后变成 200。

而如果 D 号核心收到的事件是反过来的，则 D 号核心看到的是变量 i 先变成 200，再变成 100，虽然是做到了写传播，但是各个 Cache 里面的数据还是不一致的。

所以，要保证 C 号核心和 D 号核心都能看到**相同顺序的数据变化**，比如变量 i 都是先变成 100，再变成 200，这样的过程就是事务的串行化。

要实现事务串行化，要做到 2 点：

- CPU 核心对于 Cache 中数据的操作，需要同步给其他 CPU 核心；
- 要引入「锁」的概念，如果两个 CPU 核心里有相同数据的 Cache，那么对于这个 Cache 数据的更新，只有拿到了「锁」，才能进行对应的数据更新。

接下来是写传播和事务串行化的技术实现细节。

### 总线嗅探

写传播的原则就是当某个 CPU 核心更新了 Cache 中的数据，要把该事件广播通知到其他核心。最常见实现的方式是**总线嗅探（*Bus Snooping*）**。

这里以前面的 i 变量例子来说明总线嗅探的工作机制，当 A 号 CPU 核心修改了 L1 Cache 中 i 变量的值，通过总线把这个事件广播通知给其他所有的核心，然后每个 CPU 核心都会监听总线上的广播事件，并检查是否有相同的数据在自己的 L1 Cache 里面，如果 B 号 CPU 核心的 L1 Cache 中有该数据，那么也需要把该数据更新到自己的 L1 Cache。

可以发现，总线嗅探方法很简单，CPU 需要每时每刻监听总线上的一切活动，但是不管别的核心的 Cache 是否缓存相同的数据，都需要发出一个广播事件，这无疑会加重总线的负载。

另外，总线嗅探只是保证了某个 CPU 核心的 Cache 更新数据这个事件能被其他 CPU 核心知道，但是并不能保证事务串行化。

于是，有一个协议基于总线嗅探机制实现了事务串行化，也用状态机机制降低了总线带宽压力，这个协议就是 MESI 协议，这个协议就做到了 CPU 缓存一致性。

### MESI 协议

MESI 协议其实是 4 个状态单词的开头字母缩写，分别是：

- _Modified_，已修改
- _Exclusive_，独占
- _Shared_，共享
- _Invalidated_，已失效

这四个状态来标记 Cache Line 四个不同的状态。

「已修改」状态就是我们前面提到的脏标记，代表该 Cache Block 上的数据已经被更新过，但是还没有写到内存里。而「已失效」状态，表示的是这个 Cache Block 里的数据已经失效了，不可以读取该状态的数据。

「独占」和「共享」状态都代表 Cache Block 里的数据是干净的，也就是说，这个时候 Cache Block 里的数据和内存里面的数据是一致性的。

「独占」和「共享」的差别在于，独占状态的时候，数据只存储在一个 CPU 核心的 Cache 里，而其他 CPU 核心的 Cache 没有该数据。这个时候，如果要向独占的 Cache 写数据，就可以直接自由地写入，而不需要通知其他 CPU 核心，因为只有你这有这个数据，就不存在缓存一致性的问题了，于是就可以随便操作该数据。

另外，在「独占」状态下的数据，如果有其他核心从内存读取了相同的数据到各自的 Cache ，那么这个时候，独占状态下的数据就会变成共享状态。

那么，「共享」状态代表着相同的数据在多个 CPU 核心的 Cache 里都有，所以当我们要更新 Cache 里面的数据的时候，不能直接修改，而是要先向所有的其他 CPU 核心广播一个请求，要求先把其他核心的 Cache 中对应的 Cache Line 标记为「无效」状态，然后再更新当前 Cache 里面的数据。

举具体的例子来看看这四个状态的转换：

1. 当 A 号 CPU 核心从内存读取变量 i 的值，数据被缓存在 A 号 CPU 核心自己的 Cache 里面，此时其他 CPU 核心的 Cache 没有缓存该数据，于是标记 Cache Line 状态为「独占」，此时其 Cache 中的数据与内存是一致的；
2. 然后 B 号 CPU 核心也从内存读取了变量 i 的值，此时会发送消息给其他 CPU 核心，由于 A 号 CPU 核心已经缓存了该数据，所以会把数据返回给 B 号 CPU 核心。在这个时候，A 和 B 核心缓存了相同的数据，Cache Line 的状态就会变成「共享」，并且其 Cache 中的数据与内存也是一致的；
3. 当 A 号 CPU 核心要修改 Cache 中 i 变量的值，发现数据对应的 Cache Line 的状态是共享状态，则要向所有的其他 CPU 核心广播一个请求，要求先把其他核心的 Cache 中对应的 Cache Line 标记为「无效」状态，然后 A 号 CPU 核心才更新 Cache 里面的数据，同时标记 Cache Line 为「已修改」状态，此时 Cache 中的数据就与内存不一致了。
4. 如果 A 号 CPU 核心「继续」修改 Cache 中 i 变量的值，由于此时的 Cache Line 是「已修改」状态，因此不需要给其他 CPU 核心发送消息，直接更新数据即可。
5. 如果 A 号 CPU 核心的 Cache 里的 i 变量对应的 Cache Line 要被「替换」，发现 Cache Line 状态是「已修改」状态，就会在替换前先把数据同步到内存。

所以，可以发现当 Cache Line 状态是「已修改」或者「独占」状态时，修改更新其数据不需要发送广播给其他 CPU 核心，这在一定程度上减少了总线带宽压力。

事实上，整个 MESI 的状态可以用一个有限状态机来表示它的状态流转。还有一点，对于不同状态触发的事件操作，可能是来自本地 CPU 核心发出的广播事件，也可以是来自其他 CPU 核心通过总线发出的广播事件。下图即是 MESI 协议的状态图：

![MESI 四状态转换图](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E7%BC%93%E5%AD%98%E4%B8%80%E8%87%B4%E6%80%A7/MESI%E5%8D%8F%E8%AE%AE.png)

MESI 协议的四种状态之间的流转过程，我汇总成了下面的表格，你可以更详细的看到每个状态转换的原因：

![MESI 状态转换表](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E7%BC%93%E5%AD%98%E4%B8%80%E8%87%B4%E6%80%A7/%20MESI%E7%8A%B6%E6%80%81%E8%BD%AC%E6%8D%A2%E8%A1%A8%E6%A0%BC.png)

### MESIF 与 MOESI

MESI 是个骨架，真实 CPU 各自在上面加了状态：

- **Intel 的 MESIF**：多一个 **F（Forward）** 状态。多个核共享同一行时，选一个当「负责转发」的，别的核要读就由它直接给数据，避免所有核心同时抢着回应；
- **AMD 的 MOESI**：多一个 **O（Owned）** 状态。一行被多个核共享、但内容已经是脏的时候，由一个核持有 O 状态并负责后续写回，其他核从它这里拿数据，不用先写回内存再读。

效果都是少一次内存往返，本质还是在 MESI 的状态机上打补丁。

CPU 在读写数据的时候，都是在 CPU Cache 读写数据的，原因是 Cache 离 CPU 很近，读写性能相比内存高出很多。对于 Cache 里没有缓存 CPU 所需要读取的数据的这种情况，CPU 则会从内存读取数据，并将数据缓存到 Cache 里面，最后 CPU 再从 Cache 读取数据。

而对于数据的写入，CPU 都会先写入到 Cache 里面，然后再在找个合适的时机写入到内存，那就有「写直达」和「写回」这两种策略来保证 Cache 与内存的数据一致性：

- 写直达，只要有数据写入，都会直接把数据写入到内存里面，这种方式简单直观，但是性能就会受限于内存的访问速度；
- 写回，对于已经缓存在 Cache 的数据的写入，只需要更新其数据就可以，不用写入到内存，只有在需要把缓存里面的脏数据交换出去的时候，才把数据同步到内存里，这种方式在缓存命中率高的情况，性能会更好；

当今 CPU 都是多核的，每个核心都有各自独立的 L1/L2 Cache，只有 L3 Cache 是多个核心之间共享的。所以，我们要确保多核缓存是一致性的，否则会出现错误的结果。

要想实现缓存一致性，关键是要满足 2 点：

- 第一点是写传播，也就是当某个 CPU 核心发生写入操作时，需要把该事件广播通知给其他核心；
- 第二点是事务的串行化，这个很重要，只有保证了这个，才能保障我们的数据是真正一致的，我们的程序在各个不同的核心上运行的结果也是一致的；

基于总线嗅探机制的 MESI 协议，就满足了上面这两点，因此它是保障缓存一致性的协议。

MESI 协议，是已修改、独占、共享、已失效这四个状态的英文缩写的组合。整个 MESI 状态的变更，则是根据来自本地 CPU 核心的请求，或者来自其他 CPU 核心通过总线传输过来的请求，从而构成一个流动的状态机。另外，对于在「已修改」或者「独占」状态的 Cache Line，修改更新其数据不需要发送广播给其他 CPU 核心。

## 从缓存一致性到内存一致性

MESI 保证的是**同一个地址**在多个核心的副本最终一致，这叫缓存一致性（coherence）。但它不保证**不同地址**之间的访问顺序，也不保证你的写什么时候能被别的核看到——那是另一个层面的事，叫**内存一致性模型**（memory consistency model）。

差别的来源，是 CPU 为了不等内存而加的两个缓冲。

### store buffer 与失效队列

按 MESI，一个核心要修改处于「共享」状态的 Cache Line，得先广播 invalidate，**等所有核心回 ack**，才能拿到独占权。这个等待可能是几十上百个周期。CPU 不会干等，它把写操作丢进 **store buffer**，自己继续往下执行。

于是问题来了：

```c
// 初始 x = 0, y = 0
// 核心 A              核心 B
x = 1;                 y = 1;
r1 = y;                r2 = x;
```

两边都是先写自己的变量、再读对方的变量。直觉上 `r1 == 0 && r2 == 0` 不可能，因为总有一个写发生在另一个读之前。但在 x86 上这个结果**是允许的**：A 的 `x = 1` 还躺在 store buffer 里没出去，B 的 `y = 1` 也一样，两边都读到了内存里的旧值 0。

对称地，收到 invalidate 的核心也不会立刻处理，而是先塞进 **invalidate queue** 并回 ack，等有空再让它失效。这样一来，即使写已经传播过来了，读也可能还是旧值。

所以「MESI 保证了多核一致」这句话，准确说是「保证最终一致，并且每个地址上有一个全局的修改顺序」，而不是「你写完别人立刻能读到」。

### x86 是强序，ARM 是弱序

不同架构允许的重排不一样：

| 架构                 | 允许的重排               | 典型场景                        |
| -------------------- | ------------------------ | ------------------------------- |
| x86（TSO）           | 只允许 store → load 重排 | 服务器、PC                      |
| ARM / RISC-V（弱序） | 四种组合都可能重排       | 手机、Apple Silicon、部分服务器 |

x86 的模型叫 **TSO（Total Store Order）**：同一个核的写按程序顺序对其他核可见，读也不会越过前面的读，唯一松掉的就是「写之后的读可以提前」。这就是为什么在 x86 上很多「看起来能跑」的并发代码，一移到 ARM 上就炸。

要约束重排，就得插**内存屏障**：

```c
// C11
atomic_thread_fence(memory_order_seq_cst);

// Linux 内核
smp_mb();   // 全屏障
smp_rmb();  // 读屏障
smp_wmb();  // 写屏障

// x86 指令
mfence; sfence; lfence;
```

`barrier()` 只是编译器屏障，挡的是编译器把代码挪来挪去，对 CPU 的重排毫无作用——这两者经常被混为一谈。

C 语言里的 `volatile` 也一样：它只保证不被优化掉、不被合并访问，在 x86 的 TSO 下碰巧能当半个屏障用，但在 ARM 上完全不够。跨线程同步要用 `atomic`（或者内核里的 `READ_ONCE`/`WRITE_ONCE` 配合屏障），而不是 `volatile`。

### 为什么 i++ 不是原子的

`i++` 在汇编层面是三条指令：

```asm
mov  eax, [i]    ; 读
add  eax, 1      ; 改
mov  [i], eax    ; 写
```

即使每条指令本身是原子的，三条之间也可以被其他核心插进来：两个核心各读到 0，各写回 1，加两次还是 1。要原子，就得让「读—改—写」整体不被插入。

硬件提供了两类支持：

- **原子指令**：x86 的 `lock` 前缀能把一条指令变成「锁缓存行 → 执行 → 释放」，比如 `lock inc`、`lock cmpxchg`；ARM 用 `ldrex/strex` 这类独占访问，失败就重试；
- **CAS 循环**：比较并交换，失败重来，上层的自旋锁、无锁队列都建在这上面。

锁的本质也在这里：`lock` 前缀会锁住对应的 Cache Line，其他核心要改同一行就得等——又回到了 MESI 的独占状态。

### 一致性和内存序的分工

这两件事经常被混在一起，其实分工很明确：

- **缓存一致性**解决「同一个地址的多个副本怎么保持一致」。MESI 管这个，它保证每个地址上的修改有一个全局顺序；
- **内存序**解决「不同地址的访问能不能重排」。屏障管这个，它保证你的 `flag = 1` 一定在 `data = xxx` 之后被别的核看到。

伪共享属于前者的性能副作用，`i++` 的竞态属于后者的正确性问题。MESI 能保证「每个地址上的修改不丢」，但保证不了「读—改—写三步之间不被打断」。

## 什么是 CPU 伪共享

前面讲的一致性，关心的是同一个地址在多个核之间对不对。但还有一种情况更隐蔽：两个线程操作的明明是不同变量，却会互相拖慢，这就是伪共享。

假设有一个双核心的 CPU，这两个 CPU 核心并行运行着两个不同的线程，它们同时从内存中读取两个不同的数据，分别是类型为 `long` 的变量 A 和 B，这两个数据的地址在物理内存上是**连续**的，如果 Cache Line 的大小是 64 字节，并且变量 A 在 Cache Line 的开头位置，那么这两个数据是位于**同一个 Cache Line 中**，又因为 CPU Cache Line 是 CPU 从内存读取数据到 Cache 的单位，所以这两个数据会被同时读入到了两个 CPU 核心中各自 Cache 中。

![变量 A 与 B 落在同一个 Cache Line](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/%E5%90%8C%E4%B8%80%E4%B8%AA%E7%BC%93%E5%AD%98%E8%A1%8C.png)

这里可以引出，如果这两个不同核心的线程分别修改不同的数据，比如 1 号核心的线程只修改变量 A、2 号核心的线程只修改变量 B，会发生什么？

### 分析伪共享的问题

现在可以结合保证多核缓存一致的 MESI 协议，来说明这一整个的过程。

1. 最开始变量 A 和 B 都还不在 Cache 里面，假设 1 号核心绑定了线程 A，2 号核心绑定了线程 B，线程 A 只会读写变量 A，线程 B 只会读写变量 B。

![伪共享：初始时两个核心都未缓存 A 和 B](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/%E5%88%86%E6%9E%90%E4%BC%AA%E5%85%B1%E4%BA%AB1.png)

2. 1 号核心读取变量 A，由于 CPU 从内存读取数据到 Cache 的单位是 Cache Line，也正好变量 A 和 变量 B 的数据归属于同一个 Cache Line，所以 A 和 B 的数据都会被加载到 Cache，并将此 Cache Line 标记为「独占」状态。

![伪共享：1 号核心读 A，A 与 B 同属一个 Cache Line](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/%E5%88%86%E6%9E%90%E4%BC%AA%E5%85%B1%E4%BA%AB2.png)

3. 接着，2 号核心开始从内存里读取变量 B，同样的也是读取 Cache Line 大小的数据到 Cache 中，此 Cache Line 中的数据也包含了变量 A 和 变量 B，此时 1 号和 2 号核心的 Cache Line 状态变为「共享」状态。

![伪共享：2 号核心读 B，两个核心的 Cache Line 变为共享](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/%E5%88%86%E6%9E%90%E4%BC%AA%E5%85%B1%E4%BA%AB3.png)

4. 1 号核心需要修改变量 A，发现此 Cache Line 的状态是「共享」状态，所以先需要通过总线发送消息给 2 号核心，通知 2 号核心把 Cache 中对应的 Cache Line 标记为「已失效」状态，然后 1 号核心对应的 Cache Line 状态变成「已修改」状态，并且修改变量 A。

![伪共享：1 号核心改 A，广播使 2 号核心的 Cache Line 失效](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/%E5%88%86%E6%9E%90%E4%BC%AA%E5%85%B1%E4%BA%AB4.png)

5. 之后，2 号核心需要修改变量 B，此时 2 号核心的 Cache 中对应的 Cache Line 是已失效状态，另外由于 1 号核心的 Cache 也有此相同的数据，且状态为「已修改」状态，所以要先把 1 号核心的 Cache 对应的 Cache Line 写回到内存，然后 2 号核心再从内存读取 Cache Line 大小的数据到 Cache 中，最后把变量 B 修改到 2 号核心的 Cache 中，并将状态标记为「已修改」状态。

![伪共享：2 号核心改 B，先让 1 号核心写回内存](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/%E5%88%86%E6%9E%90%E4%BC%AA%E5%85%B1%E4%BA%AB5.png)

所以，可以发现如果 1 号和 2 号 CPU 核心这样持续交替的分别修改变量 A 和 B，就会重复 ④ 和 ⑤ 这两个步骤，Cache 并没有起到缓存的效果，虽然变量 A 和 B 之间其实并没有任何的关系，但是因为同时归属于一个 Cache Line ，这个 Cache Line 中的任意数据被修改后，都会相互影响，从而出现 ④ 和 ⑤ 这两个步骤。

因此，这种因为多个线程同时读写同一个 Cache Line 的不同变量时，而导致 CPU Cache 失效的现象称为**伪共享（*False Sharing*）**。

### 避免伪共享的方法

因此，对于多个线程共享的热点数据，即经常会修改的数据，应该避免这些数据刚好在同一个 Cache Line 中，否则就会出现为伪共享的问题。

接下来，看看在实际项目中是用什么方式来避免伪共享的问题的。

在 Linux 内核中存在 `__cacheline_aligned_in_smp` 宏定义，是用于解决伪共享的问题。

![__cacheline_aligned_in_smp 宏定义](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/__cacheline_aligned.png)

从上面的宏定义，我们可以看到：

- 如果在多核（MP）系统里，该宏定义是 `__cacheline_aligned`，也就是 Cache Line 的大小；
- 而如果在单核系统里，该宏定义是空的；

因此，针对在同一个 Cache Line 中的共享的数据，如果在多核之间竞争比较严重，为了防止伪共享现象的发生，可以采用上面的宏定义使得变量在 Cache Line 里是对齐的。

举个例子，有下面这个结构体：

![未做对齐的结构体定义](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/struct_test.png)

结构体里的两个成员变量 a 和 b 在物理内存地址上是连续的，于是它们可能会位于同一个 Cache Line 中，如下图：

![成员 a 与 b 位于同一 Cache Line](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/struct_ab.png)

所以，为了防止前面提到的 Cache 伪共享问题，我们可以使用上面介绍的宏定义，将 b 的地址设置为 Cache Line 对齐地址，如下：

![使用 Cache Line 对齐的结构体定义](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/struct_test1.png)

这样 a 和 b 变量就不会在同一个 Cache Line 中了，如下图：

![对齐后成员 a 与 b 分处不同 Cache Line](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/struct_ab1.png)

所以，避免 Cache 伪共享实际上是用空间换时间的思想，浪费一部分 Cache 空间，从而换来性能的提升。

这里可以看一个应用层面的规避方案，有一个 Java 并发框架 Disruptor 使用「字节填充 + 继承」的方式，来避免伪共享的问题。

Disruptor 中有一个 RingBuffer 类会经常被多个线程使用，代码如下：

![Disruptor 中 RingBuffer 的填充实现](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/Disruptor.png)

RingBufferPad 类里 7 个 long 类型的名字很奇怪，但事实上，它们虽然看起来毫无作用，但却对性能的提升起到了至关重要的作用。

我们都知道，CPU Cache 从内存读取数据的单位是 CPU Cache Line，一般 CPU Cache Line 的大小是 64 个字节，一个 long 类型的数据是 8 个字节，所以 CPU 一下会加载 8 个 long 类型的数据。

根据 JVM 对象继承关系中父类成员和子类成员，内存地址是连续排列布局的，因此 RingBufferPad 中的 7 个 long 类型数据作为 Cache Line **前置填充**，而 RingBuffer 中的 7 个 long 类型数据则作为 Cache Line **后置填充**，这 14 个 long 变量没有任何实际用途，更不会对它们进行读写操作。

![前后各填充 7 个 long 的 Cache Line 布局](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost3@main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/CPU%E4%BC%AA%E5%85%B1%E4%BA%AB/%E5%A1%AB%E5%85%85%E5%AD%97%E8%8A%82.png)

另外，RingBufferFields 里面定义的这些变量都是 `final` 修饰的，意味着第一次加载之后不会再修改，又**由于「前后」各填充了 7 个不会被读写的 long 类型变量，所以无论怎么加载 Cache Line，这整个 Cache Line 里都没有会发生更新操作的数据，于是只要数据被频繁地读取访问，就自然没有数据被换出 Cache 的可能，也因此不会产生伪共享的问题**。

## CPU 拓扑：核心、超线程与 NUMA

前面一直在说「多个核心」，但一个 CPU 里到底有几个核、它们怎么共享缓存，其实直接影响性能。`lscpu` 里能看到三层：

- **socket（路）**：主板上插了几颗 CPU。家用机一般 1 路，服务器可以 2 路、4 路；
- **core（物理核）**：每颗 CPU 里真正独立的计算单元；
- **thread（逻辑核）**：开了超线程（SMT）之后，一个物理核在操作系统眼里是两个核。

超线程不是把核心复制一份。两个逻辑核共享前端取指、执行单元和 L1/L2 Cache，只是各自有一套寄存器、各自维护一份架构状态。所以：

- 两个超线程同时跑计算密集型任务，吞吐提升远不到 2 倍，甚至可能互相拖慢，因为抢的是同一批执行单元；
- 但一个线程在等内存的时候，另一个线程可以填进流水线，这种场景下超线程才有明显收益。

现代 Intel 的混合架构又多了一层：**P 核（性能核）** 乱序深度大、支持超线程，**E 核（能效核）** 没有超线程、追求每瓦吞吐。Linux 用 ITMT、EAS 这些机制把任务往合适的核上放。所以第一篇里提到的那台 `i7-12700H`，实际上是 **6 个 P 核 + 8 个 E 核，14 核 20 线程**，不是 12+8。

再往上，L3 Cache 也不是铁板一块：现代 CPU 会把 LLC 切成多个 cluster，每个核到自己 cluster 的延迟最低，跨 cluster 要绕。多路服务器还多一层 **NUMA**：内存按节点划分，访问本地节点和远端节点的延迟能差 1.5～2 倍。

这些拓扑直接决定了「绑核」该往哪绑：

```sh
$ lscpu -e
$ lstopo --of txt          # 需要装 hwloc
$ numactl --hardware
$ taskset -c 2 ./a.out     # 绑到 2 号逻辑核
```

把两个计算密集线程绑到同一物理核的两个超线程上，通常是最差的选择；绑到同一个 NUMA 节点的不同物理核上，才能同时吃到缓存和多核并行。绑核用的 `sched_setaffinity` 绑的是逻辑核编号，所以得先看懂这张拓扑表。

本文主要介绍写直达和写回决定什么时候落内存，MESI 决定多个副本怎么同步，store buffer 和内存屏障决定你看到的值对不对，伪共享则是这套机制在性能上的副作用。

下一篇则换个方向：数据是怎么进出这台机器的——总线、DMA、中断和 IO。
