import React, { useEffect, useState } from 'react';
import { Plus, Clock, Edit, Trash2 } from 'lucide-react';
import ProjectTimeline from '../components/ProjectTimeline';

import api from '../utils/api';

const Projects = () => {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: [],
    startDate: '',
    endDate: '',
    link: '',
    image: ''
  });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Add new project
  const handleAddProject = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      const res = await api.post('/api/projects', form);
      setProjects((prev) => [...prev, res.data.data]);
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        tags: [],
        startDate: '',
        endDate: '',
        link: '',
        image: ''
      });
    } catch (err) {
      setError('Failed to add project');
    } finally {
      setAdding(false);
    }
  };

  // Edit project
  const handleEditProject = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      const res = await api.put(`/api/projects/${editingProject._id}`, form);
      setProjects((prev) => prev.map(project =>
        project._id === editingProject._id ? res.data.data : project
      ));
      setShowForm(false);
      setEditingProject(null);
      setForm({
        title: '',
        description: '',
        tags: [],
        startDate: '',
        endDate: '',
        link: '',
        image: ''
      });
    } catch (err) {
      setError('Failed to update project');
    } finally {
      setAdding(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    setDeleting(projectId);
    setError('');
    try {
      await api.delete(`/api/projects/${projectId}`);
      setProjects((prev) => prev.filter(project => project._id !== projectId));
    } catch (err) {
      setError('Failed to delete project');
    } finally {
      setDeleting(null);
    }
  };

  // Open edit form
  const openEditForm = (project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description,
      tags: project.tags || [],
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0],
      link: project.link || '',
      image: project.image || ''
    });
    setShowForm(true);
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setForm({
      title: '',
      description: '',
      tags: [],
      startDate: '',
      endDate: '',
      link: '',
      image: ''
    });
    setError('');
  };

  // Helper for tags input
  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setForm(prev => ({ ...prev, tags }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">
            Showcase your projects and track your development journey.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Add/Edit Project Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full relative animate-fade-in" onSubmit={editingProject ? handleEditProject : handleAddProject}>
            <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={closeForm}>
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Project Title</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                rows="3"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={form.tags.join(', ')}
                onChange={handleTagsChange}
                placeholder="React, Node.js, MongoDB"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Project Link (optional)</label>
              <input
                type="url"
                className="w-full border rounded-lg px-3 py-2"
                value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
              <input
                type="url"
                className="w-full border rounded-lg px-3 py-2"
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={adding}>
              {adding ? (editingProject ? 'Updating...' : 'Adding...') : (editingProject ? 'Update Project' : 'Add Project')}
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </form>
        </div>
      )}

      {/* Project Timeline */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Timeline</h2>
        <ProjectTimeline projects={projects} />
      </div>

      {/* Projects Grid */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Projects</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading projects...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading projects</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <button
                  onClick={fetchProjects}
                  className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 && (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-500">No projects found. Add your first project to get started!</p>
              </div>
            )}
            {projects.map((project) => (
              <div key={project._id} className="card hover:shadow-md transition-shadow cursor-pointer group">
                <div className="space-y-4">
                  <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Completed {new Date(project.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditForm(project);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit project"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project._id);
                          }}
                          disabled={deleting === project._id}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete project"
                        >
                          {deleting === project._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects; 