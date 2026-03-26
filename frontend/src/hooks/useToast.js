import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [toast, setToast]   = useState({ msg: '', visible: false })
  const timerRef            = useRef(null)

  const showToast = useCallback((msg) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ msg, visible: true })
    timerRef.current = setTimeout(() => setToast({ msg: '', visible: false }), 3000)
  }, [])

  return { toast, showToast }
}
