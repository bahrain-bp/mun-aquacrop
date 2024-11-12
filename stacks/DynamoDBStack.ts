// stacks/DynamoDBStack.ts
import { StackContext, Table } from "sst/constructs";

export function DynamoDBStack({ stack }: StackContext) {
    // Define each table based on your ERD
    const userTable = new Table(stack, "User", {
        fields: {
            UID: "string",
            Name: "string",
            Mobile: "string",
            regDate: "string",
            LastLogged: "string",
        },
        primaryIndex: { partitionKey: "UID" },
    });

    const cropTable = new Table(stack, "Crop", {
        fields: {
            CropID: "string",
            Name: "string",
            growth_states: "map",
            ImageS3URL: "string",
        },
        primaryIndex: { partitionKey: "CropID" },
    });

    // Define other tables based on your ERD structure
    const weatherReadingsTable = new Table(stack, "WeatherReadings", {
        fields: {
            RID: "string",
            SID: "string",
            date: "string",
            radiation: "map",
            Temp: "map",
            wind_speed: "number",
            humidity: "number",
        },
        primaryIndex: { partitionKey: "RID" },
        secondaryIndexes: {
            stationIndex: { partitionKey: "SID" },
        },
    });

    // Repeat for the remaining tables...

}
