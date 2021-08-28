const express = require('express');
const router = express.Router();
const { body, checkSchema, validationResult } = require('express-validator');

const schema = {
  phoneNumber: {
    in: 'body',
    matches: {
      options: [/^(\+98|0)?9\d{9}$/],
      errorMessage: 'Invalid phone number',
    },
  },
};

// @route    POST api/users
// @desc     Register EmployeeUser
// @access   Public
router.post(
  '/',
  [
    body('phoneNumber')
      .not()
      .isEmpty()
      .withMessage('phone is required')
      .isNumeric()
      .withMessage('phone must contain nombers')
      .isLength({ min: 11, max: 11 })
      .withMessage('phone need to have 11 charectors')
      .withMessage('not a mobile phone valid number'),
    body('fullName')
      .not()
      .isEmpty()
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage('name can not be less than 3 charactors'),

    checkSchema(schema),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send('Employee user registered');
  }
);

module.exports = router;
