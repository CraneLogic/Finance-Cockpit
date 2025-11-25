import { AI_CFO_BASE_URL } from "../config";
import type {
  CfoEntity,
  CfoBrief,
  CfoAlert,
  CfoRecommendation,
  RecommendationStatus,
} from "./aiCfoTypes";

class AiCfoClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(
          `AI-CFO API error: ${response.status} ${response.statusText}`
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch from AI-CFO: ${error.message}`);
      }
      throw new Error("Failed to fetch from AI-CFO: Unknown error");
    }
  }

  async getEntities(): Promise<CfoEntity[]> {
    return this.fetch<CfoEntity[]>("/entities");
  }

  async getBrief(ledgerEntityId: string): Promise<CfoBrief> {
    return this.fetch<CfoBrief>(`/entities/${ledgerEntityId}/brief`);
  }

  async getAlerts(
    ledgerEntityId: string,
    options?: { unacknowledgedOnly?: boolean }
  ): Promise<CfoAlert[]> {
    const params = new URLSearchParams();
    if (options?.unacknowledgedOnly) {
      params.append("unacknowledged", "true");
    }
    
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.fetch<CfoAlert[]>(`/entities/${ledgerEntityId}/alerts${query}`);
  }

  async acknowledgeAlert(id: string): Promise<void> {
    await this.fetch<void>(`/alerts/${id}/ack`, {
      method: "POST",
    });
  }

  async getRecommendations(
    ledgerEntityId: string,
    status?: RecommendationStatus
  ): Promise<CfoRecommendation[]> {
    const params = new URLSearchParams();
    if (status) {
      params.append("status", status);
    }
    
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.fetch<CfoRecommendation[]>(
      `/entities/${ledgerEntityId}/recommendations${query}`
    );
  }

  async approveRecommendation(id: string): Promise<void> {
    await this.fetch<void>(`/recommendations/${id}/approve`, {
      method: "POST",
    });
  }

  async rejectRecommendation(id: string, reason?: string): Promise<void> {
    await this.fetch<void>(`/recommendations/${id}/reject`, {
      method: "POST",
      body: reason ? JSON.stringify({ reason }) : undefined,
    });
  }
}

// Export a singleton instance
export const aiCfoClient = new AiCfoClient(AI_CFO_BASE_URL);
