const express = require('express');
const router = express.Router();
const { body, checkSchema, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');

const ShopItem = require('../../models/shop/ShopItem');
const ShopItemProfile = require('../../models/shop/ShopItemProfile');
// @route    GET /
// @desc     Get All Shop items
// @access   Public
router.get('/', async (req, res) => {
  try {
    const shopList = await ShopItem.find();
    res.json(shopList);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});
// @route    GET /
// @desc     Get Item Profile By ID
// @access   Public
router.get('/:item_id', async (req, res) => {
  try {
    const profile = await ShopItemProfile.findOne({ item: req.params.item_id });
    if (!profile)
      return res.status(400).json({ msg: 'item profile not found' });
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

// @route    GET /:title
// @desc     Get Items by title (client search)
// @access   Public

module.exports = router;
