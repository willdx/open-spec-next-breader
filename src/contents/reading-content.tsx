import type { PlasmoCSConfig } from "plasmo"
import { ReadingOverlay } from "~components/ReadingOverlay"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

export default function ReadingContent() {
  return <ReadingOverlay />
}