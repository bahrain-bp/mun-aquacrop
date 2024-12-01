import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { Rin, Rout, Tmin, Tmax, H, U, G = 0 } = JSON.parse(event.body || "{}");

        // Constants

        const T = (Tmax + Tmin) / 2; // Average temperature
        const Rn = Rin - Rout; // Net radiation
        const γ = 0.665 * 0.001 *101.3; // Psychrometric constant
        const esmax = 0.6108 * Math.exp((17.27 * Tmax) / (Tmax + 237.3)); // Saturation vapor pressure
        const esmin = 0.6108 * Math.exp((17.27 * Tmin) / (Tmin + 237.3)); // Saturation vapor pressure
        const esT = 0.6108 * Math.exp((17.27 * T) / (T + 237.3)); // Saturation vapor pressure
        const es = (esmax + esmin) / 2; // Average saturation vapor pressure
        const ea = es * (H / 100); // Actual vapor pressure
        const Δ = (4098 * esT) / ((T + 237.3) ** 2); // Slope of saturation vapor pressure curve

        // Penman equation
        const ET =
            (0.408 * Δ * (Rn - G) + γ * (900 / (T + 273)) * U * (es - ea)) /
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