
// export const BASE_URL = 'https://kasjewellery.com/';
export const BASE_URL = 'https://hrms.yuvarajscaffoldingtraders.com/api/?url=';
// https://hrms.yuvarajscaffoldingtraders.com/api/?url=
const Live_URL = 'https://kasjewellery.in/';



export const fetchData = async (endpoint, method = 'POST', body = null, headers = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };
  try {
    // Alert.alert("API Request", `Endpoint: ${endpoint}\nMethod: ${method}\nBody: ${JSON.stringify(body)}`);
    const response = await fetch(url, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : null,
    });
    // restartApp()
    if (!response.ok) {
      const text = await response.text(); // read HTML or error message
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    const jsonData = await response.json();
    // console.log(jsonData,"jsonData")
    return jsonData;
  } catch (error) {
    console.error('fetchData Error:', error,endpoint);
    throw error; // re-throw to handle in caller
  }
};
