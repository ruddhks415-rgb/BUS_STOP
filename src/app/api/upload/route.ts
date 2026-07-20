import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    if (!request.body) {
      return NextResponse.json({ error: "Request body is empty" }, { status: 400 });
    }

    const blob = await put(filename, request.body, {
      access: "public",
      addRandomSuffix: true, // 동일한 이름의 파일이 업로드될 경우 파일명 끝에 무작위 문자열을 추가하여 덮어쓰기를 방지합니다.
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Blob upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
