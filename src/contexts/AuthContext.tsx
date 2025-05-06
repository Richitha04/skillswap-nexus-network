import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase/config';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
  setUserProfile: (profile: UserProfile | null) => void;
}

export interface UserProfile {
  uid: string;
  name: string;
  age: number;
  location: string;
  email: string;
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  profileCompleted: boolean;
}

export interface Skill {
  id?: string;
  name: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  progress: 'Not Started' | 'In Progress' | 'Mastered';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setCurrentUser(session?.user ?? null);

        if (session?.user) {
          try {
            // Fetch user profile from Supabase
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('uid', session.user.id)
              .single();

            if (error) {
              console.error('Error fetching user profile:', error);
              setIsNewUser(true);
            } else if (data) {
              setUserProfile(data as UserProfile);
            } else {
              // New user, no profile yet
              setIsNewUser(true);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            toast({
              title: 'Error',
              description: 'Failed to load user profile',
              variant: 'destructive'
            });
          }
        } else {
          setUserProfile(null);
        }

        setIsLoading(false);
      }
    );

    // Initial session check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);

      if (session?.user) {
        try {
          // Fetch user profile from Supabase
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('uid', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            setIsNewUser(true);
          } else if (data) {
            setUserProfile(data as UserProfile);
          } else {
            // New user, no profile yet
            setIsNewUser(true);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }

      setIsLoading(false);
    };

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signup = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setIsNewUser(true);

      if (data.user) {
        // Create an empty user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            uid: data.user.id,
            email: email,
            profileCompleted: false,
            skillsOffered: [],
            skillsWanted: [],
            name: '',
            age: 0,
            location: ''
          });

        if (profileError) throw profileError;
      }

      toast({
        title: 'Account created',
        description: 'Your account has been created successfully! Please complete your profile.'
      });
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.'
      });
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.'
      });
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    userProfile,
    isLoading,
    signup,
    login,
    logout,
    isNewUser,
    setIsNewUser,
    setUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};