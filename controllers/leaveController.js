import Employee from '../models/Employee.js';
import mongoose from 'mongoose';
import Leave from '../models/Leave.js';
import axios from 'axios';


const addLeave = async ( req, res ) => {
    try {
        const { userId, leaveType, startDate, endDate, reason } = req.body;

        // Validate required fields
        if ( !userId || !leaveType || !startDate || !endDate || !reason ) {
            return res.status( 400 ).json( { success: false, error: 'All fields are required.' } );
        }
        const employee = await Employee.findOne( { userId } );

        // Check if employee exists
        if ( !employee ) {
            console.warn( `No employee found for userId: ${userId}` );
            return res.status( 404 ).json( { success: false, error: 'Employee not found.' } );
        }

        const newLeave = new Leave( {
            employeeId: employee._id,
            leaveType,
            startDate,
            endDate,
            reason,
        } );

        await newLeave.save();

        res.status( 200 ).json( { success: true } );
    } catch ( error ) {
        console.error( 'Error adding leave:', error );
        res.status( 500 ).json( { success: false, error: 'Leave Add server error' } );
    }
};

const getLeave = async ( req, res ) => {
    try {
        const { id } = req.params;

        // First attempt: find leaves by employeeId directly
        let leaves = await Leave.find( { employeeId: id } );

        // If no leaves found, try resolving employeeId from userId
        if ( !leaves || leaves.length === 0 ) {
            const employee = await Employee.findOne( { userId: id } );

            if ( !employee ) {
                return res.status( 404 ).json( { success: false, message: 'Employee not found for given userId' } );
            }

            leaves = await Leave.find( { employeeId: employee._id } );
        }

        return res.status( 200 ).json( { success: true, leaves } );
    } catch ( error ) {
        console.error( 'Error fetching leaves:', error );
        res.status( 500 ).json( { success: false, error: 'Get Leave server error' } );
    }
};
const getLeaves = async ( req, res ) => {
    try {
        const leaves = await Leave.find().populate( {
            path: "employeeId",
            select: "employeeId department userId", // ✅ include employeeId (the string one)
            populate: [
                {
                    path: "department",
                    select: "dept_name"
                },
                {
                    path: "userId",
                    select: "name"
                }
            ]
        } );
        return res.status( 200 ).json( { success: true, leaves } );
    } catch ( error ) {
        return res.status( 500 ).json( { success: false, error: "Leaves View Server Error" } )
    }
}
const getLeaveDetail = async ( req, res ) => {
    try {
        const { id } = req.params;
        const leave = await Leave.findById( id ).populate( {
            path: "employeeId",
            select: "employeeId department userId", // ✅ include employeeId (the string one)
            populate: [
                {
                    path: "department",
                    select: "dept_name"
                },
                {
                    path: "userId",
                    select: "name profileImage"
                }
            ]
        } );
        return res.status( 200 ).json( { success: true, leave } );
    } catch ( error ) {
        return res.status( 500 ).json( { success: false, error: "Leaves View Server Error" } )
    }
}
const updateLeave = async ( req, res ) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if ( !mongoose.Types.ObjectId.isValid( id ) ) {
            return res.status( 400 ).json( { success: false, error: "Invalid leave ID" } );
        }

        const leave = await Leave.findByIdAndUpdate(
            id,
            { status: req.body.status, updatedAt: new Date() },
            { new: true }
        );

        if ( !leave ) {
            return res.status( 404 ).json( { success: false, error: "Leave not found" } );
        }

        return res.status( 200 ).json( { success: true, leave } );
    } catch ( error ) {
        console.error( "Update error:", error.message );
        return res.status( 500 ).json( { success: false, error: "Leave update server error" } );
    }
};

export { addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave };