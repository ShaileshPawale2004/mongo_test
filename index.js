require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing form data

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User schema and model
const UserSchema = new mongoose.Schema({
  name: String,
  password: String
});
const User = mongoose.model('User', UserSchema);

// Home page route with form
app.get("/", (req, res) => {
  res.send(`
    <h1>Welcome to the User API!</h1>
    <form method="POST" action="/submit">
      <input type="text" name="name" placeholder="Enter name" required /><br/><br/>
      <input type="password" name="password" placeholder="Enter password" required /><br/><br/>
      <button type="submit">Submit</button>
    </form>
  `);
});

// Handle form submission
app.post('/submit', async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = new User({ name, password });
    await user.save();
    res.send(`<h2>User Saved Successfully!</h2><a href="/">Go Back</a>`);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// API Endpoints (Optional: still keep CRUD for Postman/test)
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.send(users);
});

app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send({ message: "User not found" });
  res.send(user);
});

app.put('/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!user) return res.status(404).send({ message: "User not found" });
  res.send(user);
});

app.delete('/users/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).send({ message: "User not found" });
  res.send({ message: "User deleted" });
});

// Start server
app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));
