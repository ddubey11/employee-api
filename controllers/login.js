import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import dbConnect from '../../db/db.js';

export default async function handler( req, res ) {
    res.setHeader( 'Access-Control-Allow-Origin', 'https://employee-frontend-pi-sand.vercel.app' );
    res.setHeader( 'Access-Control-Allow-Credentials', 'true' );
    res.setHeader( 'Access-Control-Allow-Methods', 'GET,POST,OPTIONS' );
    res.setHeader( 'Access-Control-Allow-Headers', 'Content-Type, Authorization' );

    if ( req.method === 'OPTIONS' ) return res.status( 200 ).end();
    await dbConnect();

    if ( req.method === 'POST' ) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne( { email } );
            if ( !user ) return res.status( 404 ).json( { success: false, error: 'User Not Found' } );

            const isMatch = await bcrypt.compare( password, user.password );
            if ( !isMatch ) return res.status( 401 ).json( { success: false, error: 'Invalid Credentials' } );

            const token = jwt.sign( { _id: user._id, role: user.role }, process.env.JWT_KEY, { expiresIn: '10d' } );

            return res.status( 200 ).json( {
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
            console.error( 'Login error:', error );
            return res.status( 500 ).json( { success: false, error: 'Internal Server Error' } );
        }
    } else {
        return res.status( 405 ).json( { success: false, error: 'Method Not Allowed' } );
    }
}
