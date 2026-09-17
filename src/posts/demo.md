---
title: 功能演示：代码、公式、图片、目录
date: 2026-09-17
description: 一篇用来验证代码高亮、数学公式、图片和目录的文章。
cover: /images/cover-demo.jpg
tags: [react, markdown, demo]
---

这篇文章用来验证新加的几个功能。

## 代码高亮

```js
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('React');
```

```python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b
```

## 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

## 图片

把一张图片放到 `public/images/` 下，比如 `cover-demo.jpg`：

![示例图片](/images/cover-demo.jpg)

## 列表和表格

| 功能 | 状态 |
| --- | --- |
| 代码高亮 | ✅ |
| 数学公式 | ✅ |
| 目录 | ✅ |
| 图片 | ✅ |

### 三级标题也会出现在目录

上面右侧的目录应该能看到 H2 和 H3。

## 收尾

如果上面都正常，说明 6 个功能全部到位。