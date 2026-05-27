import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

async function handleProxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    const pathString = path.join("/");

    // Resolve the real backend API endpoint.
    const backendBaseUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

    const url = new URL(request.url);
    const searchParams = url.search;

    const targetUrl = `${backendBaseUrl}/${pathString}${searchParams}`;

    const headers = new Headers();

    // Forward incoming headers while avoiding conflicting host/authorization headers
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== "host" &&
        lowerKey !== "connection" &&
        lowerKey !== "content-length" &&
        lowerKey !== "authorization" &&
        lowerKey !== "x-api-key"
      ) {
        headers.set(key, value);
      }
    });

    // Attach the secure API key stored only on the Next.js server environment variables
    const apiKey = process.env.API_KEY;
    headers.set("Authorization", `Bearer ${apiKey}`);

    let body: any = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.arrayBuffer();
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseData = await response.arrayBuffer();

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Avoid forwarding transport or content encoding headers that Next.js handles
      const lowerKey = key.toLowerCase();
      if (lowerKey !== "content-encoding" && lowerKey !== "transfer-encoding") {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseData, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Proxy handler error:", error);
    return NextResponse.json(
      { success: false, message: "Proxy failed to contact backend server" },
      { status: 502 }
    );
  }
}
