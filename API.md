# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### CodePipelineBakeTimeProcessor <a name="CodePipelineBakeTimeProcessor" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessor"></a>

#### Initializers <a name="Initializers" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessor.Initializer"></a>

```typescript
import { CodePipelineBakeTimeProcessor } from 'cdk-deployment-constructs'

new CodePipelineBakeTimeProcessor(scope: Construct, id: string, props?: CodePipelineBakeTimeProcessorProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.CodePipelineBakeTimeProcessor.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-deployment-constructs.CodePipelineBakeTimeProcessor.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-deployment-constructs.CodePipelineBakeTimeProcessor.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-deployment-constructs.CodePipelineBakeTimeProcessorProps">CodePipelineBakeTimeProcessorProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessor.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessor.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessor.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-deployment-constructs.CodePipelineBakeTimeProcessorProps">CodePipelineBakeTimeProcessorProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-deployment-constructs.CodePipelineBakeTimeProcessor.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessor.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-deployment-constructs.CodePipelineBakeTimeProcessor.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessor.isConstruct"></a>

```typescript
import { CodePipelineBakeTimeProcessor } from 'cdk-deployment-constructs'

CodePipelineBakeTimeProcessor.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessor.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.CodePipelineBakeTimeProcessor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessor.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### CodePipelineBakeTimeProcessorProps <a name="CodePipelineBakeTimeProcessorProps" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessorProps"></a>

#### Initializer <a name="Initializer" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessorProps.Initializer"></a>

```typescript
import { CodePipelineBakeTimeProcessorProps } from 'cdk-deployment-constructs'

const codePipelineBakeTimeProcessorProps: CodePipelineBakeTimeProcessorProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployment-constructs.CodePipelineBakeTimeProcessorProps.property.alarm">alarm</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IAlarm</code> | *No description.* |
| <code><a href="#cdk-deployment-constructs.CodePipelineBakeTimeProcessorProps.property.rate">rate</a></code> | <code>aws-cdk-lib.Duration</code> | *No description.* |

---

##### `alarm`<sup>Optional</sup> <a name="alarm" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessorProps.property.alarm"></a>

```typescript
public readonly alarm: IAlarm;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IAlarm

---

##### `rate`<sup>Optional</sup> <a name="rate" id="cdk-deployment-constructs.CodePipelineBakeTimeProcessorProps.property.rate"></a>

```typescript
public readonly rate: Duration;
```

- *Type:* aws-cdk-lib.Duration

---



