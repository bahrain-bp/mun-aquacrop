import { CognitoIdentityProviderClient, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });
const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const handler = async (event) => {
  const { session, challengeAnswer, sub, phoneNumber, fullname } = JSON.parse(event.body); // Extract necessary details

  if (!sub || !phoneNumber || !fullname) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required information in request body." }),
    };
  }

  const params = {
    ClientId: "2jii0mq29gg4jlam8j2a7eqtcv", // Replace with your ClientId
    ChallengeName: "CUSTOM_CHALLENGE",
    Session: session,
    ChallengeResponses: {
      ANSWER: challengeAnswer,
      USERNAME: sub,
    },
  };

  try {
    const command = new RespondToAuthChallengeCommand(params);
    const response = await cognitoClient.send(command);

    if (response.AuthenticationResult) {
      console.log(`User with sub: ${sub} authenticated successfully.`);

      // Step 1: Insert or Update User Data in DynamoDB
      const putParams = {
        TableName: "SaqiDev-mun-aquacrop-User", // Replace with your DynamoDB table name
        Item: {
          UID: sub,
          Name: fullname,
          Mobile: phoneNumber,
          regDate: new Date().toISOString(),  // Registration date
          LastLogged: new Date().toISOString(), // Last logged time
          CollectData: 0, // Default value, update if needed
          Location: "", // Update if applicable
          Language: "", // Update if applicable
        },
      };
      await ddbDocClient.send(new PutCommand(putParams));
      console.log(`Successfully inserted user ${sub} into DynamoDB`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          idToken: response.AuthenticationResult.IdToken,
          accessToken: response.AuthenticationResult.AccessToken,
          refreshToken: response.AuthenticationResult.RefreshToken,
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid challenge response." }),
      };
    }
  } catch (error) {
    console.error("Error verifying challenge response:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to verify challenge response." }),
    };
  }
};
