import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { authService } from '../../services/authService';
import DeleteIcon from '@mui/icons-material/Delete';
import './Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    name: '',
    figmaUrl: ''
  });
  const [isCreating, setIsCreating] = useState(false);
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
      setIsLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    setIsCreating(true);
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
    } finally {
      setIsCreating(false);
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

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(projects.filter(project => project.id !== projectId));
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
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
        <button type="submit" disabled={isCreating}>Create Project</button>
      </form>
      {isCreating && <div className="loading-spinner">Creating project...</div>}

      <div className="projects-grid">
        {isLoading ? (
          <div>Loading projects...</div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="project-card-header">
                <h3>{project.project_name}</h3>
                <button 
                  className="delete-button"
                  onClick={(e) => handleDeleteProject(project.id, e)}
                  title="Delete project"
                >
                  <DeleteIcon sx={{ fontSize: 20 }} />
                </button>
              </div>
              <p>Status: {project.status}</p>
              <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Projects; 