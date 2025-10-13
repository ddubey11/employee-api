import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Employee from "./Employee.js";
import Leave from "./Leave.js";
import Salary from "./Salary.js";
import User from "./User.js";

const departmentSchema = new mongoose.Schema( {
    dept_name: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
} );

departmentSchema.pre( "deleteOne", { document: true, query: false }, async function ( next ) {
    try {
        const employees = await Employee.find( { department: this._id } );
        const empIds = employees.map( emp => emp._id );

        for ( const emp of employees ) {
            // Delete associated user
            if ( emp.userId ) {
                await User.findByIdAndDelete( emp.userId );
            }

            // Delete profile image if exists
            if ( emp.profileImage ) {
                const imagePath = path.join( process.cwd(), "EMS", "server", "public", "uploads", emp.profileImage );
                fs.unlink( imagePath, ( err ) => {
                    if ( err && err.code !== "ENOENT" ) {
                        console.error( `Failed to delete image ${imagePath}:`, err );
                    }
                } );
            }
        }

        // Delete employee, leave, and salary records
        await Employee.deleteMany( { department: this._id } );
        await Leave.deleteMany( { employeeId: { $in: empIds } } );
        await Salary.deleteMany( { employeeId: { $in: empIds } } );

        next();
    } catch ( error ) {
        next( error );
    }
} );

const Department = mongoose.model( "Department", departmentSchema );
export default Department;