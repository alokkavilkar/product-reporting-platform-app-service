import { toast } from 'react-toastify';
import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_BASE;
let authAxios = null;

export function createApi(auth0) {
  if (!authAxios) {
    authAxios = axios.create();
    authAxios.interceptors.request.use(async (config) => {
      const token = await auth0.getAccessTokenSilently();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  authAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      if (status === 403) {
        toast.error("🚫 You don't have permission to perform this action.");
      } else if (status === 401) {
        toast.warning("⚠️ Session expired. Please log in again.");
      } else {
        toast.error("❌ An unexpected error occurred.");
      }

      return Promise.reject(error);
    }
  );

  return {
    fetchUsers: () => authAxios.get(`${API_BASE}/list-users/`),
    fetchProducts: () => authAxios.get(`${API_BASE}/products/`),
    createProduct: (data) => authAxios.post(`${API_BASE}/products/`, data),
    inspectProduct: (productId, data) =>
      authAxios.post(`${API_BASE}/products/${productId}/inspect/`, data),
    fetchFaultReports: () => authAxios.get(`${API_BASE}/fault-reports/`),
    resolveFault: (faultId, payload) =>
      authAxios.post(`${API_BASE}/faults/${faultId}/resolve/`, payload),
    getPresignedUrl: (fileName, contentType) =>
      authAxios.get(`${API_BASE}/presigned-url`, {
        params: { file_name: fileName, content_type: contentType },
      }),
    reportFault: (productId, payload) =>
      authAxios.post(`${API_BASE}/products/${productId}/faults/`, payload),

    fetchUploadHistory: () => authAxios.get(`${API_BASE}/uploaded_files/`),

    getUploadPresignedUrl: (fileName, contentType) =>
      authAxios.get(`${API_BASE}/get-upload-products-presigned-url`, {
        params: { file_name: fileName, content_type: contentType },
      }),

    uploadFileToPresignedUrl: (url, file, contentType) =>
      axios.put(url, file, {
        headers: { 'Content-Type': contentType },
      }),

    saveUploadedFileRecord: (payload) =>
      authAxios.post(`${API_BASE}/save_uploaded_file_record/`, payload),

    processCsvFile: (payload) =>
      authAxios.post(`${API_BASE}/process_csv_file/`, payload),

  };
}
