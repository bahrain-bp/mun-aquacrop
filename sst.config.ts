import {SSTConfig} from "sst";
import {DynamoDBStack} from "./stacks/DynamoDBStack";
import {FrontendStack} from "./stacks/FrontendStack";
import {DBStack} from "./stacks/DBStack";
import {S3Stack} from "./stacks/StorageStack";
import {ApiStack} from "./stacks/ApiStack";
import {ImageBuilderForCodeCatalyst} from "./stacks/devops/ImageBuilderForCodeCatalyst";
import {OIDCForGitHubCI} from "./stacks/devops/OIDCForGitHubCI";
import {AuthStack} from "./stacks/AuthStack";
import {MobileStack} from "./stacks/MobileStack";

export default {
    config(_input) {
        return {
            name: "mun-aquacrop",
            region: "us-east-1",
        };
    },
    stacks(app) {
        // Remove all resources when non-prod stages are removed


        if (app.stage !== "prod") {
            app.setDefaultRemovalPolicy("destroy");
        }

        if (app.stage == 'devops-coca') {
            app.stack(ImageBuilderForCodeCatalyst)
        } else if (app.stage == 'devops-gh') {
            app.stack(OIDCForGitHubCI)
        } else {
            app.stack(DBStack)
                .stack(DynamoDBStack)
                .stack(AuthStack)
                .stack(ApiStack)
                .stack(S3Stack)
                .stack(FrontendStack)
                .stack(MobileStack);
        }
    }
} satisfies SSTConfig;
