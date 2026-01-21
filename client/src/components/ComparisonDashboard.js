import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

import api from '../utils/api';

// Sample job requirements for different roles
const jobRequirementsData = {
  'Full Stack Developer': [
    { skill: 'React', required: 4 },
    { skill: 'Node.js', required: 4 },
    { skill: 'JavaScript', required: 5 },
    { skill: 'TypeScript', required: 3 },
    { skill: 'MongoDB', required: 3 },
    { skill: 'Git', required: 4 },
    { skill: 'Docker', required: 2 },
    { skill: 'AWS', required: 2 },
  ],
  'Frontend Developer': [
    { skill: 'React', required: 5 },
    { skill: 'JavaScript', required: 5 },
    { skill: 'TypeScript', required: 4 },
    { skill: 'CSS', required: 4 },
    { skill: 'HTML', required: 4 },
    { skill: 'Git', required: 3 },
    { skill: 'Redux', required: 3 },
    { skill: 'Webpack', required: 2 },
  ],
  'Backend Developer': [
    { skill: 'Node.js', required: 5 },
    { skill: 'Python', required: 4 },
    { skill: 'MongoDB', required: 4 },
    { skill: 'PostgreSQL', required: 3 },
    { skill: 'Docker', required: 3 },
    { skill: 'AWS', required: 3 },
    { skill: 'Git', required: 4 },
    { skill: 'REST APIs', required: 4 },
  ],
  'Data Scientist': [
    { skill: 'Python', required: 5 },
    { skill: 'Machine Learning', required: 4 },
    { skill: 'SQL', required: 4 },
    { skill: 'Statistics', required: 4 },
    { skill: 'Pandas', required: 4 },
    { skill: 'NumPy', required: 3 },
    { skill: 'Git', required: 3 },
    { skill: 'Jupyter', required: 3 },
  ]
};

const ComparisonDashboard = () => {
  const ref = useRef();

  const [userSkills, setUserSkills] = useState([]);
  const [jobRequirements, setJobRequirements] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user skills
  useEffect(() => {
    fetchUserSkills();
  }, []);

  // Update job requirements when role changes
  useEffect(() => {
    setJobRequirements(jobRequirementsData[selectedRole] || []);
  }, [selectedRole]);

  const fetchUserSkills = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/skills');
      const skills = res.data.data;

      // Convert skills to the format expected by the comparison
      const formattedSkills = skills.map(skill => {
        const latestProficiency = skill.proficiency && skill.proficiency.length > 0
          ? skill.proficiency[skill.proficiency.length - 1]
          : { level: 0 };

        return {
          skill: skill.skill,
          level: latestProficiency.level || 0
        };
      });

      setUserSkills(formattedSkills);
    } catch (err) {
      setError('Failed to load skills');
      console.error('Skills fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userSkills || !jobRequirements || userSkills.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 80, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Combine data and calculate gaps
    const comparisonData = jobRequirements.map(req => {
      const userSkill = userSkills.find(us => us.skill.toLowerCase() === req.skill.toLowerCase());
      const userLevel = userSkill ? userSkill.level : 0;
      const gap = Math.max(0, req.required - userLevel);
      return {
        skill: req.skill,
        required: req.required,
        current: userLevel,
        gap: gap,
        match: userLevel >= req.required ? 100 : Math.round((userLevel / req.required) * 100)
      };
    });

    // Scales
    const x = d3.scaleBand()
      .domain(comparisonData.map(d => d.skill))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(comparisonData, d => Math.max(d.required, d.current)) + 1])
      .range([height, 0]);

    // Create SVG
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('font-size', 10);

    // Y-axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `Lv ${d}`));

    // Bars for required level
    g.selectAll('.required-bar')
      .data(comparisonData)
      .enter()
      .append('rect')
      .attr('class', 'required-bar')
      .attr('x', d => x(d.skill))
      .attr('y', d => y(d.required))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.required))
      .attr('fill', '#ef4444')
      .attr('opacity', 0.7);

    // Bars for current level
    g.selectAll('.current-bar')
      .data(comparisonData)
      .enter()
      .append('rect')
      .attr('class', 'current-bar')
      .attr('x', d => x(d.skill))
      .attr('y', d => y(d.current))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.current))
      .attr('fill', '#10b981')
      .attr('opacity', 0.8);

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left},10)`);

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#ef4444')
      .attr('opacity', 0.7);
    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .text('Required Level')
      .attr('font-size', 12);

    legend.append('rect')
      .attr('x', 120)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#10b981')
      .attr('opacity', 0.8);
    legend.append('text')
      .attr('x', 140)
      .attr('y', 12)
      .text('Your Level')
      .attr('font-size', 12);

    // Match percentage
    const avgMatch = Math.round(comparisonData.reduce((sum, d) => sum + d.match, 0) / comparisonData.length);

    legend.append('text')
      .attr('x', 250)
      .attr('y', 12)
      .text(`Overall Match: ${avgMatch}%`)
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .attr('fill', avgMatch >= 80 ? '#10b981' : avgMatch >= 60 ? '#f59e0b' : '#ef4444');

  }, [userSkills, jobRequirements]);

  // Calculate skill gaps
  const skillGaps = jobRequirements
    .map(req => {
      const userSkill = userSkills.find(us => us.skill.toLowerCase() === req.skill.toLowerCase());
      const userLevel = userSkill ? userSkill.level : 0;
      return {
        skill: req.skill,
        gap: Math.max(0, req.required - userLevel),
        required: req.required,
        current: userLevel
      };
    })
    .filter(item => item.gap > 0)
    .sort((a, b) => b.gap - a.gap);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading skill comparison...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading comparison</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <button
                  onClick={fetchUserSkills}
                  className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Selection */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Skill Comparison</h3>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.keys(jobRequirementsData).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {userSkills.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-gray-500">No skills found. Add some skills to see the comparison.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg ref={ref} width={600} height={400} />
          </div>
        )}
      </div>

      {skillGaps.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Gaps to Address</h3>
          <div className="space-y-3">
            {skillGaps.slice(0, 5).map((gap) => (
              <div key={gap.skill} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <h4 className="font-medium text-gray-900">{gap.skill}</h4>
                  <p className="text-sm text-gray-600">
                    Current: Level {gap.current} | Required: Level {gap.required}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-red-600">
                    Gap: {gap.gap} level{gap.gap !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
            {skillGaps.length > 5 && (
              <div className="text-center py-2">
                <span className="text-sm text-gray-500">
                  And {skillGaps.length - 5} more skill gaps...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {skillGaps.length === 0 && userSkills.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Gaps to Address</h3>
          <div className="text-center py-8">
            <div className="text-green-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600">Great job! You meet all the requirements for this role.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonDashboard; 