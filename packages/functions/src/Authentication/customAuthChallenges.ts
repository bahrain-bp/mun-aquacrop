// Lambda function handlers for custom authentication challenges
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "us-east-1" });

const MAX_RETRIES = 3;
const CHALLENGE_EXPIRATION_MINUTES = 5;

export const lambda_handler = async (event: any) => {
  switch (event.triggerSource) {
    case "DefineAuthChallenge":
    case "DefineAuthChallenge_Authentication":
      return await defineAuthChallenge(event);
    case "CreateAuthChallenge":
    case "CreateAuthChallenge_Authentication":
      return await createAuthChallenge(event);
    case "VerifyAuthChallengeResponse":
    case "VerifyAuthChallengeResponse_Authentication":
      return await verifyAuthChallengeResponse(event);
    default:
      throw new Error(`Unknown trigger source: ${event.triggerSource}`);
  }
};

export const defineAuthChallenge = async (event: any) => {
  if (event.request.session.length >= MAX_RETRIES) {
    event.response.failAuthentication = true;
    event.response.issueTokens = false;
  } else if (event.request.session.length === 0) {
    event.response.challengeName = "CUSTOM_CHALLENGE";
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
  } else if (event.request.session.slice(-1)[0].challengeResult === true) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else {
    event.response.challengeName = "CUSTOM_CHALLENGE";
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
  }
  return event;
};

export const createAuthChallenge = async (event: any) => {
  if (event.request.challengeName === "CUSTOM_CHALLENGE") {
    const challengeCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = Date.now() + CHALLENGE_EXPIRATION_MINUTES * 60 * 1000;
    const phoneNumber = event.request.userAttributes.phone_number;

    // Send the challenge code via SMS using SNS
    try {
      const params = {
        Message: `Your verification code is: ${challengeCode}`,
        PhoneNumber: phoneNumber,
      };
      const command = new PublishCommand(params);
      await snsClient.send(command);
      console.log(`Successfully sent challenge code to ${phoneNumber}`);
    } catch (error) {
      console.error(`Failed to send challenge code: ${error}`);
    }

    event.response.publicChallengeParameters = { 
      phoneNumber: phoneNumber,
      USERNAME: event.request.userAttributes.sub
    };
    event.response.privateChallengeParameters = { 
      challengeCode, 
      expirationTime: expirationTime.toString() 
    };
    event.response.challengeMetadata = "CODE_CHALLENGE";
  }
  return event;
};

export const verifyAuthChallengeResponse = async (event: any) => {
  const expectedAnswer = event.request.privateChallengeParameters.challengeCode;
  const expirationTime = parseInt(event.request.privateChallengeParameters.expirationTime);

  if (Date.now() > expirationTime) {
    event.response.answerCorrect = false;  // Challenge has expired
  } else if (event.request.challengeAnswer === expectedAnswer) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }
  return event;
};
