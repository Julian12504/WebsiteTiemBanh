import React, { useRef } from 'react';
import JsBarcode from 'jsbarcode';
import './BarcodeGenerator.css';

const BarcodeGenerator = ({
  value,
  name,
  price,
  sku,
  unit,
  weight_value,
  weight_unit,
  is_loose,
  min_order_quantity,
  width = 2,
  height = 100,
  fontSize = 14,
  displayValue = true,
  onPrint
}) => {
  const canvasRef = useRef(null);
  const barcodeContainerRef = useRef(null);

  React.useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: "CODE128",
          width,
          height,
          displayValue,
          fontSize,
          margin: 10,
          background: "#ffffff"
        });
      } catch (error) {
        console.error("Lỗi tạo mã vạch:", error);
        // Hiển thị text thay thế nếu tạo mã vạch lỗi
        const ctx = canvasRef.current.getContext('2d');
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(`Mã vạch không hợp lệ: ${value}`, 10, height / 2);
      }
    }
  }, [value, width, height, displayValue, fontSize]);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }

    if (barcodeContainerRef.current) {
      const printWindow = window.open('', '_blank');

      let additionalInfo = '';
      if (weight_value && weight_unit) {
        additionalInfo += `<div class="barcode-weight">${weight_value}${weight_unit}</div>`;
      }

      if (is_loose) {
        additionalInfo += `<div class="barcode-loose">Số lượng tối thiểu: ${min_order_quantity} ${unit}</div>`;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>In mã vạch</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
              }
              .barcode-print-container {
                width: 300px;
                padding: 10px;
                border: 1px solid #ddd;
                margin: 10px auto;
                text-align: center;
              }
              .barcode-name {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .barcode-sku {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
              }
              .barcode-price {
                font-size: 16px;
                font-weight: bold;
                margin-top: 5px;
              }
              .barcode-weight {
                font-size: 12px;
                color: #444;
                margin-top: 2px;
              }
              .barcode-loose {
                font-size: 12px;
                color: #444;
                margin-top: 2px;
              }
              @media print {
                body {
                  width: 58mm; /* Kích thước giấy in chuẩn */
                  margin: 0;
                }
                .barcode-print-container {
                  width: 100%;
                  border: none;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="barcode-print-container">
              ${name ? `<div class="barcode-name">${name}</div>` : ''}
              ${sku ? `<div class="barcode-sku">SKU: ${sku}</div>` : ''}
              <img src="${canvasRef.current.toDataURL('image/png')}" />
              ${additionalInfo}
              ${price ? `<div class="barcode-price">VNĐ ${parseFloat(price).toFixed(2)}</div>` : ''}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
    }
  };

  return (
    <div className="barcode-generator" ref={barcodeContainerRef}>
      <div className="barcode-content">
        {name && <div className="barcode-name">{name}</div>}
        {sku && <div className="barcode-sku">SKU: {sku}</div>}
        <canvas ref={canvasRef} className="barcode-canvas"></canvas>

        {weight_value && weight_unit && (
          <div className="barcode-weight">{weight_value}{weight_unit}</div>
        )}

        {is_loose && (
          <div className="barcode-loose">Số lượng tối thiểu: {min_order_quantity} {unit}</div>
        )}

        {price && <div className="barcode-price">VNĐ {parseFloat(price).toFixed(2)}</div>}
      </div>
      <button className="print-barcode-btn" onClick={handlePrint}>
        In mã vạch
      </button>
    </div>
  );
};

export default BarcodeGenerator;
