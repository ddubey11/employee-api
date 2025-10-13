import path from 'path';
import fs from 'fs';
import multer from 'multer';
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from 'bcrypt';
import Department from '../models/Department.js';

const storage = multer.diskStorage( {
    destination: ( req, file, cb ) => {
        cb( null, "public/uploads" );
    },
    filename: ( req, file, cb ) => {
        cb( null, Date.now() + path.extname( file.originalname ) );
    },
} );

const upload = multer( {
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: ( req, file, cb ) => {
        const allowedTypes = /jpeg|jpg|png/;
        const ext = path.extname( file.originalname ).toLowerCase();
        if ( allowedTypes.test( ext ) ) {
            cb( null, true );
        } else {
            cb( new Error( "Only images (jpeg, jpg, png) are allowed" ) );
        }
    },
} );

const addEmployee = async ( req, res ) => {
    try {
        const {
            name,
            email,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            password,
            role,
        } = req.body;

        if ( !name || !email || !employeeId || !dob || !password || !role || !department ) {
            return res.status( 400 ).json( { success: false, error: "Missing required fields" } );
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne( { email: normalizedEmail } );
        if ( existingUser ) {
            // Delete uploaded image if it exists
            if ( req.file ) {
                const imagePath = path.join( "public/uploads", req.file.filename );
                fs.unlink( imagePath, ( err ) => {
                    if ( err ) console.error( "Error deleting image:", err );
                } );
            }
            return res.status( 400 ).json( { success: false, error: "User already exists" } );
        }

        const hashPassword = await bcrypt.hash( password, 10 );

        const newUser = new User( {
            name,
            email: normalizedEmail,
            password: hashPassword,
            role,
            profileImage: req.file ? req.file.filename : "",
        } );

        const savedUser = await newUser.save();

        const newEmployee = new Employee( {
            userId: savedUser._id,
            employeeId,
            dob: new Date( dob ),
            gender,
            maritalStatus,
            designation,
            department,
            salary: Number( salary ),
        } );

        await newEmployee.save();

        return res.status( 200 ).json( { success: true, message: "Employee added successfully" } );
    } catch ( error ) {
        console.error( "Error adding employee:", error );
        return res.status( 500 ).json( { success: false, error: error.message || "Server Error" } );
    }
};
const getEmployees = async ( req, res ) => {
    try {
        const employees = await Employee.find()
            .populate( 'userId', { password: 0 } )
            .populate( 'department' )
        return res.status( 200 ).json( { success: true, employees } )
    } catch ( error ) {
        return res.status( 500 ).json( { success: false, error: "Get Employees Server Error." } )
    }
}
const getEmployee = async ( req, res ) => {
    const { id } = req.params;

    try {
        let employee = await Employee.findById( id )
            .populate( 'userId', '-password' )
            .populate( 'department' );

        // If not found by _id, try finding by userId
        if ( !employee ) {
            employee = await Employee.findOne( { userId: id } )
                .populate( 'userId', '-password' )
                .populate( 'department' );
        }

        return res.status( 200 ).json( { success: true, employee } );
    } catch ( error ) {
        console.error( 'Error fetching employee:', error );
        return res.status( 500 ).json( { success: false, error: 'Get Employees Server Error.' } );
    }
};

const updateEmployee = async ( req, res ) => {
    try {
        const { id } = req.params;
        const {
            name,
            employeeId,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            role,
        } = req.body;

        // Check if employee exists
        const employee = await Employee.findById( id );
        if ( !employee ) {
            return res.status( 404 ).json( { success: false, error: "Employee Not Found." } );
        }

        // Update User (name and role)
        const updateUser = await User.findByIdAndUpdate(
            employee.userId,
            { name, role },
            { new: true, runValidators: true }
        );

        // Update Employee details
        const updateEmployee = await Employee.findByIdAndUpdate(
            id,
            {
                employeeId,
                maritalStatus,
                gender,
                designation,
                department,
                salary,
            },
            { new: true, runValidators: true }
        );

        return res.status( 200 ).json( {
            success: true,
            message: "Employee updated successfully",
            employee: updateEmployee,
            user: updateUser,
        } );
    } catch ( error ) {
        console.error( "Update Error:", error );
        return res.status( 500 ).json( { success: false, error: "Update Employee Server Error." } );
    }
};

const fetchEmployeesByDepId = async ( req, res ) => {
    const { id } = req.params;

    try {
        const employees = await Employee.find( { department: id } );
        return res.status( 200 ).json( { success: true, employees } );
    } catch ( error ) {
        console.error( "Error fetching employees by department:", error );
        return res.status( 500 ).json( { success: false, error: "Get EmployeesbyDepId Server Error." } );
    }
};


export { addEmployee, upload, getEmployees, getEmployee, updateEmployee, fetchEmployeesByDepId };