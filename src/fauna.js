const cfnLambda = require( 'cfn-lambda' );

// The Create Handler
const createHandler = async( params ) => {

    console.log( params.ClassName );
    console.log( params.Indexes );

    // Placeholder Return
    return {
        PhysicalResourceId: 'Hohoho',
        FnGetAttrsDataObj: {
            name: params.ClassName
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
    AsyncDelete: deleteHandler

});