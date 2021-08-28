const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
router.post(
  '/',
  [
    body('title').not().isEmpty().withMessage('must have title'),
    body('description').not().isEmpty().withMessage('describe this role'),
    body('accesses').not().isEmpty().withMessage('accesses is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send('you maked the role');
  }
);
module.exports = router;
