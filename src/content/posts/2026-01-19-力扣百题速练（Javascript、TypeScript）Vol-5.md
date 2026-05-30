---
uuid: 985101e0-f506-11f0-8755-3d94fc781abe
title: 2026-01-19-力扣百题速练（Javascript、TypeScript）Vol-5
category: 归档
mathjax: true
abbrlink: 57550
published: 2026-01-19 15:15:12
description: 这是力扣百题速练的第5期

---
## 40.组合总和II

给定一个候选人编号的集合 `candidates` 和一个目标数 `target` ，找出 `candidates` 中所有可以使数字和为 `target` 的组合。

`candidates` 中的每个数字在每个组合中只能使用 **一次** 

**注意：** 解集不能包含重复的组合

**示例 1:**

**输入:** candidates = `[10,1,2,7,6,1,5]`, target = `8`,
**输出:**
```
[
[1,1,6],
[1,2,5],
[1,7],
[2,6]
]
```
**示例 2:**

**输入:** candidates = [2,5,2,1,2], target = 5,
**输出:**
```
[
[1,2,2],
[5]
]
```

相对于力扣39新增一个去重的逻辑

```ts
function combinationSum2(candidates: number[], target: number): number[][] {
    candidates.sort((a,b) => a - b);  // 排序
    
    const result: number[][] = [];
    const path: number[] = [];
    
    backtrack(0, target);
    
    return result;
    
    function backtrack(start: number, remain: number) {
        if (remain === 0) {
            result.push([...path]);
            return;
        }
        
        for (let i = start; i < candidates.length; i++) {
            // 剪枝：当前数已经大于剩余目标值，后面的更大，直接结束
            if (candidates[i] > remain) break;
            
            // 去重核心：同一层使用过相同数字，则跳过
            if (i > start && candidates[i] === candidates[i-1]) {
                continue;
            }
            
            path.push(candidates[i]);
            // 注意：这里是 i+1，而不是 start（因为每个数只能用一次）
            backtrack(i + 1, remain - candidates[i]);
            path.pop();
        }
    }
}
```


## 41.缺失的第一个正数

给你一个未排序的整数数组 `nums` ，请你找出其中没有出现的最小的正整数

请你实现时间复杂度为 `O(n)` 并且只使用常数级别额外空间的解决方案

**示例 1：**

**输入：**`nums = [1,2,0]`
**输出：**`3`
**解释：**`范围 [1,2] 中的数字都在数组中`

**示例 2：**

**输入：**`nums = [3,4,-1,1]`
**输出：**`2`
**解释：**`1 在数组中，但 2 没有`

**示例 3：**

**输入：**`nums = [7,8,9,11,12]`
**输出：**`1`
**解释：**`最小的正数 1 没有出现`


用ES6秒了

```ts
function firstMissingPositive(nums: number[]): number {  
    let ass = new Set(nums)  
    let index = 1  
    while(true){  
        if(ass.has(index)){  
            index++  
        }  
        if(!ass.has(index)){  
            return index  
        }  
    }};
```

---
---

## 42.接雨水

给定 `n` 个非负整数表示每个宽度为 `1` 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水

**示例 1：**

![](https://assets.leetcode.cn/aliyun-lc-upload/uploads/2018/10/22/rainwatertrap.png)

**输入：**`height = [0,1,0,2,1,0,1,3,2,1,2,1]`
**输出：**`6`
**解释：**`上面是由数组 [0,1,0,2,1,0,1,3,2,1,2,1] 表示的高度图，在这种情况下，可以接 6 个单位的雨水（蓝色部分表示雨水）`

**示例 2：**

**输入：**`height = [4,2,0,3,2,5]`
**输出：**`9`

