const connect = require( '../util/connect' );
const unique = require( '../util/unique' );

module.exports = async( id, newParams, oldParams ) => {

    // Check for uniqueness of IDs
    unique( newParams.Indices );


    const { client, q } = await connect( newParams );

    // Check Class field update

    let classRename = null;

    // Evidently the only thing to look for in Class is the name field
    if( newParams.ClassName !== oldParams.ClassName ){
        classRename = q.Update(
            q.Class( oldParams.ClassName ),
            {
                name: newParams.ClassName
            }
        )
    }

    // Next find differences in Indices

    let indicesUpdateQueries = [];

    let newIndices = newParams.Indices;
    let oldIndices = oldParams.Indices;

    // First iterate through old indices and see if they've changed or were removed
    for( let index of oldIndices ){

        // Check each index against the new list
        let exists = newIndices.some( (element) => element.ID === index.ID );

        if( exists ){

            // It exists! Now check for equivalence


        } else {

            // It doesn't exist! Prep for deletion

        }

    }

    return {
        PhysicalResourceId: 'FaunaDB Class and Index',
        FnGetAttrsDataObj: {
            Response: 'Hola!'
        }
    }

};