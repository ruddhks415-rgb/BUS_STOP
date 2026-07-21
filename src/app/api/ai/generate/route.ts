import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { reports, type } = await request.json(); // reports is an array of report objects, type is "single" or "comprehensive"
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key is not configured." }, { status: 500 });
    }

    const systemPrompt = `당신은 구청/학교 행정실에 제출할 공식 민원 문서를 작성하는 전문 행정 AI입니다. 
제공된 제보 데이터를 바탕으로 객관적이고 공식적인 문체의 리포트를 작성하세요. 
과장된 표현이나 원본 제보에 없는 내용을 추측해서 지어내지 마세요. 개인 식별 정보(이름, 연락처 등)가 있다면 제외하세요.

반드시 다음 JSON 형식으로만 응답해야 합니다 (마크다운 백틱 없이 순수 JSON만 반환):
{
  "title": "리포트 제목 (문제를 한 줄로 명확히 요약)",
  "location": "발생 위치",
  "date_category": "최초~최근 접수일 및 카테고리",
  "summary": "문제 요약 (원본 설명+댓글을 공식적인 문체로 2~4문장 정리)",
  "empathy_comment": "공감 수 및 심각도에 대한 코멘트",
  "request_action": "처리 요청 사항 (구체적이고 실현 가능한 조치 제안)"
}`;

    const userPrompt = `다음 제보 데이터(${type === "comprehensive" ? "종합 리포트용" : "단일 리포트용"})를 바탕으로 JSON 리포트를 작성해주세요:\n\n${JSON.stringify(reports, null, 2)}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API Error:", errText);
      return NextResponse.json({ error: "Failed to generate AI report", details: errText }, { status: 500 });
    }

    const data = await res.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    try {
      const parsed = JSON.parse(generatedText);
      return NextResponse.json({ result: parsed });
    } catch (e) {
      // In case the model returns markdown block despite the prompt
      const jsonStr = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      return NextResponse.json({ result: parsed });
    }
  } catch (error: any) {
    console.error("POST /api/ai/generate error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
