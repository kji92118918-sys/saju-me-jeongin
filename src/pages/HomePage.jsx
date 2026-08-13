import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import ProfileFields, { emptyProfileForm, profileToForm } from '../components/ProfileFields.jsx'
import ReadingStream from '../components/ReadingStream.jsx'
import { analyzeSaju } from '../gemini.js'
import { savePendingReading } from '../pendingReading.js'
import { supabase } from '../supabase.js'

const genderLabel = { male: '남자', female: '여자' }
const calendarLabel = { solar: '양력', lunar: '음력' }

function HomePage() {
  const navigate = useNavigate()
  const {
    user,
    profile,
    profileComplete,
    loading: authLoading,
    profileLoading,
  } = useAuth()

  const [values, setValues] = useState(() => emptyProfileForm())
  const [loading, setLoading] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [error, setError] = useState('')
  const [readingsCount, setReadingsCount] = useState(null)

  useEffect(() => {
    if (profileComplete) {
      setValues(profileToForm(profile))
    }
  }, [profile, profileComplete])

  useEffect(() => {
    let cancelled = false

    async function loadCount() {
      const { data, error: countError } = await supabase.rpc('get_readings_count')
      if (cancelled || countError) return
      const n = typeof data === 'number' ? data : Number(data)
      if (Number.isFinite(n)) setReadingsCount(n)
    }

    loadCount()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStreamText('')
    setError('')

    try {
      if (user && !profileComplete) {
        throw new Error('먼저 프로필 정보를 입력해 주세요.')
      }

      const { name, birthDate, birthTime, gender, calendarType } = values

      if (!name.trim() || !birthDate || !gender) {
        throw new Error('이름, 생년월일, 성별은 꼭 입력해 주세요.')
      }

      const text = await analyzeSaju(
        {
          name,
          birthDate,
          birthTime,
          gender,
          calendarType,
        },
        {
          onChunk(next) {
            setStreamText(next)
          },
        },
      )

      if (user && profileComplete) {
        const { data: saved, error: saveError } = await supabase
          .from('saju_readings')
          .insert({
            user_id: user.id,
            name,
            birth_date: birthDate,
            birth_time: birthTime || null,
            gender,
            calendar_type: calendarType,
            result: text,
          })
          .select('id')
          .single()

        if (saveError) {
          throw new Error(saveError.message || '결과 저장에 실패했어요.')
        }

        navigate(`/result/${saved.id}`, {
          state: {
            result: text,
            name,
            birthDate,
            birthTime,
            gender,
            calendarType,
            user_id: user.id,
          },
        })
        return
      }

      const pending = {
        result: text,
        name,
        birthDate,
        birthTime,
        gender,
        calendarType,
      }
      savePendingReading(pending)
      navigate('/result', { state: { ...pending, locked: true } })
    } catch (err) {
      setError(err.message || '해석 요청에 실패했어요. 잠시 후 다시 시도해 주세요.')
      setLoading(false)
    }
  }

  const profileMeta =
    profileComplete && profile
      ? [
          profile.birthDate,
          profile.birthTime || null,
          genderLabel[profile.gender] ?? profile.gender,
          calendarLabel[profile.calendarType] ?? profile.calendarType,
        ]
          .filter(Boolean)
          .join(' · ')
      : ''

  const waitingProfile = Boolean(user && (authLoading || profileLoading || !profileComplete))
  const showForm = !user || profileComplete
  const canSubmit = showForm && !waitingProfile

  if (loading) {
    return (
      <ReadingStream
        name={values.name}
        birthDate={values.birthDate}
        birthTime={values.birthTime}
        gender={values.gender}
        calendarType={values.calendarType}
        text={streamText}
        error={error}
      />
    )
  }

  return (
    <div className="page page--home">
      <div className="mist mist--a" aria-hidden="true" />
      <div className="mist mist--b" aria-hidden="true" />

      <header className="hero">
        <p className="brand">사주미</p>
        <h1 className="headline">당신의 흐름을 들여다봅니다</h1>
        <p className="lede">
          {profileComplete
            ? '저장된 생시로 바로 읽어 드릴게요.'
            : '이름과 생시를 남겨 주세요. 조용히 읽어 드릴게요.'}
        </p>
        {readingsCount != null && (
          <p className="trust-count">
            지금까지 총 <span>{readingsCount.toLocaleString('ko-KR')}</span>개의 사주가
            생성되었습니다
          </p>
        )}
      </header>

      {user && profileLoading && (
        <div className="auth-gate">
          <p className="auth-gate__text">프로필을 불러오는 중…</p>
        </div>
      )}

      {user && !profileLoading && !profileComplete && (
        <div className="auth-gate">
          <p className="auth-gate__text">사주 해석을 위해 프로필 정보가 필요해요.</p>
        </div>
      )}

      {user && profileComplete && (
        <div className="profile-summary">
          <p className="profile-summary__name">{profile.name}</p>
          {profileMeta ? <p className="profile-summary__meta">{profileMeta}</p> : null}
          <Link className="profile-summary__link" to="/profile">
            프로필 수정
          </Link>
        </div>
      )}

      {showForm && (
        <form className="saju-form" onSubmit={handleSubmit}>
          <ProfileFields values={values} onChange={setValues} idPrefix="home" />

          <button className="cta" type="submit" disabled={!canSubmit}>
            사주 해석하기
          </button>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  )
}

export default HomePage
