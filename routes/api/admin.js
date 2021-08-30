const express = require('express');
const router = express.Router();
const { body, checkSchema, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');

const AdminUser = require('../../models/users/AdminUser');
const Role = require('../../models/Role');
const ShopItem = require('../../models/shop/ShopItem');
const ShopItemProfile = require('../../models/shop/ShopItemProfile');

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
          res.json({ token, payload });
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

// ;;;;;;;;;;;;;;SHOP;;;;;;;;;;;;;
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
    const errors = validationResult(req, res);
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
// @route    GET /search *****
// @desc     Get Items by title (admin search)
// @access   adminUser

module.exports = router;
