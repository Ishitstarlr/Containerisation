import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import eventsAPI from '../services/eventsAPI';

const [formData, setFormData] = useState({
  name: '',
  type: '',
  tagline: '',
  about: '',
  maxParticipants: 5,
  minTeamSize: 1,
  maxTeamSize: 4,
  mode: 'ONLINE',
  status: 'DRAFT',
  customQuestions: [], // Initialize as empty array
  timeline: {
    eventStart: '',
    eventEnd: '',
    applicationsStart: '',
    applicationsEnd: '',
    rsvpDaysBeforeDeadline: 7
  },
  links: {
    websiteUrl: '',
    micrositeUrl: '',
    contactEmail: '',
    socialLinks: {}
  },
  branding: {
    logoUrl: '',
    coverUrl: '',
    brandColor: ''
  }
});

const handleAddQuestion = () => {
  setFormData(prev => ({
    ...prev,
    customQuestions: Array.isArray(prev.customQuestions) 
      ? [...prev.customQuestions, { question: '', required: false }]
      : [{ question: '', required: false }]
  }));
};

const handleQuestionChange = (index, field, value) => {
  setFormData(prev => {
    const questions = Array.isArray(prev.customQuestions) ? [...prev.customQuestions] : [];
    questions[index] = { ...questions[index], [field]: value };
    return { ...prev, customQuestions: questions };
  });
};

const handleRemoveQuestion = (index) => {
  setFormData(prev => ({
    ...prev,
    customQuestions: prev.customQuestions.filter((_, i) => i !== index)
  }));
};

const handleSaveAsDraft = async (e) => {
  e.preventDefault();
  try {
    const eventData = {
      ...formData,
      status: 'DRAFT' // Explicitly set status to DRAFT
    };
    
    if (eventId) {
      await eventsAPI.updateEvent(eventId, eventData);
      toast.success('Event saved as draft');
    } else {
      const response = await eventsAPI.createEvent(eventData);
      toast.success('Event created as draft');
      navigate(`/events/${response.id}`);
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    toast.error('Failed to save draft');
  }
};

// And in your submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const eventData = {
      ...formData,
      status: 'PUBLISHED' // Explicitly set status to PUBLISHED
    };
    
    if (eventId) {
      await eventsAPI.updateEvent(eventId, eventData);
      toast.success('Event updated successfully');
    } else {
      const response = await eventsAPI.createEvent(eventData);
      toast.success('Event created successfully');
      navigate(`/events/${response.id}`);
    }
  } catch (error) {
    console.error('Error saving event:', error);
    toast.error('Failed to save event');
  }
}; 