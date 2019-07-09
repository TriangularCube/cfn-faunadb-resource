const cfnLambda = require( 'cfn-lambda' );
const schema = require( './util/schema' );

// The Create Handler
const createHandler = require( './handlers/create' );

// The Update Handler
const updateHandler = require( './handlers/update' );

// The Delete Handler
const deleteHandler = require( './handlers/delete' );


// The exported Lambda. Uses all three handler in its Async Variety
module.exports.handler = cfnLambda({

    AsyncCreate: createHandler,
    AsyncUpdate: updateHandler,
    AsyncDelete: deleteHandler,

    Schema: schema

});