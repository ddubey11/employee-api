import Department from "../models/Department.js";


const getDepartments = async ( req, res ) => {
    try {
        const departments = await Department.find()
        return res.status( 200 ).json( { success: true, departments } )
    } catch ( error ) {
        return res.status( 500 ).json( { success: false, error: "Get Department Server Error." } )
    }
}

const addDepartment = async ( req, res ) => {
    try {
        console.log( "Request body:", req.body ); // Log incoming data

        const { dept_name, description } = req.body;

        if ( !dept_name ) {
            return res.status( 400 ).json( { error: "Department name is required" } );
        }

        const newDept = new Department( { dept_name, description } );
        await newDept.save();

        res.status( 201 ).json( { message: "Department added successfully" } );
    } catch ( error ) {
        console.error( "Error in addDepartment:", error ); // Log the actual error
        res.status( 500 ).json( { error: "Internal Server Error" } );
    }
};

const getDepartment = async ( req, res ) => {
    try {
        const { id } = req.params;
        const department = await Department.findById( id );
        return res.status( 200 ).json( { success: true, department } );
    } catch ( error ) {
        return res.status( 500 ).json( { success: false, error: "Edit Department Server Error" } );
    }
}
const updateDepartment = async ( req, res ) => {
    try {
        const { id } = req.params;
        const { dept_name, description } = req.body;
        const updateDep = await Department.findByIdAndUpdate( { _id: id }, {
            dept_name,
            description
        } )
        return res.status( 200 ).json( { success: true, updateDep } );
    } catch ( error ) {
        return res.status( 500 ).json( { success: false, error: "Edit Department Server Error" } );
    }
}
const deleteDepartment = async ( req, res ) => {
    try {
        const { id } = req.params;
        console.log( "Deleting department with ID:", id ); // Debug log
        const deleteDep = await Department.findById( { _id: id } );
        await deleteDep.deleteOne();

        if ( !deleteDep ) {
            return res.status( 404 ).json( { success: false, error: "Department not found" } );
        }

        return res.status( 200 ).json( { success: true, deleteDep } );
    } catch ( error ) {
        return res.status( 500 ).json( { success: false, error: "Delete Department Server Error" } );
    }
}
export { addDepartment, getDepartments, getDepartment, updateDepartment, deleteDepartment }