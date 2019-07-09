

module.exports = async( id, params, oldParams ) => {

    console.log( params );

    return {
        PhysicalResourceId: 'FaunaDB Class and Index',
        FnGetAttrsDataObj: {
            Response: 'Hola!'
        }
    }

};