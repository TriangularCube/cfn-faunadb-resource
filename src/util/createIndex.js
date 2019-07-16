const q = require( 'faunadb' ).query;

module.exports = ( index, source, active ) => {

    let unique = false;

    // If unique property exists, and is true
    if( index.Unique && ( index.Unique === 'true' || index.Unique === 'True' ) ){
        unique = true;
    }

    // Get all terms specified
    let terms = [];

    // If the input has Term entries
    if( index.Terms ){

        // Iterate over all entries
        for( let term of index.Terms ){

            // Push a formatted object into the array
            terms.push( term );

        }
    }

    // Do the same thing for Values
    let values = [];

    if( index.Values ){
        for( let value of index.Values ){
            values.push( value );
        }
    }

    // Build the query
    return q.CreateIndex({
        name: index.Name,

        // the query variable will be defined later
        source,
        unique,
        terms,
        values,
        active
    });

    // TODO include properties: serialized, partitions, permissions, data

};