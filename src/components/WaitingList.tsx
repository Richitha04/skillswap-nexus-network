import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { mockWaitingList } from '../lib/mockData';

interface WaitingUser {
  id: string;
  name: string;
  skillToLearn: string;
  skillToTeach: string;
  registeredAt: string;
  type: 'tutor' | 'learner';
}

export function WaitingList() {
  const [users, setUsers] = useState<WaitingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'skill'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'tutor' | 'learner'>('all');

  useEffect(() => {
    fetchWaitingList();
  }, []);

  const fetchWaitingList = async () => {
    try {
      // In a real app, this would be an API call
      // const response = await axios.get('/api/waiting-list');
      // setUsers(response.data);
      
      // For now, using mock data
      setUsers(mockWaitingList);
    } catch (error) {
      console.error('Error fetching waiting list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (type: 'date' | 'name' | 'skill') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.skillToLearn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.skillToTeach.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || user.type === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'date':
          return multiplier * (new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'skill':
          return multiplier * (a.skillToLearn || a.skillToTeach).localeCompare(b.skillToLearn || b.skillToTeach);
        default:
          return 0;
      }
    });

  const handleSendInvite = async (userId: string) => {
    try {
      await axios.post(`/api/waiting-list/${userId}/invite`);
      // You might want to show a success toast here
    } catch (error) {
      console.error('Error sending invite:', error);
      // You might want to show an error toast here
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900">Waiting List</h1>
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <Input
              placeholder="Search by name or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterType} onValueChange={(value: 'all' | 'tutor' | 'learner') => setFilterType(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="tutor">Tutors</SelectItem>
                <SelectItem value="learner">Learners</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: 'date' | 'name' | 'skill') => handleSort(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="skill">Skill</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAndSortedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users in waiting list
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Wants to Learn</TableHead>
                  <TableHead>Can Teach</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <Badge variant={user.type === 'tutor' ? 'default' : 'secondary'}>
                        {user.type === 'tutor' ? 'Tutor' : 'Learner'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.skillToLearn === 'None' ? '-' : user.skillToLearn}</TableCell>
                    <TableCell>{user.skillToTeach === 'None' ? '-' : user.skillToTeach}</TableCell>
                    <TableCell>{format(new Date(user.registeredAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendInvite(user.id)}
                        className="text-[#00BFFF] hover:text-[#00BFFF] hover:bg-[#00BFFF]/10"
                      >
                        Send Invite
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
} 