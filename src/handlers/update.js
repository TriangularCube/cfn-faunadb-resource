const connect = require( '../util/connect' );

module.exports = async( id, newParams, oldParams ) => {


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

    let firstPassIndicesQueries = [];
    let secondPassIndicesQueries = [];

    let newIndices = [];
    let oldIndices = [];

    // Fetch indices if any exist
    if( newParams.Indices ){
        newIndices = Object.entries( newParams.Indices );
    }

    if( oldParams.Indices ){
        oldIndices = Object.entries( oldParams.Indices );
    }

    // Convenience arrays for response
    let indicesStayedSame = [];
    let indicesUpdated = [];
    let indicesNew = [];
    let indicesDeleted = [];

    // First iterate through old indices and see if they've changed or were removed
    for( let oldIndex of oldIndices ){

        // Check each index against the new list
        let newIndex = newIndices.find( (element) => element[0] === oldIndex[0] );

        if( newIndex ){

            // It exists! Now check for equivalence

            

        } else {

            // It doesn't exist! Prep for deletion
            let deleteQuery = q.Delete(
                q.Index( oldIndex[0] )
            );

            firstPassIndicesQueries.push( deleteQuery );
            indicesDeleted.push( oldIndex[0] );

        }

    }

    return {
        PhysicalResourceId: 'FaunaDB Class and Index',
        FnGetAttrsDataObj: {
            Response: 'Hola!'
        }
    }

};