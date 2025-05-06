import React from 'react';

// Types for our match data
interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface Match {
  id: string;
  name: string;
  skillsOffered: Skill[];
  skillsRequested: Skill[];
  status: 'active' | 'pending' | 'suggested';
}

// Dummy data for demonstration
const dummyMatches: Match[] = [
  {
    id: '1',
    name: 'John Doe',
    skillsOffered: [
      { id: 's1', name: 'JavaScript', level: 'advanced' },
      { id: 's2', name: 'React', level: 'intermediate' }
    ],
    skillsRequested: [
      { id: 's3', name: 'Python', level: 'beginner' },
      { id: 's4', name: 'Data Analysis', level: 'intermediate' }
    ],
    status: 'active'
  },
  {
    id: '2',
    name: 'Jane Smith',
    skillsOffered: [
      { id: 's5', name: 'UI/UX Design', level: 'advanced' },
      { id: 's6', name: 'Figma', level: 'intermediate' }
    ],
    skillsRequested: [
      { id: 's7', name: 'Web Development', level: 'beginner' }
    ],
    status: 'pending'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    skillsOffered: [
      { id: 's8', name: 'Python', level: 'advanced' },
      { id: 's9', name: 'Machine Learning', level: 'intermediate' }
    ],
    skillsRequested: [
      { id: 's10', name: 'React', level: 'beginner' }
    ],
    status: 'suggested'
  }
];

const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-100">
      <h3 className="text-xl font-semibold mb-4">{match.name}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Skills Offered</h4>
          <ul className="space-y-2">
            {match.skillsOffered.map(skill => (
              <li key={skill.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-gray-800">{skill.name}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  skill.level === 'advanced' ? 'bg-green-100 text-green-800' :
                  skill.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {skill.level}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Skills Requested</h4>
          <ul className="space-y-2">
            {match.skillsRequested.map(skill => (
              <li key={skill.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-gray-800">{skill.name}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  skill.level === 'advanced' ? 'bg-green-100 text-green-800' :
                  skill.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {skill.level}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
  <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
    Schedule Session
  </button>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
    Message
  </button>
</div>

    </div>
  );
};

const Matches: React.FC = () => {
  const activeMatches = dummyMatches.filter(match => match.status === 'active');
  const pendingMatches = dummyMatches.filter(match => match.status === 'pending');
  const suggestedMatches = dummyMatches.filter(match => match.status === 'suggested');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Matches</h1>
      
      {/* Active Matches Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Active Matches</h2>
        <div className="space-y-4">
          {activeMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
          {activeMatches.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No active matches found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Pending Requests Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
        <div className="space-y-4">
          {pendingMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
          {pendingMatches.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No pending requests.</p>
            </div>
          )}
        </div>
      </section>

      {/* Suggested Matches Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Suggested Matches</h2>
        <div className="space-y-4">
          {suggestedMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
          {suggestedMatches.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No suggested matches available.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Matches; 