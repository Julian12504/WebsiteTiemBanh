-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 25, 2025 lúc 04:06 PM
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
(1, 'admin', 'admin@gmail.com', '$2b$10$PuCB6TLFDtkExcmApEk9AOfHcbuHTiygKpQRXxfIt7n7IMnNkwnyK', 'Admin', 'User', 'owner', '2025-05-15 22:04:37', '2025-10-06 19:29:01'),
(5, 'voduytoan', 'voduytoansgu@gmaail.com', '$2b$10$cLWnBJPC1l1hCH3Ki2tkfeC1rcH5bX1gLY0N.hWw7oqNh.ulxVk/m', 'Duy ', 'Toàn', 'employee', '2025-10-08 17:03:18', '2025-10-08 17:03:18');

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
(1, 1, 2, 10.00, 10.00, 25000.00, 27000.00, NULL, NULL, NULL, NULL, 'piece'),
(2, 1, 3, 10.00, 10.00, 25000.00, 27000.00, NULL, NULL, NULL, NULL, 'piece'),
(3, 1, 4, 10.00, 10.00, 15000.00, 17000.00, NULL, NULL, NULL, NULL, 'piece'),
(4, 1, 5, 10.00, 10.00, 40000.00, 43000.00, NULL, NULL, NULL, NULL, 'piece'),
(5, 1, 6, 10.00, 10.00, 33000.00, 37000.00, NULL, NULL, NULL, NULL, 'piece'),
(6, 2, 7, 10.00, 10.00, 23000.00, 25000.00, NULL, NULL, NULL, NULL, 'piece'),
(7, 2, 8, 10.00, 10.00, 800000.00, 840000.00, NULL, NULL, NULL, NULL, 'piece'),
(8, 2, 9, 10.00, 10.00, 25000.00, 29000.00, NULL, NULL, NULL, NULL, 'piece'),
(9, 3, 10, 10.00, 10.00, 300000.00, 350000.00, NULL, NULL, NULL, NULL, 'piece'),
(10, 4, 2, 10.00, 10.00, 25000.00, 27000.00, NULL, NULL, NULL, NULL, 'piece'),
(11, 5, 2, 1.00, 1.00, 25000.00, 27000.00, NULL, NULL, NULL, NULL, 'piece'),
(12, 6, 2, 1.00, 1.00, 25000.00, 27000.00, NULL, NULL, NULL, NULL, 'piece'),
(13, 7, 2, 1.00, 1.00, 25000.00, 27000.00, NULL, NULL, NULL, NULL, 'piece'),
(14, 8, 11, 10.00, 10.00, 12321.00, 12312.00, NULL, NULL, NULL, NULL, 'piece');

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
(1, 'GRN-251008-001', 2, 'HD-001', '2025-10-08', 1, 'Nhập bánh', 1380000.00, '2025-10-08 18:31:53', '2025-10-08 18:31:53', NULL, 'approved'),
(2, 'GRN-251008-002', 3, 'HD-002', '2025-10-08', 1, 'Nhập nguyên liệu', 8480000.00, '2025-10-08 18:32:57', '2025-10-08 18:32:57', NULL, 'approved'),
(3, 'GRN-251008-003', 4, 'HD-003', '2025-10-08', 1, 'Nhập Đồ trang trí', 3000000.00, '2025-10-08 18:33:24', '2025-10-08 18:33:24', NULL, 'approved'),
(4, 'GRN-251011-001', 2, 'HD-003', '2025-10-11', 1, NULL, 250000.00, '2025-10-11 08:05:51', '2025-10-11 08:32:41', NULL, 'rejected'),
(5, 'GRN-251011-002', 2, 'INV-099', '2025-10-11', 1, NULL, 25000.00, '2025-10-11 08:40:45', '2025-10-11 08:40:45', NULL, 'approved'),
(6, 'GRN-251011-003', 2, 'HD-0011112', '2025-10-11', 1, NULL, 25000.00, '2025-10-11 08:43:15', '2025-10-11 08:43:15', NULL, 'pending'),
(7, 'GRN-251011-004', 2, 'HD-001213', '2025-10-11', 1, NULL, 25000.00, '2025-10-11 08:44:17', '2025-10-11 08:44:33', NULL, 'approved'),
(8, 'GRN-251011-005', 2, 'HD-00323', '2025-10-11', 1, NULL, 123210.00, '2025-10-11 15:27:31', '2025-10-11 15:27:46', NULL, 'approved');

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
  `stock_quantity` int(11) DEFAULT 0,
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
(2, 'Bánh Cosy Marie', 'Bánh quy Cosy là thương hiệu bánh quy thơm ngon, nổi tiếng với hương vị thơm ngon cho gia đình bạn lựa chọn. Bánh quy Cosy Marie gói 240g gói vừa tiện lợi sử dụng cho cả gia đình, được yêu thích từ trẻ em cho đến người lớn, là món bánh quy thiết thực cho ăn vặt, quà vào dịp lễ, Tết.\r\n\r\nThành phần: Bột mì, dầu cọ, đường, chất tạo xốp (503(ii), 500(ii)), muối, hương thực phẩm tổng hợp, chất xử lý bột,...\r\n\r\nHướng dẫn sử dụng: Dùng trực tiếp.\r\n\r\nBảo quản: Để nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp', 'https://res.cloudinary.com/dqhdsyaqo/image/upload/v1759943997/cake-fantasy/fgznmwmgmc3wvbw5r1gz.webp', 'cake-fantasy/fgznmwmgmc3wvbw5r1gz', 'Cake', 0, 'ITEM-001-991240', NULL, 1, 5, 25000.00, 27000.00, 'piece', 0, 1.000, 1.000, 240.000, 'g', 24),
(3, 'Bánh Bouchee ', 'Bánh Bouchee Lotte Chocolat Vị Socola với lớp bánh mềm, được phủ sốt socola bên ngoài cùng với lớp nhân marshmallow cao cấp dai dai, ngọt nhẹ bên trong tạo nên hương vị hấp dẫn, sản phẩm này chắc chắn sẽ làm các bạn làm mê ngay từ miếng đầu tiên.', 'https://res.cloudinary.com/dqhdsyaqo/image/upload/v1759944349/cake-fantasy/fjotyvjvjrdi4lsfdawd.webp', 'cake-fantasy/fjotyvjvjrdi4lsfdawd', 'Cake', 0, 'ITEM-002-343610', NULL, 7, 5, 25000.00, 27000.00, 'piece', 0, 1.000, 1.000, 342.000, 'g', 15),
(4, 'Bánh Marine Boy', 'Sản phẩm được sản xuất bởi Orion với dây chuyền công nghệ hiện đại của Hàn Quốc, mang đến sự an tâm cho người sử dụng. Bánh quy Marine Boy vị rong biển được đóng hộp nhỏ gọn, họa tiết trang trí bên ngoài hộp ngộ nghĩnh, sẽ khiến các em nhỏ thích thú khi sử dụng.', 'https://res.cloudinary.com/dqhdsyaqo/image/upload/v1759944435/cake-fantasy/olnq3rcmuez2rlywvq6a.webp', 'cake-fantasy/olnq3rcmuez2rlywvq6a', 'Cake', 0, 'ITEM-003-429479', NULL, 10, 5, 15000.00, 17000.00, 'piece', 0, 1.000, 1.000, 70.000, 'g', 6),
(5, 'Bánh Hạt dinh dưỡng Goute', 'Bánh Hạt Dinh Dưỡng Goute có hương thơm lừng, cắn vào giòn tan, độ ngọt vừa phải, không tạo cảm giác ngấy.\r\n\r\nBánh cung cấp chất dinh dưỡng và năng lượng cho cơ thể hoạt động suốt ngày dài.\r\n\r\nThành phần: Bột mì, dầu dừa, đường, shortening, hạt mè trắng, sữa tươi, bột whey, mạch nha, chất tạo xốp, bơ, tinh bột bắp, hạt mè đen, yến mạch, muối i-ốt, gia vị muối, chất ổn định, bột phô mai, đường dextrose, dầu mè, hành lá sấy, hạt diêm mạch đỏ, hạt chia đen, hương hành tím tự nhiên, nước tương, chất xử lý bột, chất tạo màu tổng hợp.\r\n\r\nSử dụng: Dùng trực tiếp ngay khi mở bao bì sản phẩm. Hướng dẫn sử dụng: Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Xuất xứ: Việt Nam.\r\n', 'https://res.cloudinary.com/dqhdsyaqo/image/upload/v1759944511/cake-fantasy/vastkhvcdxyc3oagp8uw.webp', 'cake-fantasy/vastkhvcdxyc3oagp8uw', 'Cake', 0, 'ITEM-004-505922', NULL, 10, 5, 40000.00, 43000.00, 'piece', 0, 1.000, 1.000, 316.000, 'g', 8),
(6, 'Bánh AFC Kinh Đô Vị Rau Cải ', 'Bánh AFC Kinh Đô Vị Rau Cải chứa nhiều thành phần dưỡng chất, thích hợp làm món ăn nhẹ bổ dưỡng cho những người bận rộn.\r\n\r\nBánh được làm từ những thành phần giàu chất dinh dưỡng, cung cấp năng lượng, protein, chất xơ, đặc biệt là vitamin D và canxi cho cơ thể thêm khỏe mạnh.\r\n\r\nThành phần: Bột mì, dầu thực vật (dầu cọ), shortening (dầu cọ), đường, chất xơ, mạch nha, chất béo thay thế bơ,...', 'https://res.cloudinary.com/dqhdsyaqo/image/upload/v1759944584/cake-fantasy/azjz3b2xvvkizi5evwky.webp', 'cake-fantasy/azjz3b2xvvkizi5evwky', 'Cake', 0, 'ITEM-005-579070', NULL, 10, 5, 33000.00, 37000.00, 'piece', 0, 1.000, 1.000, 258.000, 'g', 24),
(7, 'Baking soda Caster', 'Baking soda Caster là một loại bột mịn màu trắng, nguyên liệu an toàn được sử dụng trong ngành thực phẩm, làm bánh và trong cả đời sống hằng ngày. Sản phẩm có giá thành rẻ, an toàn, dễ sử dụng và bảo quản, trong làm bánh được dùng để tạo độ phồng hay giòn cho bánh.', 'https://res.cloudinary.com/dqhdsyaqo/image/upload/v1759944763/cake-fantasy/ncfgq8rfarbmtyhq0til.jpg', 'cake-fantasy/ncfgq8rfarbmtyhq0til', 'Cake Ingredients', 0, 'ING-001-757476', NULL, 10, 5, 23000.00, 25000.00, 'piece', 0, 50.000, 10.000, 450.000, 'g', NULL),
(8, 'Bơ thơm Margarine Cái Lân Calofic', 'Bơ thơm Margarine Cái Lân Calofic là loại nguyên liệu cơ bản giá rẻ được dùng nhiều trong quá trình làm các loại bánh có hương vị thơm ngon. Sản phẩm được sản xuất trong nước với nguồn nguyên liệu sẵn có, công nghệ hiện đại giúp giá thành rẻ hơn, phù hợp với đa số người dùng trong nước. ', 'https://res.cloudinary.com/dqhdsyaqo/image/upload/v1759944867/cake-fantasy/ttyjd1dzyqljvhsnsmxn.jpg', 'cake-fantasy/ttyjd1dzyqljvhsnsmxn', 'Cake Ingredients', 0, 'ITEM-006-861732', NULL, 10, 5, 800000.00, 840000.00, 'piece', 0, 1.000, 1.000, 20000.000, 'g', NULL),
(9, 'Bột bánh mì Bakers', 'Bột bánh mì bakers là bột mì cao cấp chuyên dùng để làm các loại bánh mì cao cấp, bánh mì sandwich, bánh mì baguette, bánh pizza, bánh croissant bánh nướng Đan Mạch.', 'https://res.cloudinary.com/dqhdsyaqo/image/upload/v1759944991/cake-fantasy/nhjq9u3mrelqa1evbeyo.jpg', 'cake-fantasy/nhjq9u3mrelqa1evbeyo', 'Cake Ingredients', 0, 'ING-002-985611', NULL, 10, 5, 25000.00, 29000.00, 'piece', 0, 50.000, 10.000, NULL, 'g', NULL),
(10, 'Bong bóng sinh nhật phi hành gia', 'Bong bóng sinh nhật phi hành gia', 'https://res.cloudinary.com/dqhdsyaqo/image/upload/v1759946741/cake-fantasy/ioql57iug1zq15vh7gb0.jpg', 'cake-fantasy/ioql57iug1zq15vh7gb0', 'Party Items', 0, 'PRTY-001-736048', NULL, 9, 5, 300000.00, 350000.00, 'piece', 0, 1.000, 1.000, NULL, NULL, NULL),
(11, 'CCc', 'sdawdas', 'https://res.cloudinary.com/dqhdsyaqo/image/upload/v1760196418/cake-fantasy/j2lkxv47wk6ewiwq0dex.png', 'cake-fantasy/j2lkxv47wk6ewiwq0dex', 'Cake', 0, 'ITEM-006-416523', NULL, 10, 5, 12321.00, 12312.00, 'piece', 0, 1.000, 1.000, NULL, NULL, NULL);

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
(1, 7, 0.00, '', 'cart', 0, '', '', '', NULL, NULL, '2025-10-08 18:52:06', '2025-10-08 18:52:06'),
(2, 7, 285000.00, 'ádasdasd', 'Item Processing', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-08 18:52:24', '2025-10-08 18:52:25'),
(3, 7, 312000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Item Processing', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-08 18:54:39', '2025-10-08 18:54:40'),
(4, 7, 168000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Item Processing', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-08 18:55:23', '2025-10-08 18:55:24'),
(5, 7, 555000.00, 'ádasd', 'Item Processing', 1, 'dá', 'đâs', '0134567894', NULL, NULL, '2025-10-08 18:58:42', '2025-10-08 18:58:43'),
(6, 7, 285000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Item Processing', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-08 19:01:20', '2025-10-10 17:27:44'),
(7, 7, 365000.00, 'Hẻm 618 Âu Cơ , Phường Bảy Hiền, Thành phố Hồ Chí Minh, 72012', 'Item Processing', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-11 08:59:47', '2025-10-11 08:59:48'),
(8, 7, 42000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Item Processing', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-11 09:03:43', '2025-10-11 09:03:44'),
(9, 7, 42000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Item Processing', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-11 09:07:15', '2025-10-11 09:07:16'),
(10, 7, 42000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Item Processing', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-11 09:10:24', '2025-10-11 09:10:25'),
(11, 7, 42000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Item Processing', 1, 'Duy ', 'Toàn', '01345678213', NULL, NULL, '2025-10-11 09:12:31', '2025-10-11 09:12:32'),
(12, 7, 42000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Item Processing', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-11 09:13:32', '2025-10-11 09:13:33'),
(13, 7, 42000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Item Processing', 1, 'Duy ', 'Toàn', '01345678213', NULL, NULL, '2025-10-11 09:15:26', '2025-10-11 09:15:27'),
(14, 7, 42000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Delivered', 0, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-11 09:15:58', '2025-10-15 16:13:44'),
(15, 7, 96000.00, 'Hẻm 285 Cách Mạng Tháng 8 285/36, Phường Hòa Hưng, Thành phố Thủ Đức, 70001', 'Delivered', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-11 09:17:46', '2025-10-15 16:14:31'),
(16, 7, 96000.00, 'qư', 'Cancelled', 1, 'ưewq', 'ewqeqw', '0134567894', NULL, NULL, '2025-10-11 11:03:54', '2025-10-15 15:00:31'),
(17, 7, 42000.00, 'Hẻm 411 Kênh Tân Hóa , Phường Tân Phú, Thành phố Hồ Chí Minh, 72012', 'Item Processing', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-25 13:05:01', '2025-10-25 13:05:02'),
(18, 7, 96000.00, 'Hẻm 411 Kênh Tân Hóa , Phường Tân Phú, Thành phố Hồ Chí Minh, 72012', 'Item Processing', 1, 'Duy ', 'Toàn', '0134567894', NULL, NULL, '2025-10-25 13:08:18', '2025-10-25 13:08:19');

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
(3, 2, 2, 10, 27000.00),
(15, 3, 3, 10, 27000.00),
(31, 4, 4, 9, 17000.00),
(50, 5, 2, 10, 27000.00),
(51, 5, 3, 10, 27000.00),
(62, 6, 2, 10, 27000.00),
(135, 7, 10, 1, 350000.00),
(136, 8, 2, 1, 27000.00),
(137, 9, 2, 1, 27000.00),
(138, 10, 2, 1, 27000.00),
(139, 11, 2, 1, 27000.00),
(140, 12, 2, 1, 27000.00),
(141, 13, 2, 1, 27000.00),
(142, 14, 2, 1, 27000.00),
(143, 15, 3, 3, 27000.00),
(146, 16, 2, 3, 27000.00),
(156, 17, 2, 1, 27000.00),
(170, 18, 2, 3, 27000.00);

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

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `item_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
(3, 7, 3, 5, 'Good', '2025-10-08 19:05:32', '2025-10-08 19:05:37');

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
(1, 'CC NL SUKEM', 'Nguyễn Văn A', 'abc@gmail.com', '0352773474', 'HCM', 'Nguyên liệu sukem', 0, '2025-10-06 21:10:47', '2025-10-08 18:11:11'),
(2, 'NCC Bánh', 'Nguyễn Văn A', 'nguyenvana@gmail.com', '0987654321', 'Hồ Chí Minh', NULL, 1, '2025-10-08 18:12:02', '2025-10-08 18:12:02'),
(3, 'NCC Nguyên liệu', 'Nguyễn Văn B', 'nguyenvanb@gmail.com', '0987654322', 'Hồ Chí Minh', NULL, 1, '2025-10-08 18:12:44', '2025-10-08 18:12:44'),
(4, 'NCC Đồ trang trí', 'Nguyễn Văn C', 'nguyenvanc@gmail.com', '0987654323', 'Hồ Chí Minh', NULL, 1, '2025-10-08 18:13:41', '2025-10-08 18:13:41');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `grn_details`
--
ALTER TABLE `grn_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `grn_headers`
--
ALTER TABLE `grn_headers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=171;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
