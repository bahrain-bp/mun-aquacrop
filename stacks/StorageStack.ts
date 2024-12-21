import {StackContext, Bucket, Function, use} from "sst/constructs";
import { HttpMethods, BlockPublicAccess } from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";
import {DynamoDBStack} from "./DynamoDBStack";


export function S3Stack({ stack }: StackContext) {
    const {stationTable, weatherReadingsTable} = use(DynamoDBStack);

    const imageBucket = new Bucket(stack, "CropsImagesBucket", {
        cdk: {
            bucket: {
                versioned: true,
                removalPolicy: stack.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
                publicReadAccess: true,
                cors: [
                    {
                        allowedHeaders: ["*"],
                        allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST],
                        allowedOrigins: ["*"], // TODO: Replace "*" with your frontend's domain for production
                        exposedHeaders: ["ETag"],
                        maxAge: 3000,
                    },
                ],
            },
        },
    });

    const CSVReadings = new Bucket(stack, "CSVReadings", {
        cdk: {
            bucket: {
                versioned: true,
                removalPolicy: stack.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
                blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, // Blocks public ACLs but allows bucket policies
                cors: [
                    {
                        allowedHeaders: ["*"],
                        allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST],
                        allowedOrigins: ["*"], // TODO: Replace "*" with your frontend's domain for production
                        exposedHeaders: ["ETag"],
                        maxAge: 3000,
                    },
                ],
            },
        },
    });

    const ProcessCSV = new Function(stack, "csvProcessor", {
        handler: "packages/functions/src/csvProcessor.handler", // Ensure this path is correct
        environment: {
            stationTable:stationTable.tableName,
            weatherReadingsTable:weatherReadingsTable.tableName
        },
        permissions: [CSVReadings,stationTable,weatherReadingsTable], // Grants necessary permissions
    });

    // 5. Add notification to CSVReadings bucket to trigger Lambda on object creation
    CSVReadings.addNotifications(stack, {
        objectCreatedInCSVReadings: {
            function: ProcessCSV,
            events: ["object_created"], // Triggers on object creation
        },
    });

    // 6. Output the bucket names and table name for reference
    stack.addOutputs({
        ImageBucketName: imageBucket.bucketName,
        CSVReadingsBucketName: CSVReadings.bucketName,
    });

    return { imageBucket, CSVReadings };
}
