const cfnLambda = require( 'cfn-lambda' );
const schema = require( './schema' );

const faunadb = require( 'faunadb' );
const q = faunadb.query;

// Get the FaunaDB Key from parameters
const createClient = async ( params ) => {

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
    return new faunadb.Client({ secret: key });

};

// The Create Handler
const createHandler = async( params ) => {

    // Create the Fauna Client
    let client = await createClient( params );

    // Pull class name from param
    const className = params.ClassName;

    await client.query(
        // Create the class
        q.CreateClass({
            name: className
        })
    );

    // The above will error out if call can't be created, which means the class was created successfully

    // Fetch the indices
    const indices = params.Indices;

    // Start with an empty array of Index creation queries
    let indexQueryArray = [];
    let builtIndices = [];

    // Iterate through indices from params
    for( let index of indices ){

        let unique = false;

        // If unique property exists, and is true
        if( params.Unique && ( params.Unique === 'true' || params.Unique === 'True' ) ){
            unique = true;
        }

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
            unique,
            terms,
            values
        });

        // Add the built query into the array
        indexQueryArray.push( query );

        // Add to the list the built index name for output
        builtIndices.push( index.Name );

    }

    await client.query(
        // Wrapped in a Do expression such that all indices are created, or the whole thing fails
        q.Do(
            // Spread the index queries into the Do expression
            ...indexQueryArray
        )
    );

    // TODO Placeholder Return
    return {
        // Returning this physical resource ID because Fauna doesn't need replacement for anything
        PhysicalResourceId: 'FaunaDB Class and Index',
        FnGetAttrsDataObj: {
            Response: JSON.stringify({
                ClassCreated: className,
                IndicesCreated: builtIndices
            })
        }
    }

};


// The Update Handler
const updateHandler = async( id, params, oldParams ) => {

    console.log( params );

    return {
        PhysicalResourceId: 'FaunaDB Class and Index'
    }

};


// The Delete Handler
const deleteHandler = async( id, params ) => {

    try{

        console.log( params );

        // Create the Fauna Client
        let client = createClient( params );

        const indices = params.Indices;

        let indexQueryArray = [];
        // let indicesCreated = [];

        for( let index of indices ){
            indexQueryArray.push(
                q.Delete(
                    q.Index( index.Name )
                )
            );

            // indicesDeleted.push( index.Name );
        }

        await client.query(
            q.Do(
                ...indexQueryArray
            )
        );

        await client.query(
            q.Delete(
                q.Class( params.ClassName )
            )
        );

        return {
            PhysicalResourceId: 'FaunaDB Class and Index',
            Response: ""
        }
    } catch( e ){
        return {
            PhysicalResourceId: 'FaunaDB Class and Index',
            Response: 'Something went wrong'
        }
    }


};


// The exported Lambda. Uses all three handler in its Async Variety
module.exports.handler = cfnLambda({

    AsyncCreate: createHandler,
    AsyncUpdate: updateHandler,
    AsyncDelete: deleteHandler,

    Schema: schema

});