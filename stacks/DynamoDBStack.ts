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
            CollectData: "number",
            Location: "string",
            Language: "string",
        },
        primaryIndex: { partitionKey: "UID" },
    });

    const cropTable = new Table(stack, "Crop", {
        fields: {
            CropID: "string",
            NameEn: "string",
            NameAr: "string",
            cropType: "string",
            cropSeason: "string",
            cropDuration: "number",
            cropDescriptionAr: "string",
            cropDescriptionEn: "string",
            cropImageURL: "string",
            KC: "map",
            growthStage: "map",
        },
        primaryIndex: { partitionKey: "CropID" },
    });

    // const cropCoefficientTable = new Table(stack, "CropCoefficeint", {
    //     fields: {
    //         CropID: "string",
    //         growthState: "string",
    //         Kc: "number",
    //         range: "number",
    //     },
    //     primaryIndex: { partitionKey: "CropID"},
    // });


    const weatherReadingsTable = new Table(stack, "WeatherReadings", {
        fields: {
            ReadingID: "string",
            StationID: "string",
            date: "string",
            incomingRadiation: "number",
            outgoingRadiation: "number",
            meanTemp: "number",
            minTemp: "number",
            maxTemp: "number",
            wind_speed: "number",
            humidity: "number",
        },
        primaryIndex: { partitionKey: "ReadingID" },
    });

    const stationTable = new Table(stack, "Station", {
        fields: {
            StationID: "string",
            Name: "string",
            Location: "string",
        },
        primaryIndex: { partitionKey: "StationID" }
    });

    const trackerTable = new Table(stack, "tracker", {
        fields: {
            TrackerId: "string",
            ReadingID: "string",
            CropID: "string",
            UID: "string",
            Date: "string",
            waterAmount: "number",
            ET0: "number",
            cropID: "string",
            stage: "string",
        },
        primaryIndex: { partitionKey: "TrackerId" }
    });


    // Farm Admin Dashboard Tables Now //


    const farmAdminTable = new Table(stack, "FarmAdmin", {
        fields: {
            UID: "string",
            Email: "string",
            Mobile: "string",
            Name: "string",
            regDate: "string",
            LastLogged: "string",
           
        },
        primaryIndex: { partitionKey: "UID" },
    });

    const farmTable = new Table(stack, "Farms", {
        fields: {
            FarmID: "string",
            OwnerID: "string",
            FarmName: "string",
            Location: "string",
        },
        primaryIndex: { partitionKey: "FarmID", },
    });

    const zonesTable = new Table(stack, "Zones", {
        fields: {
            FarmID: "string",
            ZoneID: "string",
            ZoneName: "string",
            IrrigationStatus: "string",
            LastIrrigation: "string",
        },
        primaryIndex: { partitionKey: "FarmID", sortKey: "ZoneID" },
    });



    stack.addOutputs({
        UserTableName: userTable.tableName,
        CropTableName: cropTable.tableName,
        // CropCoefficientTableName: cropCoefficientTable.tableName,
        WeatherReadingsTableName: weatherReadingsTable.tableName,
        StationTableName: stationTable.tableName,
        TrackerTableName: trackerTable.tableName,
        farmAdminTableName: farmAdminTable.tableName,
        farmTableName: farmTable.tableName,
        zonesTableName: zonesTable.tableName,
    });

    return {
        userTable,
        cropTable,
        // cropCoefficientTable,
        weatherReadingsTable,
        stationTable,
        trackerTable,
        // Farm Admin Dashboard Tables Now //
        farmAdminTable,
        farmTable,
        zonesTable,
    };

}

