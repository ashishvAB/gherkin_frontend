import axios from 'axios';
import { authHeader } from '../utils/authHeader';

const GHERKIN_API_URL = (process.env.REACT_APP_API_URL || 'https://gherkin-backend.onrender.com/api') +'/gherkin';


export const gherkinService = {
    async processFromFigma(url, projectId) {
        try {
            const response = await axios.post(
                `${GHERKIN_API_URL}/from_figma`,
                { url, project_id: projectId },
                { headers: authHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async processFromImage(url) {
        try {
            const response = await axios.post(
                `${GHERKIN_API_URL}/from_image`,
                { url },
                { headers: authHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async uploadFile(formData) {
        try {
            const response = await axios.post(
                `${GHERKIN_API_URL}/upload_file`,
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

    async getMessageTestCases(messageId) {
        try {
            const response = await axios.get(
                `${GHERKIN_API_URL}/messages/${messageId}`,
                { headers: authHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 