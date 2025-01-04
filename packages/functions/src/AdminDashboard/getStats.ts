import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

const getTotalUsers = async () => {
    const params = {
        TableName: process.env.userTable,
        Select: "COUNT"
    };

    try {
        const command = new ScanCommand(params);
        const result = await client.send(command);
        return result.Count || 0;
    } catch (error) {
        console.error("Error counting users:", error);
        return 0;
    }
};

const getTotalCrops = async () => {
    const params = {
        TableName: process.env.cropTable,
        Select: "COUNT"
    };

    try {
        const command = new ScanCommand(params);
        const result = await client.send(command);
        return result.Count || 0;
    } catch (error) {
        console.error("Error counting crops:", error);
        return 0;
    }
};

const initializeStats = async () => {
    const [totalUsers, totalCrops] = await Promise.all([
        getTotalUsers(),
        getTotalCrops()
    ]);

    const params = {
        TableName: process.env.statsTable,
        Item: {
            "StatID": { S: "MAIN_STATS" },
            "TotalRecommendations": { N: "0" },
            "TotalUsers": { N: totalUsers.toString() },
            "TotalCrops": { N: totalCrops.toString() },
            "TotalWaterUsage": { N: "0" }
        }
    };

    try {
        await client.send(new PutItemCommand(params));
        return params.Item;
    } catch (error) {
        console.error("Error initializing stats:", error);
        throw error;
    }
};

export const handler = async (event: any) => {
    try {
        // Handle OPTIONS request
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization"
                },
                body: ""
            };
        }

        // Get current stats
        const [totalUsers, totalCrops] = await Promise.all([
            getTotalUsers(),
            getTotalCrops()
        ]);

        const params = {
            TableName: process.env.statsTable,
            Key: {
                "StatID": { S: "MAIN_STATS" }
            }
        };

        const command = new GetItemCommand(params);
        let result = await client.send(command);

        // Initialize if no stats exist
        if (!result.Item) {
            result = { 
                Item: await initializeStats(),
                $metadata: { requestId: 'initial', attempts: 1, totalRetryDelay: 0 }
            };
        }

        // Return stats
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                totalRecommendations: Number(result.Item?.TotalRecommendations?.N || "0"),
                totalUsers,
                totalCrops,
                totalWaterUsage: Number(result.Item?.TotalWaterUsage?.N || "0")
            })
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: "Error fetching stats",
                error: error instanceof Error ? error.message : "Unknown error"
            })
        };
    }
};
