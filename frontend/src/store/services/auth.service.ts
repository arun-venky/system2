import api from '../../utils/api';

export const authService = {
  async login(email: string, password: string) {  
    const response = await api.post('/auth/login', { email, password });    
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async signup(username: string, email: string, password: string) {    
    const response =  await api.post('/auth/signup', { username, email, password })
    .then(response => response.data)
    .catch(error => {
      console.error('Auth Error: Signup failed', error)
      throw error
    })
    return response.data;
  },

  async verifyAuth(token: string) {
    try {
      const response = await api.post('/auth/verify', { token });
      return response.data.valid;
    } catch (error) {
      console.error('Failed to verify token:', error);
      return false;
    }
  },

  async getRefreshToken(token: string) {
    try {
      const response = await api.post('/auth/refresh', {
                                                          method: 'POST',
                                                          headers: {
                                                            'Content-Type': 'application/json'
                                                          },
                                                          body: JSON.stringify({
                                                            refreshToken: token
                                                          })
                                                        });

      console.log('getRefreshToken response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  },
}; 