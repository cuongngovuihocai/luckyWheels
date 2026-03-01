import React from 'react';
import { GameSettings } from '../types';
import { Volume2, VolumeX, RotateCcw, Settings, Undo2, Clock } from 'lucide-react';

interface ControlsProps {
  outerText: string;
  setOuterText: (val: string) => void;
  innerText: string;
  setInnerText: (val: string) => void;
  extraText?: string;
  setExtraText?: (val: string) => void;
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  onReset: () => void;
  hasDeletedItems?: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  outerText,
  setOuterText,
  innerText,
  setInnerText,
  extraText = "",
  setExtraText,
  settings,
  setSettings,
  onReset,
  hasDeletedItems = false,
}) => {
  
  const toggleSound = () => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
    // Also update audio service immediately
    import('../services/audio').then(({ audioService }) => {
      audioService.setEnabled(!settings.soundEnabled);
    });
  };

  const toggleRemoveWinner = () => {
    setSettings(prev => ({ ...prev, removeWinner: !prev.removeWinner }));
  };

  const toggleRemoveQuestion = () => {
    setSettings(prev => ({ ...prev, removeQuestion: !prev.removeQuestion }));
  };

  const toggleRemoveExtra = () => {
    setSettings(prev => ({ ...prev, removeExtra: !prev.removeExtra }));
  };

  const toggleThirdWheel = () => {
    setSettings(prev => ({ ...prev, enableThirdWheel: !prev.enableThirdWheel }));
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-xl rounded-r-none md:rounded-r-3xl p-6 border-l border-gray-100 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
            <img 
                src="https://lh3.googleusercontent.com/d/1oTxhowzJvB_4EvS_mNOD-EWYtdYmptBw" 
                alt="Logo" 
                className="max-w-[150px] h-auto object-contain"
                referrerPolicy="no-referrer"
            />
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={toggleSound}
                className={`p-2 rounded-lg transition-colors ${settings.soundEnabled ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                title="Bật/Tắt âm thanh"
            >
                {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {/* Toggle 3rd Wheel */}
        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <label className="flex items-center cursor-pointer gap-3 justify-between w-full">
                <span className="text-sm font-bold text-emerald-800 select-none flex items-center gap-2">
                    <Clock size={16} />
                    Vòng 3: Thời gian
                </span>
                <div className="relative">
                    <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={settings.enableThirdWheel}
                        onChange={toggleThirdWheel}
                    />
                    <div className={`w-10 h-6 bg-gray-200 rounded-full shadow-inner transition-colors ${settings.enableThirdWheel ? 'bg-emerald-500' : ''}`}></div>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${settings.enableThirdWheel ? 'translate-x-4' : ''}`}></div>
                </div>
            </label>
        </div>

        {/* Outer Input */}
        <div className="flex flex-col h-[20%]">
          <label className="text-sm font-bold text-blue-600 uppercase mb-2 flex items-center justify-between">
            Danh sách Học Sinh
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{outerText.trim().split('\n').filter(Boolean).length} mục</span>
          </label>
          <textarea
            className="flex-1 w-full p-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none text-sm bg-blue-50/30"
            placeholder="Nhập tên học sinh..."
            value={outerText}
            onChange={(e) => setOuterText(e.target.value)}
          />
        </div>

        {/* Inner Input */}
        <div className="flex flex-col h-[20%]">
            <label className="text-sm font-bold text-orange-600 uppercase mb-2 flex items-center justify-between">
            Danh sách Câu hỏi/Quà
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{innerText.trim().split('\n').filter(Boolean).length} mục</span>
            </label>
          <textarea
            className="flex-1 w-full p-3 rounded-xl border-2 border-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none resize-none text-sm bg-orange-50/30"
            placeholder="Nhập câu hỏi/vật phẩm..."
            value={innerText}
            onChange={(e) => setInnerText(e.target.value)}
          />
        </div>

        {/* Extra Input (Conditioned by settings but always rendered for layout stability, maybe hidden visually if needed, but let's keep it visible if toggle is ON) */}
        {settings.enableThirdWheel && setExtraText && (
            <div className="flex flex-col h-[20%] animate-fade-in">
                <label className="text-sm font-bold text-emerald-600 uppercase mb-2 flex items-center justify-between">
                Danh sách Thời gian
                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{extraText.trim().split('\n').filter(Boolean).length} mục</span>
                </label>
            <textarea
                className="flex-1 w-full p-3 rounded-xl border-2 border-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none text-sm bg-emerald-50/30"
                placeholder="Nhập thời gian..."
                value={extraText}
                onChange={(e) => setExtraText(e.target.value)}
            />
            </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-lg border border-gray-100">
                <input type="checkbox" checked={settings.removeWinner} onChange={toggleRemoveWinner} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-xs font-bold text-gray-600">Xóa tên</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-lg border border-gray-100">
                <input type="checkbox" checked={settings.removeQuestion} onChange={toggleRemoveQuestion} className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" />
                <span className="text-xs font-bold text-gray-600">Xóa quà</span>
            </label>
            {settings.enableThirdWheel && (
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-lg border border-gray-100 col-span-2">
                    <input type="checkbox" checked={settings.removeExtra} onChange={toggleRemoveExtra} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                    <span className="text-xs font-bold text-gray-600">Xóa thời gian</span>
                </label>
            )}
        </div>
      </div>

      {/* Dynamic Reset/Restore Button */}
      <button
        onClick={onReset}
        className={`w-full mt-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group border ${
            hasDeletedItems 
                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
        }`}
      >
        {hasDeletedItems ? (
            <>
                <Undo2 size={20} className="group-hover:-rotate-12 transition-transform" />
                Khôi phục danh sách
            </>
        ) : (
            <>
                <RotateCcw size={20} className="group-hover:-rotate-180 transition-transform duration-500" />
                Đặt lại mặc định
            </>
        )}
      </button>
    </div>
  );
};

export default Controls;