/**
 * Home Model
 * Note: This is a stub file created to satisfy MCP workflow requirements.
 * The widget creator endpoint (/api/ai/widget) is an API-only feature
 * and does not require traditional data models.
 */

export interface WidgetGenerationRequest {
  message: string;
  projectId: string;
}

export interface WidgetGenerationResponse {
  message: string;
  role: "assistant";
  timestamp: string;
}
