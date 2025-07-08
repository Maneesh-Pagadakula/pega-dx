// utils/OAuthAPIHelper.js
import axios from 'axios';
import config from '../config/config.js';
import { Buffer } from 'buffer';

let cachedAccessToken = null;
let cachedTokenType = null;
let tokenExpiryEpoch = 0;

export class APIHelper {
  static buildURL(apiData, runtimeData = {}) {
    let url = apiData.url;

    if (apiData.pathVariables) {
      const pairs = apiData.pathVariables.split(';');
      for (const pair of pairs) {
        const [key, rawValue] = pair.split('=').map(s => s.trim());
        if (!key || !rawValue) continue;

        const placeholder = `{${key}}`;
        let value = rawValue;

        if (rawValue.startsWith('{') && rawValue.endsWith('}')) {
          const innerKey = rawValue.slice(1, -1);
          value = runtimeData[innerKey] || rawValue;
        } else {
          value = this.resolveRuntimeValue(rawValue, runtimeData);
        }

        url = url.replace(placeholder, value);
      }
    }

    if (apiData.requestParameters) {
      const queryParts = [];
      const params = apiData.requestParameters.split(';');
      for (const param of params) {
        const [key, val] = param.split('=').map(s => s.trim());
        if (key && val) {
          const resolved = this.resolveRuntimeValue(val, runtimeData);
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(resolved)}`);
        }
      }
      if (queryParts.length > 0) {
        url += (url.includes('?') ? '&' : '?') + queryParts.join('&');
      }
    }

    return url;
  }

  static resolveRuntimeValue(value, runtimeData) {
    if (value.startsWith('${') && value.endsWith('}')) {
      const key = value.slice(2, -1);
      return runtimeData[key] || '';
    }
    return value;
  }

  static getRequestType(apiData) {
    return apiData.requestType?.toUpperCase() || 'GET';
  }

  static getContentType(apiData) {
    if (apiData.payloadType?.toLowerCase() === 'body') {
      if (apiData.payloadFormat?.toLowerCase() === 'json') {
        return 'application/json';
      } else if (apiData.payloadFormat?.toLowerCase() === 'form data') {
        return 'multipart/form-data';
      }
    }
    return 'application/x-www-form-urlencoded';
  }

  static hasPayload(apiData) {
    return ['POST', 'PUT', 'PATCH'].includes(this.getRequestType(apiData));
  }

  static getPayload(apiData) {
    return apiData.payload || '';
  }

  static async getHeaders(apiData) {
    const headers = {
      'Content-Type': this.getContentType(apiData)
    };

    try {
      const tokenMap = await this.fetchOAuthToken(
        config['oauth.tokenUrl'],
        config['oauth.clientId'],
        config['oauth.clientSecret'],
        config['oauth.tokenName']
      );

      if (tokenMap.token_type && tokenMap.access_token) {
        headers['Authorization'] = `${tokenMap.token_type} ${tokenMap.access_token}`;
      }
    } catch (e) {
      console.error('OAuth Token Error:', e.message);
    }

    return headers;
  }

  static async fetchOAuthToken(tokenUrl, clientId, clientSecret, tokenName) {
    const now = Math.floor(Date.now() / 1000);
    if (cachedAccessToken && now < tokenExpiryEpoch) {
      return {
        tokenName,
        access_token: cachedAccessToken,
        token_type: cachedTokenType,
        expires_in: tokenExpiryEpoch - now
      };
    }

    const credentials = `${clientId}:${clientSecret}`;
    const encodedAuth = Buffer.from(credentials).toString('base64');

    try {
      const response = await axios.post(
        tokenUrl,
        new URLSearchParams({ grant_type: 'client_credentials' }),
        {
          headers: {
            'Authorization': `Basic ${encodedAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, token_type, expires_in } = response.data;
      cachedAccessToken = access_token;
      cachedTokenType = token_type;
      tokenExpiryEpoch = now + (expires_in || 3600) - 10;
      
      return {
        tokenName,
        access_token,
        token_type,
        expires_in
      };
    } catch (err) {
      throw new Error(`Failed to fetch OAuth token: ${err.message}`);
    }
  }
}
