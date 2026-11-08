import { useEffect, useState } from 'react'

/** Live "HH:MM" clock for a given IANA time zone. */
export function useLocalTime(timeZone: string) {
  const [time, setTime] = useState(() => format(timeZone))

  useEffect(() => {
    const id = window.setInterval(() => setTime(format(timeZone)), 1000)
    return () => window.clearInterval(id)
  }, [timeZone])

  return time
}

function format(timeZone: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone }).format(new Date())
  } catch {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date())
  }
}
