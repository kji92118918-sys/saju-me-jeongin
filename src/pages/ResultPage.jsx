import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase.js'

const genderLabel = { male: '남자', female: '여자' }
const calendarLabel = { solar: '양력', lunar: '음력' }

function emptyForm() {
  return {
    name: '',
    birth_date: '',
    birth_time: '',
    gender: '',
    calendar_type: 'solar',
    result: '',
  }
}

function toForm(reading) {
  if (!reading) return emptyForm()
  return {
    name: reading.name ?? '',
    birth_date: reading.birth_date ?? '',
    birth_time: reading.birth_time ? String(reading.birth_time).slice(0, 5) : '',
    gender: reading.gender ?? '',
    calendar_type: reading.calendar_type ?? 'solar',
    result: reading.result ?? '',
  }
}

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
  const navigate = useNavigate()
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

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(() =>
    toForm(
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
    ),
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function loadReading() {
      setLoading(true)
      setError('')
      setNotFound(false)
      setEditing(false)
      setActionError('')

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
      setForm(toForm(data))
      setLoading(false)
    }

    loadReading()

    return () => {
      cancelled = true
    }
  }, [id])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function startEdit() {
    setForm(toForm(reading))
    setActionError('')
    setEditing(true)
  }

  function cancelEdit() {
    setForm(toForm(reading))
    setActionError('')
    setEditing(false)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    if (!id) return

    setSaving(true)
    setActionError('')

    const payload = {
      name: form.name.trim(),
      birth_date: form.birth_date,
      birth_time: form.birth_time || null,
      gender: form.gender,
      calendar_type: form.calendar_type,
      result: form.result.trim(),
    }

    const { data, error: updateError } = await supabase
      .from('saju_readings')
      .update(payload)
      .eq('id', id)
      .select('name, result, birth_date, birth_time, gender, calendar_type')
      .single()

    setSaving(false)

    if (updateError) {
      setActionError(updateError.message || '수정에 실패했어요.')
      return
    }

    setReading(data)
    setForm(toForm(data))
    setEditing(false)
    navigate(`/result/${id}`, { replace: true })
  }

  async function handleDelete() {
    if (!id) return
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
        {!editing && meta ? <p className="reading-meta">{meta}</p> : null}
        <p className="lede">
          {editing ? '기록을 다듬어 다시 남겨 주세요.' : '잠시 숨 고르고, 천천히 읽어 보세요.'}
        </p>
      </header>

      {editing ? (
        <form className="saju-form result-edit-form" onSubmit={handleUpdate}>
          <label className="field">
            <span className="field__label">이름</span>
            <input
              className="field__input"
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">생년월일</span>
            <input
              className="field__input"
              type="date"
              value={form.birth_date}
              onChange={(e) => updateField('birth_date', e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">태어난 시간</span>
            <input
              className="field__input"
              type="time"
              value={form.birth_time}
              onChange={(e) => updateField('birth_time', e.target.value)}
            />
          </label>

          <fieldset className="field field--group">
            <legend className="field__label">성별</legend>
            <div className="choice-row">
              <label className="choice">
                <input
                  type="radio"
                  name="edit-gender"
                  value="male"
                  checked={form.gender === 'male'}
                  onChange={(e) => updateField('gender', e.target.value)}
                  required
                />
                <span>남자</span>
              </label>
              <label className="choice">
                <input
                  type="radio"
                  name="edit-gender"
                  value="female"
                  checked={form.gender === 'female'}
                  onChange={(e) => updateField('gender', e.target.value)}
                />
                <span>여자</span>
              </label>
            </div>
          </fieldset>

          <label className="field">
            <span className="field__label">양력 / 음력</span>
            <select
              className="field__input"
              value={form.calendar_type}
              onChange={(e) => updateField('calendar_type', e.target.value)}
            >
              <option value="solar">양력</option>
              <option value="lunar">음력</option>
            </select>
          </label>

          <label className="field">
            <span className="field__label">사주 결과</span>
            <textarea
              className="field__input field__textarea"
              value={form.result}
              onChange={(e) => updateField('result', e.target.value)}
              rows={12}
              required
            />
          </label>

          <div className="result-actions">
            <button className="cta" type="submit" disabled={saving || deleting}>
              {saving ? '저장 중…' : '저장하기'}
            </button>
            <button
              className="cta cta--ghost"
              type="button"
              onClick={cancelEdit}
              disabled={saving || deleting}
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <>
          <article className="reading">
            <div className="reading__ornament" aria-hidden="true">
              ✦
            </div>
            <p className="reading__body">{reading?.result}</p>
          </article>

          <div className="result-actions">
            <button className="cta cta--ghost" type="button" onClick={startEdit}>
              수정하기
            </button>
            <button
              className="cta cta--danger"
              type="button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '삭제 중…' : '삭제하기'}
            </button>
            <Link className="cta cta--ghost" to="/">
              내 사주 보기
            </Link>
          </div>
        </>
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
