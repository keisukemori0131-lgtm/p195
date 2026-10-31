// 記事本文の整形（cre-comsence.com の表示方法を移植・crecomsence-homepage src/utils/articleContent.ts）
//
// UpNote の TEXT 型本文（改行 \n のプレーンテキスト）を、次の記法で構造化して表示する:
//   ■ 見出し        → 見出し（h2）
//   ・ / ● 箇条書き  → 箇条書き（「ラベル: 本文」ならラベルを太字）
//   1. 番号付き      → 番号付きリスト（空行を挟んでも同じリストとしてつなぐ）
//   それ以外         → 段落
// FAQ フィールドは「Q. …\nA. …」を空行区切りで並べた形式。

/** `Q. …\nA. …` 形式の FAQ テキストを Q/A ペアに分割する */
export function parseFaqText(faq) {
  const text = typeof faq === 'string' ? faq.trim() : ''
  if (!text) return []
  const items = []
  for (const block of text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)) {
    const match = block.match(/^Q[．.]\s*(.+?)\s*\nA[．.]\s*([\s\S]+)$/i)
    if (match) items.push({ question: match[1].trim(), answer: match[2].trim() })
  }
  return items
}

/** 本文末尾に埋め込まれた「■ よくある質問」以降を除く（専用 faq フィールドとの二重表示を避ける） */
export function stripEmbeddedFaqSection(body) {
  const cleaned = String(body).replace(/\n*■\s*よくある質問[\s\S]*$/u, '').trim()
  return cleaned || String(body).trim()
}

/** 要約と本文の先頭段落が同じなら、本文側の重複を除く */
export function stripLeadingSummary(body, summary) {
  const lead = summary?.trim()
  const trimmed = String(body).trim()
  if (!lead) return trimmed
  if (trimmed === lead) return ''
  if (trimmed.startsWith(lead)) return trimmed.slice(lead.length).trim()
  return trimmed
}

/**
 * ■見出し / ・箇条書き / 1.番号付き / 段落 に分解する。
 * @returns {Array<{type:'heading'|'paragraph', text:string} | {type:'bullets', items:string[]} | {type:'numbered', items:{number:number,text:string}[]}>}
 */
export function parseArticleBody(body) {
  const text = String(body ?? '').trim()
  if (!text) return []

  const blocks = []
  let paragraphLines = []
  let bulletItems = []
  let numberedItems = []

  const flushParagraph = () => {
    const joined = paragraphLines.join('\n').trim()
    if (joined) blocks.push({ type: 'paragraph', text: joined })
    paragraphLines = []
  }
  const flushBullets = () => {
    if (bulletItems.length) blocks.push({ type: 'bullets', items: [...bulletItems] })
    bulletItems = []
  }
  const flushNumbered = () => {
    if (numberedItems.length) blocks.push({ type: 'numbered', items: [...numberedItems] })
    numberedItems = []
  }
  const flushLists = () => {
    flushBullets()
    flushNumbered()
  }

  for (const rawLine of text.split('\n')) {
    const trimmed = rawLine.trim()

    // 空行は段落を区切るが、リストは継続させる
    if (!trimmed) {
      flushParagraph()
      continue
    }

    const heading = trimmed.match(/^■\s*(.+)$/u)
    if (heading) {
      flushParagraph()
      flushLists()
      blocks.push({ type: 'heading', text: heading[1].trim() })
      continue
    }

    const bullet = trimmed.match(/^[・●▪]\s*(.+)$/u)
    if (bullet) {
      flushParagraph()
      flushNumbered()
      bulletItems.push(bullet[1].trim())
      continue
    }

    const numbered = trimmed.match(/^(\d+)[．.]\s*(.+)$/u)
    if (numbered) {
      flushParagraph()
      flushBullets()
      numberedItems.push({ number: Number(numbered[1]), text: numbered[2].trim() })
      continue
    }

    // リスト項目の続き行（字下げ）は直前の項目に連結
    if (numberedItems.length && /^\s/.test(rawLine)) {
      numberedItems[numberedItems.length - 1].text += ` ${trimmed}`
      continue
    }
    if (bulletItems.length && /^\s/.test(rawLine)) {
      bulletItems[bulletItems.length - 1] += ` ${trimmed}`
      continue
    }

    flushLists()
    paragraphLines.push(trimmed)
  }

  flushParagraph()
  flushLists()
  return blocks
}

/** 「見出し: 本文」形式ならラベルと本文に分ける */
export function splitLabeledItem(text) {
  const match = String(text).match(/^([^：:]{1,40})[：:]\s*(.+)$/u)
  if (!match) return { body: text }
  return { label: match[1].trim(), body: match[2].trim() }
}
