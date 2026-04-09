const MAX_USERS = 1000;

class UserModel {
  constructor() {
    this.users = this.buildSeedUsers();
    this.userIndex = new Map(this.users.map((user) => [user.id, user]));
  }

  buildSeedUsers() {
    const result = [];

    for (let i = 1; i <= MAX_USERS; i += 1) {
      const id = i;
      result.push({
        id,
        username: `user${String(i).padStart(4, "0")}`,
        fullName: `XeTai User ${i}`,
        email: `user${String(i).padStart(4, "0")}@xetai365.local`,
        phone: `090${String(i).padStart(7, "0")}`,
        role: i === 1 ? "admin" : "customer",
        status: i % 20 === 0 ? "inactive" : "active",
        createdAt: new Date(Date.now() - i * 60000).toISOString(),
      });
    }

    return result;
  }

  list({ page = 1, limit = 20, search = "" } = {}) {
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const keyword = String(search || "").trim().toLowerCase();

    const filteredUsers = keyword
      ? this.users.filter((user) => {
          return (
            user.username.toLowerCase().includes(keyword) ||
            user.fullName.toLowerCase().includes(keyword) ||
            user.email.toLowerCase().includes(keyword)
          );
        })
      : this.users;

    const start = (safePage - 1) * safeLimit;
    const items = filteredUsers.slice(start, start + safeLimit);

    return {
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / safeLimit),
      },
    };
  }

  findById(id) {
    const parsedId = Number(id);
    return this.userIndex.get(parsedId) || null;
  }
}

module.exports = new UserModel();
