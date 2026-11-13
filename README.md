# Plagx Draft Preflight for Webflow

*A free academic writing tool by Plagiarism Checker X.*

**Plagx Draft Preflight is a free, open-source draft checker app for the Webflow Designer.** It opens as a panel next to your canvas and checks the page you are editing, the selected element or pasted text for word count and reading time, in-text citations against the reference list, punctuation and basic grammar before you publish. Use it as an **essay checker**, **word count and reading time tool**, **citation checker** or **reference list checker** for blog posts, articles and academic pages.

- Checks the whole page, the selected element, or any pasted text (for example a CMS post)
- Runs inside the Designer panel: no server, no sign-in, nothing sent anywhere, nothing added to your site
- APA and MLA in-text citations
- Same rules as the [plagx-preflight](https://github.com/plagiarismcheckerx/plagx-preflight) library

**[Try the live demo →](https://plagiarismcheckerx.github.io/plagx-preflight/)**

Developer downloads: [npm](https://www.npmjs.com/package/plagx-preflight) · [NuGet](https://www.nuget.org/packages/Plagx.Preflight) · [Maven Central](https://central.sonatype.com/artifact/io.github.plagiarismcheckerx/plagx-preflight) · [PyPI](https://pypi.org/project/plagx-preflight/) · [GitHub](https://github.com/plagiarismcheckerx/plagx-preflight)

Need a quick citation online? Use the [free citation generator](https://plagiarismcheckerx.com/citation-generator?utm_source=plagx-preflight-webflow).

> Plagx Draft Preflight is a free academic writing utility by Plagiarism Checker X. It checks structure, references, punctuation and basic grammar. Plagiarism checking and AI-generated text detection are available in Plagiarism Checker X, linked at the end of this page.

## Use

1. Install **Plagx Draft Preflight** from the Webflow Apps Marketplace and authorize it for your site.
2. In the Designer, open the **Apps** panel and launch **Plagx Draft Preflight**.
3. Choose **This page**, **Selected element** or **Pasted text**, set word limits and citation style if you need them, and click **Check draft**.

Headings, paragraphs, list items, quotes and Rich Text content are read in page order. The references section is the first heading named References, Bibliography, Works Cited, Sources or similar; each paragraph or list item after it is one reference. The Designer API cannot read CMS items directly, so paste a CMS post into **Pasted text** to check it.

## Checks

| Group | Examples |
|---|---|
| Length & structure | Word, sentence and paragraph counts, reading time, word limits, long sentences and paragraphs |
| References | Citations with no entry in the References section, references that are never cited |
| Punctuation | Unmatched quotes and brackets, double spaces, spacing around punctuation |
| Basic grammar | Repeated words, *a* / *an*, sentence capitals, common word confusions; optional passive-voice hints |

## Development

```bash
npm install
npm test           # page reader and panel tests
npm run dev        # serve the extension for the Designer (Webflow CLI)
npm run bundle     # build bundle.zip for upload
npm run sync       # copy the latest core from ../plagx-preflight/src
```

The app is plain HTML, CSS and JavaScript modules in `public/`, with no build step.

### How the bundle is packaged

`npm run bundle` runs `webflow extension bundle`, which zips `webflow.json` and the files in `public/` unchanged: no transpiling, minifying or source maps. Every file in the uploaded bundle is byte-identical to the file of the same name in `public/`. The app adds nothing to published sites and makes no network requests. The core library in `public/lib/` is copied from [plagx-preflight](https://github.com/plagiarismcheckerx/plagx-preflight) (MIT).

## Plagx Preflight - Free Draft & Grammar Checker

An open-source writing utility for students, researchers and developers. Check length, structure, citations, punctuation and basic grammar before you submit.

Developed by Plagiarism Checker X.

Plagx Preflight gives writing suggestions; it does not detect plagiarism or AI-generated text. For full document checks, explore [Text Similarity Detector](https://plagiarismcheckerx.com/?utm_source=plagx-preflight-webflow) and its [AI Content Detector](https://plagiarismcheckerx.com/ai-content-detector?utm_source=plagx-preflight-webflow).

## License

MIT © Plagiarism Checker X
