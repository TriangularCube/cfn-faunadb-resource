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

        // Or both the Key parameter name and whether it is encrypted
        {
            required: [ 'KeyParameter', 'KeyParameterSecure' ]
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

        // FaunaDB Key if it is stored in Parameter Store
        KeyParameter:{
            type: 'string'
        },

        // Whether the above store is encrypted
        KeyParameterSecure:{
            type: 'string'
        },

        // Any indexes specified
        Indexes: {

            // Type is an Array
            type: 'array',

            // All items must be:
            items: {

                // An object
                type: 'object',

                // Must have a name
                required: [
                    'Name'
                ],
                // We also require at least one of
                anyOf: [
                    {
                        required: [ 'Terms' ]
                    },
                    {
                        required: [ 'Values' ]
                    }
                ],
                properties: {
                    Name: {
                        type: 'string'
                    },

                    // Terms for this index
                    Terms: {
                        type: 'array',
                        items: {
                            type: 'array'
                        }
                    },

                    // Values for this index
                    Values: {
                        type: 'array',
                        items:{
                            type: 'array'
                        }
                    }
                }
            }
        }
    }
};