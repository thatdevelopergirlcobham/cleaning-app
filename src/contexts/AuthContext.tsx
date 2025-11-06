import React, { useEffect, useState, useCallback } from 'react'
import type { User, Session, AuthError, UserMetadata } from '@supabase/supabase-js'
import { supabase } from '../api/supabaseClient'
import { usersApi } from '../api/users'
import type { UserProfile } from './AuthContext.types'
import { AuthContext } from './AuthContext.context'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      let profile = await usersApi.getUserProfile(userId)
      if (!profile) {
        const { data: authUserRes } = await supabase.auth.getUser()
        const authUser = authUserRes?.user
        if (authUser && authUser.id === userId && authUser.email) {
          profile = await usersApi.createUserProfile({
            id: authUser.id,
            email: authUser.email,
            full_name: (authUser.user_metadata?.full_name as string) ?? null,
            role: 'user',
          })
        }
      }
      setProfile(profile as UserProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [loadUserProfile])


  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        return { user: null, error }
      }

      return { user: data.user, error }
    } catch (error) {
      return { user: null, error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { user: data.user, error }
    } catch (error) {
      return { user: null, error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      try { localStorage.removeItem('dev_admin_logged_in') } catch (err) { void err }
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const updateProfile = useCallback(async (updates: Omit<Partial<UserProfile>, 'role'>) => {
    if (!user) return { success: false, error: new Error('No user logged in') }
    
    try {
      // Update auth user data if name changed
      if (updates.full_name) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: updates.full_name } as UserMetadata
        })
        if (error) throw error
      }

      // Update profile in database
      await usersApi.updateUserProfile(user.id, updates)
      setProfile(prev => ({
        ...prev,
        ...updates,
        id: prev?.id || user.id,
        updated_at: new Date().toISOString()
      } as UserProfile))
      
      return { success: true }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error as Error }
    }
  }, [user])

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
