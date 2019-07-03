const cfnLambda = require( 'cfn-lambda' );

const createHandler = async( params ) => {

    console.log( params.tables );

    // Placeholder Return
    return {
        PhysicalResourceId: 'Hohoho',
        FnGetAttrsDataObj: {
            tables: params.tables
        }
    }

};

const updateHandler = async( params ) => {

    console.log( params );

    return {
        PhysicalResourceId: 'Hohoho'
    }

};

const deleteHandler = async( params ) => {

    console.log( params );

    return {
        PhysicalResourceId: 'Hohoho'
    }

};

module.exports.handler = cfnLambda({

    AsyncCreate: createHandler,
    AsyncUpdate: updateHandler,
    AsyncDelete: deleteHandler

});