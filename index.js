const morgan = require("morgan");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static('frontend-build'))

// Define a reqbody token to log the body of the request
morgan.token('reqbody', (req, res) => {
  return (JSON.stringify(req.body))
})
// Using the raw tiny method plus reqbody
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqbody'))

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateNewId = () => {
  let newId = 0;
  do {
    newId = Math.floor(Math.random() * 10000000);
  } while (persons.map((p) => p.id).includes(newId));
  return newId;
};

app.get("/info", (request, response) => {
  response.send(
    `Phonebook has info for ${persons.length} people<br><br>${new Date()}`
  );
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const reqId = Number(request.params.id);
  const person = persons.find((p) => p.id === reqId);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const reqId = Number(request.params.id);
  // 404 on not found id could be implemented and
  // still be idempotent. It will not be done in
  // this case
  persons = persons.filter((p) => p.id !== reqId);
  response.status(204).end();
});

// POSTing a new person
app.post("/api/persons", (request, response) => {
  const body = request.body;
  // Ensure fields are present
  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  }
  if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    });
  }
  // Handle name already in phonebook
  const reqName = body.name;
  if (persons.map((p) => p.name).includes(reqName)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }
  // Add new person
  const person = {
    id: generateNewId(),
    name: reqName,
    number: body.number,
  };

  persons = persons.concat(person);

  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
