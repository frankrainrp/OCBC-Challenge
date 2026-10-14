---
name: OCBC Challenge
description: 浅灰导航、层叠纸张与原生材质文件夹组成的核验工具。
colors:
  accent: "#b72d40"
  on-accent: "#fff9fa"
  canvas: "#f7f8fa"
  sidebar: "#f2f3f6"
  paper: "#ffffff"
  text: "#2c3038"
  muted: "#5e6b80"
  field-line: "#d9dfe7"
  folder-slate: "#9892b3"
  folder-blue: "#6e97d4"
  folder-gold: "#d5b361"
  focus: "#87475b"
typography:
  headline:
    fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif'
    fontSize: "32px"
    fontWeight: 650
    lineHeight: 1.45
    letterSpacing: "-1px"
  title:
    fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif'
    fontSize: "20px"
    fontWeight: 650
    lineHeight: 1.55
    letterSpacing: "-0.4px"
  body:
    fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif'
    fontSize: "14px"
    fontWeight: 600
  helper:
    fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  compact: "8px"
  control: "12px"
  sheet: "22px"
spacing:
  small: "8px"
  control-gap: "12px"
  inset: "16px"
  section-gap: "24px"
  sheet-inset: "28px"
components:
  button-primary:
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    padding: "13px 18px"
  button-secondary:
    textColor: "#546070"
    rounded: "{rounded.control}"
    padding: "13px 18px"
  button-text:
    textColor: "{colors.accent}"
    padding: "5px 0"
  text-field:
    textColor: "#354151"
    rounded: "{rounded.control}"
    padding: "17px"
  navigation-item:
    textColor: "#5b6270"
    rounded: "{rounded.control}"
    padding: "11px 12px"
  example-chip:
    backgroundColor: "#f6f7fa"
    textColor: "#667080"
    rounded: "{rounded.compact}"
    padding: "8px 12px"
  document-panel:
    rounded: "{rounded.sheet}"
    padding: "28px"
---

# Design System: OCBC Challenge

## Overview

**Creative North Star: "轻灰侧栏与层叠纸张"**

以用户确认的文件夹参考为依据：浅灰导航保持安静，纸面承载任务，柔光与折页让控件有可触感。此文记录代码现状，适用于消息核验、转账前确认与紧急帮助三个入口。

**Key Characteristics:**

- 白色纸面、柔和渐变与接触阴影。
- 红色主要操作，原生 SVG 文件夹。
- 本地字体与有限交互反馈。

## Colors

**Primary：** 操作红用于品牌文字和文字操作；主按钮使用由（#c44257）到（#b72d44）的纵向渐变。

**Secondary：** 大文件夹有灰紫、蓝、金三种材质；导航文件夹对应红、蓝、金。颜色区分任务，不表示身份已验证。

**Neutral：** 冷白内容区、轻灰侧栏、深灰正文与蓝灰辅助文字。

## Typography

沿用前置本地字体栈；Arial 用于文字标识、金额和电话号码。标题紧凑，正文保持舒展行距；输入文字为（15px），导航与提示多为（12–13px）。金额、序号和回执采用等宽数字。移动端常规标题为（26px），带文件夹标题为（24px）。

## Layout

桌面侧栏（224px），内容容器上限（1180px），主区水平留白（40px）；建议栏（260px），栏间距（32px）。不超过（1180px）时收紧为（200px）侧栏和（220px）建议栏；（761–960px）隐藏建议栏。

不超过（760px）时改为三项顶部导航与单列内容，初始表单的文件夹移至标题旁；主区水平留白（18px）、面板内留白（22px）。最低页面宽度（320px）；更窄布局的细节断点为（355px）。

## Elevation & Depth

纸面使用白到冷白渐变、细亮边与低强度多层阴影；输入框轻微内凹，当前导航和选中项轻微抬起。SVG 使用真实路径、渐变和滤镜绘制折纸、文件夹边缘及投影，并非位图素材。

**The 材质层次 Rule.** 深度说明物体、容器与交互状态，沿用柔和接触阴影。

## Shapes

控件采用中等圆角，标签更紧凑，纸面更宽缓；移动端面板为（20px），按钮为（11px）。边框通常为（1px）；进度数字保留圆形。文件夹使用独立轮廓，不套用卡片圆角。

## Components

主按钮红色渐变，次按钮冷白渐变，桌面最小高度（50px）、移动端（48px）；文字按钮悬停显示下划线。输入区保留常驻标签、帮助文字和错误说明；键盘焦点为（3px）紫红描边，输入聚焦另有柔光。

导航、示例与分段切换以背景、边框和状态属性共同表示选中。文件夹悬停展开纸张，鼠标轻微倾斜；状态切换推动或收回纸张，回执使用原生 SVG。控件反馈（140–180ms），纸张过渡（550ms）；减少动态效果偏好关闭主要动画与对象过渡，并禁用鼠标倾斜。

## Do's and Don'ts

- **Do** 复用纸面、原生文件夹与文字说明，让状态可读。
- **Do** 为新增交互保留键盘焦点与减少动态效果支持。
- **Don't** 引入 emoji、生成图片、官方 OCBC 标志或循环环境动画。
- **Don't** 将装饰盾牌、文件夹或回执解释为安全保证。
