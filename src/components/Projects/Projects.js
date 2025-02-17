import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { authService } from '../../services/authService';
import './Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    figmaUrl: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.access_token) {
      navigate('/login');
      return;
    }
    loadProjects();
  }, [navigate]);

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const project = await projectService.createProject({
        name: newProject.name,
        figmaUrl: newProject.figmaUrl
      });
      setProjects([...projects, project]);
      setNewProject({ name: '', figmaUrl: '' });
    } catch (error) {
      console.error('Error creating project:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleLogout = () => {
    authService.logout();
    setProjects([]);
    navigate('/login');
  };

  return (
    <div className="projects-container">
      <div className="header-container">
        <h1>My Projects</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <form className="create-project-form" onSubmit={createProject}>
        <input
          type="text"
          value={newProject.name}
          onChange={(e) => setNewProject({...newProject, name: e.target.value})}
          placeholder="Project Name"
          required
        />
        <input
          type="url"
          value={newProject.figmaUrl}
          onChange={(e) => setNewProject({...newProject, figmaUrl: e.target.value})}
          placeholder="Figma URL"
          required
        />
        <button type="submit">Create Project</button>
      </form>

      <div className="projects-grid">
        {projects.map((project) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => handleProjectClick(project.id)}
          >
            <h3>{project.project_name}</h3>
            <p>Status: {project.status}</p>
            <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects; 