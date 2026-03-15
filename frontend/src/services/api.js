import axios from 'axios';

// In development, Vite proxy handles /api requests
// In production, use VITE_API_URL environment variable
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const HAS_API_SUFFIX = /\/api$/i.test(API_BASE_URL);

const buildApiPath = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return HAS_API_SUFFIX ? normalizedPath : `/api${normalizedPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createCase = async (payload, file) => {
  if (file) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    formData.append('document', file);

    const { data } = await api.post(buildApiPath('/cases'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  }

  const { data } = await api.post(buildApiPath('/cases'), payload);
  return data;
};

export const getMyCases = async () => {
  const { data } = await api.get(buildApiPath('/cases/my'));
  return data;
};

export const getCaseById = async (id) => {
  const { data } = await api.get(buildApiPath(`/cases/${id}`));
  return data;
};

export const uploadCaseDocument = async (id, file) => {
  const formData = new FormData();
  formData.append('document', file);

  const { data } = await api.post(buildApiPath(`/cases/${id}/documents`), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

export const getRecommendations = async (caseId) => {
  const { data } = await api.get(buildApiPath(`/recommendations/${caseId}`));
  return data;
};

export const sendRequest = async (payload) => {
  const { data } = await api.post(buildApiPath('/requests'), payload);
  return data;
};

export const getClientRequests = async () => {
  const { data } = await api.get(buildApiPath('/requests/client'));
  return data;
};

export const getLawyerRequests = async () => {
  const { data } = await api.get(buildApiPath('/requests/lawyer'));
  return data;
};

export const updateRequestStatus = async (id, status) => {
  const { data } = await api.patch(buildApiPath(`/requests/${id}`), { status });
  return data;
};

export const getClientProfile = async () => {
  const { data } = await api.get(buildApiPath('/client/profile'));
  return data;
};

export const updateClientProfile = async (payload) => {
  const { data } = await api.patch(buildApiPath('/client/profile'), payload);
  return data;
};

export const getClientProfileCompletion = async () => {
  const { data } = await api.get(buildApiPath('/client/profile/completion'));
  return data;
};

export const getMessages = async (requestId) => {
  const { data } = await api.get(buildApiPath(`/messages/${requestId}`));
  return data;
};

export const sendMessage = async (requestId, payload) => {
  const { data } = await api.post(buildApiPath(`/messages/${requestId}`), payload);
  return data;
};

export const sendMessageAttachment = async (requestId, files, text = '') => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('attachments', file);
  });

  if (text) {
    formData.append('text', text);
  }

  const { data } = await api.post(buildApiPath(`/messages/${requestId}/attachment`), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

export const markMessagesRead = async (requestId) => {
  const { data } = await api.patch(buildApiPath(`/messages/${requestId}/read`));
  return data;
};

export const updateLawyerAvailability = async (availability) => {
  const { data } = await api.patch(buildApiPath('/lawyers/profile/availability'), { availability });
  return data;
};

export const getLawyerDashboardMetrics = async () => {
  const { data } = await api.get(buildApiPath('/lawyers/dashboard/metrics'));
  return data;
};

export const getLawyers = async () => {
  const { data } = await api.get(buildApiPath('/lawyers'));
  return data;
};

export const getClientProfileForLawyer = async (clientId) => {
  const { data } = await api.get(buildApiPath(`/lawyers/clients/${clientId}`));
  return data;
};

export const getNotifications = async () => {
  const { data } = await api.get(buildApiPath('/notifications'));
  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await api.patch(buildApiPath(`/notifications/${id}/read`));
  return data;
};

export default api;
