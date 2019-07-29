# Potentially Obsolete
This library is probably rendered obsolete by the introduction of FaunaDB's
GraphQL API, as that takes care of creating and updating Collections, indices,
and other such tasks.  
  


---

# FaunaDB CloudFormation custom resource

This project is a Lambda function for creating a Collections and Indices (in the
collection) in FaunaDB as a CloudFormation Custom Resource, as well as a Serverless
Template for deploying it to AWS.


# Getting Started

Clone this project, then deploy the Lambda and use the ARN for a CloudFormation
custom resource's service token. There is an included serverless.yml file to deploy
using Serverless using some default options, and can be deployed with the command

```
npm run deploy
```

NOTE: This library supports fetching the FaunaDB access key from AWS's SSM Parameter
store. If you are using this feature, please ensure the Lambda has permission to
access the parameter from SSM, as well as the KMS key to decrypt the parameter if it
has been encrypted.

# Usage

When deploying a CloudFormation stack, the exported Lambda ARN may be used as the
service token for a custom resource. As an alternative, the custom resource can also be
declared in the same Template.

```yaml
Resources:

...

    # Our custom resource
    MyResoruceName:
        Type: Custom::MyCustomResourceName
        Properties:
            ServiceToken:
                # Use the following if creating the custom resource in the same tempate
                Fn::GetAtt:
                    - FaunaLambdaFunction
                    - Arn
                        
                # Otherwise import the function ARN
                Fn::ImportValue: my-exported-resource-name
```

This resource will create one collection, and any number of indices on the collection.
Here's an example of how to format the template
```yaml
Properties:
    ServiceToken: ...
    
    # FaunaDB Collection name
    CollectionName: some-name
    
    # FaunaDB Key parameter
    KeyParameter: KeyParam
    
    # Indices to be created on this Collection
    Indices:
        nameTerm:
            Name: users_by_name
            Terms:
                - field:
                    - data
                    - name
            Unique: `true`
            
        nameAgeTerm:
            Name: users_by_name_and_age
            Terms:
                - field:
                    - data
                    - name
                  transform: 'casefold'
                  
                - field:
                    - data
                    - age
        
        username:
            Name: usernames
            Values:
                - field:
                    - data
                    - username
                  reverse: `true`
        
        all:
            Name: all_users
```

### Properties

These are the properties used by the lambda

###### CollectionName
Required  
Every collection needs a name.

```yaml
CollectionName: your-collection-name
```

###### Key
###### KeyParameter
###### KeyParameterSecure

Required  
This lambda expects a FaunaDB Key to be able to connect to FaunaDB. There are 
three ways to specify this key: in plain text, as an SSM parameter, or a secure
SSM parameter.

*NOTE: SSM parameters need to exist in the same account as the Lambda for now.
Possible future cross account SSM store implementation.*

```yaml
# Plain Text key
Key: 'FaunaDB Key'

# Or a parameter name
KeyParameter: KeyParam

# Or a secure string parameter
KeyParameterSecure: SecureKey
```

#### Indices
While not required, indices do make collections more useful.
Takes an object with index descriptions to create the index on the Collection.
```yaml
Indices:
    index1:
        ... # Index description 1
    index2:
        ... # Index description 2
    ...
```

Each index description needs the following:

###### Property Name
The property name of each index is not actually used by FaunaDB, but is needed by
this package to keep track of which index has updated, and which are added/deleted
```yaml
Indices:
    IndexProperty1:
        ...
    IndexProperty2:
        ...
```

###### Name
Required  
FaunaDB does require each index to have an actual name.
```yaml
Index1:
    Name: index1
    ...
```

###### Terms
Terms used to partition the index. If not specified, will contain all instances
in the Collection.  
Takes an array terms. Each term contains an object with a field property containing the
path to the field to be indexed, and an optional transform property. Please refer to
[FaunaDB documentation](
https://docs.fauna.com/fauna/current/reference/indexconfig#term-objects)
for more information.  

Internally this object is passed onto to FaunaDB's JS driver, so it should be formatted
according to requirements (i.e. properties are lower case, etc.)
```yaml
# This creates a term on the `data.name` field
Terms:
    - field:
        - data
        - name

# This creates terms on both `data.name` and `data.id`
Terms:
    - field:
        - data
        - name
    
    - field:
        - data
        - id
      transform: casefold
```

_Note: FaunaDB dictates that indices cannot change its Terms, Values, or
Partition fields. Any updates to these fields will trigger a replacement of
the index._

###### Values
Values describes the data covered by the index, which is what is returned from
a query. If not specified, only the instance REF is covered.  

Internally this object is passed onto to FaunaDB's JS driver, so it should be formatted
according to requirements (i.e. properties are lower case, etc.)
```yaml
Values:
    - field:
        - data
        - name
    
    - field:
        - ref
    
    - field:
        - ts
      reverse: true
```

_Note: FaunaDB dictates that indices cannot change its Terms, Values, or
Partition fields. Any updates to these fields will trigger a replacement of
the index._

###### Unique

This field will dictate all instances covered by this index be unique (i.e. will not
allow duplicated entries to be added to the DB). If this property is updated from
false to true, existing duplicate instances will not be removed, but future duplicate
entries will be forbidden.

`true` or `True` will evaluate to True, all other entries will be treated as False
```yaml
Unique: true
# Or
Unique: false
```

# TODO
- Handle errored stack updates better
- Better documentation

# Caveat

This project is a long ways away from implementing all features supported by
FaunaDB. My hope is eventually to implement most functionality, but at the moment
I have no idea if this is feasible. Comments are always welcome if you have any
ideas about the direction this project should take.

# Contributing

Pull Requests are always welcome, though I won't guarantee I can get around to
reviewing it immediately. Priority at the moment is obviously to incorporate as
many of missing FaunaDB features as possible. 

# License

[MIT](https://github.com/TriangularCube/cfn-faunadb-resource/blob/master/LICENSE.md)