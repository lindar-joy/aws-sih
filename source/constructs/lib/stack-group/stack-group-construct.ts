// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Construct } from "constructs";
import { DomainConditions } from "../common-resources/common-resources-construct";
import { CfnParameter } from "aws-cdk-lib";
import { HostedZoneStack } from "../hosted-zone-stack";
import { CertificateStack } from "../certificate-stack";
import { ServerlessImageHandlerStack } from "../serverless-image-stack";
import { CommonStackProps } from "../types";

interface StackGroupProps {
  readonly domain: string;
  readonly conditions: DomainConditions;
}

/**
 * Construct that creates the certificate for the solution
 */
export class StackGroup extends Construct {
  constructor(scope: Construct, id: string, { solutionId, solutionVersion, solutionName}: CommonStackProps) {
    super(scope, id);

    const customDomains = this.node.tryGetContext('domains')?.split(',');

    if (customDomains) {

    }

    const hostedZoneStack = new HostedZoneStack(this, `${This has to be context, Parameter is not available at synthesis}`, {
      env: {
        region: process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION,
      },
      crossRegionReferences: true,
      solutionId,
      solutionVersion,
      solutionName,
    });

    const certificateStack = new CertificateStack(this, "CertificateStack", {
      env: {
        region: "us-east-1",
      },
      hostedZone: hostedZoneStack.hostedZone,
      crossRegionReferences: true,
      solutionId: app.node.tryGetContext("solutionId"),
      solutionVersion: app.node.tryGetContext("solutionVersion"),
      solutionName: app.node.tryGetContext("solutionName"),
    });

    // eslint-disable-next-line no-new
    new ServerlessImageHandlerStack(app, "ServerlessImageHandlerStack", {
      env: {
        region: process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION,
      },
      synthesizer,
      description,
      solutionId: app.node.tryGetContext("solutionId"),
      solutionVersion: app.node.tryGetContext("solutionVersion"),
      solutionName: app.node.tryGetContext("solutionName"),
      certificate: certificateStack.certificate,
      hostedZone: hostedZoneStack.hostedZone,
      crossRegionReferences: true,
    });
  }
}
