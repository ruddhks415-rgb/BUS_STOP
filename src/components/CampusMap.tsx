"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { BUILDINGS } from "@/lib/campusMockData";

export default function CampusMap() {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // 이미 로드되어 있는 경우 즉시 상태 업데이트 (SSR Hydration 이후 실행됨)
    if (typeof window !== "undefined" && (window as any).kakao && (window as any).kakao.maps) {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    // SDK가 로드되었고 window.kakao 객체가 있을 때만 실행
    if (mapLoaded && window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const container = document.getElementById("campus-map");
        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(35.176461, 126.907085), // 전남대 기준 위경도
          level: 4, // 지도의 확대 레벨
        };

        const map = new window.kakao.maps.Map(container, options);

        // 1. 단 하나의 전역 인포윈도우만 생성하여 재사용 (성능 최적화의 핵심!)
        const sharedInfoWindow = new window.kakao.maps.InfoWindow({
          zIndex: 1,
        });

        // 지도의 빈 공간을 클릭했을 때 인포윈도우 닫기
        window.kakao.maps.event.addListener(map, 'click', () => {
          sharedInfoWindow.close();
        });

        // 건물 데이터를 순회하며 마커 생성
        BUILDINGS.forEach((building) => {
          const position = new window.kakao.maps.LatLng(building.lat, building.lng);
          
          const marker = new window.kakao.maps.Marker({
            position: position,
            map: map,
          });

          // 마커 클릭 이벤트 리스너
          window.kakao.maps.event.addListener(marker, "click", () => {
            // 클릭될 때마다 HTML 문자열을 동적으로 생성하여 주입
            const content = `
              <div style="padding:15px; font-size:14px; min-width: 200px; color: #333; font-family: sans-serif;">
                <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${building.name}</div>
                ${building.isEstimated ? '<div style="font-size:11px; color:#f59e0b; margin-bottom:5px;">※ 위치 추정됨</div>' : ''}
                <div style="margin-bottom: 12px; font-size: 13px; color: #E53E3E; font-weight: 500;">🚨 누적 민원: ${building.cumulativeReports}건</div>
                <div style="display: flex; flex-direction: column;">
                  <a href="/campus/report?building_id=${building.id}" style="background-color: #4f46e5; color: white; text-align: center; text-decoration: none; padding: 10px; border-radius: 6px; font-size: 14px; font-weight: 600; width: 100%; display: inline-block; box-sizing: border-box; transition: background-color 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">민원 접수하기</a>
                </div>
              </div>
            `;
            
            sharedInfoWindow.setContent(content);
            sharedInfoWindow.open(map, marker);
          });
        });
      });
    }
  }, [mapLoaded]);

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=\${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setMapLoaded(true)}
      />
      <div
        id="campus-map"
        className="w-full h-full min-h-[500px] bg-gray-200 relative z-0"
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="text-gray-500 font-medium animate-pulse">캠퍼스 지도를 불러오는 중입니다...</p>
          </div>
        )}
      </div>
    </>
  );
}
