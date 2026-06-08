import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, setAccessToken } from '../lib/apiClient';

const AuthContext = createContext(null)

// Role-based route mapping
const getRoleBasedRoute = (role) => {
  const roleRoutes = {
    'customer': '/customer-dashboard',
    'admin': '/admin-dashboard',
    'super_admin': '/admin-dashboard',
    'employee': '/employee-portal',
    'agent': '/agent-dashboard'
  };
  return roleRoutes?.[role] || '/customer-dashboard';
};

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null || context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [employeeAccess, setEmployeeAccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Isolated async operations - never called from auth callbacks
  const profileOperations = {
    async load(userId) {
      if (!userId) return
      setProfileLoading(true)
      try {
        const res = await apiClient.get('/auth/me')
        const profile = res?.data?.profile
        if (profile) setUserProfile(profile)
        setEmployeeAccess(res?.data?.employeeAccess ?? null)
      } catch (error) {
        console.error('Profile load error:', error)
      } finally {
        setProfileLoading(false)
      }
    },

    clear() {
      setUserProfile(null)
      setEmployeeAccess(null)
      setProfileLoading(false)
    }
  }

  // Auth state handlers - PROTECTED from async modification
  const authStateHandlers = {
    setAuthenticated: (userObj) => {
      setUser(userObj ?? null)
      setLoading(false)
      if (userObj?.id) profileOperations?.load(userObj?.id)
      else profileOperations?.clear()
    },
  }

  useEffect(() => {
    // Initial session check: try refresh-cookie → access token → /me
    (async () => {
      try {
        const refreshRes = await apiClient.post('/auth/refresh', {}, { skipAuthRefresh: true })
        const token = refreshRes?.data?.accessToken
        if (token) setAccessToken(token)

        const meRes = await apiClient.get('/auth/me')
        const meUser = meRes?.data?.user
        const meProfile = meRes?.data?.profile
        setUser(meUser ?? null)
        setUserProfile(meProfile ?? null)
        setEmployeeAccess(meRes?.data?.employeeAccess ?? null)
      } catch {
        setUser(null)
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Auth methods
  const signIn = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password })
      const token = res?.data?.accessToken
      if (token) setAccessToken(token)
      const loginUser = res?.data?.user
      authStateHandlers?.setAuthenticated(loginUser)
      if (loginUser?.role) {
        setUserProfile({
          id: loginUser.id,
          email: loginUser.email,
          role: loginUser.role,
          isActive: true,
          accountStatus: 'active',
        })
      }
      return { data: res?.data, error: null }
    } catch (error) {
      return { error: { message: error?.response?.data?.error || 'Network error. Please try again.' } }
    }
  }

  const signOut = async () => {
    try {
      await apiClient.post('/auth/logout')
      setAccessToken(null)
      setUser(null)
      profileOperations?.clear()
      return { error: null }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const refreshEmployeeAccess = async (accessOverride = null) => {
    if (userProfile?.role !== 'employee' && user?.role !== 'employee') return
    if (accessOverride) {
      setEmployeeAccess(accessOverride)
      return
    }
    try {
      const res = await apiClient.get('/portal/employee/access')
      setEmployeeAccess(res?.data?.access ?? null)
    } catch {
      try {
        const meRes = await apiClient.get('/auth/me')
        setEmployeeAccess(meRes?.data?.employeeAccess ?? null)
      } catch {
        /* ignore */
      }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } }
    
    try {
      const res = await apiClient.patch('/profiles/me', updates)
      if (res?.data?.profile) setUserProfile(res?.data?.profile)
      return { data: res?.data, error: null }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signOut,
    updateProfile,
    employeeAccess,
    refreshEmployeeAccess,
    isAuthenticated: !!user,
    getRoleBasedRoute: () => getRoleBasedRoute(userProfile?.role)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
