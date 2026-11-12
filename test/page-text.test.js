import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readPage, readSelection, readText } from '../public/page-text.js';
import { checkDraft } from '../public/lib/index.js';

// A tiny stand-in for Designer API elements: { type, children, getChildren(), getText(), getTag() }.
const str = (text) => ({ type: 'String', children: false, getText: async () => text });
const node = (type, kids, extra = {}) => ({ type, children: true, getChildren: async () => kids, ...extra });
const dom = (tag, kids) => node('DOM', kids, { getTag: async () => tag });

const PAGE = node('Body', [
  node('Section', [
    node('Heading', [str('Introduction')]),
    node('Paragraph', [str('Academic writing is is a skill '), node('TextLink', [str('(Smith, 2020)')]), str('. A good draft cites every source (Brown, 2018).')]),
    node('Heading', [str('References')]),
    node('List', [
      node('ListItem', [str('Smith, J. (2020). Writing for university. Academic Press.')]),
      node('ListItem', [str('Lee, K. (2019). Planning essays. Study Skills Journal, 4(2), 10-18.')]),
    ]),
  ]),
  node('Image', []),
]);

const designer = (root, selected = null) => ({ getRootElement: async () => root, getSelectedElement: async () => selected });

test('the page becomes paragraphs with headings, inline links folded in', async () => {
  assert.equal(await readPage(designer(PAGE)), [
    '# Introduction',
    'Academic writing is is a skill (Smith, 2020). A good draft cites every source (Brown, 2018).',
    '# References',
    'Smith, J. (2020). Writing for university. Academic Press.',
    'Lee, K. (2019). Planning essays. Study Skills Journal, 4(2), 10-18.',
  ].join('\n\n'));
});

test('Preflight finds the issues on the page', async () => {
  const codes = checkDraft(await readPage(designer(PAGE))).issues.map((i) => i.code);
  assert.ok(codes.includes('repeated-word'));
  assert.ok(codes.includes('citation-no-reference')); // Brown, 2018
  assert.ok(codes.includes('reference-not-cited')); // Lee, 2019
});

test('Rich Text DOM tags are read as headings and paragraphs', async () => {
  const rich = node('RichText', [dom('h2', [str('Method')]), dom('p', [str('We asked '), dom('strong', [str('twelve')]), str(' students.')])]);
  assert.equal(await readText(rich), '# Method\n\nWe asked twelve students.');
});

test('the selected element only, and empty when nothing is selected', async () => {
  const para = node('Paragraph', [str('Just this one.')]);
  assert.equal(await readSelection(designer(PAGE, para)), 'Just this one.');
  assert.equal(await readSelection(designer(PAGE, null)), '');
});

test('loose text outside text blocks is still read, null text is skipped', async () => {
  const root = node('DivBlock', [str('  Loose   label  '), node('Paragraph', [{ type: 'String', getText: async () => null }])]);
  assert.equal(await readText(root), 'Loose label');
});
