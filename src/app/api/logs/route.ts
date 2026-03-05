import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mkdirSync, existsSync, appendFileSync } from "fs";
import { join } from "path";

const LOGS_DIR = join(process.cwd(), ".logs");

function writeToLogFile(entry: Record<string, unknown>) {
  console.log(`Debug flow: writeToLogFile fired with`, { category: entry.category });
  try {
    if (!existsSync(LOGS_DIR)) {
      mkdirSync(LOGS_DIR, { recursive: true });
    }
    const line = JSON.stringify({ ...entry, _ts: new Date().toISOString() }) + "\n";
    appendFileSync(join(LOGS_DIR, "builder-debug.log"), line, "utf-8");
  } catch (err) {
    console.error("writeToLogFile error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { level, category, message, metadata, userId, projectId } = body;

    if (!category || !message) {
      return NextResponse.json(
        { error: "Category and message are required" },
        { status: 400 }
      );
    }

    writeToLogFile({ level: level || "info", category, message, metadata });

    const log = await prisma.systemLog.create({
      data: {
        level: level || "info",
        category,
        message,
        metadata: typeof metadata === "string" ? metadata : JSON.stringify(metadata || {}),
        userId: userId || null,
        projectId: projectId || null,
      },
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error) {
    console.error("Failed to create log:", error);
    return NextResponse.json(
      { error: "Failed to create log" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: {
      category?: string;
      userId?: string;
      projectId?: string;
    } = {};

    if (category) where.category = category;
    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;

    const logs = await prisma.systemLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.systemLog.count({ where });

    return NextResponse.json({
      logs: logs.map((log) => ({
        ...log,
        metadata: JSON.parse(log.metadata),
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
