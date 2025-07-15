import axios from 'axios';
import https from 'https';
export class APIRequestExecutor {
  static async request(method, url, headers = {}, body = null) {
    try {
      const response = await axios({
        method,
        url,
        headers,
        data: body,
        httpsAgent: new https.Agent({rejectUnauthorized: false})
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
       }
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
    return this.request('GET', url, headers);
  }

  static post(url, headers = {}, body) {
    return this.request('post', url, headers, body);
  }

  static put(url, headers = {}, body = null) {
    return this.request('put', url, headers, body);
  }

  static delete(url, headers = {}) {
    return this.request('delete', url, headers);
  }
}
