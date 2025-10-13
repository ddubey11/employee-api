import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    addLeave,
    getLeave,
    getLeaves,
    getLeaveDetail,
    updateLeave
} from '../controllers/leaveController.js';

const router = express.Router();

// Test route
router.get( '/test', ( req, res ) => {
    res.send( 'Leave router is active' );
} );

// Get all leaves (admin or filtered)
router.get( '/', authMiddleware, getLeaves );

// Add a new leave
router.post( '/add', authMiddleware, addLeave );

// Get detailed leave info (specific leave record)
router.get( '/detail/:id', authMiddleware, getLeaveDetail );

// Get leaves for a specific employee
router.get( '/employee/:id', authMiddleware, getLeave );

// Update a leave record
router.put( '/:id', authMiddleware, updateLeave );

export default router;
