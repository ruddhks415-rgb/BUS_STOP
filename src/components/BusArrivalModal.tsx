import { X, Bus, Loader2, AlertCircle } from "lucide-react";

export interface BusArrivalInfo {
  lineName: string;
  remainMin: string;
  busStopName: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stopName: string;
  loading: boolean;
  data: BusArrivalInfo[];
  error: string | null;
}

export default function BusArrivalModal({ isOpen, onClose, stopName, loading, data, error }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-jnu-green text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bus size={20} />
            <h3 className="font-bold text-lg">{stopName} 도착 정보</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto bg-gray-50">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-jnu-green">
              <Loader2 size={32} className="animate-spin" />
              <p className="font-semibold text-gray-600 text-sm">실시간 정보를 불러오는 중입니다...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center text-center gap-3 py-6">
              <AlertCircle size={40} className="text-red-500" />
              <p className="text-gray-700 font-bold">정보를 불러올 수 없습니다</p>
              <p className="text-sm text-gray-500 break-words w-full">{error}</p>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="flex flex-col items-center text-center gap-3 py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <Bus size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-700 font-bold">도착 예정인 버스가 없습니다</p>
              <p className="text-sm text-gray-500">막차 시간이 지났거나<br/>현재 운행 중인 버스가 없습니다.</p>
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <div className="flex flex-col gap-3">
              {data.map((bus, i) => (
                <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="bg-green-100 text-green-700 font-extrabold px-3 py-1.5 rounded-lg text-sm border border-green-200">
                      {bus.lineName}
                    </span>
                    <span className="font-bold text-lg text-red-500">
                      {bus.remainMin}분 후
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>현재 위치:</span>
                    <span className="font-medium text-gray-700 truncate ml-2 max-w-[180px]">{bus.busStopName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition shadow-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
