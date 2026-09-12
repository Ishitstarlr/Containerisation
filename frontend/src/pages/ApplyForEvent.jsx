import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AlertDialog from "../components/AlertDialog";

const ApplyForEvent = () => {
  const { getAccessToken } = useAuth();
  const { id } = useParams(); // Get eventId from the URL
  const [event, setEvent] = useState(null); // Store event details
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Loading state
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    country: "",
    gender: "",
    tShirtSize: "",
    degree: "",
    branch: "",
    graduationYear: "",
    company: "",
    position: "",
    profiles: "",
    contactNumber: "",
    email: ""
  });
  const [error, setError] = useState(null); 
  const [activeTab, setActiveTab] = useState(1);
  const [questions, setQuestions] = useState([]); 
  const [responses, setResponses] = useState({}); 
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamHash, setTeamHash] = useState('');
  const [joinHash, setJoinHash] = useState('');
  const [teamCreated, setTeamCreated] = useState(false);
  const [teamDetails, setTeamDetails] = useState({
    name: '',
    hash: '',
    isShowing: false
  });
  const [mode, setMode] = useState('create');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Fetch event details when component mounts
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/${id}`);
        setEvent(response.data); // Store event data
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to fetch event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  // auto fills the basic
  useEffect(() => {
    if (event?.createdBy?.profile) {
      setUserData({
        firstName: event.createdBy.profile.firstName || "",
        lastName: event.createdBy.profile.lastName || "",
        city: event.createdBy.profile.city || "",
        country: event.createdBy.profile.country || "",
        gender: event.createdBy.profile.gender?.toLowerCase() || "", 

      });
    }
  }, [event]);

  useEffect(() => {
    const fetchCustomQuestions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/${id}/custom-questions`);
        setQuestions(response.data); // Store custom questions
      } catch (err) {
        console.error("Error fetching custom questions:", err);
        setError("Failed to fetch custom questions");
      }
    };

    fetchCustomQuestions();
  }, [id]);

  const handleInputChange = (index, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [index]: value, // Store user response with index as key
    }));
  };


  const handleCheckboxChange = (index, option) => {
    setResponses((prevResponses) => {
      const selectedOptions = prevResponses[index] || []; // Get existing selected checkboxes
      if (selectedOptions.includes(option)) {
        return { ...prevResponses, [index]: selectedOptions.filter((o) => o !== option) }; // Remove if unchecked
      } else {
        return { ...prevResponses, [index]: [...selectedOptions, option] }; // Add if checked
      }
    });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessToken();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/teams`,
        {
          eventId: id,
          name: teamName
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setTeamHash(response.data.hashCode);
      alert(`Team created! Share this code with team members: ${response.data.hashCode}`);
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    }
  };


  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate required fields
    if (!userData.firstName || !userData.lastName || !userData.city || !userData.country || !userData.gender) {
      setErrorMessage('Please fill in all required fields.');
      setIsDialogOpen(true);
      return;
    }

    if(mode === 'join' && teamDetails.hash === ''){
      setErrorMessage('Enter the team hash to join an existing team');
      setIsDialogOpen(true);
      return;
    }
  
      // Now submit the application with team details
      const formData = {
        userData: {
          ...userData,
          tShirtSize: userData.tShirtSize || null,
          degree: userData.degree || null,
          branch: userData.branch || null,
          graduationYear: userData.graduationYear || null,
          company: userData.company || null,
          position: userData.position || null,
          profiles: userData.profiles || null,
          email: userData.email || null,
          contactNumber: userData.contactNumber || null
        },
        responses: responses,
        team: teamCreated ? teamDetails : null,
        mode
      };

      try {
        const token = await getAccessToken();
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/events/${id}/apply`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );
        navigate('/events');
        console.log("Response from backend:", response.data);
        alert("Application submitted successfully!");
      } catch (error) {
        console.error('Error:', error.response?.data);
        
        // Handle profile incomplete error specifically
        if (error.response?.data?.isProfileIncomplete) {
          setErrorMessage(
            "Your profile is incomplete. Please complete your profile information before applying for this event."
          );
          setIsDialogOpen(true);
          
          // Add a redirect button in the dialog
          setTimeout(() => {
            navigate('/profile');
          }, 3000); // Redirect after 3 seconds
        } else {
          // Handle other errors
          setErrorMessage(error.response?.data?.error || 'An unexpected error occurred.');
          setIsDialogOpen(true);
        }
      }
    };

  // Loading state
  if (loading) return <p>Loading event details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6 mt-16">
      {/* Event Title */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Apply for Event: {event?.name}
      </h1>

      <AlertDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        onConfirm={() => {
          // If it's a profile error, redirect to profile
          if (errorMessage.includes("profile is incomplete")) {
            navigate('/profile');
          }
          handleClose();
        }}
        title={errorMessage.includes("profile is incomplete") ? "Profile Incomplete" : "Alert"}
        message={errorMessage}
        confirmText={errorMessage.includes("profile is incomplete") ? "Go to Profile" : "OK"}
        cancelText="Close"
      />

      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        {[
          "Personal Details",
          "Team Info (YET TO BE ADDED AND CODED)",
          "Event Questions",
        ].map((tab, index) => (
          <button
            key={index}
            className={`flex-1 py-2 text-center text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === index + 1
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-indigo-600"
            }`}
            onClick={() => setActiveTab(index + 1)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {activeTab === 1 && (
          <>
            {/* Personal Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                placeholder="Enter your first name"
                value={userData.firstName || ""}
                onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                placeholder="Enter your last name"
                value={userData.lastName || ""}
                onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                value={userData.gender} // Auto-fill value
                onChange={(e) => setUserData({ ...userData, gender: e.target.value })} // Allow updates
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                placeholder="Enter city of residence"
                value={userData.city || ""}
                onChange={(e) => setUserData({ ...userData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                placeholder="Enter country of residence"
                value={userData.country || ""}
                onChange={(e) => setUserData({ ...userData, country: e.target.value })}
              />
            </div>

            {/* Form Fields for Required Details */}
            {event.applicationForm.tShirtSizeRequired && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">T-Shirt Size *</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  value={userData.tShirtSize || ""}
                  onChange={(e) => setUserData({ ...userData, tShirtSize: e.target.value })} // Changed from handleFormChange
                >
                  <option value="">Select Size</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
            )}

            {/* Form Fields for Education Details */}
            {event.applicationForm.educationRequired && (
              <h1>EDUCATION DETAILS</h1>
            )}
            {event.applicationForm.educationRequired && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree Type *</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  value={userData.degree || ""} // Added value prop
                  onChange={(e) => setUserData({ ...userData, degree: e.target.value })}
                >
                  <option value="">Select Size</option>
                  <option value="BTech">Btech</option>
                  <option value="MTech">MTech</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>

                <label className="block text-sm font-medium text-gray-700 mb-1">Branch / Field of Study</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter branch / field of study"
                  value={userData.branch || ""} 
                  onChange={(e) => setUserData({ ...userData, branch: e.target.value })}
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year *</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Graduation Year"
                  value={userData.graduationYear || ""}
                  onChange={(e) => setUserData({ ...userData, graduationYear: e.target.value })}
                />
              </div>
            )}

            {/* Form Fields for Experience Details */}
            {event.applicationForm.experienceRequired && (
              <h1>EXPERIENCE DETAILS</h1>
            )}
            {event.applicationForm.experienceRequired && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter current working company name"
                  value={userData.company || ""}
                  onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                  />
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter current working company name"
                  value={userData.position || ""}
                  onChange={(e) => setUserData({ ...userData, position: e.target.value })}
                  />
              </div>
            )}

            {event.applicationForm.profilesRequired && (
              <h1>PROFILES</h1>
            )}
            {event.applicationForm.profilesRequired && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profiles (LinkedIn, GitHub, etc.) *</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter your profiles (LinkedIn, GitHub, etc.)"
                  value={userData.profiles || ""}
                  onChange={(e) => setUserData({ ...userData, profiles: e.target.value })}
                  ></textarea>
              </div>
            )}

            {event.applicationForm.contactRequired && (
              <h1>CONTACT DETAILS</h1>
            )}
            {event.applicationForm.contactRequired && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter phone number"
                  value={userData.contactNumber || ""}
                  onChange={(e) => setUserData({ ...userData, contactNumber: e.target.value })}
                  />
                <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter email ID"
                  value={userData.email || ""}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  />
              </div>
            )}
          </>
        )}

        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {setShowCreateTeam(true); setShowJoinTeam(false); setMode('create');}}     
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Create Team
              </button>
              <button
                type="button"
                onClick={() => {setShowJoinTeam(true); setShowCreateTeam(false); setMode('join');}}     
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Join Team
              </button>
            </div>

            {showCreateTeam && (
              <div className="mt-4 p-4 border rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Create New Team</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team Name</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="mt-1 w-full p-2 border rounded-md"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      const hash = Math.random().toString(36).substring(2, 5).toUpperCase() + Date.now().toString(36).substring(-3).toUpperCase();
                      setTeamDetails({
                        name: teamName,
                        hash: hash,
                        isShowing: true
                      });
                      setTeamCreated(true);
                      setErrorMessage(`Share the following team code with your teammates : ${hash}`);
                      setIsDialogOpen(true);
                    }}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Generate Team Code
                  </button>
                </div>
              </div>
            )}

            {teamDetails.isShowing && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800">Team Details:</h3>
                <p className="mt-2">Team Name: <span className="font-medium">{teamDetails.name}</span></p>
                <p className="mt-1">Team Code: <span className="font-mono font-bold">{teamDetails.hash}</span></p>
                <button 
                  onClick={() => {
                    setTeamDetails({ name: '', hash: '', isShowing: false });
                    setTeamName('');
                    setTeamCreated(false); 
                  }}
                  className="mt-4 px-4 py-2 text-sm text-red-600 hover:text-red-700"
                >
                  Clear Team Details
                </button>
              </div>
            )}

            {showJoinTeam && (
              <div className="mt-4 p-4 border rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Join Existing Team</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team Code</label>
                    <input
                      type="text"
                      value={joinHash}
                      onChange={(e) => setJoinHash(e.target.value)}
                      className="mt-1 w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <button type="button"
                    onClick={() => {
                    setTeamDetails({ name: '', hash: joinHash, isShowing: false });
                    setTeamName('');
                    setTeamCreated(true); 
                    }} 
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    Save Team Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
            
        {activeTab === 3 && (
          <>
            {questions.map((q, index) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {q.questionText} {q.isRequired && <span className="text-red-500">*</span>}
                </label>

                {q.questionType === "TEXT" && (
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                    placeholder="Enter your response"
                    value={responses[index] || ""}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                )}

                {q.questionType === "NUMBER" && (
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                    placeholder="Enter a number"
                    value={responses[index] || ""}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                )}

                {q.questionType === "ENUM" && (
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                    value={responses[index] || ""}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  >
                    <option value="">Select an option</option>
                    {q.options.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {q.questionType === "CHECKBOX" && (
                  <div>
                    {q.options.map((option, i) => (
                      <label key={i} className="block">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={responses[index]?.includes(option) || false}
                          onChange={() => handleCheckboxChange(index, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ApplyForEvent;
