import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });

export const handler = async (event) => {
  const { phoneNumber, fullname } = JSON.parse(event.body); // Include `fullname` from the request body

  if (!phoneNumber || !fullname) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing phone number or fullname in request body." }),
    };
  }

  const userPoolId = "us-east-1_x1TCD411J"; // Replace with your User Pool ID
  const clientId = "32hncgshhd5c88g95c5ie3gi61"; // Replace with your ClientId

  // Params for initiating authentication
  const authParams = {
    AuthFlow: "CUSTOM_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: phoneNumber,
    },
  };

  try {
    // Step 1: Check if the user exists
    let sub = null;
    const getUserParams = {
      UserPoolId: userPoolId,
      Username: phoneNumber,
    };

    try {
      const getUserCommand = new AdminGetUserCommand(getUserParams);
      const getUserResponse = await cognitoClient.send(getUserCommand);

      // Extract the `sub` attribute if the user exists
      const subAttribute = getUserResponse.UserAttributes.find(attr => attr.Name === "sub");
      sub = subAttribute ? subAttribute.Value : null;

      console.log(`User ${phoneNumber} exists with sub: ${sub}`);
    } catch (error) {
      if (error.name === "UserNotFoundException") {
        console.log(`User ${phoneNumber} does not exist. Creating user...`);

        // Step 2: Create the user if they do not exist
        const createUserParams = {
          UserPoolId: userPoolId,
          Username: phoneNumber,
          UserAttributes: [
            { Name: "phone_number", Value: phoneNumber },
            { Name: "name", Value: fullname }, // Add `fullname` attribute to user creation
          ],
          TemporaryPassword: "Temp@1234", // Replace with a secure temporary password
          MessageAction: "SUPPRESS", // Suppress sending the temporary password message
        };

        const createUserCommand = new AdminCreateUserCommand(createUserParams);
        const createUserResponse = await cognitoClient.send(createUserCommand);

        // Extract the `sub` from the user creation response
        sub = createUserResponse.User.Attributes.find(attr => attr.Name === "sub").Value;
        console.log(`User ${phoneNumber} created with sub: ${sub}`);
      } else {
        throw error; // Re-throw any other errors
      }
    }

    if (!sub) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Failed to retrieve or create user ID (sub)." }),
      };
    }

    // Step 3: Initiate authentication
    const authCommand = new InitiateAuthCommand(authParams);
    const authResponse = await cognitoClient.send(authCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        session: authResponse.Session,
        challengeName: authResponse.ChallengeName,
        sub, // Return the `sub` to the client
        phoneNumber, // Add phoneNumber to response
        fullname, // Add fullname to response
      }),
    };
  } catch (error) {
    console.error("Error during authentication:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to initiate authentication." }),
    };
  }
};
