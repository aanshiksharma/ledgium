export const convertToRelativeDate = (date: Date): string => {
  const today = Date.now()
  const timePassed = today - date.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30.44 * day
  const year = 365.25 * day

  if (timePassed < minute) return "just now"
  if (timePassed < hour) return `${Math.floor(timePassed / minute)}m ago`
  if (timePassed < day) return `${Math.floor(timePassed / hour)}h ago`
  if (timePassed / day < 2) return "yesterday"
  if (timePassed < week) return `${Math.floor(timePassed / day)}d ago`
  if (timePassed / week < 2) return "last week"

  return `at ${date.toLocaleDateString()}`
}

export function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

export function date(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}
