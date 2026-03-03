import { chromium, Browser, Page } from "@playwright/test";

export interface ValidationIntent {
  type: "color" | "text" | "padding" | "background" | "position" | "exists";
  target: string; // component ID or selector
  expected: string;
}

export interface ValidationResult {
  passed: boolean;
  intent: string;
  expected: string;
  actual: string;
  componentId?: string;
  suggestion?: string;
  error?: string;
}

export function extractIntent(prompt: string): ValidationIntent | null {
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract component ID if present
  const idMatch = prompt.match(/\b(cmm[a-z0-9]+)\b/i);
  const componentId = idMatch ? idMatch[1] : "";

  // Color intent
  if (lowerPrompt.includes("red") || lowerPrompt.includes("color")) {
    if (lowerPrompt.includes("red")) {
      return { type: "color", target: componentId, expected: "red" };
    }
    if (lowerPrompt.includes("blue")) {
      return { type: "color", target: componentId, expected: "blue" };
    }
    if (lowerPrompt.includes("green")) {
      return { type: "color", target: componentId, expected: "green" };
    }
  }

  // Text content intent
  const textMatch = lowerPrompt.match(/add (?:text |header |typography )?["']?([^"']+)["']?/i);
  if (textMatch) {
    return { type: "text", target: componentId, expected: textMatch[1] };
  }

  // Padding intent
  if (lowerPrompt.includes("padding")) {
    const paddingMatch = lowerPrompt.match(/(\d+)\s*px/);
    if (paddingMatch) {
      return { type: "padding", target: componentId, expected: `${paddingMatch[1]}px` };
    }
  }

  // Background intent
  if (lowerPrompt.includes("background") || lowerPrompt.includes("bg")) {
    if (lowerPrompt.includes("gray") || lowerPrompt.includes("grey")) {
      return { type: "background", target: componentId, expected: "gray" };
    }
  }

  // Existence check
  if (lowerPrompt.includes("add") || lowerPrompt.includes("create")) {
    return { type: "exists", target: componentId, expected: "component should exist" };
  }

  return null;
}

export async function validateComponent(
  componentId: string,
  intent: ValidationIntent,
  baseUrl: string = "http://localhost:3000"
): Promise<ValidationResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000); // Wait for components to render

    const selector = componentId ? `[data-component-id="${componentId}"]` : "[data-component-id]";
    
    // Check if component exists
    const element = await page.locator(selector).first();
    const exists = await element.count() > 0;

    if (!exists && intent.type !== "exists") {
      return {
        passed: false,
        intent: `Component ${componentId} should exist`,
        expected: "Component to be present in DOM",
        actual: "Component not found",
        componentId,
        suggestion: "Check if the component ID is correct or if the component was actually created",
      };
    }

    switch (intent.type) {
      case "exists": {
        return {
          passed: exists,
          intent: intent.expected,
          expected: "Component exists in DOM",
          actual: exists ? "Component found" : "Component not found",
          componentId,
          suggestion: exists ? undefined : "Component was not created. Check if add_page_component or add_child_component action was executed.",
        };
      }

      case "color": {
        const color = await element.evaluate((el) => window.getComputedStyle(el).color);
        const colorMap: Record<string, string[]> = {
          red: ["rgb(220, 38, 38)", "rgb(239, 68, 68)", "rgb(185, 28, 28)"],
          blue: ["rgb(59, 130, 246)", "rgb(37, 99, 235)", "rgb(29, 78, 216)"],
          green: ["rgb(34, 197, 94)", "rgb(22, 163, 74)", "rgb(21, 128, 61)"],
        };

        const expectedColors = colorMap[intent.expected] || [];
        const passed = expectedColors.some((c) => color.includes(c));

        return {
          passed,
          intent: `Color should be ${intent.expected}`,
          expected: expectedColors[0] || intent.expected,
          actual: color,
          componentId,
          suggestion: passed
            ? undefined
            : `Use inject_styles with className 'text-${intent.expected}-600' or update_page_component with configPath 'className'`,
        };
      }

      case "text": {
        const text = await element.textContent();
        const passed = text?.toLowerCase().includes(intent.expected.toLowerCase()) || false;

        return {
          passed,
          intent: `Text should contain "${intent.expected}"`,
          expected: intent.expected,
          actual: text || "",
          componentId,
          suggestion: passed
            ? undefined
            : `Update component config.text or config.content property to "${intent.expected}"`,
        };
      }

      case "padding": {
        const padding = await element.evaluate((el) => window.getComputedStyle(el).padding);
        const passed = padding.includes(intent.expected);

        return {
          passed,
          intent: `Padding should be ${intent.expected}`,
          expected: intent.expected,
          actual: padding,
          componentId,
          suggestion: passed
            ? undefined
            : `Use inject_styles with className 'p-[${intent.expected}]' or update_page_component with configPath 'className'`,
        };
      }

      case "background": {
        const bgColor = await element.evaluate((el) => window.getComputedStyle(el).backgroundColor);
        const isGray = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        
        let passed = false;
        if (isGray && intent.expected === "gray") {
          const [, r, g, b] = isGray.map(Number);
          // Gray colors have similar R, G, B values and are light (>200)
          passed = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r > 200;
        }

        return {
          passed,
          intent: `Background should be ${intent.expected}`,
          expected: "rgb(243, 244, 246) or similar gray",
          actual: bgColor,
          componentId,
          suggestion: passed
            ? undefined
            : `Use inject_styles with className 'bg-gray-100' or update_page_component with configPath 'className'`,
        };
      }

      default:
        return {
          passed: false,
          intent: "Unknown validation type",
          expected: "",
          actual: "",
          error: `Unsupported validation type: ${intent.type}`,
        };
    }
  } catch (error) {
    return {
      passed: false,
      intent: intent.expected,
      expected: "Validation to complete successfully",
      actual: "Error during validation",
      error: error instanceof Error ? error.message : "Unknown error",
      suggestion: "Check if the dev server is running and the component exists",
    };
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

export async function validatePrompt(
  prompt: string,
  componentIds: string[],
  baseUrl?: string
): Promise<ValidationResult> {
  const intent = extractIntent(prompt);
  
  if (!intent) {
    return {
      passed: true, // If we can't extract intent, assume it's not a validatable action
      intent: "No specific validation intent detected",
      expected: "N/A",
      actual: "N/A",
    };
  }

  // Use the first component ID if intent didn't extract one
  const targetId = intent.target || componentIds[0] || "";
  
  return validateComponent(targetId, intent, baseUrl);
}
