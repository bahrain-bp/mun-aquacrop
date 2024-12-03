const AWS = require('aws-sdk');

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const {userId} = event; // Pass UserPoolId and UserId in the event body

        // Define your DynamoDB table name
        const tableName = "SaqiDev-mun-aquacrop-FarmAdmin"; // Replace with your actual table name

        // Fetch user attributes from Cognito User Pool
        const userResponse = await cognito.adminGetUser({
            UserPoolId: "us-east-1_qAQ8SIlqm",
            Username: userId
        }).promise();

        // Extract attributes from Cognito response
        const attributes = userResponse.UserAttributes.reduce((acc, attr) => {
            acc[attr.Name] = attr.Value;
            return acc;
        }, {});

        const user = {
            UID: attributes['sub'], // Cognito User Pool UID
            Email: attributes['email'], // Email
            Mobile: attributes['phone_number'], // Phone number
            Name: attributes['name'] // Full name
        };

        // Generate regDate and LastLogged
        const currentDate = new Date().toISOString();
        user.regDate = currentDate;
        user.LastLogged = currentDate;

        // Write to DynamoDB
        await dynamoDB.put({
            TableName: tableName,
            Item: user
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User data saved successfully", user }),
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to save user data", error }),
        };
    }
};
