import { memo, useMemo } from 'react'

function MonthRow({ monthIdx, monthStartCol, monthEndCol, totalColumns, cellWidth, rowHeight, todayMarker, children }) {
  // Build the cell background using a CSS approach:
  // We render the full-width row with out-month background,
  // then overlay the in-month range, and mark weekends and today.
  const weekendCells = useMemo(() => {
    const cells = []
    // Only render weekend markers within the month range
    for (let col = monthStartCol; col <= monthEndCol; col++) {
      if (col % 7 >= 5) {
        cells.push(col)
      }
    }
    return cells
  }, [monthStartCol, monthEndCol])

  const isTodayInMonth = todayMarker !== null && todayMarker >= monthStartCol && todayMarker <= monthEndCol

  return (
    <div
      className="month-row"
      style={{
        top: monthIdx * rowHeight,
        height: rowHeight,
        width: totalColumns * cellWidth,
      }}
    >
      {/* Out-of-month background (full width) */}
      <div
        className="month-row-bg-out"
        style={{
          width: totalColumns * cellWidth,
          height: rowHeight,
        }}
      />

      {/* In-month background */}
      <div
        className="month-row-bg-in"
        style={{
          left: monthStartCol * cellWidth,
          width: (monthEndCol - monthStartCol + 1) * cellWidth,
          height: rowHeight,
        }}
      />

      {/* Weekend cells within month */}
      {weekendCells.map(col => (
        <div
          key={col}
          className="grid-cell-weekend"
          style={{
            left: col * cellWidth,
            width: cellWidth,
            height: rowHeight,
          }}
        />
      ))}

      {/* Today highlight */}
      {isTodayInMonth && (
        <div
          className="grid-cell-today"
          style={{
            left: todayMarker * cellWidth,
            width: cellWidth,
            height: rowHeight,
          }}
        />
      )}

      {/* Vertical grid lines at week boundaries */}
      {Array.from({ length: Math.ceil(totalColumns / 7) }, (_, i) => {
        const col = i * 7
        if (col === 0) return null
        return (
          <div
            key={`wk-${i}`}
            className="week-divider"
            style={{
              left: col * cellWidth,
              height: rowHeight,
            }}
          />
        )
      })}

      {/* Events */}
      {children}
    </div>
  )
}

export default memo(MonthRow)
