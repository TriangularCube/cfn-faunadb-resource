const faunadb = require( 'faunadb' );


const data = {
    Key: 'fnADTYvYuRACAwAp_EcbYfN7bLQ9e-vlxgZApqpR',
    ClassName: 'users',
    Indices: {
        1: {
            Name: 'users_by_displayName',
            Terms: [
                {
                    field: ['data', 'displayName']
                }
            ]
        },
        2: {
            Name: 'users_by_id_and_display',
            Terms: [
                {
                    field: [ 'data', 'id' ],
                    transform: 'casefold'
                }
            ]
        },
        3: {
            Name: 'users_by_sub',
            Values: [
                {
                    field: ['data', 'sub']
                }
            ]
        },
        4: {
            Name: 'index_to_be_deleted'
        }
    }
};

const data2 = {
    Key: 'fnADTYvYuRACAwAp_EcbYfN7bLQ9e-vlxgZApqpR',
    ClassName: 'users_new',
    Indices: {
        1: {
            Name: 'users_by_displayName_and_id',
            Terms: [
                {
                    field: ['data', 'displayName']
                },
                {
                    field: ['data', 'id' ]
                }
            ]
        },
        2: {
            Name: 'users_by_id_and_display',
            Terms: [
                {
                    field: [ 'data', 'id' ],
                    transform: 'casefold'
                }
            ]
        },
        3: {
            Name: 'users_by_sub_new',
            Values: [
                {
                    field: ['data', 'sub']
                }
            ]
        }
    }
};

// let test = require( '../src/handlers/create' );
//
// test( data ).then((res) => {
//     console.log( `Response is ${ res.FnGetAttrsDataObj.Response }` );
// }).catch(( err ) => {
//     console.error( `Error: ${ JSON.stringify( err.errors() ) }` );
// });



// let test = require( '../src/handlers/delete' );

let test = require( '../src/handlers/update' );


test( 'a', data2, data ).then((res) => {
    console.log( `Response is ${ res.FnGetAttrsDataObj.Response }` );
}).catch(( err ) => {
    console.error( `Error: ${ JSON.stringify( err.errors() ) }` );
});

