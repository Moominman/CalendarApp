import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import {
  MONTH_ABBREVS,
  DAY_ABBREVS,
  getYearGrid,
  getYearColumns,
  dateToColumn,
  columnToDate,
  formatDateStr,
  parseDateStr,
  addDays,
  daysInMonth,
} from '../utils/dateUtils'
import { getNextColor, EVENT_COLORS } from '../utils/eventColors'
import EventBar from './EventBar'
import EventModal from './EventModal'
import MonthRow from './MonthRow'
import './AnnualPlanner.css'

const CELL_WIDTH = 26
const ROW_HEIGHT = 44
const HEADER_HEIGHT = 50

const SAMPLE_EVENTS = [
  { id: 'sample-1', title: 'New Year Break', startDate: '2026-01-01', endDate: '2026-01-04', color: EVENT_COLORS[0] },
  { id: 'sample-2', title: 'Project Alpha', startDate: '2026-01-19', endDate: '2026-01-30', color: EVENT_COLORS[1] },
  { id: 'sample-3', title: 'Team Retreat', startDate: '2026-02-16', endDate: '2026-02-20', color: EVENT_COLORS[2] },
  { id: 'sample-4', title: 'Conference', startDate: '2026-03-09', endDate: '2026-03-13', color: EVENT_COLORS[4] },
  { id: 'sample-5', title: 'Spring Break', startDate: '2026-04-06', endDate: '2026-04-17', color: EVENT_COLORS[5] },
  { id: 'sample-6', title: 'Product Launch', startDate: '2026-05-04', endDate: '2026-05-08', color: EVENT_COLORS[3] },
  { id: 'sample-7', title: 'Summer Holiday', startDate: '2026-07-20', endDate: '2026-08-07', color: EVENT_COLORS[6] },
  { id: 'sample-8', title: 'Q3 Planning', startDate: '2026-09-01', endDate: '2026-09-05', color: EVENT_COLORS[7] },
  { id: 'sample-9', title: 'Hackathon', startDate: '2026-10-12', endDate: '2026-10-16', color: EVENT_COLORS[8] },
  { id: 'sample-10', title: 'Holiday Season', startDate: '2026-12-21', endDate: '2026-12-31', color: EVENT_COLORS[9] },
]

function AnnualPlanner() {
  const [year, setYear] = useState(2026)
  const [events, setEvents] = useState(SAMPLE_EVENTS)
  const [dragState, setDragState] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [todayMarker, setTodayMarker] = useState(null)
  const gridRef = useRef(null)
  const scrollContainerRef = useRef(null)

  const yearGrid = useMemo(() => getYearGrid(year), [year])
  const { totalWeeks, startOffset } = useMemo(() => getYearColumns(year), [year])
  const totalColumns = totalWeeks * 7

  // Calculate today's column position
  useEffect(() => {
    const today = new Date()
    if (today.getFullYear() === year) {
      const col = dateToColumn(year, today.getMonth(), today.getDate(), startOffset)
      setTodayMarker(col)
    } else {
      setTodayMarker(null)
    }
  }, [year, startOffset])

  // Scroll to today or to start of year on year change
  useEffect(() => {
    if (scrollContainerRef.current) {
      if (todayMarker !== null) {
        const scrollX = Math.max(0, todayMarker * CELL_WIDTH - scrollContainerRef.current.clientWidth / 2)
        scrollContainerRef.current.scrollLeft = scrollX
      } else {
        scrollContainerRef.current.scrollLeft = 0
      }
    }
  }, [todayMarker, year])

  // Build week headers for the column header row
  const weekHeaders = useMemo(() => {
    const headers = []
    for (let w = 0; w < totalWeeks; w++) {
      const mondayCol = w * 7
      headers.push({ week: w, col: mondayCol })
    }
    return headers
  }, [totalWeeks])

  // Get cell coordinates from a mouse event
  const getCellFromMouse = useCallback((e) => {
    if (!gridRef.current) return null
    const rect = gridRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const col = Math.floor(x / CELL_WIDTH)
    const row = Math.floor(y / ROW_HEIGHT)
    if (col < 0 || col >= totalColumns || row < 0 || row >= 12) return null
    return { col, row }
  }, [totalColumns])

  // Mouse down on grid: start creating an event
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    if (e.target.closest('.event-bar')) return

    const cell = getCellFromMouse(e)
    if (!cell) return

    const dateInfo = columnToDate(year, cell.col, startOffset)
    if (!dateInfo || dateInfo.month !== cell.row) return

    setDragState({
      type: 'create',
      startCol: cell.col,
      startRow: cell.row,
      currentCol: cell.col,
      currentRow: cell.row,
      anchorDateStr: dateInfo.dateStr,
    })

    e.preventDefault()
  }, [getCellFromMouse, year, startOffset])

  const handleMouseMove = useCallback((e) => {
    if (!dragState) return

    const cell = getCellFromMouse(e)
    if (!cell) return

    if (dragState.type === 'create') {
      setDragState(prev => ({
        ...prev,
        currentCol: cell.col,
        currentRow: prev.startRow,
      }))
    } else if (dragState.type === 'move') {
      setDragState(prev => ({
        ...prev,
        currentCol: cell.col,
        currentRow: cell.row,
      }))
    } else if (dragState.type === 'resize-start' || dragState.type === 'resize-end') {
      setDragState(prev => ({
        ...prev,
        currentCol: cell.col,
      }))
    }
  }, [dragState, getCellFromMouse])

  const handleMouseUp = useCallback(() => {
    if (!dragState) return

    if (dragState.type === 'create') {
      const minCol = Math.min(dragState.startCol, dragState.currentCol)
      const maxCol = Math.max(dragState.startCol, dragState.currentCol)

      const startDate = columnToDate(year, minCol, startOffset)
      const endDate = columnToDate(year, maxCol, startOffset)

      if (startDate && endDate) {
        const month = dragState.startRow
        const monthStart = formatDateStr(year, month, 1)
        const monthEnd = formatDateStr(year, month, daysInMonth(year, month))

        let clampedStart = startDate.dateStr
        let clampedEnd = endDate.dateStr

        if (clampedStart < monthStart) clampedStart = monthStart
        if (clampedEnd > monthEnd) clampedEnd = monthEnd

        const color = getNextColor()
        const newEvent = {
          id: Date.now().toString(),
          title: '',
          startDate: clampedStart,
          endDate: clampedEnd,
          color,
        }
        setEvents(prev => [...prev, newEvent])
        setEditingEvent(newEvent)
      }
    } else if (dragState.type === 'move') {
      const event = events.find(ev => ev.id === dragState.eventId)
      if (event) {
        const colDelta = dragState.currentCol - dragState.startCol
        if (colDelta !== 0) {
          const newStart = addDays(event.startDate, colDelta)
          const newEnd = addDays(event.endDate, colDelta)
          const ns = parseDateStr(newStart)
          const ne = parseDateStr(newEnd)
          if (ns.year === year && ne.year === year) {
            setEvents(prev => prev.map(ev =>
              ev.id === event.id
                ? { ...ev, startDate: newStart, endDate: newEnd }
                : ev
            ))
          }
        }
      }
    } else if (dragState.type === 'resize-start') {
      const event = events.find(ev => ev.id === dragState.eventId)
      if (event) {
        const newStartDate = columnToDate(year, dragState.currentCol, startOffset)
        if (newStartDate && newStartDate.dateStr <= event.endDate) {
          setEvents(prev => prev.map(ev =>
            ev.id === event.id
              ? { ...ev, startDate: newStartDate.dateStr }
              : ev
          ))
        }
      }
    } else if (dragState.type === 'resize-end') {
      const event = events.find(ev => ev.id === dragState.eventId)
      if (event) {
        const newEndDate = columnToDate(year, dragState.currentCol, startOffset)
        if (newEndDate && newEndDate.dateStr >= event.startDate) {
          setEvents(prev => prev.map(ev =>
            ev.id === event.id
              ? { ...ev, endDate: newEndDate.dateStr }
              : ev
          ))
        }
      }
    }

    setDragState(null)
  }, [dragState, events, year, startOffset])

  const handleEventMoveStart = useCallback((eventId, e) => {
    const cell = getCellFromMouse(e)
    if (!cell) return

    setDragState({
      type: 'move',
      eventId,
      startCol: cell.col,
      startRow: cell.row,
      currentCol: cell.col,
      currentRow: cell.row,
    })
    e.preventDefault()
    e.stopPropagation()
  }, [getCellFromMouse])

  const handleEventResizeStart = useCallback((eventId, edge, e) => {
    const cell = getCellFromMouse(e)
    if (!cell) return

    setDragState({
      type: edge === 'start' ? 'resize-start' : 'resize-end',
      eventId,
      startCol: cell.col,
      currentCol: cell.col,
    })
    e.preventDefault()
    e.stopPropagation()
  }, [getCellFromMouse])

  const handleEventDoubleClick = useCallback((eventId, e) => {
    const event = events.find(ev => ev.id === eventId)
    if (event) {
      setEditingEvent(event)
    }
    e.preventDefault()
    e.stopPropagation()
  }, [events])

  const handleSaveEvent = useCallback((updatedEvent) => {
    setEvents(prev => prev.map(ev =>
      ev.id === updatedEvent.id ? updatedEvent : ev
    ))
    setEditingEvent(null)
  }, [])

  const handleDeleteEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(ev => ev.id !== eventId))
    setEditingEvent(null)
  }, [])

  // Get events overlapping a given month
  const getEventsForMonth = useCallback((month) => {
    return events.filter(ev => {
      const start = parseDateStr(ev.startDate)
      const end = parseDateStr(ev.endDate)
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month, daysInMonth(year, month))
      const evStart = new Date(start.year, start.month, start.day)
      const evEnd = new Date(end.year, end.month, end.day)
      return evStart <= monthEnd && evEnd >= monthStart
    })
  }, [events, year])

  // Compute displayed event position, adjusted during drag
  const getEventPosition = useCallback((event, month) => {
    let startDateStr = event.startDate
    let endDateStr = event.endDate

    if (dragState && dragState.eventId === event.id) {
      if (dragState.type === 'move') {
        const colDelta = dragState.currentCol - dragState.startCol
        startDateStr = addDays(event.startDate, colDelta)
        endDateStr = addDays(event.endDate, colDelta)
      } else if (dragState.type === 'resize-start') {
        const newStart = columnToDate(year, dragState.currentCol, startOffset)
        if (newStart && newStart.dateStr <= event.endDate) {
          startDateStr = newStart.dateStr
        }
      } else if (dragState.type === 'resize-end') {
        const newEnd = columnToDate(year, dragState.currentCol, startOffset)
        if (newEnd && newEnd.dateStr >= event.startDate) {
          endDateStr = newEnd.dateStr
        }
      }
    }

    const start = parseDateStr(startDateStr)
    const end = parseDateStr(endDateStr)

    // Clamp to month boundaries
    const displayStart = start.month < month ? formatDateStr(year, month, 1) :
                         start.month > month ? null : startDateStr
    const displayEnd = end.month > month ? formatDateStr(year, month, daysInMonth(year, month)) :
                       end.month < month ? null : endDateStr

    if (!displayStart || !displayEnd) return null

    const ds = parseDateStr(displayStart)
    const de = parseDateStr(displayEnd)
    const startCol = dateToColumn(year, ds.month, ds.day, startOffset)
    const endCol = dateToColumn(year, de.month, de.day, startOffset)

    return {
      left: startCol * CELL_WIDTH,
      width: (endCol - startCol + 1) * CELL_WIDTH,
    }
  }, [dragState, year, startOffset])

  // Selection indicator during drag-create
  const selectionIndicator = useMemo(() => {
    if (!dragState || dragState.type !== 'create') return null

    const minCol = Math.min(dragState.startCol, dragState.currentCol)
    const maxCol = Math.max(dragState.startCol, dragState.currentCol)

    return {
      left: minCol * CELL_WIDTH,
      width: (maxCol - minCol + 1) * CELL_WIDTH,
      top: dragState.startRow * ROW_HEIGHT,
      height: ROW_HEIGHT,
    }
  }, [dragState])

  return (
    <div className="annual-planner">
      <div className="planner-toolbar">
        <button className="nav-btn" onClick={() => setYear(y => y - 1)}>&larr;</button>
        <h1 className="year-title">{year}</h1>
        <button className="nav-btn" onClick={() => setYear(y => y + 1)}>&rarr;</button>
        <div className="toolbar-spacer" />
        <button className="today-btn" onClick={() => {
          const today = new Date()
          setYear(today.getFullYear())
        }}>Today</button>
      </div>

      <div className="planner-container">
        {/* Month labels (left side) */}
        <div className="month-labels">
          <div className="month-label-header" style={{ height: HEADER_HEIGHT }} />
          {yearGrid.map((m, i) => (
            <div key={i} className="month-label" style={{ height: ROW_HEIGHT }}>
              {m.abbrev}
            </div>
          ))}
        </div>

        {/* Scrollable calendar area */}
        <div
          className="scroll-container"
          ref={scrollContainerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="grid-wrapper"
            style={{ width: totalColumns * CELL_WIDTH }}
          >
            {/* Column headers */}
            <div className="column-headers" style={{ height: HEADER_HEIGHT }}>
              {weekHeaders.map((wh) => (
                <div
                  key={wh.week}
                  className="week-header"
                  style={{
                    left: wh.col * CELL_WIDTH,
                    width: 7 * CELL_WIDTH,
                  }}
                >
                  <div className="week-days">
                    {[0, 1, 2, 3, 4, 5, 6].map(d => {
                      const col = wh.col + d
                      const dateInfo = columnToDate(year, col, startOffset)
                      const isWeekend = d >= 5
                      return (
                        <div
                          key={d}
                          className={`day-header ${isWeekend ? 'weekend' : ''} ${dateInfo && dateInfo.day === 1 ? 'month-start' : ''}`}
                          style={{ width: CELL_WIDTH }}
                        >
                          {dateInfo ? (
                            <>
                              <span className="day-abbrev">{DAY_ABBREVS[d][0]}</span>
                              <span className="day-num">{dateInfo.day}</span>
                            </>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid body */}
            <div
              className="grid-body"
              ref={gridRef}
              onMouseDown={handleMouseDown}
              style={{ height: 12 * ROW_HEIGHT }}
            >
              {/* Month rows */}
              {yearGrid.map((monthData, monthIdx) => {
                const monthStartCol = dateToColumn(year, monthIdx, 1, startOffset)
                const monthEndCol = dateToColumn(year, monthIdx, monthData.totalDays, startOffset)
                const monthEvents = getEventsForMonth(monthIdx)

                return (
                  <MonthRow
                    key={monthIdx}
                    monthIdx={monthIdx}
                    monthStartCol={monthStartCol}
                    monthEndCol={monthEndCol}
                    totalColumns={totalColumns}
                    cellWidth={CELL_WIDTH}
                    rowHeight={ROW_HEIGHT}
                    todayMarker={todayMarker}
                  >
                    {monthEvents.map(event => {
                      const pos = getEventPosition(event, monthIdx)
                      if (!pos) return null
                      const isDragging = dragState && dragState.eventId === event.id
                      return (
                        <EventBar
                          key={event.id}
                          event={event}
                          left={pos.left}
                          width={pos.width}
                          rowHeight={ROW_HEIGHT}
                          isDragging={isDragging}
                          onMoveStart={(e) => handleEventMoveStart(event.id, e)}
                          onResizeStart={(edge, e) => handleEventResizeStart(event.id, edge, e)}
                          onDoubleClick={(e) => handleEventDoubleClick(event.id, e)}
                        />
                      )
                    })}
                  </MonthRow>
                )
              })}

              {/* Selection indicator while creating */}
              {selectionIndicator && (
                <div
                  className="selection-indicator"
                  style={{
                    left: selectionIndicator.left,
                    top: selectionIndicator.top,
                    width: selectionIndicator.width,
                    height: selectionIndicator.height,
                  }}
                />
              )}

              {/* Today marker line */}
              {todayMarker !== null && (
                <div
                  className="today-line"
                  style={{
                    left: todayMarker * CELL_WIDTH + CELL_WIDTH / 2,
                    height: 12 * ROW_HEIGHT,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event editing modal */}
      {editingEvent && (
        <EventModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  )
}

export default AnnualPlanner
