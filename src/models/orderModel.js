class OrderModel {
  constructor() {
    this.orders = [];
    this.nextId = 1;
  }

  create({ cart, customer, note = "" }) {
    const id = this.nextId;
    const subtotalVnd = cart.items.reduce(
      (sum, item) => sum + item.unitPriceVnd * item.quantity,
      0
    );

    const order = {
      id,
      code: `XT365-${String(id).padStart(6, "0")}`,
      status: "pending",
      customer: {
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email || "",
        address: customer.address,
      },
      items: cart.items.map((item) => ({
        ...item,
        lineTotalVnd: item.unitPriceVnd * item.quantity,
      })),
      subtotalVnd,
      note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(order);
    this.nextId += 1;
    return order;
  }

  findById(id) {
    const safeId = Number(id);
    return this.orders.find((order) => order.id === safeId) || null;
  }

  list() {
    return this.orders;
  }
}

module.exports = new OrderModel();
