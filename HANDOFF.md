# HANDOFF — P195 株式会社レゴリス 提案サイト

- **Worker 名: `p195`（仮）** — `wrangler.jsonc` の `name` は Cloudflare ダッシュボードで作成した Worker 名と**完全一致**させること。違う名前で作った場合は `wrangler.jsonc` を書き換えてからデプロイする（不一致だと別 Worker が自動作成され、Build 変数が当たらない）
- 入力: `顧客YAML/P195.yaml` / ルール: `ホームページ作成/CLAUDE.md`
- 構成: React 18 + Vite 6.4（`npm ls vite` で確認済み）+ react-router-dom 6 / SSG（ビルド時プリレンダリング）/ Cloudflare Workers 静的アセット
- UpNote: **パターン B 直叩き・セット 1**（Runtime タブは使わない）/ 有効コンテンツ: `columns`, `news`
- 問い合わせ: UpNote 問い合わせ API（`formKey: contact`）

## 自己検証の結果

| 項目 | 結果 |
|------|------|
| `node check.mjs .`（ソース＋本番ビルド dist） | **ERROR 0** / WARN 24（すべて装飾画像の `alt=""`。意図どおり） |
| `npm run build`（本番相当・API 未設定） | 成功。静的 7 ルートをプリレンダ、記事は API 未設定のためスキップ（想定どおり） |
| `PRERENDER_SAMPLE=1 npm run build`（`npm run build:sample`） | 32 ルート（記事 25 本含む）をプリレンダ。記事本文・BlogPosting/NewsArticle JSON-LD が静的 HTML に入ることを確認 |
| ハイドレーション | 正しい HTML が配信される URL で mismatch 警告なしを確認（※ `vite preview` は `/services` のような末尾スラッシュ無し URL にトップの HTML を返すため警告が出る。Cloudflare は `html_handling: drop-trailing-slash` で正しく配信される） |
| `npm run dev` | 起動確認済み。公開 API を叩かず `public/upnote-local/*.sample.json` で全画面表示 |
| 横スクロール（375px） | `/` `/services` `/company` `/news` `/news/:id` `/column` `/column/:id` `/contact` `404` で無し |
| ハンバーガー | 開閉・オーバーレイ・Esc・リンクで閉じる・スクロールロックを確認（1024px 以下で表示） |
| 問い合わせフォーム | 必須バリデーション表示、dev では送信シミュレートを確認。**実 API への送信は未確認** |
| `/news/99999` | 「記事が見つかりませんでした」+ 一覧へ戻る + noindex を確認 |
| `.env.development` / `.env.production` | 共通テンプレートのまま（YAML に `upnote.dev_* / prod_*` の記載が無いため値の流し込みなし） |

---

## 🧑‍💼 人手判断ポイント（要確認・要決定）

### 掲載情報（R2 により未掲載にしたもの・推測で書いていないもの）

- [ ] **設立年**: 特記事項は「一旦仮で」だが、仮の年を書くと誤情報になるため**会社概要に行ごと出していない**。確定したら `src/pages/CompanyPage.jsx` の `PROFILE_ROWS` に追加
- [ ] **郵便番号**: YAML に無いため未掲載（構造化データの `postalCode` も未出力）。分かれば `src/constants/site-data.json` の `address` に追加
- [ ] **公開用メールアドレス**: 未提供のため未掲載（問い合わせはフォーム + 電話）
- [ ] **電話番号 0133-76-6751**: 101FIT の番号を会社窓口として掲載（特記事項で了承済み）。**ジムの電話に会社宛ての問い合わせが入る**ことになるため、受付時間の表記を載せるか、電話に出る人の運用を確認
- [ ] **求人情報コンサルの具体内容**: 対応媒体・料金は未確定（「一旦仮で」）のため、YAML にある「求人原稿の作成・改善、採用活動の支援」の範囲だけで記述。確定したら `src/constants/services.js` の `SERVICES[0].points` を更新
- [ ] **料金**: 特記事項どおり掲載していない
- [ ] **法人番号 2430001068405**: 会社概要と構造化データに掲載。掲載不要なら `PROFILE_ROWS` から削除
- [ ] **ターゲット年代**（30-60代・推定）: サイト本文には出していない。コピーの語感判断の前提として確認

### コピー・語感

- [ ] キャッチ「事業を、次の軌道へ。」/ サブ「採用・集客・健康づくり。石狩から、地域の会社と人の推進力をつくります。」は YAML のまま使用
- [ ] **社名の由来**の文言（トップ・会社概要）: design メモの「レゴリス＝月や惑星の表面を覆う砂」「ORBIT＝軌道」を事実として掲載。**社名に込めた思い**は創作になるため書いていない。代表の言葉があれば会社概要「ABOUT US」に追記すると良い
- [ ] 選ばれる理由 3 点（`src/constants/site.js` の `USP_CARDS`）は YAML の USP を分解して作文
- [ ] **REGOLITH ORBIT 機能一覧の「困りごと → こう変わる」**（`src/constants/services.js` の `ORBIT_FEATURES`）: 機能名は YAML どおり、困りごと・変化の一文は作文。特に次は**実際の仕様と一致しているか要確認**
  - 「LINE AI秘書」→「LINE上のAI秘書が日々の運用をサポートします」（具体的にできることが分かれば書き換え）
  - 「AI一次返信・AIチャット」「営業メールの自動仕分け・追客リマインド」「料金シミュレーター・かんたん診断」「複数カレンダー・キャンセル待ち」
- [ ] トップの ORBIT ピックアップは 4 機能（LINE投稿 / 受信箱＋LINE通知 / 採用ページ・しごと検索 / アクセス分析）を選んだ。見せたい機能が別なら `HomePage.jsx` の `ORBIT_PICKS` を変更

### ページ構成

- [ ] **コラムページ `/column` を追加した**: YAML は `pages.blog: NO` だが、`upnote.コンテンツ` に「コラム」があり（ORBIT の AIコラム自動生成の実例にもなる）、一覧が無いとコラムが一切表示されないため。不要ならナビ・ルート・トップのコラム抜粋を削除する（`src/constants/nav.js` / `App.jsx` / `entry-server.jsx` / `HomePage.jsx` / `site-routes.json`）
- [ ] アクセスは独立ページにせず会社概要下部 `#access` に統合（`/access` は `/company?section=access` へ 301・ルールどおり）
- [ ] 101FIT の所在地（樽川）も会社概要のアクセス欄に掲載。地図は会社所在地（花川北）のみ。ジムの地図も必要なら追加

### 画像（すべて仮。差し替えは `public/` の同名ファイルを置き換えるだけ）

- [ ] **ロゴ `public/logo.png` は仮生成**（月＋軌道のマーク。正式ロゴ未提供）。ヘッダー・フッター・USP セクション・favicon で共通。正式ロゴを 512px 程度の正方形 PNG（余白付き）で差し替え
- [ ] **OG 画像 `public/og-image.png`**（1200×630・生成）。ロゴ確定後に作り直す場合は `npm run build:brand` を修正して再生成（※ 再実行すると SVG・logo.png も上書きされる）
- [ ] 生成 SVG（R13・15 枚・`scripts/build-brand.mjs` で生成）:
  - ヒーロー `images/hero/slide-1〜3.svg`（月面と軌道 / 石狩の地平線と夜明け / 3つの星）
  - カバー `images/{services,company,news,column}/cover.svg`、`images/nav/contact.svg`
  - 図版 `images/services/{three-stars,recruit,orbit,fit}.svg`、`images/about/{office,philosophy}.svg`、`images/access/map-deco.svg`
  - YAML の `images.main_visual`（月面・惑星の軌道の抽象グラフィック、または石狩の地平線と空）は生成 SVG で対応済み。実写の石狩の地平線写真を使う場合は `slide-2.svg` を差し替え
- [ ] **ソコスト仮イラスト**（R5-socost・商用可/クレジット不要。素材の再配布は不可）:

  | ファイル | 素材ID | 使用箇所 | 差し替え候補（images.* メモより） |
  |----------|--------|----------|------------------------------|
  | `images/illustrations/meeting.png` | 17048 | サービス：求人コンサル | 求人原稿の打合せ風景 |
  | `images/illustrations/admin.png` | 26698 | サービス：ORBIT「管理画面」 | **REGOLITH ORBIT 管理画面のスクリーンショット**（design.style で要望あり） |
  | `images/illustrations/reserve.png` | 23562 | トップ ORBIT 欄 / サービス：「スマホ・LINE」 | **ORBIT のスマホ画面・LINE 画面** |
  | `images/illustrations/analytics.png` | 9780 | サービス：「アクセス解析」 | ORBIT の解析画面 |
  | `images/illustrations/gym.png` | 5131 | サービス：101FIT | **101FIT のトレーニング風景（明るいトーン）** |
  | `images/illustrations/growth.png` | 16911 | サービス下部 | — |
  | `images/illustrations/partner.png` | 7690 | お問い合わせ | — |
  | `images/illustrations/interview.png` | 26195 | デモ JSON のサムネのみ | — |

  差し替え時は該当 `<img>` の `alt` を写真の内容に合わせて更新し、`width` / `height` も実寸に合わせる。JSX 内の `{/* 仮画像（ソコスト…）*/}` コメントも削除
- [ ] **代表のポートレート**（`images.about`）: 未提供のため未配置。届いたら会社概要「ABOUT US」の図版（`images/about/philosophy.svg`）と入れ替えるか、代表メッセージ欄を新設
- [ ] **101FIT の写真を公式サイト・Instagram から流用できるか**（`images.other`）: 権利確認が取れるまで未使用

---

## ☁️ Cloudflare 公開手順

### Build 設定

| 項目 | 値 |
|------|-----|
| Build command | `npm run build`（公開時は `npm run build:cloudflare:public` でも可） |
| Build output | `dist` |
| Deploy command | `npx wrangler deploy` |

`wrangler.jsonc` は `assets` のみ（`main` なし）・`html_handling: drop-trailing-slash`・`not_found_handling: single-page-application`。
**SPA の deep-link は wrangler 側で処理**するため `public/_redirects` に `/* /index.html 200` は入れていない（入れるとエラー②）。

### Build 変数（Settings → Build → Variables and secrets。**Runtime タブには何も置かない**）

| 変数 | 値 | 状態 |
|------|-----|------|
| `VITE_SITE_URL` | `https://<本番ドメイン>`（末尾スラッシュなし） | **未定**（本番ドメイン未確定）。未設定の間は canonical / og:url / sitemap.xml が出ない |
| `VITE_SITE_PUBLIC` | `1`（公開時）/ 未設定（ドラフト＝noindex・robots Disallow） | 提案中は未設定のまま |
| `VITE_UPNOTE_API_BASE_URL` | `https://api.upnote.jp`（`/api/v1` は付けない） | `.env.production` にも記載済み |
| `VITE_UPNOTE_PUBLIC_API_KEY` | `up_…`（公開 GET＋問い合わせ POST 用キー） | **未設定（YAML に `upnote.prod_api_key` 無し）→ 要エスカレーション** |
| `VITE_UPNOTE_API_KEY_HEADER` | `X-API-Key` | 任意 |
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | **未設定** |
| `VITE_GOOGLE_SITE_VERIFICATION` | Search Console の HTML タグの content 値 | 任意 |

- `UPNOTE_*`（VITE_ なし）や `VITE_UPNOTE_API_BASE=/api/upnote/v1`（パターン A 用）は**入れない**（混在すると 401）
- 変数を変えたら **Deployments → Retry deployment**（Build 変数は JS に埋め込まれるため再ビルド必須）

### UpNote 側の設定（必須）

- [ ] **UpNote 接続未設定**: 公開 API キー未発行・未設定。キー未設定のままだとお知らせ・コラムは「現在情報を取得できません」、**問い合わせフォームも送信できない**
- [ ] UpNote 管理画面の**許可オリジン**に `https://p195.<account>.workers.dev`（実際の Worker 名）と `https://<本番ドメイン>` を登録（未登録だと CORS で取得・送信とも失敗）
- [ ] コンテンツタイプ「お知らせ（news）」「コラム（columns）」が有効になっていること
- [ ] 問い合わせ通知は UpNote ログイン用メールアドレスに届く（サイト側に送信先設定は無い）。受信箱・LINE 通知で確認できる
- [ ] エスカレーション: 本番で `API_KEY_INVALID` / `API_KEY_INACTIVE` / `FORBIDDEN` が出たら UpNote 管理画面でキーの有効状態・許可オリジンを確認

### Deploy Hook × UpNote Webhook（SSG のため必須）

1. Cloudflare → Workers & Pages → 対象 Worker → Settings → Builds → **Deploy Hooks** → Create（名前例 `content-update`、ブランチ `main`）
2. 発行された URL を **UpNote 管理画面の Webhook 設定**に登録（コンテンツ公開時に自動 POST → 再ビルド → 記事の静的 HTML と sitemap が更新される）
3. Deploy Hook URL は秘密情報。リポジトリにコミットしない
- 未登録だと記事を公開しても検索エンジン向け HTML・sitemap が古いまま（閲覧者向け表示はクライアント取得で即時反映される）
- 静的 HTML 内の署名付き画像 URL は時間が経つと失効し得る（本文・構造化データには影響なし。閲覧者にはマウント後の再取得で新しい URL が出る）

### GA4（全新規案件標準）

- [ ] GA4 プロパティを作成（プロパティ名の例: `株式会社レゴリス コーポレートサイト`）
- [ ] 測定 ID: **未取得** → 取得後 `VITE_GA_MEASUREMENT_ID` に設定（未設定の間は gtag.js を読み込まない実装）
- [ ] 閲覧権限の付与先: **未定**（代表・鍵谷様のアカウント等を確認）

### IndexNow

- YAML に `upnote.indexnow_key` が無いため**鍵ファイルは作成していない**（架空の鍵は作らない）。UpNote 企業詳細で鍵を確認できたら YAML に追記し、`public/{鍵}.txt`（中身は鍵のみ）を追加 → デプロイ後に `https://<本番ドメイン>/{鍵}.txt` が素のテキストで開くこと、UpNote「今すぐ同期」で「送信成功」を確認
- UpNote 企業詳細の「サイトURL」に本番オリジンを登録すること

### robots.txt と Cloudflare managed robots.txt

- `VITE_SITE_PUBLIC=1` のときだけ `Allow`（AI クローラーも明示 Allow）。それ以外は `Disallow: /`
- Cloudflare の「managed robots.txt」が有効だと AI クローラーの Disallow が先頭に追記される。AI 検索に載せたい場合はダッシュボードで OFF にする

---

## ✅ 公開前に人の目で確認すること

- [ ] PC / スマホ実機（特に iOS Safari）で全ページの見た目。ヒーローの登場アニメ・スライド切替、透過ヘッダー（トップ最上部のみ）
- [ ] UpNote 本番の実写真で、お知らせ・コラムのカードのサムネと詳細ヒーローが **Safari で見切れない**こと（R5-Safari）
- [ ] R14-4: `/news` 10 件ずつ・ページャ / カード→ `/news/<id>` / 詳細 URL 直開き / 記事固有 title・description・canonical / 一覧へ戻る / トップの抜粋が 3 件ずつ / 「詳細情報」グリッドに未表示フィールドが漏れなく出て、二重表示が無い
- [ ] 問い合わせフォームから実送信 → UpNote 受信箱に「お問い合わせ」で入る（`formKey: contact`）。「ご相談の内容」「会社名・店舗名」「電話番号」は本文末尾の「── 入力内容 ──」に入る
- [ ] Google マップの位置（花川北一条5丁目81番地）が正しいか
- [ ] 外部リンク: REGOLITH ORBIT（https://regolith-orbit.jp/）、101FIT 公式サイト・Instagram・X の URL が生きているか
- [ ] 本番ドメイン決定後、`VITE_SITE_URL` 設定 → `dist/sitemap.xml` 生成・canonical 出力を確認 → Search Console 登録・sitemap 送信

## 🛠 実装メモ（保守向け）

- **UpNote ライブラリ**: `src/lib/upnote.js` / `useUpNote.js` は共通テンプレート版をベースに、R15（ローカルデモ JSON・`upnoteLocal.js`）、R9-retry（GET 自動リトライ・12 秒タイムアウト・復帰時再取得）、R14-5（SSG preload）を統合した版（P188 と同一実装）。**共通テンプレート版はローカル JSON / preload に未対応のため、そのままでは R14-5・R15 を満たせない**。共通テンプレート側への反映を検討
- 公開 API に `publishedAt` は無いため、日付は `notice_date` / `published_date` → `createdAt` の順、記事 JSON-LD の `datePublished` は `createdAt`
- ルート追加時は `src/App.jsx`（lazy）と `src/entry-server.jsx`（即時 import）の**両方**と `src/constants/site-routes.json` を更新
- sitemap の `lastmod` は記事のみ（`updatedAt`）。静的ページはビルド時刻を入れないよう省略
- `public/upnote-local/*.sample.json`（お知らせ 13 件・コラム 12 件）はデモ用。`dist/upnote-local/` として本番にも配信される（どこからもリンクされず、本番コードは読まない）。気になる場合はデプロイ前に除外する
- `PRERENDER_SAMPLE=1`（`npm run build:sample`）は**ローカル検証専用**。本番ビルドで使うとデモ記事が実 URL で公開される
- ブランド画像の再生成: `npm run build:brand`（SVG 15 枚 + logo.png + og-image.png を上書き）
- 色: ムーンダスト `#EEEDE8`（背景）/ ディープスペース `#14182B`（ヘッダー・見出し・フッター）/ レゴリスグレー `#8A8780`（罫線・図版のみ。文字は `#5E5B55`）/ オービットオレンジ `#FF7A1A`（ボタン・強調。オレンジ地の文字は濃紺、明るい地のオレンジ文字は `#A84806` でコントラスト 4.5:1 を確保）
- 書体: 見出し Sora（欧文・幾何学サンセリフ）+ Zen Kaku Gothic New（太めの和文ゴシック）、本文 Noto Sans JP。Inter / Roboto は不使用
