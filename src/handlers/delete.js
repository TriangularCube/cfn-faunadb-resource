const connect = require( '../util/connect' );

module.exports = async( id, params ) => {

    const { client, q } = await connect( params );

    // Guard against creation failures
    const res = await client.query(
        q.Exists(
            q.Collection( params.CollectionName )
        )
    );

    // The collection doesn't exist, which means Create failed
    if( !res ){
        return {
            PhysicalResourceId: 'FaunaDB Collection and Index',
            FnGetAttrsDataObj: {
                Response: 'No Collection exists of that name, probably Create failed'
            }
        }
    }

    let indexQueryArray = [];

    // If the resource had any indexes
    if( params.Indexes ){

        // Fetch the indexes as an array
        const indexes = Object.values( params.Indexes );

        for( let index of indexes ){
            indexQueryArray.push(
                q.Delete(
                    q.Index( index.Name )
                )
            );
        }
    }

    await client.query(
        q.Do(
            ...indexQueryArray,
            q.Delete(
                q.Collection( params.CollectionName )
            )
        )
    );

    return {
        PhysicalResourceId: 'FaunaDB Collection and Index',
        FnGetAttrsDataObj: {
            Response: 'Collection and indexes deleted'
        }
    }

};