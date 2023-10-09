**Fork of [Serverless Image Handler](https://aws.amazon.com/solutions/implementations/serverless-image-handler/)**

## Table of Contents

* [Changes in this fork](#changes-in-this-fork)
  * [Deploying or Customizing the Solution](#deploying-or-customizing-the-solution)
    * [Prerequisites](#prerequisites)
    * [1. Clone the repository](#1-clone-the-repository)
    * [2. Unit Test](#2-unit-test)
    * [3. Build and Deploy](#3-build-and-deploy)
      * [Default generated cloudfront domain](#default-generated-cloudfront-domain)
      * [Custom domains](#custom-domains)
      * [Automated deployments](#automated-deployments)
  * [Usage](#usage)
    * [Basic example](#basic-example)
      * [Other examples](#other-examples)
    * [Query parameters](#query-parameters)
    * [Thumbor and Rewrites](#thumbor-and-rewrites)
  * [License](#license)

# Changes in this fork

- **New URL scheme**. Edit with Sharp using search (query) parameters for better SEO. See [Usage](#usage)
- **Custom domain**. A certificate and hosted zone is automatically generated for your domain
- Disabled data collection
- Upgraded dependencies
- Scripts are only run from local dependencies (uses `npm run` instead of `npx`) for greater reliability


## Deploying or Customizing the Solution

### Prerequisites

- [AWS Command Line Interface](https://aws.amazon.com/cli/)
- Node.js 18.x or later

### 1. Clone the repository

```bash
git clone https://github.com/lindar-joy/aws-sih.git
cd aws-sih
export MAIN_DIRECTORY=$PWD
```

### 2. Unit Test

After making changes, run unit tests to make sure added customization passes the tests:

```bash
cd $MAIN_DIRECTORY/deployment
chmod +x run-unit-tests.sh && ./run-unit-tests.sh
```

### 3. Build and Deploy

#### Default generated cloudfront domain
```bash
cd $MAIN_DIRECTORY/source/constructs
npm run clean:install
overrideWarningsEnabled=false npm run cdk -- bootstrap --profile <PROFILE_NAME>
overrideWarningsEnabled=false npm run cdk -- deploy\
 --parameters DeployDemoUIParameter=Yes\
  --parameters SourceBucketsParameter=<MY_BUCKET>\
   --profile <PROFILE_NAME>
```

#### Custom domains
```bash
cd $MAIN_DIRECTORY/source/constructs
npm run clean:install
overrideWarningsEnabled=false npm run cdk -- bootstrap --profile <PROFILE_NAME>
overrideWarningsEnabled=false npm run cdk -- deploy\
 --parameters DeployDemoUIParameter=Yes\
  --parameters SourceBucketsParameter=<MY_BUCKET>\
   --parameters CustomDomainParameter=<MY_DOMAIN>\
    --profile <PROFILE_NAME>
```

The first deployment with a custom domain requires verifying ownership, if not already verified. Until verified, the **deployment will seem stuck** at the `Certificate create_in_progress` step. Please see https://docs.aws.amazon.com/acm/latest/userguide/domain-ownership-validation.html for instructions. The solution will have created a Hosted zone for you custom domain, which you can view in the AWS Route 53 dashboard.

_Note:_
- **MY_BUCKET**: name of an existing bucket in your account
- **PROFILE_NAME**: name of an AWS CLI profile that has appropriate credentials for deploying in your preferred region
- **MY_DOMAIN**: full domain to use as a Cloudfront alias, eg `--parameters CustomDomain=x.example.com`

#### Automated deployments
For automated deployments with GitHub actions, see `.github/workflows/pipeline-workflow.yml`.

1. Bootstrap locally if not already done
2. Change `if: github.repository_owner == 'GeKorm'` to your user or organization name
3. Add the following variables and secrets:
   - Secret **DISPATCHER_ROLE_ARN** 
   - Secret **SOURCE_BUCKETS** (for `SourceBucketsParameter`)
   - Variable **DEMO_UI** (for `DeployDemoUIParameter`)
   - _[Optional]_ Secret **CUSTOM_DOMAIN** (for `CustomDomainParameter`)

## Usage

The new URL scheme is `https://<domain>/<s3-url-or-path-to-image>?edits=<edits>`. The bucket and key are part of the URL unencoded. All other parameters like moved to the query string portion of the URL.

### Basic example

```typescript
// How to use edits https://docs.aws.amazon.com/solutions/latest/serverless-image-handler/create-and-use-image-requests.html#dynamically-resize-photos
const edits = {};

// Stringify and encode URI
// For s3 bucket "bucket" and image key "/folder/image.jpg":
const url = `https://example.cloudfront.net/bucket/folder/image.jpg?edits=${encodeURIComponent(JSON.stringify(edits))}`
```

#### Other examples
The image's full S3 URL can be used. This is a non-exhaustive list of accepted formats

- https://example.cloudfront.net/bucket/folder/image.jpg?edits=
- https://example.cloudfront.net/s3.us-east-1.amazonaws.com/bucket/test.jpg?edits=
- https://example.cloudfront.net/https://s3.amazonaws.com/bucket/test?edits= (extension is optional)
- https://example.cloudfront.net/s3.amazonaws.com/bucket/test.jpg?edits=
- https://example.cloudfront.net/https://s3-us-east-1.amazonaws.com/source-bucket/test.jpg?edits=

Please open an issue if your preferred S3 URL format isn't supported.

### Query parameters

| Key            | Value                                         |
|----------------|-----------------------------------------------|
| `signature`    | `string`                                      |
| `effort`       | `string`                                      |
| `outputFormat` | `string`                                      |
| `edits`        | `encodeURIComponent(JSON.stringify(edits))`   |
| `headers`      | `encodeURIComponent(JSON.stringify(headers))` |

As an alternative to `encodeURIComponent` you can use `URL` or `URLSearchParams`

```typescript
const url = new URL("https://cdn.example.com/bucket/image.jpg")
url.searchParams.set('outputFormat', 'webp');
url.searchParams.set('edits', JSON.stringify(edits));

console.log(url.toString()) 
// https://cdn.example.com/bucket/image.jpg?outputFormat=webp&edits=%7B%22

// or equivalent
const params = new URLSearchParams();
params.set('outputFormat', 'webp');
params.set('edits', JSON.stringify(edits));

console.log('https://cdn.example.com/bucket/image.jpg?' + params.toString()) 
// https://cdn.example.com/bucket/image.jpg?outputFormat=webp&edits=%7B%22
```

### Thumbor and Rewrites
Thumbor and the Rewrite feature may work, but are not supported. Please use the [original solution](https://github.com/aws-solutions/serverless-image-handler) if required.

## License

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.   
SPDX-License-Identifier: Apache-2.0
