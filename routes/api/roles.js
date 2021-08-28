const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Role = require('../../models/Role');
// @route    POST api/role
// @desc     Register Role
// @access   Admin
router.post(
  '/',
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
module.exports = router;
