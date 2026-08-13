import { useEffect, useRef } from 'react'

const genderLabel = { male: '남자', female: '여자' }
const calendarLabel = { solar: '양력', lunar: '음력' }

function formatMeta({ birthDate, birthTime, gender, calendarType }) {
  const parts = [birthDate]
  if (birthTime) parts.push(birthTime)
  if (gender) parts.push(genderLabel[gender] ?? gender)
  if (calendarType) parts.push(calendarLabel[calendarType] ?? calendarType)
  return parts.filter(Boolean).join(' · ')
}

function ReadingStream({ name, birthDate, birthTime, gender, calendarType, text, error }) {
  const meta = formatMeta({ birthDate, birthTime, gender, calendarType })
  const hasText = Boolean(text?.trim())
  const caretRef = useRef(null)

  useEffect(() => {
    if (!hasText) return
    caretRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [text, hasText])

  return (
    <div className="page page--result page--streaming">
      <div className="mist mist--a" aria-hidden="true" />
      <div className="mist mist--b" aria-hidden="true" />

      <header className="hero hero--result">
        <p className="brand">사주미</p>
        <h1 className="headline">{name ? `${name}님의 이야기` : '당신의 이야기'}</h1>
        {meta ? <p className="reading-meta">{meta}</p> : null}
        <p className="lede">
          {hasText ? '흐름을 읽어 내려가는 중이에요.' : '생시를 펼치는 중이에요.'}
        </p>
      </header>

      <article
        className={`reading reading--stream ${hasText ? 'reading--stream-live' : ''}`}
        aria-live="polite"
        aria-busy={!hasText}
      >
        <div className="reading__ornament" aria-hidden="true">
          ✦
        </div>

        {hasText ? (
          <p className="reading__body reading__body--stream">
            {text}
            <span className="stream-caret" ref={caretRef} aria-hidden="true" />
          </p>
        ) : (
          <div className="stream-skeleton" aria-hidden="true">
            <span className="stream-skeleton__line stream-skeleton__line--lg" />
            <span className="stream-skeleton__line" />
            <span className="stream-skeleton__line stream-skeleton__line--md" />
            <span className="stream-skeleton__line" />
            <span className="stream-skeleton__line stream-skeleton__line--sm" />
            <span className="stream-skeleton__line stream-skeleton__line--md" />
            <span className="stream-skeleton__line" />
            <span className="stream-skeleton__line stream-skeleton__line--sm" />
          </div>
        )}
      </article>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default ReadingStream
