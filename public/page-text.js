// Reads text from the Webflow Designer as plain paragraphs for Plagx Preflight.
// Takes the Designer API object as a parameter so it can be tested without Webflow.

/** Elements whose text forms one paragraph (inline children such as links and bold text are folded in). */
const BLOCKS = new Set(['Heading', 'Paragraph', 'Blockquote', 'ListItem', 'TextBlock']);

/** The same blocks as plain HTML tags, which Rich Text content can expose as "DOM" elements. */
const BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'figcaption']);

/** "heading", "block" or null for an element. */
async function blockKind(element) {
  if (BLOCKS.has(element.type)) return element.type === 'Heading' ? 'heading' : 'block';
  if (element.type === 'DOM' && typeof element.getTag === 'function') {
    const tag = String((await element.getTag()) ?? '').toLowerCase();
    if (BLOCK_TAGS.has(tag)) return /^h[1-6]$/.test(tag) ? 'heading' : 'block';
  }
  return null;
}

/** All text inside an element, in order. */
async function textOf(element) {
  if (element.type === 'String') return (await element.getText()) ?? '';
  if (!element.children) return '';
  const parts = [];
  for (const child of await element.getChildren()) parts.push(await textOf(child));
  return parts.join('');
}

/**
 * Text of `root` and everything inside it, one paragraph per text block,
 * headings marked with "#" so Preflight treats them as headings.
 */
export async function readText(root) {
  const blocks = [];
  async function visit(element) {
    const kind = await blockKind(element);
    if (kind) {
      const text = (await textOf(element)).replace(/\s+/g, ' ').trim();
      if (text) blocks.push(kind === 'heading' ? `# ${text}` : text);
      return;
    }
    if (element.type === 'String') {
      const text = ((await element.getText()) ?? '').replace(/\s+/g, ' ').trim();
      if (text) blocks.push(text);
      return;
    }
    if (element.children) for (const child of await element.getChildren()) await visit(child);
  }
  await visit(root);
  return blocks.join('\n\n');
}

/** Text of the whole current page. */
export async function readPage(webflow) {
  const root = await webflow.getRootElement();
  return root ? readText(root) : '';
}

/** Text of the selected element, or '' when nothing is selected. */
export async function readSelection(webflow) {
  const selected = await webflow.getSelectedElement();
  return selected ? readText(selected) : '';
}
