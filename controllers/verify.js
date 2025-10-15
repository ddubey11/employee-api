export default async function handler( req, res ) {
    res.setHeader( 'Access-Control-Allow-Origin', 'https://employee-frontend-pi-sand.vercel.app' );
    res.setHeader( 'Access-Control-Allow-Credentials', 'true' );
    res.setHeader( 'Access-Control-Allow-Methods', 'GET,POST,OPTIONS' );
    res.setHeader( 'Access-Control-Allow-Headers', 'Content-Type, Authorization' );

    if ( req.method === 'OPTIONS' ) return res.status( 200 ).end();

    if ( req.method === 'GET' ) {
        // Assuming req.user is already populated by middleware (e.g., token verification)
        return res.status( 200 ).json( { success: true, user: req.user } );
    } else {
        return res.status( 405 ).json( { success: false, error: 'Method Not Allowed' } );
    }
}
