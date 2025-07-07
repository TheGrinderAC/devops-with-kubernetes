const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let todos = [];

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const { todo } = req.body;
  if (todo) {
    todos.push(todo);
    res.status(201).json({ todo });
  } else {
    res.status(400).json({ error: 'Todo content is missing' });
  }
});

app.listen(port, () => {
  console.log(`Todo backend listening at http://localhost:${port}`);
});
