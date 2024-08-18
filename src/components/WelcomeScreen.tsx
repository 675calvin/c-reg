import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Clock, BarChart2 } from 'lucide-react';

const WelcomeScreen: React.FC = () => (
  <div className="welcome-screen p-8 max-w-4xl mx-auto">
    <h1 className="text-4xl font-bold mb-6 text-center text-indigo-700">Welcome to CorrespondTrack</h1>
    <p className="text-xl mb-8 text-center text-gray-600">
      Streamline your correspondence management with CorrespondTrack. 
      Stay organized, track progress, and never miss an important communication.
    </p>

    <div className="grid md:grid-cols-3 gap-8 mb-12">
      <FeatureCard 
        icon={<Mail className="w-12 h-12 text-indigo-500" />}
        title="Centralized Inbox"
        description="Manage all your correspondence in one place, from emails to formal letters."
      />
      <FeatureCard 
        icon={<Clock className="w-12 h-12 text-indigo-500" />}
        title="Status Tracking"
        description="Keep tabs on the status of each correspondence, from draft to completion."
      />
      <FeatureCard 
        icon={<BarChart2 className="w-12 h-12 text-indigo-500" />}
        title="Insightful Analytics"
        description="Gain valuable insights into your communication patterns and response times."
      />
    </div>

    <div className="text-center">
      <Link 
        to="/signin" 
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition duration-300"
      >
        Get Started
      </Link>
      <p className="mt-4 text-gray-600">
        Already have an account? <Link to="/signin" className="text-indigo-600 hover:underline">Sign in</Link>
      </p>
    </div>
  </div>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="feature-card bg-white p-6 rounded-lg shadow-md text-center">
    <div className="mb-4 flex justify-center">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default WelcomeScreen;