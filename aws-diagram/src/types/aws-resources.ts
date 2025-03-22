export enum AwsResourceType {
  EC2 = "EC2",
  S3 = "S3",
  RDS = "RDS",
  LAMBDA = "LAMBDA",
  API_GATEWAY = "API_GATEWAY",
  DYNAMODB = "DYNAMODB",
  SNS = "SNS",
  SQS = "SQS",
  CLOUDFRONT = "CLOUDFRONT",
  ROUTE53 = "ROUTE53",
  VPC = "VPC",
  SUBNET = "SUBNET",
  SECURITY_GROUP = "SECURITY_GROUP",
  ELB = "ELB",
  CLOUDWATCH = "CLOUDWATCH",
}

export interface AwsResource {
  id: string;
  type: AwsResourceType;
  name: string;
  description?: string;
  properties?: Record<string, any>;
}

export interface AwsConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
  properties?: Record<string, any>;
}

export interface AwsDiagram {
  id: string;
  name: string;
  resources: AwsResource[];
  connections: AwsConnection[];
}
