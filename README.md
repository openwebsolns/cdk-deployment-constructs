# CDK Deployment Constructs

[![NPM version](https://badge.fury.io/js/cdk-deployment-constructs.svg)](https://badge.fury.io/js/cdk-deployment-constructs)

CDK constructs for safe deployment of code via AWS CodeSuite.

* Disable/enable CodePipeline transitions based on one or more SSM Change Calendars
* Bake steps with support for alarms

## Installation

<details><summary><strong>TypeScript</strong></summary>

> https://www.npmjs.com/package/cdk-deployment-constructs

In your `package.json`:

```json
{
  "dependencies": {
    "cdk-deployment-constructs": "^0.0.0",

    // peer dependencies of cdk-deployment-constructs
    "aws-cdk-lib": "^2.18.0",
    "constructs": "^10.0.5"

    // ...your other dependencies...
  }
}
```
</details>

## Features

You can browse the documentation at https://constructs.dev/packages/cdk-deployment-constructs/.

### Bake steps

A bake step is an approval step, usually added post deployments, which intentionally slows down the
pipeline a fixed amount of time. This "bake time" can help surface issues that only arise some time
after deployment, either due to sporadic usage or uptime-related causes (e.g. memory leaks). One or
more CloudWatch alarms can be optionally associated with the bake step, in which case the enforcer
will reject the approval if any of them goes into alarm during the bake time.

```typescript
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as dc from 'cdk-deployment-constructs';

declare const pipeline: pipelines.CodePipeline;
declare const helper: dc.CodePipelineHelper;

const wave = pipeline.addWave("Wave1");
wave.addPost(
  helper.newBakeStep("Bake-Wave1", {
    bakeTime: Duration.hours(2),
  })
);
```

## Contributing/Security

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.


## License

This project is licensed under the MIT License.
