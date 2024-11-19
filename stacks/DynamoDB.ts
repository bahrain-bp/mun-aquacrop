// stacks/DynamoDBStack.ts
import { StackContext, Table } from "sst/constructs";

export function DynamoDBStack({ stack }: StackContext) {
    // Define each table based on your ERD

    
    const cropTable = new Table(stack, "Crop", {
        fields: {
            CropID: "string",
            Name: "string",
            ImageURL : "string"
        },
        primaryIndex: { partitionKey: "CropID" },
    });

    const cropCoefficientTable = new Table(stack, "CropCoefficeint", {
        fields: {
            CCID: "string",
            CropID: "string",
            Kc: "number",
        },
        primaryIndex: { partitionKey: "CCID"},
        globalIndexes: {
            CropIDIndex: { partitionKey: "CropID" },
        },
    });




    stack.addOutputs({
        
        CropTableName: cropTable.tableName,
        CropCoefficientTableName: cropCoefficientTable.tableName,
    });

    return {

        cropTable,
        cropCoefficientTable,
    };

}