export const convertToPascalCase = (str: string): string =>
  str
    .split("-")
    .map((word) => word.replace(word.charAt(0), word.charAt(0).toUpperCase()))
    .join("")

export function extractInitials(name: string) {
  return name.split(" ").map((word) => word.charAt(0))
}
