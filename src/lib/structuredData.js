// 構造化データ（JSON-LD）の単一ソース。
// ブラウザ（DocumentMeta のクライアント遷移時）と scripts/prerender.mjs（静的 HTML への焼き込み）の両方が使う。
// Node からそのまま import できるよう、import.meta.env や JSON の import は持たない（値は引数で受け取る）。
//
// WebSite / LocalBusiness（会社）/ 各ページ / パンくず を @id で結んだ 1 つの @graph にまとめる。
// 住所・電話は顧客YAMLにあるため LocalBusiness を全ページに出す（R4・R11-B #4）。
// 郵便番号・FAX は代表の名刺より。設立年は未確定のため出さない（R2）。

/** ページ種別（schema.org の WebPage のサブタイプ） */
const PAGE_TYPES = {
  '/company': 'AboutPage',
  '/contact': 'ContactPage',
  '/news': 'CollectionPage',
  '/column': 'CollectionPage',
  '/works': 'CollectionPage',
}

/** 会社（LocalBusiness のサブタイプ ProfessionalService） */
export function buildOrganization({ siteUrl, site }) {
  const id = siteUrl ? `${siteUrl}/#organization` : undefined
  return {
    '@type': 'ProfessionalService',
    '@id': id,
    name: site.name,
    alternateName: [site.nameShort, site.nameRoman],
    url: siteUrl ? `${siteUrl}/` : undefined,
    logo: siteUrl ? `${siteUrl}/logo.png` : undefined,
    image: siteUrl ? `${siteUrl}/logo.png` : undefined,
    telephone: site.phone,
    ...(site.fax ? { faxNumber: site.fax } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(site.address.postal ? { postalCode: site.address.postal } : {}),
      addressRegion: site.address.pref,
      addressLocality: site.address.city,
      streetAddress: site.address.street,
      addressCountry: 'JP',
    },
    areaServed: site.serviceArea,
    identifier: { '@type': 'PropertyValue', propertyID: '法人番号', value: site.corporateNumber },
    description: site.subcopy,
    knowsAbout: ['求人原稿の作成・改善', '採用活動の支援', 'ホームページ制作', 'ホームページ運用', 'Googleしごと検索', 'パーソナルトレーニング'],
    makesOffer: site.businesses.map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
    subOrganization: {
      '@type': 'ExerciseGym',
      name: site.gym.name,
      url: site.gym.url,
      address: { '@type': 'PostalAddress', streetAddress: site.gym.address, addressCountry: 'JP' },
      sameAs: Object.values(site.gym.sns).filter(Boolean),
    },
  }
}

/**
 * @param {object} p
 * @param {string|null} p.path  ルートのパス（'/' や '/company'）。記事詳細なら null（サイトと会社だけ出す）
 * @param {string} [p.title]
 * @param {string} [p.description]
 * @param {string} [p.label]    パンくずのページ名
 * @param {Array<{label: string, path: string}>} [p.crumbs] ホームと現在ページの間の階層
 * @param {string} p.siteUrl    本番オリジン（末尾スラッシュなし）。空なら URL・@id を省く
 * @param {object} p.site       site-data.json の中身
 */
export function buildPageJsonLd({ path, title, description, label, crumbs = [], siteUrl, site }) {
  const url = (p) => (siteUrl ? `${siteUrl}${p === '/' ? '/' : p}` : undefined)
  const id = (p, frag) => (siteUrl ? `${url(p)}#${frag}` : undefined)
  const ref = (p, frag) => (siteUrl ? { '@id': id(p, frag) } : undefined)

  const website = {
    '@type': 'WebSite',
    '@id': id('/', 'website'),
    url: url('/'),
    name: site.label,
    inLanguage: 'ja',
    publisher: siteUrl ? { '@id': `${siteUrl}/#organization` } : undefined,
  }

  const graph = [website, buildOrganization({ siteUrl, site })]

  if (path) {
    const isHome = path === '/'
    graph.push({
      '@type': PAGE_TYPES[path] ?? 'WebPage',
      '@id': id(path, 'webpage'),
      url: url(path),
      name: title,
      description,
      inLanguage: 'ja',
      isPartOf: ref('/', 'website'),
      about: siteUrl ? { '@id': `${siteUrl}/#organization` } : undefined,
      ...(isHome ? {} : { breadcrumb: ref(path, 'breadcrumb') }),
    })

    if (!isHome) {
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': id(path, 'breadcrumb'),
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ホーム', item: url('/') },
          ...crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 2, name: c.label, item: url(c.path) })),
          { '@type': 'ListItem', position: crumbs.length + 2, name: label },
        ],
      })
    }
  }

  // undefined のキーは JSON.stringify で落ちる
  return { '@context': 'https://schema.org', '@graph': graph }
}

/** 記事詳細（NewsArticle / BlogPosting）。publisher は会社 */
export function buildArticleJsonLd({ item, type, title, image, canonical, site }) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: title,
    // 公開 API に publishedAt は無い（createdAt / updatedAt のみ）
    ...(item?.createdAt ? { datePublished: item.createdAt } : {}),
    ...(item?.updatedAt ? { dateModified: item.updatedAt } : {}),
    ...(image ? { image: [image] } : {}),
    author: item?.data?.author_name
      ? { '@type': 'Person', name: item.data.author_name }
      : { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name },
    ...(canonical ? { mainEntityOfPage: canonical } : {}),
  }
}
