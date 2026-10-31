#!/usr/bin/env node
/**
 * build-brand.mjs — ブランド画像（生成 SVG イラスト・ロゴ・OG 画像）を出力する（R13）
 *
 * 顧客から実画像が未提供のため、design.color_theme の 4 色（ムーンダスト / ディープスペース /
 * レゴリスグレー / オービットオレンジ）で月面・軌道モチーフの SVG を生成する。
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

const C = { dust: '#EEEDE8', space: '#14182B', space2: '#232A47', grey: '#8A8780', orange: '#FF7A1A', ink: '#1C1E24' }
const SORA = 'Sora, Segoe UI, sans-serif'
const JP = 'Zen Kaku Gothic New, Noto Sans JP, Yu Gothic, Meiryo, sans-serif'

const svg = (w, h, label, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">${body}</svg>\n`

/** 擬似乱数（毎回同じ星・粒子の配置にする） */
function rng(seed) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}
function stars(w, h, n, seed, color = '#fff', maxR = 1.6) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < n; i++) {
    out += `<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" r="${(0.4 + r() * maxR).toFixed(1)}" fill="${color}" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`
  }
  return out
}
function dust(w, y0, y1, n, seed, color = C.grey) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < n; i++) {
    out += `<circle cx="${(r() * w).toFixed(0)}" cy="${(y0 + r() * (y1 - y0)).toFixed(0)}" r="${(0.6 + r() * 1.8).toFixed(1)}" fill="${color}" opacity="${(0.15 + r() * 0.35).toFixed(2)}"/>`
  }
  return out
}
const grad = (id, a, b, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`
const orbit = (cx, cy, rx, ry, rot, attrs = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="none" ${attrs}/>`
const label = (x, y, text, size = 96) =>
  `<text x="${x}" y="${y}" font-family="${SORA}" font-size="${size}" font-weight="700" fill="${C.dust}" opacity=".12" letter-spacing="12">${text}</text>`

const files = {}

/* ── ヒーロー（1600×900）── */
files['images/hero/slide-1.svg'] = svg(
  1600, 900, '月面の地平線の上に細い軌道線が弧を描くグラフィック',
  `<defs>${grad('g', C.space, C.space2)}${grad('m', '#3a3f55', C.space)}</defs>
<rect width="1600" height="900" fill="url(#g)"/>${stars(1600, 620, 120, 7, '#fff', 1.4)}
${orbit(800, 430, 700, 150, -8, `stroke="${C.dust}" stroke-opacity=".28" stroke-width="1.5"`)}
${orbit(800, 430, 560, 110, -8, `stroke="${C.orange}" stroke-opacity=".55" stroke-width="2" stroke-dasharray="2 10"`)}
<circle cx="1310" cy="338" r="9" fill="${C.orange}"/><circle cx="1310" cy="338" r="24" fill="${C.orange}" opacity=".18"/>
<path d="M0 760 Q400 690 800 712 T1600 700 V900 H0Z" fill="url(#m)"/>
<path d="M0 800 Q500 752 1000 772 T1600 760 V900 H0Z" fill="${C.ink}" opacity=".85"/>${dust(1600, 720, 900, 140, 3, C.dust)}`,
)

files['images/hero/slide-2.svg'] = svg(
  1600, 900, '石狩の地平線と夜明けの空を抽象化したグラフィック',
  `<defs>${grad('s', C.space, '#4a3a3a')}<radialGradient id="sun" cx=".5" cy="1" r=".6"><stop offset="0" stop-color="${C.orange}" stop-opacity=".75"/><stop offset="1" stop-color="${C.orange}" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="url(#s)"/><rect y="300" width="1600" height="390" fill="url(#sun)"/>${stars(1600, 380, 80, 21, '#fff', 1.2)}
<path d="M0 690 H1600 V900 H0Z" fill="${C.space}"/>
<path d="M0 690 L180 676 L260 684 L420 668 L520 680 L700 672 L860 686 L1040 670 L1200 682 L1380 674 L1600 684 V692 H0Z" fill="${C.ink}"/>
<line x1="0" y1="692" x2="1600" y2="692" stroke="${C.orange}" stroke-width="2" opacity=".8"/>
${[0, 1, 2, 3, 4].map((i) => `<line x1="${120 + i * 40}" y1="${740 + i * 30}" x2="${1480 - i * 40}" y2="${740 + i * 30}" stroke="${C.dust}" stroke-opacity="${(0.12 - i * 0.02).toFixed(2)}"/>`).join('')}
${orbit(800, 560, 760, 120, 0, `stroke="${C.dust}" stroke-opacity=".22" stroke-width="1.4"`)}`,
)

files['images/hero/slide-3.svg'] = svg(
  1600, 900, '3つの星が同じ軌道を回るグラフィック',
  `<defs>${grad('g3', '#1a1f38', C.space)}</defs><rect width="1600" height="900" fill="url(#g3)"/>${stars(1600, 900, 140, 33, '#fff', 1.3)}
<circle cx="800" cy="450" r="120" fill="#3a3f55"/><circle cx="800" cy="450" r="120" fill="none" stroke="${C.dust}" stroke-opacity=".3"/>
<circle cx="760" cy="420" r="18" fill="${C.space}" opacity=".5"/><circle cx="842" cy="490" r="12" fill="${C.space}" opacity=".5"/><circle cx="822" cy="398" r="8" fill="${C.space}" opacity=".5"/>
${orbit(800, 450, 520, 170, -14, `stroke="${C.dust}" stroke-opacity=".35" stroke-width="1.5"`)}
${orbit(800, 450, 680, 230, -14, `stroke="${C.orange}" stroke-opacity=".4" stroke-width="1.5" stroke-dasharray="3 12"`)}
<circle cx="1290" cy="330" r="12" fill="${C.orange}"/><circle cx="1290" cy="330" r="30" fill="${C.orange}" opacity=".16"/>
<circle cx="330" cy="555" r="10" fill="${C.dust}"/><circle cx="330" cy="555" r="26" fill="${C.dust}" opacity=".14"/>
<circle cx="930" cy="612" r="9" fill="${C.dust}"/><circle cx="930" cy="612" r="22" fill="${C.dust}" opacity=".14"/>`,
)

/* ── サブページのカバー（1600×600・PageHero）── */
const cover = (alt, seed, accent) =>
  svg(
    1600, 600, alt,
    `<defs>${grad('c', C.space, C.space2, 1, 1)}</defs><rect width="1600" height="600" fill="url(#c)"/>${stars(1600, 600, 70, seed, '#fff', 1.2)}
${orbit(1180, 300, 520, 140, -10, `stroke="${C.dust}" stroke-opacity=".25" stroke-width="1.4"`)}
${orbit(1180, 300, 380, 96, -10, `stroke="${C.orange}" stroke-opacity=".45" stroke-width="1.6" stroke-dasharray="2 9"`)}
<path d="M0 520 Q800 470 1600 505 V600 H0Z" fill="${C.ink}" opacity=".9"/>${dust(1600, 510, 600, 90, seed + 1, C.dust)}${accent}`,
  )

files['images/services/cover.svg'] = cover('3つの事業を表す星と軌道線のカバーイメージ', 11,
  `<circle cx="1555" cy="232" r="9" fill="${C.orange}"/><circle cx="820" cy="360" r="8" fill="${C.dust}"/><circle cx="1240" cy="402" r="7" fill="${C.dust}"/>${label(120, 330, 'SERVICES')}`)
files['images/company/cover.svg'] = cover('月面の地平線と軌道線を描いた会社概要のカバーイメージ', 12,
  `<circle cx="300" cy="200" r="70" fill="#3a3f55"/><circle cx="280" cy="185" r="12" fill="${C.space}" opacity=".5"/><circle cx="1555" cy="232" r="9" fill="${C.orange}"/>${label(520, 330, 'COMPANY')}`)
files['images/news/cover.svg'] = cover('軌道線と通知の波紋を描いたお知らせのカバーイメージ', 13,
  `${[30, 60, 92].map((r, i) => `<circle cx="1180" cy="300" r="${r}" fill="none" stroke="${C.orange}" stroke-opacity="${(0.6 - i * 0.18).toFixed(2)}" stroke-width="2"/>`).join('')}<circle cx="1180" cy="300" r="10" fill="${C.orange}"/>${label(120, 330, 'NEWS')}`)
files['images/column/cover.svg'] = cover('開いたノートと軌道線を描いたコラムのカバーイメージ', 14,
  `<g transform="translate(1040 200)"><path d="M0 20 Q70 0 140 20 V200 Q70 180 0 200Z" fill="${C.dust}" opacity=".92"/><path d="M140 20 Q210 0 280 20 V200 Q210 180 140 200Z" fill="${C.dust}" opacity=".8"/>
${[60, 90, 120, 150].map((y) => `<line x1="24" y1="${y}" x2="116" y2="${y - 6}" stroke="${C.grey}" stroke-width="3"/><line x1="164" y1="${y - 6}" x2="256" y2="${y}" stroke="${C.grey}" stroke-width="3"/>`).join('')}<line x1="140" y1="20" x2="140" y2="200" stroke="${C.orange}" stroke-width="3"/></g>${label(120, 330, 'COLUMN')}`)
files['images/nav/contact.svg'] = cover('軌道線の先で光るオレンジの星を描いたお問い合わせのカバーイメージ', 15,
  `<circle cx="1555" cy="232" r="14" fill="${C.orange}"/><circle cx="1555" cy="232" r="40" fill="${C.orange}" opacity=".15"/><circle cx="1555" cy="232" r="72" fill="${C.orange}" opacity=".07"/>${label(120, 330, 'CONTACT')}`)

/* ── 本文中の図版（800×600・明るい地）── */
const light = (alt, seed, body) => svg(800, 600, alt, `<rect width="800" height="600" fill="${C.dust}"/>${dust(800, 0, 600, 70, seed)}${body}`)
const tag = (x, y, text) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="${SORA}" font-size="20" font-weight="700" fill="${C.ink}">${text}</text>`

files['images/services/three-stars.svg'] = light('求人コンサル・REGOLITH ORBIT・101FIT の3つの星が同じ軌道を回る図', 21,
  `<circle cx="400" cy="300" r="78" fill="${C.space}"/><circle cx="378" cy="282" r="12" fill="${C.space2}"/><circle cx="420" cy="322" r="8" fill="${C.space2}"/>
${orbit(400, 300, 300, 120, -14, `stroke="${C.space}" stroke-opacity=".35" stroke-width="2"`)}${orbit(400, 300, 360, 160, -14, `stroke="${C.orange}" stroke-width="2" stroke-dasharray="3 10"`)}
<circle cx="680" cy="196" r="22" fill="${C.orange}"/><circle cx="118" cy="372" r="20" fill="${C.space}"/><circle cx="470" cy="452" r="18" fill="${C.grey}"/>
${tag(680, 246, 'ORBIT')}${tag(118, 422, 'RECRUIT')}${tag(470, 500, '101FIT')}`)

files['images/services/recruit.svg'] = light('求人原稿と応募の矢印を軌道線で結んだ図', 22,
  `<rect x="140" y="140" width="230" height="300" rx="14" fill="#fff" stroke="${C.space}" stroke-width="3"/><rect x="170" y="176" width="120" height="16" rx="8" fill="${C.orange}"/>
${[220, 256, 292, 328, 364, 400].map((y, i) => `<rect x="170" y="${y}" width="${i % 2 ? 140 : 170}" height="10" rx="5" fill="${C.grey}" opacity=".6"/>`).join('')}
<path d="M390 300 C470 200 540 200 610 280" fill="none" stroke="${C.orange}" stroke-width="3" stroke-dasharray="4 9"/><path d="M596 262 L612 284 L588 290" fill="none" stroke="${C.orange}" stroke-width="3"/>
<circle cx="640" cy="330" r="46" fill="${C.space}"/><circle cx="640" cy="316" r="15" fill="${C.dust}"/><path d="M612 356 Q640 330 668 356" fill="${C.dust}"/>
${orbit(400, 300, 340, 110, -6, `stroke="${C.space}" stroke-opacity=".18" stroke-width="2"`)}`)

files['images/services/orbit.svg'] = light('ホームページを中心に7つの機能が軌道を回る図', 23,
  `<rect x="280" y="210" width="240" height="170" rx="12" fill="${C.space}"/><rect x="296" y="228" width="208" height="120" rx="4" fill="${C.dust}"/>
<rect x="312" y="244" width="90" height="12" rx="6" fill="${C.orange}"/>${[270, 290, 310].map((y) => `<rect x="312" y="${y}" width="170" height="8" rx="4" fill="${C.grey}" opacity=".6"/>`).join('')}<rect x="360" y="380" width="80" height="14" fill="${C.space}"/>
${orbit(400, 300, 330, 190, -8, `stroke="${C.space}" stroke-opacity=".3" stroke-width="2"`)}
${[0, 1, 2, 3, 4, 5, 6].map((i) => {
  const a = (i / 7) * Math.PI * 2 - 0.6
  return `<circle cx="${(400 + Math.cos(a) * 326).toFixed(0)}" cy="${(300 + Math.sin(a) * 186).toFixed(0)}" r="${i === 0 ? 16 : 11}" fill="${i === 0 ? C.orange : C.space}"/>`
}).join('')}`)

files['images/services/fit.svg'] = light('ダンベルと軌道線を組み合わせたジムのイメージ図', 24,
  `${orbit(400, 300, 300, 120, -12, `stroke="${C.orange}" stroke-width="2" stroke-dasharray="3 10"`)}
<g transform="rotate(-12 400 300)"><rect x="250" y="288" width="300" height="24" rx="6" fill="${C.grey}"/>
<rect x="200" y="220" width="50" height="160" rx="10" fill="${C.space}"/><rect x="160" y="245" width="40" height="110" rx="10" fill="${C.space2}"/>
<rect x="550" y="220" width="50" height="160" rx="10" fill="${C.space}"/><rect x="600" y="245" width="40" height="110" rx="10" fill="${C.space2}"/></g>
<circle cx="660" cy="170" r="14" fill="${C.orange}"/><text x="400" y="520" text-anchor="middle" font-family="${SORA}" font-size="40" font-weight="700" fill="${C.space}" letter-spacing="6">101FIT</text>`)

files['images/about/office.svg'] = light('石狩の地平線の上を軌道線が横切る会社のイメージ図', 25,
  `<rect width="800" height="380" fill="${C.space}"/>${stars(800, 380, 60, 77, '#fff', 1.2)}
${orbit(400, 250, 360, 80, -6, `stroke="${C.orange}" stroke-width="2" stroke-opacity=".8"`)}<circle cx="690" cy="196" r="10" fill="${C.orange}"/>
<path d="M0 380 L120 366 L210 374 L330 358 L460 372 L600 362 L800 374 V380Z" fill="${C.ink}"/><rect y="380" width="800" height="4" fill="${C.orange}" opacity=".7"/>
<g fill="${C.space}"><rect x="300" y="420" width="200" height="120" rx="4"/></g><rect x="380" y="480" width="40" height="60" fill="${C.dust}"/><rect x="320" y="440" width="40" height="28" fill="${C.dust}"/><rect x="440" y="440" width="40" height="28" fill="${C.dust}"/>
<text x="400" y="580" text-anchor="middle" font-family="${SORA}" font-size="18" font-weight="600" fill="${C.grey}" letter-spacing="8">ISHIKARI, HOKKAIDO</text>`)

files['images/about/philosophy.svg'] = light('月面の地平線からロケットの噴射のように軌道へ上るオレンジの線', 26,
  `<path d="M0 470 Q400 420 800 460 V600 H0Z" fill="${C.grey}" opacity=".35"/>${dust(800, 450, 600, 120, 99, C.space)}
<path d="M170 470 C260 330 420 220 650 150" fill="none" stroke="${C.orange}" stroke-width="16" stroke-linecap="round" opacity=".14"/>
<path d="M170 470 C260 330 420 220 650 150" fill="none" stroke="${C.orange}" stroke-width="4" stroke-linecap="round"/>
<circle cx="650" cy="150" r="14" fill="${C.orange}"/>${orbit(520, 200, 240, 70, -18, `stroke="${C.space}" stroke-opacity=".35" stroke-width="2"`)}
<text x="60" y="110" font-family="${SORA}" font-size="44" font-weight="700" fill="${C.space}" letter-spacing="4">REGOLITH</text>
<text x="62" y="146" font-family="${SORA}" font-size="18" font-weight="600" fill="${C.grey}" letter-spacing="6">ORBIT / PROPULSION</text>`)

files['images/access/map-deco.svg'] = light('地図のピンと軌道線を組み合わせた装飾', 27,
  `${[120, 240, 360, 480, 600, 720].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="600" stroke="${C.grey}" stroke-opacity=".18"/>`).join('')}${[100, 200, 300, 400, 500].map((y) => `<line x1="0" y1="${y}" x2="800" y2="${y}" stroke="${C.grey}" stroke-opacity=".18"/>`).join('')}
${orbit(400, 320, 300, 110, -10, `stroke="${C.orange}" stroke-width="2" stroke-dasharray="3 10"`)}
<path d="M400 180 C450 180 480 214 480 254 C480 310 400 380 400 380 C400 380 320 310 320 254 C320 214 350 180 400 180Z" fill="${C.space}"/><circle cx="400" cy="254" r="26" fill="${C.orange}"/>`)

for (const [rel, body] of Object.entries(files)) {
  const out = join(pub, rel)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, body)
}
console.log(`[brand] SVG ${Object.keys(files).length} 枚を生成`)

/* ── ロゴ（public/logo.png・正方形 512px・favicon 兼用）── 正式ロゴ提供後に差し替え */
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<rect width="512" height="512" rx="112" fill="${C.space}"/>
<circle cx="256" cy="268" r="112" fill="${C.dust}"/>
<circle cx="218" cy="236" r="20" fill="${C.grey}" opacity=".55"/><circle cx="296" cy="306" r="14" fill="${C.grey}" opacity=".55"/><circle cx="286" cy="214" r="9" fill="${C.grey}" opacity=".55"/>
${orbit(256, 268, 206, 70, -20, `stroke="${C.orange}" stroke-width="18"`)}
<circle cx="436" cy="192" r="26" fill="${C.orange}"/>
</svg>`
await sharp(Buffer.from(logoSvg)).png().toFile(join(pub, 'logo.png'))

/* ── OG 画像（1200×630）── */
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
<defs>${grad('o', C.space, C.space2, 1, 1)}</defs><rect width="1200" height="630" fill="url(#o)"/>${stars(1200, 630, 90, 5, '#fff', 1.3)}
${orbit(860, 300, 420, 120, -10, `stroke="${C.dust}" stroke-opacity=".25" stroke-width="2"`)}
${orbit(860, 300, 320, 90, -10, `stroke="${C.orange}" stroke-opacity=".6" stroke-width="2.5" stroke-dasharray="3 10"`)}
<circle cx="1150" cy="210" r="12" fill="${C.orange}"/>
<path d="M0 560 Q600 520 1200 548 V630 H0Z" fill="${C.ink}"/>
<text x="90" y="250" font-family="${JP}" font-size="78" font-weight="900" fill="${C.dust}">事業を、次の軌道へ。</text>
<rect x="92" y="290" width="120" height="5" fill="${C.orange}"/>
<text x="90" y="360" font-family="${JP}" font-size="30" font-weight="700" fill="${C.dust}" opacity=".85">採用・集客・健康づくり。</text>
<text x="90" y="470" font-family="${JP}" font-size="34" font-weight="700" fill="${C.dust}">株式会社レゴリス</text>
<text x="92" y="508" font-family="${SORA}" font-size="20" font-weight="600" fill="${C.grey}" letter-spacing="6">REGOLITH / ISHIKARI, HOKKAIDO</text>
</svg>`
await sharp(Buffer.from(ogSvg)).png().toFile(join(pub, 'og-image.png'))
console.log('[brand] logo.png / og-image.png を生成')
