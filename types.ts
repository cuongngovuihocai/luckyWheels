export interface WheelItem {
  id: string;
  text: string;
}

export interface GameSettings {
  removeWinner: boolean;
  removeQuestion: boolean;
  enableThirdWheel: boolean; // Mới: Bật tắt vòng thứ 3
  soundEnabled: boolean;
}

export interface WheelResult {
  outer: string;
  inner: string;
  extra?: string; // Mới: Kết quả vòng thứ 3
}