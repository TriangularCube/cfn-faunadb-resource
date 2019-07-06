const cfnLambda = require( 'cfn-lambda' );
const schema = require( './schema' );

const faunadb = require( 'faunadb' );

// The Create Handler
const createHandler = async( params ) => {

    let key;

    // Figure out if the key input is plain text
    if( params.Key ){

        key = params.Key;

    } else {

        // Or in a parameter
        const { SSM } = require( 'aws-sdk' );
        const instance = new SSM();

        // Default to true unless 'false' or 'False"
        const notSecure = params.KeyParameterSecure === 'false' || params.getKeyParameterSecure === 'False';

        // Get the key from parameter store (inverted notSecure)
        key = await instance.getParameter({ Name: params.KeyParameter, WithDecryption: !notSecure }).promise();

        // Guard against wrong config
        switch ( key.Parameter.Type ) {
            case "String":
                if( !notSecure ){
                    throw new Error( 'Key parameter specified to be secure, yet SSM parameter returned a normal string' );
                }
                break;
            case "SecureString":
                if( notSecure ){
                    throw new Error( 'Key parameter specified to be non-secure, yet SSM parameter returned a secure string' );
                }
                break;
            default:
                throw new Error( 'SSM parameter format not recognized' );
        }

        // Extract the relevant entry .
        key = key.Parameter.Value;

    }

    // First create the Fauna client
    const client = new faunadb.Client({ secret: key });
    const q = faunadb.query;

    // Pull relevant parameters out
    const className = params.ClassName;
    const indexes = params.Indexes;

    // Construct some queries in prep for sending to client
    const termIndexes = null;
    


    let result = await client.query(
        // Do a number of queries
        q.Do(
            q.CreateClass({
                name: className
            }),

        )
    );


    let indexNames = [];
    params.Indexes.map( (element) => {
        indexNames.push( element.Name );
    });

    // Placeholder Return
    return {
        PhysicalResourceId: 'Hohoho',
        FnGetAttrsDataObj: {
            ClassName: params.ClassName,
            Indexes: indexNames
        }
    }

};


// The Update Handler
const updateHandler = async( params ) => {

    console.log( params );

    return {
        PhysicalResourceId: 'Hohoho'
    }

};


// The Delete Handler
const deleteHandler = async( params ) => {

    console.log( params );

    return {
        PhysicalResourceId: 'Hohoho'
    }

};


// The exported Lambda. Uses all three handler in its Async Variety
module.exports.handler = cfnLambda({

    AsyncCreate: createHandler,
    AsyncUpdate: updateHandler,
    AsyncDelete: deleteHandler,

    Schema: schema

});