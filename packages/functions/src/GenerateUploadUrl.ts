import * as AWS from "aws-sdk";

const s3 = new AWS.S3();

export async function handler(event: any) {


    const claims = event.requestContext?.authorizer?.jwt?.claims;
    if (!claims || !claims.sub) {
        return {
            statusCode: 401,
            body: JSON.stringify({message: "Unauthorized: Missing claims or sub"}),
        };
    }

    // Extract the authenticated user's ID (sub) from the claims
    const ownerId = claims.sub;

    console.log("Authenticated User ID:", ownerId);


    const {fileName, fileType} = JSON.parse(event.body);
    console.log("Bucket Name:", process.env.CSVReadings); // Debugging log
    const bucketName = process.env.CSVReadings as string;
    if (!bucketName) {
        return {
            statusCode: 500,
            body: JSON.stringify({error: "Bucket name is not defined in environment variables"}),
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
        body: JSON.stringify({uploadURL}),
    };
}

export async function uploadImageForResult(event: any) {

    const claims = event.requestContext?.authorizer?.jwt?.claims;
    if (!claims || !claims.sub) {
        return {
            statusCode: 401,
            body: JSON.stringify({message: "Unauthorized: Missing claims or sub"}),
        };
    }

    // Extract the authenticated user's ID (sub) from the claims
    const ownerId = claims.sub;

    console.log("Authenticated User ID:", ownerId);

    const {fileName, fileType} = JSON.parse(event.body);
    console.log("Bucket Name:", process.env.indexBucket); // Debugging log
    const bucketName = process.env.indexBucket as string;
    if (!bucketName) {
        return {
            statusCode: 500,
            body: JSON.stringify({error: "Bucket name is not defined in environment variables"}),
        };
    }
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Expires: 300, // URL expiration in seconds
        ContentType: fileType,
    };
    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    return {
        statusCode: 200,
        body: JSON.stringify({uploadURL}),
    };
}

export async function uploadImageForCrop(event: any) {
    const {fileName, fileType} = JSON.parse(event.body);

    console.log("Received request to generate signed URL for:", {fileName, fileType});

    // Validate fileType
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(fileType)) {
        return {
            statusCode: 400,
            body: JSON.stringify({error: "Invalid file type"}),
        };
    }

    // Sanitize fileName
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "");
    if (!sanitizedFileName) {
        return {
            statusCode: 400,
            body: JSON.stringify({error: "Invalid file name"}),
        };
    }

    const bucketName = process.env.imageBucket as string;
    if (!bucketName) {
        console.error("Bucket name is not defined in environment variables");
        return {
            statusCode: 500,
            body: JSON.stringify({error: "Bucket name is not defined in environment variables"}),
        };
    }

    const params = {
        Bucket: bucketName,
        Key: sanitizedFileName,
        Expires: 300,
        ContentType: fileType,
    };

    try {
        const uploadURL = await s3.getSignedUrlPromise("putObject", params);
        console.log("Generated signed URL:", uploadURL);
        return {
            statusCode: 200,
            body: JSON.stringify({uploadURL, imageURL: `https://${bucketName}.s3.amazonaws.com/${sanitizedFileName}`}),
        };
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({error: "Could not generate signed URL"}),
        };
    }
}
