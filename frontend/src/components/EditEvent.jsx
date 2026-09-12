import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import EventForm from './EventForm';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/events/${id}`,
        { withCredentials: true }
      );
      
      const eventData = response.data;
      
      // Format dates for form inputs
      if (eventData.timeline) {
        eventData.eventTimeline = {
          eventStart: eventData.timeline.eventStart.split('.')[0],
          eventEnd: eventData.timeline.eventEnd.split('.')[0],
          applicationsStart: eventData.timeline.applicationsStart.split('.')[0],
          applicationsEnd: eventData.timeline.applicationsEnd.split('.')[0],
          rsvpDaysBeforeDeadline: eventData.timeline.rsvpDaysBeforeDeadline
        };
      }

      if (!eventData.eventLinks) {
        eventData.eventLinks = [{
          websiteUrl: eventData.links.websiteUrl,
          micrositeUrl: eventData.links.micrositeUrl,
          contactEmail: eventData.links.contactEmail,
          codeOfConductUrl: '',
          socialLinks: null,
        }];
      }

      eventData.eventBranding = {
        logoUrl: eventData.branding.logoUrl,
        coverUrl: eventData.branding.coverUrl,
        brandColor: eventData.branding.brandColor
      };

      setEvent(eventData);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const apiCall = async (payload) => {
    try {
      const token = await getAccessToken();
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/events/${id}`,
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
        navigate(`/events/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error(error.response?.data?.error || 'Failed to update event');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <EventForm
      mode={2} // edit mode
      localFormData={event}
      apiCall={apiCall}
    />
  );
};

export default EditEvent;
