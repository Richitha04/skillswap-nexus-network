
import React from 'react';
import { Skill } from '@/contexts/AuthContext';
import SkillTag from './SkillTag';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash } from 'lucide-react';

interface SkillListProps {
  skills: Skill[];
  title: string;
  emptyMessage: string;
  onAddSkill?: () => void;
  onEditSkill?: (skill: Skill) => void;
  onDeleteSkill?: (skillId: string) => void;
  showControls?: boolean;
}

const SkillList: React.FC<SkillListProps> = ({
  skills,
  title,
  emptyMessage,
  onAddSkill,
  onEditSkill,
  onDeleteSkill,
  showControls = true
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-darkblack">{title}</h3>
        {showControls && onAddSkill && (
          <Button 
            onClick={onAddSkill} 
            variant="outline" 
            size="sm" 
            className="text-skyblue border-skyblue hover:bg-skyblue hover:text-white"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </div>
      
      {skills.length === 0 ? (
        <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {skills.map((skill) => (
            <li key={skill.id || skill.name} className="flex items-center justify-between">
              <SkillTag skill={skill} showLevel showProgress />
              
              {showControls && (
                <div className="flex space-x-2">
                  {onEditSkill && (
                    <Button 
                      onClick={() => onEditSkill(skill)} 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 hover:text-skyblue"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onDeleteSkill && skill.id && (
                    <Button 
                      onClick={() => onDeleteSkill(skill.id!)} 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SkillList;
