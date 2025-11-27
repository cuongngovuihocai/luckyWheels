import React, { useState, useEffect, useMemo } from 'react';
import ConcentricWheel from './components/ConcentricWheel';
import Controls from './components/Controls';
import ResultModal from './components/ResultModal';
import { WheelItem, WheelResult, GameSettings } from './types';
import { audioService } from './services/audio';
import { deletedItemsService } from './services/deletedItems';
import { Menu, X } from 'lucide-react';

const DEFAULT_OUTER = `Nguyễn Văn A
Trần Thị B
Lê Văn C
Phạm Thị D
Hoàng Văn E
Vũ Thị F
Đặng Văn G
Bùi Thị H`;

const DEFAULT_INNER = `Hát một bài
Múa phụ họa
10 điểm
Tràng vỗ tay
Kể chuyện cười
Nhảy lò cò
Bánh snack
Bút bi`;

const DEFAULT_EXTRA = `15 giây
30 giây
45 giây
1 phút
2 phút
3 phút`;

const App: React.FC = () => {
  // Dữ liệu nhập liệu chính
  const [outerText, setOuterText] = useState(() => localStorage.getItem('lucky_outer') ?? DEFAULT_OUTER);
  const [innerText, setInnerText] = useState(() => localStorage.getItem('lucky_inner') ?? DEFAULT_INNER);
  const [extraText, setExtraText] = useState(() => localStorage.getItem('lucky_extra') ?? DEFAULT_EXTRA);
  
  // State chỉ dùng để theo dõi UI (có hiển thị nút Khôi phục hay không)
  // Dữ liệu thực tế nằm trong deletedItemsService
  const [deletedOuter, setDeletedOuter] = useState<string[]>(() => deletedItemsService.getOuter());
  const [deletedInner, setDeletedInner] = useState<string[]>(() => deletedItemsService.getInner());
  
  // Parsed items
  const outerItems: WheelItem[] = useMemo(() => 
    outerText.split('\n').map(t => t.trim()).filter(Boolean).map(t => ({ id: t, text: t })), 
  [outerText]);
  
  const innerItems: WheelItem[] = useMemo(() => 
    innerText.split('\n').map(t => t.trim()).filter(Boolean).map(t => ({ id: t, text: t })), 
  [innerText]);

  const extraItems: WheelItem[] = useMemo(() => 
    extraText.split('\n').map(t => t.trim()).filter(Boolean).map(t => ({ id: t, text: t })), 
  [extraText]);

  // State
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelResult | null>(null);
  
  // Cài đặt
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('lucky_settings');
    const defaults = { removeWinner: false, removeQuestion: false, enableThirdWheel: false, soundEnabled: true };
    if (saved) {
      try { return { ...defaults, ...JSON.parse(saved) }; } catch (e) { return defaults; }
    }
    return defaults;
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Lưu dữ liệu nhập liệu khi thay đổi
  useEffect(() => { localStorage.setItem('lucky_outer', outerText); }, [outerText]);
  useEffect(() => { localStorage.setItem('lucky_inner', innerText); }, [innerText]);
  useEffect(() => { localStorage.setItem('lucky_extra', extraText); }, [extraText]);
  useEffect(() => { 
    localStorage.setItem('lucky_settings', JSON.stringify(settings)); 
    audioService.setEnabled(settings.soundEnabled);
  }, [settings]);

  // --- LOGIC XỬ LÝ KẾT QUẢ ---
  const handleSpinEnd = (res: { outer: WheelItem; inner: WheelItem; extra?: WheelItem }) => {
    setResult({ 
        outer: res.outer.text, 
        inner: res.inner.text,
        extra: res.extra?.text
    });
  };

  const handleCloseModal = () => {
    if (result) {
      // 1. Xóa tên học sinh (Vòng Ngoài)
      if (settings.removeWinner) {
        // Cập nhật text hiển thị (UI chính)
        const newOuterText = outerItems
          .filter(item => item.text !== result.outer)
          .map(item => item.text)
          .join('\n');
        setOuterText(newOuterText);

        // LƯU VÀO KHO (Service)
        const updatedList = deletedItemsService.addOuter(result.outer);
        setDeletedOuter(updatedList); // Cập nhật UI nút bấm
      }

      // 2. Xóa câu hỏi (Vòng Trong)
      if (settings.removeQuestion) {
        const newInnerText = innerItems
          .filter(item => item.text !== result.inner)
          .map(item => item.text)
          .join('\n');
        setInnerText(newInnerText);

        // LƯU VÀO KHO (Service)
        const updatedList = deletedItemsService.addInner(result.inner);
        setDeletedInner(updatedList);
      }
    }
    setResult(null);
  };

  // --- LOGIC KHÔI PHỤC / RESET ---
  const handleReset = () => {
    // A. Chế độ KHÔI PHỤC
    const itemsToRestoreOuter = deletedItemsService.getOuter();
    const itemsToRestoreInner = deletedItemsService.getInner();
    const hasItems = itemsToRestoreOuter.length > 0 || itemsToRestoreInner.length > 0;

    if (hasItems) {
        if (window.confirm(`Bạn có muốn khôi phục ${itemsToRestoreOuter.length + itemsToRestoreInner.length} mục đã bị xóa?`)) {
            
            if (itemsToRestoreOuter.length > 0) {
                setOuterText(prev => {
                    const current = prev.trim();
                    // Nối danh sách hiện tại + danh sách từ kho
                    return current ? current + '\n' + itemsToRestoreOuter.join('\n') : itemsToRestoreOuter.join('\n');
                });
                deletedItemsService.clearOuter(); // Xóa kho
                setDeletedOuter([]); // Reset UI
            }

            if (itemsToRestoreInner.length > 0) {
                setInnerText(prev => {
                    const current = prev.trim();
                    return current ? current + '\n' + itemsToRestoreInner.join('\n') : itemsToRestoreInner.join('\n');
                });
                deletedItemsService.clearInner();
                setDeletedInner([]);
            }
            alert("Đã khôi phục thành công!");
        }
        return;
    }

    // B. Chế độ RESET MẶC ĐỊNH
    if(window.confirm("Bạn có chắc muốn XÓA HẾT và quay về dữ liệu mẫu ban đầu?")) {
        setOuterText(DEFAULT_OUTER);
        setInnerText(DEFAULT_INNER);
        setExtraText(DEFAULT_EXTRA);
        
        deletedItemsService.clearAll();
        setDeletedOuter([]);
        setDeletedInner([]);
    }
  };

  const hasDeletedItems = deletedOuter.length > 0 || deletedInner.length > 0;

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center">
      <div className="md:hidden p-4 flex justify-between items-center bg-white/90 backdrop-blur-sm shadow-md z-40">
        <h1 className="font-extrabold text-xl text-indigo-700">Vòng Quay Kép</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md bg-indigo-100 text-indigo-700">
            {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className={`
        fixed md:relative z-40 inset-y-0 left-0 w-[350px] transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Controls
          outerText={outerText}
          setOuterText={setOuterText}
          innerText={innerText}
          setInnerText={setInnerText}
          extraText={extraText}
          setExtraText={setExtraText}
          settings={settings}
          setSettings={setSettings}
          onReset={handleReset}
          hasDeletedItems={hasDeletedItems}
        />
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <main className="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-white/30 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
        <div className="w-full max-w-[90vh] aspect-square relative animate-fade-in-up">
          <ConcentricWheel
            outerItems={outerItems}
            innerItems={innerItems}
            extraItems={extraItems}
            showExtraWheel={settings.enableThirdWheel}
            onSpinEnd={handleSpinEnd}
            isSpinning={isSpinning}
            setIsSpinning={setIsSpinning}
          />
        </div>
      </main>

      <ResultModal result={result} onClose={handleCloseModal} />
      
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;