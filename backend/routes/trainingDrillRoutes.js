const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const { 
    addTrainingDrill, 
    getAllTrainingDrills, 
    getTrainingDrillById, 
    updateTrainingDrill, 
    deleteTrainingDrill,
    getDrillsByCategory
} = require('../controllers/TrainingDrillController');

router.post('/add', protect, addTrainingDrill);
router.get('/all', protect, getAllTrainingDrills);
router.get('/:drillId', protect, getTrainingDrillById);
router.put('/update/:drillId', protect, updateTrainingDrill);
router.delete('/delete/:drillId', protect, deleteTrainingDrill);
router.get('/category/:category', protect, getDrillsByCategory);

module.exports = router;
