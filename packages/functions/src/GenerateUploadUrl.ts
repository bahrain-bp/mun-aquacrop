import * as AWS from "aws-sdk";
const s3 = new AWS.S3();

export async function handler(event: any) {


    const claims = event.requestContext?.authorizer?.jwt?.claims;
    if (!claims || !claims.sub) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Unauthorized: Missing claims or sub" }),
        };
    }

    // Extract the authenticated user's ID (sub) from the claims
    const ownerId = claims.sub;

    console.log("Authenticated User ID:", ownerId);


    const { fileName, fileType } = JSON.parse(event.body);
    console.log("Bucket Name:", process.env.CSVReadings); // Debugging log
    const bucketName = process.env.CSVReadings as string;
    if (!bucketName) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Bucket name is not defined in environment variables" }),
        };
    }
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Expires: 60, // URL expiration in seconds
        ContentType: fileType,
    };
    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    return {
        statusCode: 200,
        body: JSON.stringify({ uploadURL }),
    };
}

export async function uploadImageForResult(event: any) {

    const claims = event.requestContext?.authorizer?.jwt?.claims;
    if (!claims || !claims.sub) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Unauthorized: Missing claims or sub" }),
        };
    }

    // Extract the authenticated user's ID (sub) from the claims
    const ownerId = claims.sub;

    console.log("Authenticated User ID:", ownerId);

    const { fileName, fileType } = JSON.parse(event.body);
    console.log("Bucket Name:", process.env.indexBucket); // Debugging log
    const bucketName = process.env.indexBucket as string;
    if (!bucketName) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Bucket name is not defined in environment variables" }),
        };
    }
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Expires: 60, // URL expiration in seconds
        ContentType: fileType,
    };
    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    return {
        statusCode: 200,
        body: JSON.stringify({ uploadURL }),
    };
}