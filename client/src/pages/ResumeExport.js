import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useLocation } from 'react-router-dom';
import { Download, Share2, FileText, Eye, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ResumePDF from '../components/ResumePDF';

const ResumeExport = () => {
  const componentRef = useRef();
  const location = useLocation();
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicLink, setPublicLink] = useState('');

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch skills and projects in parallel
      const [skillsRes, projectsRes] = await Promise.all([
        api.get('/api/skills'),
        api.get('/api/projects')
      ]);

      setSkills(skillsRes.data.data);
      setProjects(projectsRes.data.data);

      // Generate public link
      if (user?._id) {
        setPublicLink(`${window.location.origin}/portfolio/${user._id}`);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Fetch user data on component mount, when user changes, and when location changes
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData, location.pathname]);

  // Refresh data when user returns to this tab/window
  useEffect(() => {
    const handleFocus = () => {
      fetchUserData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchUserData]);

  // Prepare user data for resume
  const userData = {
    name: user?.name || user?.username || 'Your Name',
    title: user?.title || 'Software Developer',
    email: user?.email || 'email@example.com',
    phone: user?.phone || '+1 (555) 123-4567',
    location: user?.location || 'Your Location',
  };

  // Handle public link creation
  const handleCreatePublicLink = () => {
    if (publicLink) {
      navigator.clipboard.writeText(publicLink);
      // You could add a toast notification here
      alert('Public link copied to clipboard!');
    }
  };

  // Handle download
  const handleDownload = () => {
    handlePrint();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Resume Export</h1>
          <p className="text-gray-600 mt-2">
            Generate and share your professional resume with real data from your profile.
          </p>
        </div>
        <button
          onClick={fetchUserData}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Loading your data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <button
                onClick={fetchUserData}
                className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">PDF Export</h3>
              <p className="text-sm text-gray-600">
                Generate a professional PDF resume with your real data
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={loading || error}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Loading...' : 'Generate PDF'}
          </button>
        </div>

        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Public Portfolio</h3>
              <p className="text-sm text-gray-600">
                Share your portfolio with a public link
              </p>
            </div>
          </div>
          <button
            onClick={handleCreatePublicLink}
            disabled={loading || error || !publicLink}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {loading ? 'Loading...' : publicLink ? 'Copy Link' : 'Create Link'}
          </button>
        </div>
      </div>

      {/* Data Summary */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{skills.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Skills</div>
          </div>
          <div className="card text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{projects.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Projects</div>
          </div>
          <div className="card text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {skills.reduce((total, skill) => total + (skill.proficiency?.length || 0), 0)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Proficiency Points</div>
          </div>
          <div className="card text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {skills.reduce((total, skill) => total + (skill.certificates?.length || 0), 0)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Certificates</div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {!loading && !error && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Resume Preview</h2>
            <button
              onClick={handlePrint}
              className="btn-secondary flex items-center gap-2 w-full sm:w-auto"
            >
              <Eye className="w-4 h-4" />
              Preview & Print
            </button>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            {skills.length === 0 && projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">No data available for resume</p>
                <p className="text-sm text-gray-400">
                  Add some skills and projects to generate your resume
                </p>
              </div>
            ) : (
              <ResumePDF
                ref={componentRef}
                userData={userData}
                skills={skills}
                projects={projects}
              />
            )}
          </div>
        </div>
      )}

      {/* Public Link Display */}
      {publicLink && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Public Portfolio Link</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 mb-1">Share this link with potential employers:</p>
              <p className="font-mono text-xs sm:text-sm bg-white p-2 rounded border break-all">{publicLink}</p>
            </div>
            <button
              onClick={handleCreatePublicLink}
              className="btn-secondary text-sm w-full sm:w-auto"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Recent Exports */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Resume with {skills.length} skills</p>
                <p className="text-sm text-gray-500">Ready for export</p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="btn-secondary text-sm"
            >
              Download
            </button>
          </div>
          {publicLink && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Public Portfolio Available</p>
                  <p className="text-sm text-gray-500">Share with employers</p>
                </div>
              </div>
              <button
                onClick={handleCreatePublicLink}
                className="btn-secondary text-sm"
              >
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeExport; 