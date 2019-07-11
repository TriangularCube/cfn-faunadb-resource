const connect = require( '../util/connect' );

module.exports = async( id, params ) => {

    const { client, q } = await connect( params );

    // Guard against creation failures
    const res = await client.query(
        q.Exists(
            q.Class( params.ClassName )
        )
    );

    // The class doesn't exist, which means Create failed
    if( !res ){
        return {
            PhysicalResourceId: 'FaunaDB Class and Index',
            FnGetAttrsDataObj: {
                Response: 'No class exists of that name, probably Create failed'
            }
        }
    }

    let indexQueryArray = [];

    // If the resource had any indices
    if( params.Indices ){
        for( let index of params.Indices ){
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
                q.Class( params.ClassName )
            )
        )
    );

    return {
        PhysicalResourceId: 'FaunaDB Class and Index',
        FnGetAttrsDataObj: {
            Response: 'Class and indices deleted'
        }
    }

};