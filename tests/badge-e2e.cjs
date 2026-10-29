'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const BASE_URL = (process.env.BASE_URL || 'https://tt-sensei.github.io/kakudai-syukusyo/').replace(/\/?$/, '/');

async function waitForBadgeManager(page) {
  await page.waitForFunction(() => {
    const raw = localStorage.getItem('edu:kakudai-syukusyo:badges');
    return raw !== null && Array.isArray(JSON.parse(raw).awarded);
  }, null, { timeout: 20000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const runtimeErrors = [];
  const page = await context.newPage();
  page.on('pageerror', error => runtimeErrors.push(error.message));

  try {
    let response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    assert.equal(response.status(), 200, 'トップページがHTTP 200で開く');
    await page.waitForFunction(() => window.TTSenseiApp && window.KAKUDAI_BADGES?.length === 20, null, { timeout: 20000 });
    await page.waitForFunction(() => document.querySelectorAll('#badgeGrid .badge-item').length === 20, null, { timeout: 10000 });
    assert.equal(await page.locator('#badgeGrid .badge-item').count(), 20, 'コレクションに20種類表示される');
    assert.match(await page.locator('#badgeCount').innerText(), /獲得 0 \/ 20/, '初期状態は0/20');
    assert.equal(await page.locator('.tab').count(), 4, 'トップに4つのミッションがある');

    await page.locator('.tab[href="explore.html"]').click();
    await page.waitForURL('**/explore.html');
    for (const id of ['equilateral', 'square', 'pentagon', 'circle']) {
      await page.locator('.shape-card[data-shape="' + id + '"]').click();
    }
    await page.locator('#exploreCheck').click();
    await page.getByText('大正解！').waitFor({ timeout: 5000 });
    await waitForBadgeManager(page);
    assert.equal(await page.evaluate(() => window.TTSenseiApp.getAwardedBadgeIds().length), 4,
      '形のきまり正解で4バッジを獲得する');

    await page.locator('a.home-back').click();
    await page.waitForURL(url => url.pathname.endsWith('/index.html'));
    assert.match(await page.locator('#badgeCount').innerText(), /獲得 4 \/ 20/);
    await page.locator('.tab[href="scale.html"]').click();
    await page.waitForURL('**/scale.html');
    for (let i = 0; i < 12; i++) {
      const correctOption = page.locator('.scale-option[data-correct="true"]');
      await correctOption.waitFor({ timeout: 5000 });
      await correctOption.click();
      await page.locator('#scaleNext').click();
    }
    await page.waitForURL('**/index.html?complete=scale', { timeout: 15000 });
    await waitForBadgeManager(page);
    assert.match(await page.locator('#badgeCount').innerText(), /獲得 10 \/ 20/,
      '縮尺12問と2ミッションの完了で10バッジを獲得する');

    const resulting = await page.evaluate(() => {
      const app = window.TTSenseiApp;
      app.markModuleComplete('judge');
      for (let i = 1; i <= 6; i++) app.recordCorrectAnswer('judge', 'e2e-judge-' + i);
      for (let i = 1; i <= 8; i++) app.recordCorrectAnswer('draw', 'e2e-draw-' + i);
      app.markModuleComplete('draw');
      app.markModuleComplete('scale');
      const before = app.getAwardedBadgeIds().length;
      app.recordCorrectAnswer('scale', 'e2e-scale-duplicate');
      const afterFirst = app.getAwardedBadgeIds().length;
      app.recordCorrectAnswer('scale', 'e2e-scale-duplicate');
      const afterSecond = app.getAwardedBadgeIds().length;
      return { ids: app.getAwardedBadgeIds(), before, afterFirst, afterSecond };
    });
    await page.waitForFunction(() => document.querySelectorAll('#badgeGrid .badge-item.is-earned').length === 20, null, { timeout: 10000 });
    assert.equal(resulting.ids.length, 20, '20種類すべてを獲得できる');
    assert.equal(new Set(resulting.ids).size, 20, 'バッジIDが重複しない');
    assert.equal(resulting.afterFirst, resulting.before, '獲得済みのしきい値バッジは増えない');
    assert.equal(resulting.afterSecond, resulting.afterFirst, '同じ正解IDを繰り返しても重複しない');
    assert.match(await page.locator('#badgeCount').innerText(), /獲得 20 \/ 20/);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.TTSenseiApp && document.querySelectorAll('#badgeGrid .badge-item.is-earned').length === 20, null, { timeout: 15000 });
    await waitForBadgeManager(page);
    assert.match(await page.locator('#badgeCount').innerText(), /獲得 20 \/ 20/, '再読み込みしても20/20が残る');
    const persistedIds = await page.evaluate(() => window.TTSenseiApp.getAwardedBadgeIds());
    assert.equal(persistedIds.length, 20, '保存済みバッジIDが20個');
    assert.equal(new Set(persistedIds).size, 20, '保存後も重複なし');

    await page.locator('#badgeCollection').evaluate(el => { el.open = true; });
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('#badgeGrid .badge-item img'));
      return imgs.length === 20 && imgs.every(img => img.complete && img.naturalWidth > 0);
    }, null, { timeout: 30000 });
    assert.equal(runtimeErrors.length, 0, '実行時JavaScriptエラーがない: ' + runtimeErrors.join(' | '));

    console.log(JSON.stringify({
      result: 'PASS',
      baseUrl: BASE_URL,
      checks: [
        '4ミッションの表示',
        '実操作で形のきまりを正解',
        '縮尺12問を回答してミッション完了',
        '20種類すべての獲得条件',
        '同じ条件・正解IDの重複防止',
        '再読み込み後の保存',
        '20枚のバッジ画像読み込み',
        'JavaScript実行時エラーなし'
      ],
      awardedBadges: persistedIds.length,
      badgeImagesLoaded: 20
    }, null, 2));
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
