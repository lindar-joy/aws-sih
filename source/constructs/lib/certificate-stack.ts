// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Aspects, CfnParameter, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { DomainResources } from "./common-resources/common-resources-construct";
import { CommonStackProps } from "./types";
import { CertificateResources } from "./certificate/certificate-construct";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ConditionAspect } from "../utils/aspects";

export class CertificateStack extends Stack {
  public certificate: Certificate;

  constructor(scope: Construct, id: string, props: CommonStackProps & { hostedZone: HostedZone }) {
    super(scope, id, props);

    const customDomainParameter = new CfnParameter(this, "CustomDomainParameter", {
      type: "String",
      description:
        "Alternative domain name for this distribution. For more information, see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront.Distribution.html#domainnames",
      default: "",
    });

    const certificateConstructProps = {
      customDomain: customDomainParameter.valueAsString,
    };

    const commonResources = new DomainResources(this, "CommonResources", {
      solutionId: props.solutionId,
      solutionVersion: props.solutionVersion,
      solutionName: props.solutionName,
      ...certificateConstructProps,
    });

    // eslint-disable-next-line no-new
    this.certificate = new CertificateResources(this, "Certificate", {
      domain: certificateConstructProps.customDomain,
      conditions: commonResources.conditions,
      hostedZone: props.hostedZone,
    }).customCertificate;

    Aspects.of(this).add(new ConditionAspect(commonResources.conditions.customDomainCondition));
  }
}
