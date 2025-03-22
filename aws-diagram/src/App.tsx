import { useEffect, useRef, useState } from "react";
import "./App.css";
import AwsDiagramCanvas from "./components/AwsDiagramCanvas";
import apiService from "./services/api";
import { AwsConnection, AwsResource } from "./types/aws-resources";
import { CONST_VARS } from "./types/const";

function App() {
  const [resources, setResources] = useState<AwsResource[]>([]);
  const [connections, setConnections] = useState<AwsConnection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(
    CONST_VARS.REFRESH_INTERVAL / 1000
  );
  const [progress, setProgress] = useState<number>(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);

  const refreshTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const fetchDiagramData = async () => {
    try {
      // 첫 로딩일 때만 로딩 상태 표시
      if (resources.length === 0) {
        setLoading(true);
      }

      setError(null);

      // 다이어그램 데이터 가져오기
      const diagram = await apiService.getDiagram();

      // 데이터 업데이트
      setResources(diagram.resources);
      setConnections(diagram.connections);

      // 마지막 업데이트 시간 기록
      setLastUpdated(new Date().toLocaleTimeString());

      // 타이머 재설정 (자동 새로고침이 활성화된 경우에만)
      if (autoRefreshEnabled) {
        setTimeRemaining(CONST_VARS.REFRESH_INTERVAL / 1000);
        setProgress(0);
      }
    } catch (err) {
      console.error("데이터 가져오기 실패:", err);
      setError("AWS 리소스 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로딩 및 주기적 갱신 설정
  useEffect(() => {
    // 초기 데이터 로딩
    fetchDiagramData();

    // 자동 새로고침이 활성화된 경우에만 타이머 설정
    if (autoRefreshEnabled) {
      setupTimers();
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      clearAllTimers();
    };
  }, [autoRefreshEnabled]);

  // 타이머 설정 함수
  const setupTimers = () => {
    // 기존 타이머 정리
    clearAllTimers();

    // 주기적 갱신 설정
    refreshTimerRef.current = window.setInterval(() => {
      console.log("다이어그램 데이터 자동 갱신 중...");
      fetchDiagramData(); // 데이터 가져오기
    }, CONST_VARS.REFRESH_INTERVAL);

    // 프로그레스 타이머 설정
    startProgressTimer();
  };

  // 프로그레스 타이머 시작 함수
  const startProgressTimer = () => {
    // 기존 타이머 정리
    if (progressTimerRef.current !== null) {
      clearInterval(progressTimerRef.current);
    }

    // 1초마다 프로그레스 및 남은 시간 업데이트
    progressTimerRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        // 남은 시간이 0이면 10초로 리셋
        if (prev <= 1) {
          return CONST_VARS.REFRESH_INTERVAL / 1000;
        }
        return prev - 1;
      });

      // 프로그레스 업데이트 (0-100%)
      setProgress((prev) => {
        // 타이머가 끝나면 0%로 리셋
        if (prev >= 100) {
          return 0;
        }
        // 1초마다 10% 증가 (10초 기준)
        return prev + 100 / (CONST_VARS.REFRESH_INTERVAL / 1000);
      });
    }, 1000);
  };

  // 모든 타이머 정리 함수
  const clearAllTimers = () => {
    if (refreshTimerRef.current !== null) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (progressTimerRef.current !== null) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const handleDiagramChange = (
    updatedResources: AwsResource[],
    updatedConnections: AwsConnection[]
  ) => {
    setResources(updatedResources);
    setConnections(updatedConnections);
  };

  // 다이어그램 저장 핸들러
  const handleSaveDiagram = async () => {
    try {
      const result = await apiService.saveDiagram({
        id: "user-diagram",
        name: "AWS 클라우드 아키텍처",
        resources,
        connections,
      });

      alert(result.message);

      // 저장 후 최신 데이터로 갱신
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("다이어그램 저장 실패:", err);
      alert("다이어그램 저장 중 오류가 발생했습니다.");
    }
  };

  // 수동 갱신 핸들러
  const handleManualRefresh = () => {
    // 데이터 가져오기
    fetchDiagramData();

    // 자동 새로고침이 활성화된 경우 타이머도 재설정
    if (autoRefreshEnabled) {
      setupTimers();
    }
  };

  // 자동 새로고침 토글 핸들러
  const toggleAutoRefresh = () => {
    const newState = !autoRefreshEnabled;
    setAutoRefreshEnabled(newState);

    if (!newState) {
      clearAllTimers();
      setProgress(0);
      setTimeRemaining(CONST_VARS.REFRESH_INTERVAL / 1000);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS 리소스 다이어그램</h1>
        <p>리소스 간의 관계와 통신을 시각화합니다.</p>
        {lastUpdated && (
          <div className="update-info-container">
            <p className="last-updated">
              마지막 업데이트: {lastUpdated}
              <button
                onClick={handleManualRefresh}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#95a5a6",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                title="지금 갱신하기"
              >
                ↻
              </button>
            </p>
            <div
              className={`refresh-timer-container ${
                autoRefreshEnabled ? "active" : "disabled"
              }`}
              title={
                autoRefreshEnabled
                  ? `${timeRemaining}초 후 갱신`
                  : "자동 갱신 비활성화됨 (클릭하여 활성화)"
              }
              onClick={toggleAutoRefresh}
              style={{ cursor: "pointer" }}
            >
              <div
                className="refresh-timer-progress"
                style={
                  {
                    "--progress": `${progress}%`,
                    opacity: autoRefreshEnabled ? 1 : 0.3,
                  } as React.CSSProperties
                }
              ></div>
              <div className="refresh-timer-center">
                {autoRefreshEnabled ? timeRemaining : "⏸"}
              </div>
            </div>
          </div>
        )}
      </header>
      <main>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>AWS 리소스 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => fetchDiagramData()} className="retry-button">
              다시 시도
            </button>
          </div>
        ) : (
          <AwsDiagramCanvas
            initialResources={resources}
            initialConnections={connections}
            onDiagramChange={handleDiagramChange}
            onSaveDiagram={handleSaveDiagram}
          />
        )}
      </main>
    </div>
  );
}

export default App;
