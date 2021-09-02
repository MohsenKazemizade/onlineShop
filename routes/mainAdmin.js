const express = require('express');
const router = express.Router();
const { body, checkSchema, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');

const AdminUser = require('../models/users/AdminUser');
const Role = require('../models/Role');
const ShopItem = require('../models/shop/ShopItem');
const ShopItemProfile = require('../models/shop/ShopItemProfile');
const EmployeeUser = require('../models/users/EmployeeUser');
const EmployeeProfile = require('../models/profiles/EmployeeProfile');

const phoneNumberSchema = {
  phoneNumber: {
    in: 'body',
    matches: {
      options: [/^(\+98|0)?9\d{9}$/],
      errorMessage: 'invalid phone number',
    },
  },
};
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
const passwordSchema = {
  password: {
    in: 'body',
    matches: {
      options: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/],
      errorMessage: 'password must contain letters and number in english',
    },
  },
};
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;adminUser;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
// @route    POST /
// @desc     Create AdminUser
// @access   Main Admin User
router.post(
  '/',
  auth,
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

    const { phoneNumber, password, fullName, role, whoIsRole } = req.body;

    try {
      const mainAdminRole = await Role.findById(whoIsRole);
      if (!mainAdminRole)
        return res.status(401).json({ msg: 'whoIsRole not valid' });
      if (!mainAdminRole.title === 'Main') {
        return res.status(401).json({ msg: 'you are not alowed to do that' });
      }
      const user = await AdminUser.findOne({ phoneNumber });
      const adminrole = await Role.findOne({ title: role });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'admin user already exist' }] });
      }
      if (!adminrole) {
        return res.status(400).json({ errors: [{ msg: 'Role not found' }] });
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
// @route    DELETE /
// @desc     Delete AdminUser
// @access   Main Admin User
router.delete('/', auth, async (req, res) => {
  const { adminUser, whoIsRole } = req.body;
  try {
    const mainAdminRole = await Role.findById(whoIsRole);
    if (!mainAdminRole)
      return res.status(401).json({ msg: 'whoIsRole not valid' });
    if (!mainAdminRole.title === 'Main') {
      return res.status(401).json({ msg: 'you are not alowed to do that' });
    }
    //remove user profiles

    //remove user
    if (!adminUser)
      return res.status(401).json({ msg: 'admin user not found' });
    await AdminUser.findOneAndRemove({ _id: adminUser });
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    POST /login
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
          res.json({ token, payload });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);
// @route    GET /
// @desc     Get All Admin Users
// @access   Main AdminUser
router.get('/', auth, async (req, res) => {
  try {
    const allAdminUsers = await AdminUser.find();
    res.json(allAdminUsers);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;EmployeeUser;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
// @route    POST /employees
// @desc     Create EmployeeUser
// @access   Main Admin User
router.post(
  '/employees',
  auth,
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
    checkSchema(schema),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('111');
      return res.status(400).json({ errors: errors.array() });
    }

    const { password, phoneNumber, fullName, whoIsRole } = req.body;

    try {
      const mainAdminRole = await Role.findById(whoIsRole);
      if (!mainAdminRole)
        return res.status(401).json({ msg: 'whoIsRole not valid' });
      if (!mainAdminRole.title === 'Main') {
        return res.status(401).json({ msg: 'you are not alowed to do that' });
      }
      const user = await EmployeeUser.findOne({ phoneNumber });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Employee user already exist' }] });
      }

      employeeUser = new EmployeeUser({
        phoneNumber,
        password,
        fullName,
      });
      const salt = await bcrypt.genSalt(10);
      employeeUser.password = await bcrypt.hash(password, salt);

      await employeeUser.save();

      const payload = {
        user: {
          id: employeeUser.id,
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
// @route    GET /employees
// @desc     Get All EmployeeUser
// @access   Main Admin User
router.get('/employees', auth, async (req, res) => {
  const { whoIsRole } = req.body;

  try {
    const mainAdminRole = await Role.findById(whoIsRole);
    if (!mainAdminRole)
      return res.status(401).json({ msg: 'whoIsRole not valid' });
    if (!mainAdminRole.title === 'Main') {
      return res.status(401).json({ msg: 'you are not alowed to do that' });
    }
    const allEmployees = await EmployeeUser.find();
    res.json(allEmployees);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    GET /employees/:id
// @desc     Get Employee User Profile By ID
// @access   Admin User
router.get('/employees/:id', auth, async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({
      user: req.params.id,
    }).select('-password');
    if (!profile)
      return res.status(401).json({ msg: 'Employee profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    POST /employees/:id
// @desc     Create Employee User Profile
// @access   Main Admin User
router.post(
  '/employees/:id',
  auth,
  [body('pictureURL', 'picture URL is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { pictureURL, whoIsRole } = req.body;
    const itemProfile = {
      user: req.params.id,
      pictureURL,
    };

    try {
      const mainAdminRole = await Role.findById(whoIsRole);
      if (!mainAdminRole)
        return res.status(401).json({ msg: 'whoIsRole not valid' });
      if (!mainAdminRole.title === 'Main') {
        return res.status(401).json({ msg: 'you are not alowed to do that' });
      }

      let profile = await EmployeeProfile.findOneAndUpdate(
        { user: req.params.id },
        { $set: itemProfile },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('server error');
    }
  }
);
// ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;ROLE;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
// @route    POST /roles
// @desc     Create Role
// @access   Main AdminUser
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
    const { title, description, accesses, whoIsRole } = req.body;
    try {
      const mainAdminRole = await Role.findById(whoIsRole);
      if (!mainAdminRole)
        return res.status(401).json({ msg: 'whoIsRole not valid' });
      if (!mainAdminRole.title === 'Main') {
        return res.status(401).json({ msg: 'you are not alowed to do that' });
      }
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
// @access   Main AdminUser
router.get('/roles', auth, async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;SHOP;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
// @route    POST /:id/shop
// @desc     Create Shop Item
// @access   AdminUser
router.post(
  '/shop/:id',
  auth,
  [
    body('title')
      .not()
      .isEmpty()
      .trim()
      .escape()
      .withMessage('the shop item needs to have a title')
      .isLowercase()
      .withMessage('title needs to be lower case'),
    body('pictureUrl')
      .not()
      .isEmpty()
      .trim()
      .escape()
      .withMessage('piture is required'),
    body('costPerUnit')
      .not()
      .isEmpty()
      .trim()
      .escape()
      .withMessage('shop item needs to have a cost')
      .isNumeric()
      .withMessage('cost must be in number'),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, pictureUrl, costPerUnit, discount, whoIsRole } = req.body;
    try {
      const mainAdminRole = await Role.findById(whoIsRole);
      if (!mainAdminRole)
        return res.status(401).json({ msg: 'whoIsRole not valid' });
      if (!mainAdminRole.title === 'Main') {
        return res.status(401).json({ msg: 'you are not alowed to do that' });
      }
      const item = await ShopItem.findOne({ title });
      if (item) {
        return res
          .status(401)
          .json({ errors: [{ msg: 'item already exists' }] });
      }
      shopitem = new ShopItem({
        title,
        pictureUrl,
        costPerUnit,
        discount,
        maker: req.params.id,
      });
      await shopitem.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).json('server error');
    }
    res.json(shopitem);
  }
);
// @route    POST /shop/:id/item_id
// @desc     Create Shop Item Profile
// @access   AdminUser
router.post(
  '/shop/:id/:item_id',
  auth,
  [
    body('description', 'Description is required'),
    body('unit', 'unit is required'),
    body('minUnit', 'min unit is required'),
    body('maxUnit', 'max unit is required'),
    body('availableAmount', 'available amount is required'),
    body('inShopCategory', 'in shop category is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      description,
      unit,
      minUnit,
      maxUnit,
      availableAmount,
      inShopCategory,
    } = req.body;
    const itemProfile = {
      item: req.params.item_id,
      description,
      unit,
      minUnit,
      maxUnit,
      availableAmount,
      inShopCategory,
      maker: req.params.id,
    };
    try {
      let profile = await ShopItemProfile.findOneAndUpdate(
        { item: req.params.item_id },
        { $set: itemProfile },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('server error');
    }
  }
);
// @route    GET /shop
// @desc     Get All Shop Item
// @access   AdminUser
router.get('/shop', auth, async (req, res) => {
  try {
    const shopitems = await ShopItem.find();
    res.json(shopitems);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    GET /shop/item_id
// @desc     Get Shop Item Profile By item id
// @access   AdminUser
router.get('/shop/:item_id', auth, async (req, res) => {
  try {
    const singleShopItem = await ShopItemProfile.findOne({
      item: req.params.item_id,
    });
    res.json(singleShopItem);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    GET /search *****
// @desc     Get Items by title (admin search)
// @access   adminUser

module.exports = router;
