import { useState } from 'react'
import { EVENT_COLORS } from '../utils/eventColors'
import './EventModal.css'

function EventModal({ event, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(event.title || '')
  const [startDate, setStartDate] = useState(event.startDate)
  const [endDate, setEndDate] = useState(event.endDate)
  const [colorIdx, setColorIdx] = useState(
    EVENT_COLORS.findIndex(c => c.bg === event.color.bg)
  )

  const handleSave = () => {
    if (startDate > endDate) return
    onSave({
      ...event,
      title: title.trim() || 'Untitled',
      startDate,
      endDate,
      color: EVENT_COLORS[colorIdx >= 0 ? colorIdx : 0],
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <h2 className="modal-title">
          {event.title ? 'Edit Event' : 'New Event'}
        </h2>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Event title"
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Color</label>
          <div className="color-picker">
            {EVENT_COLORS.map((color, i) => (
              <button
                key={i}
                className={`color-swatch ${i === colorIdx ? 'selected' : ''}`}
                style={{ backgroundColor: color.bg }}
                onClick={() => setColorIdx(i)}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-delete" onClick={() => onDelete(event.id)}>
            Delete
          </button>
          <div className="modal-actions-right">
            <button className="btn btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-save" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventModal
