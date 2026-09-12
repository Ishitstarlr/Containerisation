import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const About = () => {
  const { user } = useAuth();

  const showOnboardingButton = user && user.isProfileIncomplete;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {/* About content */}
      
      {showOnboardingButton && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <p className="text-gray-600">Complete your profile to get the most out of Orbis</p>
            <Link
              to="/onboarding"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Complete Onboarding
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default About; 