// 取得エラー表示（R9 #5 / R9-retry: 再読み込みボタン付き。空状態とは必ず出し分ける）
export default function ErrorMsg({ message = '現在情報を取得できません。お手数ですが時間をおいて再度ご確認ください。', onRetry }) {
  return (
    <div className="state-msg state-msg--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost state-msg__retry" onClick={onRetry}>
          再読み込み
        </button>
      )}
    </div>
  )
}
