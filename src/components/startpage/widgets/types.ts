export type WidgetType =
  | 'clock' | 'notes' | 'todo' | 'pomodoro' | 'timer' | 'kanban' | 'weather' | 'ambient' | 'custom'
  | 'wheel' | 'matrix'
  | 'worldclocks' | 'calendar' | 'countdown' | 'stopwatch'
  | 'github'
  | 'wordle' | 'art' | 'currency' | 'quotes' | 'dice'
  | 'converter' | 'textutils' | 'lorem'
  | 'stats' | 'image';
export type WidgetInstance = {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
};