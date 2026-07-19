import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stopId = searchParams.get('stop_id');

  if (!stopId) {
    return NextResponse.json({ error: 'stop_id is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GWANGJU_BUS_API_KEY;
  // 광주광역시 버스도착정보 API 기본 엔드포인트
  const url = `http://apis.data.go.kr/6290000/busarrivalinfo/getBusArrivalInfo?serviceKey=${apiKey}&BUSSTOP_ID=${stopId}`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    
    // 단순 파싱
    const lines: any[] = [];
    
    // 에러나 빈 결과 확인
    if (text.includes('Unexpected errors') || text.includes('<errMsg>') || text.includes('SERVICE ERROR')) {
      return NextResponse.json({ error: 'API Error: ' + text.substring(0, 100), raw: text }, { status: 500 });
    }

    const itemRegex = /<ITEM>([\s\S]*?)<\/ITEM>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const itemText = match[1];
      const getTag = (tag: string) => {
        const m = new RegExp(`<${tag}>(.*?)<\\/${tag}>`).exec(itemText);
        return m ? m[1] : '';
      };
      
      lines.push({
        lineName: getTag('LINE_NAME'),
        remainMin: getTag('REMAIN_MIN'),
        busStopName: getTag('BUSSTOP_NAME'),
      });
    }

    return NextResponse.json({ data: lines, raw: text });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
