// context/UserContext.js
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { api } from '@/lib/axios'
import jwtDecode from 'jwt-decode'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const login = async (cpf, password) => {
    try {
      const response = await api.post('/auth/login', { cpf, password })

      const { token, currentRole } = response.data

      Cookies.set('auth_token', token)
      setRole(currentRole)

      const decoded = jwtDecode(token)
      setUser(decoded.user)

    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    Cookies.remove('auth_token')
    setUser(null)
    setRole(null)
  }

  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }))
  }

  useEffect(() => {
    const token = Cookies.get('auth_token')

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const decoded = jwtDecode(token)
      setUser(decoded.user)
      setRole(decoded.role)
    } catch (error) {
      console.error('Token inválido:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) return null

  return (
    <UserContext.Provider value={{ user, role, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
