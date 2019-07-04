module.exports = {
    type: 'object',
    required: [
        'ClassName'
    ],
    properties: {
        ClassName: {
            type: 'string'
        },
        Indexes: {
            type: 'array',
            items: {
                type: 'object',
                required: [
                    'Name'
                ],
                properties: {
                    Name: {
                        type: 'string'
                    },
                    Terms: {
                        type: 'array'
                    },
                    Values: {
                        type: 'array'
                    }
                }
            }
        }
    }
};