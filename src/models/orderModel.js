const { getPool } = require("../config/db");

function mapOrderRows(rows) {
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
      lineTotalVnd: row.line_total_vnd,
      thumbnail: row.thumbnail || "",
    }));

  return {
    id: first.id,
    code: first.code,
    status: first.status,
    customer: {
      fullName: first.customer_full_name,
      phone: first.customer_phone,
      email: first.customer_email || "",
      address: first.customer_address,
    },
    items,
    subtotalVnd: first.subtotal_vnd,
    note: first.note || "",
    createdAt: first.created_at,
    updatedAt: first.updated_at,
  };
}

class OrderModel {
  async create({ cart, customer, note = "" }) {
    const subtotalVnd = cart.items.reduce(
      (sum, item) => sum + item.unitPriceVnd * item.quantity,
      0
    );

    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      const inserted = await client.query(
        `
        INSERT INTO orders (
          code, status, customer_full_name, customer_phone, customer_email,
          customer_address, subtotal_vnd, note, created_at, updated_at
        )
        VALUES (
          '', 'pending', $1, $2, $3, $4, $5, $6, NOW(), NOW()
        )
        RETURNING id
        `,
        [
          customer.fullName,
          customer.phone,
          customer.email || "",
          customer.address,
          subtotalVnd,
          note || "",
        ]
      );

      const id = inserted.rows[0].id;
      const code = `XT365-${String(id).padStart(6, "0")}`;
      await client.query("UPDATE orders SET code = $2 WHERE id = $1", [id, code]);

      for (const item of cart.items) {
        await client.query(
          `
          INSERT INTO order_items (
            order_id, product_id, slug, title, quantity, unit_price_vnd, line_total_vnd, thumbnail
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            id,
            item.productId,
            item.slug,
            item.title,
            item.quantity,
            item.unitPriceVnd,
            item.unitPriceVnd * item.quantity,
            item.thumbnail || "",
          ]
        );
      }

      await client.query("COMMIT");
      return this.findById(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id) {
    const safeId = Number(id);
    if (!Number.isFinite(safeId)) {
      return null;
    }

    const result = await getPool().query(
      `
      SELECT
        o.id, o.code, o.status, o.customer_full_name, o.customer_phone,
        o.customer_email, o.customer_address, o.subtotal_vnd, o.note,
        o.created_at, o.updated_at,
        oi.id AS item_id, oi.product_id, oi.slug, oi.title, oi.quantity,
        oi.unit_price_vnd, oi.line_total_vnd, oi.thumbnail
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = $1
      ORDER BY oi.id ASC
      `,
      [safeId]
    );

    return mapOrderRows(result.rows);
  }

  async list() {
    const ordersResult = await getPool().query(
      `
      SELECT
        id, code, status, customer_full_name, customer_phone, customer_email,
        customer_address, subtotal_vnd, note, created_at, updated_at
      FROM orders
      ORDER BY id DESC
      `
    );

    if (ordersResult.rowCount === 0) {
      return [];
    }

    const orderIds = ordersResult.rows.map((row) => row.id);
    const itemsResult = await getPool().query(
      `
      SELECT
        id AS item_id, order_id, product_id, slug, title, quantity,
        unit_price_vnd, line_total_vnd, thumbnail
      FROM order_items
      WHERE order_id = ANY($1::bigint[])
      ORDER BY id ASC
      `,
      [orderIds]
    );

    const itemsByOrderId = new Map();
    for (const item of itemsResult.rows) {
      if (!itemsByOrderId.has(item.order_id)) {
        itemsByOrderId.set(item.order_id, []);
      }
      itemsByOrderId.get(item.order_id).push({
        productId: item.product_id,
        slug: item.slug,
        title: item.title,
        quantity: item.quantity,
        unitPriceVnd: item.unit_price_vnd,
        lineTotalVnd: item.line_total_vnd,
        thumbnail: item.thumbnail || "",
      });
    }

    return ordersResult.rows.map((row) => ({
      id: row.id,
      code: row.code,
      status: row.status,
      customer: {
        fullName: row.customer_full_name,
        phone: row.customer_phone,
        email: row.customer_email || "",
        address: row.customer_address,
      },
      items: itemsByOrderId.get(row.id) || [],
      subtotalVnd: row.subtotal_vnd,
      note: row.note || "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }
}

module.exports = new OrderModel();
