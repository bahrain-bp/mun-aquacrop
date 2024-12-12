import { StackContext } from "sst/constructs";
import * as iot from "aws-cdk-lib/aws-iot";

export function IoTStack({ stack }: StackContext) {
  // Create an IoT Thing
  const iotThing = new iot.CfnThing(stack, "WaterPumpThing", {
    thingName: "WaterPumpController",
  });

  // Define the IoT Policy
  const iotPolicy = new iot.CfnPolicy(stack, "IoTPolicy", {
    policyName: "PumpControlPolicy",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["iot:Publish", "iot:Subscribe", "iot:Connect", "iot:Receive"],
          Resource: [
            `arn:aws:iot:${stack.region}:${stack.account}:topic/pump/control`,
            `arn:aws:iot:${stack.region}:${stack.account}:client/*`,
          ],
        },
      ],
    },
  });

  // Export only the Thing and Policy (Certificate will be manually created)
  stack.addOutputs({
    IoTTopic: "pump/control",
    IoTThingName: iotThing.thingName!,
    IoTPolicyName: iotPolicy.policyName!,
  });
}
