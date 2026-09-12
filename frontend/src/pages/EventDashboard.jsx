import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from "recharts";

const EventDashboard = () => {

    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, getAccessToken } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    const [acceptedApps, setAcceptedApps] = useState([]);

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
            const eventResponse = response.data;
            setEvent(eventResponse);
            setAcceptedApps(eventResponse.applications.filter((app) => app.status === 'ACCEPTED'));
            console.log(response.data)
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


    const ApplicationsTable = ({ applications }) => {
        const [selectedApp, setSelectedApp] = useState(null);
        const handleAccept = async () => {
            console.log(selectedApp)
            const token = await getAccessToken();
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/events/${id}/application`,
                {...selectedApp, status: "ACCEPTED"},
                { 
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true 
                }
            );
            console.log(response.data);
            selectedApp.status = 'ACCEPTED'
            console.log(`Application ${selectedApp.id} Accepted`);
            setAcceptedApps([...acceptedApps, selectedApp]);
            setSelectedApp(null);
        };
      
        const handleReject = async () => {
            selectedApp.status = "REJECTED";
            const token = await getAccessToken();
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/events/${id}/application`,
                {...selectedApp, status: "REJECTED"},
                { 
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true 
                }
            );
            selectedApp.status = 'REJECTED'
            console.log(response.data);
            console.log(`Application ${selectedApp.id} Rejected`);
            setSelectedApp(null);
        };
      
        return (
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="w-full border-collapse bg-white shadow-md rounded-lg">
              {/* Table Headers */}
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Applicant Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Team</th>
                  <th className="px-6 py-4 text-left font-semibold">Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
      
              {/* Table Body */}
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b hover:bg-gray-100 even:bg-gray-50 cursor-pointer transition duration-200"
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="px-6 py-4 text-gray-800">
                      {app.userData.firstName + " " + app.userData.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{app.team ? app.team.name : "N/A"}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className={`px-6 py-4 font-medium ${
                        app.status === "ACCEPTED"
                          ? "text-green-600"
                          : app.status === "PENDING"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {app.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      
            {/* Popup Modal */}
            {selectedApp && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
                <div className="bg-white p-8 w-[500px] md:w-[600px] lg:w-[700px] rounded-xl shadow-2xl relative">
                  {/* Back Button */}
                  <button
                    className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 transition"
                    onClick={() => setSelectedApp(null)}
                  >
                    <ArrowLeft size={28} />
                  </button>
      
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                    Application Details
                  </h2>
      
                  <div className="space-y-4">
                    <p className="text-lg">
                      <span className="font-semibold text-gray-700">Name:</span> {selectedApp.userData.firstName}{" "}
                      {selectedApp.userData.lastName}
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold text-gray-700">Team:</span>{" "}
                      {selectedApp.team ? selectedApp.team.name : "N/A"}
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold text-gray-700">Date Applied:</span>{" "}
                      {new Date(selectedApp.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold text-gray-700">Status:</span>{" "}
                      <span
                        className={`font-semibold ${
                          selectedApp.status === "ACCEPTED"
                            ? "text-green-600"
                            : selectedApp.status === "PENDING"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedApp.status}
                      </span>
                    </p>
                  </div>
      
                  {/* Action Buttons */}
                  <div className="mt-8 flex justify-center gap-6">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md"
                      onClick={handleAccept}
                    >
                      Accept
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md"
                      onClick={handleReject}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      };

    const AcceptedTable = ({ applications }) => {
        
        return (
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="w-full border-collapse bg-white shadow-md rounded-lg">
              {/* Table Headers */}
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Participant Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Team</th>
                  <th className="px-6 py-4 text-left font-semibold">Date</th>
                </tr>
              </thead>
      
              {/* Table Body */}
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b hover:bg-gray-100 even:bg-gray-50 cursor-pointer transition duration-200"
                  >
                    <td className="px-6 py-4 text-gray-800">
                      {app.userData.firstName + " " + app.userData.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{app.team ? app.team.name : "N/A"}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      };


      const OverviewSection = ({ applications }) => {
        // Calculate Stats
        const totalApplications = applications.length;
        const accepted = applications.filter((app) => app.status === "ACCEPTED").length;
        const rejected = applications.filter((app) => app.status === "REJECTED").length;
        const pending = applications.filter((app) => app.status === "PENDING").length;
      
        // Pie Chart Data
        const statusData = [
          { name: "Accepted", value: accepted },
          { name: "Rejected", value: rejected },
          { name: "Pending", value: pending },
        ];
        const COLORS = ["#34D399", "#EF4444", "#FACC15"];
      
        // Applications Over Time (Line Chart)
        const applicationsOverTime = applications.reduce((acc, app) => {
          const date = new Date(app.createdAt).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        const lineChartData = Object.entries(applicationsOverTime).map(([date, count]) => ({ date, count }));
      
        // Applicants by Team (Bar Chart)
        const teamData = applications.reduce((acc, app) => {
          const teamName = app.team ? app.team.name : "No Team";
          acc[teamName] = (acc[teamName] || 0) + 1;
          return acc;
        }, {});
        const barChartData = Object.entries(teamData).map(([team, count]) => ({ team, count }));
      
        return (
          <div className="p-8 bg-white shadow-lg rounded-lg">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-100 p-6 rounded-lg text-center shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Total Applications</h3>
                <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
              </div>
              <div className="bg-green-100 p-6 rounded-lg text-center shadow-md">
                <h3 className="text-lg font-semibold text-green-700">Accepted</h3>
                <p className="text-3xl font-bold text-green-600">{accepted}</p>
              </div>
              <div className="bg-red-100 p-6 rounded-lg text-center shadow-md">
                <h3 className="text-lg font-semibold text-red-700">Rejected</h3>
                <p className="text-3xl font-bold text-red-600">{rejected}</p>
              </div>
            </div>
      
            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pie Chart for Application Status */}
              <div className="bg-white p-6 shadow-md rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
      
              {/* Line Chart for Applications Over Time */}
              <div className="bg-white p-6 shadow-md rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Applications Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <XAxis dataKey="date" stroke="#555" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
      
            {/* Bar Chart for Applicants by Team */}
            <div className="bg-white p-6 shadow-md rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Applicants by Team</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="team" stroke="#555" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      };
      
      
      

    return (
        <>
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{event.name}</h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">{event.tagline}</p>
                </div>

                <div className="sticky top-16 px-6 py-4 mt-8 flex justify-center items-center space-x-4 w-auto">
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
                            activeSection === 'review'
                                ? 'bg-black text-white'
                                : 'bg-gray-200 text-black hover:bg-blue-200 hover:text-gray-800'
                            }`}
                            onClick={() => handleSectionChange('review')}
                        >
                            Review
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg transition ${
                            activeSection === 'admin'
                                ? 'bg-black text-white'
                                : 'bg-gray-200 text-black hover:bg-blue-200 hover:text-gray-800'
                            }`}
                            onClick={() => handleSectionChange('admin')}
                        >
                            Admin
                        </button>
                    </nav>
                </div>

                {activeSection === 'overview' && (
                    <div>
                        {event.applications.length ?
                            <div>
                                <OverviewSection applications={event.applications} />
                            </div>
                            :
                            <p>Theres nothing to visualise :/</p>
                        }
                    </div>
                )}

                {activeSection === 'review' && (
                    <div>
                        {event.applications.length ?
                            <div>
                                <div className='mb-4 font-semibold text-lg'>Number of Applications : {event.applications.length}</div>
                                <ApplicationsTable applications={event.applications} />
                            </div>
                            :
                            <p>Applications not found!</p> 
                        }
                    </div>
                )}

                {activeSection === 'admin' && (
                    <div>
                        {acceptedApps.length ?
                            <div>
                                <div className='mb-4 font-semibold text-lg'>Number of Participants : {acceptedApps.length}</div>
                                <AcceptedTable applications={acceptedApps} />
                            </div>
                            
                            :
                            <p>Go Accept Some Applicants!</p> 
                        }
                    </div>
                )}  
            </div>
        </>
    )
}

export default EventDashboard