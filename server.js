const express = require('express');
const { handler } = require('./netlify/functions/submit-comment');

const app = express();
app.use(express.json());

// Handle both POST and OPTIONS at the same route
app.all('/netlify/submit-comment', async (req, res) => {
  const event = {
    httpMethod: req.method,
    body: JSON.stringify(req.body),
  };
  const result = await handler(event, {});
  res.set(result.headers || {}).status(result.statusCode).send(result.body);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});