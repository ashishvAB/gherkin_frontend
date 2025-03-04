import axios from 'axios';
import { authHeader } from '../utils/authHeader';

const CHAT_API_URL =  (process.env.REACT_APP_API_URL || 'https://gherkin-backend.onrender.com/api') +'/chat';


export const chatService = { 
    async getChatHistory(projectId) {
        try {
            console.log("Project ID in Service ..is:", projectId);
            const response = await axios.get(`${CHAT_API_URL}/history/${projectId}`, {
                headers: authHeader()
            }); 
            console.log("Chat History response in service:", response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching chat history:', error);
            throw error;
        }
    },

    async sendMessage(message, projectId) {
        try {
            const response = await axios.post(CHAT_API_URL, {
                message: message,
                project_id: projectId
            }, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async uploadAttachment(projectId, file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                `${CHAT_API_URL}/${projectId}/attachment`,
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
    }
}; 