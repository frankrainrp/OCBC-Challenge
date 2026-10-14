import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { analyseMessage } from '../src/domain';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

test('family message leads to independent verification and explicit self-confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '亲友紧急求助' }).click();
  await page.getByRole('button', { name: '检查这段内容' }).click();
  await expect(page.getByRole('heading', { name: '阻止你向其他人核实' })).toBeVisible();
  await page.getByRole('button', { name: '开始独立核实' }).click();
  const complete = page.getByRole('button', { name: '记录我的核实结果' });
  await expect(complete).toBeDisabled();
  await page.getByRole('checkbox').check();
  await complete.click();
  await expect(page.getByRole('heading', { name: '已记录：你表示完成了独立核实' })).toBeVisible();
});

test('empty input is rejected and routine content is never declared safe', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '检查这段内容' }).click();
  await expect(page.getByRole('alert')).toContainText('至少输入 8 个字符');
  await page.getByRole('button', { name: '日常消息' }).click();
  await page.getByRole('button', { name: '检查这段内容' }).click();
  await expect(page.getByRole('heading', { name: '暂未识别到明显的风险话术' })).toBeVisible();
  await expect(page.getByText('这不代表请求安全。规则可能漏检，也无法确认对方身份。')).toBeVisible();
});

test('a suspicious simulated transfer can be paused and resumed without payment', async ({ page }) => {
  await page.goto('/#transfer');
  await page.getByRole('button', { name: '继续，先确认风险' }).click();
  await expect(page.getByText('SGD 3,000.00')).toBeVisible();
  await expect(page.getByRole('heading', { name: '有人正在催促或指导操作' })).toBeVisible();
  await page.getByRole('button', { name: '先暂存这笔转账' }).click();
  await expect(page.getByRole('heading', { name: '模拟转账已暂存' })).toBeVisible();
  await expect(page.getByText('未发生实际转账')).toBeVisible();
  await page.getByRole('button', { name: '继续核实' }).click();
  await expect(page.getByRole('button', { name: '记录我的核实结果' })).toBeDisabled();
});

test('normal transfer is not forced into a suspicious result', async ({ page }) => {
  await page.goto('/#transfer');
  await page.getByLabel('这是第一次向此人转账').uncheck();
  await page.getByLabel('有人催促或指导我操作').uncheck();
  await page.getByRole('button', { name: '继续，先确认风险' }).click();
  await expect(page.getByRole('heading', { name: '暂未识别到额外风险线索' })).toBeVisible();
});

test('bank route keeps trusted contact independent and resets confirmation on identity change', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '冒充银行来电' }).click();
  await page.getByRole('button', { name: '检查这段内容' }).click();
  await page.getByRole('button', { name: '开始独立核实' }).click();
  await expect(page.getByRole('link', { name: '前往 OCBC 官方安全中心' })).toHaveAttribute('href', 'https://www.ocbc.com/personal-banking/security/overview.page');
  await page.getByRole('checkbox').check();
  await page.getByLabel('对方自称').selectOption('unknown');
  await expect(page.getByRole('button', { name: '记录我的核实结果' })).toBeDisabled();
});

test('incident record is downloaded locally and is not claimed submitted', async ({ page }) => {
  await page.goto('/#help');
  await page.getByLabel('补充事件经过').fill('演示事件记录，不含个人信息。');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载事件记录' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('OCBC-incident-note.txt');
  await expect(page.getByRole('status')).toContainText('尚未提交给银行或警方');
});

test('privacy dialog is keyboard dismissible and preserves focus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: '隐私说明', exact: true });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('skip link preserves the route and current verification step', async ({ page }) => {
  await page.goto('/#transfer');
  await page.getByRole('button', { name: '继续，先确认风险' }).click();
  await page.getByRole('link', { name: '跳到主要内容' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#transfer$/);
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('heading', { name: '有 2 处需要进一步核实' })).toBeVisible();
});

test('message content is text, not executable markup', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('消息内容').fill('<img src=x onerror="window.injected=true">马上转账到安全账户。');
  await page.getByRole('button', { name: '检查这段内容' }).click();
  expect(await page.evaluate(() => 'injected' in window)).toBe(false);
  await expect(page.locator('.findings img')).toHaveCount(0);
});

test('public safety advice is not treated as a request for a password', () => {
  expect(analyseMessage('不要把验证码发给任何人，包括自称银行工作人员的人。').findings.some((f) => f.id === 'credentials')).toBe(false);
  expect(analyseMessage('请把短信验证码发给我。').findings.some((f) => f.id === 'credentials')).toBe(true);
});

test('mobile input and result fit and pass automated accessibility checks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: '亲友紧急求助' }).click();
  await page.getByRole('button', { name: '检查这段内容' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: '开始独立核实' }).click();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.goto('/#help');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('standalone HTML opens from disk and sends no network requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (req) => { if (/^https?:/.test(req.url())) requests.push(req.url()); });
  await page.goto(pathToFileURL(resolve('dist/index.html')).href);
  await page.getByRole('button', { name: '亲友紧急求助' }).click();
  await page.getByRole('button', { name: '检查这段内容' }).click();
  await expect(page.getByRole('heading', { name: '阻止你向其他人核实' })).toBeVisible();
  expect(requests).toEqual([]);
});

test('native folder responds to hover and honours reduced motion', async ({ page }) => {
  await page.goto('/');
  const scene = page.locator('.side-note .trust-scene');
  await scene.hover();
  await expect(scene.locator('.sheet-left')).not.toHaveCSS('transform', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(scene.locator('.folder-body')).toHaveCSS('animation-name', 'none');
  await expect(scene.locator('.trust-object')).toHaveCSS('transition-duration', '0s');
});

test('evidence highlights are extracted from the user message', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '亲友紧急求助' }).click();
  await page.getByRole('button', { name: '检查这段内容' }).click();
  await expect(page.locator('.findings mark')).toHaveCount(3);
  await expect(page.locator('.findings mark').first()).toHaveText('急事');
});
