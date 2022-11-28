import * as cdk from 'aws-cdk-lib';
import { Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { DeploymentSafetyEnforcer } from './index';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'MyStack');

const pipeline = new Pipeline(stack, 'Pipeline');

new DeploymentSafetyEnforcer(stack, 'DeploymentSafetyEnforcer', {
  pipeline,
});
