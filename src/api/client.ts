import axios from 'axios';

// IMPORTANT: Replace the IP below with your actual IPv4 address.
// Keep the :3000 port at the end!
const API_BASE_URL = 'http://192.168.100.105';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A quick helper function to fetch listings
export const getListings = async () => {
  try {
    const response = await apiClient.get('/listings');
    return response.data;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};