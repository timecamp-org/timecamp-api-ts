/**
 * Formats a date to TimeCamp's expected format: "YYYY-MM-DD HH:mm:ss"
 */
export function formatTimeCampDate(date?: string | Date): string {
  const d = date ? new Date(date) : new Date();
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0') +
    ' ' +
    String(d.getHours()).padStart(2, '0') +
    ':' +
    String(d.getMinutes()).padStart(2, '0') +
    ':' +
    String(d.getSeconds()).padStart(2, '0')
  );
}
