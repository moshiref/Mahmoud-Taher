import { useSyncExternalStore } from 'react'
import { getActiveChapter, subscribeChapter } from '@/lib/scrollStore'

/** Re-renders only when the nearest chapter changes, never per scroll frame. */
export const useActiveChapter = () => useSyncExternalStore(subscribeChapter, getActiveChapter, () => 0)
