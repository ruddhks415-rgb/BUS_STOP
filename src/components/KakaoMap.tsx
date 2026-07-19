"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { STOPS } from "@/lib/mockData";

export default function KakaoMap() {
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
        const container = document.getElementById("map");
        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(35.176461, 126.907085), // 전남대 기준 위경도
          level: 4, // 지도의 확대 레벨
        };

        const map = new window.kakao.maps.Map(container, options);

        // 현재 열려있는 인포윈도우를 추적하기 위한 변수
        let currentOpenInfoWindow: any = null;

        // 지도의 빈 공간을 클릭했을 때 인포윈도우 닫기
        window.kakao.maps.event.addListener(map, 'click', () => {
          if (currentOpenInfoWindow) {
            currentOpenInfoWindow.close();
            currentOpenInfoWindow = null;
          }
        });

        // 전역으로 도착정보 띄우기 함수 등록
        (window as any).showArrivalInfo = async (stopId: string, stopName: string) => {
          try {
            // 로딩 표시 (간단히 alert로 대체 가능하나, UX 개선을 위해 추후 모달로 변경 권장)
            const loadingMsg = `[데이터 요청 중]\n${stopName} 정류장의 실시간 버스 도착 정보를 공공데이터포털에서 가져오고 있습니다...`;
            console.log(loadingMsg);
            
            const res = await fetch(`/api/bus?stop_id=${stopId}`);
            const json = await res.json();
            
            if (json.error) {
              alert(`[오류 발생]\n버스 정보를 가져오지 못했습니다.\n\n사유: ${json.error}`);
              console.error("API Error details:", json.raw);
              return;
            }
            
            if (!json.data || json.data.length === 0) {
              alert(`[도착 정보 없음]\n현재 ${stopName} 정류장에 도착 예정인 버스가 없거나, 정류소 ID(${stopId})가 올바르지 않습니다.`);
              return;
            }

            let msg = `🚌 [실시간 버스 도착 정보] ${stopName} 🚌\n\n`;
            json.data.forEach((bus: any) => {
              msg += `▶ ${bus.lineName}번 버스: ${bus.remainMin}분 후 도착 예정\n`;
            });
            alert(msg);
          } catch (e) {
            alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
          }
        };

        // 정류장 더미 데이터를 순회하며 마커 생성
        STOPS.forEach((stop) => {
          const position = new window.kakao.maps.LatLng(stop.lat, stop.lng);
          const marker = new window.kakao.maps.Marker({
            position: position,
            map: map,
          });

          // 인포윈도우 생성 (마커 클릭 시 나타나는 정보창)
          const content = `
            <div style="padding:15px; font-size:14px; min-width: 200px; color: #333; font-family: sans-serif;">
              <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${stop.name} <span style="font-size:12px; color:gray;">(${stop.id})</span></div>
              <div style="margin-bottom: 10px; font-size: 13px; color: #E53E3E; font-weight: 500;">🚨 누적 제보: ${stop.cumulativeReports}건</div>
              <div style="display: flex; gap: 8px; flex-direction: column;">
                <button onclick="window.showArrivalInfo('${stop.id}', '${stop.name}')" style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; width: 100%; transition: background-color 0.2s;">실시간 도착정보 보기</button>
                <a href="/bus/report?stop_id=${stop.id}" style="background-color: #2563eb; color: white; text-align: center; text-decoration: none; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; width: 100%; display: inline-block; box-sizing: border-box; transition: background-color 0.2s;">제보하기</a>
              </div>
            </div>
          `;

          const infowindow = new window.kakao.maps.InfoWindow({
            content: content,
          });

          // 마커 클릭 이벤트 리스너
          window.kakao.maps.event.addListener(marker, "click", () => {
            // 이미 열려있는 인포윈도우가 자신이 띄운 거라면 닫기 (토글)
            if (currentOpenInfoWindow === infowindow) {
              infowindow.close();
              currentOpenInfoWindow = null;
              return;
            }

            // 다른 인포윈도우가 열려있다면 먼저 닫기
            if (currentOpenInfoWindow) {
              currentOpenInfoWindow.close();
            }

            // 새로운 인포윈도우 열기
            infowindow.open(map, marker);
            currentOpenInfoWindow = infowindow;
          });
        });
      });
    }
  }, [mapLoaded]);

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setMapLoaded(true)}
      />
      <div
        id="map"
        className="w-full h-full min-h-[500px] bg-gray-200 relative z-0"
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="text-gray-500 font-medium animate-pulse">카카오지도를 불러오는 중입니다...</p>
          </div>
        )}
      </div>
    </>
  );
}
