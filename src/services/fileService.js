import axios from 'axios';
import { authHeader } from '../utils/authHeader';

const API_URL = (process.env.API_URL || 'https://gherkin-backend.onrender.com/api') + '/files';
export const fileService = {
    async uploadFile(projectId, chatId, file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', projectId);
        formData.append('chat_id', chatId);

        try {
            const response = await axios.post(
                `${API_URL}/upload`,
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

    async getProjectFiles(projectId) {
        try {
            const response = await axios.get(`${API_URL}/project/${projectId}`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async deleteFile(fileId) {
        try {
            const response = await axios.delete(`${API_URL}/${fileId}`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 