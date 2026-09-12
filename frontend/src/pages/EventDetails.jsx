import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, getAccessToken } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview'); 
  const [appStatus, setAppStatus] = useState(null)

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/events/${id}`,
        { withCredentials: true }
      );
      setEvent(response.data);

      const token = await getAccessToken();
      const appResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/events/${id}/application`,
          { 
              headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              withCredentials: true 
          }
      );
      console.log(appResponse)
      const application = appResponse.data
      if(application) {
        console.log(application);
        setAppStatus(application.status);
      }
      
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          Event not found
        </div>
      </div>
    );
  }

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="bg-gray-100">
    <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{event.name}</h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">{event.tagline}</p>
      </div>

      <div className="bg-gray-100 sticky top-16 px-6 py-4 mt-8 flex justify-center items-center space-x-4 w-auto">
        <nav className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-lg transition ${
              activeSection === 'overview'
                ? 'bg-black text-white'
                : 'bg-gray-200 text-black hover:bg-blue-200 hover:text-gray-800'
            }`}
            onClick={() => handleSectionChange('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition ${
              activeSection === 'prizes'
                ? 'bg-black text-white'
                : 'bg-gray-200 text-black hover:bg-blue-200 hover:text-gray-800'
            }`}
            onClick={() => handleSectionChange('prizes')}
          >
            Prizes
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition ${
              activeSection === 'sponsors'
                ? 'bg-black text-white'
                : 'bg-gray-200 text-black hover:bg-blue-200 hover:text-gray-800'
            }`}
            onClick={() => handleSectionChange('sponsors')}
          >
            Sponsors
          </button>
        </nav>
      </div>

     
    
      <div className="mt-6 grid gap-8 lg:grid-cols-3 w-full">
      {activeSection === 'overview' && (
        <div className="lg:col-span-2 bg-gray-100 border border-gray-200 p-6 rounded-2xl shadow-sm">
        
          
            <div className="h-96 bg-gray-200 rounded-lg overflow-hidden mb-6">
              {event.branding?.coverUrl && (
                <img
                  src={event.branding.coverUrl}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">About the Event</h2>
              <p className="mt-4 text-gray-500">{event.about}</p>
            </div>
            <div className="flex">
              <div className="bg-white p-6 rounded-2xl mt-4 mr-4 w-1/2 shadow-sm">
                <div className="py-3 flex-col justify-between text-sm font-medium">
                  <dt className="text-gray-500 font-semibold text-base ">Type</dt>
                  <dd className="text-gray-900 text-lg mt-2">{event.type + ' (' + event.mode + ')'}</dd>
                </div>
              </div>  

              <div className="bg-white p-6 rounded-2xl mt-4 w-1/2 shadow-sm">
                <div className="py-3 flex-col justify-between text-sm font-medium">
                  <dt className="text-gray-500 font-semibold text-base ">Team Size</dt>
                  <dd className="text-gray-900 text-lg mt-2">{event.minTeamSize} - {event.maxTeamSize}</dd>
                </div>
              </div>
            </div>
           
        </div>
    
        )}
        {activeSection === 'prizes' && (
            <div className="lg:col-span-2 bg-gray-100 border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tracks & Prizes</h2>
              <div className="bg-white p-6 rounded-2xl shadow-sm"> 
              {event.tracks.map((track, index) => (
                <div key={index} className="mt-1">
                  <h3 className="text-xl font-semibold text-gray-700">{track.name}</h3>
                  <p className="mt-2 text-gray-500">{track.description}</p>
                  <div className="mt-4">
                    <h4 className="text-lg font-medium text-gray-600">Prizes:</h4>
                    {track.prizes.map((prize, prizeIndex) => (
                      <div key={prizeIndex} className="mt-2">
                        <h5 className="text-md font-semibold text-gray-700">{prize.title}</h5>
                        <p className="text-gray-500">{prize.description}</p>
                        <p className="text-gray-900 font-bold">₹{prize.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              </div>
            </div>
        )}

        {activeSection === 'sponsors' && (
            <div className="lg:col-span-2 bg-gray-100 border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sponsors</h2>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                {event.sponsors.map((sponsor, index) => (
                  <div key={index} className="mt-4 flex items-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-md"> 
                      <img src={sponsor.logoUrl} alt={`${sponsor.name} Logo`} className="w-12 h-12 mr-4" />
                    </div>
                    <div className="flex flex-col p-6 gap-8">
                      <h3 className="text-lg font-semibold text-gray-700">{sponsor.name}</h3>
                      <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="ml-4 text-blue-500">
                        Visit Website
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-6">Event Judges</h2>
              <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm">
              {event.eventPeople.map((person, index) => (
                <div key={index} className="mt-6 flex items-center">
                  {/* Profile Picture */}
                  <div className="w-32 h-32 bg-gray-200 rounded-md mb-19">
                    <img
                      src={person.imageUrl}
                      alt={`${person.name}'s Image`}
                      className="w-32 h-32 bg-gray-200 rounded-md"
                    />
                  </div>
                  {/* Name, Role, Bio */}
                  <div className="ml-6">
                    <h3 className="text-lg font-semibold text-gray-700">{person.name}</h3>
                    <p className="text-sm text-gray-500">{person.role}</p>
                    <p className="text-sm text-gray-500 mt-2">{person.bio}</p>

                    {/* LinkedIn URL */}
                    {person.linkedinUrl && (
                      <a
                        href={person.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 mt-2 inline-block"
                      >
                        LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>
              ))}
              </div>
            </div>

          )}


        <div className="sticky top-32 h-max">
          
          <div className="bg-white p-6 rounded-2xl mb-8 shadow-lg">
            <div className='flex justify-center'>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Timeline</h2>
            </div>
            

            <div className="relative">

              <div className="absolute top-4 left-1 right-1 h-20 w-[2px] bg-gray-300"></div>


                <div className="py-3 flex items-start text-sm font-medium relative">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mt-1 mr-4"></div>
                    <div>
                      <dt className="text-gray-500 font-semibold text-base">Event Start</dt>
                      <dd className="text-gray-900 text-lg">
                        {new Date(event.timeline.eventStart).toLocaleDateString('en-US', {
                        year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          timeZone: 'UTC',
                        })}{' '}
                        at{' '}
                        {new Date(event.timeline.eventStart).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'UTC',
                        })}
                      </dd>
                   </div>
                  </div>


                  <div className="py-3 flex items-start text-sm font-medium relative">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mt-1 mr-4"></div>
                    <div>
                      <dt className="text-gray-500 font-semibold text-base">Event End</dt>
                    <dd className="text-gray-900 text-lg">
                      {new Date(event.timeline.eventEnd).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC',
                        })}{' '}
                        at{' '}
                      {new Date(event.timeline.eventEnd).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'UTC',
                      })}
                    </dd>
                  </div>
              </div>
            </div>

            <div className="relative">

              <div className="absolute top-4 left-1 right-1 h-20 w-[2px] bg-gray-300"></div>


                <div className="py-3 flex items-start text-sm font-medium relative">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mt-1 mr-4"></div>
                    <div>
                      <dt className="text-gray-500 font-semibold text-base">Application Strat</dt>
                      <dd className="text-gray-900 text-lg">
                        {new Date(event.timeline.applicationsStart).toLocaleDateString('en-US', {
                        year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          timeZone: 'UTC',
                        })}{' '}
                        at{' '}
                        {new Date(event.timeline.applicationsStart).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'UTC',
                        })}
                      </dd>
                   </div>
                  </div>


                  <div className="py-3 flex items-start text-sm font-medium relative">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mt-1 mr-4"></div>
                  <div>
                    <dt className="text-gray-500 font-semibold text-base">Application End</dt>
                  <dd className="text-gray-900 text-lg">
                    {new Date(event.timeline.applicationsEnd).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC',
                      })}{' '}
                      at{' '}
                    {new Date(event.timeline.applicationsEnd).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'UTC',
                    })}
                  </dd>
                </div>
              </div>

              <div className="py-3 flex items-start text-sm font-medium relative">
                <div className="w-3 h-3 bg-gray-500 rounded-full mt-1 mr-4"></div>
                <div>
                  <dt className="text-gray-500 font-semibold text-base">RSVP Deadline</dt>
                  <dd className="text-gray-900 text-lg">
                    {event.timeline.rsvpDaysBeforeDeadline} days before event end
                  </dd>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-4">
                    {appStatus ?
                      <div
                      className={`px-6 py-3 font-medium ${
                        appStatus === "ACCEPTED"
                          ? "bg-green-600 text-white rounded-xl"
                          : appStatus === "PENDING"
                          ? "bg-yellow-600 text-white rounded-xl"
                          : "bg-red-600 text-white rounded-xl"
                      }`}
                    >
                      {appStatus}
                    </div>
                      :
                      <button   
                        className="btn-primary"
                        onClick={() => navigate(`/events/${event.id}/apply`)}
                      >
                        Apply now
                      </button>
                    }
            </div>
            
          </div>
        </div>
        
        <div>
          {user && user.role === 'participant' && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Join this Event</h2>
              <Link
                to={`/create-team?event=${event.id}`}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create or Join a Team
              </Link>
            </div>
          )}
          {user && user.role === 'organizer' && event.created_by === user.id && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Event</h2>
              <Link
                to={`/edit-event/${event.id}`}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Event
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};
export default EventDetails;

