import { memo } from 'react'
import './EventBar.css'

const EVENT_PADDING_TOP = 4
const EVENT_HEIGHT_INNER = 24

function EventBar({ event, left, width, rowHeight, isDragging, onMoveStart, onResizeStart, onDoubleClick }) {
  return (
    <div
      className={`event-bar ${isDragging ? 'dragging' : ''}`}
      style={{
        left: left + 1,
        width: width - 2,
        top: EVENT_PADDING_TOP + (rowHeight - EVENT_HEIGHT_INNER) / 2 - EVENT_PADDING_TOP,
        height: EVENT_HEIGHT_INNER,
        backgroundColor: event.color.bg,
        color: event.color.text,
      }}
      onMouseDown={onMoveStart}
      onDoubleClick={onDoubleClick}
      title={event.title || 'Untitled event'}
    >
      {/* Left resize handle */}
      <div
        className="resize-handle resize-handle-left"
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart('start', e)
        }}
      />

      {/* Event title */}
      <span className="event-title">
        {event.title || 'New event'}
      </span>

      {/* Right resize handle */}
      <div
        className="resize-handle resize-handle-right"
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart('end', e)
        }}
      />
    </div>
  )
}

export default memo(EventBar)
