import {StackContext, Bucket, Function, use} from "sst/constructs";
import {HttpMethods, BlockPublicAccess} from "aws-cdk-lib/aws-s3";
import {RemovalPolicy} from "aws-cdk-lib";
import {DynamoDBStack} from "./DynamoDBStack";



export function S3Stack({stack}: StackContext) {
    const {stationTable, weatherReadingsTable, imageResult, aiResult} = use(DynamoDBStack);

    const indexBucket = new Bucket(stack, "indexBucket", {
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

        // Define the AI Lambda function
        /*const aiProcessor = new Function(stack, "aiProcessor", {
            handler: "packages/functions/src/aiProcessor.handler", // Ensure this path is correct
            environment: {
                SAGEMAKER_ENDPOINT: "jumpstart-dft-imagenet-mobilenet-v3-20241227-042804", // SageMaker endpoint
            },
            permissions: [
                indexBucket, // Grants permission to access the indexBucket
                "sagemaker:InvokeEndpoint", // Grants permission to invoke SageMaker endpoint
            ],
        });*/
    

    const imageProcessor = new Function(stack, "imageProcessor", {
        handler: "packages/functions/src/imageProcessor.handler", // Ensure this path is correct
        environment: {
            aiResult:aiResult.tableName,
            imageResult: imageResult.tableName,
            stationTable: stationTable.tableName,
            weatherReadingsTable: weatherReadingsTable.tableName,
            SAGEMAKER_ENDPOINT: "jumpstart-dft-imagenet-mobilenet-v3-20241227-042804", // SageMaker endpoint
            DESTINATION_BUCKET: "crop-images-30-class",
        },
        permissions: [imageResult, stationTable, weatherReadingsTable,                
            indexBucket,  // Grants permission to access the source indexBucket
            "s3", // Grant permission for the destination bucket
            aiResult,
            "dynamodb",
            "sagemaker:InvokeEndpoint",] // Grants permission to invoke SageMaker endpoint]
    });

    // Add notification for the AI Lambda
    /*indexBucket.addNotifications(stack, {
        objectCreatedForAI: {
            function: aiProcessor,
            events: ["object_created"], // Triggers on object creation
        },
    });*/

    indexBucket.addNotifications(stack, {
        objectCreatedInIndexBucket: {
            function: imageProcessor,
            events: ["object_created"], // Triggers on object creation
        },
    });


    // Create an SST Bucket with versioning and CORS
    const imageBucket = new Bucket(stack, "CropsImagesBucket", {
        cdk: {
            bucket: {
                versioned: true,
                removalPolicy: stack.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
                publicReadAccess: true,
            },
        },
        cors: [
            {
                allowedHeaders: ["*"],
                allowedMethods: ["GET", "PUT", "POST"],
                allowedOrigins: ["*"],
                exposedHeaders: ["ETag"],
                maxAge: "3000 seconds",
            },
        ],
    });

    // const imageBucket = new Bucket(stack, "CropsImagesBucket", {
    //     cdk: {
    //         bucket: {
    //             versioned: true,
    //             removalPolicy: stack.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    //             publicReadAccess: true,
    //             cors: [
    //                 {
    //                     allowedHeaders: ["*"],
    //                     allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST],
    //                     allowedOrigins: ["*"], // TODO: Replace "*" with your frontend's domain for production
    //                     exposedHeaders: ["ETag"],
    //                     maxAge: 3000,
    //                 },
    //             ],
    //         },
    //     },
    // });

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


    // 5. Add notification to CSVReadings bucket to trigger Lambda on object creation
    const ProcessCSV = new Function(stack, "csvProcessor", {
        handler: "packages/functions/src/csvProcessor.handler", // Ensure this path is correct
        environment: {
            stationTable: stationTable.tableName,
            weatherReadingsTable: weatherReadingsTable.tableName
        },
        permissions: [CSVReadings, stationTable, weatherReadingsTable], // Grants necessary permissions
    });

    // 5. Add notification to CSVReadings bucket to trigger Lambda on object creation
    CSVReadings.addNotifications(stack, {
        objectCreatedInCSVReadings: {
            function: ProcessCSV,
            events: ["object_created"], // Triggers on object creation
        },
    });


    stack.addOutputs({
        ImageBucketName: imageBucket.bucketName,
        CSVReadingsBucketName: CSVReadings.bucketName,
        indexBucketName: indexBucket.bucketName,
    });

    return {imageBucket, CSVReadings, indexBucket};
}
