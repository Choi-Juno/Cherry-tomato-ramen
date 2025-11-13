/**
 * FastAPI ML Service Client
 * Handles communication with the Python ML microservice
 */

import { MLInsightRequest, MLInsightResponse } from "@/types/insight";

const ML_API_URL =
  process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";
const ML_API_SECRET_KEY = process.env.ML_API_SECRET_KEY || "dev-secret-key";

/**
 * ML API Client for making requests to FastAPI service
 */
export class MLApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || ML_API_URL;
    this.apiKey = apiKey || ML_API_SECRET_KEY;
  }

  /**
   * Generate AI insights for a user's spending data
   */
  async generateInsights(
    request: MLInsightRequest
  ): Promise<MLInsightResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate insights");
      }

      const data = await response.json();
      return data as MLInsightResponse;
    } catch (error) {
      console.error("ML API Error:", error);
      throw error;
    }
  }

  /**
   * Health check for ML service
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    models_loaded: Record<string, boolean>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);

      if (!response.ok) {
        throw new Error("Health check failed");
      }

      return await response.json();
    } catch (error) {
      console.error("ML API Health Check Error:", error);
      throw error;
    }
  }

  /**
   * Trigger model retraining (admin only)
   */
  async trainModels(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/train`, {
        method: "POST",
        headers: {
          "X-API-Key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Training request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("ML API Training Error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const mlApiClient = new MLApiClient();

