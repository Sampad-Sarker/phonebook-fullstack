// console.log("backend🖥🖥🖥");

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));
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
  {
    id: 5,
    name: "Sampad Sarker",
    number: "456-658768-342",
  },
];

//generate token
morgan.token("bodyContent", (req) => {
  return JSON.stringify(req.body);
});

// use token
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :bodyContent"
  )
);

//root
app.get("/", (req, res) => {
  res.send("<h1>Phonebook backend 🖥🖥🖥</h1>");
});

//all resource
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} ${
      persons.length > 1 ? "peoples" : "people"
    } <br/> ${new Date()}</p>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end("<h1>not exists</h1>");
    // response.status(404).json({ error: "content missing" });
  }
});

// delete data
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.send("<h1>delete successfully</h1>");
  response.status(204).end();
});

//create new data person
const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;

  const max = 10000;
  const min = maxId;
  const newId = parseInt(Math.random() * (max - min + 1)) + min;
  return newId;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "Name missing",
    });
  } else if (!body.number) {
    return response.status(400).json({ error: "Number missing" });
  }

  const duplicatedPerson = persons.find(
    (person) => person.name.toLowerCase() === body.name.toLowerCase()
  );

  if (duplicatedPerson) {
    if (duplicatedPerson.name) {
      return response.status(400).json({
        error: "The name already exists in the phonebook, name must be unique",
      });
    }
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
