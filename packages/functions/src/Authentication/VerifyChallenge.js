import { CognitoIdentityProviderClient, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

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

      // First, try to get the existing user
      const getUserParams = {
        TableName: "SaqiDev-mun-aquacrop-User",
        Key: {
          UID: sub
        }
      };

      try {
        const existingUser = await ddbDocClient.send(new GetCommand(getUserParams));
        
        if (existingUser.Item) {
          // User exists, update LastLogged
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
          await ddbDocClient.send(new UpdateCommand(updateParams));
        } else {
          // User doesn't exist, create new user
          const newUser = {
            UID: sub,
            Name: fullname,
            Mobile: phoneNumber,
            regDate: new Date().toISOString(),
            LastLogged: new Date().toISOString(),
            CollectData: 0,
            Location: "",
            Language: ""
          };
          
          const putParams = {
            TableName: "SaqiDev-mun-aquacrop-User",
            Item: newUser
          };

          console.log('Creating new user with data:', newUser);
          await ddbDocClient.send(new PutCommand(putParams));
          console.log(`Successfully created new user ${sub} in DynamoDB`);
        }
      } catch (dbError) {
        console.error("Error accessing DynamoDB:", dbError);
        // Continue with the authentication response even if DB operation fails
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
