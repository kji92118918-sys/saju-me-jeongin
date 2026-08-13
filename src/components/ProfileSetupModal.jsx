import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { loadPendingReading } from '../pendingReading.js'
import ProfileFields, { emptyProfileForm, profileToForm } from './ProfileFields.jsx'

function ProfileSetupModal() {
  const { user, profile, profileComplete, profileLoading, loading, saveProfile } = useAuth()
  const [values, setValues] = useState(() => emptyProfileForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const open = Boolean(user) && !loading && !profileLoading && !profileComplete

  useEffect(() => {
    if (!open) return

    const pending = loadPendingReading()
    setValues(
      profileToForm({
        name:
          pending?.name ||
          profile?.name ||
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          '',
        birthDate: pending?.birthDate ?? pending?.birth_date ?? profile?.birthDate ?? '',
        birthTime: pending?.birthTime ?? pending?.birth_time ?? profile?.birthTime ?? '',
        gender: pending?.gender || profile?.gender || '',
        calendarType:
          pending?.calendarType ??
          pending?.calendar_type ??
          profile?.calendarType ??
          'solar',
      }),
    )
    setError('')
  }, [open, profile, user])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await saveProfile(values)
    } catch (err) {
      setError(err.message || '프로필 저장에 실패했어요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-setup-title"
      >
        <p className="modal__eyebrow">처음 오신 분에게</p>
        <h2 id="profile-setup-title" className="modal__title">
          사주에 필요한 정보를 남겨 주세요
        </h2>
        <p className="modal__lede">
          한 번만 입력하면, 이어서 전체 이야기를 열어 드릴게요.
        </p>

        <form className="saju-form modal__form" onSubmit={handleSubmit}>
          <ProfileFields values={values} onChange={setValues} idPrefix="setup" />

          <button className="cta" type="submit" disabled={saving}>
            {saving ? '저장 중…' : '저장하고 전체 보기'}
          </button>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default ProfileSetupModal
