import { AwsConnection, AwsDiagram, AwsResource } from "../types/aws-resources";
import { CONST_VARS } from "../types/const";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 랜덤한 지연 시간 생성 함수
const getRandomDelay = () =>
  Math.floor(
    Math.random() * (CONST_VARS.MAX_DELAY - CONST_VARS.MIN_DELAY + 1)
  ) + CONST_VARS.MIN_DELAY;

class ApiService {
  private async fetchWithDelay<T>(url: string): Promise<T> {
    await delay(getRandomDelay());

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API 호출 실패 (${url}):`, error);
      throw error;
    }
  }

  // resources 가져오기
  async getResources(): Promise<AwsResource[]> {
    const data = await this.fetchWithDelay<{ resources: AwsResource[] }>(
      `${CONST_VARS.API_BASE_URL}/resources.json`
    );
    return data.resources;
  }

  // connections 가져오기
  async getConnections(): Promise<AwsConnection[]> {
    const data = await this.fetchWithDelay<{ connections: AwsConnection[] }>(
      `${CONST_VARS.API_BASE_URL}/connections.json`
    );
    return data.connections;
  }

  // diagram 가져오기
  async getDiagram(id: string = "default"): Promise<AwsDiagram> {
    const data = await this.fetchWithDelay<{ diagram: AwsDiagram }>(
      `${CONST_VARS.API_BASE_URL}/diagrams/${id}.json`
    );
    return data.diagram;
  }

  // Todo : diagram 저장하기
  async saveDiagram(
    diagram: AwsDiagram
  ): Promise<{ success: boolean; message: string }> {
    await delay(getRandomDelay());
    // console.log("다이어그램 저장:", diagram);

    return {
      success: true,
      message: "다이어그램이 성공적으로 서버에 저장되었습니다.",
    };
  }
}

const apiService = new ApiService();

export default apiService;
