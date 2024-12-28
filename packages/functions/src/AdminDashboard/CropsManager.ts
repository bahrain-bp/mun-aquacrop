// packages/functions/src/CropsManager.ts

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB Document Client
const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION, // Ensure this matches your serverless.yml
});

// Get the DynamoDB table name from environment variables
const TABLE_NAME = process.env.cropTable;

// Define the Crop interface
interface Crop {
    CropID: string;
    nameEN: string;
    nameAR: string;
    GrowthStage: {
        ini: number;
        mid: number;
        end: number;
    };
    kc: {
        ini: number;
        mid: number;
        end: number;
    };
    ImageURL: string;
}

// Helper function to parse JSON safely
const parseJSON = (str: string | null): any => {
    try {
        return JSON.parse(str || '');
    } catch (e) {
        return null;
    }
};

/**
 * Handler to add a new crop
 */
export const add = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Parse the request body
    const body = parseJSON(event.body);

    if (!body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid JSON in request body.' }),
        };
    }

    const { nameEN, nameAR, growthStage, kc, ImageURL } = body;

    // Basic Validation
    if (!nameEN || !nameAR || !growthStage || !kc || !ImageURL) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'All fields are required.' }),
        };
    }

    // Further validation can be added here (e.g., data types, value ranges)

    // Generate a unique CropID
    const CropID = uuidv4();

    const newCrop: Crop = {
        CropID,
        nameEN,
        nameAR,
        GrowthStage: {
            ini: growthStage.ini,
            mid: growthStage.mid,
            end: growthStage.end, // Assuming 'final' in request maps to 'end' in DynamoDB
        },
        kc: {
            ini: kc.ini,
            mid: kc.mid,
            end: kc.end,
        },
        ImageURL,
    };

    // Prepare DynamoDB put parameters
    const params = {
        TableName: TABLE_NAME!,
        Item: newCrop,
    };

    try {
        // Insert the new crop into DynamoDB
        await dynamoDB.put(params).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Crop added successfully!', crop: newCrop }),
        };
    } catch (error: any) {
        console.error('Error adding crop:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to add crop.', error: error.message }),
        };
    }
};

/**
 * Handler to update an existing crop
 */
export const update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Parse the request body
    const body = parseJSON(event.body);

    if (!body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid JSON in request body.' }),
        };
    }

    const { CropID, nameEN, nameAR, growthStage, kc, ImageURL } = body;

    // Validation
    if (!CropID) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'CropID is required for update.' }),
        };
    }

    // Retrieve the existing crop
    const getParams = {
        TableName: TABLE_NAME!,
        Key: { CropID },
    };

    try {
        const existingCrop = await dynamoDB.get(getParams).promise();

        if (!existingCrop.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Crop not found.' }),
            };
        }

        // Merge existing crop with updated fields
        const updatedCrop: Crop = {
            ...existingCrop.Item,
            nameEN: nameEN || existingCrop.Item.nameEN,
            nameAR: nameAR || existingCrop.Item.nameAR,
            GrowthStage: {
                ini: growthStage?.ini !== undefined ? growthStage.ini : existingCrop.Item.GrowthStage.ini,
                mid: growthStage?.mid !== undefined ? growthStage.mid : existingCrop.Item.GrowthStage.mid,
                end: growthStage?.end !== undefined ? growthStage.end : existingCrop.Item.GrowthStage.end,
            },
            kc: {
                ini: kc?.ini !== undefined ? kc.ini : existingCrop.Item.kc.ini,
                mid: kc?.mid !== undefined ? kc.mid : existingCrop.Item.kc.mid,
                end: kc?.end !== undefined ? kc.end : existingCrop.Item.kc.end,
            },
            ImageURL: ImageURL || existingCrop.Item.ImageURL,
        };

        if(ImageURL != existingCrop.Item.ImageURL){
            try {
                const url = new URL(existingCrop.Item.ImageURL);
                const objectKey = decodeURIComponent(url.pathname.substring(1)); // Removes the leading '/'

                const deleteS3Params = {
                    Bucket: process.env.imageBucket!,
                    Key: objectKey,
                };

                await new AWS.S3().deleteObject(deleteS3Params).promise();
            } catch (s3Error) {
                console.error('Error deleting image from S3:', s3Error);
                // Optionally, you can decide how to handle partial failures
                // For example, you might want to return a 200 response but log the S3 failure
            }

        }


        // Prepare DynamoDB put parameters
        const params = {
            TableName: TABLE_NAME!,
            Item: updatedCrop,
        };

        // Insert the updated crop into DynamoDB
        await dynamoDB.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Crop updated successfully!', crop: updatedCrop }),
        };
    } catch (error: any) {
        console.error('Error updating crop:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to update crop.', error: error.message }),
        };
    }
};


export const deleteCrop = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const CropID = event.pathParameters?.CropID;

    if (!CropID) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'CropID is required.' }),
        };
    }

    const getParams = {
        TableName: TABLE_NAME,
        Key: { CropID },
    };

    try {
        const existingCrop = await dynamoDB.get(getParams).promise();

        if (!existingCrop.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Crop not found.' }),
            };
        }

        const { ImageURL } = existingCrop.Item;

        // Delete the crop from DynamoDB
        const deleteParams = {
            TableName: TABLE_NAME,
            Key: { CropID },
        };

        await dynamoDB.delete(deleteParams).promise();

        if (ImageURL) {
            try {
                const url = new URL(ImageURL);
                const objectKey = decodeURIComponent(url.pathname.substring(1)); // Removes the leading '/'

                const deleteS3Params = {
                    Bucket: process.env.imageBucket!,
                    Key: objectKey,
                };

                await new AWS.S3().deleteObject(deleteS3Params).promise();
            } catch (s3Error) {
                console.error('Error deleting image from S3:', s3Error);
                // Optionally, you can decide how to handle partial failures
                // For example, you might want to return a 200 response but log the S3 failure
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Crop deleted successfully.' }),
        };
    } catch (error: any) {
        console.error('Error deleting crop:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to delete crop.', error: error.message }),
        };
    }
};
