const connect = require( '../util/connect' );
const equal = require( 'fast-deep-equal' );

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

    // console.log( oldIndices );

    // First iterate through old indices and see if they've changed or were removed
    for( let oldIndex of oldIndices ){

        // console.log( oldIndex );

        // Check each index against the new list
        let newIndex = newIndices.find( (element) => element[0] === oldIndex[0] );

        if( newIndex ){

            // It exists! Now check for equivalence

            // Check if replacement needs to be triggered
            if( shouldReplace( newIndex[1], oldIndex[1] ) ){
                // TODO
                console.log( 'true' );
            } else {
                console.log( 'false' );
            }

        } else {

            // It doesn't exist! Prep for deletion
            let deleteQuery = q.Delete(
                q.Index( oldIndex[0] )
            );

            firstPassIndicesQueries.push( deleteQuery );
            indicesDeleted.push( oldIndex[0] );

        }

    }

    // TODO iterate over new indices to find new entries

    return {
        PhysicalResourceId: 'FaunaDB Class and Index',
        FnGetAttrsDataObj: {
            Response: 'Hola!'
        }
    }

};

function shouldReplace( newIndex, oldIndex ){

    // Check Terms and Values for differences

    // console.log( oldIndex.Terms );

    let newTerms = [],
        newValues = [],
        oldTerms = [],
        oldValues = [];

    // Now we copy all the terms and values arrays so we can manipulate it without destroying the original data

    if( !!newIndex.Terms ){
        newTerms = newIndex.Terms.slice(0);
    }

    if( !!newIndex.Values ){
        newValues = newIndex.Values.slice(0);
    }

    if( !!oldIndex.Terms ){
        oldTerms = oldIndex.Terms.slice(0);
    }

    if( !!oldIndex.Values ){
        oldValues = oldIndex.Values.slice(0);
    }


    // Time to iterate through terms and values looking for equality
    for( let i = oldTerms.length - 1; i >= 0; i-- ){

        // Try to find a matching term in the new index
        let hasTerm = newTerms.findIndex( (element) => equal( element, oldTerms[i] ) );

        // If there is none, that means the index needs to be rebuilt
        if( hasTerm < 0 ){
            return true;
        }

        // Remove the terms so we don't recheck the same terms
        oldTerms.splice( i, 1 );
        newTerms.splice( hasTerm,1 );

    }

    // Same thing for values
    for( let i = oldValues.length - 1; i >= 0; i-- ){

        let hasValue = newValues.findIndex( (element) => equal( element, oldValues[i] ) );

        if( hasValue < 0 ){
            return true;
        }

        oldValues.splice( i, 1 );
        newValues.splice( hasValue, 1 );

    }

    // Now we simply see if there's anything left in the new index, and if there is that means there's
    // an index term or value that isn't in the old index, and we can infer that a term or index has updated
    if( newTerms.length > 0 || newValues.length > 0 ){
        return true;
    }

    // TODO Check for partition changes

    // Else, everything has passed the equality check
    return false;

}