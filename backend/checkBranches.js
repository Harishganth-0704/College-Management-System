const connectToMongo = require("./database/db");
const Branch = require('./models/branch.model');

require('dotenv').config();

const checkBranches = async () => {
  await connectToMongo();
  const branches = await Branch.find({});
  console.log("Branches in DB:", branches);
  process.exit(0);
};

checkBranches();
