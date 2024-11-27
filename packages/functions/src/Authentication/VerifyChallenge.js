import { CognitoIdentityProviderClient, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });

export const handler = async (event) => {
  const { session, challengeAnswer, sub } = JSON.parse(event.body); // Extract sub from the request body

  if (!sub) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing user ID (sub) in request body." }),
    };
  }

  const params = {
    ClientId: "5bpassrgca0kgodvcpusalbkek", // Replace with your ClientId
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
