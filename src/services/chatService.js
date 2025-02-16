import axios from 'axios';
import { authHeader } from '../utils/authHeader';

const API_URL = process.env.API_URL +'/chat';

export const chatService = {
    async getChatHistory() {
        try {
            const response = await axios.get(`${API_URL}/history`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching chat history:', error);
            throw error;
        }
    },

    async sendMessage(message) {
        try {
            const response = await axios.post(API_URL, {
                message: message
            }, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    async uploadAttachment(projectId, file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                `${API_URL}/${projectId}/attachment`,
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