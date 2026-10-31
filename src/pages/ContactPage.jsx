import DocumentMeta from '../components/DocumentMeta.jsx'
import PageHero from '../components/PageHero.jsx'
import SectionHead from '../components/SectionHead.jsx'
import ContactForm from '../components/ContactForm.jsx'
import { FORM_KEYS } from '../lib/upnote.js'
import { PHONE_DISPLAY, PHONE_TEL } from '../constants/site.js'
import { publicUrl } from '../lib/publicUrl.js'

// 問い合わせ API が受け取れるのは { name, email, subject, message } のため、
// 追加項目は ContactForm が message 末尾に整形して連結する（R6-upnote）
const EXTRA_FIELDS = [
  {
    name: 'topic',
    label: 'ご相談の内容',
    type: 'select',
    required: true,
    options: [
      { value: '求人情報コンサル', label: '求人情報コンサル（求人原稿・採用活動）' },
      { value: 'REGOLITH ORBIT', label: 'ホームページ制作・運用（REGOLITH ORBIT）' },
      { value: '101FIT', label: 'ジム「101FIT」について' },
      { value: 'その他', label: 'その他' },
    ],
  },
  { name: 'org_name', label: '会社名・店舗名', type: 'text', autoComplete: 'organization' },
  { name: 'tel', label: '電話番号', type: 'tel', autoComplete: 'tel', hint: 'お電話での連絡を希望される場合にご入力ください。' },
]

export default function ContactPage() {
  return (
    <>
      <DocumentMeta />
      <PageHero title="お問い合わせ" image="/images/nav/contact.svg" alt="軌道線の先で光るオレンジの星を描いたお問い合わせのカバーイメージ" />

      <section className="section">
        <div className="container contact">
          <div className="contact__intro reveal">
            <SectionHead
              eyebrow="CONTACT"
              title="お問い合わせ"
              lead="求人のこと、ホームページのこと、ジムのこと。まだ考えがまとまっていない段階でもかまいません。フォームまたはお電話でお気軽にご相談ください。"
            />
            <div className="contact__tel">
              <p className="contact__tel-label">お電話でのお問い合わせ</p>
              <a href={`tel:${PHONE_TEL}`} className="contact__tel-num">
                {PHONE_DISPLAY}
              </a>
            </div>
            <img
              className="contact__img"
              src={publicUrl('/images/illustrations/partner.png')}
              alt="握手をするビジネスパーソンのイラスト"
              width={719}
              height={631}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="contact__form reveal">
            <ContactForm
              formKey={FORM_KEYS.contact}
              extraFields={EXTRA_FIELDS}
              messageLabel="お問い合わせ内容"
              messageHint="現在お困りのこと、ご希望の時期などをお書きください。"
              successMessage="お問い合わせありがとうございます。内容を確認のうえ、担当者よりご連絡いたします。"
            />
          </div>
        </div>
      </section>
    </>
  )
}
