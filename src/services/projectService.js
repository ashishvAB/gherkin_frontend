import axios from 'axios';
import { authHeader } from '../utils/authHeader';

const API_URL = (process.env.API_URL || 'https://gherkin-backend.onrender.com/api') +'/projects';

const deleteProject = async (projectId) => {
    try {
        const response = await axios.delete(`${API_URL}/${projectId}`, {
            headers: authHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const projectService = {
    async createProject(projectData) {
        try {
            const response = await axios.post(API_URL, {
                project_name: projectData.name,
                figma_url: projectData.figmaUrl,
                status: 'processing'
            }, {
                headers: authHeader()
            });
            console.log("response", response.data);
            return response.data;
        } catch (error) {
            console.error("Project creation error:", error.response?.data);
            throw error.response?.data || error.message;
        }
    },

    async getProjects() {
        try {
            const response = await axios.get(API_URL, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async getProjectById(projectId) {
        try {
            const response = await axios.get(`${API_URL}/${projectId}`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async uploadFigmaJson(projectId, jsonFile) {
        const formData = new FormData();
        formData.append('file', jsonFile);

        try {
            const response = await axios.post(
                `${API_URL}/${projectId}/figma-json`,
                formData,
                {
                    headers: {
                        ...authHeader(),
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteProject,
}; 