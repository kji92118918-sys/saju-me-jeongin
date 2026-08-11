import { Link, Navigate, useLocation } from 'react-router-dom'

function ResultPage() {
  const location = useLocation()
  const result = location.state?.result
  const name = location.state?.name

  // 직접 URL로 들어온 경우 입력 페이지로
  if (!result) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="page page--result">
      <div className="mist mist--a" aria-hidden="true" />
      <div className="mist mist--b" aria-hidden="true" />

      <header className="hero hero--result">
        <p className="brand">사주미</p>
        <h1 className="headline">
          {name ? `${name}님의 이야기` : '당신의 이야기'}
        </h1>
        <p className="lede">잠시 숨 고르고, 천천히 읽어 보세요.</p>
      </header>

      <article className="reading">
        <p className="reading__body">{result}</p>
      </article>

      <Link className="cta cta--ghost" to="/">
        다시 묻기
      </Link>
    </div>
  )
}

export default ResultPage
