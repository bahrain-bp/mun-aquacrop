import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { Rn, T, H, U, G = 0 } = JSON.parse(event.body || "{}");

        // Constants
        const γ = 0.066; // Psychrometric constant
        const es = 0.6108 * Math.exp((17.27 * T) / (T + 237.3)); // Saturation vapor pressure
        const ea = es * (H / 100); // Actual vapor pressure
        const Δ = (4098 * es) / ((T + 237.3) ** 2); // Slope of saturation vapor pressure curve

        // Penman equation
        const ET =
            (Δ * (Rn - G) + γ * (900 / (T + 273)) * U * (es - ea)) /
            (Δ + γ * (1 + 0.34 * U));

        return {
            statusCode: 200,
            body: JSON.stringify({ ET }),
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
