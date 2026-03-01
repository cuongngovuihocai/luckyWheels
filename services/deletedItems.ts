const KEYS = {
  OUTER: 'lucky_deleted_outer',
  INNER: 'lucky_deleted_inner',
  EXTRA: 'lucky_deleted_extra'
};

// Hàm hỗ trợ đọc/ghi LocalStorage an toàn
const getStorage = (key: string): string[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStorage = (key: string, items: string[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

export const deletedItemsService = {
  // --- VÒNG NGOÀI (HỌC SINH) ---
  
  // Lấy toàn bộ danh sách đã xóa
  getOuter: (): string[] => getStorage(KEYS.OUTER),

  // Thêm một mục mới vào danh sách đã xóa và trả về danh sách mới nhất
  addOuter: (item: string) => {
    const current = getStorage(KEYS.OUTER);
    const updated = [...current, item];
    setStorage(KEYS.OUTER, updated);
    return updated;
  },

  // Xóa sạch danh sách lưu trữ
  clearOuter: () => {
    localStorage.removeItem(KEYS.OUTER);
  },

  // --- VÒNG TRONG (CÂU HỎI) ---

  getInner: (): string[] => getStorage(KEYS.INNER),

  addInner: (item: string) => {
    const current = getStorage(KEYS.INNER);
    const updated = [...current, item];
    setStorage(KEYS.INNER, updated);
    return updated;
  },

  clearInner: () => {
    localStorage.removeItem(KEYS.INNER);
  },

  // --- VÒNG THỨ 3 (THỜI GIAN) ---

  getExtra: (): string[] => getStorage(KEYS.EXTRA),

  addExtra: (item: string) => {
    const current = getStorage(KEYS.EXTRA);
    const updated = [...current, item];
    setStorage(KEYS.EXTRA, updated);
    return updated;
  },

  clearExtra: () => {
    localStorage.removeItem(KEYS.EXTRA);
  },

  // --- TIỆN ÍCH ---
  clearAll: () => {
    localStorage.removeItem(KEYS.OUTER);
    localStorage.removeItem(KEYS.INNER);
    localStorage.removeItem(KEYS.EXTRA);
  }
};