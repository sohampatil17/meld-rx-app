import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Use the API v2 endpoint with the correct parameters
    const response = await axios.get('https://clinicaltrials.gov/api/v2/studies?query.term=cancer&filter.overallStatus=RECRUITING&pageSize=5');

    // Return the raw response for debugging
    return res.status(200).json({
      success: true,
      data: response.data,
      headers: response.headers,
      status: response.status,
      requestUrl: 'https://clinicaltrials.gov/api/v2/studies?query.term=cancer&filter.overallStatus=RECRUITING&pageSize=5'
    });
  } catch (error) {
    console.error('Debug API error:', error);
    
    // Provide detailed error information for debugging
    if (axios.isAxiosError(error)) {
      return res.status(500).json({
        success: false,
        error: error.message,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data
        },
        request: {
          method: error.config?.method,
          url: error.config?.url,
          params: error.config?.params,
          headers: error.config?.headers
        }
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Unknown error occurred',
      details: String(error)
    });
  }
} 