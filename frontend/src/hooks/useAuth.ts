import { useCallback, useState } from 'react'
import { login as apiLogin, ApiError } from '../api/client'

const STORAGE_KEY = 'erm_admin_token'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))

  const login = useCallback(async (username: string, password: string) => {
    const { access_token } = await apiLogin(username, password)
    localStorage.setItem(STORAGE_KEY, access_token)
    setToken(access_token)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }, [])

  return { token, isAdmin: token !== null, login, logout }
}

export { ApiError }
