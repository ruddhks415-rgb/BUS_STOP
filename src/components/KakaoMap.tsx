"use client";

import Script from "next/script";
import { useEffect, useState, useRef } from "react";
import { STOPS } from "@/lib/mockData";
import { getReports, addEmpathy, Report } from "@/lib/reportStore";

export default function KakaoMap() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).kakao && (window as any).kakao.maps) {
      setMapLoaded(true);
    }
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const data = await getReports();
    setReports(data.filter(r => r.type === "bus"));
  };

  useEffect(() => {
    if (mapLoaded && window.kakao && window.kakao.maps && !mapInstance) {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        if (!container) return;

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(35.176461, 126.907085),
          level: 4,
        });
        
        setMapInstance(map);

        window.kakao.maps.event.addListener(map, 'click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
            infoWindowRef.current = null;
          }
        });

        // Arrival Info Global Function
        (window as any).showArrivalInfo = async (stopId: string, stopName: string) => {
          try {
            console.log(`[데이터 요청 중] ${stopName}...`);
            const res = await fetch(`/api/bus?stop_id=${stopId}`);
            const json = await res.json();
            
            if (json.error) {
              alert(`[오류 발생]\n사유: ${json.error}`);
              return;
            }
            if (!json.data || json.data.length === 0) {
              alert(`[도착 정보 없음] 현재 ${stopName} 정류장에 도착 예정인 버스가 없습니다.`);
              return;
            }

            let msg = `🚌 [실시간 도착 정보] ${stopName} 🚌\n\n`;
            json.data.forEach((bus: any) => {
              msg += `▶ ${bus.lineName}번 버스: ${bus.remainMin}분 후 도착 예정\n`;
            });
            alert(msg);
          } catch (e) {
            alert('네트워크 오류가 발생했습니다.');
          }
        };

        // Empathy Global Function
        (window as any).handleEmpathy = async (reportId: string) => {
          await addEmpathy(reportId);
          fetchReports(); // Refresh markers
        };
      });
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (!mapInstance || !window.kakao) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    STOPS.forEach((stop) => {
      // Find reports for this stop
      const stopReports = reports.filter(r => r.stopId === stop.id);
      
      // Check active issues
      const hasActiveIssues = stopReports.some(r => r.status === "접수됨" || r.status === "검토중");
      
      // Get recent reports for infowindow (up to 2)
      const recentReports = [...stopReports].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 2);

      const position = new window.kakao.maps.LatLng(stop.lat, stop.lng);
      
      // Use different marker image if active issues exist
      let markerImage = undefined;
      if (hasActiveIssues) {
        // Create red marker
        const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 
        const imageSize = new window.kakao.maps.Size(24, 35); 
        markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
      }

      const marker = new window.kakao.maps.Marker({
        position: position,
        map: mapInstance,
        image: markerImage,
      });

      markersRef.current.push(marker);

      // Build InfoWindow Content
      let reportsHtml = '';
      if (recentReports.length > 0) {
        reportsHtml = `<div style="margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          <div style="font-size: 12px; font-weight: bold; color: #475569; margin-bottom: 5px;">최근 제보 현황</div>
          ${recentReports.map(r => `
            <div style="background-color: #f8fafc; padding: 6px; border-radius: 4px; margin-bottom: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background-color: ${
                  r.status === "해결됨" ? "#dcfce7" : r.status === "검토중" ? "#ffedd5" : "#fee2e2"
                }; color: ${
                  r.status === "해결됨" ? "#166534" : r.status === "검토중" ? "#9a3412" : "#991b1b"
                };">${r.status}</span>
                <button onclick="window.handleEmpathy('${r.id}')" style="font-size: 11px; display: flex; align-items: center; gap: 2px; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 6px; cursor: pointer; background: white;">
                  ❤️ ${r.empathyCount}
                </button>
              </div>
              <div style="font-size: 12px; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${r.issueType}</div>
            </div>
          `).join('')}
        </div>`;
      } else {
        reportsHtml = `<div style="margin-top: 10px; font-size: 12px; color: #94a3b8; text-align: center;">현재 진행 중인 민원이 없습니다.</div>`;
      }

      const content = `
        <div style="padding:15px; font-size:14px; min-width: 220px; color: #333; font-family: sans-serif;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${stop.name} <span style="font-size:12px; color:gray;">(${stop.id})</span></div>
          <div style="margin-bottom: 10px; font-size: 13px; color: #007a33; font-weight: 500;">누적 제보: ${stopReports.length}건</div>
          <div style="display: flex; gap: 8px; flex-direction: column;">
            <button onclick="window.showArrivalInfo('${stop.id}', '${stop.name}')" style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; width: 100%; transition: background-color 0.2s;">실시간 도착정보 보기</button>
            <a href="/bus/report?stop_id=${stop.id}" style="background-color: #2563eb; color: white; text-align: center; text-decoration: none; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; width: 100%; display: inline-block; box-sizing: border-box;">제보하기</a>
          </div>
          ${reportsHtml}
        </div>
      `;

      const infowindow = new window.kakao.maps.InfoWindow({ content });

      window.kakao.maps.event.addListener(marker, "click", () => {
        if (infoWindowRef.current === infowindow) {
          infowindow.close();
          infoWindowRef.current = null;
          return;
        }
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        infowindow.open(mapInstance, marker);
        infoWindowRef.current = infowindow;
      });
    });
  }, [reports, mapInstance]);

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setMapLoaded(true)}
      />
      <div id="map" className="w-full h-full min-h-[500px] bg-gray-200 relative z-0">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="text-gray-500 font-medium animate-pulse">카카오지도를 불러오는 중입니다...</p>
          </div>
        )}
      </div>
    </>
  );
}
