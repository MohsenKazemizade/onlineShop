const express = require('express');
const router = express.Router();
const { body, checkSchema, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const moment = require('moment');

const AdminUser = require('../models/users/AdminUser');
const Role = require('../models/Role');
const ShopItem = require('../models/shop/ShopItem');
const ShopItemProfile = require('../models/shop/ShopItemProfile');
const EmployeeUser = require('../models/users/EmployeeUser');
const EmployeeProfile = require('../models/profiles/EmployeeProfile');
const DiscountCard = require('../models/DiscountCard');
const Advertise = require('../models/Advertise');
const DeliverySection = require('../models/DeliverySection');
const BlogPost = require('../models/posts/BlogPost');

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
const converDateToUTCAndUnix = date => {
  //moment().toISOString() // 2013-02-04T22:44:30.652Z
  const unix = moment(new Date(date)).format('x');
  return unix;
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

      res.json(adminUser);
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
    const userAdmin = await AdminUser.findOne({ _id: adminUser });
    if (!userAdmin)
      return res.status(401).json({ msg: 'admin user not found' });
    await AdminUser.findOneAndRemove({ _id: adminUser });
    res.json({ msg: `${userAdmin.fullName} deleted successfully` });
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
        role: {
          id: user.role,
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

      res.json(employeeUser);
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
// @route    GET /employees/profiles
// @desc     Get All Employee Users Profiles
// @access   Main Admin User
router.get('/employees/profiles', auth, async (req, res) => {
  const { whoIsRole } = req.body;

  try {
    const mainAdminRole = await Role.findById(whoIsRole);
    if (!mainAdminRole)
      return res.status(401).json({ msg: 'whoIsRole not valid' });
    if (!mainAdminRole.title === 'Main') {
      return res.status(401).json({ msg: 'you are not alowed to do that' });
    }
    const allEmployeesProfiles = await EmployeeProfile.find();
    res.json(allEmployeesProfiles);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    GET /employees/profile/:id
// @desc     Get Employee User Profile By ID
// @access   Main Admin User
router.get('/employees/profile/:id', auth, async (req, res) => {
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
// @route    POST /employees/profile/:id
// @desc     Create/update Employee User Profile
// @access   Main Admin User
router.post(
  '/employees/profile/:id',
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
    res.json(adminRole);
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
// @route    POST /shop/:id
// @desc     Create Shop Item
// @access   Main Admin User
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
// @desc     Create/update Shop Item Profile
// @access   Main Admin User
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
// @access   Main Admin User
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
// @access   Main Admin User
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
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;discountCard;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
//**********in code badan bayad bere samte client oonja generate beshe********
// @route    POST /discount/newcode
// @desc     POST NEW CODE
// @access   MainAdminUser
router.post('/discount/newcode', auth, async (req, res) => {
  const { length } = req.body;
  try {
    if (!length) return res.status(401).json({ msg: 'we need length' });
    // const newcode = length => {
    let result = '';
    let characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    // return result;
    return res.send(result);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    POST /discount
// @desc     Create Discount Card
// @access   MainAdminUser
router.post(
  '/discount/:id',
  auth,
  [
    body('title'),
    body('useCode'),
    body('category'),
    body('expiresIn'),
    body('discountAmount'),
    body('discountType'),
    body('timesOfUseAvailable'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      useCode,
      category,
      expiresIn,
      discountAmount,
      discountType,
      timesOfUseAvailable,
      whoIsRole,
    } = req.body;

    try {
      const mainAdminRole = await Role.findById(whoIsRole);
      if (!mainAdminRole)
        return res.status(401).json({ msg: 'whoIsRole not valid' });
      if (!mainAdminRole.title === 'Main') {
        return res.status(401).json({ msg: 'you are not alowed to do that' });
      }
      const newDiscountCard = await DiscountCard.findOne({ useCode });
      if (newDiscountCard)
        return res
          .status(401)
          .json({ msg: 'you have made this discount card before' });

      discountCard = new DiscountCard({
        title,
        maker: req.params.id,
        useCode,
        category,
        expiresIn,
        discountAmount,
        discountType,
        timesOfUseAvailable,
      });
      await discountCard.save();
      res.json(discountCard);
    } catch (err) {
      console.error(err.message);
      res.status(500).json('server error');
    }
  }
);
// @route    GET /discount
// @desc     GET all Discount Cards
// @access   MainAdminUser
router.get('/discount', auth, async (req, res) => {
  try {
    const allDiscountCards = await DiscountCard.find();
    res.json(allDiscountCards);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;advertise;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
// @route    POST /add/:id
// @desc     Create New Add
// @access   MainAdminUser
router.post(
  '/add/:id',
  auth,
  [
    body('title', 'title is required'),
    body('pictureUrl', 'pictureUrl is required'),
    body('description', 'description is required'),
    body('periodOnScrean', 'periodOnScrean is required'),
    body('whereToScrean', 'whereToScrean is required'),
    body('link', 'link is required'),
    body('whoIsThisAdFor', 'whoIsThisAdFor is required'),
    body('maker', 'maker is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      pictureUrl,
      description,
      periodOnScrean,
      whereToScrean,
      link,
      whoIsThisAdFor,
      costOfAd,
    } = req.body;
    try {
      const add = await Advertise.findOne({ title });
      if (add)
        return res.status(401).json({ msg: 'this add is already created' });

      newAdd = new Advertise({
        title,
        pictureUrl,
        description,
        periodOnScrean,
        whereToScrean,
        link,
        whoIsThisAdFor,
        costOfAd,
        maker: req.params.id,
      });
      await newAdd.save();
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('server error');
    }
    res.json(newAdd);
  }
);
// @route    GET /add
// @desc     Get All Adds
// @access   MainAdminUserw
router.get('/add', auth, async (req, res) => {
  try {
    const AllAdds = await Advertise.find();
    res.json(AllAdds);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    DELETE /add
// @desc     Delete Add by id
// @access   Main Admin User
router.delete('/add', auth, async (req, res) => {
  const { addId, whoIsRole } = req.body;
  try {
    const mainAdminRole = await Role.findById(whoIsRole);
    if (!mainAdminRole)
      return res.status(401).json({ msg: 'whoIsRole not valid' });
    if (!mainAdminRole.title === 'Main') {
      return res.status(401).json({ msg: 'you are not alowed to do that' });
    }
    const add = await Advertise.findOne({ _id: addId });
    if (!add) return res.status(401).json({ msg: 'admin user not found' });
    await Advertise.findOneAndRemove({ _id: addId });
    res.json({ msg: `${add.title} deleted successfully` });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    GET /add/date
// @desc     Get Add by Date
// @access   MainAdminUserw
router.get('/add/date', auth, async (req, res) => {
  const { date } = req.body;
  const dateUTC = converDateToUTCAndUnix(date);
  console.log(converDateToUTCAndUnix(date));
  try {
    const add = await Advertise.findOne({ date: dateUTC });
    if (!add) return res.status(401).json({ msg: 'add not found' });
    res.json(add);
    console.log(add.date);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;delivery;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
// @route    POST /delivery/:id
// @desc     Create New Delivery Section
// @access   AdminUser
router.post(
  '/delivery/:id',
  auth,
  [
    body('sectionStart', 'sectionStart is required'),
    body('sectionEnd', 'sectionEnd is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(401).json({ errors: errors.array() });

    const { sectionStart, sectionEnd } = req.body;
    try {
      const section = await DeliverySection.findOne({ sectionStart });
      if (section)
        return res.status(401).json({ msg: 'section is already exist' });

      deliverySection = new DeliverySection({
        sectionStart,
        sectionEnd,
        maker: req.params.id,
      });
      console.log(deliverySection);
      await deliverySection.save();
      res.json(deliverySection);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('server error');
    }
  }
);
// @route    GET /delivery
// @desc     Get All Delivery Section
// @access   AdminUser
router.get('/delivery', auth, async (req, res) => {
  try {
    const section = await DeliverySection.find();
    res.json(section);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    DELETE /delivery
// @desc     Get All Delivery Section
// @access   AdminUser
router.delete('/delivery/:id', auth, async (req, res) => {
  const { sectionID } = req.body;
  try {
    const admin = await AdminUser.findById({ _id: req.params.id });
    if (!admin)
      return res
        .statuse(401)
        .json({ msg: 'you have no permission to do that' });

    const section = await DeliverySection.findById({ _id: sectionID });
    if (!section)
      return res.statuse(401).json({ msg: 'this section is not exists' });

    await DeliverySection.findOneAndRemove({ _id: sectionID });
    res.json({ msg: 'section deleted successfully' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;blogpost;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
// @route    POST /blog/:id
// @desc     Create New Blog Post
// @access   AdminUser
router.post(
  '/blog/:id',
  auth,
  [
    body('title', 'title is required'),
    body('pictureUrl', 'pictureUrl is required'),
    body('text', 'text is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(401).json({ errors: errors.array() });

    const { title, text, pictureUrl } = req.body;
    try {
      const post = await BlogPost.findOne({ title });
      if (post)
        return res.status(401).json({ msg: 'this post is already exist' });

      blogPost = new BlogPost({
        title,
        pictureUrl,
        text,
        maker: req.params.id,
      });
      await blogPost.save();
      res.json(blogPost);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('server error');
    }
  }
);
// @route    GET /blog
// @desc     GET All Blog Posts
// @access   AdminUser
router.get('/blog', auth, async (req, res) => {
  try {
    const blogPosts = await BlogPost.find();
    res.json(blogPosts);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    GET /blog/:post_id
// @desc     GET Blog Post By ID
// @access   AdminUser
router.get('/blog/:post_id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById({ _id: req.params.post_id });
    if (!post) return res.status(401).json({ msg: 'this post is not exist' });
    res.json(post);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route    DELETE /blog/:post_id
// @desc     GET Blog Post By ID
// @access   MainAdminUser
router.delete('/blog', auth, async (req, res) => {
  const { postId, whoIsRole } = req.body;
  try {
    const mainAdminRole = await Role.findById(whoIsRole);
    if (!mainAdminRole)
      return res.status(401).json({ msg: 'whoIsRole not valid' });
    if (!mainAdminRole.title === 'Main') {
      return res.status(401).json({ msg: 'you are not alowed to do that' });
    }
    const postMustDelete = await BlogPost.findById({ _id: postId });
    if (!postMustDelete)
      return res.status(401).json({ msg: 'this post was deleted already' });

    await BlogPost.findOneAndRemove({ _id: postId });
    res.json({ msg: 'post deleted Successfully' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
module.exports = router;
