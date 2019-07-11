const connect = require( '../util/connect' );

module.exports = async( id, params, oldParams ) => {

    const { client, q } = await connect( params );

    console.log( params, oldParams );

    return {
        PhysicalResourceId: 'FaunaDB Class and Index',
        FnGetAttrsDataObj: {
            Response: 'Hola!'
        }
    }

};