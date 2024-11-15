import { Cognito, Function, StackContext } from "sst/constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

export function AuthStack({ stack }: StackContext) {
  // Define the Lambda function for custom authentication
  const customAuthLambda = new Function(stack, "CustomAuthLambda", {
    handler: "src/Authentication/CustomAuthChallenge.lambda_handler",
    timeout: 10,  // Increase timeout to 10 seconds
  });

  // Attach SNS publish permissions to the Lambda function
  customAuthLambda.attachPermissions(["sns:Publish"]);

  // Set up the Cognito User Pool with Custom Authentication
  const auth = new Cognito(stack, "Auth", {
    login: ["phone"],
    triggers: {
      defineAuthChallenge: customAuthLambda,
      createAuthChallenge: customAuthLambda,
      verifyAuthChallengeResponse: customAuthLambda,
    },
    cdk: {
      userPool: {
        selfSignUpEnabled: true,
        signInAliases: { phone: true },
        autoVerify: { phone: true },
        mfa: cognito.Mfa.REQUIRED,
        mfaSecondFactor: {
          sms: true,
          otp: false,
        },
      },
      userPoolClient: {
        authFlows: {
          custom: true,
        },
      },
    },
  });

  // Output User Pool details for easy access in other parts of the stack
  stack.addOutputs({
    UserPoolId: auth.userPoolId,
    UserPoolClientId: auth.userPoolClientId,
  });

  return auth;
}
