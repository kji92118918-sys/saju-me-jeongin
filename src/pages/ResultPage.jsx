import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { supabase } from '../supabase.js'

const genderLabel = { male: '남자', female: '여자' }
const calendarLabel = { solar: '양력', lunar: '음력' }

function formatBirthMeta(reading) {
  if (!reading?.birth_date) return ''

  const parts = [reading.birth_date]
  if (reading.birth_time) {
    parts.push(String(reading.birth_time).slice(0, 5))
  }
  if (reading.gender) parts.push(genderLabel[reading.gender] ?? reading.gender)
  if (reading.calendar_type) {
    parts.push(calendarLabel[reading.calendar_type] ?? reading.calendar_type)
  }
  return parts.join(' · ')
}

function ResultPage() {
  const { id } = useParams()
  const location = useLocation()
  const stateReading = location.state

  const [reading, setReading] = useState(() =>
    stateReading?.result
      ? {
          name: stateReading.name,
          result: stateReading.result,
          birth_date: stateReading.birthDate ?? stateReading.birth_date,
          birth_time: stateReading.birthTime ?? stateReading.birth_time,
          gender: stateReading.gender,
          calendar_type: stateReading.calendarType ?? stateReading.calendar_type,
        }
      : null,
  )
  const [loading, setLoading] = useState(Boolean(id) && !stateReading?.result)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function loadReading() {
      setLoading(true)
      setError('')
      setNotFound(false)

      const { data, error: fetchError } = await supabase
        .from('saju_readings')
        .select('name, result, birth_date, birth_time, gender, calendar_type')
        .eq('id', id)
        .maybeSingle()

      if (cancelled) return

      if (fetchError) {
        setError('기록을 불러오지 못했어요.')
        setLoading(false)
        return
      }

      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setReading(data)
      setLoading(false)
    }

    loadReading()

    return () => {
      cancelled = true
    }
  }, [id])

  if (!id && !reading?.result) {
    return <Navigate to="/" replace />
  }

  if (notFound) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="page page--result">
        <div className="mist mist--a" aria-hidden="true" />
        <div className="mist mist--b" aria-hidden="true" />
        <p className="lede">기록을 펼치는 중…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page page--result">
        <div className="mist mist--a" aria-hidden="true" />
        <p className="form-error" role="alert">
          {error}
        </p>
        <Link className="cta cta--ghost" to="/">
          처음으로
        </Link>
      </div>
    )
  }

  const meta = formatBirthMeta(reading)

  return (
    <div className="page page--result">
      <div className="mist mist--a" aria-hidden="true" />
      <div className="mist mist--b" aria-hidden="true" />

      <header className="hero hero--result">
        <p className="brand">사주미</p>
        <h1 className="headline">
          {reading?.name ? `${reading.name}님의 이야기` : '당신의 이야기'}
        </h1>
        {meta ? <p className="reading-meta">{meta}</p> : null}
        <p className="lede">잠시 숨 고르고, 천천히 읽어 보세요.</p>
      </header>

      <article className="reading">
        <div className="reading__ornament" aria-hidden="true">
          ✦
        </div>
        <p className="reading__body">{reading?.result}</p>
      </article>

      <Link className="cta cta--ghost" to="/">
        내 사주 보기
      </Link>
    </div>
  )
}

export default ResultPage
