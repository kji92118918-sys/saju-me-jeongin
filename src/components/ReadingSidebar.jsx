import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { supabase } from '../supabase.js'

function ReadingSidebar() {
  const location = useLocation()
  const [readings, setReadings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadReadings() {
      const { data, error: fetchError } = await supabase
        .from('saju_readings')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (fetchError) {
        setError('목록을 불러오지 못했어요.')
        return
      }

      setError('')
      setReadings(data ?? [])
    }

    loadReadings()

    return () => {
      cancelled = true
    }
  }, [location.key])

  return (
    <aside className="reading-sidebar" aria-label="저장된 사주 목록">
      <p className="reading-sidebar__title">기록</p>
      {error && <p className="reading-sidebar__error">{error}</p>}
      {!error && readings.length === 0 && (
        <p className="reading-sidebar__empty">아직 기록이 없어요.</p>
      )}
      <ul className="reading-sidebar__list">
        {readings.map((reading) => (
          <li key={reading.id}>
            <NavLink
              to={`/result/${reading.id}`}
              className={({ isActive }) =>
                isActive
                  ? 'reading-sidebar__item reading-sidebar__item--active'
                  : 'reading-sidebar__item'
              }
            >
              {reading.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default ReadingSidebar
