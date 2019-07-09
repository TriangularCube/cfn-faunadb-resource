const faunadb = require( 'faunadb' );
const q = faunadb.query;

// Get the FaunaDB Key from parameters
module.exports = async ( params ) => {

    let key;

    // Figure out if the key input is plain text
    if( params.Key ){

        key = params.Key;

    } else {

        // Or in a parameter
        const { SSM } = require( 'aws-sdk' );
        const instance = new SSM();

        // Default to true unless 'false' or 'False"
        const secure = !!params.KeyParameter;

        // Get the key from parameter store (inverted notSecure)
        key = await instance.getParameter({ Name: params.KeyParameter, WithDecryption: secure }).promise();

        // Guard against wrong config
        switch ( key.Parameter.Type ) {
            case "String":
                if( secure ){
                    throw new Error( 'Key parameter specified to be secure, yet SSM parameter returned a normal string' );
                }
                break;
            case "SecureString":
                if( !secure ){
                    throw new Error( 'Key parameter specified to be non-secure, yet SSM parameter returned a secure string' );
                }
                break;
            default:
                throw new Error( 'SSM parameter format not supported' );
        }

        // Extract the relevant entry .
        key = key.Parameter.Value;

    }

    // First create the Fauna client
    return {
        client: new faunadb.Client({ secret: key }),
        q
    };

};
