import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import {
  clearPendingReading,
  loadPendingReading,
} from '../pendingReading.js'
import { supabase } from '../supabase.js'

/**
 * After Google login + profile setup, save the guest reading and open the full result.
 */
function ClaimPendingReading() {
  const navigate = useNavigate()
  const { user, profileComplete, profileLoading, loading } = useAuth()
  const [claimError, setClaimError] = useState('')
  const claimingRef = useRef(false)

  useEffect(() => {
    if (loading || profileLoading || !user || !profileComplete) return
    if (claimingRef.current) return

    const pending = loadPendingReading()
    if (!pending?.result) return

    claimingRef.current = true
    setClaimError('')

    async function claim() {
      try {
        const { data: saved, error } = await supabase
          .from('saju_readings')
          .insert({
            user_id: user.id,
            name: pending.name,
            birth_date: pending.birthDate ?? pending.birth_date,
            birth_time: pending.birthTime || pending.birth_time || null,
            gender: pending.gender,
            calendar_type: pending.calendarType ?? pending.calendar_type ?? 'solar',
            result: pending.result,
          })
          .select('id')
          .single()

        if (error) throw error

        clearPendingReading()
        navigate(`/result/${saved.id}`, {
          replace: true,
          state: {
            result: pending.result,
            name: pending.name,
            birthDate: pending.birthDate ?? pending.birth_date,
            birthTime: pending.birthTime ?? pending.birth_time ?? '',
            gender: pending.gender,
            calendarType: pending.calendarType ?? pending.calendar_type,
            user_id: user.id,
          },
        })
      } catch (err) {
        claimingRef.current = false
        setClaimError(err.message || '결과를 저장하지 못했어요.')
      }
    }

    claim()
  }, [user, profileComplete, profileLoading, loading, navigate])

  if (!claimError) return null

  return (
    <div className="claim-toast" role="alert">
      <p>{claimError}</p>
      <button type="button" className="auth-button auth-button--ghost" onClick={() => setClaimError('')}>
        닫기
      </button>
    </div>
  )
}

export default ClaimPendingReading
