import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stopId = searchParams.get('stop_id');

  if (!stopId) {
    return NextResponse.json({ error: 'stop_id is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_TAGO_BUS_API_KEY || process.env.NEXT_PUBLIC_GWANGJU_BUS_API_KEY || '';
  const cityCode = '24';
  
  // 15초 타임아웃 설정 (공공데이터포털 서버가 느릴 수 있음)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    // 1단계: ARS 번호(stopId)로 TAGO 고유 정류장 ID(nodeId) 조회
    const sttnUrl = `http://apis.data.go.kr/1613000/BusSttnInfoInqireService/getSttnNoList?serviceKey=${apiKey}&cityCode=${cityCode}&nodeNo=${stopId}&numOfRows=10&pageNo=1&_type=json`;
    const sttnRes = await fetch(sttnUrl, { cache: 'no-store', signal: controller.signal });
    const sttnText = await sttnRes.text();

    if (sttnText.includes('<errMsg>') || sttnText.includes('SERVICE ERROR') || sttnText.includes('Forbidden') || sttnText.includes('Unexpected errors') || sttnText.toUpperCase().includes('UNAUTHORIZED')) {
      return NextResponse.json({ error: 'API Error (Station) - 키 미등록/권한 없음: ' + sttnText.substring(0, 100), raw: sttnText }, { status: 500 });
    }

    let sttnData;
    try {
      sttnData = JSON.parse(sttnText);
    } catch (e) {
      return NextResponse.json({ error: `Invalid JSON (Station): ${sttnText.substring(0, 100)}`, raw: sttnText }, { status: 500 });
    }

    const sttnItems = sttnData?.response?.body?.items?.item;
    let actualNodeId = `GJB${stopId}`; // 기본값 폴백

    if (sttnItems) {
      const sttnList = Array.isArray(sttnItems) ? sttnItems : [sttnItems];
      if (sttnList.length > 0 && sttnList[0].nodeid) {
        actualNodeId = sttnList[0].nodeid;
      }
    }

    // 2단계: 찾은 고유 nodeId로 버스 도착 정보 조회
    const arvlUrl = `http://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList?serviceKey=${apiKey}&cityCode=${cityCode}&nodeId=${actualNodeId}&numOfRows=10&pageNo=1&_type=json`;
    const arvlRes = await fetch(arvlUrl, { cache: 'no-store', signal: controller.signal });
    const arvlText = await arvlRes.text();

    clearTimeout(timeoutId);

    if (arvlText.includes('<errMsg>') || arvlText.includes('SERVICE ERROR') || arvlText.includes('Forbidden') || arvlText.includes('Unexpected errors') || arvlText.toUpperCase().includes('UNAUTHORIZED')) {
      return NextResponse.json({ error: 'API Error (Arrival) - 키 미등록/권한 없음: ' + arvlText.substring(0, 100), raw: arvlText }, { status: 500 });
    }

    let arvlData;
    try {
      arvlData = JSON.parse(arvlText);
    } catch (e) {
      return NextResponse.json({ error: `Invalid JSON (Arrival): ${arvlText.substring(0, 100)}`, raw: arvlText }, { status: 500 });
    }

    const items = arvlData?.response?.body?.items?.item;
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

    return NextResponse.json({ data: lines, raw: arvlText, nodeId: actualNodeId });
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: '공공데이터포털 서버 응답 지연 (Timeout)' }, { status: 500 });
    }
    return NextResponse.json({ error: `Failed to fetch data: ${error.message}` }, { status: 500 });
  }
}
