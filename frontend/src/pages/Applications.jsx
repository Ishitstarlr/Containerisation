import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/applications');
      setApplications(response.data);
    } catch (err) {
      setError('Failed to fetch applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await api.put(`/api/applications/${applicationId}`, { status: newStatus });
      fetchApplications(); // Refresh the list
    } catch (err) {
      setError('Failed to update application status');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (user?.role !== 'organizer') {
    return <div className="text-center mt-8">You don't have permission to view applications.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Event Applications</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {applications.map((application) => (
            <li key={application.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{application.username}</h3>
                  <p className="text-sm text-gray-500">Applied on: {new Date(application.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">Current Status: {application.status}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'accepted')}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'rejected')}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'waitlisted')}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Waitlist
                  </button>
                </div>
              </div>
            </li>
          ))}
          {applications.length === 0 && (
            <li className="px-6 py-4 text-center text-gray-500">
              No applications found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Applications;
