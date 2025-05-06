
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '../supabase/config';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfile } from '@/contexts/AuthContext';

interface TutorOffer {
  id: string;
  tutorId: string;
  tutorName: string;
  skillOffered: string;
  price: number;
  message: string;
}

const WaitingList: React.FC = () => {
  const { currentUser, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tutorOffers, setTutorOffers] = useState<TutorOffer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, isLoading, navigate]);
  
  useEffect(() => {
    const fetchTutorOffers = async () => {
      if (!currentUser) return;
      
      setIsLoadingOffers(true);
      
      try {
        // Get tutor offers for this user
        const { data, error } = await supabase
          .from('tutor_offers')
          .select('*')
          .eq('userId', currentUser.id);
          
        if (error) throw error;
        
        setTutorOffers(data as TutorOffer[]);
        
        // Generate suggested skills based on current waiting matches
        if (userProfile) {
          const { data: matchData, error: matchError } = await supabase
            .from('users')
            .select('skillsOffered')
            .neq('uid', currentUser.id);
            
          if (matchError) throw matchError;
          
          // Extract popular skills that are offered by others
          const popularSkills = matchData
            .flatMap(user => user.skillsOffered || [])
            .map(skill => skill.name)
            .filter(Boolean)
            .reduce((acc: Record<string, number>, skill: string) => {
              acc[skill] = (acc[skill] || 0) + 1;
              return acc;
            }, {});
            
          // Get the top 5 skills
          const suggested = Object.entries(popularSkills)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill]) => skill);
            
          setSuggestedSkills(suggested);
        }
      } catch (error) {
        console.error('Error fetching tutor offers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tutor offers',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingOffers(false);
      }
    };
    
    fetchTutorOffers();
  }, [currentUser, userProfile, toast]);
  
  const handleAcceptOffer = async (offerId: string) => {
    if (!currentUser) return;
    
    try {
      // Update the offer status to accepted
      const { error } = await supabase
        .from('tutor_offers')
        .update({ status: 'accepted' })
        .eq('id', offerId);
        
      if (error) throw error;
      
      toast({
        title: 'Offer Accepted',
        description: 'The tutor has been notified of your acceptance'
      });
      
      // Update local state
      setTutorOffers(offers => 
        offers.map(offer => 
          offer.id === offerId 
            ? { ...offer, status: 'accepted' } 
            : offer
        )
      );
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept the offer',
        variant: 'destructive'
      });
    }
  };
  
  const handleRejectOffer = async (offerId: string) => {
    if (!currentUser) return;
    
    try {
      // Update the offer status to rejected
      const { error } = await supabase
        .from('tutor_offers')
        .update({ status: 'rejected' })
        .eq('id', offerId);
        
      if (error) throw error;
      
      toast({
        title: 'Offer Rejected',
        description: 'The offer has been rejected'
      });
      
      // Update local state
      setTutorOffers(offers => offers.filter(offer => offer.id !== offerId));
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject the offer',
        variant: 'destructive'
      });
    }
  };
  
  const handleAddSuggestedSkill = async (skillName: string) => {
    if (!currentUser || !userProfile) return;
    
    try {
      // Add the suggested skill to the user's wanted skills
      const newSkill = {
        id: Date.now().toString(),
        name: skillName,
        category: 'Other',
        level: 'Beginner',
        progress: 'Not Started'
      };
      
      const updatedSkills = [...(userProfile.skillsWanted || []), newSkill];
      
      const { error } = await supabase
        .from('users')
        .update({ skillsWanted: updatedSkills })
        .eq('uid', currentUser.id);
        
      if (error) throw error;
      
      toast({
        title: 'Skill Added',
        description: `${skillName} has been added to your learning list!`
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding suggested skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to add suggested skill',
        variant: 'destructive'
      });
    }
  };
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-darkblack">Waiting List</h1>
          <p className="text-gray-600">Find tutors or improve your matching chances</p>
        </div>
        
        <Tabs defaultValue="offers">
          <TabsList className="mb-6">
            <TabsTrigger value="offers">Tutor Offers</TabsTrigger>
            <TabsTrigger value="suggestions">Skill Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="offers">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Available Tutors</CardTitle>
                <CardDescription>
                  These tutors can help you learn your desired skills
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLoadingOffers ? (
                  <div className="text-center py-8">Loading offers...</div>
                ) : tutorOffers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tutor offers available at the moment.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tutorOffers.map((offer) => (
                      <Card key={offer.id} className="bg-white">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{offer.tutorName}</h3>
                            <div className="text-lg font-bold text-skyblue">${offer.price}/hr</div>
                          </div>
                          
                          <div className="mb-3">
                            <span className="bg-skyblue text-white px-3 py-1 rounded-full text-sm">
                              {offer.skillOffered}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{offer.message}</p>
                          
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              className="text-red-500 border-red-500 hover:bg-red-50"
                              onClick={() => handleRejectOffer(offer.id)}
                            >
                              Reject
                            </Button>
                            <Button 
                              className="bg-skyblue hover:bg-skyblue-dark"
                              onClick={() => handleAcceptOffer(offer.id)}
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="suggestions">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Suggested Skills</CardTitle>
                <CardDescription>
                  Adding these popular skills may increase your matching chances
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {suggestedSkills.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No skill suggestions available at the moment.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestedSkills.map((skill) => (
                      <Card key={skill} className="bg-white">
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">{skill}</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            This is a popular skill with many potential teachers.
                          </p>
                          <Button 
                            className="w-full bg-skyblue hover:bg-skyblue-dark"
                            onClick={() => handleAddSuggestedSkill(skill)}
                          >
                            Add to My Learning List
                          </Button>
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
    </div>
  );
};

export default WaitingList;
