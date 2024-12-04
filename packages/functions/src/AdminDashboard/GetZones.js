import { DynamoDBDocumentClient, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ZONES_TABLE = "SaqiDev-mun-aquacrop-Zones"; // Replace with your actual Zones table name
const FARMS_TABLE = "SaqiDev-mun-aquacrop-Farms"; // Replace with your actual Farms table name

export const handler = async (event) => {
  try {
    // Extract FarmID from path parameters
    const { FarmID } = event.pathParameters;
    const ownerId = event.requestContext.authorizer.claims.sub;

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
        Key: { FarmID },
      })
    );

    if (!farmValidationResponse.Item || farmValidationResponse.Item.OwnerID !== ownerId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "You do not have access to this farm." }),
      };
    }

    // Fetch zones for the specified FarmID
    const response = await dynamoDBClient.send(
      new QueryCommand({
        TableName: ZONES_TABLE,
        KeyConditionExpression: "FarmID = :farmId",
        ExpressionAttributeValues: {
          ":farmId": FarmID,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ zones: response.Items }),
    };
  } catch (error) {
    console.error("Error fetching zones:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch zones", error }),
    };
  }
};
