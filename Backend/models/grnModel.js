// models/grnModel.js
import db from "../config/db.js";

/** ================================
 *  SCHEMA: tạo bảng nếu chưa có
 *  - grn_headers
 *  - grn_details (với DECIMAL cho quantity)
 * ================================= */
export const createGRNTables = async () => {
  const headerTable = `
    CREATE TABLE IF NOT EXISTS grn_headers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      grn_number VARCHAR(50) NOT NULL UNIQUE,
      supplier_id INT NOT NULL,
      po_reference VARCHAR(100),
      received_date DATE NOT NULL,
      received_by INT NOT NULL,
      notes TEXT,
      total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (received_by) REFERENCES admin_users(id)
    );`;

  const detailTable = `
    CREATE TABLE IF NOT EXISTS grn_details (
      id INT AUTO_INCREMENT PRIMARY KEY,
      grn_id INT NOT NULL,
      item_id INT NOT NULL,
      expected_quantity DECIMAL(10,2) NOT NULL,
      received_quantity DECIMAL(10,2) NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      selling_price DECIMAL(10,2) NULL,
      expiry_date DATE NULL,
      batch_number VARCHAR(100) NULL,
      notes TEXT,
      item_barcode VARCHAR(50) NULL,
      FOREIGN KEY (grn_id) REFERENCES grn_headers(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id)
    );`;

  await db.query(headerTable);
  await db.query(detailTable);
};

/** ================================
 *  GRN MODEL
 * ================================= */
export const GRN = {
  /** Tạo số GRN dạng: GRN-YYMMDD-xxx (xxx tăng dần) */
  generateGRNNumber: async () => {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const [results] = await db.query(
      "SELECT MAX(SUBSTRING_INDEX(grn_number, '-', -1)) as max_count FROM grn_headers WHERE grn_number LIKE ?",
      [`GRN-${dateStr}-%`]
    );

    let todayCount = 1;
    if (results[0].max_count) {
      todayCount = parseInt(results[0].max_count) + 1;
    }

    const grnNumber = `GRN-${dateStr}-${todayCount.toString().padStart(3, '0')}`;

    // Safety check
    const [existingCheck] = await db.query(
      "SELECT COUNT(*) as count FROM grn_headers WHERE grn_number = ?",
      [grnNumber]
    );
    if (existingCheck[0].count > 0) {
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `GRN-${dateStr}-${todayCount.toString().padStart(3, '0')}-${randomSuffix}`;
    }

    return grnNumber;
  },

  /**
   * Tạo GRN (header + details trong 1 transaction)
   * @param {object} grnData - { supplier_id, po_reference, received_date, received_by, notes }
   * @param {Array} items - [{ item_id, received_quantity, unit_price, selling_price, expiry_date, batch_number, notes, barcode }]
   * @param {number} retryCount - retry chống trùng số GRN
   */
  create: async (grnData, items, retryCount = 0) => {
    const connection = await db.getConnection();
    let grnId;
    let grnNumber;

    try {
      await connection.beginTransaction();

      console.log("=== GRN MODEL CREATE ===");
      console.log("GRN Data:", grnData);
      console.log("Items count:", items?.length || 0);

      // 1) Tạo số GRN (có retry khi bị duplicate)
      grnNumber = await GRN.generateGRNNumber();
      console.log("Generated GRN Number:", grnNumber);

      // 2) Tính tổng tiền
      const totalAmount = (items || []).reduce((sum, it) => {
        const qty = Number(it.received_quantity) || 0;
        const price = Number(it.unit_price) || 0;
        return sum + qty * price;
      }, 0);
      
      console.log("Total Amount:", totalAmount);

      // 3) Insert header
      try {
        const [headerResult] = await connection.query(
          `INSERT INTO grn_headers (
            grn_number, supplier_id, po_reference,
            received_date, received_by, notes, total_amount, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [
            grnNumber,
            grnData.supplier_id,
            grnData.po_reference || null,
            grnData.received_date,
            grnData.received_by,
            grnData.notes || null,
            totalAmount
          ]
        );
        grnId = headerResult.insertId;
        console.log("✅ GRN Header created with ID:", grnId);
      } catch (insertError) {
        if (insertError.code === 'ER_DUP_ENTRY' && retryCount < 3) {
          await connection.rollback();
          connection.release();
          console.log(`Duplicate GRN number, retrying (attempt ${retryCount + 1})...`);
          await new Promise(r => setTimeout(r, 100));
          return await GRN.create(grnData, items, retryCount + 1);
        }
        throw insertError;
      }

      // 4) Insert details
      let inserted = 0;

      for (const it of items || []) {
        const itemId = Number(it.item_id);
        const qty = Number(it.received_quantity);  // ✅ Giữ nguyên float
        const price = Number(it.unit_price);
        const sprice = it.selling_price != null ? Number(it.selling_price) : null;

        console.log(`Processing item #${itemId}: qty=${qty}, price=${price}`);

        // Bộ lọc cuối cùng
        if (!(itemId > 0) || !(qty > 0) || !(price > 0)) {
          console.warn(`⚠️ Skipping invalid item: id=${itemId}, qty=${qty}, price=${price}`);
          continue;
        }

        const params = [
          grnId,                   // grn_id
          itemId,                  // item_id
          qty,                     // expected_quantity
          qty,                     // received_quantity (DECIMAL hỗ trợ float)
          price,                   // unit_price
          sprice,                  // selling_price
          it.expiry_date ?? null,  // expiry_date
          it.batch_number ?? null, // batch_number
          it.notes ?? null,        // notes (dòng)
          it.barcode ?? null       // item_barcode
        ];

        try {
          await connection.query(
            `INSERT INTO grn_details
               (grn_id, item_id, expected_quantity, received_quantity,
                unit_price, selling_price, expiry_date, batch_number, notes, item_barcode)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params
          );
          inserted++;
          console.log(`✅ Inserted detail for item #${itemId}`);
        } catch (detailError) {
          console.error(`❌ Error inserting detail for item #${itemId}:`, detailError);
          throw detailError;
        }
      }

      console.log(`Total details inserted: ${inserted}`);

      // Không có chi tiết nào → rollback để tránh header mồ côi
      if (inserted === 0) {
        await connection.rollback();
        throw new Error('No valid detail rows inserted');
      }

      await connection.commit();
      console.log("✅ GRN transaction committed successfully");
      
      return { id: grnId, grn_number: grnNumber };
    } catch (error) {
      await connection.rollback();
      console.error("❌ Error creating GRN:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /** Duyệt GRN & cập nhật tồn kho */
  complete: async (grnId) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Lấy chi tiết để cập nhật tồn
      const [grnDetails] = await connection.query(
        `SELECT 
          gd.item_id, 
          gd.received_quantity, 
          gd.unit_price,
          i.stock_quantity as current_stock
        FROM grn_details gd
        JOIN items i ON gd.item_id = i.id
        WHERE gd.grn_id = ?`,
        [grnId]
      );

      for (const d of grnDetails) {
        await connection.query(
          "UPDATE items SET stock_quantity = stock_quantity + ?, cost_price = ? WHERE id = ?",
          [d.received_quantity, d.unit_price, d.item_id]
        );

        // Đã bỏ inventory_logs - không cần thiết
      }

      await connection.query(
        "UPDATE grn_headers SET status = 'approved' WHERE id = ?",
        [grnId]
      );

      await connection.commit();

      if (global.io) {
        global.io.emit('inventory-updated', { type: 'grn-completed', grnId });
      }

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /** Lấy GRN theo ID (header + details) */
  findById: async (id) => {
    const [headers] = await db.query(
      `SELECT 
        gh.id,
        gh.grn_number,
        gh.po_reference,
        gh.supplier_id,
        gh.received_date,
        gh.created_at,
        gh.total_amount,
        gh.status,
        gh.notes,
        s.name as supplier_name,
        CONCAT(a.first_name, ' ', a.last_name) as received_by_name
      FROM grn_headers gh
      JOIN suppliers s ON gh.supplier_id = s.id
      JOIN admin_users a ON gh.received_by = a.id
      WHERE gh.id = ?`,
      [id]
    );

    if (!headers.length) return null;
    const grn = headers[0];

    const [details] = await db.query(
      `SELECT 
        gd.*,
        i.name as item_name,
        i.sku,
        i.barcode,
        i.image,
        i.unit,
        i.is_loose,
        i.category,
        COALESCE(gd.item_barcode, i.barcode, i.sku) as display_barcode
      FROM grn_details gd
      JOIN items i ON gd.item_id = i.id
      WHERE gd.grn_id = ?`,
      [id]
    );

    grn.items = details;
    return grn;
  },

  /** Danh sách GRN có phân trang + filter */
  findAll: async ({ supplier_id, startDate, endDate, page = 1, limit = 20 }) => {
    let whereConditions = [];
    const params = [];

    if (supplier_id) {
      whereConditions.push("gh.supplier_id = ?");
      params.push(supplier_id);
    }
    if (startDate) {
      whereConditions.push("gh.received_date >= ?");
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push("gh.received_date <= ?");
      params.push(endDate);
    }

    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const offset = (page - 1) * limit;

    const [grns] = await db.query(
      `SELECT 
        gh.id,
        gh.grn_number,
        gh.po_reference,
        gh.supplier_id,
        gh.received_date,
        gh.created_at,
        gh.total_amount,
        gh.status,
        s.name as supplier_name,
        CONCAT(a.first_name, ' ', a.last_name) as received_by_name,
        (SELECT COUNT(*) FROM grn_details WHERE grn_id = gh.id) as items_count
      FROM grn_headers gh
      JOIN suppliers s ON gh.supplier_id = s.id
      JOIN admin_users a ON gh.received_by = a.id
      ${whereClause}
      ORDER BY gh.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM grn_headers gh ${whereClause}`,
      params
    );

    return {
      data: grns,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    };
  },

  /** Huỷ GRN (pending → rejected) */
  cancel: async (id) => {
    const [result] = await db.query(
      "UPDATE grn_headers SET status = 'rejected' WHERE id = ? AND status = 'pending'",
      [id]
    );
    return result.affectedRows > 0;
  },

  /** Update GRN Status */
  updateStatus: async (id, status, userId) => {
    const [result] = await db.query(
      "UPDATE grn_headers SET status = ? WHERE id = ? AND status = 'pending'",
      [status, id]
    );
    
    if (result.affectedRows > 0 && status === 'approved') {
      await GRN.complete(id);
    }
    
    return result.affectedRows > 0;
  }
};

export default createGRNTables;