const MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-4C2QGD3KRH'

let initialized = false

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return
  if (!MEASUREMENT_ID) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }

  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false,
  })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)

  initialized = true
}

export function trackPageView(path = window.location.pathname) {
  if (!MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  })
}

export function trackEvent(eventName, params = {}) {
  if (!MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', eventName, params)
}

/** Convenience helpers for key product actions */
export const Analytics = {
  loginStart(source) {
    trackEvent('login', { method: 'google', source })
  },
  logout() {
    trackEvent('logout')
  },
  analyzeStart({ isLoggedIn }) {
    trackEvent('analyze_saju_start', {
      is_logged_in: Boolean(isLoggedIn),
    })
  },
  analyzeComplete({ isLoggedIn, saved }) {
    trackEvent('analyze_saju_complete', {
      is_logged_in: Boolean(isLoggedIn),
      saved: Boolean(saved),
    })
  },
  unlockLoginClick() {
    trackEvent('unlock_login_click', { method: 'google' })
  },
  share(method) {
    trackEvent('share', {
      method,
      content_type: 'saju_reading',
      item_id: 'result',
    })
  },
  deleteReading() {
    trackEvent('delete_reading')
  },
  profileSetupComplete() {
    trackEvent('sign_up', { method: 'google_profile' })
  },
  profileEditStart() {
    trackEvent('profile_edit_start')
  },
  profileSave() {
    trackEvent('profile_save')
  },
  clickNewSaju() {
    trackEvent('click_new_saju')
  },
  claimPendingSuccess() {
    trackEvent('claim_pending_reading')
  },
}
