import { Fn } from "aws-cdk-lib";
import {
  AllowedMethods,
  OriginProtocolPolicy,
  OriginSslPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";

import { StaticSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";

export function MobileStack({ stack }: StackContext) {

  const { api, apiCachePolicy } = use(ApiStack);

  // Deploy our React app
  const site = new StaticSite(stack, "ReactApp", {
    path: "packages/Application/SAQI",
    buildCommand: "npx expo start",
    buildOutput: "build",
    environment: {
      EXPO_PUBLIC_PROD_API_URL_2: api.url,
    },
    cdk: {
      distribution: {
        additionalBehaviors: {
          "/api/*": {
            origin: new HttpOrigin(Fn.parseDomainName(api.url), {
              originSslProtocols: [OriginSslPolicy.TLS_V1_2],
              protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
            }),
            viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
            cachePolicy: {
              cachePolicyId: apiCachePolicy.cachePolicyId,
            },
            allowedMethods: AllowedMethods.ALLOW_ALL,
            cachedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          },
        },
      },
    }
  });

  // Show the URLs in the output
  stack.addOutputs({
    SiteUrl: site.url,
    ApiEndpoint: api.url,
  });
}