import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "organizer" | "provider" | "guest" | "admin";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  trust_score: number;
  total_events: number;
  completed_services: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setProfile: (profile) => {
        set({ profile });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            return;
          }

          set({ profile: data as Profile });
        } catch (error) {
          console.error("Unexpected error fetching profile:", error);
        }
      },

      refreshSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error refreshing session:", error);
            set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
            return;
          }

          if (session?.user) {
            set({ user: session.user, isAuthenticated: true });
            // Fetch profile after setting user
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", session.user.id)
              .single();
            
            if (profile) {
              set({ profile: profile as Profile });
            }
          } else {
            set({ user: null, profile: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error("Error in refreshSession:", error);
          set({ user: null, profile: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ 
            user: null, 
            profile: null, 
            isAuthenticated: false 
          });
        } catch (error) {
          console.error("Error signing out:", error);
          throw error;
        }
      },
    }),
    {
      name: "ktrin-auth-storage",
      partialize: (state) => ({ 
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

