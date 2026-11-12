// Plagx Draft Preflight for the Webflow Designer: reads the page, the selected element
// or pasted text and runs Plagx Preflight on it. Nothing is sent anywhere.
import { checkDraft } from './lib/index.js';
import { readPage, readSelection } from './page-text.js';

const LEVELS = { error: 'Error', warning: 'Warning', info: 'Suggestion' };

/** "1 warning", "2 warnings". */
const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** The level is shown as a label, so drop the "Suggestion: " prefix and capitalise what is left. */
const plain = (msg) => {
  const text = msg.replace(/^Suggestion: /, '');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const $ = (id) => document.getElementById(id);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function message(text, className = 'plagx-hint') {
  $('result').replaceChildren(el('p', className, text));
}

function render(result) {
  const out = $('result');
  out.replaceChildren();
  const { stats } = result;
  const tiles = el('div', 'plagx-stats');
  for (const [value, label] of [
    [stats.words, 'Words'],
    [stats.readingTimeMinutes, 'Min read'],
    [stats.sentences, 'Sentences'],
    [stats.paragraphs, 'Paragraphs'],
  ]) {
    const tile = el('div', 'plagx-stat');
    tile.append(el('strong', '', String(value)), el('span', '', label));
    tiles.append(tile);
  }
  const pills = el('div', 'plagx-pills');
  pills.append(
    el('span', `plagx-pill${result.errors ? ' is-error' : ''}`, count(result.errors, 'error')),
    el('span', `plagx-pill${result.warnings ? ' is-warning' : ''}`, count(result.warnings, 'warning')),
    el('span', `plagx-pill${result.infos ? ' is-info' : ''}`, count(result.infos, 'suggestion')),
  );
  out.append(tiles, pills);
  if (!result.issues.length) {
    out.append(el('p', 'plagx-done', '✓ No issues found.'));
    return;
  }
  const list = el('ul', 'plagx-issues');
  for (const issue of result.issues) {
    const item = el('li', `plagx-issue is-${issue.level}`);
    item.append(
      el('span', 'plagx-issue__level', LEVELS[issue.level]),
      el('span', 'plagx-issue__message', plain(issue.message)),
    );
    if (issue.text) item.append(el('span', 'plagx-issue__text', issue.text.length > 80 ? `${issue.text.slice(0, 80)}…` : issue.text));
    list.append(item);
  }
  out.append(list);
}

function options() {
  const number = (id) => Number.parseInt($(id).value, 10) || undefined;
  return {
    minWords: number('min-words'),
    maxWords: number('max-words'),
    style: $('style').value,
    checks: [...document.querySelectorAll('input[name="check"]')].filter((box) => box.checked).map((box) => box.value),
  };
}

/** Pasted text: each non-empty line is its own paragraph, as in the editors. */
const pastedText = () => $('paste').value.split('\n').map((l) => l.trim()).filter(Boolean).join('\n\n');

async function run() {
  const source = [...document.querySelectorAll('input[name="source"]')].find((radio) => radio.checked).value;
  const button = $('check');
  button.disabled = true;
  try {
    let text = '';
    if (source === 'paste') text = pastedText();
    else if (!window.webflow) {
      message('Open this app from the Webflow Designer to check a page, or paste text instead.');
      return;
    } else if (source === 'page') text = await readPage(window.webflow);
    else text = await readSelection(window.webflow);

    if (!text) {
      message(source === 'selection' ? 'Select an element with text on the canvas, then check again.' : 'No text found to check.');
      return;
    }
    render(checkDraft(text, options()));
  } catch (err) {
    message(err.message, 'plagx-fail');
  } finally {
    button.disabled = false;
  }
}

for (const radio of document.querySelectorAll('input[name="source"]')) {
  radio.addEventListener('change', () => { $('paste-wrap').hidden = radio.value !== 'paste' || !radio.checked; });
}
$('check').addEventListener('click', run);
