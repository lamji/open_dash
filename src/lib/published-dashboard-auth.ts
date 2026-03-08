import { createDecipheriv, createHash, createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { decryptProjectConfigValue } from "@/lib/project-config-crypto";

const BUILDER_LAYOUT_CONFIG_KEY = "builder_layout_state";
const PROJECT_ADVANCED_CONFIG_KEY = "project_advanced_config";
const PUBLISHED_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const DEFAULT_TOKEN_SECRET = "open-dash-published-dashboard-auth-secret";
export const PUBLISHED_DASHBOARD_COOKIE_NAME = "open-dash-preview-auth";

interface BuilderLayoutState {
  publishedLayoutId?: string | null;
}
interface StoredProjectAdvancedConfig {
  loginRequired: boolean;
  encryptedUserSecretKey?: string;
  loginEndpointEncrypted?: string;
}
interface PublishedTokenPayload {
  projectId: string;
  layoutId: string;
  exp: number;
}
interface PublishedProjectAccessConfig {
  projectId: string;
  loginRequired: boolean;
  encryptedUserSecretKey?: string;
  loginEndpointEncrypted?: string;
}

function parseBuilderLayoutState(rawValue: string): BuilderLayoutState {
  try {
    const parsed = JSON.parse(rawValue) as BuilderLayoutState;
    return parsed;
  } catch {
    return {};
  }
}

function parseAdvancedProjectConfig(rawValue: string): StoredProjectAdvancedConfig {
  try {
    const parsed = JSON.parse(rawValue) as {
      loginRequired?: unknown;
      encryptedUserSecretKey?: unknown;
      loginEndpointEncrypted?: unknown;
    };
    return {
      loginRequired: Boolean(parsed.loginRequired),
      encryptedUserSecretKey:
        typeof parsed.encryptedUserSecretKey === "string" && parsed.encryptedUserSecretKey.length > 0
          ? parsed.encryptedUserSecretKey
          : undefined,
      loginEndpointEncrypted:
        typeof parsed.loginEndpointEncrypted === "string" && parsed.loginEndpointEncrypted.length > 0
          ? parsed.loginEndpointEncrypted
          : undefined,
    };
  } catch {
    return { loginRequired: false };
  }
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getTokenSecret(): string {
  return process.env.PUBLISHED_DASHBOARD_TOKEN_SECRET?.trim() || DEFAULT_TOKEN_SECRET;
}

function signPublishedTokenPayload(encodedPayload: string): string {
  return createHmac("sha256", getTokenSecret()).update(encodedPayload).digest("hex");
}

function decryptWithUserSecret(payload: string, secretKey: string): string {
  const [ivHex, authTagHex, contentHex] = payload.split(":");
  if (!ivHex || !authTagHex || !contentHex) {
    throw new Error("Invalid encrypted payload format");
  }

  const key = createHash("sha256").update(secretKey).digest();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(contentHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

export async function getPublishedProjectAccessConfig(
  layoutId: string
): Promise<PublishedProjectAccessConfig | null> {
  const builderLayoutConfigs = await prisma.appConfig.findMany({
    where: {
      key: BUILDER_LAYOUT_CONFIG_KEY,
      value: { contains: layoutId },
    },
    select: {
      projectId: true,
      value: true,
    },
  });

  const matchedConfig = builderLayoutConfigs.find(
    (entry) => parseBuilderLayoutState(entry.value).publishedLayoutId === layoutId
  );
  if (!matchedConfig) {
    return null;
  }

  const accessConfig = await prisma.appConfig.findUnique({
    where: {
      key_projectId: {
        key: PROJECT_ADVANCED_CONFIG_KEY,
        projectId: matchedConfig.projectId,
      },
    },
  });
  if (!accessConfig) {
    return {
      projectId: matchedConfig.projectId,
      loginRequired: false,
    };
  }

  const parsed = parseAdvancedProjectConfig(accessConfig.value);
  return {
    projectId: matchedConfig.projectId,
    loginRequired: parsed.loginRequired,
    encryptedUserSecretKey: parsed.encryptedUserSecretKey,
    loginEndpointEncrypted: parsed.loginEndpointEncrypted,
  };
}

export function resolvePublishedLoginEndpoint(config: PublishedProjectAccessConfig): string | null {
  if (!config.encryptedUserSecretKey || !config.loginEndpointEncrypted) {
    return null;
  }
  const userSecretKey = decryptProjectConfigValue(config.encryptedUserSecretKey).trim();
  if (!userSecretKey) {
    return null;
  }
  const endpoint = decryptWithUserSecret(config.loginEndpointEncrypted, userSecretKey).trim();
  return endpoint || null;
}

function createPublishedAccessToken(projectId: string, layoutId: string): string {
  const payload: PublishedTokenPayload = {
    projectId,
    layoutId,
    exp: Date.now() + PUBLISHED_SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPublishedTokenPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function validatePublishedAccessToken(
  token: string,
  expectedProjectId: string,
  expectedLayoutId: string
): boolean {
  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return false;
  }

  const expectedSignature = signPublishedTokenPayload(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as PublishedTokenPayload;
    if (!payload.projectId || !payload.layoutId || !payload.exp) {
      return false;
    }
    if (payload.projectId !== expectedProjectId || payload.layoutId !== expectedLayoutId) {
      return false;
    }
    if (payload.exp < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function buildPublishedAccessCookie(projectId: string, layoutId: string): string {
  const token = createPublishedAccessToken(projectId, layoutId);
  return `${PUBLISHED_DASHBOARD_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${PUBLISHED_SESSION_MAX_AGE_SECONDS}`;
}
