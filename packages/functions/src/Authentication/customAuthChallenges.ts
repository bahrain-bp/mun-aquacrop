import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const snsClient = new SNSClient({ region: "us-east-1" });

const MAX_RETRIES = 3;
const CHALLENGE_EXPIRATION_MINUTES = 5;

interface CognitoEvent {
  triggerSource: string;
  request: {
    session: Array<{
      challengeName: string;
      challengeResult: boolean;
    }>;
    challengeName?: string;
    challengeAnswer?: string;
    privateChallengeParameters?: {
      challengeCode: string;
      expirationTime: string;
    };
    userAttributes: {
      [key: string]: string;
    };
  };
  response: {
    challengeName?: string;
    issueTokens: boolean;
    failAuthentication: boolean;
    publicChallengeParameters?: {
      [key: string]: string;
    };
    privateChallengeParameters?: {
      [key: string]: string;
    };
    challengeMetadata?: string;
    answerCorrect?: boolean;
  };
}

export const lambda_handler = async (event: CognitoEvent): Promise<CognitoEvent> => {
  switch (event.triggerSource) {
    case "DefineAuthChallenge":
    case "DefineAuthChallenge_Authentication":
      return defineAuthChallenge(event);
    case "CreateAuthChallenge":
    case "CreateAuthChallenge_Authentication":
      return createAuthChallenge(event);
    case "VerifyAuthChallengeResponse":
    case "VerifyAuthChallengeResponse_Authentication":
      return verifyAuthChallengeResponse(event);
    default:
      throw new Error(`Unknown trigger source: ${event.triggerSource}`);
  }
};

const defineAuthChallenge = (event: CognitoEvent): CognitoEvent => {
  const session = event.request.session;

  if (session.length >= MAX_RETRIES) {
    event.response.failAuthentication = true;
    event.response.issueTokens = false;
  } else if (session.length === 0) {
    event.response.challengeName = "CUSTOM_CHALLENGE";
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
  } else if (session.slice(-1)[0]?.challengeResult === true) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else {
    event.response.challengeName = "CUSTOM_CHALLENGE";
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
  }
  return event;
};

const createAuthChallenge = async (event: CognitoEvent): Promise<CognitoEvent> => {
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
      console.log(`Successfully sent challenge code to ${phoneNumber}, code: ${challengeCode}`);
    } catch (error) {
      console.error(`Failed to send challenge code: ${error}`);
    }

    event.response.publicChallengeParameters = {
      phoneNumber,
      USERNAME: event.request.userAttributes.sub,
    };
    event.response.privateChallengeParameters = {
      challengeCode,
      expirationTime: expirationTime.toString(),
    };
    event.response.challengeMetadata = "CODE_CHALLENGE";
  }
  return event;
};

const verifyAuthChallengeResponse = (event: CognitoEvent): CognitoEvent => {
  const privateParams = event.request.privateChallengeParameters;
  if (!privateParams) {
    throw new Error("Private challenge parameters are missing.");
  }

  const expectedAnswer = privateParams.challengeCode;
  const expirationTime = parseInt(privateParams.expirationTime);

  if (Date.now() > expirationTime) {
    event.response.answerCorrect = false; // Challenge has expired
  } else if (event.request.challengeAnswer === expectedAnswer) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }
  return event;
};
