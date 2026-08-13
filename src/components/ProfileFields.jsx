function ProfileFields({
  values,
  onChange,
  idPrefix = 'profile',
  nameRequired = true,
}) {
  function update(field, value) {
    onChange({ ...values, [field]: value })
  }

  return (
    <>
      <label className="field" htmlFor={`${idPrefix}-name`}>
        <span className="field__label">이름</span>
        <input
          id={`${idPrefix}-name`}
          className="field__input"
          type="text"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="이름을 입력하세요"
          required={nameRequired}
        />
      </label>

      <label className="field" htmlFor={`${idPrefix}-birth-date`}>
        <span className="field__label">생년월일</span>
        <input
          id={`${idPrefix}-birth-date`}
          className="field__input"
          type="date"
          value={values.birthDate}
          onChange={(e) => update('birthDate', e.target.value)}
          required
        />
      </label>

      <label className="field" htmlFor={`${idPrefix}-birth-time`}>
        <span className="field__label">태어난 시간</span>
        <input
          id={`${idPrefix}-birth-time`}
          className="field__input"
          type="time"
          value={values.birthTime}
          onChange={(e) => update('birthTime', e.target.value)}
        />
      </label>

      <fieldset className="field field--group">
        <legend className="field__label">성별</legend>
        <div className="choice-row">
          <label className="choice">
            <input
              type="radio"
              name={`${idPrefix}-gender`}
              value="male"
              checked={values.gender === 'male'}
              onChange={(e) => update('gender', e.target.value)}
              required
            />
            <span>남자</span>
          </label>
          <label className="choice">
            <input
              type="radio"
              name={`${idPrefix}-gender`}
              value="female"
              checked={values.gender === 'female'}
              onChange={(e) => update('gender', e.target.value)}
            />
            <span>여자</span>
          </label>
        </div>
      </fieldset>

      <label className="field" htmlFor={`${idPrefix}-calendar`}>
        <span className="field__label">양력 / 음력</span>
        <select
          id={`${idPrefix}-calendar`}
          className="field__input"
          value={values.calendarType}
          onChange={(e) => update('calendarType', e.target.value)}
          required
        >
          <option value="solar">양력</option>
          <option value="lunar">음력</option>
        </select>
      </label>
    </>
  )
}

export function emptyProfileForm(overrides = {}) {
  return {
    name: '',
    birthDate: '',
    birthTime: '',
    gender: '',
    calendarType: 'solar',
    ...overrides,
  }
}

export function profileToForm(profile) {
  if (!profile) return emptyProfileForm()
  return emptyProfileForm({
    name: profile.name ?? '',
    birthDate: profile.birthDate ?? '',
    birthTime: profile.birthTime ?? '',
    gender: profile.gender ?? '',
    calendarType: profile.calendarType ?? 'solar',
  })
}

export default ProfileFields
