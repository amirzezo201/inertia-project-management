import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

// How far the pointer must move before a press becomes a drag. Also how a
// draggable tells a click from the click the browser fires after a drag ends.
export const DRAG_ACTIVATION_DISTANCE = 4

// Module constants: useSensor memoizes on the options object, and new sensors
// on every render would re-render every draggable on the board.
const MOUSE_OPTIONS = {
  activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
}
// A touch drag starts after a press-and-hold, so a swipe still scrolls.
const TOUCH_OPTIONS = { activationConstraint: { delay: 250, tolerance: 8 } }

export function useDndSensors() {
  return useSensors(
    useSensor(MouseSensor, MOUSE_OPTIONS),
    useSensor(TouchSensor, TOUCH_OPTIONS),
    useSensor(KeyboardSensor),
  )
}
