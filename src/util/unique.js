module.exports = ( indices ) => {

    let uniqueIDs = [];

    for( let index of indices ){

        // Check index ID against the array
        if( uniqueIDs.some( (element) => element === index.ID ) ){
            return new Error( 'Duplicate ID for index detected' );
        }

        // Passed the check, push the ID into the array
        uniqueIDs.push( index.ID );

    }

};