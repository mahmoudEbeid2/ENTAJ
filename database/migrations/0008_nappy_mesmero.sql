CREATE TABLE `product_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`type` enum('msds','coa') NOT NULL,
	`file_path` varchar(500) NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_size_bytes` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_documents_product_type_unique` UNIQUE(`product_id`,`type`)
);
--> statement-breakpoint
ALTER TABLE `product_documents` ADD CONSTRAINT `product_documents_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `product_documents_product_id_idx` ON `product_documents` (`product_id`);