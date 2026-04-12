function paginate(items, page, limit) {
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const totalItems = items.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit);
  const start = (safePage - 1) * safeLimit;

  return {
    items: items.slice(start, start + safeLimit),
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
    },
  };
}

module.exports = {
  paginate,
};
