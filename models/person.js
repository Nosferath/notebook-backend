const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

console.log("Connecting to database");
mongoose
  .connect(url)
  .then(() => { // arg was result
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    minlength: 8,
    validate: {
      // Only numbers and up to a single hyphen allowed
      // If a hyphen is present, only 2 or 3 numbers must be before it
      validator: v => /^\d{2,3}-?\d{1,}$/.test(v)
    },
    required: true
  }
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
