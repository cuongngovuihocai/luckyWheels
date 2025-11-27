import React, { useEffect } from 'react';
import { WheelResult } from '../types';
import { audioService } from '../services/audio';

interface ResultModalProps {
  result: WheelResult | null;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  useEffect(() => {
    if (result) {
      audioService.playWin();
    }
  }, [result]);

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-[90%] shadow-2xl text-center transform transition-all scale-100 animate-bounce-in border-4 border-indigo-500 relative overflow-hidden">
        
        {/* Confetti/Light effect background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 via-white to-pink-50 -z-10"></div>
        
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-6 uppercase tracking-wide">
          Kết Quả
        </h2>
        
        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-blue-500 font-bold uppercase mb-1">Người may mắn</p>
            <p className="text-2xl md:text-3xl font-black text-blue-700 break-words">{result.outer}</p>
          </div>
          
          <div className="text-xl text-gray-300 font-bold leading-none">+</div>
          
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
            <p className="text-xs text-orange-500 font-bold uppercase mb-1">Nhận được</p>
            <p className="text-2xl md:text-3xl font-black text-orange-600 break-words">{result.inner}</p>
          </div>

          {result.extra && (
            <>
                <div className="text-xl text-gray-300 font-bold leading-none">+</div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 animate-fade-in-up">
                    <p className="text-xs text-emerald-500 font-bold uppercase mb-1">Thời gian</p>
                    <p className="text-2xl md:text-3xl font-black text-emerald-600 break-words">{result.extra}</p>
                </div>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
        >
          Tiếp Tục
        </button>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ResultModal;