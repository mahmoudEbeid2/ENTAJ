CREATE TABLE `division_spec_rows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`division_id` int NOT NULL,
	`product_id` int,
	`name` varchar(255) NOT NULL,
	`spec` varchar(255),
	`description` varchar(500),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `division_spec_rows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `division_spec_rows` ADD CONSTRAINT `division_spec_rows_division_id_divisions_id_fk` FOREIGN KEY (`division_id`) REFERENCES `divisions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `division_spec_rows` ADD CONSTRAINT `division_spec_rows_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `division_spec_rows_division_id_idx` ON `division_spec_rows` (`division_id`);