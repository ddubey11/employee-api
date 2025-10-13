import bcrypt from 'bcrypt';
import User from '../models/User.js'


const changePassword = async ( req, res ) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user._id;

        if ( !oldPassword || !newPassword ) {
            return res.status( 400 ).json( { success: false, error: "All fields are required." } );
        }

        const user = await User.findById( userId );
        if ( !user ) {
            return res.status( 404 ).json( { success: false, error: "User Not Found." } );
        }

        const isMatch = await bcrypt.compare( oldPassword, user.password );
        if ( !isMatch ) {
            return res.status( 400 ).json( { success: false, error: "Old Password does not match." } );
        }

        const isSame = await bcrypt.compare( newPassword, user.password );
        if ( isSame ) {
            return res.status( 400 ).json( { success: false, error: "New password must be different from old password." } );
        }

        const hashPassword = await bcrypt.hash( newPassword, 10 );
        await User.findByIdAndUpdate( userId, { password: hashPassword } );

        return res.status( 200 ).json( { success: true } );
    } catch ( error ) {
        console.error( "Password change error:", error );

        const message =
            error.response?.data?.error || "Something went wrong. Please try again.";

        setError( message ); // ✅ Show this in your UI
    }
};

export { changePassword };