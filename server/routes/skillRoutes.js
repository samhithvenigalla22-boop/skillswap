const express = require('express');
const router = express.Router();
const {
  createSkill,
  getSkills,
  getSkillById,
  getMySkills,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSkill);
router.get('/', getSkills);
router.get('/my-skills', protect, getMySkills);
router.get('/:id', getSkillById);
router.put('/:id', protect, updateSkill);
router.delete('/:id', protect, deleteSkill);

module.exports = router;
