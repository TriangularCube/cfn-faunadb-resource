const connect = require( '../util/connect' );
const createIndex = require( '../util/createIndex' );

module.exports = async( params ) => {

    const { client, q } = await connect( params );

    // Pull collection name from param
    const CollectionName = params.CollectionName;

    // Fetch the indexes (In create we can ignore the keys)
    const indexes = Object.values( params.Indexes );

    // Start with an empty array of Index creation queries
    let indexQueryArray = [];
    let builtIndexes = [];

    // Iterate through indexes from params
    for( let index of indexes ){

        let query = createIndex( index, q.Var( 'collectionRef' ), true );

        // Add the built query into the array
        indexQueryArray.push( query );

        // Add to the list the built index name for output
        builtIndexes.push( index.Name );

    }

    try{
        await client.query(
            // Wrapped in a Let expression such that the collection and all indexes are created, or the whole thing fails
            q.Let(
                {
                    // Create the Class, then fetch its Ref
                    collectionRef: q.Select( 'ref', q.CreateCollection({
                        name: CollectionName
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
        PhysicalResourceId: 'FaunaDB Collection and Index',
        FnGetAttrsDataObj: {
            Response: JSON.stringify({
                CollectionCreated: CollectionName,
                IndexesCreated: builtIndexes
            })
        }
    }

};