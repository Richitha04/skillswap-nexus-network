
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-darkblack text-white py-20 flex-grow flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Share Your <span className="text-skyblue">Skills</span>,<br />
              Grow Your <span className="text-skyblue">Knowledge</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              A platform where learning becomes a collaborative exchange.
              Teach what you know, learn what you don't.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {currentUser ? (
                <Link to="/dashboard">
                  <Button className="bg-skyblue hover:bg-skyblue-dark text-white px-8 py-6 text-lg">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button className="bg-skyblue hover:bg-skyblue-dark text-white px-8 py-6 text-lg">
                      Join Now
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-darkblack px-8 py-6 text-lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-darkblack">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Share Your Skills",
                description: "Tell us what skills you can teach others. Whether it's coding, music, language or cooking - your knowledge is valuable.",
                icon: "🧠"
              },
              {
                title: "Find Your Match",
                description: "We'll connect you with people who want to learn what you teach, and can teach what you want to learn.",
                icon: "🤝"
              },
              {
                title: "Learn & Grow Together",
                description: "Schedule sessions, exchange knowledge, and track your progress as you master new skills.",
                icon: "📈"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-darkblack">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-skyblue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Skill Exchange Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of learners and teachers today. Share what you know, discover what you don't.
          </p>
          
          {!currentUser && (
            <Link to="/signup">
              <Button className="bg-white text-skyblue hover:bg-gray-100 px-8 py-6 text-lg">
                Get Started For Free
              </Button>
            </Link>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-darkblack text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-skyblue mb-2">SkillSwap</p>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} SkillSwap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
