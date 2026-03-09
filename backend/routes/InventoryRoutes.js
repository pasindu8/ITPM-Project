const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const { addInventoryItem, getAllInventoryItems, updateInventoryItem, AssignmentsItem, StudentNameList, getAssignedItems} = require('../controllers/InventoryController');

router.post('/add', protect, addInventoryItem);
router.get('/all', protect, getAllInventoryItems);
router.put('/update/:itemId', protect, updateInventoryItem);
router.post('/assign', protect, AssignmentsItem);
router.get('/assigned', protect, getAssignedItems);
router.get('/students', protect, StudentNameList);

module.exports = router;