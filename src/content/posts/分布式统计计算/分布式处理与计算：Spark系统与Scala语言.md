---
uuid: f3561dd0-e86a-11f0-8fd1-914b1152d8ed
title: 分布式处理与计算：Spark系统与Scala语言
mathjax: true
abbrlink: 38065
published: 2026-07-06 14:10:49
category: 笔记
description: 主要关于spark系统，scala语言及编程，还有Breeze程序包等
cover: https://pic1.zhimg.com/v2-47a2386737d78ba98266730b1c5fd062_1440w.jpg
tags:
    - 分布式统计计算
---

# Spark系统与Scala语言

## Spark 系统

Spark 是一个基于内存的、分布式的、超大号的数据处理“操作系统”。

它本身不产生数据，也不负责最终的业务展示（不画 UI），它的唯一使命就是：把一堆原本一台电脑根本装不下、算不完的数据，分散到几百上千台电脑上，用最快的速度算出结果。

- Spark 的四个特点：**快速、易用性、通用性、随处运行**。
- 应用场景：腾讯广告（大数据精准推荐）、Yahoo（定向广告）、淘宝（相关算法推荐）、优酷土豆（视频推荐）

Spark 是一个开源的大数据处理引擎，它提供了一整套开发 API，包括流计算和机器学习。它支持批处理和流处理。

Spark 的一个显著特点是它能够在内存中进行迭代计算，从而加快数据处理速度。尽管 Spark 是用 Scala 开发的，但它也为 Java、Scala、Python 和 R 等高级编程语言提供了开发接口。

### Spark组件

Spark提供了6大组件：

Spark Core
Spark SQL
Spark Streaming
Spark MLlib
Spark GraphX

Spark Core 是 Spark 的基础，它提供了内存计算的能力，是分布式处理大数据集的基础。它将分布式数据抽象为弹性分布式数据集（RDD），并为运行在其上的上层组件提供 API。所有 Spark 的上层组件都建立在 Spark Core 的基础之上。

Spark SQL 是一个用于处理结构化数据的 Spark 组件。它允许使用 SQL 语句查询数据。Spark 支持多种数据源，包括 Hive 表、Parquet 和 JSON 等。

Spark Streaming 是一个用于处理动态数据流的 Spark 组件。它能够开发出强大的交互和数据查询程序。在处理动态数据流时，流数据会被分割成微小的批处理，这些微小批处理将会在 Spark Core 上按时间顺序快速执行。

Spark MLlib 是 Spark 的机器学习库。它提供了常用的机器学习算法和实用程序，包括分类、回归、聚类、协同过滤、降维等。MLlib 还提供了一些底层优化原语和高层流水线 API，可以帮助开发人员更快地创建和调试机器学习流水线。

Spark GraphX 是 Spark 的图形计算库。它提供了一种分布式图形处理框架，可以帮助开发人员更快地构建和分析大型图形。

### Spark的优势

Spark 有许多优势，其中一些主要优势包括：

速度：Spark 基于内存计算，能够比基于磁盘的计算快很多。对于迭代式算法和交互式数据挖掘任务，这种速度优势尤为明显。
易用性：Spark 支持多种语言，包括 Java、Scala、Python 和 R。它提供了丰富的内置 API，可以帮助开发人员更快地构建和运行应用程序。
通用性：Spark 提供了多种组件，可以支持不同类型的计算任务，包括批处理、交互式查询、流处理、机器学习和图形处理等。
兼容性：Spark 可以与多种数据源集成，包括 Hadoop 分布式文件系统（HDFS）、Apache Cassandra、Apache HBase 和 Amazon S3 等。
容错性：Spark 提供了弹性分布式数据集（RDD）抽象，可以帮助开发人员更快地构建容错应用程序。

下面是一个简单的Word Count的Spark程序：

```scala
import org.apache.spark.{SparkConf, SparkContext}

object SparkWordCount {
    def main (args:Array [String]): Unit = {
        //setMaster("local[9]") 表示在本地运行 Spark 程序，使用 9 个线程。local[*] 表示使用所有可用的处理器核心。
        //这种模式通常用于本地测试和开发。
        val conf = new SparkConf ().setAppName ("Word Count").setMaster("local[9]");
        val sc = new SparkContext (conf);
        sc.setLogLevel("ERROR")

            val data = List("Hello World", "Hello Spark")
            val textFile = sc.parallelize(data)
            val wordCounts = textFile.flatMap (line => line.split (" ")).map (
            word => (word, 1)).reduceByKey ( (a, b) => a + b)
            wordCounts.collect().foreach(println)
    }
}
```

程序首先创建了一个 SparkConf 对象，用来设置应用程序名称和运行模式。然后，它创建了一个 SparkContext 对象，用来连接到 Spark 集群。

接下来，程序创建了一个包含两个字符串的列表，并使用 parallelize 方法将其转换为一个 RDD。然后，它使用 flatMap 方法将每一行文本拆分成单词，并使用 map 方法将每个单词映射为一个键值对（key-value pair），其中键是单词，值是 1。

最后，程序使用 reduceByKey 方法将具有相同键的键值对进行合并，并对它们的值进行求和。最终结果是一个包含每个单词及其出现次数的 RDD。程序使用 collect 方法将结果收集到驱动程序，并使用 foreach 方法打印出来。

## Scala语言

### Scala语言中的数据类型

整数： Byte（2^8 | -128 到 127） 、 Short （2^16 | -32768 到 32767）、 Int （2^32 | -2147483648 到 2147483647）、 Long(2^64)
浮点数： Float （单精度32）、 Double （浮点数64）
字符： Char （字符）、 String （字符串）
Boolean: true或false
在具体声明中， '<value>' 表示字符， "<value>" 表示字符串

### 三、值与变量声明

```scala
val <Name>[:<type>] = <value>   // 常量（值），不可再赋值
var <Name>[:<type>] = <value>   // 变量，可再赋值
```

区分 `val`（不可变）和 `var`（可变）

### 数组结构

| 结构       | 特点               | 声明                     | 取值         | 下标                   |
| ---------- | ------------------ | ------------------------ | ------------ | ---------------------- |
| 元组 Tuple | 可存**不同**类型   | `var a = (1, 2, 3)`      | `a._1`（=1） | **从 1 开始**（`._`）  |
| 数组 Array | 相同类型、固定长度 | `var b = Array(1, 2, 3)` | `b(0)`（=1） | **从 0 开始**（`(*)`） |
| 列表 List  | 相同类型           | `var c = List(1, 2, 3)`  | `c(0)`（=1） | 从 0 开始              |

> 元组用 `._1` 且**下标从 1 开始**；数组/列表用 `(n)` 且**下标从 0 开始**

### 字符串表达式

```scala
// 1. 字符串拼接
"Hello " + "World"              // = Hello World

// 2. 字符串内插（s 前缀）
val item = "World"
s"Hello $item"                  // = Hello World
s"Hello ${item}s"               // = Hello Worlds（引用名后接非字用 {}）
s"Hello ${item * 3}"            // = Hello WorldWorldWorld（{} 内可算式）

// 3. 格式化（f 前缀 / printf）
val pi = 3.1415926
f"pi = $pi%3.2f"                // = pi = 3.14
```

（`%3.2f`）：第一个数字 `3` 是整个字符串的最短长度（含小数点），第二个数字 `2` 是保留小数位数；`f` 表示浮点数，`d` 表示整数。

### 数值运算与表达式块

```scala
math.sin(1) + math.cos(1)       // Double = 1.3817...

// 表达式块：块中最后一个表达式作为整个块的返回值
val pi_approx = {
  val numerator = 355; val denominator = 113f
  numerator / denominator
}                               // Float = 3.141593
```

### 条件表达式

```scala
// if / if...else
if (<Boolean expression>) <expression>
if (<Boolean expression>) <expression> else <expression>

var x = 1; var y = 8
val max = if (x > y) x else y   // Int = 8
```

### 匹配表达式 match

```scala
<expression> match {
  case <pattern> => <expression>
  [case ...]
}

// 基本匹配
val day = "mon"
val kind = day match {
  case "mon" | "tue" | "wed" | "thu" | "fri" => "weekday"
  case "sat" | "sun" => "weekend"
}                               // = weekday

// 带守卫条件 if 的匹配
val score = 95
score match {
  case score if (90 <= score) & (score < 100) => "A"
  case score if (70 <= score) & (score < 90)  => "B"
  case score if (60 <= score) & (score < 70)  => "C"
  case score if score < 60                    => "F"
}                               // = A
```

### 循环

```scala
// 定义数值范围
1 to 5          // (1, 2, 3, 4, 5)   —— 包括头尾
1 until 5       // (1, 2, 3, 4)      —— 不包括最后一个
1 to 10 by 2    // (1, 3, 5, 7, 9)   —— 步长

// for 循环
for (x <- 1 to 7) { print(s"Day $x ") }       // Day 1 ... Day 7

// yield：返回值作为集合返回
for (x <- 1 to 7) yield { s"Day $x " }         // Vector("Day 1 ", ...)

// 迭代器哨位（带 if 过滤）
val threes = for (i <- 1 to 20 if i % 3 == 0) yield i   // Vector(3,6,9,12,15,18)

// while / do-while
var x = 10; while (x > 0) x -= 1               // 0
var x = 0; do println(s"x = $x") while (x > 0) // 至少执行一次 → x = 0
```

> `to` 含尾，`until` 不含尾；`do/while` 在尾部检查条件，**至少执行一次**

### 定义方法/函数

```scala
def hi = "hi"                                   // 无参

def hi: String = "hi"                           // 指定返回类型

def <id>(<id>:<type>[, ...]): <type> = <expr>   // 带参
def logit(p: Double): Double = {
  if (p >= 0 && p <= 1) math.log(p / (1 - p))
  else throw new Error(s"logit: parameter $p is out of range")
}

val f = (x: Double) => x * x                    // 匿名函数，f(2) = 4.0
```

### 运算符与特殊符号

- 算术：`+ - * / %`；关系：`< > == != >= <=`；逻辑：`&& || !`；赋值：`= += -= *= /= %=`。
- 特殊符号：
    - `:::` 两个 List 之间连接
    - `::` 元素与 List 之间连接
    - `_` 在集合中代指每一个元素（通配符）

---

## Spark 编程

### RDD 弹性分布式数据集

- RDD（Resilient Distributed Datasets，弹性分布式数据集）：一个提供了许多操作接口的数据集合，和一般数据集不同的是其**实际数据分布存储于一批机器**（内存或磁盘）中
- RDD 上的两类操作：
    - **转化 Transformation**：由原有 RDD 创建一个新的 RDD
    - **行动 Action**：将计算结果返回给驱动器程序，或写入外部存储

    map 函数：将数据集元素进行传递并产生新的RDD数据集的变换（转化）
    reduce 函数：将汇总返回结果的一种行动（行动）

> **转化返回的是 RDD，行动返回的是其他数据类型**

### 创建 RDD

| 方法               | 作用                       |
| ------------------ | -------------------------- |
| `sc.textFile()`    | 利用读取外部数据集进行创建 |
| `sc.parallelize()` | 分发驱动器程序中的对象集合 |

```scala
val originalData = sc.textFile("FileStore/tables/03.08data/score.txt")
val distData = sc.parallelize(List(1, 2, 3, 4, 5))
```

### 转化算子（Transformation，返回 RDD）

#### Map 类算子（单 RDD 逐元素/逐分区变换）

| 算子                                         | 作用                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| `map(func)`                                  | 将原 RDD 每个数据项经 func 转化成新 RDD，**不改变分区数目**                         |
| `flatMap()`                                  | 对集合中每个元素做 map 操作后再**扁平化**                                           |
| `mapPartitions(func)`                        | 与 map 类似，但传入函数的操作对象是**每个分区的 Iterator 集合**，**不改变分区数量** |
| `filter(func)`                               | 保留 func 返回值为 `true` 的元素，组成新 RDD                                        |
| `sortBy(fun, ascending=true, numPartitions)` | 对标准 RDD 进行排序                                                                 |
| `distinct()`                                 | 针对重复元素，只保留一个                                                            |

#### Reduce 类算子（多 RDD 集合运算）

| 算子             | 作用                                |
| ---------------- | ----------------------------------- |
| `intersection()` | 找出两个 RDD 的共同元素（**交集**） |
| `subtract()`     | 获取两个 RDD 之间的**差集**         |
| `cartesian()`    | 获取两个 RDD 之间的**笛卡尔积**     |

**参数说明（`sortBy`）**：

- `fun: (T) => K`：左边是被排序对象中的每一个元素，右边是返回的用于排序的值。
- `ascending`：决定排序后是升序还是降序，默认 `true`（升序）。
- `numPartitions`：决定排序后 RDD 的分区个数，默认与排序前相等。

**示例：**

```scala
//MAP
// map：每个元素平方 将原 RDD
//每个数据项经 func 转化成新 RDD
val square = data.map(x => x * x)
val double = data.map(_.toDouble)   // 使用通配符 _ 时，不能在函数中出现两次

// map vs flatMap
val data = sc.parallelize(List("I am learning Spark", "I like Spark"))
data.map(_.split(" "))
// Array[Array[String]] = Array(Array(I, am, learning, Spark), Array(I, like, Spark))
data.flatMap(_.split(" "))
// 对集合中每个元素做 map 操作后再扁平化
// Array[String] = Array(I, am, learning, Spark, I, like, Spark)

// mapPartitions：取出每个分区中大于 3 的值
val rdd = sc.parallelize(1 to 10)
val mapPartitionsRDD = rdd.mapPartitions(iter => iter.filter(_ > 3)) // 对迭代器map
mapPartitionsRDD.collect   // Array[Int] = Array(4, 5, 6, 7, 8, 9, 10)

// sortBy：按元组第二个元素排序
// 对标准 RDD 进行排序
val data = sc.parallelize(List((1, 3), (45, 2), (7, 6)))
val sort_data = data.sortBy(_._2)         // Array((45,2), (1,3), (7,6))  升序
val sort_data = data.sortBy(_._2, false)  // Array((7,6), (1,3), (45,2))  降序

// filter：过滤掉小于或等于 2 的元素
// 保留 func 返回值为 `true` 的元素，组成新 RDD
val result = distData.filter(_ > 2)

// distinct：去重
// 针对重复元素，只保留一个
val data = sc.parallelize(List(1, 2, 2, 3))
val result = data.distinct()              // Array[Int] = Array(1, 2, 3)

// REDUCE

// intersection：两个RDD的交集
val rdd1 = sc.parallelize(Array("A", "B", "C", "D"))
val rdd2 = sc.parallelize(Array("C", "D", "F", "G"))
rdd1.intersection(rdd2).collect           // Array(C, D)

// subtract：两个RDD的差集
rdd1.subtract(rdd2).collect               // Array(A, B)

// cartesian：两个RDD的笛卡尔积
val rdd_1 = sc.makeRDD(List(1, 3, 5, 3))
val rdd_2 = sc.makeRDD(List(2, 4, 5, 1))
rdd_1.cartesian(rdd_2)
// Array((1,2),(1,4),(1,5),(1,1),(3,2),(3,4),(3,5),(3,1),(5,2),(5,4),(5,5),(5,1),(3,2),(3,4),(3,5),(3,1))
```

### 键值对 RDD（PairRDD）

> 键值对 RDD 由一组组键值对组成，PairRDD 提供了**并行操作各个键或跨节点重新进行数据分组**的操作接口。

#### Map 类算子（逐元素变换）

| 算子              | 作用                                                            |
| ----------------- | --------------------------------------------------------------- |
| `mapValues(func)` | 类似 map，只对 `(Key, Value)` 中的 **Value** 做 map，不处理 Key |

#### Reduce 类算子（按键分组/聚合）

| 算子                                  | 作用                                                               |
| ------------------------------------- | ------------------------------------------------------------------ |
| `groupByKey([numPartitions])`         | 按键分组，在 `(K, V)` 上调用时返回 `(K, Iterable<V>)` 组成的新 RDD |
| `reduceByKey(func, [numPartitions])`  | 按键分组后聚合，返回 `(K, V)` 新 RDD，func 必须是 `(V, V) => V`    |
| `join(otherDataset, [numPartitions])` | 把键值对数据中相同键的值整合起来                                   |

**创建与获取键值对：**

```scala
// 创建键值对 RDD
val rdd = sc.parallelize(List("a", "b", "c"))
val pairRDD = rdd.map((_, 1))    // Array((a,1), (b,1), (c,1))

// 获取键 / 值
val keys = pairRDD.keys          // Array(a, b, c)
val values = pairRDD.values      // Array(1, 1, 1)
```

**示例：**

```scala
// mapValues：只对 Value 操作
// 类似 map，只对 `(Key, Value)` 中的 Value 做 map，不处理 Key
val result = pairRDD.mapValues((_, 1))
// Array[(String, (Int, Int))] = Array((a,(1,1)), (b,(1,1)), (c,(1,1)))

// groupByKey：按键分组
// 按键分组，在 `(K, V)` 上调用时返回 `(K, Iterable<V>)` 组成的新 RDD
val rdd = sc.parallelize(List("a", "b", "c", "c")).map((_, 1))
val result = rdd.groupByKey()
// Array((a,CompactBuffer(1)), (b,CompactBuffer(1)), (c,CompactBuffer(1, 1)))

// reduceByKey：统计每个键出现的次数
val result = rdd.reduceByKey((x, y) => x + y)
// Array((a,1), (b,1), (c,2))

// join：相同键的值整合，只保留两边都有的键  把键值对数据中相同键的值整合起来
val rdd_1 = sc.parallelize(List(("K1","V1"), ("K2","V2"), ("K4","V4")))
val rdd_2 = sc.parallelize(List(("K1","W1"), ("K2","W2"), ("K3","W3")))
rdd_1.join(rdd_2)
// Array((K1,(V1,W1)), (K2,(V2,W2)))
```

### 行动算子（Action，返回其他数据类型）

| 算子          | 作用                                             |
| ------------- | ------------------------------------------------ |
| `lookup(key)` | 作用于 `(K, V)` 类型 RDD，返回指定 K 的所有 V 值 |
| `collect()`   | 返回 RDD 中所有的元素                            |
| `count()`     | 返回 RDD 中元素个数                              |
| `first()`     | 返回 RDD 中第一个元素                            |
| `take(num)`   | 返回 RDD 中前 num 个元素                         |

**示例：**

```scala
// lookup：返回指定键的所有值
rdd.collect                      // Array((a,1), (b,1), (c,1), (c,1))
val result = rdd.lookup("c")     // Seq[Int] = WrappedArray(1, 1)

// collect / count / first / take
val data = sc.parallelize(List(1, 2, 3, 4))
data.collect()   // Array(1, 2, 3, 4)
data.count()     // Long = 4
data.first()     // Int = 1
data.take(2)     // Array(1, 2)
```

---

## Breeze 程序包

主要是向量与矩阵在运算符上的差异

Breeze程序包的调用：`import breeze.linalg._`

### 向量的创建与运算

| 操作                    | 语法                                                           | 示例结果                                |
| ----------------------- | -------------------------------------------------------------- | --------------------------------------- |
| 列向量（默认）          | `DenseVector(1, 2, 3)`                                         | DenseVector(1, 2, 3)                    |
| 行向量                  | `DenseVector(1, 2, 3).t`                                       | Transpose(DenseVector(1, 2, 3))         |
| 零向量（类型不可缺）    | `DenseVector.zeros[Double](n)`                                 | (0.0, 0.0, 0.0, 0.0, 0.0)               |
| 全 1 向量（类型不可缺） | `DenseVector.ones[Double](n)`                                  | (1.0, 1.0, 1.0, 1.0, 1.0)               |
| 常数向量（类型可省）    | `DenseVector.fill[Double](5, 2)` 或 `DenseVector.fill(5){2.0}` | (2.0, 2.0, 2.0, 2.0, 2.0)               |
| 整型固定步长            | `DenseVector.range(1, 5)`                                      | (1, 2, 3, 4)                            |
| 浮点固定步长            | `DenseVector.rangeD(1, 5)`                                     | (1.0, 2.0, 3.0, 4.0)                    |
| 固定长度                | `linspace(1, 5, 7)`                                            | (1.0, 1.67, 2.33, 3.0, 3.67, 4.33, 5.0) |
| 向量函数                | `DenseVector.tabulate(Range/size)(func)`                       | 按下标生成                              |
| 按元素赋值              | `:=`                                                           | —                                       |

```scala
// 向量函数：按下标生成
val a = DenseVector.tabulate(3)(i => i * i)      // DenseVector(0, 1, 4)
val a = DenseVector.tabulate(0 to 2)(i => i * i) // DenseVector(0, 1, 4)

// 按元素赋值：将向量 a 的元素分别加上其所在位置的指标
val a = DenseVector(Array(1.0, 2.0, 3.0))        // DenseVector(1.0, 2.0, 3.0)
a := a + DenseVector((0 to a.length - 1).toArray.map(_.toDouble))
// DenseVector(1.0, 3.0, 5.0)
```

### 矩阵的创建

| 操作                         | 语法                                       |
| ---------------------------- | ------------------------------------------ |
| 零矩阵（类型不可缺）         | `DenseMatrix.zeros[Double](n, m)`          |
| 全 1 矩阵（类型不可缺）      | `DenseMatrix.ones[Double](n, m)`           |
| 单位矩阵（类型不可缺）       | `DenseMatrix.eye[Double](size)`            |
| 对角矩阵                     | `diag(DenseVector(a, b, c, …))`            |
| 任意矩阵（不能显式指定类型） | `DenseMatrix((a,b,…),(c,d,…),…)`           |
| 按数组建矩阵（列优先填充）   | `new DenseMatrix(n, m, Array(a, b, c, …))` |
| 矩阵函数                     | `DenseMatrix.tabulate(n, m)(func)`         |

```scala
DenseMatrix((1.0, 2.0, 3.0), (4.0, 5.0, 6.0))
new DenseMatrix(2, 3, Array(1.0, 2.0, 3.0, 4.0, 5.0, 6.0))
/* 列优先填充：
1.0  3.0  5.0
2.0  4.0  6.0 */

val Matrix = DenseMatrix.tabulate(3, 4){ (i, j) => i * i + j * j }
/*
0  1  4  9
1  2  5  10
4  5  8  13 */
```

### 向量与矩阵之间的操作

```scala
Matrix.cols        // 列数
Matrix.rows        // 行数
Vector.length      // 向量长度

Matrix.toDenseVector               // 拉直矩阵
Vector.toDenseMatrix.reshape(n, m) // 堆叠向量
Matrix.reshape(n, m)               // 矩阵变形
diag(Matrix)                       // 取出对角元素
```

```scala
Matrix.toDenseVector  // 拉直矩阵 DenseVector(0, 1, 4, 1, 2, 5, 4, 5, 8, 9, 10, 13)

// 堆叠向量
a.toDenseMatrix.reshape(3, 1)
/*
1.0
3.0
5.0 */

// 矩阵变形
Matrix.reshape(4, 3)
/*
0  2  8
1  5  9
4  4  10
1  5  13 */
```

### 向量与矩阵的拼接

> 向量是列向量，**垂直拼接 `vertcat` 后仍为向量，水平拼接 `horzcat` 之后为矩阵**。

| 操作                     | 语法                          |
| ------------------------ | ----------------------------- |
| 矩阵水平合并             | `DenseMatrix.horzcat(m1, m2)` |
| 矩阵垂直合并             | `DenseMatrix.vertcat(m1, m2)` |
| 向量水平合并（成矩阵）   | `DenseVector.horzcat(v1, v2)` |
| 向量垂直合并（仍为向量） | `DenseVector.vertcat(v1, v2)` |

```scala
val matrix1 = DenseMatrix.ones[Double](3, 3)
val matrix2 = DenseMatrix.eye[Double](3)

DenseMatrix.horzcat(matrix1, matrix2)
/*
1.0  1.0  1.0  1.0  0.0  0.0
1.0  1.0  1.0  0.0  1.0  0.0
1.0  1.0  1.0  0.0  0.0  1.0 */

DenseMatrix.vertcat(matrix1, matrix2)
/*
1.0  1.0  1.0
1.0  1.0  1.0
1.0  1.0  1.0
1.0  0.0  0.0
0.0  1.0  0.0
0.0  0.0  1.0 */

val vec1 = DenseVector.ones[Double](3)
val vec2 = DenseVector.rangeD(0, 3)
DenseVector.horzcat(vec1, vec2)   // 成矩阵 3×2
DenseVector.vertcat(vec1, vec2)   // DenseVector(1.0, 1.0, 1.0, 0.0, 1.0, 2.0)
```

### 数值计算方法（向量与矩阵的区别）

**核心区别**：

- 按元素相加减乘除：**向量可以使用 `*`；而在矩阵中 `*` 代表点乘（矩阵乘法）**。
- 按元素比较大小：**向量返回以 `BitVector` 形式存储的满足条件的下标；矩阵返回 `DenseMatrix[Boolean]`**。

| 操作                   | 向量                               | 矩阵                                                         |
| ---------------------- | ---------------------------------- | ------------------------------------------------------------ |
| 按元素加减乘除         | `+:+ -:- *:* /:/` 或 `+ - * /`     | `+:+ -:- *:* /:/` 或 `+ - /`（**`*` 是点乘，不是按元素乘**） |
| 按元素比较大小         | `<:< >:> :==` → BitVector          | `<:< >:> :==` → DenseMatrix[Boolean]                         |
| 判断整体是否相等       | `a == b`                           | `a == b`                                                     |
| 按元素自加自减自乘自除 | `:+= :-= :*= :/=` 或 `+= -= *= /=` | 同左                                                         |
| 乘积 / 乘法            | 内积：`a.t * b` 或 `a dot b`       | 矩阵乘法：`a * b`（**`dot` 不能用于矩阵**）                  |

```scala
val vec1 = DenseVector.ones[Double](3)   // (1.0, 1.0, 1.0)
val vec2 = DenseVector.rangeD(1, 4)      // (1.0, 2.0, 3.0)

vec1 >:> vec2   // BitVector()   （逐元素比较，返回满足的下标）
vec1 :== vec2   // BitVector(0)
vec1 == vec2    // false

vec1.t * vec2   // Double = 6.0  （内积）
vec1 dot vec2   // Double = 6.0
vec1 * vec2     // DenseVector(1.0, 2.0, 3.0)  （向量按元素乘）

any(a)   // 任意元素为真则为真
all(a)   // 所有元素为真才为真

// 矩阵：<:< 返回 Boolean 矩阵，* 是矩阵乘法
matrix2 <:< matrix1
/*
false  false  false
false  true   false
false  false  true */
matrix1 * matrix2   // 矩阵乘法
```

### 索引与切片

```scala
// -1 代表最后一个元素；:: 代表所有元素
Matrix(i, j)              Vec(i)                 // 提取单个元素
Matrix(i to j, m to n)    Vec(i to j)            // 提取多个元素（含尾）
Matrix(i until j, m to n) Vec(i until j [by seq]) // until 不含尾
Vector.slice(start, end)  // 包括 start，不包括 end

Matrix(1, ::)   // Transpose(DenseVector(2.0, 4.0, 6.0))  取第 1 行
Matrix(::, 1)   // DenseVector(3.0, 4.0)                  取第 1 列
vec.slice(0, 3) // DenseVector(1.0, 2.0, 3.0)
```

### 线性代数方法（⭐高频考点）

| 操作                 | 函数                                                        |
| -------------------- | ----------------------------------------------------------- |
| 行列式               | `det(Matrix)`                                               |
| 矩阵的逆             | `inv(Matrix)`                                               |
| Moore-Penrose 广义逆 | `pinv(Matrix)`                                              |
| Frobenius 范数       | `norm(Vec)`                                                 |
| 特征值分解           | `eig(Matrix)`，返回**特征值实部、特征值虚部、对应特征向量** |
| 奇异值分解           | `svd(Matrix)`                                               |
| 矩阵的秩             | `rank(Matrix)`                                              |

```scala
val matrix1 = diag(DenseVector[Double](1, 2, 3))
eig(matrix1)
// Eig(特征值实部, 特征值虚部, 特征向量矩阵)

val svd.SVD(u, s, v) = svd(matrix1)
// u: 左奇异向量矩阵；s: 奇异值向量 DenseVector(3.0, 2.0, 1.0)；v: 右奇异向量矩阵
```

### 求和运算与常用数学计算

```scala
sum(Matrix)          // 所有元素求和         → 21.0
sum(Matrix(*, ::))   // 对所有行求和         → DenseVector(9.0, 12.0)
Vec.reduce((x, y) => x + y)   // 向量可用 reduce 代替 sum

// 数学计算包
import breeze.numerics._
// 提供：sin/sinh/asin/asinh、cos/cosh/acos/acosh、tan/tanh/atan/atanh、
//       log、exp、log10、sqrt、pow

// 统计计算包
import breeze.stats._
breeze.stats.mean(Vec)        // 求均值，也可用 sum(Vec)/Vec.length 代替
```

### 常用分布

调用：`import breeze.stats.distributions._`

| 分布         | 构造                                   |
| ------------ | -------------------------------------- |
| ⭐伯努利分布 | `Bernoulli(p)` / `new Bernoulli(p)`    |
| Beta 分布    | `Beta(a, b)` / `new Beta(a, b)`        |
| 卡方分布     | `new ChiSquared(k)`                    |
| 指数分布     | `new Exponential(r)`                   |
| F 分布       | `F(a, b)` / `new FDistributions(a, b)` |
| 伽马分布     | `new Gamma(a, b)`                      |
| ⭐正态分布   | `new Gaussian()`                       |
| 多元正态分布 | `new MultivariateGaussian()`           |
| 泊松分布     | `new Poisson()`                        |
| ⭐均匀分布   | `new Uniform(a, b)`                    |

```scala
// 产生随机数 / 密度与分布计算
val RandNumbers = new DistributionName(param).sample(size)
DistributionName.pdf()    // 计算密度
DistributionName.cdf()    // 计算分布
```

### 基于 Breeze 包的分布式计算

```scala
val Distribution = DistributionName(Parameter)
val RandNumbers = DenseMatrix.rand(n, m, Distribution)
val rdd = sc.parallelize(RandNumbers)
val rdd = sc.parallelize(Array(Vector, Vector, …))
```

### 基于 MLlib （机器学习算法包）的分布式计算

**向量与矩阵创建：**

```scala
import org.apache.spark.mllib.linalg.{Vector, Vectors}
import org.apache.spark.mllib.linalg.{Matrix, Matrices}

// 稠密向量
val dv = Vectors.dense(1.0, 2.0, 3.0)                      // [1.0,2.0,3.0]
// 稀疏向量（两种写法）
val sv1 = Vectors.sparse(3, Array(0, 2), Array(1.0, 3.0)) // (向量大小, 非零位置, 非零数值)
val sv2 = Vectors.sparse(3, Seq((0, 1.0), (2, 3.0)))      // (3, [0,2], [1.0,3.0])

// 稠密矩阵（列优先填充）
val dm = Matrices.dense(4, 3, Array(1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,11.0,12.0))
/*
1.0  5.0  9.0
2.0  6.0  10.0
3.0  7.0  11.0
4.0  8.0  12.0 */
```

**分布式矩阵：**

```scala
import org.apache.spark.mllib.linalg.distributed._

// 1. 行矩阵 RowMatrix
val data = Array(
  Vectors.sparse(5, Seq((1, 1.0), (3, 7.0))),
  Vectors.dense(2.0, 0.0, 3.0, 4.0, 5.0),
  Vectors.dense(4.0, 0.0, 0.0, 6.0, 7.0))
val MAT = new RowMatrix(sc.parallelize(data))

// 2. 索引行矩阵 IndexedRowMatrix
val data = Array(
  IndexedRow(1, Vectors.sparse(5, Seq((1, 1.0), (3, 7.0)))),
  IndexedRow(2, Vectors.dense(2.0, 0.0, 3.0, 4.0, 5.0)),
  IndexedRow(3, Vectors.dense(4.0, 0.0, 0.0, 6.0, 7.0)))
val MAT = new IndexedRowMatrix(sc.parallelize(data))

// 3. 坐标矩阵 CoordinateMatrix
val ent1 = new MatrixEntry(0, 1, 0.5)
val ent2 = new MatrixEntry(2, 2, 1.8)
val CorrMat = new CoordinateMatrix(sc.parallelize(Array(ent1, ent2)))

// 4. 分块矩阵 BlockMatrix
val m1 = Matrices.dense(2, 2, Array(1.0, 2.0, 3.0, 4.0))
val m2 = Matrices.dense(2, 2, Array(5.0, 6.0, 7.0, 8.0))
val blocks = sc.parallelize(Seq(((0, 0), m1), ((0, 1), m2)))
val MAT = new BlockMatrix(blocks, 2, 2)
```

---

## 收尾

1. 元组、数组、列表三者的区别？下标各从几开始？
2. `val` 与 `var` 的区别？不写类型时类型怎么确定？
3. `s"..."` 和 `f"..."` 内插的区别？`%3.2f` 里两个数字含义？
4. `to` 与 `until` 的区别？`do/while` 与 `while` 的区别？
5. **转化算子和行动算子怎么区分？** 各举 3 个例子。
6. `map` 与 `flatMap` 的区别？`reduceByKey` 与 `groupByKey` 的区别？
7. Breeze 中向量的 `*` 和矩阵的 `*` 分别是什么运算？`dot` 能用于矩阵吗？
8. 特征值分解、奇异值分解、求逆、广义逆分别用哪个函数？
   说明 `:::`、`::`、`_` 三个符号各自的含义。
   ::: 拼接两个列表；
   :: 在列表头部插入元素（或反向拆解列表）；
   \_ 是看心情干啥都行的万能占位符（通配、忽略、简写参数等）

下列算子哪些是转化、哪些是行动？
`map`、`reduce`、`filter`、`collect`、`flatMap`、`count`、`distinct`、`first`

转化算子：
map
filter
flatMap
distinct

行动算子：
reduce
collect
count
first

Scala 语法

| 项                   | 记忆点                                     |
| -------------------- | ------------------------------------------ |
| 整数类型             | Byte(8)/Short(16)/Int(32)/Long(64) 位      |
| `val` / `var`        | val 不可变，var 可变；类型可省，由初值推断 |
| 元组 Tuple           | 存不同类型，`._1` 取值，**下标从 1**       |
| 数组 Array           | 相同类型定长，`(0)` 取值，**下标从 0**     |
| 列表 List            | 相同类型，`(0)` 取值，下标从 0             |
| 内插 `s"$x"`         | 变量替换；`${...}` 内可算式                |
| 格式化 `f"$x%3.2f"`  | 3=最短长度(含点)，2=小数位；f 浮点 d 整数  |
| `to` / `until`       | to 含尾，until 不含尾；`by` 步长           |
| `while` / `do-while` | do-while 尾部判断，至少执行一次            |
| `:::` / `::` / `_`   | List 连接 / 元素接 List / 通配符           |

Spark RDD 算子

| 类别                  | 算子                                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **创建**              | `textFile`(外部)、`parallelize`/`makeRDD`(对象集合)                                                                                                                        |
| **转化**（返回 RDD）  | `map` `flatMap`(扁平化) `mapPartitions`(分区Iterator，不变分区数) `sortBy`(默认升序) `filter` `distinct`(去重) `intersection`(交集) `subtract`(差集) `cartesian`(笛卡尔积) |
| **键值对转化**        | `mapValues`(只动Value) `groupByKey`(→Iterable) `reduceByKey`((V,V)=>V)                                                                                                     |
| **行动**（返回非RDD） | `reduce` `collect`(全部) `count`(个数) `first`(第一个) `take(n)`(前n) `lookup(k)`(某键所有值) `join`(相同键整合)                                                           |

> **转化返回 RDD，行动返回其他类型**；通配符 `_` 在同一函数中不能出现两次。

Breeze 向量/矩阵

| 操作        | 向量 DenseVector                          | 矩阵 DenseMatrix               |
| ----------- | ----------------------------------------- | ------------------------------ |
| 零/全1      | `zeros/ones[Double](n)`                   | `zeros/ones[Double](n,m)`      |
| 单位/对角   | —                                         | `eye[Double](n)` / `diag(vec)` |
| 常数        | `fill[Double](n,v)` / `fill(n){v}`        | —                              |
| 步长        | `range`(整) / `rangeD`(浮点) / `linspace` | —                              |
| 按下标生成  | `tabulate(n)(func)`                       | `tabulate(n,m)(func)`          |
| 转置/行向量 | `.t`                                      | —                              |
| 拼接        | `vertcat`→向量 / `horzcat`→矩阵           | `vertcat` / `horzcat`          |
| 按元素乘    | `*:*` 或 `*`                              | `*:*`（**`*` 是矩阵乘法**）    |
| 乘积        | 内积 `a.t*b` / `a dot b`                  | 矩阵乘法 `a*b`（`dot` 不可用） |
| 比较        | `<:< >:> :==` → BitVector                 | 同 → DenseMatrix[Boolean]      |
| 切片        | `slice(s,e)` 含头不含尾                   | `(i,::)`行 / `(::,j)`列        |

Breeze 线代 / 统计

| 功能                 | 函数                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| 行列式 / 逆 / 广义逆 | `det` / `inv` / `pinv`                                                    |
| 范数 / 秩            | `norm` / `rank`                                                           |
| 特征值 / 奇异值分解  | `eig`(实部,虚部,特征向量) / `svd`(u,s,v)                                  |
| 求和                 | `sum(M)` 全部 / `sum(M(*,::))` 按行                                       |
| 数学包               | `import breeze.numerics._`（sin/cos/log/exp/sqrt/pow…）                   |
| 统计包               | `import breeze.stats._`；`mean(vec)`                                      |
| 分布                 | `import breeze.stats.distributions._`；`.sample(n)` / `.pdf()` / `.cdf()` |
| ⭐常用分布           | `Bernoulli(p)`、`Gaussian()`、`Uniform(a,b)`                              |

MLlib

| 功能       | 写法                                                                  |
| ---------- | --------------------------------------------------------------------- |
| 稠密向量   | `Vectors.dense(1.0, 2.0, 3.0)`                                        |
| 稀疏向量   | `Vectors.sparse(大小, 位置Array, 值Array)`                            |
| 稠密矩阵   | `Matrices.dense(行, 列, Array)`（列优先）                             |
| 分布式矩阵 | `RowMatrix` / `IndexedRowMatrix` / `CoordinateMatrix` / `BlockMatrix` |
