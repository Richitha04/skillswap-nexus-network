
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
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
    });

    return unsubscribe;
  }, [toast]);

  const signup = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setIsNewUser(true);
      
      // Create an empty user profile
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        profileCompleted: false,
        skillsOffered: [],
        skillsWanted: []
      });
      
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully!'
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
      await signInWithEmailAndPassword(auth, email, password);
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
      await signOut(auth);
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
    setIsNewUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
