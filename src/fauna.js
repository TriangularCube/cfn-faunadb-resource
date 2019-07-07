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

    // Pull class name from param
    const className = params.ClassName;

    await client.query(
        // Create the class
        q.CreateClass({
            name: className
        })
    );

    // The above will error out if call can't be created, which means the class was created successfully

    // Fetch the indexes
    const indexes = params.Indexes;

    // Start with an empty array of Index creation queries
    let indexArray = [];
    let builtIndexes = [];

    // Iterate through indexes from params
    for( let index of indexes ){

        // Get all terms specified
        let terms = [];

        // If the input has Term entries
        if( index.Terms ){

            // Iterate over all entries
            for( let term of index.Terms ){

                // Push a formatted object into the array
                terms.push( { field: term } );

            }
        }

        // Do the same thing for Values
        let values = [];

        if( index.Values ){
            for( let value of index.Values ){
                values.push( { field: value } );
            }
        }

        // Build the query
        let query = q.CreateIndex({
            name: index.Name,

            // We're only supporting index on the newly created class here
            source: q.Class( className ),
            terms: terms,
            values: values
        });

        // Add the built query into the array
        indexArray.push( query );

        // Add to the list the built index name for output
        builtIndexes.push( index.Name );

    }

    await client.query(
        // Wrapped in a Do expression such that all indexes are created, or the whole thing fails
        q.Do(
            // Spread the index queries into the Do expression
            ...indexArray
        )
    );

    // Placeholder Return
    return {
        PhysicalResourceId: 'Fauna Index',
        FnGetAttrsDataObj: {
            ClassName: params.ClassName,
            Indexes: builtIndexes
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