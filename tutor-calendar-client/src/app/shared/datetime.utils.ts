export function toTime(str: string): any {
  const parts = str.split(':');
  return {
    hour: +parts[0],
    minute: +parts[1]
  };
}








