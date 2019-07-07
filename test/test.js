const faunadb = require( 'faunadb' );

async function run( data ){

    const className = data.ClassName;

    // First create the Fauna client
    const client = new faunadb.Client({ secret: 'fnADSmcJL7ACCd7Uz3WAPh0suv5g6bhLzDSwnqvC' });
    const q = faunadb.query;


    let qArray = [];

    for( let index of data.Indexes ){
        let terms = [];
        if( index.Terms ){
            for( let term of index.Terms ){
                terms.push( { field: term } );
            }
        }

        let values = [];
        if( index.Values ){
            for( let value of index.Values ){
                values.push( { field: value } );
            }
        }

        let query = q.CreateIndex({
            name: index.Name,
            source: q.Class( className ),
            terms: terms,
            values: values
        });

        qArray.push( query );
    }

    let result = await client.query(
        q.Do(
            ...qArray
        )
    );

    return result;
}




const data = {
    ClassName: 'Test',
    Indexes: [
        {
            Name: 'list_by_id',
            Terms: [
                [ 'data', 'id' ]
            ]
        },
        {
            Name: 'list_by_name',
            Values: [
                [ 'data', 'name' ]
            ]
        },
        {
            Name: 'two_terms',
            Terms: [
                [ 'data', 'name' ],
                [ 'data', 'id' ]
            ]
        }
    ]
};

run( data ).then((res) => {
    console.log( `Response is ${ JSON.stringify( res ) }` );
}).catch(( err ) => {
    console.error( `Error: ${ JSON.stringify( err.errors() ) }` );
});