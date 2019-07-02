const cfnLambda = require( 'cfn-lambda' );

module.exports.handler = cfnLambda({

    AsyncCreate: createHandler

});

const createHandler = async( cfnRequestParams ) => {



};