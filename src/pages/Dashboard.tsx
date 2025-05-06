
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Skill, UserProfile } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import SkillList from '@/components/SkillList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter } from 'lucide-react';
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

interface SkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skill: Omit<Skill, 'id'>) => void;
  initialSkill?: Skill;
  type: 'offer' | 'want';
}

const SkillDialog: React.FC<SkillDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSkill,
  type
}) => {
  const [name, setName] = useState(initialSkill?.name || '');
  const [category, setCategory] = useState(initialSkill?.category || skillCategories[0]);
  const [level, setLevel] = useState<typeof skillLevels[number]>(
    initialSkill?.level || (type === 'offer' ? 'Intermediate' : 'Beginner')
  );
  const [progress, setProgress] = useState<typeof progressStatuses[number]>(
    initialSkill?.progress || (type === 'offer' ? 'Mastered' : 'Not Started')
  );

  useEffect(() => {
    if (isOpen && initialSkill) {
      setName(initialSkill.name);
      setCategory(initialSkill.category);
      setLevel(initialSkill.level);
      setProgress(initialSkill.progress);
    } else if (isOpen) {
      setName('');
      setCategory(skillCategories[0]);
      setLevel(type === 'offer' ? 'Intermediate' : 'Beginner');
      setProgress(type === 'offer' ? 'Mastered' : 'Not Started');
    }
  }, [isOpen, initialSkill, type]);

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      category,
      level,
      progress
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialSkill ? 'Edit Skill' : type === 'offer' ? 'Add Skill to Offer' : 'Add Skill to Learn'}
          </DialogTitle>
          <DialogDescription>
            {type === 'offer' 
              ? 'Add a skill you can teach others'
              : 'Add a skill you want to learn'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Skill Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'offer' ? "JavaScript Programming" : "Spanish Language"}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {skillCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="level">
              {type === 'offer' ? 'Your Proficiency Level' : 'Desired Learning Level'}
            </Label>
            <Select 
              value={level} 
              onValueChange={(value) => setLevel(value as typeof skillLevels[number])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {skillLevels.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="progress">Learning Progress</Label>
            <Select 
              value={progress} 
              onValueChange={(value) => setProgress(value as typeof progressStatuses[number])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {progressStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-skyblue hover:bg-skyblue-dark">
            {initialSkill ? 'Update' : 'Add'} Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Dashboard component
const Dashboard: React.FC = () => {
  const { currentUser, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [skillDialogType, setSkillDialogType] = useState<'offer' | 'want'>('offer');
  const [editingSkill, setEditingSkill] = useState<Skill | undefined>(undefined);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    }
    
    // If user hasn't completed profile, redirect to onboarding
    if (!isLoading && currentUser && userProfile && !userProfile.profileCompleted) {
      navigate('/onboarding');
    }
  }, [currentUser, isLoading, navigate, userProfile]);

  // Load matches when profile changes
  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser || !userProfile || !userProfile.skillsWanted || !userProfile.skillsOffered) return;
      
      setIsLoadingMatches(true);
      
      try {
        const matchesFound: UserProfile[] = [];
        
        // Get skills names for matching
        const wantedSkillNames = userProfile.skillsWanted.map(skill => skill.name.toLowerCase());
        const offeredSkillNames = userProfile.skillsOffered.map(skill => skill.name.toLowerCase());
        
        // Find users who want skills I can offer
        const potentialMatches = collection(db, 'users');
        const snapshot = await getDocs(potentialMatches);
        
        snapshot.forEach(doc => {
          const userData = doc.data() as UserProfile;
          
          // Skip current user and users without completed profiles
          if (userData.uid === currentUser.uid || !userData.profileCompleted) {
            return;
          }
          
          // Check if this user offers any skills I want
          const userOffersSkillIWant = userData.skillsOffered?.some(skill => 
            wantedSkillNames.includes(skill.name.toLowerCase())
          );
          
          // Check if this user wants any skills I offer
          const userWantsSkillIOffer = userData.skillsWanted?.some(skill => 
            offeredSkillNames.includes(skill.name.toLowerCase())
          );
          
          // If there's a two-way match, add to matches
          if (userOffersSkillIWant && userWantsSkillIOffer) {
            matchesFound.push(userData);
          }
        });
        
        setMatches(matchesFound);
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load matches',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingMatches(false);
      }
    };
    
    fetchMatches();
  }, [currentUser, userProfile, toast]);

  // Add a new skill
  const handleAddSkill = async (skill: Omit<Skill, 'id'>) => {
    if (!currentUser || !userProfile) return;
    
    try {
      const newSkill: Skill = {
        ...skill,
        id: Date.now().toString()
      };
      
      const userRef = doc(db, 'users', currentUser.uid);
      
      if (skillDialogType === 'offer') {
        const updatedSkills = [...(userProfile.skillsOffered || []), newSkill];
        await updateDoc(userRef, { skillsOffered: updatedSkills });
        toast({
          title: 'Skill Added',
          description: `You can now offer ${newSkill.name}!`
        });
      } else {
        const updatedSkills = [...(userProfile.skillsWanted || []), newSkill];
        await updateDoc(userRef, { skillsWanted: updatedSkills });
        toast({
          title: 'Skill Added',
          description: `${newSkill.name} added to your learning list!`
        });
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to add skill',
        variant: 'destructive'
      });
    }
  };

  // Update an existing skill
  const handleUpdateSkill = async (updatedSkill: Omit<Skill, 'id'>) => {
    if (!currentUser || !userProfile || !editingSkill) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      if (skillDialogType === 'offer') {
        const updatedSkills = userProfile.skillsOffered.map(skill => 
          skill.id === editingSkill.id 
            ? { ...updatedSkill, id: editingSkill.id } 
            : skill
        );
        await updateDoc(userRef, { skillsOffered: updatedSkills });
      } else {
        const updatedSkills = userProfile.skillsWanted.map(skill => 
          skill.id === editingSkill.id 
            ? { ...updatedSkill, id: editingSkill.id } 
            : skill
        );
        await updateDoc(userRef, { skillsWanted: updatedSkills });
      }
      
      toast({
        title: 'Skill Updated',
        description: `${updatedSkill.name} has been updated!`
      });
    } catch (error) {
      console.error('Error updating skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to update skill',
        variant: 'destructive'
      });
    }
  };

  // Delete a skill
  const handleDeleteSkill = async (skillId: string, type: 'offer' | 'want') => {
    if (!currentUser || !userProfile) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      if (type === 'offer') {
        const updatedSkills = userProfile.skillsOffered.filter(skill => skill.id !== skillId);
        await updateDoc(userRef, { skillsOffered: updatedSkills });
      } else {
        const updatedSkills = userProfile.skillsWanted.filter(skill => skill.id !== skillId);
        await updateDoc(userRef, { skillsWanted: updatedSkills });
      }
      
      toast({
        title: 'Skill Removed',
        description: 'The skill has been removed from your profile'
      });
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove skill',
        variant: 'destructive'
      });
    }
  };

  // Open skill dialog for adding
  const openAddSkillDialog = (type: 'offer' | 'want') => {
    setSkillDialogType(type);
    setEditingSkill(undefined);
    setSkillDialogOpen(true);
  };

  // Open skill dialog for editing
  const openEditSkillDialog = (skill: Skill, type: 'offer' | 'want') => {
    setSkillDialogType(type);
    setEditingSkill(skill);
    setSkillDialogOpen(true);
  };

  // Save skill (add or update)
  const handleSaveSkill = (skill: Omit<Skill, 'id'>) => {
    if (editingSkill) {
      handleUpdateSkill(skill);
    } else {
      handleAddSkill(skill);
    }
  };

  // Filter matches by search query and category
  const filteredMatches = matches.filter(match => {
    // Filter by search query
    const matchesSearchQuery = searchQuery === '' || 
      match.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.skillsOffered.some(skill => 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      match.skillsWanted.some(skill => 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    // Filter by category
    const matchesCategory = categoryFilter === '' ||
      match.skillsOffered.some(skill => skill.category === categoryFilter) ||
      match.skillsWanted.some(skill => skill.category === categoryFilter);
    
    return matchesSearchQuery && matchesCategory;
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!userProfile) {
    return <div className="min-h-screen flex items-center justify-center">Error loading user profile</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-darkblack">Welcome, {userProfile.name || 'User'}!</h1>
          <p className="text-gray-600">Manage your skills and find matches</p>
        </div>
        
        <Tabs defaultValue="skills">
          <TabsList className="mb-6">
            <TabsTrigger value="skills">My Skills</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
          </TabsList>
          
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkillList 
                skills={userProfile.skillsOffered || []} 
                title="Skills I Can Offer"
                emptyMessage="You haven't added any skills you can offer yet."
                onAddSkill={() => openAddSkillDialog('offer')}
                onEditSkill={(skill) => openEditSkillDialog(skill, 'offer')}
                onDeleteSkill={(skillId) => handleDeleteSkill(skillId, 'offer')}
              />
              
              <SkillList 
                skills={userProfile.skillsWanted || []} 
                title="Skills I Want to Learn"
                emptyMessage="You haven't added any skills you want to learn yet."
                onAddSkill={() => openAddSkillDialog('want')}
                onEditSkill={(skill) => openEditSkillDialog(skill, 'want')}
                onDeleteSkill={(skillId) => handleDeleteSkill(skillId, 'want')}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Skill Matches</CardTitle>
                    <CardDescription>
                      Users who want to learn what you offer and can teach what you want
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                    <div className="flex items-center border rounded-md bg-white overflow-hidden">
                      <Input
                        placeholder="Search skills or users..."
                        className="border-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button variant="ghost" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {skillCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {isLoadingMatches ? (
                  <div className="text-center py-8">Loading matches...</div>
                ) : filteredMatches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {matches.length === 0
                      ? "No matches found yet. Add more skills to increase your chances!"
                      : "No matches found with current filters."}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMatches.map((match) => (
                      <Card key={match.uid} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="p-4 md:w-1/4 bg-gray-50">
                            <h3 className="text-lg font-semibold">{match.name}</h3>
                            <p className="text-gray-500 text-sm">{match.location}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2 text-skyblue border-skyblue hover:bg-skyblue hover:text-white"
                              onClick={() => navigate(`/chat/${match.uid}`)}
                            >
                              Message
                            </Button>
                          </div>
                          
                          <div className="p-4 md:w-3/4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm text-gray-500 mb-2">
                                  Skills They Offer:
                                </h4>
                                <div className="space-y-1">
                                  {match.skillsOffered
                                    .filter(skill => 
                                      userProfile.skillsWanted.some(
                                        wanted => wanted.name.toLowerCase() === skill.name.toLowerCase()
                                      )
                                    )
                                    .map((skill, idx) => (
                                      <div key={idx} className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm inline-block mr-2 mb-2">
                                        {skill.name} ({skill.level})
                                      </div>
                                    ))
                                  }
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm text-gray-500 mb-2">
                                  Skills They Want:
                                </h4>
                                <div className="space-y-1">
                                  {match.skillsWanted
                                    .filter(skill => 
                                      userProfile.skillsOffered.some(
                                        offered => offered.name.toLowerCase() === skill.name.toLowerCase()
                                      )
                                    )
                                    .map((skill, idx) => (
                                      <div key={idx} className="bg-skyblue text-white px-3 py-1 rounded-full text-sm inline-block mr-2 mb-2">
                                        {skill.name} ({skill.level})
                                      </div>
                                    ))
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <SkillDialog
        isOpen={skillDialogOpen}
        onClose={() => setSkillDialogOpen(false)}
        onSave={handleSaveSkill}
        initialSkill={editingSkill}
        type={skillDialogType}
      />
    </div>
  );
};

export default Dashboard;
