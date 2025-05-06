
import React from 'react';
import { Skill } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SkillTagProps {
  skill: Skill;
  showLevel?: boolean;
  showProgress?: boolean;
  className?: string;
}

const SkillTag: React.FC<SkillTagProps> = ({ 
  skill, 
  showLevel = false, 
  showProgress = false,
  className 
}) => {
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Beginner': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Expert': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getProgressColor = (progress: string) => {
    switch(progress) {
      case 'Not Started': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'In Progress': return 'bg-skyblue text-white hover:bg-skyblue-dark';
      case 'Mastered': return 'bg-green-500 text-white hover:bg-green-600';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Badge variant="outline" className="bg-darkblack text-white">
        {skill.name}
      </Badge>
      
      {showLevel && (
        <Badge className={getLevelColor(skill.level)}>
          {skill.level}
        </Badge>
      )}
      
      {showProgress && (
        <Badge className={getProgressColor(skill.progress)}>
          {skill.progress}
        </Badge>
      )}
    </div>
  );
};

export default SkillTag;
