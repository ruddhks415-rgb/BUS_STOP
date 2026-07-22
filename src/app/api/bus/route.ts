import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stopId = searchParams.get('stop_id');

  if (!stopId) {
    return NextResponse.json({ error: 'stop_id is required' }, { status: 400 });
  }

  // 새로 발급받은 국토교통부(TAGO) 버스 API 키
  const apiKey = process.env.NEXT_PUBLIC_TAGO_BUS_API_KEY || process.env.NEXT_PUBLIC_GWANGJU_BUS_API_KEY || '';
  
  // 광주광역시 도시코드: 24
  // 광주광역시 TAGO 정류소 ID(nodeId)는 보통 'GJB' + 정류소번호(ARS) 형태입니다.
  // (만약 추후 GJB가 아니라 GMB 등 다른 규격이면 이 부분을 수정해야 합니다)
  const cityCode = '24';
  const nodeId = `GJB${stopId}`; 

  // 국토교통부 TAGO 버스도착정보 API 엔드포인트
  const url = `http://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList?serviceKey=${apiKey}&cityCode=${cityCode}&nodeId=${nodeId}&numOfRows=10&pageNo=1&_type=json`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    
    // API 에러 발생 시 처리 (키 미등록, 동기화 지연 등)
    if (text.includes('<errMsg>') || text.includes('SERVICE ERROR') || text.includes('Forbidden') || text.includes('Unexpected errors')) {
      return NextResponse.json({ error: 'API Error: ' + text.substring(0, 100), raw: text }, { status: 500 });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON response from API', raw: text }, { status: 500 });
    }

    const items = data?.response?.body?.items?.item;
    const lines: any[] = [];

    if (items) {
      const itemList = Array.isArray(items) ? items : [items];
      itemList.forEach(item => {
        lines.push({
          lineName: item.routeno,
          remainMin: Math.floor(item.arrtime / 60).toString(),
          busStopName: item.nodenm,
        });
      });
    }

    return NextResponse.json({ data: lines, raw: text });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
