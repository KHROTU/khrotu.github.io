import type { WidgetInstance, WidgetType } from '../widgets/types';
import { WIDGET_DEFAULTS, WIDGET_TYPES } from '../widgets/useWidgets';
import Section from './Section';
import { fieldLabel, ghostBtn, linkBtn } from './typography';
type Props = { openIds: Set<string>; toggle: (id: string) => void; onAddWidget?: (type: WidgetType) => void; widgets?: WidgetInstance[]; onRemoveWidget?: (id: string) => void; onEnterWidgetEdit?: () => void; onClose: () => void; onClearWidgets?: () => void };
export default function WidgetsSection({ openIds, toggle, onAddWidget, widgets, onRemoveWidget, onEnterWidgetEdit, onClose, onClearWidgets }: Props) {
  return (
    <Section id="widgets" title="widgets" openIds={openIds} toggle={toggle}>
      <div className="flex flex-wrap gap-2">
        {[...WIDGET_TYPES].sort((a, b) => WIDGET_DEFAULTS[a].label.localeCompare(WIDGET_DEFAULTS[b].label)).map((type) => (
          <button key={type} onClick={() => { onAddWidget?.(type); onEnterWidgetEdit?.(); }} className={ghostBtn}>{WIDGET_DEFAULTS[type].label}</button>
        ))}
      </div>
      {(widgets?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <span className={fieldLabel}>placed ({widgets!.length})</span>
          <div className="flex flex-col gap-2 max-h-56 overflow-auto border border-white/10 rounded-sm p-2">
            {widgets!.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-[var(--text-muted)]">{WIDGET_DEFAULTS[widget.type]?.label ?? widget.type}</span>
                <button onClick={() => onRemoveWidget?.(widget.id)} aria-label={`remove ${widget.type}`} className={linkBtn}>remove</button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => { onClose(); onEnterWidgetEdit?.(); }} className={ghostBtn}>edit</button>
            <button onClick={onClearWidgets} className={ghostBtn}>remove all</button>
          </div>
        </div>
      )}
    </Section>
  );
}