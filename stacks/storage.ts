/*import { Bucket, StackContext } from "sst/constructs";


// Create an S3 bucket
export const bucket = new sst.aws.Bucket("hasantests3");*/

import { Bucket, StackContext } from "sst/constructs";

// Define a function to create the bucket within the stack context
export function MyStack({ stack }: StackContext) {
  // Create an S3 bucket using SST's Bucket construct
  const bucket = new Bucket(stack, "hasantests3");

  
}
