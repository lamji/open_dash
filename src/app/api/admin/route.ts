import { NextRequest, NextResponse } from "next/server";

// Admin API route
// This feature (dev mode toggle) is frontend-only with localStorage
// No backend API endpoints needed for dev mode functionality

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: "Admin API endpoint",
    devMode: "Dev mode is managed client-side via localStorage",
  });
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({
    message: "Admin API endpoint",
    devMode: "Dev mode is managed client-side via localStorage",
  });
}
