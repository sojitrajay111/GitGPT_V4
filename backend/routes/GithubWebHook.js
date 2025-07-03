const express = require('express');
const router = express.Router();

router.post('/webhook', (req, res) => {
  // You can log the payload for now
  console.log('Received GitHub webhook:', req.body);

  // Respond with 200 OK so GitHub knows it was received
  res.status(200).send('Webhook received');
});

module.exports = router;
