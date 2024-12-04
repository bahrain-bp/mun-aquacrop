import {APIGatewayProxyHandler, AttributeValue} from 'aws-lambda';
import {DynamoDBClient, ScanCommand} from "@aws-sdk/client-dynamodb";
import {ScanCommandOutput} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});


// Helper function to convert degrees to radians
const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

// Haversine formula to calculate the distance between two latitude/longitude points
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1); // Difference in latitudes (convert to radians)
    const dLon = toRadians(lon2 - lon1); // Difference in longitudes (convert to radians)

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};


function mapToWeatherReading(item: Record<string, AttributeValue>): WeatherReading {
    return {
        ReadingID: item.ReadingID.S!, // Use `S` for string attributes
        StationID: item.StationID.S!,
        date: item.Date.S!,
        incomingRadiation: parseFloat(item.incomingRadiation.N!), // Use `N` for number attributes
        outgoingRadiation: parseFloat(item.outgoingRadiation.N!),
        meanTemp: parseFloat(item.meanTemp.N!),
        minTemp: parseFloat(item.minTemp.N!),
        maxTemp: parseFloat(item.maxTemp.N!),
        wind_speed: parseFloat(item.wind_speed.N!),
        humidity: parseFloat(item.humidity.N!),
    };
}


const penman = (Rin: number, Rout: number, Tmin: number, Tmax: number, H: number, U: number, G: number = 0): number => {
    // Constants

    const T = (Tmax + Tmin) / 2; // Average temperature
    const Rn = Rin - Rout; // Net radiation
    const γ = 0.665 * 0.001 * 101.3; // Psychrometric constant
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

    return ET;
}

// ReadingID: "string",
//     StationID: "string",
//     date: "string",
//     incomingRadiation: "number",
//     outgoingRadiation: "number",
//     meanTemp: "number",
//     minTemp: "number",
//     maxTemp: "number",
//     wind_speed: "number",
//     humidity: "number",


interface WeatherReading {
    ReadingID: string;
    StationID: string;
    date: string;
    incomingRadiation: number;
    outgoingRadiation: number;
    meanTemp: number;
    minTemp: number;
    maxTemp: number;
    wind_speed: number;
    humidity: number;
}


// Lambda function to find the nearest station
export const handler: APIGatewayProxyHandler = async (event: any) => {
    try {
        // Parse the request body
        const body = JSON.parse(event.body);
        const userLat = parseFloat(body.lat);
        const userLon = parseFloat(body.lon);

        // Validate input coordinates
        if (isNaN(userLat) || isNaN(userLon)) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: 'Invalid latitude or longitude provided.'}),
            };
        }

        // Ensure the environment variable is set
        const tableName = process.env.stationTable;
        if (!tableName) {
            throw new Error('Environment variable "stationTable" is not defined');
        }

        // Fetch all stations from the DynamoDB table
        const params = {
            TableName: tableName,
        };

        const command = new ScanCommand(params);
        const result = await client.send(command);

        if (!result.Items || result.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({message: 'No stations found'}),
            };
        }

        let nearestStationId: string | null = null;
        let minDistance = Infinity;
        let lastReading: string | null = null;

        // Iterate over stations and find the nearest one
        for (const station of result.Items) {
            if (!station.Location || !station.StationID) {
                console.warn('Station missing Location or StationID:', station);
                continue; // Skip if necessary attributes are missing
            }

            // Access the actual map values from DynamoDB AttributeValue
            const location = station.Location.M;
            const stationIdAttr = station.StationID.S;


            if (!location || !stationIdAttr) {
                console.warn('Location map or StationID is undefined:', station);
                continue; // Skip if values are undefined
            }

            const latAttr = location.Latitude;
            const lonAttr = location.Longitude;

            if (!latAttr || !lonAttr) {
                console.warn('Latitude or Longitude missing in Location:', location);
                continue; // Skip if lat/lon are missing
            }

            // @ts-ignore
            const stationLat = parseFloat(latAttr.N);
            // @ts-ignore
            const stationLon = parseFloat(lonAttr.N);
            const stationId = stationIdAttr;

            if (isNaN(stationLat) || isNaN(stationLon)) {
                console.warn('Invalid latitude or longitude values:', latAttr, lonAttr);
                continue; // Skip if lat/lon are not valid numbers
            }

            // Calculate the distance from the user to the station
            const distance = haversine(userLat, userLon, stationLat, stationLon);

            // Update the nearest station if this one is closer
            if (distance < minDistance) {
                minDistance = distance;
                nearestStationId = stationId;
                lastReading = station.LastReadingID.S;
            }
        }

        const paramsWeather = {
            TableName: process.env.weatherReadingsTable,
            Key: {
                ReadingID: lastReading,
            },
        };


        // Perform the get operation
        // const data = await db.get(paramsWeather).promise();

        const commandWeather = new ScanCommand(paramsWeather);
        const resultWeather: ScanCommandOutput = await client.send(commandWeather);


        const item = resultWeather.Items?.[0];
        var weatherReading: WeatherReading | null = null;
        if (item) {
            weatherReading = mapToWeatherReading(item as Record<string, AttributeValue>);
            console.log(weatherReading);
        } else {
            console.error("No items found in the result.");
        }

        //
        // // Rin: number, Rout: number, Tmin: number, Tmax: number, H: number, U: number, G: number = 0

        if (!weatherReading) {
            //TODO: add check
            return;
        }
        const ET0 = penman(weatherReading.incomingRadiation, weatherReading.outgoingRadiation,
            weatherReading.minTemp, weatherReading.maxTemp, weatherReading.humidity, weatherReading.wind_speed, 0);


        // Return the nearest station's ID
        if (nearestStationId) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    nearestStationId,
                    distance: minDistance,
                    lastReading: lastReading,
                    resultWeather: weatherReading,
                    ET0: ET0
                }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({message: 'No valid stations found'}),
            };
        }
    } catch
        (error: any) {
        console.error('Error fetching stations:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({message: 'Internal server error', error: error.message}),
        };
    }
}


