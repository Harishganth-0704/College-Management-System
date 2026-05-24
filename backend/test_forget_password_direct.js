require('dotenv').config();
const connectToMongo = require("./database/db");
const resetPasswordCtrl = require('./controllers/resetPassword.controller');

async function test() {
  await connectToMongo();
  const req = {
    params: { role: 'student' },
    body: { email: '708429@gmail.com' }
  };
  const res = {
    status: function(code) { console.log('status', code); return this; },
    json: function(data) { console.log('json', data); return this; }
  };
  await resetPasswordCtrl.forgotPassword(req, res);
  process.exit();
}
test();
