// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib";

import { ServerlessImageHandlerStack } from "../lib/serverless-image-stack";
import {HostedZoneStack} from "../lib/hosted-zone-stack";
import {CertificateStack} from "../lib/certificate-stack";

test("Serverless Image Handler Stack Snapshot", () => {
  const app = new App();

  const hostedZoneStack = new HostedZoneStack(app, "HostedZoneTestStack", {
    env: {
      region: 'eu-west-2',
    },
    crossRegionReferences: true,
    solutionId: "S0ABC",
    solutionName: "sih",
    solutionVersion: "v6.2.2",
  });

  const certificateStack = new CertificateStack(app, "CertificateTestStack", {
    env: {
      region: "us-east-1",
    },
    hostedZone: hostedZoneStack.hostedZone,
    crossRegionReferences: true,
    solutionId: "S0ABC",
    solutionName: "sih",
    solutionVersion: "v6.2.2",
  });

  const stack = new ServerlessImageHandlerStack(app, "TestStack", {
    env: {
      region: 'eu-west-2',
    },
    certificate: certificateStack.certificate,
    hostedZone: hostedZoneStack.hostedZone,
    crossRegionReferences: true,
    solutionId: "S0ABC",
    solutionName: "sih",
    solutionVersion: "v6.2.5",
  });

  const template = Template.fromStack(stack);

  const templateJson = template.toJSON();

  /**
   * iterate templateJson and for any attribute called S3Key, replace the value for that attribute with "Omitted to remove snapshot dependency on hash",
   * this is so that the snapshot can be saved and will not change because the hash has been regenerated
   */
  Object.keys(templateJson.Resources).forEach((key) => {
    if (templateJson.Resources[key].Properties?.Code?.S3Key) {
      templateJson.Resources[key].Properties.Code.S3Key = "Omitted to remove snapshot dependency on hash";
    }
    if (templateJson.Resources[key].Properties?.Content?.S3Key) {
      templateJson.Resources[key].Properties.Content.S3Key = "Omitted to remove snapshot dependency on hash";
    }
  });

  expect.assertions(1);
  expect(templateJson).toMatchSnapshot();
});
