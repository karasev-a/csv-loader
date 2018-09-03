const express = require('express');
const { newUsersController } = require('../controllers');

const router = express.Router();

router.get('/from_server', newUsersController.getUsersFromBd);
router.get('/to_server', newUsersController.getUsersFromDisk);
router.get('/', (res, req) => {
  req.end('<h1>Download new CSV file!</h1>')
});


module.exports = router;