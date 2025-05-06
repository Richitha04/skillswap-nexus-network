
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '../supabase/config';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock } from 'lucide-react';

interface TimeSlot {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  recurring: boolean;
}

const timeOptions = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

const Availability: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [recurring, setRecurring] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, isLoading, navigate]);
  
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('availability')
          .select('*')
          .eq('userId', currentUser.id);
          
        if (error) throw error;
        
        setTimeSlots(data as TimeSlot[]);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your availability',
          variant: 'destructive'
        });
      }
    };
    
    fetchTimeSlots();
  }, [currentUser, toast]);
  
  const validateTimeRange = () => {
    const start = parseInt(startTime.replace(':', ''));
    const end = parseInt(endTime.replace(':', ''));
    return start < end;
  };
  
  const handleAddTimeSlot = async () => {
    if (!currentUser || !date) return;
    
    if (!validateTimeRange()) {
      toast({
        title: 'Invalid Time Range',
        description: 'End time must be after start time',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newTimeSlot = {
        userId: currentUser.id,
        date: format(date, 'yyyy-MM-dd'),
        startTime,
        endTime,
        recurring
      };
      
      const { data, error } = await supabase
        .from('availability')
        .insert(newTimeSlot)
        .select();
        
      if (error) throw error;
      
      setTimeSlots([...timeSlots, data[0] as TimeSlot]);
      
      toast({
        title: 'Availability Added',
        description: 'Your availability has been added successfully'
      });
      
      // Reset form
      setDate(new Date());
      setStartTime('09:00');
      setEndTime('10:00');
      setRecurring(false);
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast({
        title: 'Error',
        description: 'Failed to add availability',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteTimeSlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTimeSlots(timeSlots.filter(slot => slot.id !== id));
      
      toast({
        title: 'Availability Removed',
        description: 'The time slot has been removed'
      });
    } catch (error) {
      console.error('Error removing time slot:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove availability',
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
          <h1 className="text-3xl font-bold text-darkblack">Availability Scheduler</h1>
          <p className="text-gray-600">Set your available times for skill exchanges</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Add Availability</CardTitle>
              <CardDescription>
                Add times when you're available for skill exchanges
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Date</label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      disabled={(d) => d < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.slice(0, -1).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.slice(1).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="recurring" className="text-sm font-medium">
                  Repeat weekly
                </label>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button
                className="w-full bg-skyblue hover:bg-skyblue-dark"
                onClick={handleAddTimeSlot}
                disabled={isSubmitting || !date}
              >
                {isSubmitting ? 'Adding...' : 'Add Availability'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Your Schedule</CardTitle>
              <CardDescription>
                Your upcoming available time slots
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {timeSlots.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No availability set yet. Add some time slots to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {timeSlots.map((slot) => (
                    <Card key={slot.id} className="bg-white">
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{slot.date}</h3>
                            <div className="flex items-center text-gray-600 mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{slot.startTime} - {slot.endTime}</span>
                              {slot.recurring && (
                                <span className="ml-2 bg-skyblue/10 text-skyblue px-2 py-0.5 rounded text-xs">
                                  Weekly
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteTimeSlot(slot.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Availability;
