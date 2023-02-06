// use express
const express = require('express');
const { stderr } = require('process');
const fs = require('fs');
const { response } = require('express');
// create express app
const app = express();

// JSON parseri, express middleware
app.use(express.json());

// määritetään portti
const port = 3000;

// lisätään json muodossa esimerkkidataaa, h0601
let users = [
  { id: '1', name: 'Kirsi Kernel' },
  { id: '2', name: 'Matti Mainio' },
];
// luodaan vähän html matskua

let htmlform = `
<a href="http://localhost:3000/listUsers">List users</a> || <a href="http://localhost:3000/addUser">Add user</a>
<form action=/users method=post>
Add a new user: <input type=text name=name><br>
<input type=submit  value="add user">
</form>
`;
let linkit = `<a href="http://localhost:3000/listUsers">List users</a> || <a href="http://localhost:3000/addUser">Add user</a>`;

let taulukko = `
<a href="http://localhost:3000/listUsers">List users</a> || <a href="http://localhost:3000/addUser">Add user</a> <br>

<table id="taulukko" border=1>
<thead>
<tr>
<th>ID</th>   <th>Nimi</th>
</tr>
</thead>

<tbody>
`;

//luodaan loggeri middleware, otettu käyttöön  app.use komennolla

const logger = (request, response, next) => {
  const date = new Date();
  const lDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  const log = `${lDate}: ${request.method} ${request.url} \n`;
  console.log(log);

  // tähän koodia että saadaan console.logit filuun
  fs.appendFile('testilog.txt', log + '\n', (err) => {
    if (err) {
      console.log(err);
    }
  });
  next();
};

app.use(logger);

app.use(express.urlencoded({ extended: true }));

// määritetään endpointit
app.get('/', (request, response) => {
  response.send(linkit);
});

// lisätään get metodi joka palauttaa kaikki userit, h0601

app.get('/users', (request, response) => {
  response.json(users);
});

app.get('/addUser', (request, response) => {
  response.send(htmlform);
});

app.get('/listUsers', (request, response) => {
  users.forEach(function (d) {
    taulukko += '<tr> <td> ' + d.id + '</td>';
    taulukko += '<td> ' + d.name + '</td>';
  });
  taulukko += '</tbody>';

  response.send(taulukko);
});

// get pyyntö joka palauttaa yhden käyttäjän

app.get('/users/:id', (request, response) => {
  //const id = request.params.id // note how you can do this in different ways!
  const { id } = request.params;
  const user = users.find((user) => user.id === id);

  // löytyykö käyttäjäää?
  if (user) response.json(user);
  else response.status(404).end();
});

// PUT metodilla päivitetään käyttäjä tietoja
app.put('/users/:id', (request, response) => {
  //const id = request.params.id
  const { id } = request.params;
  // const name = request.query.name
  const { name } = request.query;
  const user = users.find((user) => user.id === id);
  if (user) {
    user.name = name;
    response.status(200).end();
  } else {
    response.status(204).end();
  }
});

// luodaan uusi käyttäjä generoidaan käyttäjälle id

app.post('/users/', (request, response) => {
  const maxId = Math.max(...users.map((user) => user.id), 0);
  const user = request.body;
  user.id = (maxId + 1).toString();
  users = users.concat(user);
  response.redirect('/listUsers');
});

// poistetaan yksi käyttäjä
app.delete('/users/:id', (request, response) => {
  //const id = request.params.id
  const { id } = request.params;
  users = users.filter((user) => user.id !== id);
  // Just send "204 no content" status code back
  response.status(204).end();
});

// start web-server and listen port 3000
app.listen(port, () => {
  console.log('Example app listening on port 3000');
});
