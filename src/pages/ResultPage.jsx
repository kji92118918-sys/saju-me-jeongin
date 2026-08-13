import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import {
  loadPendingReading,
  savePendingReading,
  splitReadingPreview,
} from '../pendingReading.js'
import { supabase } from '../supabase.js'

const genderLabel = { male: '남자', female: '여자' }
const calendarLabel = { solar: '양력', lunar: '음력' }

function formatBirthMeta(reading) {
  if (!reading?.birth_date && !reading?.birthDate) return ''

  const parts = [reading.birth_date ?? reading.birthDate]
  const time = reading.birth_time ?? reading.birthTime
  if (time) parts.push(String(time).slice(0, 5))
  if (reading.gender) parts.push(genderLabel[reading.gender] ?? reading.gender)
  const calendar = reading.calendar_type ?? reading.calendarType
  if (calendar) parts.push(calendarLabel[calendar] ?? calendar)
  return parts.join(' · ')
}

function buildShareUrl(id) {
  return `${window.location.origin}/result/${id}`
}

function normalizeStateReading(stateReading, userId) {
  if (!stateReading?.result) return null
  return {
    name: stateReading.name,
    result: stateReading.result,
    birth_date: stateReading.birthDate ?? stateReading.birth_date,
    birth_time: stateReading.birthTime ?? stateReading.birth_time,
    gender: stateReading.gender,
    calendar_type: stateReading.calendarType ?? stateReading.calendar_type,
    user_id: stateReading.user_id ?? userId ?? null,
  }
}

function ResultPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profileComplete, loading: authLoading, signInWithGoogle } = useAuth()
  const stateReading = location.state

  const [reading, setReading] = useState(() =>
    normalizeStateReading(stateReading, user?.id),
  )
  const [loading, setLoading] = useState(Boolean(id) && !stateReading?.result)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [loginBusy, setLoginBusy] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (id) return
    if (reading?.result) return

    const pending = loadPendingReading()
    if (!pending?.result) return

    setReading(normalizeStateReading(pending, null))
  }, [id, reading?.result])

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function loadReading() {
      setLoading(true)
      setError('')
      setNotFound(false)
      setShareMessage('')
      setActionError('')

      const { data, error: fetchError } = await supabase.rpc('get_shared_reading', {
        p_id: id,
      })

      if (cancelled) return

      if (fetchError) {
        setError('기록을 불러오지 못했어요.')
        setLoading(false)
        return
      }

      const row = Array.isArray(data) ? data[0] : data

      if (!row) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setReading(row)
      setLoading(false)
    }

    loadReading()

    return () => {
      cancelled = true
    }
  }, [id])

  const isOwner = Boolean(user && reading?.user_id && user.id === reading.user_id)
  // Guest preview (no saved id): lock until logged in + profile ready
  const isLocked = Boolean(!id && reading?.result && (!user || !profileComplete))

  const { preview } = useMemo(
    () => splitReadingPreview(reading?.result ?? '', 0.48),
    [reading?.result],
  )

  async function handleLogin() {
    setLoginBusy(true)
    setActionError('')

    if (reading?.result) {
      savePendingReading({
        result: reading.result,
        name: reading.name,
        birthDate: reading.birth_date ?? reading.birthDate,
        birthTime: reading.birth_time
          ? String(reading.birth_time).slice(0, 5)
          : reading.birthTime ?? '',
        gender: reading.gender,
        calendarType: reading.calendar_type ?? reading.calendarType ?? 'solar',
      })
    }

    try {
      await signInWithGoogle(window.location.href)
    } catch (err) {
      setActionError(err.message || '로그인에 실패했어요.')
      setLoginBusy(false)
    }
  }

  async function handleShare() {
    if (!id) return

    const url = buildShareUrl(id)
    const title = reading?.name ? `${reading.name}님의 사주` : '사주미 결과'
    const text = reading?.name
      ? `${reading.name}님의 사주 이야기를 읽어 보세요.`
      : '사주 이야기를 읽어 보세요.'

    setSharing(true)
    setShareMessage('')
    setActionError('')

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        setShareMessage('공유했어요.')
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        setShareMessage('링크를 복사했어요.')
      } else {
        window.prompt('이 링크를 복사해 공유해 주세요.', url)
        setShareMessage('링크를 복사해 주세요.')
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setActionError('공유에 실패했어요. 잠시 후 다시 시도해 주세요.')
      }
    } finally {
      setSharing(false)
    }
  }

  async function handleDelete() {
    if (!id || !isOwner) return
    const ok = window.confirm('이 사주 기록을 삭제할까요?')
    if (!ok) return

    setDeleting(true)
    setActionError('')

    const { error: deleteError } = await supabase
      .from('saju_readings')
      .delete()
      .eq('id', id)

    setDeleting(false)

    if (deleteError) {
      setActionError(deleteError.message || '삭제에 실패했어요.')
      return
    }

    navigate('/', { replace: true })
  }

  if (!id && !reading?.result && !authLoading) {
    return <Navigate to="/" replace />
  }

  if (notFound) {
    return <Navigate to="/" replace />
  }

  if (loading || (!reading?.result && authLoading)) {
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
        <p className="lede">
          {isLocked
            ? '앞부분은 먼저 읽어 보세요. 이어서 보려면 로그인이 필요해요.'
            : '잠시 숨 고르고, 천천히 읽어 보세요.'}
        </p>
      </header>

      <article className={`reading ${isLocked ? 'reading--locked' : ''}`}>
        <div className="reading__ornament" aria-hidden="true">
          ✦
        </div>
        <p className="reading__body">{isLocked ? preview : reading?.result}</p>

        {isLocked && (
          <div className="reading-lock">
            <div className="reading-lock__fade" aria-hidden="true" />
            <div className="reading-lock__panel">
              <p className="reading-lock__title">여기서부터는 로그인이 필요해요</p>
              <p className="reading-lock__text">
                {user
                  ? '프로필을 남기면 나머지 이야기와 기록을 모두 열어 드려요.'
                  : 'Google로 로그인하면 나머지 이야기와 기록을 모두 열어 드려요.'}
              </p>
              {!user && (
                <button
                  className="cta"
                  type="button"
                  onClick={handleLogin}
                  disabled={loginBusy}
                >
                  {loginBusy ? '이동 중…' : 'Google로 로그인하고 이어보기'}
                </button>
              )}
            </div>
          </div>
        )}
      </article>

      <div className="result-actions">
        {id && (
          <button
            className="cta"
            type="button"
            onClick={handleShare}
            disabled={sharing}
          >
            {sharing ? '공유 중…' : '공유하기'}
          </button>
        )}
        <Link className="cta cta--ghost" to="/">
          새 사주 보기
        </Link>
        {isOwner && (
          <button
            className="cta cta--danger"
            type="button"
            onClick={handleDelete}
            disabled={deleting || !id}
          >
            {deleting ? '삭제 중…' : '삭제하기'}
          </button>
        )}
      </div>

      {shareMessage && (
        <p className="form-success" role="status">
          {shareMessage}
        </p>
      )}
      {actionError && (
        <p className="form-error" role="alert">
          {actionError}
        </p>
      )}
    </div>
  )
}

export default ResultPage
