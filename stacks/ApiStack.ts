import { Api, StackContext, use } from "sst/constructs";
import { DBStack } from "./DBStack";
import { AuthStack } from "./AuthStack"; // Adjust the path if necessary
import { CacheHeaderBehavior, CachePolicy } from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib/core";

export function ApiStack({ stack }: StackContext) {
  const { table } = use(DBStack);
  const auth = use(AuthStack);

  // Create the HTTP API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        // Bind the table name to our API
        bind: [table],
      },
    },
    routes: {
      // Sample TypeScript lambda function
      "POST /": "packages/functions/src/lambda.main",

      // Penman equation Lambda function
      "POST /penman": "packages/functions/src/penman.handler",

      // Sample Python lambda function
      "GET /hello": {
        function: {
          handler: "packages/functions/src/sample-python-lambda/lambda.main",
          runtime: "python3.11",
          timeout: "60 seconds",
        },
      },
      
      // Add new routes for custom authentication
      "POST /auth/InitiateAuthentication": {
        function: {
          handler: "packages/functions/src/Authentication/InitiateAuthentication.handler",
          runtime: "nodejs18.x",
          permissions: ["cognito-idp:AdminGetUser", "cognito-idp:AdminCreateUser"],
        },
      },
      "POST /auth/VerifyChallenge": {
        function: {
          handler: "packages/functions/src/Authentication/VerifyChallenge.handler",
          runtime: "nodejs18.x",
        },
      },
    },
  });

  // Cache policy to use with CloudFront as reverse proxy to avoid CORS
  const apiCachePolicy = new CachePolicy(stack, "CachePolicy", {
    minTtl: Duration.seconds(0), // No cache by default unless backend decides otherwise
    defaultTtl: Duration.seconds(0),
    headerBehavior: CacheHeaderBehavior.allowList(
      "Accept",
      "Authorization",
      "Content-Type",
      "Referer"
    ),
  });

  return { api, apiCachePolicy };
}
