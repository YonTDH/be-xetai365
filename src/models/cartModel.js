const crypto = require("crypto");
const { getPool } = require("../config/db");

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

function mapCartRows(rows) {
  if (!rows || rows.length === 0) {
    return null;
  }

  const first = rows[0];
  const items = rows
    .filter((row) => row.item_id !== null)
    .map((row) => ({
      productId: row.product_id,
      slug: row.slug,
      title: row.title,
      quantity: row.quantity,
      unitPriceVnd: row.unit_price_vnd,
      thumbnail: row.thumbnail || "",
      updatedAt: row.item_updated_at,
    }));

  return {
    id: first.id,
    items,
    createdAt: first.created_at,
    updatedAt: first.updated_at,
  };
}

class CartModel {
  async getCart(cartId) {
    if (!isUuid(cartId)) {
      return null;
    }

    const result = await getPool().query(
      `
      SELECT
        c.id, c.created_at, c.updated_at,
        ci.id AS item_id, ci.product_id, ci.slug, ci.title, ci.quantity,
        ci.unit_price_vnd, ci.thumbnail, ci.updated_at AS item_updated_at
      FROM carts c
      LEFT JOIN cart_items ci ON ci.cart_id = c.id
      WHERE c.id = $1
      ORDER BY ci.id ASC
      `,
      [cartId]
    );

    return mapCartRows(result.rows);
  }

  async getOrCreateCart(cartId, client = null) {
    if (isUuid(cartId)) {
      const existing = await this.getCart(cartId);
      if (existing) {
        return existing;
      }
    }

    const id = isUuid(cartId) ? cartId : crypto.randomUUID();
    const runner = client || getPool();
    await runner.query(
      `
      INSERT INTO carts (id, created_at, updated_at)
      VALUES ($1, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
      `,
      [id]
    );

    return this.getCart(id);
  }

  async addItem(cartId, product, quantity) {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const cart = await this.getOrCreateCart(cartId, client);
      await client.query(
        `
        INSERT INTO cart_items (
          cart_id, product_id, slug, title, quantity, unit_price_vnd, thumbnail, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (cart_id, product_id) DO UPDATE SET
          quantity = cart_items.quantity + EXCLUDED.quantity,
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          unit_price_vnd = EXCLUDED.unit_price_vnd,
          thumbnail = EXCLUDED.thumbnail,
          updated_at = NOW()
        `,
        [
          cart.id,
          product.id,
          product.slug,
          product.title,
          quantity,
          product.priceVnd,
          product.images[0] || "",
        ]
      );

      await client.query("UPDATE carts SET updated_at = NOW() WHERE id = $1", [cart.id]);
      await client.query("COMMIT");
      return this.getCart(cart.id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async updateItem(cartId, productId, quantity) {
    const cart = await this.getCart(cartId);
    if (!cart) {
      return null;
    }

    const parsedProductId = Number(productId);
    if (!Number.isFinite(parsedProductId)) {
      return null;
    }

    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      if (quantity <= 0) {
        const deleted = await client.query(
          "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING id",
          [cart.id, parsedProductId]
        );
        if (deleted.rowCount === 0) {
          await client.query("ROLLBACK");
          return null;
        }
      } else {
        const updated = await client.query(
          `
          UPDATE cart_items
          SET quantity = $3, updated_at = NOW()
          WHERE cart_id = $1 AND product_id = $2
          RETURNING id
          `,
          [cart.id, parsedProductId, quantity]
        );
        if (updated.rowCount === 0) {
          await client.query("ROLLBACK");
          return null;
        }
      }

      await client.query("UPDATE carts SET updated_at = NOW() WHERE id = $1", [cart.id]);
      await client.query("COMMIT");
      return this.getCart(cart.id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async removeItem(cartId, productId) {
    const cart = await this.getCart(cartId);
    if (!cart) {
      return null;
    }

    const parsedProductId = Number(productId);
    if (!Number.isFinite(parsedProductId)) {
      return null;
    }

    const deleted = await getPool().query(
      "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING id",
      [cart.id, parsedProductId]
    );

    if (deleted.rowCount === 0) {
      return null;
    }

    await getPool().query("UPDATE carts SET updated_at = NOW() WHERE id = $1", [cart.id]);
    return this.getCart(cart.id);
  }

  async clearCart(cartId) {
    if (!isUuid(cartId)) {
      return;
    }
    await getPool().query("DELETE FROM carts WHERE id = $1", [cartId]);
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
