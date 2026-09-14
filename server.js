const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send(`<h1>Hello from Kubernetes! Running on Pod: ${process.env.HOSTNAME}</h1>`);
});

app.get('/compute', (req, res) => {
  let count = 0;
  for (let i = 0; i < 2e7; i++) { count += i; }
  res.send(`Computed sum. Load applied by Pod: ${process.env.HOSTNAME}`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});