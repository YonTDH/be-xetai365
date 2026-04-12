function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

module.exports = {
  normalizeText,
  parsePositiveInt,
};
