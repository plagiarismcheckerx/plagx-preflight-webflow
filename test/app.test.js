import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const { window, document } = parseHTML(html);
globalThis.window = window;
globalThis.document = document;
// Browsers tick boxes that have a `checked` attribute; linkedom does not, so do it here.
for (const box of document.querySelectorAll('input[checked]')) box.checked = true;
await import('../public/app.js');

const $ = (id) => document.getElementById(id);
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
const choose = (value) => {
  for (const r of document.querySelectorAll('input[name="source"]')) r.checked = r.value === value;
};

test('pasted text is checked and the results are shown', async () => {
  choose('paste');
  $('paste').value = 'Writing is is a skill (Smith, 2020). Every source counts (Brown, 2018).\nReferences\nSmith, J. (2020). Writing for university. Academic Press.';
  $('check').click();
  await settle();
  const text = $('result').textContent;
  assert.match(text, /Words/);
  assert.match(text, /"is is" looks like a repeated word/);
  assert.match(text, /Brown, 2018/);
  assert.equal(document.querySelectorAll('.plagx-issue').length >= 2, true);
});

test('"1 error" uses the singular', async () => {
  choose('paste');
  $('paste').value = 'One citation (Brown, 2018) here.\nReferences\nSmith, J. (2020). Title.';
  $('check').click();
  await settle();
  assert.ok([...document.querySelectorAll('.plagx-pill')].some((p) => p.textContent === '1 error'));
});

test('outside the Designer, page mode explains what to do', async () => {
  choose('page');
  $('check').click();
  await settle();
  assert.match($('result').textContent, /Open this app from the Webflow Designer/);
});

test('in the Designer, page mode reads the page through the API', async () => {
  const str = (t) => ({ type: 'String', getText: async () => t });
  const root = { type: 'Body', children: true, getChildren: async () => [{ type: 'Paragraph', children: true, getChildren: async () => [str('A short page with with a repeated word.')] }] };
  window.webflow = { getRootElement: async () => root, getSelectedElement: async () => null };
  choose('page');
  $('check').click();
  await settle();
  assert.match($('result').textContent, /"with with" looks like a repeated word/);

  choose('selection');
  $('check').click();
  await settle();
  assert.match($('result').textContent, /Select an element with text/);
  delete window.webflow;
});
