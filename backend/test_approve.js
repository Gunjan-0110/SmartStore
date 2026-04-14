const axios = require('axios');

async function testApprove() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5002/api' });
    
    // Login
    const { data: authData } = await api.post('/auth/login', { email: 'admin@smartstock.io', password: 'admin123' });
    console.log('Login success. Token acquired.');
    api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;

    // Get requests
    const { data: reqData } = await api.get('/requests');
    const pending = reqData.requests.filter(r => r.status === 'pending');
    console.log(`Found ${pending.length} pending requests.`);
    
    if (pending.length === 0) {
       console.log('No pending requests to test on.');
       return;
    }
    
    const target = pending[0];
    console.log(`Approving request ${target._id}...`);
    
    // Approve it
    const { data: actData } = await api.put(`/requests/${target._id}`, { action: 'approved' });
    console.log('Approve success:', actData);

  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.data);
    } else {
      console.error('Other Error:', err.message);
    }
  }
}

testApprove();
