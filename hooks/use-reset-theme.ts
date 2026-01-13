'use client'

import { useCallback, useInsertionEffect } from 'react'

export function useResetTheme() {
  const reset = useCallback(() => {
    localStorage.removeItem('theme')
    document.documentElement.classList.remove('dark', 'light')
  }, [])

  useInsertionEffect(() => {
    reset()
  }, [reset])

  return reset
}