// console.log("backend🖥🖥🖥");

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const People = require("./models/person");

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};

// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
//   {
//     id: 5,
//     name: "Sampad Sarker",
//     number: "456-658768-342",
//   },
// ];

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
app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(requestLogger);

//root
app.get("/", (req, res) => {
  res.send("<h1>Phonebook fullstack backend 🖥🖥🖥</h1>");
});

//all resource
app.get("/api/persons", (req, res) => {
  People.find({}).then((persons) => res.json(persons));
  // res.json(persons);
});

// resource info
app.get("/info", (req, res) => {
  // res.send(
  //   `<p>Phonebook has info for ${persons.length} ${
  //     persons.length > 1 ? "peoples" : "people"
  //   } <br/> ${new Date()}</p>`
  // );
  People.find({}).then((persons) => {
    // res.json(persons)
    res.send(
      `<p>Phonebook has info for ${persons.length} ${
        persons.length > 1 ? "peoples" : "people"
      } <br/> ${new Date()}</p>`
    );
  });
});

//get a single person by id
app.get("/api/persons/:id", (request, response, next) => {
  // const id = Number(request.params.id);
  // const person = persons.find((person) => person.id === id);

  // if (person) {
  //   response.json(person);
  // } else {
  //   response.status(404).end("<h1>not exists</h1>");
  //   // response.status(404).json({ error: "content missing" });
  // }
  People.findById(request.params.id)
    .then((person) => {
      // response.json(person)

      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      // console.log(error);
      // response.status(500).send({error:"malformed id"});
      next(error);
    });
});

//update a person by id
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const updatedPerson = {
    name: body.name,
    number: body.number,
  };

  People.findByIdAndUpdate(request.params.id, updatedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

// delete data
app.delete("/api/persons/:id", (request, response, next) => {
  // const id = Number(request.params.id);
  // persons = persons.filter((person) => person.id !== id);

  // response.send("<h1>delete successfully</h1>");
  // response.status(204).end();
  People.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

//create new data person
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "Name missing",
    });
  } else if (!body.number) {
    return response.status(400).json({ error: "Number missing" });
  }

  // const duplicatedPerson = persons.find(
  //   (person) => person.name.toLowerCase() === body.name.toLowerCase()
  // );

  // if (duplicatedPerson) {
  //   if (duplicatedPerson.name) {
  //     return response.status(400).json({
  //       error: "The name already exists in the phonebook, name must be unique",
  //     });
  //   }
  // }

  // const person = {
  //   id: generateId(),
  //   name: body.name,
  //   number: body.number,
  // };

  // persons = persons.concat(person);
  // response.json(person);
  const person = new People({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
