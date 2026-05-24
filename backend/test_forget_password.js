const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:4000/api/student/forget-password', {
      email: '708429@gmail.com'
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
