const express = require('express');
const app = express();

// Define the TODO array
const todos = [];
let maxId = 0; // initialize maxId to 0

// *** Question1 *** //

app.get('/todo/health', (req, res) => {
  res.status(200).send('OK');
});

// *** Question2 *** //

// Middleware to parse JSON request body
app.use(express.json());

// POST endpoint to create a new TODO item
app.post('/todo', (req, res) => {
  const { title, content, dueDate } = req.body;

  // Check if a TODO with this title already exists
  if (todos.some(todo => todo.title === title)) {
    const errorMessage = `Error: TODO with the title [${title}] already exists in the system`;
    return res.status(409).json({ result: null, errorMessage});
  }

  // Check if dueDate is in the future
  if (Number(dueDate) < Date.now()) {
    const errorMessage = 'Error: Can’t create new TODO that its due date is in the past';
    return res.status(409).json({ result: null, errorMessage});
  }

  // Assign a new id to the TODO
  const id = maxId + 1; // use the next id after the maximum id
  maxId = id; // update the maximum id

  // Create a new TODO object with the PENDING status
  const todo = { id, title, content, dueDate, status: 'PENDING' };

  // Add the new TODO to the array
  todos.push(todo);

  // Send the response with the new TODO id and title
  res.status(200).json({ result: id, errorMessage: null});
});

// *** Question3 *** //
app.get('/todo/size', (req, res) => {
  const status = req.query.status;

  // Validate the status query parameter
  if (!['ALL', 'PENDING', 'LATE', 'DONE'].includes(status)) {
    return res.status(400).send('Bad Request: Invalid status filter');
  }

  // Filter the TODOs based on the status
  const filteredTodos = todos.filter(todo => {
    if (status === 'ALL') {
      return true;
    } else if (status === 'PENDING') {
      return todo.status === 'PENDING';
    } else if (status === 'LATE') {
      return todo.dueDate < Date.now() && todo.status !== 'DONE';
    } else if (status === 'DONE') {
      return todo.status === 'DONE';
    }
  });

  // Get the total number of TODOs
  const count = filteredTodos.length;

  // Send the response with the count
  res.status(200).json({ result: count });
});

// *** Question4 *** //
// GET endpoint to retrieve TODOs data
app.get('/todo/content', (req, res) => {
  const { status, sortBy } = req.query;

  // Validate status parameter
  const validStatuses = ['ALL', 'PENDING', 'LATE', 'DONE'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status parameter' });
  }

  // Validate sortBy parameter
  const validSortBy = ['ID', 'DUE_DATE', 'TITLE'];
  if (sortBy && !validSortBy.includes(sortBy)) {
    return res.status(400).json({ error: 'Invalid sortBy parameter' });
  }

  // Filter TODOs by status
  const filteredTodos = status === 'ALL' ? todos : todos.filter(todo => todo.status === status);

  // Sort TODOs by sortBy parameter or by ID if sortBy is not provided
  const sortedTodos = sortBy
    ? filteredTodos.sort((a, b) => a[sortBy] - b[sortBy])
    : filteredTodos.sort((a, b) => a.id - b.id);

  // Map TODOs to an array of objects with only the required fields
  const todoObjects = sortedTodos.map(({ id, title, content, status, dueDate }) => ({
    id,
    title,
    content,
    status,
    dueDate,
  }));

  // Send the response with the array of TODO objects
  res.status(200).json(todoObjects);
});

// *** Question5 *** //
// PUT endpoint to update the status of a TODO item by ID
app.put('/todo', (req, res) => {
  const { id, status } = req.query;

  // Find the TODO item by ID
  const todo = todos.find(todo => todo.id === parseInt(id));

  // If no such TODO with that id can be found, return 404 Not Found error
  if (!todo) {
    const errorMessage = `Error: no such TODO with id ${id}`;
    return res.status(404).json({ result: null, errorMessage });
  }

  // If status is not one of the allowed values, return 400 Bad Request error
  if (!['PENDING', 'LATE', 'DONE'].includes(status)) {
    const errorMessage = 'Error: status should be one of PENDING, LATE, or DONE';
    return res.status(400).json({ result: null, errorMessage });
  }

  // Save the old status before updating it
  const oldStatus = todo.status;

  // Update the status of the TODO item
  todo.status = status;

  // Send the response with the old status
  res.status(200).json({ result: oldStatus, errorMessage: null });
});

// *** Question6 *** //

// DELETE endpoint to delete a TODO item by ID
app.delete('/todo', (req, res) => {
  const id = Number(req.query.id);

  // Find the index of the TODO with the given id
  const index = todos.findIndex(todo => todo.id === id);

  // Check if the TODO exists
  if (index === -1) {
    const errorMessage = `Error: no such TODO with id ${id}`;
    return res.status(404).json({ result: null, errorMessage });
  }

  // Remove the TODO from the array
  const [todo] = todos.splice(index, 1);

// Re-assign new ids to the remaining TODO items to ensure uniqueness
todos.forEach((todo, index) => {
  todo.id = index + 1;
  });

  // Send the response with the new TODO count
  res.status(200).json({ result: todos.length, errorMessage: null });
});




// Start the server
const port = 9285; // You can use any valid port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});