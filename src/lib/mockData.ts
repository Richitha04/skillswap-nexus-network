export interface TutorOffer {
  id: string;
  name: string;
  skillsToTeach: string[];
  experience: string;
  requirements: string[];
  availability: string[];
  rating?: number;
  bio: string;
}

export interface LearningRequest {
  id: string;
  name: string;
  skillsToLearn: string[];
  currentLevel: string;
  learningGoals: string[];
  preferredStyle: string;
  availability: string[];
}

// Populated with example data
export const mockTutorOffers: TutorOffer[] = [
  {
    id: "t1",
    name: "Vijayalakshmi",
    skillsToTeach: ["DBMS", "Cryptography"],
    experience: "Expert",
    requirements: ["Basic understanding of databases", "Basic programming knowledge"],
    availability: ["Saturday", "Sunday"],
    rating: 4.8,
    bio: "Experienced professional with expertise in Database Management Systems and Cryptography. Passionate about teaching and helping others understand complex concepts."
  }
];

export const mockLearningRequests: LearningRequest[] = [
  {
    id: "l1",
    name: "Rithanya",
    skillsToLearn: ["Cryptography"],
    currentLevel: "Beginner",
    learningGoals: ["Research and Development", "Practical implementation"],
    preferredStyle: "Offline",
    availability: ["Weekends"]
  }
];

// Combined data for the waiting list
export const mockWaitingList = [
  {
    id: "wl1",
    name: "Vijayalakshmi",
    skillToLearn: "None",
    skillToTeach: "DBMS, Cryptography",
    registeredAt: new Date().toISOString(),
    type: "tutor"
  },
  {
    id: "wl2",
    name: "Rithanya",
    skillToLearn: "Cryptography",
    skillToTeach: "None",
    registeredAt: new Date().toISOString(),
    type: "learner"
  }
]; 