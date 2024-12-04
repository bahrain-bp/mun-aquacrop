import { Api, StackContext, use } from "sst/constructs";
import { DBStack } from "./DBStack";
import { DynamoDBStack } from "./DynamoDBStack";
import { AuthStack } from "./AuthStack"; 
import { CacheHeaderBehavior, CachePolicy } from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib/core";

export function ApiStack({ stack }: StackContext) {
  const { table } = use(DBStack);
  const auth = use(AuthStack);
  // Front End User Pool
  const userPool1 = {
    id: "us-east-1_qAQ8SIlqm", // Replace with your first Cognito User Pool ID
    clientIds: ["15k0htcure51j9hmuiohoebbph","4jhn6qhc7hlkftkjgvkg78mq2f"], // Replace with your first App Client ID
  };
  const {stationTable,cropTable}  = use(DynamoDBStack);

  // Create the HTTP API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        // Bind the table name to our API
        bind: [stationTable, cropTable],
        environment: {
          StationTableName: stationTable.tableName,
          CropTableName: cropTable.tableName,
        },
      },
    },
    authorizers: {
      user_pool1: {
        type: "user_pool",
        userPool: userPool1,
      },
    },
    routes: {
      // Sample TypeScript lambda function
      "POST /": "packages/functions/src/lambda.main",

      // Penman equation Lambda function
      "POST /penman": "packages/functions/src/penman.handler",

      "GET /crops": "packages/functions/src/crops-handler.main",

      "POST /station": "packages/functions/src/station-handler.main",

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


      // Admin Dashboard Routing //


      "POST /adminDashboard/exportData": {
        function: {
          handler: "packages/functions/src/AdminDashboard/Auth/exportData.handler",
          runtime: "nodejs18.x",
          permissions: ["cognito-idp:AdminGetUser","dynamodb:PutItem","dynamodb:GetItem","dynamodb:UpdateItem"],
        },
      },
      "GET /adminDashboard/Farms": {
        function: {
          handler: "packages/functions/src/AdminDashboard/GetFarms.handler",
          runtime: "nodejs18.x",
        },
        authorizer: "user_pool1",
      },
      "GET /adminDashboard/Farms/{FarmID}/Zones": {
        function: {
          handler: "packages/functions/src/AdminDashboard/GetZones.handler",
          runtime: "nodejs18.x",
        },
        authorizer: "user_pool1",
      },
      "POST /adminDashboard/Farms/{FarmID}/Zones/{ZoneID}/Irrigate": {
        function: {
          handler: "packages/functions/src/AdminDashboard/TriggerIrrigation.handler",
          runtime: "nodejs18.x",
        },
        authorizer: "user_pool1",
      },
      "POST /adminDashboard/Farms/{FarmID}/Zones/{ZoneID}/UpdateStatus": {
        function: {
          handler: "packages/functions/src/AdminDashboard/UpdateZoneStatus.handler",
          runtime: "nodejs18.x",
        },
        authorizer: "user_pool1",
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
