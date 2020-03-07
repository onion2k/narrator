function sortRequiredFirst(a, b) {
  if (a[1].required === b[1].required) return 0;
  if (a[1].required) return -1;
  return 1;
}

module.exports = { sortRequiredFirst };
