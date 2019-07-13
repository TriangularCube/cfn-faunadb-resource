// CloudFormation doesn't have Boolean types, so we'll have to extrapolate from Strings


module.exports = {
    // The input should be an object (which should always be true coming from AWS
    type: 'object',

    // Every class needs a name
    required: [ 'ClassName' ],

    oneOf:[
        // We either require a plain text key
        {
            required: [ 'Key' ]
        },

        // Or a Key Parameter from SSM
        {
            required: [ 'KeyParameter' ]
        },
        {
            required: [ 'KeyParameterSecure']
        }
    ],

    // The properties
    properties: {

        // Class Name
        ClassName: {
            type: 'string'
        },

        // FaunaDB Key
        Key: {
            type: 'string'
        },

        // FaunaDB Key stored in Parameter Store
        KeyParameter:{
            type: 'string'
        },

        // FaunaDB Secure Key stored in Parameter Store
        KeyParameterSecure:{
            type: 'string'
        },

        // Any indices specified
        Indices: {

            // Type is an Array
            type: 'object',

            required: [
                'Name'
            ],

            properties: {

                // Every index needs a name
                Name: {
                    type: 'string'
                },

                // Whether this index should have the unique constraint
                Unique: {
                    type: 'string'
                },

                // Terms for this index
                Terms: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: [
                            'field'
                        ],
                        properties: {
                            field: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                }
                            },
                            transform: {
                                type: 'string'
                            }
                        }
                    }
                },

                // Values for this index
                Values: {
                    type: 'array',

                    // Items are all arrays of strings
                    items:{
                        type: 'object',
                        required: [
                            'field'
                        ],
                        properties: {
                            field: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                }
                            },
                            reverse: {
                                type: 'string'
                            }
                        }
                    }
                }
            }
        }
    }
};