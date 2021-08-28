const express = require('express');
const router = express.Router();
const { body, checkSchema, validationResult } = require('express-validator');

const User = require('../../models/users/CustomerUser');

const schema = {
  phoneNumber: {
    in: 'body',
    matches: {
      options: [/^(\+98|0)?9\d{9}$/],
      errorMessage: 'invalid phone number',
    },
  },
  // password: {
  //   in: 'body',
  //   matches: {
  //     options: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/],
  //     errorMessage: 'password must contain letters and number in english',
  //   },
  // },
};
// @route    POST api/users
// @desc     Register CustomerUser
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
    // body('fullName')
    //   .not()
    //   .isEmpty()
    //   .trim()
    //   .escape()
    //   .isLength({ min: 3 })
    //   .withMessage('name can not be less than 3 charactors'),
    // body('password')
    //   .not()
    //   .isEmpty()
    //   .withMessage('password is required')
    //   .isLength({ min: 8, max: 33 })
    //   .withMessage('password needs to have at least 8 charactors'),
    checkSchema(schema),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { phoneNumber } = req.body;

    try {
      const user = await User.findOne({ phoneNumber });

      if (user) {
        return res.status(400).json({
          errors: [
            {
              msg: 'User already exists',
            },
          ],
        });
      }

      customerUser = new User({
        phoneNumber,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
    await customerUser.save();
    res.send('Customer user Registered');
  }
);

module.exports = router;
