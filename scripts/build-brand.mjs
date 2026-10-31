#!/usr/bin/env node
/**
 * build-brand.mjs — ブランド画像（生成 SVG イラスト・仮ロゴ・OG 画像）を出力する（R13）
 *
 * デザインテーマは代表の名刺（2026-10 共有）:
 *   パール／シルバーの地・灰色の月・両端の色ブロック（朱赤・黄・黄緑・緑・紺・青・臙脂・黒）・
 *   白い板張りの風合い・黒い縦帯・透かしの社名（REGOLITH / 101FIT）
 * 正式な写真・ロゴが届いたら public/ の同名ファイルを差し替えればよい（再実行すると上書きされるので注意）。
 *
 *   npm run build:brand
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')

const C = {
  pearl: '#F1F1EE',
  pearl2: '#E3E3DF',
  silver: '#B9B9B5',
  ink: '#141414',
  white: '#FFFFFF',
  red: '#E4471E',
  yellow: '#F2C21B',
  lime: '#C5D13A',
  green: '#5B8A3C',
  navy: '#1F2C7C',
  blue: '#2F7BDD',
  maroon: '#7C1F2B',
}
const BLOCKS = [C.red, C.yellow, C.lime, C.green, C.navy, C.blue, C.maroon, C.ink]
const LOGO_FONT = "Barlow, 'Arial Black', Arial, sans-serif"
const COND_FONT = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif"
const JP = "'Shippori Mincho B1', 'Yu Mincho', 'Hiragino Mincho ProN', serif"
const JP_SANS = "'Noto Sans JP', 'Yu Gothic', Meiryo, sans-serif"

const svg = (w, h, label, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">${body}</svg>\n`

/** 擬似乱数（毎回同じ配置にする） */
function rng(seed) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

/** パールの地（光沢のグラデーション） */
const pearl = (id, w, h) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8F8F5"/><stop offset=".55" stop-color="${C.pearl2}"/><stop offset="1" stop-color="#F4F4F1"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`

/** 灰色の月（クレーター付き） */
function moon(cx, cy, r, id, opacity = 1) {
  const rand = rng(Math.round(cx + cy + r))
  let craters = ''
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2
    const d = rand() * r * 0.72
    const cr = r * (0.05 + rand() * 0.11)
    craters += `<circle cx="${(cx + Math.cos(a) * d).toFixed(0)}" cy="${(cy + Math.sin(a) * d).toFixed(0)}" r="${cr.toFixed(0)}" fill="#8F8F8B" opacity="${(0.18 + rand() * 0.18).toFixed(2)}"/>`
  }
  return `<defs><radialGradient id="${id}" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#E9E9E6"/><stop offset=".7" stop-color="#BDBDB9"/><stop offset="1" stop-color="#9C9C98"/></radialGradient></defs>
<g opacity="${opacity}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>${craters}</g>`
}

/** 白い板張り（名刺の背景の風合い） */
function planks(x, y, w, h, seed, n = 6) {
  const rand = rng(seed)
  const pw = w / n
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#EDEDEA"/>`
  for (let i = 0; i < n; i++) {
    const px = x + i * pw
    out += `<rect x="${px.toFixed(0)}" y="${y}" width="${pw.toFixed(0)}" height="${h}" fill="${rand() > 0.5 ? '#F3F3F0' : '#E6E6E2'}"/>`
    out += `<line x1="${px.toFixed(0)}" y1="${y}" x2="${px.toFixed(0)}" y2="${y + h}" stroke="#C9C9C5" stroke-width="2"/>`
    for (let k = 0; k < 5; k++) {
      const gx = px + rand() * pw
      out += `<path d="M${gx.toFixed(0)} ${y} q ${(rand() * 10 - 5).toFixed(0)} ${(h / 2).toFixed(0)} 0 ${h}" stroke="#D2D2CE" stroke-width="1" fill="none" opacity=".7"/>`
    }
  }
  return out
}

/** 縦の色ブロック帯（名刺の両端） */
function vstrip(x, y, w, h, colors) {
  const step = h / colors.length
  return colors.map((c, i) => `<rect x="${x}" y="${(y + i * step).toFixed(0)}" width="${w}" height="${Math.ceil(step)}" fill="${c}"/>`).join('')
}
/** 横の色ブロック帯 */
function hstrip(x, y, w, h, colors = BLOCKS) {
  const step = w / colors.length
  return colors.map((c, i) => `<rect x="${(x + i * step).toFixed(0)}" y="${y}" width="${Math.ceil(step)}" height="${h}" fill="${c}"/>`).join('')
}
/** 金属板のリベット（名刺右端の青いブロック） */
function rivets(x, y, w, h, seed) {
  const rand = rng(seed)
  let out = ''
  for (let i = 0; i < 6; i++) out += `<circle cx="${(x + 8 + rand() * (w - 16)).toFixed(0)}" cy="${(y + 10 + rand() * (h - 20)).toFixed(0)}" r="2.5" fill="#000" opacity=".25"/>`
  return out
}
/** 透かし文字 */
const ghost = (x, y, text, size, anchor = 'start', fill = C.ink, op = 0.07) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${LOGO_FONT}" font-size="${size}" font-weight="800" fill="${fill}" opacity="${op}">${text}</text>`

const files = {}

/* ── ヒーロー（1600×900）。両端の色ブロックは CSS 側（.hero__edge）で描く ── */
files['images/hero/slide-1.svg'] = svg(1600, 900, 'パールの地に灰色の月が浮かぶグラフィック',
  `${pearl('p1', 1600, 900)}${moon(1240, 640, 300, 'm1')}${moon(300, 170, 46, 'm1b', 0.7)}
${ghost(140, 860, 'REGOLITH', 230, 'start', C.ink, 0.05)}`)

files['images/hero/slide-2.svg'] = svg(1600, 900, '白い板張りの壁に赤・黄・緑・青の色ブロックを並べたグラフィック',
  `${planks(0, 0, 1600, 900, 5, 10)}
<rect x="120" y="90" width="230" height="300" fill="${C.red}"/><rect x="120" y="390" width="230" height="160" fill="${C.yellow}"/><rect x="120" y="550" width="230" height="140" fill="${C.lime}"/>
<rect x="1260" y="160" width="220" height="200" fill="${C.green}"/><rect x="1260" y="360" width="220" height="150" fill="${C.yellow}"/><rect x="1260" y="510" width="220" height="230" fill="${C.navy}"/>
<rect x="1150" y="610" width="110" height="200" fill="${C.blue}"/>${rivets(1150, 610, 110, 200, 9)}
<rect x="240" y="690" width="110" height="160" fill="${C.ink}"/><rect x="240" y="850" width="110" height="50" fill="${C.maroon}"/>`)

files['images/hero/slide-3.svg'] = svg(1600, 900, '黒い縦帯と REGOLITH・101FIT の透かし文字を配したグラフィック',
  `${pearl('p3', 1600, 900)}<rect x="1110" y="0" width="64" height="900" fill="${C.ink}"/>
<g transform="rotate(90 1290 450)">${ghost(940, 380, 'REGOLITH', 170, 'start', C.ink, 0.08)}</g>
<g transform="rotate(90 340 450)">${ghost(80, 420, '101FIT', 190, 'start', C.ink, 0.07)}</g>
<text x="1142" y="450" transform="rotate(90 1142 450)" text-anchor="middle" font-family="'Cormorant Garamond', 'Times New Roman', serif" font-size="26" fill="#fff" letter-spacing="3">Instantaneous power</text>`)

/* ── サブページのカバー（1600×600）: パール地 + 月 + 端の色ブロック + 透かし ── */
const cover = (alt, seed, word, accent = '') =>
  svg(1600, 600, alt,
    `${pearl(`c${seed}`, 1600, 600)}${vstrip(0, 0, 54, 600, [C.red, C.silver, C.yellow, C.lime, C.ink, C.maroon])}
${vstrip(1546, 0, 54, 600, [C.green, C.yellow, C.navy, C.blue])}${rivets(1546, 450, 54, 150, seed)}
${moon(1250, 470, 230, `cm${seed}`)}${ghost(130, 360, word, 170, 'start', C.ink, 0.07)}${accent}`)

files['images/services/cover.svg'] = cover('パールの地に月と色ブロックを配したサービスのカバーイメージ', 11, 'SERVICES')
files['images/company/cover.svg'] = cover('パールの地に月と色ブロックを配した会社概要のカバーイメージ', 12, 'COMPANY')
files['images/news/cover.svg'] = cover('パールの地に月と色ブロックを配したお知らせのカバーイメージ', 13, 'NEWS')
files['images/column/cover.svg'] = cover('パールの地に開いたノートと色ブロックを配したコラムのカバーイメージ', 14, 'COLUMN',
  `<g transform="translate(700 150)"><path d="M0 20 Q90 0 180 20 V280 Q90 260 0 280Z" fill="#fff" stroke="${C.silver}"/><path d="M180 20 Q270 0 360 20 V280 Q270 260 180 280Z" fill="#fafaf8" stroke="${C.silver}"/>
${[70, 110, 150, 190, 230].map((y) => `<line x1="28" y1="${y}" x2="152" y2="${y - 8}" stroke="${C.silver}" stroke-width="4"/><line x1="208" y1="${y - 8}" x2="332" y2="${y}" stroke="${C.silver}" stroke-width="4"/>`).join('')}<line x1="180" y1="20" x2="180" y2="280" stroke="${C.red}" stroke-width="5"/></g>`)
files['images/nav/contact.svg'] = cover('パールの地に月と色ブロックを配したお問い合わせのカバーイメージ', 15, 'CONTACT')

/* ── 本文中の図版（800×600）── */
const light = (alt, seed, body) => svg(800, 600, alt, `${pearl(`l${seed}`, 800, 600)}${body}`)
const label = (x, y, text, fill = C.ink, size = 24) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${COND_FONT}" font-size="${size}" font-weight="700" letter-spacing="3" fill="${fill}">${text}</text>`

files['images/services/three-stars.svg'] = light('求人コンサル・REGOLITH ORBIT・101FIT を3つの色ブロックで表した図', 21,
  `${moon(620, 140, 80, 'ts')}
<rect x="90" y="200" width="200" height="300" fill="${C.red}"/>${label(190, 360, 'RECRUIT', C.white, 30)}
<rect x="300" y="250" width="200" height="250" fill="${C.blue}"/>${rivets(300, 250, 200, 250, 4)}${label(400, 385, 'ORBIT', C.white, 30)}
<rect x="510" y="300" width="200" height="200" fill="${C.green}"/>${label(610, 410, '101FIT', C.white, 30)}
<rect x="90" y="500" width="620" height="10" fill="${C.ink}"/>
${label(295, 548, 'ADVERTISING AGENCY', C.ink, 20)}${label(610, 548, 'FITNESS GYM', C.ink, 20)}`)

files['images/services/recruit.svg'] = light('求人原稿と応募者を色ブロックで結んだ図', 22,
  `${vstrip(0, 0, 34, 600, [C.red, C.yellow, C.lime, C.ink])}
<rect x="130" y="120" width="250" height="340" fill="#fff" stroke="${C.ink}" stroke-width="4"/><rect x="160" y="156" width="130" height="22" fill="${C.red}"/>
${[210, 250, 290, 330, 370, 410].map((y, i) => `<rect x="160" y="${y}" width="${i % 2 ? 150 : 190}" height="12" fill="${C.silver}"/>`).join('')}
<path d="M400 290 H560" stroke="${C.ink}" stroke-width="5"/><path d="M540 272 L566 290 L540 308" fill="none" stroke="${C.ink}" stroke-width="5"/>
<rect x="590" y="220" width="140" height="170" fill="${C.yellow}"/><circle cx="660" cy="280" r="28" fill="${C.ink}"/><path d="M616 360 Q660 312 704 360Z" fill="${C.ink}"/>`)

files['images/services/orbit.svg'] = light('ホームページの画面を中心に7つの機能を色ブロックで並べた図', 23,
  `<rect x="240" y="150" width="320" height="220" fill="${C.ink}"/><rect x="256" y="166" width="288" height="168" fill="#fff"/>
<rect x="274" y="184" width="120" height="16" fill="${C.red}"/>${[216, 240, 264, 288].map((y) => `<rect x="274" y="${y}" width="230" height="10" fill="${C.silver}"/>`).join('')}<rect x="360" y="370" width="80" height="22" fill="${C.ink}"/><rect x="320" y="392" width="160" height="10" fill="${C.ink}"/>
${hstrip(100, 470, 600, 40, [C.red, C.yellow, C.lime, C.green, C.navy, C.blue, C.maroon])}
${label(400, 550, 'UPDATE · INQUIRY · RESERVATION · ANALYTICS · MARKETING · REPEAT · FOUNDATION', C.ink, 16)}`)

files['images/services/fit.svg'] = light('ダンベルと色ブロックを組み合わせたジムのイメージ図', 24,
  `${vstrip(766, 0, 34, 600, [C.green, C.yellow, C.navy, C.blue])}
<rect x="230" y="288" width="340" height="26" fill="${C.silver}"/>
<rect x="170" y="210" width="60" height="180" fill="${C.ink}"/><rect x="120" y="240" width="50" height="120" fill="${C.red}"/>
<rect x="570" y="210" width="60" height="180" fill="${C.ink}"/><rect x="630" y="240" width="50" height="120" fill="${C.red}"/>
${ghost(400, 140, '101FIT', 96, 'middle', C.ink, 0.85)}${label(400, 470, 'FITNESS GYM', C.ink, 28)}${label(400, 505, 'ICHI MARU ICHI', '#575754', 20)}`)

files['images/about/office.svg'] = light('灰色の月と石狩の地平線、色ブロックを組み合わせた会社のイメージ図', 25,
  `${moon(560, 190, 110, 'of')}<path d="M0 400 L130 388 L240 396 L360 380 L500 394 L640 384 L800 394 V600 H0Z" fill="${C.pearl2}"/>
<line x1="0" y1="400" x2="800" y2="400" stroke="${C.ink}" stroke-width="2"/>
<rect x="250" y="300" width="220" height="100" fill="${C.ink}"/><rect x="290" y="324" width="44" height="30" fill="${C.pearl}"/><rect x="386" y="324" width="44" height="30" fill="${C.pearl}"/><rect x="342" y="350" width="36" height="50" fill="${C.yellow}"/>
${hstrip(0, 560, 800, 40)}${label(400, 470, 'ISHIKARI, HOKKAIDO', '#575754', 22)}`)

files['images/about/philosophy.svg'] = light('名刺と同じ色ブロックと灰色の月で構成した REGOLITH のブランドイメージ', 26,
  `${vstrip(0, 0, 60, 600, [C.red, C.silver, C.yellow, C.lime, C.ink, C.maroon])}${vstrip(740, 0, 60, 600, [C.green, C.yellow, C.navy, C.blue])}${rivets(740, 450, 60, 150, 2)}
${moon(560, 430, 150, 'ph')}
<text x="110" y="200" font-family="${LOGO_FONT}" font-size="86" font-weight="800" fill="${C.ink}">REGOLITH</text>
<text x="114" y="128" font-family="${JP_SANS}" font-size="22" font-weight="700" fill="${C.ink}" letter-spacing="6">株式会社 レゴリス</text>
<text x="114" y="250" font-family="'Cormorant Garamond', 'Times New Roman', serif" font-size="30" fill="#575754" letter-spacing="2">Instantaneous power</text>`)

files['images/access/map-deco.svg'] = light('地図のピンと色ブロックを組み合わせた装飾', 27,
  `${[120, 240, 360, 480, 600, 720].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="600" stroke="${C.silver}" stroke-opacity=".6"/>`).join('')}${[100, 200, 300, 400, 500].map((y) => `<line x1="0" y1="${y}" x2="800" y2="${y}" stroke="${C.silver}" stroke-opacity=".6"/>`).join('')}
<rect x="120" y="100" width="120" height="100" fill="${C.yellow}" opacity=".8"/><rect x="600" y="400" width="120" height="100" fill="${C.blue}" opacity=".8"/><rect x="480" y="100" width="120" height="100" fill="${C.green}" opacity=".6"/>
<path d="M400 170 C452 170 484 206 484 248 C484 306 400 380 400 380 C400 380 316 306 316 248 C316 206 348 170 400 170Z" fill="${C.ink}"/><circle cx="400" cy="248" r="28" fill="${C.red}"/>`)

for (const [rel, body] of Object.entries(files)) {
  const out = join(pub, rel)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, body)
}
console.log(`[brand] SVG ${Object.keys(files).length} 枚を生成`)

/* ── 仮ロゴ（public/logo.png・正方形 512px・favicon 兼用）──
   名刺の「黒い円に白抜きの R」マークを参考にした仮版。正式なロゴデータが届いたら差し替える。
   背景は透過。黒いフッターでも輪郭が見えるよう円に細い白の縁を付ける */
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<circle cx="256" cy="256" r="236" fill="${C.ink}" stroke="${C.white}" stroke-width="14"/>
<path d="M118 256 A138 138 0 0 1 256 118 A112 138 0 0 0 144 256 A112 138 0 0 0 256 394 A138 138 0 0 1 118 256Z" fill="${C.white}"/>
<text x="276" y="352" text-anchor="middle" font-family="${LOGO_FONT}" font-size="270" font-weight="800" fill="${C.white}">R</text>
</svg>`
await sharp(Buffer.from(logoSvg)).png().toFile(join(pub, 'logo.png'))

/* ── OG 画像（1200×630）── */
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
${pearl('og', 1200, 630)}${vstrip(0, 0, 48, 630, [C.red, C.silver, C.yellow, C.lime, C.ink, C.maroon])}${vstrip(1152, 0, 48, 630, [C.green, C.yellow, C.navy, C.blue])}
${moon(960, 470, 210, 'ogm')}
<text x="110" y="132" font-family="${JP_SANS}" font-size="24" font-weight="700" fill="${C.ink}" letter-spacing="8">株式会社 レゴリス</text>
<text x="106" y="218" font-family="${LOGO_FONT}" font-size="96" font-weight="800" fill="${C.ink}">REGOLITH</text>
<rect x="110" y="250" width="240" height="8" fill="${C.red}"/><rect x="350" y="250" width="80" height="8" fill="${C.yellow}"/><rect x="430" y="250" width="80" height="8" fill="${C.blue}"/>
<text x="108" y="350" font-family="${JP}" font-size="64" font-weight="800" fill="${C.ink}">事業を、次の軌道へ。</text>
<text x="110" y="412" font-family="${JP_SANS}" font-size="26" font-weight="700" fill="#575754">採用・集客・健康づくり。石狩から。</text>
<text x="110" y="520" font-family="${COND_FONT}" font-size="26" font-weight="700" fill="${C.ink}" letter-spacing="6">ADVERTISING AGENCY  /  FITNESS GYM</text>
</svg>`
await sharp(Buffer.from(ogSvg)).png().toFile(join(pub, 'og-image.png'))
console.log('[brand] logo.png / og-image.png を生成')
