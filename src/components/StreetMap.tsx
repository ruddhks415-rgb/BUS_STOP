"use client";

import Script from "next/script";
import { useEffect, useState, useRef } from "react";
import { getReports, addEmpathy, Report } from "@/lib/reportStore";
import { useRouter } from "next/navigation";

export default function StreetMap() {
  const router = useRouter();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const tempMarkerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).kakao && (window as any).kakao.maps) {
      setMapLoaded(true);
    }
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const data = await getReports();
    setReports(data.filter(r => r.type === "street"));
  };

  useEffect(() => {
    if (mapLoaded && window.kakao && window.kakao.maps && !mapInstance) {
      window.kakao.maps.load(() => {
        const container = document.getElementById("street-map");
        if (!container) return;

        // Initialize Geocoder
        if (window.kakao.maps.services && window.kakao.maps.services.Geocoder) {
          geocoderRef.current = new window.kakao.maps.services.Geocoder();
        }

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(35.176461, 126.907085),
          level: 4,
          mapTypeId: window.kakao.maps.MapTypeId.HYBRID // 위성(스카이뷰) + 지명 표기
        });

        setMapInstance(map);

        // Map Click Event for creating a new report
        window.kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
            infoWindowRef.current = null;
          }
          
          const latlng = mouseEvent.latLng;
          const lat = latlng.getLat();
          const lng = latlng.getLng();

          // Remove previous temporary marker if exists
          if (tempMarkerRef.current) {
            tempMarkerRef.current.setMap(null);
          }

          // Search address from coords
          let address = `알 수 없는 위치`;
          if (geocoderRef.current) {
            geocoderRef.current.coord2Address(lng, lat, (result: any, status: any) => {
              if (status === window.kakao.maps.services.Status.OK) {
                address = result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;
              }
              showTempMarker(map, lat, lng, address);
            });
          } else {
             showTempMarker(map, lat, lng, address);
          }
        });

        (window as any).handleStreetEmpathy = async (reportId: string) => {
          await addEmpathy(reportId);
          fetchReports(); // Refresh markers
        };
      });
    }
  }, [mapLoaded]);

  const showTempMarker = (map: any, lat: number, lng: number, address: string) => {
    const position = new window.kakao.maps.LatLng(lat, lng);
    
    // Create a temporary marker (maybe different color/style)
    const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 
    const imageSize = new window.kakao.maps.Size(24, 35); 
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

    const marker = new window.kakao.maps.Marker({
      position: position,
      map: map,
      image: markerImage,
    });

    tempMarkerRef.current = marker;

    const content = `
      <div style="padding:15px; font-size:14px; min-width: 200px; color: #333; font-family: sans-serif;">
        <div style="font-weight: bold; font-size: 15px; margin-bottom: 5px;">선택한 위치</div>
        <div style="margin-bottom: 10px; font-size: 12px; color: #666;">${address}</div>
        <div style="display: flex; gap: 8px; flex-direction: column;">
          <a href="/street/report?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}" style="background-color: #ef4444; color: white; text-align: center; text-decoration: none; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; width: 100%; display: inline-block; box-sizing: border-box;">이 위치 제보하기</a>
        </div>
      </div>
    `;

    const infowindow = new window.kakao.maps.InfoWindow({ content, removable: true });
    infowindow.open(map, marker);
    infoWindowRef.current = infowindow;
    
    window.kakao.maps.event.addListener(marker, "click", () => {
       if (infoWindowRef.current === infowindow) {
         infowindow.close();
         infoWindowRef.current = null;
         return;
       }
       if (infoWindowRef.current) {
         infoWindowRef.current.close();
       }
       infowindow.open(map, marker);
       infoWindowRef.current = infowindow;
    });
  };

  // Render existing reports
  useEffect(() => {
    if (!mapInstance || !window.kakao) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Group reports by coordinate (roughly) to prevent exact overlap if needed, 
    // but for now just render them individually since they are user-clicked coordinates.
    reports.forEach((report) => {
      const position = new window.kakao.maps.LatLng(report.lat, report.lng);
      
      const marker = new window.kakao.maps.Marker({
        position: position,
        map: mapInstance,
      });

      markersRef.current.push(marker);

      const reportsHtml = `
        <div style="background-color: #f8fafc; padding: 6px; border-radius: 4px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background-color: ${
              report.status === "해결됨" ? "#dcfce7" : report.status === "검토중" ? "#ffedd5" : "#fee2e2"
            }; color: ${
              report.status === "해결됨" ? "#166534" : report.status === "검토중" ? "#9a3412" : "#991b1b"
            };">${report.status}</span>
            <button onclick="window.handleStreetEmpathy('${report.id}')" style="font-size: 11px; display: flex; align-items: center; gap: 2px; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 6px; cursor: pointer; background: white;">
              ❤️ ${report.empathyCount}
            </button>
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #334155;">${report.issueType}</div>
          ${report.description ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px; max-height: 40px; overflow: hidden; text-overflow: ellipsis;">${report.description}</div>` : ''}
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">${new Date(report.date).toLocaleDateString()}</div>
        </div>
      `;

      const content = `
        <div style="padding:15px; font-size:14px; min-width: 220px; color: #333; font-family: sans-serif;">
          <div style="font-weight: bold; font-size: 15px; margin-bottom: 2px;">${report.stopName || '길거리 민원'}</div>
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
        if (tempMarkerRef.current) {
           tempMarkerRef.current.setMap(null);
           tempMarkerRef.current = null;
        }
        infowindow.open(mapInstance, marker);
        infoWindowRef.current = infowindow;
      });
    });
  }, [reports, mapInstance]);

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setMapLoaded(true)}
      />
      <div id="street-map" className="w-full h-full min-h-[500px] bg-gray-200 relative z-0">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="text-gray-500 font-medium animate-pulse">카카오지도를 불러오는 중입니다...</p>
          </div>
        )}
      </div>
    </>
  );
}
