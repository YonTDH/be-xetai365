const crypto = require("crypto");

class CartModel {
  constructor() {
    this.carts = new Map();
  }

  getOrCreateCart(cartId) {
    if (cartId && this.carts.has(cartId)) {
      return this.carts.get(cartId);
    }

    const id = cartId || crypto.randomUUID();
    const cart = {
      id,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.carts.set(id, cart);
    return cart;
  }

  getCart(cartId) {
    if (!cartId) {
      return null;
    }

    return this.carts.get(cartId) || null;
  }

  addItem(cartId, product, quantity) {
    const cart = this.getOrCreateCart(cartId);
    const existingItem = cart.items.find((item) => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.updatedAt = new Date().toISOString();
    } else {
      cart.items.push({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        quantity,
        unitPriceVnd: product.priceVnd,
        thumbnail: product.images[0] || "",
        updatedAt: new Date().toISOString(),
      });
    }

    cart.updatedAt = new Date().toISOString();
    return cart;
  }

  updateItem(cartId, productId, quantity) {
    const cart = this.getCart(cartId);
    if (!cart) {
      return null;
    }

    const item = cart.items.find((entry) => entry.productId === Number(productId));
    if (!item) {
      return null;
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((entry) => entry.productId !== Number(productId));
    } else {
      item.quantity = quantity;
      item.updatedAt = new Date().toISOString();
    }

    cart.updatedAt = new Date().toISOString();
    return cart;
  }

  removeItem(cartId, productId) {
    const cart = this.getCart(cartId);
    if (!cart) {
      return null;
    }

    const nextItems = cart.items.filter(
      (entry) => entry.productId !== Number(productId)
    );
    if (nextItems.length === cart.items.length) {
      return null;
    }

    cart.items = nextItems;
    cart.updatedAt = new Date().toISOString();
    return cart;
  }

  clearCart(cartId) {
    this.carts.delete(cartId);
  }

  serialize(cart) {
    if (!cart) {
      return null;
    }

    const totals = cart.items.reduce(
      (accumulator, item) => {
        const lineTotal = item.unitPriceVnd * item.quantity;
        return {
          quantity: accumulator.quantity + item.quantity,
          subtotalVnd: accumulator.subtotalVnd + lineTotal,
        };
      },
      {
        quantity: 0,
        subtotalVnd: 0,
      }
    );

    return {
      ...cart,
      totals,
    };
  }
}

module.exports = new CartModel();
