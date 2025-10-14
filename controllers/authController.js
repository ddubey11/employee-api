import jwt from 'jsonwebtoken';
import User from '../models/User.js'
import bcrypt from 'bcrypt'

const login = async ( req, res ) => {
    try {
        const { email, password } = req.body;
        console.log( "Login request received:", email );

        const user = await User.findOne( { email } );
        if ( !user ) {
            console.warn( "User not found:", email );
            return res.status( 404 ).json( { success: false, error: "User Not Found in Database!" } );
        }

        const isMatch = await bcrypt.compare( password, user.password );
        if ( !isMatch ) {
            console.warn( "Password mismatch for user:", email );
            return res.status( 401 ).json( { success: false, error: "User Credential Mismatch!" } );
        }

        if ( !process.env.JWT_KEY ) {
            console.error( "JWT_KEY is missing in environment variables" );
            return res.status( 500 ).json( { success: false, error: "Server misconfiguration" } );
        }

        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "10d" }
        );

        console.log( "Login successful for:", email );
        res.status( 200 ).json( {
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                role: user.role,
                employeeId: user.employeeId?._id,
            },
        } );
    } catch ( error ) {
        console.error( "Login error:", error );
        res.status( 500 ).json( { success: false, error: "Internal Server Error" } );
    }
};

const verify = ( req, res ) => {
    return res.status( 200 ).json( { success: true, user: req.user } )
}
export { login, verify };