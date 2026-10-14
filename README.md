# OCBC Challenge

**安心核验：在转账或分享信息前，留出一个有用的停顿。**

围绕 PS3 Digital Trust 的手机端优先交互原型。它帮助用户阅读可疑请求中的线索，再通过独立渠道核实。此项目为独立概念演示，非 OCBC 官方服务。

## 立即体验

下载本仓库中的 **[Demo.html](./Demo.html)** 并双击打开。页面已包含全部脚本、样式和图标，无需安装依赖、启动服务器或连接网络。官方帮助链接和电话入口需要外部服务。

本地开发：

```sh
npm ci
npm run dev
```

使用 Node.js 22.12+ 或 24。打开终端显示的本地地址。

[桌面界面预览](docs/desktop.png) · [手机界面预览](docs/mobile.png)

## 可以演示的流程

1. **消息核验**：粘贴文字或描述来电；内置亲友求助、冒充银行和日常消息三个虚构示例。
2. **查看线索**：展示催促、保密、索取验证码、更换号码等具体话术及原文。没有发现线索也不宣称安全。
3. **独立核实**：根据亲友、银行、工作联系人等场景提供步骤。只有用户明确表示自行确认后，才能记录核实结果。
4. **转账前确认**：模拟收款人、金额、首次转账和受催促等信号，演示暂停与恢复。
5. **紧急帮助**：提供经核对的 OCBC Singapore 官方求助来源，并把事件整理记录下载到本机。

所有转账、暂停、核实结果均为演示状态，不会触发真实银行操作。输入保存在当前页面内存中，刷新后清除；主动下载的事件文件需自行保管。

## 设计

采用文件工作台的布局：浅灰侧栏、立体文件夹、柔和纸张表面与清晰表单。红色用于主要操作，灰紫、蓝色和金色分别对应消息、转账和帮助。手机端将侧栏收为顶部导航，保留完整的核验流程。

立体文件夹、折角纸张和记录印章均由原生 SVG 绘制，材质、投影和按压反馈由 CSS 实现，没有生成图片或远程图片依赖。文件夹随鼠标轻微倾斜，纸张随核验状态展开或收拢；系统启用“减少动态效果”时关闭动画。界面不使用 emoji、营销横幅、虚构背书或装饰性循环动画。通用图标使用 Phosphor。

官方参考（访问日期：2026-10-14）：

- [OCBC Singapore 安全中心](https://www.ocbc.com/personal-banking/security/overview.page)：安全核验与求助的内容参考。
- [OCBC 官方反诈骗与求助说明](https://www.ocbc.com/personal-banking/security/secure-banking-ways/loan-scams.page)：官方电话及事件处理方向的来源。
- [Singapore Government Design System 内容指南](https://designsystem.tech.gov.sg/get-started/content)：简明、明确、可操作的界面文案。
- [GovTechSG / sgds-web-component](https://github.com/GovTechSG/sgds-web-component)：成熟服务界面的表单、状态和可访问性参考。

这是独立实现，不复制银行登录页、官方徽标或 SGDS 组件代码，不声称获得银行或政府背书。

## 实现边界

React + TypeScript + Vite，采用原生语义化表单与本地确定性规则。

- `src/domain.ts`：线索提取、虚构示例、核验指引及官方来源。
- `src/App.tsx`：消息、核实、模拟转账及帮助流程。
- `src/components/`：原生 SVG 文件夹、状态场景、记录印章，以及安全的原文高亮。
- `src/styles.css`、`src/shell.css`、`src/material.css`：基础控件、响应式布局与材质动效。

设计规则与组件说明见 [DESIGN.md](./DESIGN.md)。

当前没有模型 API、深度伪造检测、OCR、身份认证、持久化数据库或银行接口。文字规则可能漏检或误报；“用户确认”不等于系统认证。后续如接入 AI，应由后端提取结构化线索、给出原文依据，再由经过验证的风控策略决定流程。

## 构建与验证

```sh
npm run build
npm test
```

构建生成 `dist/index.html` 与根目录 `Demo.html`，均为可离线打开的单文件版本。测试默认使用本机 Microsoft Edge；没有 Edge 时，可安装 Playwright Chromium 并移除 `playwright.config.ts` 中的 `channel` 设置。

14 项自动化测试覆盖关键核验流程、转账暂停、空输入、用户确认状态、报告下载、文本转义、键盘操作、手机溢出、基础可访问性、离线运行、SVG 动效与原文高亮。自动化检查不代表完整的无障碍认证或生产安全认证。

用户参考截图、真实聊天内容、账户资料、凭据与本机配置不包含在公开仓库中。
