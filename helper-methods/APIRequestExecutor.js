import axios from 'axios';

export class APIRequestExecutor {
  static async request(method, url, headers = {}, body = null) {
    try {
      const response = await axios({
        method,
        url,
        headers,
        data: body
      });

      console.log('API Request Success:', {
        method,
        url,
        status: response.status,
        headers: response.headers,
        data: response.data,
      });

      return {
        status: response.status,
        headers: response.headers,
        body: response.data,
        json: () => response.data
      };
    } catch (error) {
      const response = error.response || {};
      console.error('API Request Failed:', {
        method,
        url,
        status: response.status || 500,
        headers: response.headers || {},
        data: response.data || error.message
      });

      return {
        status: response.status || 500,
        headers: response.headers || {},
        body: response.data || error.message,
        json: () => {
          try {
            return typeof response.data === 'string'
              ? JSON.parse(response.data)
              : response.data;
          } catch {
            return null;
          }
        }
      };
    }
  }

  // 🔧 Add shorthand helpers
  static get(url, headers = {}) {
    return this.request('get', url, headers);
  }

  static post(url, headers = {}, body = null) {
    return this.request('post', url, headers, body);
  }

  static put(url, headers = {}, body = null) {
    return this.request('put', url, headers, body);
  }

  static delete(url, headers = {}) {
    return this.request('delete', url, headers);
  }
}
