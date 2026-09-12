import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EventForm from './EventForm';
import axios from 'axios';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user, getAccessToken } = useAuth();

  const localFormData = {
    name: '',
    tagline: '',
    about: '',
    type: 'HACKATHON',
    maxParticipants: 5,
    minTeamSize: 1,
    maxTeamSize: 4,
    mode: 'ONLINE',
    status: '',
    eventTimeline: {
      eventStart: '',
      eventEnd: '',
      applicationsStart: '',
      applicationsEnd: '',
      rsvpDaysBeforeDeadline: 7
    },
    eventLinks: [{
      websiteUrl: '',
      micrositeUrl: '',
      contactEmail: '',
      codeOfConductUrl: '',
      socialLinks: {},
    }],
    eventBranding: {
      brandColor: '#000000', 
      logoImage: null,      
      coverImage: null,    
      faviconImage: null 
    },
    tracks: [],
    sponsors: [],
    eventPeople: []
  };


  const [event, setEvent] = useState(localFormData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = await getAccessToken();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/events/autosave`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true
          }
        );
        
        const eventData = response.data;

        if (eventData.timeline) {
          eventData.eventTimeline = {
            eventStart: eventData.timeline.eventStart.split('.')[0] || '',
            eventEnd: eventData.timeline.eventEnd.split('.')[0] || '',
            applicationsStart: eventData.timeline.applicationsStart.split('.')[0] || '',
            applicationsEnd: eventData.timeline.applicationsEnd.split('.')[0] || '',
            rsvpDaysBeforeDeadline: eventData.timeline.rsvpDaysBeforeDeadline
          };
        }

        if (!eventData.eventLinks) {
          eventData.eventLinks = [{
            websiteUrl: '',
            micrositeUrl: '',
            contactEmail: '',
            codeOfConductUrl: '',
            socialLinks: null,
          }];
        }

        setEvent(eventData);

      } catch (err) {
        console.log('Error fetching event', err.status);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, []);   

  const apiCall = async (payload) => {
    try {
      // Get fresh token
      const token = await getAccessToken();
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data) {
        if(payload.status !== 'AUTOSAVE')
        navigate(`/events/${response.data.id}`);
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error.response?.data || error);
      throw new Error(error.response?.data?.error || 'Internal server error');
    }
  };
  
  if (loading) return <div>Loading...</div>;

  return (
    <EventForm
      mode={1} // create mode
      localFormData= {event} 
      apiCall={apiCall}
    />
  );
};

export default CreateEvent;

