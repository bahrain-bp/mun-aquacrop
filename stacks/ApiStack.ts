import {Api, StackContext, use} from "sst/constructs";
import {DBStack} from "./DBStack";
import {DynamoDBStack} from "./DynamoDBStack";
import {AuthStack} from "./AuthStack"; // Adjust the path if necessary
import {CacheHeaderBehavior, CachePolicy} from "aws-cdk-lib/aws-cloudfront";
import {Duration} from "aws-cdk-lib/core";

export function ApiStack({stack}: StackContext) {
    const {table} = use(DBStack);
    const auth = use(AuthStack);
    const {stationTable, cropTable, weatherReadingsTable} = use(DynamoDBStack);

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
