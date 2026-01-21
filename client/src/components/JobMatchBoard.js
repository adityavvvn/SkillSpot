import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Star, MapPin, DollarSign, Filter } from 'lucide-react';
import axios from 'axios';

const JobMatchBoard = ({ userId = 'demo-user' }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, high-match, medium-match, low-match
  const [userSkills, setUserSkills] = useState([]);
  // Remove page state
  // const [page, setPage] = useState(1);

  // Replace with your Jooble API key
  // const JOOBLE_API_KEY = 'ba5421c6-08ce-46b3-b2af-0753e899f81c';

  useEffect(() => {
    // Fetch user skills
    const fetchSkills = async () => {
      try {
        const res = await axios.get('/api/skills');
        // Extract skill names as lowercase
        setUserSkills(res.data.data.map(s => s.skill.toLowerCase()));
      } catch (err) {
        setUserSkills([]);
      }
    };
    fetchSkills();
  }, []);

  // Add a function to fetch jobs (so it can be called on refresh)
  const fetchJoobleJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        '/api/jooble/search',
        {
          keywords: 'full stack developer, web designer, python developer, data scientist',
          location: 'India',
        }
      );
      console.log('Jooble API response:', response.data);
      const joobleJobs = Array.isArray(response.data.jobs) ? response.data.jobs : [];
      const normalize = str => str.toLowerCase().replace(/[^a-z0-9+]/gi, ' ');
      const transformedJobs = joobleJobs.map(job => {
        // Determine company wants (tags)
        let companyWants = [];
        const stopwords = new Set(['the', 'and', 'for', 'with', 'a', 'an', 'of', 'to', 'in', 'on', 'at', 'by', 'as', 'is', 'are', 'from', 'or', 'be', 'this', 'that', 'it', 'job', 'developer', 'engineer', 'manager', 'senior', 'junior']);
        if (Array.isArray(job.skills) && job.skills.length > 0) {
          companyWants = job.skills;
        } else if (job.profession) {
          companyWants = [job.profession];
        } else if (job.title) {
          companyWants = job.title
            .split(/[^a-zA-Z0-9+]+/)
            .map(w => w.trim().toLowerCase())
            .filter(w => w.length > 2 && !stopwords.has(w));
        }
        // Combine job title, description, and tags into a single string
        const jobText = normalize(
          (job.title || '') + ' ' +
          (job.description || '') + ' ' +
          (companyWants.join(' '))
        );
        // Split jobText into unique words for partial matching
        const jobWords = new Set(jobText.split(/\s+/).filter(Boolean));
        // Find which user skills are present in the job text (partial match)
        const matchedTags = userSkills.filter(skill => {
          const normSkill = normalize(skill);
          // Match if any job word contains the skill as a substring
          return Array.from(jobWords).some(word => word.includes(normSkill));
        });
        const matchScore = userSkills.length > 0
          ? Math.round((matchedTags.length / userSkills.length) * 100)
          : 0;
        return {
          _id: job.id || job.link,
          title: job.title,
          company: job.company || 'Unknown',
          tags: companyWants,
          location: job.location || job.city || 'Unknown',
          salary: job.salary || 'N/A',
          description: job.snippet || job.description,
          matchScore,
          matchedTags,
          redirect_url: job.link,
        };
      });
      setJobs(transformedJobs);
      // setPage(nextPage); // Remove page update
    } catch (err) {
      setError('Failed to load jobs from Jooble');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [userSkills]);

  // Fetch jobs when userSkills change
  useEffect(() => {
    fetchJoobleJobs(); // Always fetch first page
  }, [fetchJoobleJobs]);

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // const getMatchLabel = (score) => {
  //   if (score >= 80) return 'High Match';
  //   if (score >= 60) return 'Medium Match';
  //   return 'Low Match';
  // };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'high-match') return job.matchScore >= 80;
    if (filter === 'medium-match') return job.matchScore >= 60 && job.matchScore < 80;
    if (filter === 'low-match') return job.matchScore < 60;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={fetchJoobleJobs}
          className="btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          {loading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>}
          Refresh Jobs
        </button>
      </div>
      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Jobs' },
            { key: 'high-match', label: 'High Match (80%+)' },
            { key: 'medium-match', label: 'Medium Match (60-79%)' },
            { key: 'low-match', label: 'Low Match (<60%)' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${filter === key
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {Array.isArray(filteredJobs) && filteredJobs.map((job) => (
          <div key={job._id} className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <div className="relative group flex items-center">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getMatchColor(job.matchScore)}`}>
                      <Star className="w-3 h-3 fill-current" />
                      <span>{job.matchScore}% Match</span>
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute left-1/2 z-10 hidden group-hover:flex flex-col min-w-[220px] -translate-x-1/2 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-800 whitespace-pre-line">
                      <div className="mb-2">
                        <span className="font-semibold">Your Skills:</span>
                        <span className="ml-1">{userSkills.length > 0 ? userSkills.join(', ') : 'None'}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Matched in Job:</span>
                        <span className="ml-1">{job.matchedTags.length > 0 ? job.matchedTags.join(', ') : 'None'}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Company Wants:</span>
                        <span className="ml-1">{job.tags.length > 0 ? job.tags.join(', ') : 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{job.company}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-1 text-xs rounded-full ${job.matchedTags.includes(tag)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{job.description}</p>
              </div>
              <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className="btn-primary ml-4 whitespace-nowrap">Apply</a>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-8">
          <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Try adjusting your filters or check back later for new opportunities.</p>
        </div>
      )}
    </div>
  );
};

export default JobMatchBoard; 