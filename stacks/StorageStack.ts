import { StackContext, Bucket } from "sst/constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Duration, RemovalPolicy } from "aws-cdk-lib";

export function StorageStack({ stack }: StackContext) {
    // Create an S3 bucket with Intelligent-Tiering and CORS configuration
    const bucket = new Bucket(stack, "PhotosBucket", {
        cdk: {
            bucket: {
                cors: [
                    {
                        allowedOrigins: ["*"], // Replace "*" with specific origins if needed
                        allowedMethods: ["GET", "PUT", "POST", "DELETE"],
                        allowedHeaders: ["*"],
                        maxAge: 3000,
                    },
                ],
                lifecycleRules: [
                    {
                        transitions: [
                            {
                                storageClass: s3.StorageClass.INTELLIGENT_TIERING,
                                transitionAfter: Duration.days(0), // Move objects immediately to Intelligent-Tiering
                            },
                        ],
                    },
                ],
                publicReadAccess: false, // Set to true if you want public access
                removalPolicy: RemovalPolicy.DESTROY, // Destroy bucket on stack deletion (use RETAIN for production)
            },
        },
    });

    // Output bucket details for reference
    stack.addOutputs({
        BucketName: bucket.bucketName,
        BucketArn: bucket.bucketArn,
    });
}
