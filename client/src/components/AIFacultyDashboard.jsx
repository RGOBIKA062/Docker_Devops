import React, { useState, useEffect } from 'react';
import { AlertCircle, Zap, TrendingUp, Brain, Search, MessageSquare } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

/**
 * AI-POWERED FACULTY DASHBOARD
 * Displays extraordinary features: Smart recommendations, predictions, analytics
 */

export default function AIFacultyDashboard({ facultyId }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [attendancePatterns, setAttendancePatterns] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [error, setError] = useState('');

  // Fetch smart recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/ai/smart-recommendations/${facultyId}`);
      setRecommendations(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance patterns
  const fetchAttendancePatterns = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/ai/attendance-patterns/${facultyId}`);
      setAttendancePatterns(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch attendance patterns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Perform semantic search
  const performSemanticSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await apiClient.get(`/ai/semantic-search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data.data.events);
      setError('');
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'recommendations') {
      fetchRecommendations();
    } else if (activeTab === 'analytics') {
      fetchAttendancePatterns();
    }
  }, [activeTab, facultyId]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="text-purple-600" size={32} />
            AI-Powered Faculty Assistant
          </h1>
          <p className="text-gray-600 mt-1">Extraordinary features powered by advanced AI</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="font-semibold text-red-900">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-3 font-medium ${
            activeTab === 'recommendations'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap size={18} className="inline mr-2" />
          Smart Recommendations
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-3 font-medium ${
            activeTab === 'search'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Search size={18} className="inline mr-2" />
          Semantic Search
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-3 font-medium ${
            activeTab === 'analytics'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp size={18} className="inline mr-2" />
          Analytics
        </button>
      </div>

      {/* RECOMMENDATIONS TAB */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Personalized Event Recommendations</h2>
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Analyzing recommendations...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid gap-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{rec.event?.title}</h3>
                    <div className="bg-purple-100 text-purple-900 px-3 py-1 rounded-full font-bold">
                      {rec.matchScore}% Match
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{rec.reason}</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                      View Event
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
                      Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-8 text-center">No recommendations available yet</p>
          )}
        </div>
      )}

      {/* SEARCH TAB */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Intelligent Event Search (NLP-Powered)</h2>
          <p className="text-gray-600">Search naturally - AI understands what you're looking for</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performSemanticSearch()}
              placeholder="Search events with natural language..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={performSemanticSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Found {searchResults.length} relevant events</p>
              <div className="grid gap-3">
                {searchResults.map((event, idx) => (
                  <div key={idx} className="border rounded-lg p-3 hover:shadow-md transition">
                    <h4 className="font-bold">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Attendance Analytics & Insights</h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Analyzing your attendance patterns...</p>
            </div>
          ) : attendancePatterns ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                <p className="text-sm text-gray-600 mb-1">Average Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-900">
                  {attendancePatterns.avg_attendance_rate?.toFixed(0)}%
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100">
                <p className="text-sm text-gray-600 mb-1">Peak Day</p>
                <p className="text-2xl font-bold text-green-900 capitalize">
                  {attendancePatterns.peak_day}
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                <p className="text-sm text-gray-600 mb-1">No-Show Risk</p>
                <p className="text-2xl font-bold text-purple-900">
                  {attendancePatterns.no_show_risk?.toFixed(0)}%
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                <p className="text-sm text-gray-600 mb-1">Peak Time</p>
                <p className="text-2xl font-bold text-orange-900">{attendancePatterns.peak_time}</p>
              </div>
            </div>
          ) : null}

          {attendancePatterns?.recommendations && (
            <div className="border rounded-lg p-4 bg-yellow-50">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <MessageSquare size={18} className="text-yellow-700" />
                AI Recommendations
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {attendancePatterns.recommendations.split(';').map((rec, idx) => (
                  rec.trim() && <li key={idx}>✓ {rec.trim()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
