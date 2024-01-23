// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CfnHostedZone, HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

import { Aspects } from "aws-cdk-lib";
import { ConditionAspect } from "../../utils/aspects";
import { DomainConditions } from "../common-resources/common-resources-construct";

interface HostedZoneResourcesProps {
  readonly domain: string;
  readonly conditions: DomainConditions;
}

/**
 * Construct that creates the certificate for the solution
 */
export class HostedZoneResources extends Construct {
  public readonly hostedZone: HostedZone;

  constructor(scope: Construct, id: string, props: HostedZoneResourcesProps) {
    super(scope, id);

    this.hostedZone = new HostedZone(this, "HostedZone", {
      zoneName: props.domain,
      comment: "Serverless Image Handler custom domain zone",
    });
    (this.hostedZone.node.defaultChild as CfnHostedZone).cfnOptions.condition = props.conditions.customDomainCondition;

    Aspects.of(this).add(new ConditionAspect(props.conditions.customDomainCondition));
  }
}
