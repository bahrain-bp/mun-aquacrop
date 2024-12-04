import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand, UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Initialize AWS SDK clients
const cognitoClient = new CognitoIdentityProviderClient({});
const dynamoDBClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Define User Pool ID & DB table
const USER_POOL_ID = "us-east-1_qAQ8SIlqm"; // Replace with your actual Cognito User Pool ID
const DYNAMO_TABLE_NAME = "SaqiDev-mun-aquacrop-FarmAdmin"; // Replace with your actual DynamoDB table name

export const handler = async (event) => {
  try {
    const { userId } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required parameter: userId" }),
      };
    }

    // Fetch user attributes from Cognito
    const userResponse = await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: userId,
      })
    );

    const attributes = userResponse.UserAttributes.reduce((acc, attr) => {
      acc[attr.Name] = attr.Value;
      return acc;
    }, {});

    const UID = attributes['sub']; // Cognito User Pool UID
    const user = {
      UID,
      Email: attributes['email'], // Email
      Mobile: attributes['phone_number'], // Phone number
      Name: attributes['name'], // Full name
    };

    // Check if the user already exists in DynamoDB
    const existingUser = await dynamoDBClient.send(
      new GetCommand({
        TableName: DYNAMO_TABLE_NAME,
        Key: { UID },
      })
    );

    const currentDate = new Date().toISOString();

    if (existingUser.Item) {
      // User exists, update only the LastLogged field
      await dynamoDBClient.send(
        new UpdateCommand({
          TableName: DYNAMO_TABLE_NAME,
          Key: { UID },
          UpdateExpression: "SET LastLogged = :lastLogged",
          ExpressionAttributeValues: {
            ":lastLogged": currentDate,
          },
        })
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "LastLogged updated for existing user." }),
      };
    } else {
      // User doesn't exist, create a new entry with regDate and LastLogged
      user.regDate = currentDate;
      user.LastLogged = currentDate;

      await dynamoDBClient.send(
        new PutCommand({
          TableName: DYNAMO_TABLE_NAME,
          Item: user,
        })
      );

      return {
        statusCode: 201,
        body: JSON.stringify({ message: "User created successfully.", user }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to save user data", error }),
    };
  }
};
