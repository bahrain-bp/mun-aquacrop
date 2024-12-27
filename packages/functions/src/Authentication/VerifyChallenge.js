import { CognitoIdentityProviderClient, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });
const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const handler = async (event) => {
  const { session, challengeAnswer, sub, phoneNumber, fullname } = JSON.parse(event.body); // Extract necessary details

  if (!sub || !phoneNumber) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required information in request body." }),
    };
  }

  const params = {
    ClientId: "32hncgshhd5c88g95c5ie3gi61", // Replace with your ClientId 
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

      // Update LastLogged time for existing users
      const updateParams = {
        TableName: "SaqiDev-mun-aquacrop-User",
        Key: {
          UID: sub
        },
        UpdateExpression: "SET LastLogged = :lastLogged",
        ExpressionAttributeValues: {
          ":lastLogged": new Date().toISOString()
        }
      };

      try {
        await ddbDocClient.send(new UpdateCommand(updateParams));
      } catch (dbError) {
        // If user doesn't exist and fullname is provided (registration case), create new user
        if (dbError.name === 'ResourceNotFoundException' && fullname) {
          const putParams = {
            TableName: "SaqiDev-mun-aquacrop-User",
            Item: {
              UID: sub,
              Name: fullname,
              Mobile: phoneNumber,
              regDate: new Date().toISOString(),
              LastLogged: new Date().toISOString(),
              CollectData: 0,
              Location: "",
              Language: "",
            },
          };
          await ddbDocClient.send(new PutCommand(putParams));
          console.log(`Successfully created new user ${sub} in DynamoDB`);
        } else {
          console.error("Error updating DynamoDB:", dbError);
        }
      }

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
