require('dotenv').config();
const connectToMongo = require("./database/db");
const StudentDetails = require('./models/details/student-details.model');

async function test() {
  await connectToMongo();
  const students = await StudentDetails.find({});
  console.log("Students:", students.map(s => s.email));
  process.exit();
}
test();
