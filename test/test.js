const faunadb = require( 'faunadb' );

async function run( data ){

    const className = data.ClassName;

    // First create the Fauna client
    const client = new faunadb.Client({ secret: 'fnADSmcJL7ACCd7Uz3WAPh0suv5g6bhLzDSwnqvC' });
    const q = faunadb.query;


    const indexes = data.Indexes;

    let indexQueryArray = [];
    // let indexesDeleted = [];

    for( let index of indexes ){
        indexQueryArray.push(
            q.Delete(
                q.Index( index.Name )
            )
        );
    }

    await client.query(
        q.Do(
            ...indexQueryArray
        )
    );

    let result = await client.query(
        q.Delete(
            q.Class( className )
        )
    );

    return result;
}




const data = {
    ClassName: 'users',
    Indexes: [
        {
            Name: 'users_by_displayName',
            Terms: [
                [ 'data', 'displayName' ]
            ]
        },
        {
            Name: 'users_by_sub',
            Values: [
                [ 'data', 'sub' ]
            ]
        }
    ]
};

run( data ).then((res) => {
    console.log( `Response is ${ JSON.stringify( res ) }` );
}).catch(( err ) => {
    console.error( `Error: ${ JSON.stringify( err ) }` );
});