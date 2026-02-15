const EVENT_COLORS = [
  { bg: '#4A90D9', text: '#fff', name: 'Blue' },
  { bg: '#E74C3C', text: '#fff', name: 'Red' },
  { bg: '#2ECC71', text: '#fff', name: 'Green' },
  { bg: '#F39C12', text: '#fff', name: 'Orange' },
  { bg: '#9B59B6', text: '#fff', name: 'Purple' },
  { bg: '#1ABC9C', text: '#fff', name: 'Teal' },
  { bg: '#E91E63', text: '#fff', name: 'Pink' },
  { bg: '#00BCD4', text: '#fff', name: 'Cyan' },
  { bg: '#8BC34A', text: '#fff', name: 'Lime' },
  { bg: '#FF5722', text: '#fff', name: 'Deep Orange' },
  { bg: '#607D8B', text: '#fff', name: 'Blue Grey' },
  { bg: '#795548', text: '#fff', name: 'Brown' },
]

let colorIndex = 0

export function getNextColor() {
  const color = EVENT_COLORS[colorIndex % EVENT_COLORS.length]
  colorIndex++
  return color
}

export function getColorByIndex(index) {
  return EVENT_COLORS[index % EVENT_COLORS.length]
}

export { EVENT_COLORS }
