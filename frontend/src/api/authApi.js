import axiosInstance from './axiosInstance';

export const signupApi = async ({ name, email, password }) => {
  const response = await axiosInstance.post('/auth/signup', {
    name,
    email,
    password,
  });
  return response.data;
};

export const loginApi = async ({ email, password }) => {
  const response = await axiosInstance.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const refreshApi = async ({ refreshToken }) => {
  const response = await axiosInstance.post('/auth/refresh', {
    refreshToken,
  });
  return response.data;
};
