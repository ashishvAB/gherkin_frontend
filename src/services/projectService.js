import axios from 'axios';
import { authHeader } from '../utils/authHeader';

const PROJECT_API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api') +'/projects';

const deleteProject = async (projectId) => {
    try {
        const response = await axios.delete(`${PROJECT_API_URL}/${projectId}`, {
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
            const response = await axios.post(PROJECT_API_URL, {
                project_name: projectData.name,
                figma_url: projectData.figmaUrl,
                status: 'active'
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
            const response = await axios.get(PROJECT_API_URL, {
                headers: authHeader()
            });
            console.log("Get Projects response", response.data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async getProjectById(projectId) {
        try {
            const response = await axios.get(`${PROJECT_API_URL}/${projectId}`, {
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
                `${PROJECT_API_URL}/${projectId}/figma-json`,
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
    async getPages(projectId) {
        try {
            const response = await axios.get(`${PROJECT_API_URL}/${projectId}/pages`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    deleteProject,
}; 