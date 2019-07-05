const cfnLambda = require( 'cfn-lambda' );
const schema = require( './schema' );

const faunadb = require( 'faunadb' );

// The Create Handler
const createHandler = async( params ) => {




    // DEBUG TODO
    console.log( params.ClassName );
    console.log( params.Indexes );

    let indexNames = [];
    params.Indexes.map( (element) => {
        indexNames.push( element.Name );
    });

    // Placeholder Return
    return {
        PhysicalResourceId: 'Hohoho',
        FnGetAttrsDataObj: {
            ClassName: params.ClassName,
            Indexes: indexNames
        }
    }

};


// The Update Handler
const updateHandler = async( params ) => {

    console.log( params );

    return {
        PhysicalResourceId: 'Hohoho'
    }

};


// The Delete Handler
const deleteHandler = async( params ) => {

    console.log( params );

    return {
        PhysicalResourceId: 'Hohoho'
    }

};


// The exported Lambda. Uses all three handler in its Async Variety
module.exports.handler = cfnLambda({

    AsyncCreate: createHandler,
    AsyncUpdate: updateHandler,
    AsyncDelete: deleteHandler,

    Schema: schema

});