import { DynamoDBDocumentClient, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";




// Initialize DynamoDB and S3 clients
const dynamoDBClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3Client = new S3Client({ region: "us-east-1" });
const ZONES_TABLE = "SaqiDev-mun-aquacrop-Zones"; 
const FARMS_TABLE = "SaqiDev-mun-aquacrop-Farms";
const CROPS_TABLE = "SaqiDev-mun-aquacrop-Crop";
const S3_BUCKET_NAME = "saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua";

const getPresignedUrl = async (bucketName, key) => {
  try {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return null; // Return null if an error happens
  }
};

export const handler = async (event) => {
  try {
   

    // Extract FarmID from path parameters and owner ID from claims
    const { FarmID } = event.pathParameters;
    const ownerId = event.requestContext?.authorizer?.jwt?.claims?.sub;

    if (!FarmID || !ownerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing FarmID or OwnerID" }),
      };
    }

    // Validate that the farm belongs to the authenticated admin
    const farmValidationResponse = await dynamoDBClient.send(
      new GetCommand({
        TableName: FARMS_TABLE,
        Key: { OwnerID: ownerId, FarmID },
      })
    );

    if (!farmValidationResponse.Item) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "You do not have access to this farm." }),
      };
    }


    // Fetch zones for the specified FarmID
    const zoneResponse = await dynamoDBClient.send(
      new QueryCommand({
        TableName: ZONES_TABLE,
        KeyConditionExpression: "FarmID = :farmId",
        ExpressionAttributeValues: {
          ":farmId": FarmID,
        },
      })
    );

    const adjustKeyForS3 = (url) => {
      try {
        const urlObject = new URL(url); // Parse the full URL
        const rawKey = urlObject.pathname.substring(1); // Remove leading '/'
        const adjustedKey = rawKey.replace(/\+/g, " "); // Replace '+' with space (' ')
        return decodeURIComponent(adjustedKey); // Decode any additional URL-encoded characters
      } catch (error) {
        console.error("Error adjusting key for S3:", error);
        return null; // Return null if key extraction fails
      }
    };

    // Fetch crop images for each zone
    const zonesWithImages = await Promise.all(
      zoneResponse.Items.map(async (zone) => {
        const cropResponse = await dynamoDBClient.send(
          new GetCommand({
            TableName: CROPS_TABLE,
            Key: { CropID: zone.CropID },
          })
        );


        const rawImageURL = cropResponse.Item?.ImageURL || null;
        const objectKey = rawImageURL ? adjustKeyForS3(rawImageURL) : null;
    
        const CropImageURL = objectKey
          ? await getPresignedUrl(S3_BUCKET_NAME, objectKey)
          : null;
    
        return {
          ...zone,
          CropImageURL,
        };
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ zones: zonesWithImages }),
    };
  } catch (error) {
    console.error("Error fetching zones:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch zones", error }),
    };
  }
};
