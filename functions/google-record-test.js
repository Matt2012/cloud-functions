import puppeteer from 'puppeteer-core';
import fs from 'fs';

export default async function (req, res) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.BROWSERLESS_WS
  });

  const page = await browser.newPage();
  const cdp = await page.createCDPSession();

  await cdp.send('Browserless.startRecording');

  await page.goto('https://www.google.co.uk', { waitUntil: 'networkidle2' });
  await page.type('input[name="q"]', 'test');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);

  const { value } = await cdp.send('Browserless.stopRecording');
  const filename = `google-${Date.now()}.webm`;
  fs.writeFileSync(`/tmp/${filename}`, Buffer.from(value, 'binary'));

  await browser.close();
  res.json({ message: 'done', file: filename });
}