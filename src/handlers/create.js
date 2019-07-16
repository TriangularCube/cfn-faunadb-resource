const connect = require( '../util/connect' );
const createIndex = require( '../util/createIndex' );

module.exports = async( params ) => {

    const { client, q } = await connect( params );

    // Pull class name from param
    const className = params.ClassName;

    // Fetch the indices (In create we can ignore the keys)
    const indices = Object.values( params.Indices );

    // Start with an empty array of Index creation queries
    let indexQueryArray = [];
    let builtIndices = [];

    // Iterate through indices from params
    for( let index of indices ){

        let query = createIndex( index, q.Var( 'classRef' ), true );

        // Add the built query into the array
        indexQueryArray.push( query );

        // Add to the list the built index name for output
        builtIndices.push( index.Name );

    }

    try{
        await client.query(
            // Wrapped in a Let expression such that the class and all indices are created, or the whole thing fails
            q.Let(
                {
                    // Create the Class, then fetch its Ref
                    classRef: q.Select( 'ref', q.CreateClass({
                        name: className
                    }))
                },

                // Then Do
                q.Do(
                    // Spread the index queries into the Do expression
                    ...indexQueryArray
                )
            )
        );
    } catch( e ){
        throw new Error( JSON.stringify( e.errors() ) );
    }


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