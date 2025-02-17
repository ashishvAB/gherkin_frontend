import axios from 'axios';

const API_URL = (process.env.API_URL || 'https://gherkin-backend.onrender.com/api') + '/auth';

export const authService = {
    async loginWithGoogle(googleToken) {
        try {
            const response = await axios.post(`${API_URL}/google`, {
                token: googleToken
            });
            
            if (response.data.access_token) {
                const userData = {
                    ...response.data.user,
                    access_token: response.data.access_token
                };
                localStorage.setItem('user', JSON.stringify(userData));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }, 

    async getCurrentUser() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) return null;

            const response = await axios.get(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${user.access_token}` }
            });
            return response.data;
        } catch (error) {
            this.logout();
            throw error.response?.data || error.message;
        }
    },

    logout() {
        localStorage.removeItem('user');
    },

    async register(userData) {
        try {
            const response = await axios.post(`${API_URL}/register`, {
                name: userData.name,
                email: userData.email,
                password: userData.password
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async login(credentials) {
        try {
            console.log('Attempting login with:', credentials);
            const response = await axios.post(`${API_URL}/login`, credentials);
            console.log('Login response:', response.data);
            
            if (response.data.access_token) {
                // Store the complete response including user data and token
                const userData = {
                    ...response.data.user,
                    access_token: response.data.access_token,
                    token_type: response.data.token_type
                };
                localStorage.setItem('user', JSON.stringify(userData));
                // Also store token separately for PrivateRoute
                localStorage.setItem('token', response.data.access_token);
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    }
}; 