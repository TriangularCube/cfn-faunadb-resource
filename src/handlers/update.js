const connect = require( '../util/connect' );
const equal = require( 'fast-deep-equal' );

const createIndex = require( '../util/createIndex' );

module.exports = async( id, newParams, oldParams ) => {

    // Get client and q
    const { client, q } = await connect( newParams );

    // Check collection field update

    let collectionRename = null;

    // Evidently the only thing to look for in collection is the name field
    if( newParams.CollectionName !== oldParams.CollectionName ){
        collectionRename = q.Update(
            q.Collection( oldParams.CollectionName ),
            {
                name: newParams.CollectionName
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
    let indicesRebuilt = [];
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

                // Query for removing the old index
                let remove = q.Delete(
                    q.Index(
                        oldIndex[1].Name
                    )
                );

                // Push to the array
                firstPassIndicesQueries.push( remove );

                // Query for building the new index
                let create = createIndex( newIndex[1], q.Collection( newParams.CollectionName ), false );

                // Push to array
                secondPassIndicesQueries.push( create );

                // Convenience for output
                indicesRebuilt.push( newIndex[1].Name );

            } else {

                let updateObject = {};

                // Check if anything needs to be updated

                // First up, uniqueness (is true if Unique exists, and is either `true` or `True`. Otherwise false
                let newUnique = newIndex[1].Unique ? ( newIndex[1].Unique === 'true' || newIndex[1].Unique === 'True' ) : false;
                let oldUnique = oldIndex[1].Unique ? ( oldIndex[1].Unique === 'true' || oldIndex[1].Unique === 'True' ) : false;

                if( oldUnique !== newUnique ){

                    // If uniqueness changed
                    updateObject['unique'] = newUnique;

                }

                // Next up, Name
                if( oldIndex[1].Name !== newIndex[1].Name ){

                    updateObject['name'] = newIndex[1].Name;

                }

                // TODO support properties: serialized, partition, permission, data

                if( Object.getOwnPropertyNames( updateObject ).length > 0 ){

                    // If there's more then zero properties in UpdateObject, means we need o update
                    let query = q.Update(
                        q.Index( oldIndex[1].Name ),
                        updateObject
                    );

                    firstPassIndicesQueries.push( query );
                    indicesUpdated.push( newIndex[0] );

                } else {

                    // Index stayed the same
                    indicesStayedSame.push( oldIndex[1].Name );

                }

            }

        } else {

            // It doesn't exist! Prep for deletion
            let deleteQuery = q.Delete(
                q.Index( oldIndex[1].Name )
            );

            firstPassIndicesQueries.push( deleteQuery );
            indicesDeleted.push( oldIndex[1].Name );

        }

    }

    for( let newIndex of newIndices ){

        // See if the new index exists in the old indices
        let oldIndex = oldIndices.find( ( element ) => element[0] === newIndex[0] );

        // If not
        if( !oldIndex ){

            // This must be a new index
            firstPassIndicesQueries.push( createIndex( newIndex[1], q.Collection( oldParams.CollectionName ), false ) );

            indicesNew.push( newIndex[1].Name );

        }

    }

    // We push collection rename into the first pass queries at the end

    // And execute
    await client.query(
        q.Do(
            ...firstPassIndicesQueries,
            collectionRename
        )
    );

    // If a second passe exist, wait for 60s, then execute
    if( secondPassIndicesQueries.length > 0 ){

        await sleep( 60 * 1000 );

        await client.query(
            q.Do(
                ...secondPassIndicesQueries
            )
        )

    }

    // Build a response object
    let response = {};
    if( collectionRename ){
        response['Renamed Collection'] = `From ${oldParams.CollectionName} to ${newParams.CollectionName}`;
    }
    if( indicesStayedSame.length > 0 ){
        response['Indices Stayed the Same'] = indicesStayedSame;
    }
    if( indicesUpdated.length > 0){
        response['Indices Updated'] = indicesUpdated;
    }
    if( indicesRebuilt.length > 0){
        response['Indices Rebuilt'] = indicesRebuilt;
    }
    if( indicesNew.length > 0){
        response['New indices added'] = indicesNew;
    }
    if( indicesDeleted.length > 0){
        response['Indices Deleted'] = indicesDeleted;
    }


    return {
        PhysicalResourceId: 'FaunaDB Collection and Index',
        FnGetAttrsDataObj: {
            Response: JSON.stringify(response)
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

function sleep( ms ){
    return new Promise( resolve => setTimeout( resolve, ms ) );
}