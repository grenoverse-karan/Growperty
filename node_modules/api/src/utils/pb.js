import 'dotenv/config';
import axios from 'axios';
import logger from './logger.js';

const POCKETBASE_URL = (process.env.POCKETBASE_URL || 'http://127.0.0.1:8090').trim();
const REQUEST_TIMEOUT = 5000; // 5 seconds

/**
 * PocketBase HTTP Client
 * Provides methods to interact with PocketBase REST API
 * All methods use axios with 5-second timeout
 */
const pbClient = {
  /**
   * GET request to PocketBase
   * @param {string} endpoint - API endpoint (e.g., '/collections/properties/records')
   * @param {object} params - Query parameters
   * @param {string} authToken - Optional auth token
   * @returns {Promise<object>} Response data
   */
  async get(endpoint, params = {}, authToken = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await axios.get(`${POCKETBASE_URL}/api${endpoint}`, {
        params,
        headers,
        timeout: REQUEST_TIMEOUT,
      });

      return response.data;
    } catch (error) {
      logger.error('PocketBase GET request failed', {
        endpoint,
        status: error.response?.status,
        message: error.message,
      });
      throw error;
    }
  },

  /**
   * POST request to PocketBase
   * @param {string} endpoint - API endpoint (e.g., '/collections/properties/records')
   * @param {object} data - Request body data
   * @param {string} authToken - Optional auth token
   * @returns {Promise<object>} Response data
   */
  async post(endpoint, data = {}, authToken = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await axios.post(`${POCKETBASE_URL}/api${endpoint}`, data, {
        headers,
        timeout: REQUEST_TIMEOUT,
      });

      return response.data;
    } catch (error) {
      logger.error('PocketBase POST request failed', {
        endpoint,
        status: error.response?.status,
        message: error.message,
      });
      throw error;
    }
  },

  /**
   * PATCH request to PocketBase
   * @param {string} endpoint - API endpoint (e.g., '/collections/properties/records/id')
   * @param {object} data - Request body data
   * @param {string} authToken - Optional auth token
   * @returns {Promise<object>} Response data
   */
  async patch(endpoint, data = {}, authToken = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await axios.patch(`${POCKETBASE_URL}/api${endpoint}`, data, {
        headers,
        timeout: REQUEST_TIMEOUT,
      });

      return response.data;
    } catch (error) {
      logger.error('PocketBase PATCH request failed', {
        endpoint,
        status: error.response?.status,
        message: error.message,
      });
      throw error;
    }
  },

  /**
   * DELETE request to PocketBase
   * @param {string} endpoint - API endpoint (e.g., '/collections/properties/records/id')
   * @param {string} authToken - Optional auth token
   * @returns {Promise<void>}
   */
  async delete(endpoint, authToken = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await axios.delete(`${POCKETBASE_URL}/api${endpoint}`, {
        headers,
        timeout: REQUEST_TIMEOUT,
      });

      return response.data;
    } catch (error) {
      logger.error('PocketBase DELETE request failed', {
        endpoint,
        status: error.response?.status,
        message: error.message,
      });
      throw error;
    }
  },
};

export default pbClient;