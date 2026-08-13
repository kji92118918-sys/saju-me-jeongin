import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Analytics } from '../analytics.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { supabase } from '../supabase.js'

function ReadingSidebar() {
  const location = useLocation()
  const { user, profile, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const [readings, setReadings] = useState([])
  const [error, setError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadReadings() {
      if (!user) {
        setReadings([])
        setError('')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('saju_readings')
        .select('id, name, created_at')
        .eq('user_id', user.id)
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
  }, [location.key, user])

  async function handleSignIn() {
    setAuthBusy(true)
    setAuthError('')
    try {
      Analytics.loginStart('sidebar')
      await signInWithGoogle()
    } catch (err) {
      setAuthError(err.message || '로그인에 실패했어요.')
      setAuthBusy(false)
    }
  }

  async function handleSignOut() {
    setAuthBusy(true)
    setAuthError('')
    try {
      Analytics.logout()
      await signOut()
    } catch (err) {
      setAuthError(err.message || '로그아웃에 실패했어요.')
    } finally {
      setAuthBusy(false)
    }
  }

  const displayName =
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    ''

  return (
    <aside className="reading-sidebar" aria-label="저장된 사주 목록">
      <div className="reading-sidebar__top">
        <div className="reading-sidebar__auth">
          {authLoading ? (
            <p className="reading-sidebar__empty">확인 중…</p>
          ) : user ? (
            <>
              <p className="reading-sidebar__user" title={user.email}>
                {displayName}
              </p>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive
                    ? 'reading-sidebar__nav reading-sidebar__nav--active'
                    : 'reading-sidebar__nav'
                }
              >
                프로필
              </NavLink>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive
                    ? 'reading-sidebar__nav reading-sidebar__nav--active'
                    : 'reading-sidebar__nav'
                }
              >
                사주 보기
              </NavLink>
            </>
          ) : (
            <button
              type="button"
              className="auth-button"
              onClick={handleSignIn}
              disabled={authBusy}
            >
              {authBusy ? '이동 중…' : 'Google로 로그인'}
            </button>
          )}
          {authError && <p className="reading-sidebar__error">{authError}</p>}
        </div>

        <p className="reading-sidebar__title">기록</p>
        {!user && !authLoading && (
          <p className="reading-sidebar__empty">로그인하면 기록이 여기에 모입니다.</p>
        )}
        {user && error && <p className="reading-sidebar__error">{error}</p>}
        {user && !error && readings.length === 0 && (
          <p className="reading-sidebar__empty">아직 기록이 없어요.</p>
        )}
        {user && (
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
        )}
      </div>

      {user && !authLoading && (
        <div className="reading-sidebar__footer">
          <button
            type="button"
            className="auth-button auth-button--ghost"
            onClick={handleSignOut}
            disabled={authBusy}
          >
            로그아웃
          </button>
        </div>
      )}
    </aside>
  )
}

export default ReadingSidebar
