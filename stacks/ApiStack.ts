import { Api, StackContext, use } from "sst/constructs";
import { DBStack } from "./DBStack";
import { AuthStack } from "./AuthStack"; // Adjust the path if necessary
import { CacheHeaderBehavior, CachePolicy } from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib/core";

export function ApiStack({ stack }: StackContext) {

    const {table} = use(DBStack);
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

            // Sample Pyhton lambda function
            "GET /": {
                function: {
                    handler: "packages/functions/src/sample-python-lambda/lambda.main",
                    runtime: "python3.11",
                    timeout: "60 seconds",
                }
            },
            "GET /public": {
                function: "packages/functions/src/Authentication/public.main",
            },
            "GET /private": {
                function: {
                    handler: "packages/functions/src/Authentication/private.main",
                    runtime: "python3.11",
                },
                   
            },
    },
  });

    // cache policy to use with cloudfront as reverse proxy to avoid cors
    // https://dev.to/larswww/real-world-serverless-part-3-cloudfront-reverse-proxy-no-cors-cgj
    const apiCachePolicy = new CachePolicy(stack, "CachePolicy", {
        minTtl: Duration.seconds(0), // no cache by default unless backend decides otherwise
        defaultTtl: Duration.seconds(0),
        headerBehavior: CacheHeaderBehavior.allowList(
        "Accept",
        "Authorization",
        "Content-Type",
        "Referer"
        ),
    });

    return {api, apiCachePolicy}
}
