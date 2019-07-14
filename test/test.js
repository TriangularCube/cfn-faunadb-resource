const faunadb = require( 'faunadb' );


const data = {
    Key: 'fnADSmcJL7ACCd7Uz3WAPh0suv5g6bhLzDSwnqvC',
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
            Name: 'users_by_sub',
            Values: [
                {
                    field: ['data', 'sub']
                }
            ]
        }
    }
};

const data2 = {
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
        3: {
            Name: 'users_by_id',
            Terms: [
                {
                    field: [ 'data', 'sub' ]
                }
            ]
        },
        2: {
            Name: 'users_by_sub_and_id',
            Values: [
                {
                    field: ['data', 'sub']
                },
                {
                    field: ['data', 'id' ]
                }
            ]
        }
    }
};

// let test = require( '../src/handlers/create' );
// let test = require( '../src/handlers/delete' );

const diff = require( 'lodash.difference' );

console.log( diff(
    [
        [ 'data', 'id' ]
    ],
    [
        [ 'data', 'id' ]
    ]
) );

// test( 'a', data ).then((res) => {
//     console.log( `Response is ${ res.FnGetAttrsDataObj.Response }` );
// }).catch(( err ) => {
//     console.error( `Error: ${ err }` );
// });