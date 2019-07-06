const faunadb = require( 'faunadb' );

async function run( data ){

    const className = data.ClassName;

    // First create the Fauna client
    const client = new faunadb.Client({ secret: 'fnADSmcJL7ACCd7Uz3WAPh0suv5g6bhLzDSwnqvC' });
    const q = faunadb.query;

    // let res1 = await client.query(
    //     q.CreateClass({
    //         name: className
    //     })
    // );

    // let result = await client.query(
    //     q.Do(
    //         q.CreateIndex({
    //             name: 'id_index',
    //             source: q.Class( className ),
    //             terms: [
    //                 { field: [ 'data', 'id' ] }
    //             ]
    //         }),
    //         q.CreateIndex({
    //             name: 'name_index',
    //             source: q.Class( className ),
    //             terms: [
    //                 { field: [ 'data', 'name' ] }
    //             ]
    //         }),
    //         null,
    //         q.CreateIndex({
    //             name: 'random_index',
    //             source: q.Class( className )
    //         })
    //     )
    // );

    // let result = await client.query(
    //     q.Delete(
    //         q.Class( 'TestClass' )
    //     )
    // );

    let result = await client.query(
        q.Do(
            q.Delete(
                q.Class( className )
            ),
            q.Delete(
                q.Map(
                    q.Paginate(
                        q.Indexes( null )
                    ),
                    q.Lambda( 'index', q.Delete( q.Var( 'index' ) ))
                )
            )
        )
    );

    return result;
}




const data = {
    ClassName: 'TestClass',
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
        }
    ]
};

run( data ).then((res) => {
    console.log( `Response is ${ JSON.stringify( res ) }` );
}).catch(( err ) => {
    console.error( `Error: ${ JSON.stringify( err.errors() ) }` );
});