# HANDOFF — P195 株式会社レゴリス 提案サイト

- **Worker 名: `p195`（仮）** — `wrangler.jsonc` の `name` は Cloudflare ダッシュボードで作成した Worker 名と**完全一致**させること。違う名前で作った場合は `wrangler.jsonc` を書き換えてからデプロイする（不一致だと別 Worker が自動作成され、Build 変数が当たらない）
- 入力: `顧客YAML/P195.yaml` / ルール: `ホームページ作成/CLAUDE.md`
- 構成: React 18 + Vite 6.4（`npm ls vite` で確認済み）+ react-router-dom 6 / SSG（ビルド時プリレンダリング）/ Cloudflare Workers 静的アセット
- UpNote: **パターン B 直叩き・セット 1**（Runtime タブは使わない）/ 有効コンテンツ: `columns`, `news`
- 問い合わせ: UpNote 問い合わせ API（`formKey: contact`）

## 自己検証の結果

| 項目 | 結果 |
|------|------|
| `node check.mjs .`（ソース＋本番ビルド dist） | **ERROR 0** / WARN 18（すべて装飾画像の `alt=""`。意図どおり） |
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

## 🌙 ChatGPT の参考デザインでリデザイン（2026-10-31）

ChatGPT で作った全ページの参考デザイン（プロンプトは `design/redesign-prompts-subpages.md`）をもとに見た目を作り直した。**文言・掲載内容は変えていない**（参考画像の中の文言・架空の記事・別人の代表写真は使っていない）。

| 変更 | 内容 |
|------|------|
| 配色 | 濃紺の宇宙（ファーストビュー・各ページの見出し帯・ORBIT 紹介・相談の案内）とパール／白のセクションを交互に |
| 月と軌道 | `public/images/brand/moon.svg`（SVG フィルタで描いた灰色の月）+ `MoonOrbit.jsx`（軌道の線を月の前後に分けて描く） |
| ヘッダー・フッター | 白地。ロゴは名刺の色ブロック 5 色 + REGOLITH + 株式会社レゴリス（`Logo showName`）。ヘッダーの透過はやめた |
| サブページ見出し帯 | 画像だけの帯（R16-4）をやめ、欧文ラベル + ページ名（h1）+ パンくずを表示 |
| アイコン | `Icon.jsx`（線のアイコン。外部ライブラリなし） |
| お問い合わせ | 「ご相談の内容」をセレクトからラジオボタンに |

- 外した画像: サービスページの仮イラスト（打ち合わせ・管理画面 3 点・ジム・グラフ）、トップのヒーロースライド SVG、各ページのカバー SVG（ファイルは残している）
- [ ] **ロゴ**: ヘッダー・フッターは色ブロックの組みにした。正式ロゴデータをもらったら、使い方を相談して決める
- [ ] **ファーストビュー右端・会社概要の欧文（RECRUIT / WEB / HEALTH / ISHIKARI）**は装飾。使ってよいか代表に確認
- [ ] サービスのカード・各サービスの画像は図版（SVG）のまま。写真が用意できれば差し替えると参考デザインにより近づく

## 🎨 名刺ベースのリデザイン（2026-10-31）

代表の名刺（表・裏）を共有いただき、デザインテーマを名刺に合わせて作り直した。
**YAML の `design`（ムーンダスト × ディープスペース × オービットオレンジ）からは方針を変えている**ので、Notion の顧客管理 DB の design 欄も名刺テーマに更新しておくこと。

| 名刺の要素 | サイトでの使い方 |
|------------|------------------|
| パール／シルバーの地 | 背景色 `#F1F1EE`・光沢グラデーションのセクション（`.section--pearl`） |
| 両端の色ブロック（朱赤・黄・黄緑・緑・紺・青・臙脂・黒） | トップのヒーロー左右の縦帯（CSS 固定でスマホでも切れない）、ヘッダー上端・フッター・CTA の横帯、見出しの印、カード上辺の色 |
| 灰色の月 | ヒーロー・各ページカバー・図版の SVG |
| 白い板張り・リベット付きの金属板 | ヒーローのスライド 2 |
| 黒い太ゴシック「REGOLITH」+ 小さな「株式会社 レゴリス」 | ヘッダー・フッターのロゴ組み（Barlow 800） |
| 氏名の明朝体 | 和文見出し（しっぽり明朝 B1） |
| 裏面の黒い縦帯と「Instantaneous power」 | 主ボタンの黒、ヒーロー下・CTA・ブランド図版の欧文セリフ（Cormorant Garamond） |
| 裏面の「ADVERTISING AGENCY / FITNESS GYM」 | トップのサービス一覧を 2 本柱でグループ化、各サービスの欧文ラベル（Barlow Condensed） |
| 裏面の透かし「REGOLITH」「101FIT」・「ICHI MARU ICHI」 | 各セクション背景の透かし文字、101FIT のラベル |

- **ヒーローは明るいパール地になったため、透過ヘッダーの文字は白ではなく黒のまま**にしている（R16-1 の「白系」は写真の上で読ませるための指定。今回はコントラストを優先）。スライドの暗幕も、文字の後ろだけ明るくするベールに変更
- [ ] **ロゴは名刺のマーク（黒い円に白抜きの R と三日月）を見て描いた仮版**。形は正確ではないので、**正式なロゴデータ（AI / SVG / 高解像度 PNG）を顧客からもらって** `public/logo.png` を差し替える
- [ ] 「Instantaneous power」をサイトのスローガンとして使っている（名刺裏面より）。サイトで使ってよいか、和訳を添えるかを確認

### 名刺から追加した事実情報（要確認）

- [ ] **郵便番号 〒061-3211**（本社）を会社概要・アクセス・フッター・構造化データに追加
- [ ] **オフィス 〒061-3215 北海道石狩市花川北5条2丁目79番地** を会社概要に追加（本社と別の拠点）。**サイトに載せてよいか、何の拠点かを確認**。不要なら `PROFILE_ROWS` の「オフィス」行を削除
- [ ] **FAX 0133-76-6759** を会社概要・フッター・構造化データに追加
- [ ] 代表者のローマ字表記 **YOUSUKE KAGIYA** を会社概要に追加
- [ ] **名刺の TEL 欄はシールで隠れていて読めない**。サイトは引き続き YAML で了承済みの 0133-76-6751（101FIT の番号）を掲載。**会社の代表番号が別にあるなら差し替える**
- [ ] **名刺のメールアドレス（gmail）と携帯番号は掲載していない**（個人の連絡先のため）。公開用アドレスを載せる場合は確認のうえ追加

## ✍️ 訴求型の文言への書き換え（2026-10-31・コピーライティングのプラグイン使用）

コピーライティングのプラグイン（copywriting スキル）の原則で、サイトの文言を書き換えた。
方針: **機能より「お客様にとって何が変わるか」を先に書く／ターゲット（石狩・札幌圏の中小企業・店舗の経営者）の言葉で悩みを言い当てる／ボタンは押すと何が起きるかが分かる文言にする／数字・お客様の声・実績は未提供なので一切つくらない**。

| 場所 | 変更後の主な文言 |
|------|------------------|
| トップ「選ばれる理由」 | 見出し「自分たちで試して、効いた方法だけを。」・3 点カード（`src/constants/site.js` の `USP_CARDS`） |
| トップのサービス紹介 | 見出し「人が来ない。問い合わせが来ない。その悩み、まとめて相談できます。」＋よくある悩み 3 つ → 解決するサービス（`HomePage.jsx` の `PAINS`。YAML のターゲット層から作成） |
| トップの ORBIT 紹介 | 「ホームページ、公開してから止まっていませんか。」 |
| トップの会社紹介 | 「石狩の会社だから、石狩の採用と集客を知っています。」 |
| 最終 CTA（全ページ共通） | 「人が来ない、問い合わせが来ない。その悩みから、話しましょう。」・ボタン「フォームで相談する」「電話で相談する」 |
| サービスページ | 導入「採用に困ったら。集客に困ったら。まずはレゴリスへ。」・各サービスのキャッチと説明・求人コンサルの 3 項目（`src/constants/services.js`） |
| お問い合わせ | 悩みの例を並べた導入文・送信ボタン「この内容で相談する」 |
| meta description | トップ・サービスを悩み起点の文に変更（`site-routes.json` と `index.html` を同じ文面に） |

- メインのキャッチ「事業を、次の軌道へ。」とサブコピーは YAML（顧客指定）のため変えていない
- [ ] **語感の確認**: 「自分たちで試して、効いた方法だけを。」「石狩の会社だから、石狩の採用と集客を知っています。」など、言い切りの強い文言がある。代表の考えと合っているか確認
- [ ] **相談が無料かどうか**が分からないため「無料相談」とは書いていない。無料なら CTA を「無料で相談する」にすると申し込みが増えやすい
- [ ] 実績（支援社数・応募数の変化など）やお客様の声が用意できれば、トップに追加すると説得力が大きく上がる（今は創作になるため載せていない）

## 📰 お知らせ・コラムの表示方法（cre-comsence.com 方式・2026-10-31）

cre-comsence.com（ソースは `web-page-dev/crecomsence-homepage`）の**表示方法**に合わせた。デザインは名刺テーマのまま。

**一覧（`src/components/ContentBoard.jsx`）**
- 「全 N 件 ― N 件を表示・p/総ページ」の件数表示
- 1 ページ目は最新 1 件を「LATEST」として大きく表示し、残りを「過去のお知らせ／過去のコラム」としてカードで並べる
- ページ内は日付の新しい順に並べ替える（UpNote の並び順が未設定でも日付順になる）

**詳細（`src/components/ArticleDetail.jsx`）**
1. 黒い見出し帯: パンくず → 日付・カテゴリ・タグ → タイトル → サブタイトル → 著者
2. 白い紙面: 画像（切り抜かず全体を表示）→ 要約（`summary`）→ 本文 → よくある質問（`faq`）→ 著者カード（コラムのみ）→ 詳細情報（それ以外の全フィールド・R14-3a）→ 一覧へ戻る・日付
3. コラムのみ、記事の内容に合わせた導線（`ArticleCta.jsx`）: 求人・採用の記事 → 求人情報コンサル／ジム・健康の記事 → 101FIT／それ以外 → REGOLITH ORBIT

**本文の書き方（UpNote で記事を書く人向け・`src/lib/articleContent.js`）**

| 書き方 | 表示 |
|--------|------|
| 行頭に `■` | 見出し（左に色ブロックの印） |
| 行頭に `・` または `●` | 箇条書き。「ラベル: 本文」と書くとラベルが太字 |
| 行頭に `1.` `2.` | 番号付きリスト（空行を挟んでも番号が続く） |
| `faq` フィールドに「Q. 質問」改行「A. 答え」を空行区切りで | 記事末尾の「よくある質問」（開閉式）＋ FAQPage 構造化データ |
| `summary` | タイトル下の要約ボックス・meta description（本文の先頭と同じ文なら本文側から自動で除く） |
| `author_name` / `author_title` / `author_affiliation` / `author_profile` | 見出し帯の著者表示・記事末尾の著者カード |
| `meta_description` | 検索結果に出る説明文（無ければ要約 → 本文の先頭） |

- 本文に「■ よくある質問」以降があり、`faq` フィールドもある場合は、本文側の FAQ を自動で除いて二重表示を防ぐ
- [ ] UpNote の columns / news に `summary` `faq` `author_title` などのフィールドが無い場合は、無いまま表示される（エラーにはならない）。AI コラム自動生成の出力にこれらが含まれるか、UpNote 側で確認

## 🧑‍💼 人手判断ポイント（要確認・要決定）

### 掲載情報（R2 により未掲載にしたもの・推測で書いていないもの）

- [ ] **設立年**: 特記事項は「一旦仮で」だが、仮の年を書くと誤情報になるため**会社概要に行ごと出していない**。確定したら `src/pages/CompanyPage.jsx` の `PROFILE_ROWS` に追加
- [ ] **公開用メールアドレス**: 未掲載（問い合わせはフォーム + 電話）
- [ ] **電話番号 0133-76-6751**: 101FIT の番号を会社窓口として掲載（特記事項で了承済み）。**ジムの電話に会社宛ての問い合わせが入る**ことになるため、受付時間の表記を載せるか、電話に出る人の運用を確認
- [ ] **求人情報コンサルの具体内容**: 対応媒体・料金は未確定（「一旦仮で」）のため、YAML にある「求人原稿の作成・改善、採用活動の支援」の範囲だけで記述。確定したら `src/constants/services.js` の `SERVICES[0].points` を更新
- [ ] **料金**: 特記事項どおり掲載していない
- [ ] **法人番号 2430001068405**: 会社概要と構造化データに掲載。掲載不要なら `PROFILE_ROWS` から削除
- [ ] **ターゲット年代**（30-60代・推定）: サイト本文には出していない。コピーの語感判断の前提として確認

### コピー・語感

- [ ] キャッチ「事業を、次の軌道へ。」/ サブ「採用・集客・健康づくり。石狩から、地域の会社と人の推進力をつくります。」は YAML のまま使用
- [ ] **社名の由来**の文言（トップ・会社概要）: design メモの「レゴリス＝月や惑星の表面を覆う砂」「ORBIT＝軌道」を事実として掲載。**社名に込めた思い**は創作になるため書いていない。代表の言葉があれば会社概要「ABOUT US」に追記すると良い
- [ ] 選ばれる理由 3 点（`src/constants/site.js` の `USP_CARDS`）は YAML の USP を分解し、訴求型に書き直した（上の「訴求型の文言への書き換え」参照）
- [ ] **REGOLITH ORBIT 機能一覧の「困りごと → こう変わる」**（`src/constants/services.js` の `ORBIT_FEATURES`）: 機能名は YAML どおり、困りごと・変化の一文は作文。特に次は**実際の仕様と一致しているか要確認**
  - 「LINE AI秘書」→「LINE上のAI秘書が日々の運用をサポートします」（具体的にできることが分かれば書き換え）
  - 「AI一次返信・AIチャット」「営業メールの自動仕分け・追客リマインド」「料金シミュレーター・かんたん診断」「複数カレンダー・キャンセル待ち」
- [ ] トップの ORBIT ピックアップは 4 機能（LINE投稿 / 受信箱＋LINE通知 / 採用ページ・しごと検索 / アクセス分析）を選んだ。見せたい機能が別なら `HomePage.jsx` の `ORBIT_PICKS` を変更

### ページ構成

- [ ] **コラムページ `/column` を追加した**: YAML は `pages.blog: NO` だが、`upnote.コンテンツ` に「コラム」があり（ORBIT の AIコラム自動生成の実例にもなる）、一覧が無いとコラムが一切表示されないため。不要ならナビ・ルート・トップのコラム抜粋を削除する（`src/constants/nav.js` / `App.jsx` / `entry-server.jsx` / `HomePage.jsx` / `site-routes.json`）
- [ ] アクセスは独立ページにせず会社概要下部 `#access` に統合（`/access` は `/company?section=access` へ 301・ルールどおり）
- [ ] 101FIT の所在地（樽川）も会社概要のアクセス欄に掲載。地図は会社所在地（花川北）のみ。ジムの地図も必要なら追加

### 画像（すべて仮。差し替えは `public/` の同名ファイルを置き換えるだけ）

- [ ] **ロゴ `public/logo.png` は仮生成**（名刺の円形 R マークを参考に描いた仮版・背景透過）。ヘッダー・フッター・USP セクション・favicon で共通。正式ロゴを 512px 程度の正方形 PNG（余白付き・背景透過）で差し替え
- [ ] **OG 画像 `public/og-image.png`**（1200×630・名刺テーマで生成）。ロゴ確定後に作り直す場合は `npm run build:brand` を修正して再生成（※ 再実行すると SVG・logo.png も上書きされる）
- [ ] 生成 SVG（R13・15 枚・`scripts/build-brand.mjs` で生成・名刺テーマ）:
  - ヒーロー `images/hero/slide-1〜3.svg`（パール地と月 / 白い板張りと色ブロック / 黒い縦帯と透かし文字）
  - カバー `images/{services,company,news,column}/cover.svg`、`images/nav/contact.svg`（パール地・月・端の色ブロック・透かし）
  - 図版 `images/services/{three-stars,recruit,orbit,fit}.svg`、`images/about/{office,philosophy}.svg`、`images/access/map-deco.svg`
  - SVG を `<img>` で表示するとサイトの Web フォントは効かないため、図版内の欧文は Arial 系で表示される（形は崩れない）
  - 名刺の写真素材（板張りの壁・色ブロックの実物）があれば、`slide-2.svg` を実写に差し替えると名刺との一体感が増す
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
- [x] **代表の写真**（`images.about`）: 提供いただいた証明写真を `public/images/about/representative.webp` に配置（白い余白を切り落とし WebP 化）。会社概要「ABOUT US」とトップの会社紹介に、役職・氏名・ローマ字表記と合わせて表示（`src/components/RepCard.jsx`）
- [ ] **代表写真の解像度が低い**（元画像 220×220px・写真部分は 152×176px）。ぼやけないよう表示は最大 152px に抑えている。**高解像度の元データ**（幅 600px 以上）をもらえれば同名で差し替え、`RepCard.jsx` の `width` / `height` を実寸に、CSS の `max-width: 152px` を外す
- [ ] 代表メッセージは原稿が無いため載せていない（創作しない・R2）。原稿があれば代表カードの下に追加できる
- [ ] YAML の `images.about` は「101FIT の店内、または屋外」での撮影イメージ。今回の写真は青背景の証明写真なので、雰囲気の合う写真が撮れたら差し替えを検討
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
- [ ] R14-4: `/news` 10 件ずつ・ページャ / カード→ `/news/<id>` / 詳細 URL 直開き / 記事固有 title・description・canonical / 一覧へ戻る / 一覧の先頭に最新記事が大きく出る / 本文の ■見出し・箇条書き・番号付き・FAQ が整形される / トップの抜粋が 3 件ずつ / 「詳細情報」グリッドに未表示フィールドが漏れなく出て、二重表示が無い
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
- 色（名刺テーマ）: パール `#F1F1EE`（背景）/ 黒 `#141414`（見出し・主ボタン・フッター）/ シルバー `#B9B9B5`（罫線・月・図版のみ）/ 補足文字 `#575754`。色ブロック: 朱赤 `#E4471E`・黄 `#F2C21B`・黄緑 `#C5D13A`・緑 `#5B8A3C`・紺 `#1F2C7C`・青 `#2F7BDD`・臙脂 `#7C1F2B`（面・帯・印にだけ使い、文字色にはしない。赤系の文字が必要なときは `#C23412`）
- 書体（名刺テーマ）: ロゴ欧文 Barlow 800、欧文ラベル Barlow Condensed（DIN 系）、欧文セリフ Cormorant Garamond、和文見出し しっぽり明朝 B1、本文 Noto Sans JP。Inter / Roboto は不使用
