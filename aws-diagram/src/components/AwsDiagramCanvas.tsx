import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  NodeTypes,
  Panel,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  AwsConnection,
  AwsDiagram,
  AwsResource,
  AwsResourceType,
} from "../types/aws-resources";
import AwsResourceNode from "./AwsResourceNode";

// 노드 타입 매핑
const nodeTypes: NodeTypes = {
  awsResource: AwsResourceNode,
};

// 엣지 스타일
const edgeOptions = {
  animated: true,
  style: { strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
};

// 초기 노드 위치 계산을 위한 그리드 레이아웃 함수
const calculateGridLayout = (
  nodes: Node[],
  cols = 3,
  nodeWidth = 200,
  nodeHeight = 150
) => {
  const spacing = { x: 50, y: 80 };

  return nodes.map((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    return {
      ...node,
      position: {
        x: col * (nodeWidth + spacing.x),
        y: row * (nodeHeight + spacing.y),
      },
    };
  });
};

interface AwsDiagramCanvasProps {
  initialResources?: AwsResource[];
  initialConnections?: AwsConnection[];
  onDiagramChange?: (
    resources: AwsResource[],
    connections: AwsConnection[]
  ) => void;
  onSaveDiagram?: () => Promise<void>;
}

interface EditModalProps {
  title: string;
  fields: { label: string; name: string; value: string }[];
  onSave: (values: Record<string, string>) => void;
  onCancel: () => void;
}

// 편집 모달 컴포넌트
const EditModal: React.FC<EditModalProps> = ({
  title,
  fields,
  onSave,
  onCancel,
}) => {
  const [values, setValues] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {})
  );

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(values);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              <input
                type="text"
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            </div>
          ))}
          <div className="modal-actions">
            <button type="button" onClick={onCancel}>
              취소
            </button>
            <button type="submit">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AwsDiagramCanvas: React.FC<AwsDiagramCanvasProps> = ({
  initialResources = [],
  initialConnections = [],
  onDiagramChange,
  onSaveDiagram,
}) => {
  // React Flow 인스턴스 참조
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // 리소스 노드를 React Flow 노드로 변환
  const resourcestoNodes = (resources: AwsResource[]): Node[] => {
    const nodes = resources.map((resource) => ({
      id: resource.id,
      type: "awsResource",
      data: resource,
      position: { x: 0, y: 0 }, // 초기 위치는 계산 함수에서 설정됨
    }));

    return calculateGridLayout(nodes);
  };

  // 연결을 React Flow 엣지로 변환
  const connectionsToEdges = (connections: AwsConnection[]): Edge[] => {
    return connections.map((connection) => ({
      id: connection.id,
      source: connection.source,
      target: connection.target,
      label: connection.label,
      ...edgeOptions,
    }));
  };

  // 초기 노드와 엣지 상태 설정
  const [nodes, setNodes, onNodesChange] = useNodesState(
    resourcestoNodes(initialResources)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    connectionsToEdges(initialConnections)
  );

  // 선택된 리소스 타입 상태
  const [selectedResourceType, setSelectedResourceType] =
    useState<AwsResourceType | null>(null);

  // 편집 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalConfig, setEditModalConfig] = useState<{
    title: string;
    fields: { label: string; name: string; value: string }[];
    onSave: (values: Record<string, string>) => void;
  } | null>(null);

  // 현재 선택된 노드와 에지
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // 연결이 추가될 때 호출되는 콜백
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        ...edgeOptions,
        id: `edge-${Date.now()}`,
        label: "연결", // 기본 레이블
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // 새 AWS 리소스 추가 함수
  const addAwsResource = (type: AwsResourceType, name: string) => {
    const newResource: AwsResource = {
      id: `resource-${Date.now()}`,
      type,
      name,
    };

    const newNode: Node = {
      id: newResource.id,
      type: "awsResource",
      data: newResource,
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // 레이아웃 재정렬 함수
  const reorganizeLayout = () => {
    setNodes((nds) => calculateGridLayout(nds));
  };

  // 리소스 타입별 버튼 스타일
  const getButtonStyle = (type: AwsResourceType) => {
    return {
      backgroundColor: selectedResourceType === type ? "#0056b3" : "#007bff",
      color: "white",
      border: "none",
      padding: "8px 12px",
      margin: "4px",
      borderRadius: "4px",
      cursor: "pointer",
    };
  };

  // 노드 선택 핸들러
  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  // 에지 선택 핸들러
  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  // 배경 클릭 핸들러
  const onPaneClick = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // 선택된 노드 편집
  const editSelectedNode = () => {
    if (!selectedNode) return;

    const resource = selectedNode.data as AwsResource;
    setEditModalConfig({
      title: "리소스 편집",
      fields: [
        { label: "이름", name: "name", value: resource.name },
        {
          label: "설명",
          name: "description",
          value: resource.description || "",
        },
      ],
      onSave: (values) => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === selectedNode.id) {
              return {
                ...n,
                data: {
                  ...n.data,
                  name: values.name,
                  description: values.description,
                },
              };
            }
            return n;
          })
        );
        setEditModalOpen(false);
      },
    });
    setEditModalOpen(true);
  };

  // 선택된 에지 편집
  const editSelectedEdge = () => {
    if (!selectedEdge) return;

    setEditModalConfig({
      title: "연결 편집",
      fields: [
        {
          label: "레이블",
          name: "label",
          value: selectedEdge.label?.toString() || "",
        },
      ],
      onSave: (values) => {
        setEdges((eds) =>
          eds.map((e) => {
            if (e.id === selectedEdge.id) {
              return {
                ...e,
                label: values.label,
              };
            }
            return e;
          })
        );
        setEditModalOpen(false);
      },
    });
    setEditModalOpen(true);
  };

  // 선택된 노드 삭제
  const deleteSelectedNode = () => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    // 관련된 엣지도 삭제
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
      )
    );
    setSelectedNode(null);
  };

  // 선택된 에지 삭제
  const deleteSelectedEdge = () => {
    if (!selectedEdge) return;

    setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
    setSelectedEdge(null);
  };

  // 다이어그램 저장
  const saveDiagram = async () => {
    if (onSaveDiagram) {
      // App 컴포넌트에서 전달된 저장 함수 사용
      await onSaveDiagram();
    } else {
      // 기존 로컬 스토리지 저장 로직
      // 노드에서 리소스 추출
      const resources: AwsResource[] = nodes.map(
        (node) => node.data as AwsResource
      );

      // 엣지에서 연결 추출
      const connections: AwsConnection[] = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label as string | undefined,
      }));

      // 다이어그램 객체 생성
      const diagram: AwsDiagram = {
        id: `diagram-${Date.now()}`,
        name: "AWS 아키텍처 다이어그램",
        resources,
        connections,
      };

      // 로컬 스토리지에 저장
      const diagrams = JSON.parse(localStorage.getItem("aws-diagrams") || "[]");
      diagrams.push(diagram);
      localStorage.setItem("aws-diagrams", JSON.stringify(diagrams));

      alert("다이어그램이 저장되었습니다.");
    }
  };

  // 다이어그램 불러오기
  const loadDiagram = () => {
    const diagrams = JSON.parse(localStorage.getItem("aws-diagrams") || "[]");
    if (diagrams.length === 0) {
      alert("저장된 다이어그램이 없습니다.");
      return;
    }

    // 가장 최근에 저장된 다이어그램 불러오기
    const latestDiagram = diagrams[diagrams.length - 1];
    setNodes(resourcestoNodes(latestDiagram.resources));
    setEdges(connectionsToEdges(latestDiagram.connections));

    alert("다이어그램을 불러왔습니다.");
  };

  return (
    <div
      className="aws-diagram-canvas"
      style={{ width: "100%", height: "80vh", position: "relative" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={edgeOptions}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        onInit={setReactFlowInstance}
      >
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            const type = (node.data as AwsResource).type;
            switch (type) {
              case AwsResourceType.EC2:
                return "#FF9900";
              case AwsResourceType.S3:
                return "#E63F00";
              case AwsResourceType.RDS:
                return "#3B48CC";
              case AwsResourceType.LAMBDA:
                return "#FF9900";
              case AwsResourceType.API_GATEWAY:
                return "#A166FF";
              default:
                return "#CCCCCC";
            }
          }}
        />
        <Background color="#f8f8f8" gap={16} />

        <Panel
          position="top-right"
          style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
        >
          <button
            onClick={reorganizeLayout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            자동 레이아웃
          </button>
          <button
            onClick={saveDiagram}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            저장하기
          </button>
          <button
            onClick={loadDiagram}
            style={{
              padding: "8px 16px",
              backgroundColor: "#FF9800",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            불러오기
          </button>
        </Panel>

        {(selectedNode || selectedEdge) && (
          <Panel
            position="top-left"
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "4px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0" }}>
              {selectedNode ? "선택된 리소스" : "선택된 연결"}
            </h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={selectedNode ? editSelectedNode : editSelectedEdge}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                편집
              </button>
              <button
                onClick={selectedNode ? deleteSelectedNode : deleteSelectedEdge}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#F44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                삭제
              </button>
            </div>
          </Panel>
        )}
      </ReactFlow>

      <div className="aws-resource-palette">
        <h3>AWS 리소스</h3>
        <div className="resource-buttons">
          <button
            style={getButtonStyle(AwsResourceType.EC2)}
            onClick={() =>
              addAwsResource(AwsResourceType.EC2, "New EC2 Instance")
            }
          >
            EC2 추가
          </button>
          <button
            style={getButtonStyle(AwsResourceType.S3)}
            onClick={() => addAwsResource(AwsResourceType.S3, "New S3 Bucket")}
          >
            S3 추가
          </button>
          <button
            style={getButtonStyle(AwsResourceType.RDS)}
            onClick={() =>
              addAwsResource(AwsResourceType.RDS, "New RDS Instance")
            }
          >
            RDS 추가
          </button>
          <button
            style={getButtonStyle(AwsResourceType.LAMBDA)}
            onClick={() =>
              addAwsResource(AwsResourceType.LAMBDA, "New Lambda Function")
            }
          >
            Lambda 추가
          </button>
          <button
            style={getButtonStyle(AwsResourceType.API_GATEWAY)}
            onClick={() =>
              addAwsResource(AwsResourceType.API_GATEWAY, "New API Gateway")
            }
          >
            API Gateway 추가
          </button>
          <button
            style={getButtonStyle(AwsResourceType.DYNAMODB)}
            onClick={() =>
              addAwsResource(AwsResourceType.DYNAMODB, "New DynamoDB Table")
            }
          >
            DynamoDB 추가
          </button>
          <button
            style={getButtonStyle(AwsResourceType.VPC)}
            onClick={() => addAwsResource(AwsResourceType.VPC, "New VPC")}
          >
            VPC 추가
          </button>
        </div>
      </div>

      {editModalOpen && editModalConfig && (
        <EditModal
          title={editModalConfig.title}
          fields={editModalConfig.fields}
          onSave={editModalConfig.onSave}
          onCancel={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AwsDiagramCanvas;
