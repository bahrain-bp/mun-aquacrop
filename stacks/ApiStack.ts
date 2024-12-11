import { Api, StackContext, use } from "sst/constructs";
import { DBStack } from "./DBStack";
import { DynamoDBStack } from "./DynamoDBStack";
import { AuthStack } from "./AuthStack"; 
import { CacheHeaderBehavior, CachePolicy } from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib/core";

export function ApiStack({stack}: StackContext) {
    const {table} = use(DBStack);
    const auth = use(AuthStack);
    const {stationTable, cropTable, weatherReadingsTable} = use(DynamoDBStack);

    const authApi = {
      userPoolId: "us-east-1_yn913oCJF", // Replace with your Cognito User Pool ID
      userPoolClientId: "6330hslmlvljuj2sh78pn13to", // Replace with your Cognito App Client ID
    };

    // Create the HTTP API
    const api = new Api(stack, "Api", {
        defaults: {
            function: {
                // Bind the table name to our API
                bind: [stationTable, cropTable, weatherReadingsTable],
                environment: {
                    StationTableName: stationTable.tableName,
                    CropTableName: cropTable.tableName,
                    WeatherReadingsTableName: weatherReadingsTable.tableName,
                },
            },
        },
        authorizers: {
          authApi: { 
            type: "user_pool",
            userPool: {
              id: authApi.userPoolId,
              clientIds: [authApi.userPoolClientId],
            },
          },
          adminAuthApi: {
            type: "user_pool",
            userPool: {
              id: authApi.userPoolId,
              clientIds: [authApi.userPoolClientId],
            },
            // Add admin group authorization
            identitySource: ["$request.header.Authorization"],
            // Add group authorization check
            authorizationScopes: ["aws.cognito.signin.user.admin"],
            // Ensure admin group validation
            properties: {
              AllowedGroupsOverride: ["Admin"]
            }
          },
        },
        routes: {
            // Sample TypeScript lambda function
            "POST /": "packages/functions/src/lambda.main",

            // Penman equation Lambda function
            "POST /penman": "packages/functions/src/penman.handler",


            "GET /crops": {
                function: {
                    handler: "packages/functions/src/crops-handler.main",
                    timeout: "30 seconds",
                    environment: {
                        CropTableName: cropTable.tableName,
                    },
                    permissions: [cropTable],
                }
            },

            "POST /Latest/Weather/Reading": {
                function: {
                    handler: "packages/functions/src/getLatestWeatherReading.handler",
                    environment: {
                        weatherReadingsTable: weatherReadingsTable.tableName,
                    },
                    permissions: [weatherReadingsTable],
                },
            },



            "POST /station": "packages/functions/src/station-handler.main",

            // route for calculating water
            "POST /calculate/water": {
                function: {
                    handler: "packages/functions/src/calculateWaterNeed.handler",
                    environment: {
                        cropTable: cropTable.tableName,
                        stationTable: stationTable.tableName,
                        weatherReadingsTable: weatherReadingsTable.tableName,
                    },
                    permissions: [stationTable, cropTable, weatherReadingsTable],
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
                    permissions: ["dynamodb:PutItem"],
                },
            },
    

      // Manager Dashboard Routing //


      "POST /managerDashboard/exportData": {
        function: {
          handler: "packages/functions/src/ManagerDashboard/Auth/exportData.handler",
          runtime: "nodejs18.x",
          permissions: ["cognito-idp:AdminGetUser","dynamodb:PutItem","dynamodb:GetItem","dynamodb:UpdateItem"],
        },
      },
      "GET /managerDashboard/Farms": {
        function: {
          handler: "packages/functions/src/ManagerDashboard/GetFarms.handler",
          runtime: "nodejs18.x",
          permissions: ["dynamodb:Query","dynamodb:GetItem"],
        },
        authorizer: "authApi",
      },
      "GET /managerDashboard/Farms/{FarmID}/Zones": {
        function: {
          handler: "packages/functions/src/ManagerDashboard/GetZones.handler",
          runtime: "nodejs18.x",
          permissions: ["dynamodb:Query","dynamodb:GetItem","s3:GetObject","s3:ListBucket"],
        },
        authorizer: "authApi",
      },
      "POST /managerDashboard/Farms/{FarmID}/Zones/{ZoneID}/Irrigate": {
        function: {
          handler: "packages/functions/src/ManagerDashboard/TriggerIrrigation.handler",
          runtime: "nodejs18.x",
          
        },
        authorizer: "authApi",
      },
      "POST /managerDashboard/Farms/{FarmID}/Zones/{ZoneID}/UpdateStatus": {
        function: {
          handler: "packages/functions/src/ManagerDashboard/UpdateZoneStatus.handler",
          runtime: "nodejs18.x",
          
        },
        authorizer: "authApi", 
      },


      // Admin Dashboard Routing //

      // "POST /adminDashboard/farms": {
      //   function: {
      //     handler: "packages/functions/src/AdminDashboard/AddFarm.handler",
      //     runtime: "nodejs18.x",
      //     permissions: ["dynamodb:PutItem"],
      //   },
      //   authorizer: "adminAuthApi",
      // },
      "DELETE /adminDashboard/farms/{FarmID}": {
        function: {
          handler: "packages/functions/src/AdminDashboard/DeleteFarm.handler",
          runtime: "nodejs18.x",
          permissions: ["dynamodb:DeleteItem", "dynamodb:GetItem"],
        },
        authorizer: "adminAuthApi",
      },
      "POST /adminDashboard/farms/{FarmID}/zones": {
        function: {
          handler: "packages/functions/src/AdminDashboard/AddZone.handler",
          runtime: "nodejs18.x",
          permissions: ["dynamodb:PutItem"],
        },
        authorizer: "adminAuthApi",
      },
      "DELETE /adminDashboard/farms/{FarmID}/zones/{ZoneID}": {
        function: {
          handler: "packages/functions/src/AdminDashboard/DeleteZone.handler",
          runtime: "nodejs18.x",
          permissions: ["dynamodb:DeleteItem", "dynamodb:GetItem"],
        },
        authorizer: "adminAuthApi",
      },
      "POST /adminDashboard/farms/{FarmID}/assign": {
        function: {
          handler: "packages/functions/src/AdminDashboard/AssignFarm.handler",
          runtime: "nodejs18.x",
          permissions: ["dynamodb:UpdateItem", "cognito-idp:AdminGetUser"],
        },
        authorizer: "adminAuthApi",
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

    return {api, apiCachePolicy};
}
