import { useState, useEffect } from 'react';
import { eventsAPI } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (eventId) => {
    if (user?.isProfileIncomplete) {
      // Show modal or redirect to onboarding
      return;
    }

    try {
      await eventsAPI.joinEvent(eventId);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-lg shadow p-6 mb-6">
            {/* Event details */}
            <button
              onClick={() => handleApply(event.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={user?.isProfileIncomplete}
            >
              {user?.isProfileIncomplete ? 'Complete Profile to Apply' : 'Apply Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events; 