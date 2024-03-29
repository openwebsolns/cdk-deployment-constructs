# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### CodePipelineHelper <a name="CodePipelineHelper" id="cdk-deployment-constructs.CodePipelineHelper"></a>

Companion construct for a (aws-codepipeline) `CodePipeline`.

Facilitates creation of a `DeploymentSafetyEnforcer` with methods like `putCalendarBlockers`.
The actual enforcer is constructed (by invoking the engine) when `buildEnforcer()` is called,
or when `app.synth()` is called (whichever comes first).

Example:

```ts
declare const pipeline: pipelines.CodePipeline;

const pipelineHelper = new CodePipelineHelper(this, 'Helper', {
   pipeline,
   enforcementFrequency: Duration.minutes(5), // default: 10
});

const stage = pipeline.addStage(...);
pipelineHelper.putCalendarBlockers({
   stage,
   changeCalendarNames: [
     "CalendarName",
     "arn:aws:ssm:$region:$account:document/CalendarArn", // for shared calendars
   ],
});
```

#### Initializers <a name="Initializers" id="cdk-deployment-constructs.CodePipelineHelper.Initializer"></a>

```typescript
import { CodePipelineHelper } from 'cdk-deployment-constructs'

new CodePipelineHelper(scope: Construct, id: string, props: CodePipelineHelperProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-deployment-constructs.CodePipelineHelperProps">CodePipelineHelperProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-deployment-constructs.CodePipelineHelper.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-deployment-constructs.CodePipelineHelper.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-deployment-constructs.CodePipelineHelper.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-deployment-constructs.CodePipelineHelperProps">CodePipelineHelperProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.blockStageOnChangeCalendars">blockStageOnChangeCalendars</a></code> | Adds or updates Change Calendar blockers for a given stage. |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.blockWaveOnChangeCalendars">blockWaveOnChangeCalendars</a></code> | Adds or updates Change Calendar blockers for a given stage. |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.buildEnforcer">buildEnforcer</a></code> | Performs one-time building of resources. May not be called multiple times. |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.newWaveBakeStep">newWaveBakeStep</a></code> | An approval step that waits a specified amount of time at the wave level. |

---

##### `toString` <a name="toString" id="cdk-deployment-constructs.CodePipelineHelper.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `blockStageOnChangeCalendars` <a name="blockStageOnChangeCalendars" id="cdk-deployment-constructs.CodePipelineHelper.blockStageOnChangeCalendars"></a>

```typescript
public blockStageOnChangeCalendars(stage: StageDeployment, changeCalendarNames: string[]): void
```

Adds or updates Change Calendar blockers for a given stage.

Deployments into the associated stage will be blocked if _any_ of these calendars
are `CLOSED`; and will be enabled iff _all_ are `OPEN`.

> [blockWaveOnChangeCalendars if using waves](blockWaveOnChangeCalendars if using waves)

###### `stage`<sup>Required</sup> <a name="stage" id="cdk-deployment-constructs.CodePipelineHelper.blockStageOnChangeCalendars.parameter.stage"></a>

- *Type:* aws-cdk-lib.pipelines.StageDeployment

the single deployment stage to block.

---

###### `changeCalendarNames`<sup>Required</sup> <a name="changeCalendarNames" id="cdk-deployment-constructs.CodePipelineHelper.blockStageOnChangeCalendars.parameter.changeCalendarNames"></a>

- *Type:* string[]

set of SSM ChangeCalendar name or ARNs to block on.

---

##### `blockWaveOnChangeCalendars` <a name="blockWaveOnChangeCalendars" id="cdk-deployment-constructs.CodePipelineHelper.blockWaveOnChangeCalendars"></a>

```typescript
public blockWaveOnChangeCalendars(wave: Wave, changeCalendarNames: string[]): void
```

Adds or updates Change Calendar blockers for a given stage.

Deployments into the associated stage will be blocked if _any_ of these calendars
are `CLOSED`; and will be enabled iff _all_ are `OPEN`.

> [blockStageOnChangeCalendars if using stages directly](blockStageOnChangeCalendars if using stages directly)

###### `wave`<sup>Required</sup> <a name="wave" id="cdk-deployment-constructs.CodePipelineHelper.blockWaveOnChangeCalendars.parameter.wave"></a>

- *Type:* aws-cdk-lib.pipelines.Wave

the pipeline wave to block.

---

###### `changeCalendarNames`<sup>Required</sup> <a name="changeCalendarNames" id="cdk-deployment-constructs.CodePipelineHelper.blockWaveOnChangeCalendars.parameter.changeCalendarNames"></a>

- *Type:* string[]

set of SSM ChangeCalendar name or ARNs to block on.

---

##### `buildEnforcer` <a name="buildEnforcer" id="cdk-deployment-constructs.CodePipelineHelper.buildEnforcer"></a>

```typescript
public buildEnforcer(): DeploymentSafetyEnforcer
```

Performs one-time building of resources. May not be called multiple times.

This method is automatically invoked on application synthesis.

##### `newWaveBakeStep` <a name="newWaveBakeStep" id="cdk-deployment-constructs.CodePipelineHelper.newWaveBakeStep"></a>

```typescript
public newWaveBakeStep(id: string, props: BakeStepProps): Step
```

An approval step that waits a specified amount of time at the wave level.

Creates a new `Step` with a unique `id` using given prefix.

###### `id`<sup>Required</sup> <a name="id" id="cdk-deployment-constructs.CodePipelineHelper.newWaveBakeStep.parameter.id"></a>

- *Type:* string

must be unique across all bake steps.

---

###### `props`<sup>Required</sup> <a name="props" id="cdk-deployment-constructs.CodePipelineHelper.newWaveBakeStep.parameter.props"></a>

- *Type:* <a href="#cdk-deployment-constructs.BakeStepProps">BakeStepProps</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-deployment-constructs.CodePipelineHelper.isConstruct"></a>

```typescript
import { CodePipelineHelper } from 'cdk-deployment-constructs'

CodePipelineHelper.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-deployment-constructs.CodePipelineHelper.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.property.pipeline">pipeline</a></code> | <code>aws-cdk-lib.pipelines.CodePipeline</code> | The associated pipeline. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-deployment-constructs.CodePipelineHelper.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `pipeline`<sup>Required</sup> <a name="pipeline" id="cdk-deployment-constructs.CodePipelineHelper.property.pipeline"></a>

```typescript
public readonly pipeline: CodePipeline;
```

- *Type:* aws-cdk-lib.pipelines.CodePipeline

The associated pipeline.

---


### DeploymentSafetyEnforcer <a name="DeploymentSafetyEnforcer" id="cdk-deployment-constructs.DeploymentSafetyEnforcer"></a>

Creates a Lambda function to monitor a `CodePipeline`.

#### Initializers <a name="Initializers" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.Initializer"></a>

```typescript
import { DeploymentSafetyEnforcer } from 'cdk-deployment-constructs'

new DeploymentSafetyEnforcer(scope: Construct, id: string, props: DeploymentSafetyEnforcerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcer.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcer.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcer.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcerProps">DeploymentSafetyEnforcerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-deployment-constructs.DeploymentSafetyEnforcerProps">DeploymentSafetyEnforcerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcer.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcer.metric">metric</a></code> | *No description.* |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcer.metricFailedStages">metricFailedStages</a></code> | *No description.* |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcer.metricMaxActionExecutionLatency">metricMaxActionExecutionLatency</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `metric` <a name="metric" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

###### `metricName`<sup>Required</sup> <a name="metricName" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricFailedStages` <a name="metricFailedStages" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.metricFailedStages"></a>

```typescript
public metricFailedStages(props?: MetricOptions): Metric
```

###### `props`<sup>Optional</sup> <a name="props" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.metricFailedStages.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricMaxActionExecutionLatency` <a name="metricMaxActionExecutionLatency" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.metricMaxActionExecutionLatency"></a>

```typescript
public metricMaxActionExecutionLatency(props?: MetricOptions): Metric
```

###### `props`<sup>Optional</sup> <a name="props" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.metricMaxActionExecutionLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcer.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.isConstruct"></a>

```typescript
import { DeploymentSafetyEnforcer } from 'cdk-deployment-constructs'

DeploymentSafetyEnforcer.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcer.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### BakeStepAlarmProps <a name="BakeStepAlarmProps" id="cdk-deployment-constructs.BakeStepAlarmProps"></a>

Alarm to inspect in bake step.

#### Initializer <a name="Initializer" id="cdk-deployment-constructs.BakeStepAlarmProps.Initializer"></a>

```typescript
import { BakeStepAlarmProps } from 'cdk-deployment-constructs'

const bakeStepAlarmProps: BakeStepAlarmProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.BakeStepAlarmProps.property.alarm">alarm</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IAlarm</code> | The name of the alarm to monitor. |
| <code><a href="#cdk-deployment-constructs.BakeStepAlarmProps.property.assumeRole">assumeRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Role to assume in order to describe the alarm history. |
| <code><a href="#cdk-deployment-constructs.BakeStepAlarmProps.property.treatMissingAlarm">treatMissingAlarm</a></code> | <code>string</code> | Specify approval behavior if the alarm cannot be described. |

---

##### `alarm`<sup>Required</sup> <a name="alarm" id="cdk-deployment-constructs.BakeStepAlarmProps.property.alarm"></a>

```typescript
public readonly alarm: IAlarm;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IAlarm

The name of the alarm to monitor.

---

##### `assumeRole`<sup>Optional</sup> <a name="assumeRole" id="cdk-deployment-constructs.BakeStepAlarmProps.property.assumeRole"></a>

```typescript
public readonly assumeRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

Role to assume in order to describe the alarm history.

For cross-account support, first create this role in the target account
and add trust policy that trusts the pipeline account to assume it.

---

##### `treatMissingAlarm`<sup>Optional</sup> <a name="treatMissingAlarm" id="cdk-deployment-constructs.BakeStepAlarmProps.property.treatMissingAlarm"></a>

```typescript
public readonly treatMissingAlarm: string;
```

- *Type:* string

Specify approval behavior if the alarm cannot be described.

Default: `REJECT`. Set to `IGNORE` if the alarm may not yet be created.
Note that failure to assume the role (if applicable) may also result in a
rejected approval.

---

### BakeStepProps <a name="BakeStepProps" id="cdk-deployment-constructs.BakeStepProps"></a>

Props for creating a stage/wave bake approval step.

#### Initializer <a name="Initializer" id="cdk-deployment-constructs.BakeStepProps.Initializer"></a>

```typescript
import { BakeStepProps } from 'cdk-deployment-constructs'

const bakeStepProps: BakeStepProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.BakeStepProps.property.bakeTime">bakeTime</a></code> | <code>aws-cdk-lib.Duration</code> | How long to wait before approving the step. |
| <code><a href="#cdk-deployment-constructs.BakeStepProps.property.rejectOnAlarms">rejectOnAlarms</a></code> | <code><a href="#cdk-deployment-constructs.BakeStepAlarmProps">BakeStepAlarmProps</a>[]</code> | Optionally watch the given alarm and reject if it fires. |

---

##### `bakeTime`<sup>Required</sup> <a name="bakeTime" id="cdk-deployment-constructs.BakeStepProps.property.bakeTime"></a>

```typescript
public readonly bakeTime: Duration;
```

- *Type:* aws-cdk-lib.Duration

How long to wait before approving the step.

---

##### `rejectOnAlarms`<sup>Optional</sup> <a name="rejectOnAlarms" id="cdk-deployment-constructs.BakeStepProps.property.rejectOnAlarms"></a>

```typescript
public readonly rejectOnAlarms: BakeStepAlarmProps[];
```

- *Type:* <a href="#cdk-deployment-constructs.BakeStepAlarmProps">BakeStepAlarmProps</a>[]

Optionally watch the given alarm and reject if it fires.

---

### CodePipelineHelperProps <a name="CodePipelineHelperProps" id="cdk-deployment-constructs.CodePipelineHelperProps"></a>

Properties for `CodePipelineHelper`.

#### Initializer <a name="Initializer" id="cdk-deployment-constructs.CodePipelineHelperProps.Initializer"></a>

```typescript
import { CodePipelineHelperProps } from 'cdk-deployment-constructs'

const codePipelineHelperProps: CodePipelineHelperProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelperProps.property.pipeline">pipeline</a></code> | <code>aws-cdk-lib.pipelines.CodePipeline</code> | The pipeline to monitor with this helper. |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelperProps.property.enforcementFrequency">enforcementFrequency</a></code> | <code>aws-cdk-lib.Duration</code> | How often to run the enforcer. |

---

##### `pipeline`<sup>Required</sup> <a name="pipeline" id="cdk-deployment-constructs.CodePipelineHelperProps.property.pipeline"></a>

```typescript
public readonly pipeline: CodePipeline;
```

- *Type:* aws-cdk-lib.pipelines.CodePipeline

The pipeline to monitor with this helper.

---

##### `enforcementFrequency`<sup>Optional</sup> <a name="enforcementFrequency" id="cdk-deployment-constructs.CodePipelineHelperProps.property.enforcementFrequency"></a>

```typescript
public readonly enforcementFrequency: Duration;
```

- *Type:* aws-cdk-lib.Duration

How often to run the enforcer.

Default: 10 minutes.

---

### DeploymentSafetyEnforcerProps <a name="DeploymentSafetyEnforcerProps" id="cdk-deployment-constructs.DeploymentSafetyEnforcerProps"></a>

Properties for `DeploymentSafetyEnforcer`.

#### Initializer <a name="Initializer" id="cdk-deployment-constructs.DeploymentSafetyEnforcerProps.Initializer"></a>

```typescript
import { DeploymentSafetyEnforcerProps } from 'cdk-deployment-constructs'

const deploymentSafetyEnforcerProps: DeploymentSafetyEnforcerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.pipeline">pipeline</a></code> | <code>aws-cdk-lib.aws_codepipeline.Pipeline</code> | The pipeline to enforce. |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.bakeSteps">bakeSteps</a></code> | <code>{[ key: string ]: <a href="#cdk-deployment-constructs.BakeStepProps">BakeStepProps</a>}</code> | Bake step configurations, indexed by manual approval action name. |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.changeCalendars">changeCalendars</a></code> | <code>{[ key: string ]: string[]}</code> | SSM Change Calendars to consult for promotions into a given stage. |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.enforcementFrequency">enforcementFrequency</a></code> | <code>aws-cdk-lib.Duration</code> | How often to run the enforcer. |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.metrics">metrics</a></code> | <code><a href="#cdk-deployment-constructs.MetricsProps">MetricsProps</a></code> | Configuration for emitting pipeline metrics. |

---

##### `pipeline`<sup>Required</sup> <a name="pipeline" id="cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.pipeline"></a>

```typescript
public readonly pipeline: Pipeline;
```

- *Type:* aws-cdk-lib.aws_codepipeline.Pipeline

The pipeline to enforce.

---

##### `bakeSteps`<sup>Optional</sup> <a name="bakeSteps" id="cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.bakeSteps"></a>

```typescript
public readonly bakeSteps: {[ key: string ]: BakeStepProps};
```

- *Type:* {[ key: string ]: <a href="#cdk-deployment-constructs.BakeStepProps">BakeStepProps</a>}

Bake step configurations, indexed by manual approval action name.

Bake steps are manual approval steps that are automatically approved
after a certain period of time, artificially slowing down a pipeline
execution in order to give time for data to arrive.

---

##### `changeCalendars`<sup>Optional</sup> <a name="changeCalendars" id="cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.changeCalendars"></a>

```typescript
public readonly changeCalendars: {[ key: string ]: string[]};
```

- *Type:* {[ key: string ]: string[]}

SSM Change Calendars to consult for promotions into a given stage.

---

##### `enforcementFrequency`<sup>Optional</sup> <a name="enforcementFrequency" id="cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.enforcementFrequency"></a>

```typescript
public readonly enforcementFrequency: Duration;
```

- *Type:* aws-cdk-lib.Duration

How often to run the enforcer.

Default: 10 minutes.

---

##### `metrics`<sup>Optional</sup> <a name="metrics" id="cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.metrics"></a>

```typescript
public readonly metrics: MetricsProps;
```

- *Type:* <a href="#cdk-deployment-constructs.MetricsProps">MetricsProps</a>

Configuration for emitting pipeline metrics.

---

### MetricsProps <a name="MetricsProps" id="cdk-deployment-constructs.MetricsProps"></a>

Props for emitting pipeline-related metrics.

#### Initializer <a name="Initializer" id="cdk-deployment-constructs.MetricsProps.Initializer"></a>

```typescript
import { MetricsProps } from 'cdk-deployment-constructs'

const metricsProps: MetricsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.MetricsProps.property.enabled">enabled</a></code> | <code>boolean</code> | Set to true to emit metrics on pipeline with every enforcer execution. |
| <code><a href="#cdk-deployment-constructs.MetricsProps.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | CloudWatch namespace to use for the metrics. |

---

##### `enabled`<sup>Required</sup> <a name="enabled" id="cdk-deployment-constructs.MetricsProps.property.enabled"></a>

```typescript
public readonly enabled: boolean;
```

- *Type:* boolean

Set to true to emit metrics on pipeline with every enforcer execution.

Default: true

---

##### `metricNamespace`<sup>Optional</sup> <a name="metricNamespace" id="cdk-deployment-constructs.MetricsProps.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

CloudWatch namespace to use for the metrics.

---



