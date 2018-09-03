const express = require('express');
const newUsersRouter = require('./newUsersRouter');

const router = express.Router();

router.use('/new_users', newUsersRouter);
// router.use('/update_users', updateUserRouter);

router.get('/', (req, res) => {
  res.send("<h1>App for working with CSV files </h1>");
});

module.exports = router;
