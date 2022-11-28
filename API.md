# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### CodePipelineHelper <a name="CodePipelineHelper" id="cdk-deployment-constructs.CodePipelineHelper"></a>

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
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.buildEnforcer">buildEnforcer</a></code> | *No description.* |
| <code><a href="#cdk-deployment-constructs.CodePipelineHelper.putCalendarBlockers">putCalendarBlockers</a></code> | Adds or updates Change Calendar blockers for a given stage. |

---

##### `toString` <a name="toString" id="cdk-deployment-constructs.CodePipelineHelper.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `buildEnforcer` <a name="buildEnforcer" id="cdk-deployment-constructs.CodePipelineHelper.buildEnforcer"></a>

```typescript
public buildEnforcer(): void
```

##### `putCalendarBlockers` <a name="putCalendarBlockers" id="cdk-deployment-constructs.CodePipelineHelper.putCalendarBlockers"></a>

```typescript
public putCalendarBlockers(props: AddCalendarBlockersProps): CodePipelineHelper
```

Adds or updates Change Calendar blockers for a given stage.

Returns self for chaining.

###### `props`<sup>Required</sup> <a name="props" id="cdk-deployment-constructs.CodePipelineHelper.putCalendarBlockers.parameter.props"></a>

- *Type:* <a href="#cdk-deployment-constructs.AddCalendarBlockersProps">AddCalendarBlockersProps</a>

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

---

##### `toString` <a name="toString" id="cdk-deployment-constructs.DeploymentSafetyEnforcer.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

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

### AddCalendarBlockersProps <a name="AddCalendarBlockersProps" id="cdk-deployment-constructs.AddCalendarBlockersProps"></a>

#### Initializer <a name="Initializer" id="cdk-deployment-constructs.AddCalendarBlockersProps.Initializer"></a>

```typescript
import { AddCalendarBlockersProps } from 'cdk-deployment-constructs'

const addCalendarBlockersProps: AddCalendarBlockersProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.AddCalendarBlockersProps.property.changeCalendarNames">changeCalendarNames</a></code> | <code>string[]</code> | List of SSM Change Calendar names or ARNs (for shared calendars) to consult. |
| <code><a href="#cdk-deployment-constructs.AddCalendarBlockersProps.property.stage">stage</a></code> | <code>aws-cdk-lib.pipelines.StageDeployment</code> | Stage to deploy. |

---

##### `changeCalendarNames`<sup>Required</sup> <a name="changeCalendarNames" id="cdk-deployment-constructs.AddCalendarBlockersProps.property.changeCalendarNames"></a>

```typescript
public readonly changeCalendarNames: string[];
```

- *Type:* string[]

List of SSM Change Calendar names or ARNs (for shared calendars) to consult.

Deployments into the associated stage will be blocked if _any_ of these calendars
are `CLOSED`; and will be enabled iff _all_ are `OPEN`.

---

##### `stage`<sup>Required</sup> <a name="stage" id="cdk-deployment-constructs.AddCalendarBlockersProps.property.stage"></a>

```typescript
public readonly stage: StageDeployment;
```

- *Type:* aws-cdk-lib.pipelines.StageDeployment

Stage to deploy.

---

### CodePipelineHelperProps <a name="CodePipelineHelperProps" id="cdk-deployment-constructs.CodePipelineHelperProps"></a>

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

#### Initializer <a name="Initializer" id="cdk-deployment-constructs.DeploymentSafetyEnforcerProps.Initializer"></a>

```typescript
import { DeploymentSafetyEnforcerProps } from 'cdk-deployment-constructs'

const deploymentSafetyEnforcerProps: DeploymentSafetyEnforcerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.pipeline">pipeline</a></code> | <code>aws-cdk-lib.aws_codepipeline.Pipeline</code> | The pipeline to enforce. |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.changeCalendars">changeCalendars</a></code> | <code>{[ key: string ]: string[]}</code> | SSM Change Calendars to consult for promotions into a given stage. |
| <code><a href="#cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.enforcementFrequency">enforcementFrequency</a></code> | <code>aws-cdk-lib.Duration</code> | How often to run the enforcer. |

---

##### `pipeline`<sup>Required</sup> <a name="pipeline" id="cdk-deployment-constructs.DeploymentSafetyEnforcerProps.property.pipeline"></a>

```typescript
public readonly pipeline: Pipeline;
```

- *Type:* aws-cdk-lib.aws_codepipeline.Pipeline

The pipeline to enforce.

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



