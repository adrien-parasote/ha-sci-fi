export function pad(nb) {
  return (nb > 9 ? '' : '0') + nb;
}

export function isSameDay(dt1, dt2) {
  return (
    dt1.getFullYear() == dt2.getFullYear() &&
    dt1.getMonth() == dt2.getMonth() &&
    dt1.getDate() == dt2.getDate()
  );
}
