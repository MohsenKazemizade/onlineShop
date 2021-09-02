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
// @route    POST /login
// @desc     Login AdminUser and get token
// @access   AdminUser
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
    const mainAdminPhone = 09999999999;
    try {
      if (phoneNumber == mainAdminPhone)
        return res.status(401).json({ msg: 'you cant login here' });
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
// @desc     Get AdminUser Profile By ID
// @access   AdminUser
router.get('/', auth, async (req, res) => {
  const { adminUser } = req.body;
  try {
    const profile = await EmployeeProfile.findOne({ user: adminUser });
    if (!profile)
      return res.status(401).json({ msg: 'there is no profile for this user' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    POST /:id
// @desc     Create/Update Admin User Profile
// @access   AdminUser
router.post(
  '/:id',
  auth,
  [body('pictureURL', 'picture URL is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { pictureURL } = req.body;

    try {
      const itemProfile = {
        user: req.params.id,
        pictureURL,
      };

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
// ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;EmployeeUser;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
// @route    GET /employees
// @desc     Get All EmployeeUser
// @access   AdminUser
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
// @access   AdminUser
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
    const { title, pictureUrl, costPerUnit, discount } = req.body;
    try {
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
// @route    POST /:id/shop/item_id
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
