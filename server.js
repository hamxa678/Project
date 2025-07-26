const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// Load business data
const businessData = require('./data/businesses.json');

// Load Submission data
const allSubmissionsData = require('./data/submissions.json');

// API to fetch all submission of the reviews
app.get('/api/submissions/',(req, res) => {
  const allSubmissions = allSubmissionsData[req.params.id];
  if (!allSubmissions) return res.status(404).json({ error: 'There are no Review submission right now' });
  res.json(allSubmissions);
});

// API to fetch business data
app.get('/api/business/:id', (req, res) => {
  const business = businessData[req.params.id];
  if (!business) return res.status(404).json({ error: 'Business not found or Invalid business ID!' });
  res.json(business);
});

// API to log interaction
app.post('/api/interaction', async (req, res) => {
  const dataPath = './data/interactions.json';
  const interactions = await fs.readJson(dataPath).catch(() => []);
  interactions.push({ ...req.body, timestamp: new Date().toISOString() });
  await fs.writeJson(dataPath, interactions, { spaces: 2 });
  res.json({ success: true });
});

// API to log feedback submission
app.post('/api/feedback', async (req, res) => {
  const dataPath = './data/submissions.json';
  const submissions = await fs.readJson(dataPath).catch(() => []);
  submissions.push({ ...req.body, timestamp: new Date().toISOString() });
  await fs.writeJson(dataPath, submissions, { spaces: 2 });
  res.json({ success: true });
});

app.get('/review', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});