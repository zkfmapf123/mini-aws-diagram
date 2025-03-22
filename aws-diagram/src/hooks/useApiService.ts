import { useCallback, useEffect, useState } from "react";
import apiService from "../services/api";
import { AwsConnection, AwsDiagram, AwsResource } from "../types/aws-resources";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export const useGetResources = (autoFetch = true) => {
  const [state, setState] = useState<ApiState<AwsResource[]>>({
    data: null,
    loading: autoFetch,
    error: null,
  });

  const fetchResources = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const resources = await apiService.getResources();
      setState({ data: resources, loading: false, error: null });
      return resources;
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error as Error }));
      throw error;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchResources();
    }
  }, [autoFetch, fetchResources]);

  return { ...state, fetchResources };
};

export const useGetConnections = (autoFetch = true) => {
  const [state, setState] = useState<ApiState<AwsConnection[]>>({
    data: null,
    loading: autoFetch,
    error: null,
  });

  const fetchConnections = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const connections = await apiService.getConnections();
      setState({ data: connections, loading: false, error: null });
      return connections;
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error as Error }));
      throw error;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchConnections();
    }
  }, [autoFetch, fetchConnections]);

  return { ...state, fetchConnections };
};

export const useGetDiagram = (autoFetch = true, id: string = "default") => {
  const [state, setState] = useState<ApiState<AwsDiagram>>({
    data: null,
    loading: autoFetch,
    error: null,
  });

  const fetchDiagram = useCallback(
    async (diagramId: string = id) => {
      console.log(`HOOK: 다이어그램 가져오기 시작 (id: ${diagramId})`);
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const diagram = await apiService.getDiagram(diagramId);
        console.log("HOOK: 다이어그램 가져오기 성공", diagram);
        setState({ data: diagram, loading: false, error: null });
        return diagram;
      } catch (error) {
        console.error("HOOK: 다이어그램 가져오기 실패", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
        throw error;
      }
    },
    [id]
  );

  useEffect(() => {
    console.log(`HOOK: useEffect 실행 (autoFetch: ${autoFetch})`);
    if (autoFetch) {
      fetchDiagram(id);
    }
  }, [autoFetch, fetchDiagram, id]);

  return { ...state, fetchDiagram };
};

export const useSaveDiagram = () => {
  const [state, setState] = useState<
    ApiState<{ success: boolean; message: string }>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const saveDiagram = useCallback(async (diagram: AwsDiagram) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiService.saveDiagram(diagram);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error as Error }));
      throw error;
    }
  }, []);

  return { ...state, saveDiagram };
};
