import { useMemo, useState } from 'react'
import { submitInquiry, FORM_KEYS } from '../lib/upnote.js'

// UpNote 問い合わせ API（R6-upnote）。コンテンツ取得と同じ公開 API キーで送信し、
// UpNote の受信箱に保存 + 通知メール（+連携時 LINE 通知）が届く。
//
// UpNote の問い合わせ API が受け取れるのは { name, email, subject, message } の 4 項目のため、
// 同窓生情報（フリガナ・旧姓・電話・住所・期別）は message の末尾に整形して連結する。
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const HONEYPOT_NAME = 'contact_extra_field'

// この name の追加項目は「お名前（漢字）」の直下に表示する
const KANA_NAME = 'name_kana'

/** 項目の初期値（複数選択は配列、同意チェックは false） */
function emptyValue(f) {
  if (f.type === 'checkboxes') return []
  if (f.type === 'agree') return false
  return ''
}

/** 項目の値を受信箱に載せる文字列にする（未入力は空文字） */
function fieldText(f, value) {
  if (f.type === 'checkboxes') return Array.isArray(value) ? value.join('、') : ''
  if (f.type === 'agree') return value === true ? '同意する' : ''
  return String(value ?? '').trim()
}

/**
 * @param {string}   [formKey]        FORM_KEYS.contact など（既定 contact）
 * @param {Array}    [extraFields]    追加項目。{ name, label, type, required, autoComplete, rows, groups, options, hint }
 *                                    type は text / tel / email / textarea / select / radio / checkboxes / agree
 *                                    checkboxes: options から複数選択（値は配列・送信時は「、」区切り）
 *                                    agree: 同意チェック 1 つ（label が文言・チェックで「同意する」）
 *                                    pattern / patternMessage: 入力形式のチェック（任意）
 *                                    summaryLabel: 受信箱に載せるときのラベル（既定は label）
 * @param {Array}    [formTypes]      フォームの種類。指定すると冒頭に種類セレクトを出す。
 *                                    { value, label, fixedSubject?, extraFields?, note?,
 *                                      messageRequired?, messageHint? }
 *                                    fixedSubject があるとき件名はその文言に固定され非活性になる
 *                                    messageRequired: false で本文欄を任意にする（既定は必須）
 * @param {string}   [formTypeLabel]  種類セレクトのラベル
 * @param {string}   [subjectLabel]   件名欄のラベル（null で非表示）
 * @param {string}   [messageLabel]   本文欄のラベル
 * @param {string}   [messageHint]    本文欄の下に出す補足文
 * @param {string}   [submitLabel]    送信ボタンのラベル
 * @param {string}   [successMessage] 送信完了メッセージ
 * @param {string}   [defaultSubject] 件名の初期値
 */
export default function ContactForm({
  formKey = FORM_KEYS.contact,
  extraFields = [],
  formTypes = [],
  formTypeLabel = 'お問い合わせの種類',
  subjectLabel = '件名（任意）',
  messageLabel = 'お問い合わせ内容',
  messageHint = '',
  submitLabel = '送信する',
  successMessage = 'お送りいただきありがとうございます。内容を確認のうえ、事務局より折り返しご連絡いたします。',
  defaultSubject = '',
}) {
  // 種類ごとの追加項目も含めて初期値を用意する（種類を切り替えても値が undefined にならないように）
  const initial = useMemo(() => {
    const base = { name: '', email: '', subject: defaultSubject, message: '', [HONEYPOT_NAME]: '' }
    for (const f of extraFields) base[f.name] = emptyValue(f)
    for (const t of formTypes) for (const f of t.extraFields ?? []) base[f.name] = emptyValue(f)
    return base
  }, [extraFields, formTypes, defaultSubject])

  const [typeValue, setTypeValue] = useState(() => formTypes[0]?.value ?? '')
  const activeType = formTypes.find((t) => t.value === typeValue) ?? null

  // 選択中の種類の項目を先に、共通項目をその後に並べる。
  // フリガナだけは「お名前（漢字）」の直下に出すので別扱いにする
  const kanaField = useMemo(
    () => [...(activeType?.extraFields ?? []), ...extraFields].find((f) => f.name === KANA_NAME) ?? null,
    [activeType, extraFields],
  )
  const activeFields = useMemo(
    () => [...(activeType?.extraFields ?? []), ...extraFields].filter((f) => f.name !== KANA_NAME),
    [activeType, extraFields],
  )
  // 検証・受信箱の並びもフリガナを先頭にする
  const allFields = useMemo(() => (kanaField ? [kanaField, ...activeFields] : activeFields), [kanaField, activeFields])

  // 本文欄の必須／補足文は種類ごとに上書きできる（出欠フォームは任意）
  const messageIsRequired = activeType?.messageRequired ?? true
  const activeMessageHint = activeType?.messageHint ?? messageHint

  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [serverMsg, setServerMsg] = useState('')

  const update = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  /** 複数選択チェックボックスの切り替え（選択肢の並び順を保つ） */
  const toggleOption = (f, optValue) => {
    setValues((v) => {
      const current = Array.isArray(v[f.name]) ? v[f.name] : []
      const next = current.includes(optValue) ? current.filter((x) => x !== optValue) : [...current, optValue]
      const ordered = (f.options ?? []).map((o) => o.value).filter((x) => next.includes(x))
      return { ...v, [f.name]: ordered }
    })
  }

  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'お名前をご入力ください。'
    if (!values.email.trim()) next.email = 'メールアドレスをご入力ください。'
    else if (!EMAIL_RE.test(values.email.trim())) next.email = 'メールアドレスの形式をご確認ください。'
    if (messageIsRequired && !values.message.trim()) next.message = '内容をご入力ください。'
    for (const f of allFields) {
      const text = fieldText(f, values[f.name])
      if (f.required && !text) {
        next[f.name] =
          f.type === 'agree'
            ? (f.errorMessage ?? '内容をご確認のうえ、チェックを入れてください。')
            : f.type === 'select' || f.type === 'radio' || f.type === 'checkboxes'
              ? `${f.label}をお選びください。`
              : `${f.label}をご入力ください。`
      } else if (f.pattern && text && !f.pattern.test(text)) {
        next[f.name] = f.patternMessage ?? `${f.label}の形式をご確認ください。`
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  /** 追加項目を message の末尾に整形して連結する（UpNote 受信箱でそのまま読める形にする） */
  const composeMessage = () => {
    const lines = [
      // 種類は受信箱で真っ先に分かるよう先頭に置く
      ...(activeType ? [[formTypeLabel, activeType.label]] : []),
      ...allFields.map((f) => [f.summaryLabel ?? f.label, fieldText(f, values[f.name])]),
    ]
      .filter(([, v]) => v)
      .map(([label, v]) => `${label}: ${v}`)
    const body = values.message.trim()
    if (!lines.length) return body
    // 本文が任意のフォーム（出欠など）では空のことがある。先頭に空行を作らない
    const block = `── 入力内容 ──\n${lines.join('\n')}`
    return body ? `${body}\n\n${block}` : block
  }

  /** 送信する件名。種類に fixedSubject があればそれを使う（画面上も固定・非活性） */
  const effectiveSubject = activeType?.fixedSubject ?? values.subject

  const handleSubmit = async (e) => {
    e.preventDefault()
    // honeypot: 入力があればボットとみなし、送信せず成功扱い（R6）
    if (values[HONEYPOT_NAME]) {
      setStatus('success')
      return
    }
    if (!validate()) return

    setStatus('submitting')
    setServerMsg('')
    try {
      await submitInquiry({
        name: values.name.trim(),
        email: values.email.trim(),
        ...(effectiveSubject.trim() ? { subject: effectiveSubject.trim() } : {}),
        message: composeMessage(),
        formKey,
      })
      setStatus('success')
      setValues(initial)
    } catch (err) {
      // 送信失敗時は入力値を消さない（R6）
      setStatus('error')
      if (err.errorCode === 'VALIDATION_ERROR') {
        setServerMsg('入力内容に不備があります。お手数ですが各項目をご確認ください。')
      } else {
        setServerMsg('送信に失敗しました。お手数ですが時間をおいて再度お試しください。')
      }
    }
  }

  if (status === 'success') {
    return (
      <div className="form">
        <div className="form-alert form-alert--ok" role="status">
          {successMessage}
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setStatus('idle')
            setValues(initial)
          }}
        >
          続けて送信する
        </button>
      </div>
    )
  }

  const renderExtra = (f) => {
    const id = `cf-${f.name}`

    // 同意チェック（個人情報の取り扱い・寄附の確認事項など）
    if (f.type === 'agree') {
      return (
        <div className="field field--agree" key={f.name}>
          <label className="agree-option">
            <input
              type="checkbox"
              name={f.name}
              checked={values[f.name] === true}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.checked }))}
              aria-invalid={!!errors[f.name]}
            />
            <span>
              {f.label}
              {f.required && <span className="req">必須</span>}
            </span>
          </label>
          {f.hint && <p className="field__hint">{f.hint}</p>}
          {errors[f.name] && <p className="error">{errors[f.name]}</p>}
        </div>
      )
    }

    // 複数選択（ボランティアでお手伝いいただける内容など）
    if (f.type === 'checkboxes') {
      const selected = Array.isArray(values[f.name]) ? values[f.name] : []
      return (
        <fieldset className="field field--radio field--checks" key={f.name}>
          <legend>
            {f.label}
            {f.required ? <span className="req">必須</span> : <span className="opt">任意</span>}
          </legend>
          <div className="check-group">
            {(f.options ?? []).map((o) => (
              <label className={`check-option${selected.includes(o.value) ? ' is-checked' : ''}`} key={o.value}>
                <input
                  type="checkbox"
                  name={f.name}
                  value={o.value}
                  checked={selected.includes(o.value)}
                  onChange={() => toggleOption(f, o.value)}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
          {f.hint && <p className="field__hint">{f.hint}</p>}
          {errors[f.name] && <p className="error">{errors[f.name]}</p>}
        </fieldset>
      )
    }

    // ラジオはグループなので fieldset / legend で組む（label htmlFor は使わない）
    if (f.type === 'radio') {
      return (
        <fieldset className="field field--radio" key={f.name}>
          <legend>
            {f.label}
            {f.required && <span className="req">必須</span>}
          </legend>
          <div className="radio-group">
            {(f.options ?? []).map((o) => (
              <label className="radio-option" key={o.value}>
                <input
                  type="radio"
                  name={f.name}
                  value={o.value}
                  checked={values[f.name] === o.value}
                  onChange={update}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
          {f.hint && <p className="field__hint">{f.hint}</p>}
          {errors[f.name] && <p className="error">{errors[f.name]}</p>}
        </fieldset>
      )
    }

    const common = {
      id,
      name: f.name,
      value: values[f.name] ?? '',
      onChange: update,
      'aria-invalid': !!errors[f.name],
      ...(f.autoComplete ? { autoComplete: f.autoComplete } : {}),
    }
    return (
      <div className="field" key={f.name}>
        <label htmlFor={id}>
          {f.label}
          {f.required && <span className="req">必須</span>}
        </label>
        {f.type === 'select' ? (
          <select {...common}>
            <option value="">選択してください</option>
            {(f.groups ?? []).map((g) => (
              <optgroup label={g.label} key={g.label}>
                {g.options.map((o) => (
                  <option value={o.value} key={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
            {(f.options ?? []).map((o) => (
              <option value={o.value} key={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : f.type === 'textarea' ? (
          <textarea rows={f.rows ?? 3} {...common} />
        ) : (
          <input type={f.type ?? 'text'} {...common} />
        )}
        {f.hint && <p className="field__hint">{f.hint}</p>}
        {errors[f.name] && <p className="error">{errors[f.name]}</p>}
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {status === 'error' && (
        <div className="form-alert form-alert--err" role="alert">
          {serverMsg}
        </div>
      )}

      {/* 種類の切り替え。選択肢が複数あることが一目で分かるよう、ボタン状の
          セグメントで見せる。中身はラジオなのでキーボード操作・読み上げも標準どおり */}
      {formTypes.length > 1 && (
        <fieldset className="form-type-switch">
          <legend>{formTypeLabel}</legend>
          <div className="form-type-switch__options">
            {formTypes.map((t) => (
              <label
                key={t.value}
                className={`form-type-switch__option${t.value === typeValue ? ' is-active' : ''}`}
              >
                <input
                  type="radio"
                  name="formType"
                  value={t.value}
                  checked={t.value === typeValue}
                  onChange={() => {
                    setTypeValue(t.value)
                    setErrors({})
                  }}
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
          {activeType?.note && <p className="form-type-switch__note">{activeType.note}</p>}
        </fieldset>
      )}

      <div className="field">
        <label htmlFor="cf-name">
          お名前（漢字）<span className="req">必須</span>
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={update}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="error">{errors.name}</p>}
      </div>

      {kanaField && renderExtra(kanaField)}

      <div className="field">
        <label htmlFor="cf-email">
          メールアドレス<span className="req">必須</span>
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="error">{errors.email}</p>}
      </div>

      {activeFields.map(renderExtra)}

      {subjectLabel &&
        (activeType?.fixedSubject ? (
          // 種類で件名が決まるフォーム（同窓会出欠など）は固定文言・非活性にする
          <div className="field">
            <label htmlFor="cf-subject">件名</label>
            <input
              id="cf-subject"
              name="subject"
              type="text"
              value={activeType.fixedSubject}
              readOnly
              disabled
            />
            <p className="field__hint">この種類では件名は固定です。</p>
          </div>
        ) : (
          <div className="field">
            <label htmlFor="cf-subject">{subjectLabel}</label>
            <input id="cf-subject" name="subject" type="text" value={values.subject} onChange={update} />
          </div>
        ))}

      <div className="field">
        <label htmlFor="cf-message">
          {messageLabel}
          {messageIsRequired ? <span className="req">必須</span> : <span className="opt">任意</span>}
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={7}
          value={values.message}
          onChange={update}
          aria-invalid={!!errors.message}
        />
        {activeMessageHint && <p className="field__hint">{activeMessageHint}</p>}
        {errors.message && <p className="error">{errors.message}</p>}
      </div>

      {/*
        honeypot（R6・2026-08 P015 事故対策）:
        実在項目名（company / phone 等）やそのラベルを使うとオートフィルが誤入力するため、
        無意味な name + 「空のままにしてください」ラベル + tabIndex=-1 + 画面外配置にする。
      */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="cf-hp">この欄は空のままにしてください</label>
        <input
          id="cf-hp"
          name={HONEYPOT_NAME}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values[HONEYPOT_NAME]}
          onChange={update}
        />
      </div>

      <button type="submit" className="btn btn--primary form__submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? '送信中…' : submitLabel}
      </button>
    </form>
  )
}
