require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const Person = require("./models/person");
const { response } = require("express");
const app = express();

app.use(express.json());
app.use(express.static("frontend-build"));

// Define a reqbody token to log the body of the request
morgan.token("reqbody", (req, res) => {
  return JSON.stringify(req.body);
});

// Using the raw tiny method plus reqbody
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :reqbody"
  )
);

app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    response.send(
      `Phonebook has info for ${persons.length} people<br><br>${new Date()}`
    );
  });
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  const reqId = Number(request.params.id);
  Person.findById(request.params.id)
    .then((person) => response.json(person))
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  const reqId = Number(request.params.id);
  // 404 on not found id could be implemented and
  // still be idempotent. It will not be done in
  // this case
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// POSTing a new person
app.post("/api/persons", async (request, response, next) => {
  const body = request.body;
  // // Ensure fields are present
  // NO LONGER NEEDED DUE TO VALIDATION?
  // if (!body.name) {
  //   return response.status(400).json({
  //     error: "name missing",
  //   });
  // }
  // if (!body.number) {
  //   return response.status(400).json({
  //     error: "number missing",
  //   });
  // }

  // Handle name already in phonebook
  const reqName = body.name;
  const foundPersons = await Person.find({ name: { $eq: reqName } }).catch(
    (error) => next(error)
  );
  if (foundPersons.length > 0) {
    return response.status(400).json({
      error: "name already exists, modify with PUT",
    });
  }
  // Add new person
  const person = new Person({
    name: reqName,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === "ValidationError") {
    return response
      .status(400)
      .send({ error: error.message, name: error.name });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
