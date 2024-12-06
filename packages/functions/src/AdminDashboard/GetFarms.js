import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = "SaqiDev-mun-aquacrop-Farms"; // Replace with your table name

export const handler = async (event) => {
  try {
    console.log("Full Event:", JSON.stringify(event, null, 2));

    // Extract claims from the authorizer
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

    // Query DynamoDB for farms owned by this admin
    const response = await dynamoDBClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "OwnerID = :ownerId",
        ExpressionAttributeValues: {
          ":ownerId": ownerId,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ farms: response.Items }),
    };
  } catch (error) {
    console.error("Error fetching farms:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch farms", error }),
    };
  }
};
