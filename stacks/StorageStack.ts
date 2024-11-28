import { StackContext } from "sst/constructs";
import { BlockPublicAccess, Bucket, HttpMethods} from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";

export function S3Stack({ stack }: StackContext) {
    // Create an S3 bucket with the desired removal policy and CORS configuration
    const imageBucket = new Bucket(stack, "CropsImagesBucket", {
        versioned: true,
        removalPolicy: stack.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        publicReadAccess: true,  // Sets the bucket to be publicly accessible
        blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, // Allows public access while blocking specific ACLs
        cors: [
            {
                allowedHeaders: ["*"],
                allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST],
                allowedOrigins: ["*"], // TODO: Replace "*" with your frontend's domain for production
                exposedHeaders: ["ETag"],
                maxAge: 3000,
            },
        ],
    });

    const CSVReadings = new Bucket(stack, "CSVReadings", {
        versioned: true,
        removalPolicy: stack.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        publicReadAccess: true,  // Sets the bucket to be publicly accessible
        blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, // Allows public access while blocking specific ACLs
        cors: [
            {
                allowedHeaders: ["*"],
                allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST],
                allowedOrigins: ["*"], // TODO: Replace "*" with your frontend's domain for production
                exposedHeaders: ["ETag"],
                maxAge: 3000,
            },
        ],
    });



    stack.addOutputs({
        imageBucket: imageBucket.bucketName,
        CSVReadings: CSVReadings.bucketName,
    });

    return { imageBucket,CSVReadings };
}