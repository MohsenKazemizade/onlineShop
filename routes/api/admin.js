const express = require('express');
const router = express.Router();
const { body, checkSchema, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');

const AdminUser = require('../../models/users/AdminUser');
const Role = require('../../models/Role');

const schema = {
  phoneNumber: {
    in: 'body',
    matches: {
      options: [/^(\+98|0)?9\d{9}$/],
      errorMessage: 'invalid phone number',
    },
  },
  password: {
    in: 'body',
    matches: {
      options: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/],
      errorMessage: 'password must contain letters and number in english',
    },
  },
};
// @route    POST api/admin
// @desc     Register AdminUser
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
    body('password')
      .not()
      .isEmpty()
      .withMessage('password is required')
      .isLength({ min: 8, max: 33 })
      .withMessage('password needs to have at least 8 charactors'),
    body('role').not().isEmpty().withMessage('Employee must have role'),
    checkSchema(schema),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, password, fullName, role } = req.body;

    try {
      const user = await AdminUser.findOne({ phoneNumber });
      const adminrole = await Role.findOne({ title: role });
      if (!adminrole) {
        return res.status(400).json({ errors: [{ msg: 'Role not found' }] });
      }

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'admin user already exist' }] });
      }
      adminUser = new AdminUser({
        phoneNumber,
        fullName,
        password,
        role: adminrole.id,
      });

      const salt = await bcrypt.genSalt(10);
      adminUser.password = await bcrypt.hash(password, salt);

      await adminUser.save();

      const payload = {
        user: {
          id: adminUser.id,
        },
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

// @route    POST api/admin/login
// @desc     Login AdminUser and get token
// @access   Public
router.post(
  '/login',
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
    body('password').not().isEmpty().withMessage('password is required'),
    checkSchema(schema),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, password } = req.body;

    try {
      const user = await AdminUser.findOne({ phoneNumber });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'invalid phone or password' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'invalid phone or password' }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);
// ;;;;;;;;;;;;;;;;ROLE;;;;;;;;;;;;;;
// @route    POST /roles
// @desc     Register Role
// @access   AdminUser
router.post(
  '/roles',
  auth,
  [
    body('title').not().isEmpty().withMessage('must have title'),
    body('description').not().isEmpty().withMessage('describe this role'),
    body('accesses').not().isEmpty().withMessage('accesses is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, accesses } = req.body;
    try {
      const role = await Role.findOne({ title });
      if (role) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Role is already exist' }] });
      }

      adminRole = new Role({ title, description, accesses });

      await adminRole.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
    res.send('you maked the role');
  }
);

// @route    GET /roles
// @desc     Get All Role
// @access   AdminUser
router.get('/roles', auth, async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;
