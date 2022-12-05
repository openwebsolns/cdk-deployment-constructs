const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Dayan Paez',
  authorAddress: 'dayan@openweb-solutions.net',
  description: 'CDK constructs for safe code deployment',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-deployment-constructs',
  repositoryUrl: 'https://github.com/openwebsolns/cdk-deployment-constructs.git',
  license: 'MIT',
  keywords: ['awscdk'],
  deps: [
    'aws-cdk-lib',
  ],
  devDeps: [
    'aws-cdk-lib',
    'esbuild',
    '@types/aws-lambda',
  ],
  bundledDeps: [
    'aws-sdk',
    'aws-lambda',
  ],
  stability: 'experimental',

  packageName: 'cdk-deployment-constructs',
});
project.synth();
