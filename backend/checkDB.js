const connectToMongo = require("./database/db");
const AdminDetails = require('./models/details/admin-details.model');
const FacultyDetails = require('./models/details/faculty-details.model');
const StudentDetails = require('./models/details/student-details.model');

require('dotenv').config();

const checkUsers = async () => {
  await connectToMongo();
  const admins = await AdminDetails.find({}, 'email loginid');
  const faculties = await FacultyDetails.find({}, 'email loginid employeeId');
  const students = await StudentDetails.find({}, 'email loginid enrollmentNo');
  
  console.log("Admins:", admins);
  console.log("Faculties:", faculties);
  console.log("Students:", students);
  process.exit(0);
};

checkUsers();
