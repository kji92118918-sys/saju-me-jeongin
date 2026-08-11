import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeSaju } from '../gemini.js'

function HomePage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [gender, setGender] = useState('')
  const [calendarType, setCalendarType] = useState('solar')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const text = await analyzeSaju({
        name,
        birthDate,
        birthTime,
        gender,
        calendarType,
      })
      // 해석 결과는 다음 페이지로 전달
      navigate('/result', { state: { result: text, name } })
    } catch (err) {
      setError(err.message || '해석 요청에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page--home">
      <div className="mist mist--a" aria-hidden="true" />
      <div className="mist mist--b" aria-hidden="true" />

      <header className="hero">
        <p className="brand">사주미</p>
        <h1 className="headline">당신의 흐름을 들여다봅니다</h1>
        <p className="lede">이름과 생시를 남겨 주세요. 조용히 읽어 드릴게요.</p>
      </header>

      <form className="saju-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">이름</span>
          <input
            className="field__input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            required
          />
        </label>

        <label className="field">
          <span className="field__label">생년월일</span>
          <input
            className="field__input"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">태어난 시간</span>
          <input
            className="field__input"
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
          />
        </label>

        <fieldset className="field field--group">
          <legend className="field__label">성별</legend>
          <div className="choice-row">
            <label className="choice">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === 'male'}
                onChange={(e) => setGender(e.target.value)}
                required
              />
              <span>남자</span>
            </label>
            <label className="choice">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === 'female'}
                onChange={(e) => setGender(e.target.value)}
              />
              <span>여자</span>
            </label>
          </div>
        </fieldset>

        <label className="field">
          <span className="field__label">양력 / 음력</span>
          <select
            className="field__input"
            value={calendarType}
            onChange={(e) => setCalendarType(e.target.value)}
          >
            <option value="solar">양력</option>
            <option value="lunar">음력</option>
          </select>
        </label>

        <button className="cta" type="submit" disabled={loading}>
          {loading ? '읽는 중…' : '사주 해석하기'}
        </button>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}

export default HomePage
