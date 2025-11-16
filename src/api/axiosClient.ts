import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});
export default axiosClient;