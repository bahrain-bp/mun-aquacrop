import { StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";

export function MobileStack({ stack }: StackContext) {
    const { api } = use(ApiStack);

    stack.addOutputs({
        ApiEndpoint: api.url,
    });
}
