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
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Skill } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

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
  const { currentUser, userProfile, isLoading, setUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const validateForm = () => {
    if (!name.trim()) {
      return 'Please enter your name';
    }

    if (!age.trim()) {
      return 'Please enter your age';
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return 'Please enter a valid age (13-120)';
    }

    if (!location.trim()) {
      return 'Please enter your location';
    }

    if (!offeredSkillName.trim()) {
      return 'Please enter a skill you can offer';
    }

    if (!wantedSkillName.trim()) {
      return 'Please enter a skill you want to learn';
    }

    if (offeredSkillName.toLowerCase() === wantedSkillName.toLowerCase()) {
      return 'Offered skill and wanted skill cannot be the same';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
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
          age: parseInt(age),
          location,
          skillsOffered: [offeredSkill],
          skillsWanted: [wantedSkill],
          profileCompleted: true
        })
        .eq('uid', currentUser.id);

      if (error) throw error;

      // Refresh the user profile in the auth context
      const { data: updatedProfile } = await supabase
        .from('users')
        .select('*')
        .eq('uid', currentUser.id)
        .single();

      if (updatedProfile) {
        // Update the auth context
        setUserProfile(updatedProfile as UserProfile);
      }

      toast({
        title: 'Profile Completed',
        description: 'Your profile has been successfully set up! Redirecting to dashboard...'
      });

      // Add a small delay before navigation to show the success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');

      toast({
        title: 'Error',
        description: 'Failed to complete your profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-skyblue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Complete Your Profile</CardTitle>
            <CardDescription className="text-center text-gray-600">
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
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-gray-300 focus:border-skyblue focus:ring-skyblue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-gray-700">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="13"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="border-gray-300 focus:border-skyblue focus:ring-skyblue"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-gray-300 focus:border-skyblue focus:ring-skyblue"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Skill You Can Offer</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="offeredSkillName" className="text-gray-700">Skill Name</Label>
                    <Input
                      id="offeredSkillName"
                      placeholder="e.g. JavaScript Programming"
                      value={offeredSkillName}
                      onChange={(e) => setOfferedSkillName(e.target.value)}
                      className="border-gray-300 focus:border-skyblue focus:ring-skyblue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="offeredSkillCategory" className="text-gray-700">Category</Label>
                    <Select
                      value={offeredSkillCategory}
                      onValueChange={setOfferedSkillCategory}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-skyblue focus:ring-skyblue">
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
                  <Label htmlFor="offeredSkillLevel" className="text-gray-700">Your Proficiency Level</Label>
                  <Select
                    value={offeredSkillLevel}
                    onValueChange={(value) => setOfferedSkillLevel(value as typeof skillLevels[number])}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-skyblue focus:ring-skyblue">
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
                <h3 className="text-lg font-medium text-gray-900">Skill You Want to Learn</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wantedSkillName" className="text-gray-700">Skill Name</Label>
                    <Input
                      id="wantedSkillName"
                      placeholder="e.g. Guitar Playing"
                      value={wantedSkillName}
                      onChange={(e) => setWantedSkillName(e.target.value)}
                      className="border-gray-300 focus:border-skyblue focus:ring-skyblue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wantedSkillCategory" className="text-gray-700">Category</Label>
                    <Select
                      value={wantedSkillCategory}
                      onValueChange={setWantedSkillCategory}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-skyblue focus:ring-skyblue">
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
                  <Label htmlFor="wantedSkillLevel" className="text-gray-700">Desired Proficiency Level</Label>
                  <Select
                    value={wantedSkillLevel}
                    onValueChange={(value) => setWantedSkillLevel(value as typeof skillLevels[number])}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-skyblue focus:ring-skyblue">
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

              <Button
                type="submit"
                className="w-full bg-skyblue hover:bg-skyblue-dark text-white font-semibold py-2 px-4 rounded-md shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Completing Profile...
                  </div>
                ) : 'Complete Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
