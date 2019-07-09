# FaunaDB CloudFormation custom resource

This project is a Lambda function for creating a Class and Indices (in the class)
in FaunaDB as a CloudFormation Custom Resource, as well as a Serverless Template
for deploying it to AWS.


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

This resource will create one class, and any number of indices on the class.
Here's an example of how to format the template
```yaml
Properties:
    ServiceToken: ...
    
    # FaunaDB Class name
    ClassName: some-name
    
    # FaunaDB Key paramter
    KeyParameter: KeyParam
    
    # Indices to be created on this Class
    Indices:
        - Name: users_by_name
          ID: 1
          Terms:
            -
                - data
                - name
        
        - Name: users_by_name_and_age
          ID: 2
          Terms:
            -
                - data
                - name
            -
                - data
                - age
        
        - Name: usernames
          Values:
            -
                - data
                - username
        
        - Name: all_users
```

### Properties

These are the properties used by the resource

###### ClassName
Required  
Every class needs a name. Takes a compatible string for the Class Name.

```yaml
ClassName: your-class-name
```

###### Key
###### KeyParameter
###### KeyParameterSecure

Required  
This resource expects a FaunaDB Key to be able to connect to FaunaDB. There are 
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
While not required, indices do make classes more useful.
Takes an array of index descriptions to create the index on the Class.
```yaml
Indices:
    -   # Index description 1
    -   # Index description 2
    ...
```

Each index description needs the follows:

###### Name
Required  
Every index needs a name too.
```yaml
Indices:
    -   Name: index1
```

####### Terms
Terms used to partition the index. If not specified, will contain all instances
in the Class.  
Takes an array terms. Each term is an array containing the path to the field to
be indexed.
```yaml
# This creates a term on the `data.name` field
Terms:
    -
        - data
        - name

# This creates terms on both `data.name` and `data.id`
Terms:
    -
        - data
        - name
    -
        - data
        - id
```

###### Values
