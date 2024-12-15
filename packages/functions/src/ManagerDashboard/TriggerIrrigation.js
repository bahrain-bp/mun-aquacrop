// TriggerIrrigation.js
import AWS from "aws-sdk";

// Initialize IoT Data client
const iotData = new AWS.IotData({
  endpoint: "ath1o9l6nvepr-ats.iot.us-east-1.amazonaws.com", // Replace with your AWS IoT endpoint
});

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  // Extract path parameters from the API Gateway event
  const { FarmID, ZoneID } = event.pathParameters || {};
  const { action } = JSON.parse(event.body || "{}");

  const validActions = ["start", "stop", "status"];

  if (!FarmID || !ZoneID) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "FarmID and ZoneID are required" }),
    };
  }

  if (!validActions.includes(action)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Invalid action. Supported actions are: ${validActions.join(", ")}` }),
    };
  }

  const params = {
    topic: "pump/control",
    payload: JSON.stringify({
      action,
      FarmID,
      ZoneID,
      timestamp: new Date().toISOString(),
    }),
    qos: 0, // Quality of Service (0 = At most once)
  };

  try {
    await iotData.publish(params).promise();
    console.log("MQTT message sent successfully:", params);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Irrigation ${action} action completed successfully` }),
    };
  } catch (error) {
    console.error("Failed to send MQTT message", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to ${action} irrigation` }),
    };
  }
};
