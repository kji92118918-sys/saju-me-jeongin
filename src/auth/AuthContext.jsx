import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase.js'

const AuthContext = createContext(null)

function normalizeProfile(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name ?? '',
    birthDate: row.birth_date ?? '',
    birthTime: row.birth_time ? String(row.birth_time).slice(0, 5) : '',
    gender: row.gender ?? '',
    calendarType: row.calendar_type ?? 'solar',
  }
}

function isProfileComplete(profile) {
  return Boolean(
    profile?.name?.trim() &&
      profile?.birthDate &&
      profile?.gender &&
      profile?.calendarType,
  )
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
      if (!nextSession) {
        setProfile(null)
        setProfileLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const userId = session?.user?.id

    if (!userId) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    async function loadProfile() {
      setProfileLoading(true)

      const { data, error } = await supabase
        .from('users')
        .select('id, name, birth_date, birth_time, gender, calendar_type')
        .eq('id', userId)
        .maybeSingle()

      if (cancelled) return

      if (error) {
        console.error('Failed to load profile', error)
        setProfile(null)
        setProfileLoading(false)
        return
      }

      setProfile(normalizeProfile(data))
      setProfileLoading(false)
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      profileComplete: isProfileComplete(profile),
      loading,
      profileLoading,
      async signInWithGoogle(redirectTo = window.location.href) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
          },
        })
        if (error) throw error
      },
      async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setProfile(null)
      },
      async saveProfile(input) {
        const userId = session?.user?.id
        if (!userId) {
          throw new Error('로그인이 필요해요.')
        }

        const payload = {
          id: userId,
          name: input.name.trim(),
          birth_date: input.birthDate,
          birth_time: input.birthTime || null,
          gender: input.gender,
          calendar_type: input.calendarType || 'solar',
        }

        const { data, error } = await supabase
          .from('users')
          .upsert(payload, { onConflict: 'id' })
          .select('id, name, birth_date, birth_time, gender, calendar_type')
          .single()

        if (error) {
          throw new Error(error.message || '프로필 저장에 실패했어요.')
        }

        const next = normalizeProfile(data)
        setProfile(next)
        return next
      },
      refreshProfile() {
        const userId = session?.user?.id
        if (!userId) {
          setProfile(null)
          return Promise.resolve(null)
        }

        setProfileLoading(true)
        return supabase
          .from('users')
          .select('id, name, birth_date, birth_time, gender, calendar_type')
          .eq('id', userId)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) {
              throw new Error(error.message || '프로필을 불러오지 못했어요.')
            }
            const next = normalizeProfile(data)
            setProfile(next)
            setProfileLoading(false)
            return next
          })
          .catch((err) => {
            setProfileLoading(false)
            throw err
          })
      },
    }),
    [session, profile, loading, profileLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
