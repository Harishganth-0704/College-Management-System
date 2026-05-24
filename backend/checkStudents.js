const connectToMongo = require("./database/db");
const StudentDetails = require('./models/details/student-details.model');

require('dotenv').config();

const checkStudents = async () => {
  await connectToMongo();
  const students = await StudentDetails.find({}, 'email loginid enrollmentNo firstName lastName');
  console.log("Students in DB:", students);
  process.exit(0);
};

checkStudents();
