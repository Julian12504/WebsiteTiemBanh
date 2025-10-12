import { GRN } from "../models/grnModel.js";
import db from '../config/db.js';

/**
 * Tạo mới GRN (Goods Received Note)
 * - Tự động tạo item nếu item chưa tồn tại
 * - Validate số lượng & đơn vị
 * - Lưu vào grn_headers + grn_details
 * - Sau đó gọi complete() để cập nhật tồn kho
 */
export const createGRN = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { supplier_id, po_reference, received_date, notes, items } = req.body;

    console.log("🟢 Creating GRN with request:", JSON.stringify(req.body, null, 2));

    // Validate đầu vào cơ bản
    if (!supplier_id || !received_date || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (supplier_id, received_date, items)"
      });
    }

    const processedItems = [];

    for (const item of items) {
      let itemId = item.item_id;

      // Nếu là hàng mới → tạo mới trong bảng items
      if (!itemId || itemId === '' || itemId === 'new') {
        if (!item.name || !item.category) {
          return res.status(400).json({
            success: false,
            message: "Mặt hàng mới phải có tên và danh mục"
          });
        }

        try {
          console.log(`🟡 Creating new item: ${item.name}`);

          const sku = item.sku || `SKU-${Date.now()}`;
          const isLoose = item.unit === 'g' || item.unit === 'ml';
          const minQty = isLoose ? 0.1 : 1;
          const stepQty = isLoose ? 0.1 : 1;

          const [newItem] = await connection.query(
            `INSERT INTO items (
              name, category, sku, barcode, unit,
              cost_price, selling_price, stock_quantity,
              reorder_level, is_loose, min_order_quantity, increment_step
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.name,
              item.category,
              sku,
              item.barcode || null,
              item.unit || 'piece',
              Number(item.unit_price) || 0,
              item.selling_price != null ? Number(item.selling_price) : null,
              0,            // stock_quantity
              1,            // reorder_level
              isLoose ? 1 : 0,
              Number(minQty),
              Number(stepQty)
            ]
          );

          itemId = newItem.insertId;
          console.log(`✅ Created new item #${itemId}: ${item.name}`);
        } catch (err) {
          console.error("❌ Error creating new item:", err);
          await connection.rollback();
          return res.status(500).json({
            success: false,
            message: `Không thể tạo item: ${item.name}`,
            error: err.message
          });
        }
      }

      // Validate các trường bắt buộc
      if (!item.received_quantity || !item.unit_price) {
        return res.status(400).json({
          success: false,
          message: "Mỗi mặt hàng phải có received_quantity và unit_price"
        });
      }

      // Kiểm tra chi tiết item để xác nhận hợp lệ
      try {
        const [rows] = await connection.query(
          `SELECT is_loose, min_order_quantity, increment_step, unit, category 
           FROM items WHERE id = ?`,
          [itemId]
        );

        if (rows.length > 0) {
          const details = rows[0];
          const unit = details.unit || 'piece';
          const qty = parseFloat(item.received_quantity);

          if (details.is_loose) {
            const min = parseFloat(details.min_order_quantity);
            const step = parseFloat(details.increment_step);

            if (qty < min) {
              return res.status(400).json({
                success: false,
                message: `Item #${itemId} có số lượng tối thiểu ${min} ${unit}`
              });
            }

            const remainder = Math.abs((qty - min) % step);
            if (remainder > 0.001 && remainder < (step - 0.001)) {
              return res.status(400).json({
                success: false,
                message: `Item #${itemId} phải nhập theo bội số ${step} ${unit}`
              });
            }
          } else if (!Number.isInteger(qty)) {
            return res.status(400).json({
              success: false,
              message: `Item #${itemId} phải là số nguyên (piece)`
            });
          }
        }
      } catch (checkErr) {
        console.warn("⚠️ Error validating item:", checkErr);
      }

      // Thêm item đã xử lý vào mảng
      processedItems.push({
        item_id: itemId,
        received_quantity: parseFloat(item.received_quantity),
        unit_price: parseFloat(item.unit_price),
        selling_price: item.selling_price ? parseFloat(item.selling_price) : null,
        expiry_date: item.expiry_date || null,
        batch_number: item.batch_number || null,
        notes: item.notes || null,
        barcode: item.barcode || null
      });
    }

    console.log(`✅ Total processed items: ${processedItems.length}`);

    if (processedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có mặt hàng hợp lệ để tạo GRN"
      });
    }

    // Gọi model để lưu header + details
    const result = await GRN.create({
      supplier_id,
      po_reference,
      received_date,
      received_by: req.user.id,
      notes
    }, processedItems);

    // Xác minh đã có chi tiết
    const [checkDetails] = await db.query(
      'SELECT COUNT(*) AS count FROM grn_details WHERE grn_id = ?',
      [result.id]
    );

    if (!checkDetails[0].count) {
      await db.query('DELETE FROM grn_headers WHERE id = ?', [result.id]);
      return res.status(400).json({
        success: false,
        message: "Không thể tạo GRN - không có chi tiết hợp lệ."
      });
    }

    // GRN tạo xong sẽ ở trạng thái pending, cần được duyệt thủ công
    console.log(`✅ GRN #${result.id} created with pending status`);

    res.status(201).json({
      success: true,
      message: "Tạo GRN thành công",
      data: result
    });

  } catch (error) {
    console.error("❌ Error creating GRN:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo GRN: " + error.message
    });
  } finally {
    connection.release();
  }
};

/** Duyệt GRN (approve) và cập nhật tồn kho */
export const completeGRN = async (req, res) => {
  try {
    const { id } = req.params;

    const grn = await GRN.findById(id);
    if (!grn)
      return res.status(404).json({ success: false, message: "Không tìm thấy GRN" });

    if (grn.status !== 'pending')
      return res.status(400).json({ success: false, message: `GRN đã ${grn.status}` });

    await GRN.complete(id);

    res.json({ success: true, message: "Đã duyệt GRN và cập nhật tồn kho" });
  } catch (err) {
    console.error("Error completing GRN:", err);
    res.status(500).json({
      success: false,
      message: "Không thể duyệt GRN",
      error: err.message
    });
  }
};

/** Lấy chi tiết 1 GRN */
export const getGRNById = async (req, res) => {
  try {
    const { id } = req.params;
    const grn = await GRN.findById(id);
    if (!grn) return res.status(404).json({ success: false, message: "GRN không tồn tại" });

    const formatted = {
      id: grn.id,
      grn_number: grn.grn_number,
      po_reference: grn.po_reference,
      supplier_id: grn.supplier_id,
      supplier_name: grn.supplier_name,
      received_date: grn.received_date,
      created_at: grn.created_at,
      notes: grn.notes,
      received_by_name: grn.received_by_name,
      total_amount: parseFloat(grn.total_amount || 0),
      status: grn.status,
      items: grn.items.map(i => ({
        id: i.id,
        item_id: i.item_id,
        name: i.item_name,
        quantity: parseFloat(i.received_quantity),
        unit_price: parseFloat(i.unit_price),
        selling_price: i.selling_price ? parseFloat(i.selling_price) : null,
        sku: i.sku,
        barcode: i.barcode,
        unit: i.unit,
        category: i.category,
        line_total: parseFloat(i.received_quantity) * parseFloat(i.unit_price)
      }))
    };

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Error fetching GRN:", err);
    res.status(500).json({
      success: false,
      message: "Không thể lấy dữ liệu GRN",
      error: err.message
    });
  }
};

/** Liệt kê GRN */
export const listGRNs = async (req, res) => {
  try {
    const { status, supplier_id, startDate, endDate, page = 1, limit = 10 } = req.query;

    const filters = {
      status,
      supplier_id,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await GRN.findAll(filters);
    const normalized = result.data.map(grn => ({
      id: grn.id,
      grn_number: grn.grn_number,
      po_reference: grn.po_reference,
      supplier_id: grn.supplier_id,
      supplier_name: grn.supplier_name,
      received_date: grn.received_date,
      created_at: grn.created_at,
      total_amount: parseFloat(grn.total_amount || 0),
      status: grn.status,
      received_by_name: grn.received_by_name,
      item_count: grn.items_count || 0
    }));

    res.json({
      success: true,
      data: normalized,
      pagination: result.pagination
    });
  } catch (err) {
    console.error("Error listing GRNs:", err);
    res.status(500).json({
      success: false,
      message: "Không thể tải danh sách GRN",
      error: err.message
    });
  }
};

/** Huỷ GRN */
export const cancelGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await GRN.cancel(id);

    if (!success)
      return res.status(400).json({ success: false, message: "Không thể huỷ GRN" });

    res.json({ success: true, message: "Đã huỷ GRN" });
  } catch (err) {
    console.error("Error cancelling GRN:", err);
    res.status(500).json({
      success: false,
      message: "Không thể huỷ GRN",
      error: err.message
    });
  }
};
