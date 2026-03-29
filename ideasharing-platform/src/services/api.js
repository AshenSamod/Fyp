import axios from 'axios';
import tokenManager from '../utils/tokenManager';


let apiBase = '';
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.log('🔧 Using proxy configuration: /api/* -> http://localhost:5000');
  apiBase = '/api';
} else if (process.env.REACT_APP_API_URL) {
  apiBase = process.env.REACT_APP_API_URL;
} else {
  // eslint-disable-next-line no-console
  console.warn('REACT_APP_API_URL is not set. Defaulting to localhost:5000');
  apiBase = ' http://localhost:5000/api';
}

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if refresh is in progress to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, logout user
        tokenManager.clearTokens();
        window.location.href = '/auth';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the access token
        const response = await axios.post(
          '/auth/refresh',
          { refresh_token: refreshToken }
        );

        const { access_token } = response.data;
        
        // Update the access token
        tokenManager.updateAccessToken(access_token);
        
        // Update the authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        // Process queued requests
        processQueue(null, access_token);
        isRefreshing = false;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        isRefreshing = false;
        tokenManager.clearTokens();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  verifyOTP: (otpData) => api.post('/auth/verify-otp', otpData),
  resendOTP: (email) => api.post('/auth/resend-otp', { email }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
};

// Add convenience methods directly on the api instance
api.getProfile = () => api.get('/auth/profile');
api.updateProfile = (profileData) => api.put('/auth/profile', profileData);
api.changePassword = (passwordData) => api.post('/auth/change-password', passwordData);
api.deleteAccount = (password) => api.delete('/auth/delete-account', { data: { password } });

export const ideasAPI = {
  getAll: () => api.get('/ideas'),
  getById: (id) => api.get(`/ideas/${id}`),
  create: (ideaData) => api.post('/ideas', ideaData),
  update: (id, ideaData) => api.put(`/ideas/${id}`, ideaData),
  delete: (id) => api.delete(`/ideas/${id}`),
  getCategories: () => api.get('/ideas/categories'),
  getMyIdeas: (params = {}) => {
    // Build query string from params object
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    const queryString = queryParams.toString();
    return api.get(`/ideas/my-ideas${queryString ? `?${queryString}` : ''}`);
  },
  getMyCommentedIdeas: (params = {}) => {
    // Build query string from params object
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    const queryString = queryParams.toString();
    return api.get(`/ideas/my-commented-ideas${queryString ? `?${queryString}` : ''}`);
  },
  search: (params) => {
    // Build query string from params object
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.category && params.category !== 'all') {
      queryParams.append('category', params.category);
    }
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    
    const queryString = queryParams.toString();
    return api.get(`/ideas/search${queryString ? `?${queryString}` : ''}`);
  },
};

export const commentsAPI = {
  getByIdeaId: (ideaId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    const queryString = queryParams.toString();
    return api.get(`/comments/idea/${ideaId}${queryString ? `?${queryString}` : ''}`);
  },
  create: (commentData) => api.post('/comments', commentData),
  update: (commentId, commentData) => api.put(`/comments/${commentId}`, commentData),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};

export const reportsAPI = {
  reportIdea: (ideaId, reportData) => api.post(`/reports/idea/${ideaId}`, reportData),
  reportComment: (commentId, reportData) => api.post(`/reports/comment/${commentId}`, reportData),
};

export const adminAPI = {
  // Users Management
  getUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    const queryString = queryParams.toString();
    return api.get(`/admin/users${queryString ? `?${queryString}&type=users` : '?type=users'}`);
  },
  
  searchUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    queryParams.append('type', 'users'); // Always filter regular users only
    
    const queryString = queryParams.toString();
    return api.get(`/admin/users/search?${queryString}`);
  },
  
  enableUser: (userId) => api.post(`/admin/users/${userId}/enable`),
  disableUser: (userId) => api.post(`/admin/users/${userId}/disable`),

  // Admin users management
  getAdmins: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    const queryString = queryParams.toString();
    return api.get(`/admin/users${queryString ? `?${queryString}&type=admins` : '?type=admins'}`);
  },
  
  searchAdmins: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    queryParams.append('type', 'admins'); // Filter admin users only
    
    const queryString = queryParams.toString();
    return api.get(`/admin/users/search?${queryString}`);
  },
  
  makeAdmin: (userId) => api.post(`/admin/users/${userId}/make-admin`),
  removeAdmin: (userId) => api.post(`/admin/users/${userId}/remove-admin`),

  // Reports Management
  getFlaggedIdeas: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    return api.get(`/admin/reports/ideas${queryString ? `?${queryString}` : ''}`);
  },
  getFlaggedComments: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    return api.get(`/admin/reports/comments${queryString ? `?${queryString}` : ''}`);
  },
  updateFlagStatus: (flagType, flagId, status) => 
    api.put(`/admin/reports/${flagType}/${flagId}/status`, { status }),
  updateAllFlagsForContent: (contentType, contentId, status) => 
    api.put(`/admin/reports/${contentType}/${contentId}/status`, { status }),
  
  // Delete comment
  deleteComment: (commentId) => api.delete(`/admin/comments/${commentId}`),

  // Delete idea
  deleteIdea: (ideaId) => api.delete(`/admin/ideas/${ideaId}`),

};

export const categoriesAPI = {
  getAll: () => api.get('/admin/categories'),
  create: (categoryData) => api.post('/admin/categories', categoryData),
  update: (categoryId, categoryData) => api.put(`/admin/categories/${categoryId}`, categoryData),
  delete: (categoryId) => api.delete(`/admin/categories/${categoryId}`),
};

export default api;