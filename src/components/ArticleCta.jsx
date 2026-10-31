import { Link } from 'react-router-dom'
import { SITE } from '../constants/site.js'
import { scrollToTop } from '../constants/nav.js'
import { publicUrl } from '../lib/publicUrl.js'
import Icon from './Icon.jsx'
import Twinkle from './Twinkle.jsx'
import { getContentTitle, getContentTags, getContentCategory } from '../lib/upnoteContent.js'

// コラム末尾の導線。記事の内容に合わせて案内先を振り分ける（cre-comsence.com の ColumnCta 方式）
const TOPICS = [
  {
    keywords: ['求人', '採用', '応募', '面接', 'しごと検索', '人手不足'],
    title: '「求人を出しても応募が来ない」を、原稿から変えませんか。',
    lead: '求人原稿の作成・改善から、採用ページ・Googleしごと検索への掲載まで。自社ジムの採用で試してきた方法で、応募が届くまでを一緒に整えます。',
    primary: { to: '/services#recruit', label: '求人情報コンサルを見る' },
    secondary: '採用について相談する',
  },
  {
    keywords: ['ジム', '101FIT', '健康', 'トレーニング', '運動'],
    title: '石狩で、からだづくりを始めるなら。',
    lead: `パーソナル＋24時間ジム「${SITE.gym.name}」を石狩市樽川で運営しています。営業時間や料金は公式サイトでご確認ください。`,
    primary: { href: SITE.gym.url, label: '101FIT 公式サイトを見る' },
    secondary: 'ジムについて問い合わせる',
  },
]
const DEFAULT_TOPIC = {
  title: 'ホームページ、公開してから止まっていませんか。',
  lead: 'REGOLITH ORBIT なら、LINEで送るだけでお知らせを更新でき、問い合わせは受信箱とLINEにすぐ届きます。更新・問い合わせ・予約・分析まで、公開後の運用をまとめて任せられます。',
  primary: { to: '/services#orbit', label: 'REGOLITH ORBIT でできることを見る' },
  secondary: 'ホームページについて相談する',
}

function pickTopic(item) {
  const text = [getContentCategory(item), ...getContentTags(item), getContentTitle(item)].join(' ')
  return TOPICS.find((t) => t.keywords.some((kw) => text.includes(kw))) ?? DEFAULT_TOPIC
}

export default function ArticleCta({ item }) {
  const topic = pickTopic(item)
  return (
    <section className="cta-band article-cta space" aria-labelledby="article-cta-title">
      <Twinkle count={20} seed={37} />
      <img className="cta-band__moon" src={publicUrl('/images/brand/moon.webp')} alt="" aria-hidden="true" width={800} height={800} loading="lazy" decoding="async" />
      <div className="container cta-band__inner">
        <p className="cta-band__tag serif-tag" lang="en">
          {SITE.slogan}
        </p>
        <h2 id="article-cta-title" className="cta-band__title">
          {topic.title}
        </h2>
        <p className="cta-band__text">{topic.lead}</p>
        <div className="cta-band__actions">
          {topic.primary.href ? (
            <a href={topic.primary.href} target="_blank" rel="noopener noreferrer" className="btn btn--light btn--lg">
              {topic.primary.label}
              <Icon name="arrow-right" size={16} />
            </a>
          ) : (
            <Link to={topic.primary.to} className="btn btn--light btn--lg">
              {topic.primary.label}
              <Icon name="arrow-right" size={16} />
            </Link>
          )}
          <Link to="/contact" className="btn btn--outline-light btn--lg" onClick={scrollToTop}>
            <Icon name="mail" size={20} />
            {topic.secondary}
          </Link>
        </div>
      </div>
    </section>
  )
}
