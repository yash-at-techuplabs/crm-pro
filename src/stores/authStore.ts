import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: async () => {
        try {
          set({ isLoading: true })
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) throw sessionError
          
          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Profile fetch error:', profileError)
            }
            
            set({
              user: session.user,
              session,
              profile: profile || null,
              isLoading: false,
              isInitialized: true
            })
          } else {
            set({
              user: null,
              session: null,
              profile: null,
              isLoading: false,
              isInitialized: true
            })
          }
          
          // Set up auth state change listener
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              set({
                user: session.user,
                session,
                profile: profile || null
              })
            } else if (event === 'SIGNED_OUT') {
              set({
                user: null,
                session: null,
                profile: null
              })
            }
          })
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({
            isLoading: false,
            isInitialized: true,
            error: error instanceof Error ? error.message : 'Failed to initialize auth'
          })
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          
          if (error) throw error
          
          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            set({
              user: data.user,
              session: data.session,
              profile: profile || null,
              isLoading: false
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to sign in'
          })
          throw error
        }
      },

      signUp: async (email: string, password: string, fullName: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName
              }
            }
          })
          
          if (error) throw error
          
          // Wait a moment for the trigger to create the profile, then fetch it
          if (data.user) {
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            // If profile exists but full_name wasn't set by trigger, update it
            if (profile && !profile.full_name && fullName) {
              await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', data.user.id)
              
              profile.full_name = fullName
            }
            
            set({
              user: data.user,
              session: data.session,
              profile: profile || null,
              isLoading: false
            })
          } else {
            set({
              user: data.user,
              session: data.session,
              isLoading: false
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to sign up'
          })
          throw error
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null })
          
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to sign out'
          })
          throw error
        }
      },

      updateProfile: async (data: Partial<Profile>) => {
        const { user } = get()
        if (!user) throw new Error('No user logged in')
        
        try {
          set({ isLoading: true, error: null })
          
          const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', user.id)
            .select()
            .single()
          
          if (error) throw error
          
          set({
            profile: updatedProfile,
            isLoading: false
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update profile'
          })
          throw error
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist essential data
      })
    }
  )
)

