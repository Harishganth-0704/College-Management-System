const connectToMongo = require("./database/db");
const Note = require('./models/note.model');

const checkNotes = async () => {
  await connectToMongo();
  const notes = await Note.find({});
  console.log("All Notes:", notes);
  process.exit(0);
};

checkNotes();
