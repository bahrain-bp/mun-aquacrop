// Lambda function handlers for custom authentication challenges

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
    if (event.request.session.length === 0) {
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
      // Here you would send the challengeCode via SMS using SNS
      console.log(`Sending challenge code: ${challengeCode}`);
      event.response.publicChallengeParameters = { 
        phoneNumber: event.request.userAttributes.phone_number,
        USERNAME: event.request.userAttributes.sub
      };
      event.response.privateChallengeParameters = { challengeCode };
      event.response.challengeMetadata = "CODE_CHALLENGE";
    }
    return event;
  };
  
  export const verifyAuthChallengeResponse = async (event: any) => {
    const expectedAnswer = event.request.privateChallengeParameters.challengeCode;
    if (event.request.challengeAnswer === expectedAnswer) {
      event.response.answerCorrect = true;
    } else {
      event.response.answerCorrect = false;
    }
    return event;
  };
  