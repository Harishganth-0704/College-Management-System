/**
 * One-time script: update Harishganth.L's faculty profile with all details
 * Run: node updateHarishganth.js
 */
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const FACULTY_ID = '6a11bea4ed38ba9ba07d000a';
const ADMIN_ID   = '6a101c258a81a59b2fa1e5e5';
const API_BASE   = 'http://localhost:4000/api';

const token = jwt.sign({ userId: ADMIN_ID }, process.env.JWT_SECRET, { expiresIn: '1h' });

async function run() {
  const form = new FormData();

  // Basic info
  form.append('firstName',   'Harishganth');
  form.append('lastName',    'L');
  form.append('email',       'hkanth742@gmail.com');
  form.append('phone',       '9943099253');
  form.append('gender',      'male');
  form.append('bloodGroup',  'B+');
  form.append('dob',         '2006-04-07');
  form.append('joiningDate', '2024-04-21');
  form.append('salary',      '100000');
  form.append('designation', 'Faculty');
  form.append('status',      'active');

  // Address
  form.append('address', '11/386(44), Vanni Mara Street');
  form.append('city',    'Paramakudi');
  form.append('state',   'Tamil Nadu');
  form.append('pincode', '623707');
  form.append('country', 'India');

  // Emergency contact
  form.append('emergencyContact[name]',         'Logesh R');
  form.append('emergencyContact[relationship]', 'Maternal Uncle');
  form.append('emergencyContact[phone]',        '9345239457');

  // Branch (only one branch exists in DB)
  form.append('branchId', '6a11be44ed38ba9ba07d0003');

  // Profile photo
  const photoPath = path.join(__dirname, 'media', 'harishganth_profile.jpg');
  if (fs.existsSync(photoPath)) {
    form.append('file', fs.createReadStream(photoPath), {
      filename: 'harishganth_profile.jpg',
      contentType: 'image/jpeg',
    });
    console.log('✅ Profile photo attached');
  } else {
    console.warn('⚠️  Profile photo not found at:', photoPath);
  }

  try {
    const response = await axios.patch(
      `${API_BASE}/faculty/${FACULTY_ID}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      const u = response.data.data;
      console.log('\n✅ Faculty updated successfully!');
      console.log(`   Name        : ${u.firstName} ${u.lastName}`);
      console.log(`   Employee ID : ${u.employeeId}`);
      console.log(`   Email       : ${u.email}`);
      console.log(`   Phone       : ${u.phone}`);
      console.log(`   Profile     : ${u.profile}`);
      console.log(`   Designation : ${u.designation}`);
      console.log(`   DOB         : ${u.dob}`);
      console.log(`   Joining     : ${u.joiningDate}`);
      console.log(`   Salary      : ₹${u.salary.toLocaleString('en-IN')}`);
      console.log(`   Blood Group : ${u.bloodGroup}`);
      console.log(`   Address     : ${u.address}, ${u.city}, ${u.state} - ${u.pincode}`);
      console.log(`   Emergency   : ${u.emergencyContact?.name} (${u.emergencyContact?.relationship}) – ${u.emergencyContact?.phone}`);
    } else {
      console.error('❌ Update failed:', response.data.message);
    }
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

run();
