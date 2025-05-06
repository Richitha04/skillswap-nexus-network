
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '../supabase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import { Skill } from '@/contexts/AuthContext';

// Skill categories
const skillCategories = [
  'Technology',
  'Music',
  'Language',
  'Art',
  'Cooking',
  'Fitness',
  'Business',
  'Science',
  'Mathematics',
  'Other'
];

// Skill levels
const skillLevels = ['Beginner', 'Intermediate', 'Expert'] as const;

// Progress statuses
const progressStatuses = ['Not Started', 'In Progress', 'Mastered'] as const;

const Onboarding: React.FC = () => {
  const { currentUser, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  
  // Skill offered
  const [offeredSkillName, setOfferedSkillName] = useState('');
  const [offeredSkillCategory, setOfferedSkillCategory] = useState(skillCategories[0]);
  const [offeredSkillLevel, setOfferedSkillLevel] = useState<typeof skillLevels[number]>('Intermediate');
  
  // Skill wanted
  const [wantedSkillName, setWantedSkillName] = useState('');
  const [wantedSkillCategory, setWantedSkillCategory] = useState(skillCategories[0]);
  const [wantedSkillLevel, setWantedSkillLevel] = useState<typeof skillLevels[number]>('Beginner');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!isLoading && !currentUser) {
      navigate('/login');
    }
    
    // If user already completed profile, redirect to dashboard
    if (userProfile && userProfile.profileCompleted) {
      navigate('/dashboard');
    }
  }, [currentUser, isLoading, navigate, userProfile]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !age || !location || !offeredSkillName || !wantedSkillName) {
      setError('Please fill in all required fields');
      return;
    }
    
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setError('Please enter a valid age (13-120)');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (!currentUser) {
        throw new Error('You must be logged in to complete your profile');
      }
      
      const offeredSkill: Skill = {
        id: Date.now().toString() + 'o',
        name: offeredSkillName,
        category: offeredSkillCategory,
        level: offeredSkillLevel,
        progress: 'Mastered'
      };
      
      const wantedSkill: Skill = {
        id: Date.now().toString() + 'w',
        name: wantedSkillName,
        category: wantedSkillCategory,
        level: wantedSkillLevel,
        progress: 'Not Started'
      };
      
      // Update user profile in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          name,
          age: ageNum,
          location,
          skillsOffered: [offeredSkill],
          skillsWanted: [wantedSkill],
          profileCompleted: true
        })
        .eq('uid', currentUser.id);
      
      if (error) throw error;
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
            <CardDescription className="text-center">
              Tell us about yourself and what skills you want to exchange
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="13"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Skill You Can Offer</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="offeredSkillName">Skill Name</Label>
                    <Input
                      id="offeredSkillName"
                      placeholder="e.g. JavaScript Programming"
                      value={offeredSkillName}
                      onChange={(e) => setOfferedSkillName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="offeredSkillCategory">Category</Label>
                    <Select 
                      value={offeredSkillCategory} 
                      onValueChange={setOfferedSkillCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="offeredSkillLevel">Your Proficiency Level</Label>
                  <Select 
                    value={offeredSkillLevel} 
                    onValueChange={(value) => setOfferedSkillLevel(value as typeof skillLevels[number])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Skill You Want to Learn</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wantedSkillName">Skill Name</Label>
                    <Input
                      id="wantedSkillName"
                      placeholder="e.g. Spanish Language"
                      value={wantedSkillName}
                      onChange={(e) => setWantedSkillName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="wantedSkillCategory">Category</Label>
                    <Select 
                      value={wantedSkillCategory} 
                      onValueChange={setWantedSkillCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wantedSkillLevel">Desired Learning Level</Label>
                  <Select 
                    value={wantedSkillLevel} 
                    onValueChange={(value) => setWantedSkillLevel(value as typeof skillLevels[number])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              className="bg-skyblue hover:bg-skyblue-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Completing Profile...' : 'Complete Profile'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
