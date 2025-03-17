export function isSameDay(dt1, dt2) {
  return (
    dt1.getFullYear() == dt2.getFullYear() &&
    dt1.getMonth() == dt2.getMonth() &&
    dt1.getDate() == dt2.getDate()
  );
}

export function templateToString(data) {
  const {strings, values} = data;
  const v = [...values, ''].map((e) =>
    typeof e === 'object' ? templateToString(e) : e
  );
  return strings.reduce((acc, s, i) => acc + s + v[i], '');
}
