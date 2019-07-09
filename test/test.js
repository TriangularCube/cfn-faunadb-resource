const faunadb = require( 'faunadb' );
const diff = require( 'deep-diff' );

async function run( data, data2 ){

    const className = data.ClassName;

    // First create the Fauna client
    const client = new faunadb.Client({ secret: 'fnADSmcJL7ACCd7Uz3WAPh0suv5g6bhLzDSwnqvC' });
    const q = faunadb.query;


    const result = diff( data, data2 );



    // const result = await client.query(
    //     q.Let(
    //         {
    //             classRef: q.Select( 'ref', q.CreateClass( { name: className } ) )
    //         },
    //         q.Do(
    //             q.CreateIndex(
    //                 {
    //                     name: 'index1',
    //                     source: q.Var( 'classRef' ),
    //                     terms: [ { field: [ 'data', 'id'], transform: null, reverse: true } ]
    //                 }
    //             )
    //         )
    //     )
    // );

    // const res = await client.query(
    //     q.Exists(
    //         q.Class( data.ClassName )
    //     )
    // );
    //
    // console.log( res );
    // return;
    //
    //
    // const indexes = data.Indexes;
    //
    // let indexQueryArray = [];
    // // let indexesDeleted = [];
    //
    // for( let index of indexes ){
    //     indexQueryArray.push(
    //         q.Delete(
    //             q.Index( index.Name )
    //         )
    //     );
    // }
    //
    // await client.query(
    //     q.Do(
    //         ...indexQueryArray
    //     )
    // );
    //
    // let result = await client.query(
    //     q.Delete(
    //         q.Class( className )
    //     )
    // );

    return result;
}




const data = {
    ClassName: 'users',
    Indexes: {
        1: {
            Name: 'users_by_displayName',
                Terms: [
                    ['data', 'displayName']
                ]
        },
        2: {
            Name: 'users_by_sub',
                Values: [
                    ['data', 'sub']
                ]
        }
    }
};

const data2 = {
    ClassName: 'users',
    Indexes: {
        1: {
            Name: 'users_by_displayName',
            Terms: [
                ['data', 'displayName']
            ]
        },
        3: {
            Name: 'users_by_id',
            Terms: [
                [ 'data', 'sub' ]
            ]
        },
        2: {
            Name: 'users_by_sub_and_id',
            Values: [
                ['data', 'sub'],
                ['data', 'id' ]
            ]
        }
    }
};

run( data, data2 ).then((res) => {
    console.log( `Response is ${ JSON.stringify( res ) }` );
}).catch(( err ) => {
    console.error( `Error: ${ JSON.stringify( err ) }` );
});