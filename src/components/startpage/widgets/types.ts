export type WidgetType = 'clock' | 'notes' | 'todo' | 'pomodoro' | 'timer' | 'kanban' | 'weather' | 'ambient' | 'custom';
export type WidgetInstance = {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
};