// routes/collaboratorRoutes.js

const express = require('express');
const router = express.Router();
const { addCollaborator } = require('../controllers/collaboratorController');

router.post('/add', addCollaborator);


module.exports = router;