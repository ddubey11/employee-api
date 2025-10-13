import Salary from "../models/Salary.js";
import Employee from '../models/Employee.js'

// Add a new salary record
const addSalary = async ( req, res ) => {
    try {
        const {
            employeeId,
            basicSalary,
            allowances,
            deductions,
            payDate,
        } = req.body;

        const netSalary =
            parseInt( basicSalary ) + parseInt( allowances ) - parseInt( deductions );

        const newSalary = new Salary( {
            employeeId,
            basicSalary,
            allowances,
            deductions,
            netSalary,
            payDate,
        } );

        await newSalary.save();

        res.status( 200 ).json( { success: true } );
    } catch ( error ) {
        console.error( "Error adding salary:", error );
        res.status( 500 ).json( { success: false, error: "Salary Add server error" } );
    }
};

// Get salary history for a specific employee
const getSalary = async ( req, res ) => {
    try {
        const { id } = req.params;

        // First attempt: find salary by employeeId directly
        let salary = await Salary.find( { employeeId: id } ).populate( {
            path: 'employeeId',
            select: 'employeeId name department',
            populate: { path: 'department', select: 'dept_name' },
        } );

        // If no salary found, try resolving employeeId via userId
        if ( !salary || salary.length === 0 ) {
            const employee = await Employee.findOne( { userId: id } );

            if ( !employee ) {
                return res.status( 404 ).json( { success: false, error: 'Employee not found.' } );
            }

            salary = await Salary.find( { employeeId: employee._id } ).populate( {
                path: 'employeeId',
                select: 'employeeId name department',
                populate: { path: 'department', select: 'dept_name' },
            } );
        }

        res.status( 200 ).json( { success: true, salary } );
    } catch ( error ) {
        console.error( 'Error fetching salary:', error );
        res.status( 500 ).json( { success: false, error: 'Salary Get server error' } );
    }
};

export { addSalary, getSalary };
