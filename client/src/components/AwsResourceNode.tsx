import React from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { AwsResource, AwsResourceType } from "../types/aws-resources";

import APIGatewayIcon from "react-aws-icons/dist/aws/logo/APIGateway";
import CloudFrontIcon from "react-aws-icons/dist/aws/logo/CloudFront";
import CloudWatchIcon from "react-aws-icons/dist/aws/logo/CloudWatch";
import DynamoDBIcon from "react-aws-icons/dist/aws/logo/DynamoDB";
import EC2Icon from "react-aws-icons/dist/aws/logo/EC2";
import ELBIcon from "react-aws-icons/dist/aws/logo/ELB";
import LambdaIcon from "react-aws-icons/dist/aws/logo/Lambda";
import RDSIcon from "react-aws-icons/dist/aws/logo/RDS";
import Route53Icon from "react-aws-icons/dist/aws/logo/Route53";
import S3Icon from "react-aws-icons/dist/aws/logo/S3";
import SNSIcon from "react-aws-icons/dist/aws/logo/SNS";
import SQSIcon from "react-aws-icons/dist/aws/logo/SQS";
import VPCIcon from "react-aws-icons/dist/aws/logo/VPC";
import UnknownIcon from "../assets/logo192.png";

const resourceColorMap: Record<
  AwsResourceType,
  { bg: string; border: string }
> = {
  [AwsResourceType.EC2]: { bg: "#FF9900", border: "#FF8000" },
  [AwsResourceType.S3]: { bg: "#E63F00", border: "#D13800" },
  [AwsResourceType.RDS]: { bg: "#3B48CC", border: "#2D3A9E" },
  [AwsResourceType.LAMBDA]: { bg: "#FF9900", border: "#FF8000" },
  [AwsResourceType.API_GATEWAY]: { bg: "#A166FF", border: "#8F44FF" },
  [AwsResourceType.DYNAMODB]: { bg: "#3B48CC", border: "#2D3A9E" },
  [AwsResourceType.SNS]: { bg: "#FF4F8B", border: "#FF1F6E" },
  [AwsResourceType.SQS]: { bg: "#FF9900", border: "#FF8000" },
  [AwsResourceType.CLOUDFRONT]: { bg: "#A166FF", border: "#8F44FF" },
  [AwsResourceType.ROUTE53]: { bg: "#A166FF", border: "#8F44FF" },
  [AwsResourceType.VPC]: { bg: "#248814", border: "#1A6B0D" },
  [AwsResourceType.SUBNET]: { bg: "#248814", border: "#1A6B0D" },
  [AwsResourceType.SECURITY_GROUP]: { bg: "#248814", border: "#1A6B0D" },
  [AwsResourceType.ELB]: { bg: "#FF9900", border: "#FF8000" },
  [AwsResourceType.CLOUDWATCH]: { bg: "#A166FF", border: "#8F44FF" },
  [AwsResourceType.UNKNOWN]: { bg: "#CCCCCC", border: "#AAAAAA" },
};

// AWS 리소스 아이콘 컴포넌트
const AwsIcon: React.FC<{ type: AwsResourceType; size?: number }> = ({
  type,
  size = 30,
}) => {
  // 각 리소스 타입별 아이콘 선택 로직
  const renderAwsIcon = () => {
    switch (type) {
      case AwsResourceType.EC2:
        return <EC2Icon size={size} />;
      case AwsResourceType.S3:
        return <S3Icon size={size} />;
      case AwsResourceType.RDS:
        return <RDSIcon size={size} />;
      case AwsResourceType.LAMBDA:
        return <LambdaIcon size={size} />;
      case AwsResourceType.API_GATEWAY:
        return <APIGatewayIcon size={size} />;
      case AwsResourceType.DYNAMODB:
        return <DynamoDBIcon size={size} />;
      case AwsResourceType.SNS:
        return <SNSIcon size={size} />;
      case AwsResourceType.SQS:
        return <SQSIcon size={size} />;
      case AwsResourceType.CLOUDFRONT:
        return <CloudFrontIcon size={size} />;
      case AwsResourceType.ROUTE53:
        return <Route53Icon size={size} />;
      case AwsResourceType.VPC:
        return <VPCIcon size={size} />;
      case AwsResourceType.ELB:
        return <ELBIcon size={size} />;
      case AwsResourceType.CLOUDWATCH:
        return <CloudWatchIcon size={size} />;
      case AwsResourceType.UNKNOWN:
        return (
          <img src={UnknownIcon} alt="Unknown" width={size} height={size} />
        );
      default:
        return <div>{type.charAt(0)}</div>;
    }
  };

  const colors = resourceColorMap[type] || { bg: "#CCCCCC", border: "#AAAAAA" };

  return (
    <div
      className="aws-icon"
      style={{
        backgroundColor: "white",
        borderColor: colors.border,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {renderAwsIcon()}
    </div>
  );
};

// AWS 리소스 노드 컴포넌트
const AwsResourceNode: React.FC<NodeProps<AwsResource>> = ({ data }) => {
  const colors = resourceColorMap[data.type] || {
    bg: "#CCCCCC",
    border: "#AAAAAA",
  };

  return (
    <div
      className="aws-resource-node"
      style={{
        borderColor: colors.border,
        borderWidth: "2px",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: colors.bg }}
      />
      <div className="resource-content">
        <AwsIcon type={data.type} />
        <div className="resource-info">
          <div className="resource-name">{data.name}</div>
          <div className="resource-type">{data.type}</div>
          {data.description && (
            <div className="resource-description">{data.description}</div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: colors.bg }}
      />
    </div>
  );
};

export default AwsResourceNode;
