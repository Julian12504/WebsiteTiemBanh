-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 08, 2025 lúc 03:03 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `cake_fantasy_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `role` enum('employee','owner') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@gmail.com', '$2b$10$PuCB6TLFDtkExcmApEk9AOfHcbuHTiygKpQRXxfIt7n7IMnNkwnyK', 'Admin', 'User', 'owner', '2025-05-15 22:04:37', '2025-10-06 19:29:01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `grn_details`
--

CREATE TABLE `grn_details` (
  `id` int(11) NOT NULL,
  `grn_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `expected_quantity` decimal(10,2) NOT NULL,
  `received_quantity` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `batch_number` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `item_barcode` varchar(50) DEFAULT NULL,
  `unit` varchar(50) DEFAULT 'piece'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `grn_details`
--

INSERT INTO `grn_details` (`id`, `grn_id`, `item_id`, `expected_quantity`, `received_quantity`, `unit_price`, `selling_price`, `expiry_date`, `batch_number`, `notes`, `item_barcode`, `unit`) VALUES
(1, 1, 87, 1.00, 1.00, 50000.00, 55000.00, NULL, NULL, NULL, NULL, 'piece');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `grn_headers`
--

CREATE TABLE `grn_headers` (
  `id` int(11) NOT NULL,
  `grn_number` varchar(50) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `po_reference` varchar(100) DEFAULT NULL,
  `received_date` date NOT NULL,
  `received_by` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `grn_headers`
--

INSERT INTO `grn_headers` (`id`, `grn_number`, `supplier_id`, `po_reference`, `received_date`, `received_by`, `notes`, `total_amount`, `created_at`, `updated_at`, `updated_by`, `status`) VALUES
(1, 'GRN-251008-001', 1, 'HD-001', '2025-10-08', 1, '1', 50000.00, '2025-10-08 00:37:12', '2025-10-08 00:37:12', NULL, 'approved');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL COMMENT 'Cloudinary URL',
  `cloudinary_id` varchar(255) DEFAULT NULL COMMENT 'Cloudinary public ID for image management',
  `category` varchar(255) NOT NULL,
  `disabled` tinyint(1) DEFAULT 0,
  `sku` varchar(50) DEFAULT NULL COMMENT 'Stock Keeping Unit',
  `barcode` varchar(50) DEFAULT NULL COMMENT 'Item barcode if available',
  `stock_quantity` decimal(10,3) DEFAULT 0.000,
  `reorder_level` int(11) DEFAULT 5 COMMENT 'Min quantity before reordering',
  `cost_price` decimal(10,2) DEFAULT NULL COMMENT 'Purchase cost price',
  `selling_price` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL COMMENT 'Unit of measurement (kg, g, piece, etc)',
  `is_loose` tinyint(1) DEFAULT 0,
  `min_order_quantity` decimal(10,3) DEFAULT 1.000,
  `increment_step` decimal(10,3) DEFAULT 1.000,
  `weight_value` decimal(10,3) DEFAULT NULL,
  `weight_unit` enum('g','ml') DEFAULT NULL,
  `pieces_per_pack` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `items`
--

INSERT INTO `items` (`id`, `name`, `description`, `image`, `cloudinary_id`, `category`, `disabled`, `sku`, `barcode`, `stock_quantity`, `reorder_level`, `cost_price`, `selling_price`, `unit`, `is_loose`, `min_order_quantity`, `increment_step`, `weight_value`, `weight_unit`, `pieces_per_pack`) VALUES
(87, 'Bột Bánh Sukem', 'Nguyên liệu làm bánh sukem', 'https://res.cloudinary.com/dqhdsyaqo/image/upload/v1759773099/cake-fantasy/trhsxuxsxdvxwyvihf1t.webp', 'cake-fantasy/trhsxuxsxdvxwyvihf1t', 'Cake Ingredients', 0, 'ING-005-096206', NULL, 1.000, 10, 50000.00, 55000.00, 'piece', 0, 1.000, 1.000, 99.000, 'g', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `address` text NOT NULL,
  `status` varchar(50) DEFAULT 'Item Processing',
  `payment` tinyint(1) DEFAULT 0,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `contact_number1` varchar(20) NOT NULL,
  `contact_number2` varchar(20) DEFAULT NULL,
  `special_instructions` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `amount`, `address`, `status`, `payment`, `first_name`, `last_name`, `contact_number1`, `contact_number2`, `special_instructions`, `created_at`, `updated_at`) VALUES
(1, 7, 0.00, '', 'cart', 0, '', '', '', NULL, NULL, '2025-10-07 04:24:49', '2025-10-07 04:24:49'),
(2, 7, 70000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Item Processing', 0, 'Duy ', 'Toàn', '0987654321', NULL, NULL, '2025-10-08 03:38:36', '2025-10-08 03:38:36'),
(3, 7, 70000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Item Processing', 0, 'Duy ', 'Toàn', '0987654321', NULL, NULL, '2025-10-08 03:55:27', '2025-10-08 03:55:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `item_id`, `quantity`, `price`) VALUES
(23, 2, 87, 1, 55000.00),
(25, 3, 87, 1, 55000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `email`, `phone`, `address`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'CC NL SUKEM', 'Nguyễn Văn A', 'abc@gmail.com', '0352773474', 'HCM', 'Nguyên liệu sukem', 1, '2025-10-06 21:10:47', '2025-10-06 21:10:47');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES
(3, 'Lithmi', 'liteenilanjith@gmail.com', '$2b$10$0Fihnrw9bKG0KlhhB82TDu2LMdGdMvENOLw6fhb7ZF32ukzHfXyuq'),
(6, 'Kihansa', 'liteeknilanjith@gmail.com', '$2b$10$6CArbqOQwdvxNuUsWA5B1OFM.ufbSnlcvDoF4FIzBGIDVoBqCLro.'),
(7, 'Voduytoan', 'voduytoan6a@gmail.com', '$2b$10$PuCB6TLFDtkExcmApEk9AOfHcbuHTiygKpQRXxfIt7n7IMnNkwnyK');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `grn_details`
--
ALTER TABLE `grn_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grn_id` (`grn_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `idx_grn_details_grn_id` (`grn_id`),
  ADD KEY `idx_grn_details_item_id` (`item_id`);

--
-- Chỉ mục cho bảng `grn_headers`
--
ALTER TABLE `grn_headers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `grn_number` (`grn_number`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `received_by` (`received_by`),
  ADD KEY `idx_grn_headers_supplier_id` (`supplier_id`),
  ADD KEY `idx_grn_headers_status` (`status`),
  ADD KEY `idx_grn_headers_received_date` (`received_date`);

--
-- Chỉ mục cho bảng `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`item_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Chỉ mục cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `grn_details`
--
ALTER TABLE `grn_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `grn_headers`
--
ALTER TABLE `grn_headers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `grn_details`
--
ALTER TABLE `grn_details`
  ADD CONSTRAINT `grn_details_ibfk_1` FOREIGN KEY (`grn_id`) REFERENCES `grn_headers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grn_details_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Ràng buộc cho bảng `grn_headers`
--
ALTER TABLE `grn_headers`
  ADD CONSTRAINT `grn_headers_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `grn_headers_ibfk_2` FOREIGN KEY (`received_by`) REFERENCES `admin_users` (`id`);

--
-- Ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
