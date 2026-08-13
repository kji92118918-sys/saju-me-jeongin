import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Analytics } from '../analytics.js'
import { useAuth } from '../auth/AuthContext.jsx'
import ProfileFields, { emptyProfileForm, profileToForm } from '../components/ProfileFields.jsx'

const genderLabel = { male: '남자', female: '여자' }
const calendarLabel = { solar: '양력', lunar: '음력' }

function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, profileComplete, profileLoading, loading, saveProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState(() => emptyProfileForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setValues(profileToForm(profile))
    setError('')
  }, [profile])

  function startEdit() {
    setValues(profileToForm(profile))
    setError('')
    setEditing(true)
    Analytics.profileEditStart()
  }

  function cancelEdit() {
    setValues(profileToForm(profile))
    setError('')
    setEditing(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await saveProfile(values)
      Analytics.profileSave()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || '프로필 저장에 실패했어요.')
      setSaving(false)
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="page page--profile">
        <div className="mist mist--a" aria-hidden="true" />
        <p className="lede">프로필을 여는 중…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page page--profile">
        <div className="mist mist--a" aria-hidden="true" />
        <header className="hero">
          <p className="brand">사주미</p>
          <h1 className="headline">프로필</h1>
          <p className="lede">로그인 후 생시 정보를 관리할 수 있어요.</p>
        </header>
        <Link className="cta cta--ghost" to="/">
          홈으로
        </Link>
      </div>
    )
  }

  const rows = [
    { label: '이름', value: profile?.name },
    { label: '생년월일', value: profile?.birthDate },
    {
      label: '태어난 시간',
      value: profile?.birthTime || '모름',
    },
    {
      label: '성별',
      value: genderLabel[profile?.gender] ?? profile?.gender,
    },
    {
      label: '달력',
      value: calendarLabel[profile?.calendarType] ?? profile?.calendarType,
    },
  ]

  return (
    <div className="page page--profile">
      <div className="mist mist--a" aria-hidden="true" />
      <div className="mist mist--b" aria-hidden="true" />

      <header className="hero hero--profile">
        <p className="brand">사주미</p>
        <h1 className="headline">나의 프로필</h1>
        <p className="lede">
          {editing
            ? '이름과 생시를 다듬어 다시 남겨 주세요.'
            : '남겨 둔 생시를 천천히 들여다봅니다.'}
        </p>
      </header>

      {editing ? (
        <form className="profile-card profile-card--edit" onSubmit={handleSubmit}>
          <div className="profile-card__ornament" aria-hidden="true">
            ✦
          </div>
          <p className="profile-card__eyebrow">수정</p>
          <div className="saju-form profile-card__form">
            <ProfileFields values={values} onChange={setValues} idPrefix="profile" />
          </div>

          <div className="result-actions">
            <button className="cta" type="submit" disabled={saving}>
              {saving ? '저장 중…' : '프로필 저장'}
            </button>
            <button
              className="cta cta--ghost"
              type="button"
              onClick={cancelEdit}
              disabled={saving}
            >
              취소
            </button>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      ) : (
        <section className="profile-card" aria-label="저장된 프로필">
          <div className="profile-card__ornament" aria-hidden="true">
            ✦
          </div>
          <p className="profile-card__eyebrow">생시</p>
          <h2 className="profile-card__name">
            {profileComplete ? profile.name : '아직 비어 있어요'}
          </h2>

          {profileComplete ? (
            <dl className="profile-card__list">
              {rows.map((row) => (
                <div key={row.label} className="profile-card__row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="profile-card__empty">프로필 정보를 먼저 남겨 주세요.</p>
          )}

          <div className="result-actions">
            <button className="cta" type="button" onClick={startEdit}>
              수정하기
            </button>
            <Link className="cta cta--ghost" to="/">
              홈으로
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default ProfilePage
