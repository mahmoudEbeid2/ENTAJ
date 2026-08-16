CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`admin_id` int,
	`action` varchar(100) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` int,
	`meta` json,
	`ip_address` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role_id` int NOT NULL,
	`avatar_path` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `admins_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` int NOT NULL,
	`permission_id` int NOT NULL,
	CONSTRAINT `role_permissions_role_id_permission_id_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `divisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(150) NOT NULL,
	`name` varchar(255) NOT NULL,
	`subtitle` varchar(255),
	`numeral` varchar(20),
	`description` varchar(1000),
	`image_path` varchar(500),
	`cta_label` varchar(100) DEFAULT 'GO TO PRODUCTS',
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `divisions_id` PRIMARY KEY(`id`),
	CONSTRAINT `divisions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`division_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`spec` varchar(255),
	`description` varchar(500),
	`image_path` varchar(500),
	`is_recommended` boolean NOT NULL DEFAULT false,
	`is_featured` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cta_panels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` enum('quality_compliance','home_contact_cta','about_contact_cta') NOT NULL,
	`heading` varchar(255) NOT NULL,
	`body` varchar(2000) NOT NULL,
	`icon_path` varchar(500),
	`illustration_path` varchar(500),
	`button_label` varchar(100),
	`button_href` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cta_panels_id` PRIMARY KEY(`id`),
	CONSTRAINT `cta_panels_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `hero_slides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page` enum('home','about','divisions','contact') NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(500),
	`image_path` varchar(500) NOT NULL,
	`cta_primary_label` varchar(100),
	`cta_primary_href` varchar(255),
	`cta_secondary_label` varchar(100),
	`cta_secondary_href` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hero_slides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `market_regions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`countries` varchar(500) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `market_regions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page` enum('home','about','divisions','contact') NOT NULL,
	`section_key` varchar(100) NOT NULL,
	`eyebrow` varchar(150),
	`heading` varchar(500),
	`subheading` varchar(500),
	`body` varchar(3000),
	`image_path` varchar(500),
	`extra` json,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `page_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page` enum('home','about','divisions','contact') NOT NULL,
	`variant` enum('counter','timeline') NOT NULL DEFAULT 'counter',
	`value` varchar(50) NOT NULL,
	`label` varchar(150) NOT NULL,
	`icon_path` varchar(500),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `value_props` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(1000) NOT NULL,
	`home_icon_path` varchar(500),
	`about_icon_path` varchar(500),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `value_props_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `why_us_features` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(1000) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `why_us_features_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`full_name` varchar(150) NOT NULL,
	`company` varchar(150),
	`phone` varchar(50),
	`email` varchar(255) NOT NULL,
	`division_id` int,
	`message` varchar(3000) NOT NULL,
	`status` enum('new','read','archived') NOT NULL DEFAULT 'new',
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(150) NOT NULL,
	`address` varchar(500) NOT NULL,
	`flag_icon_path` varchar(500),
	`is_primary` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nav_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`menu_key` enum('header','footer') NOT NULL,
	`label` varchar(100) NOT NULL,
	`href` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nav_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seo_meta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page_slug` enum('home','about','divisions','contact') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(500) NOT NULL,
	`keywords` varchar(500),
	`og_image_path` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seo_meta_id` PRIMARY KEY(`id`),
	CONSTRAINT `seo_meta_page_slug_unique` UNIQUE(`page_slug`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_name` varchar(150) NOT NULL DEFAULT 'ENTAJ',
	`tagline` varchar(255),
	`footer_tagline` varchar(500),
	`established_year` varchar(10),
	`parent_company` varchar(150),
	`logo_path` varchar(500),
	`logo_lockup_path` varchar(500),
	`favicon_path` varchar(500),
	`contact_email` varchar(255),
	`contact_website` varchar(255),
	`contact_phone` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('facebook','instagram','linkedin','youtube') NOT NULL,
	`url` varchar(500) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `social_links_platform_unique` UNIQUE(`platform`)
);
--> statement-breakpoint
CREATE TABLE `media_library` (
	`id` int AUTO_INCREMENT NOT NULL,
	`disk_path` varchar(500) NOT NULL,
	`original_filename` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`size_bytes` int NOT NULL,
	`width` int,
	`height` int,
	`alt_text` varchar(255),
	`category` enum('products','categories','blog','services','partners','testimonials','pages','settings') NOT NULL,
	`uploaded_by_admin_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `media_library_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_library_disk_path_unique` UNIQUE(`disk_path`)
);
--> statement-breakpoint
CREATE TABLE `blog_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` varchar(500),
	`content` text NOT NULL,
	`cover_image_path` varchar(500),
	`author_admin_id` int,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`published_at` timestamp,
	`seo_title` varchar(255),
	`seo_description` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` varchar(500) NOT NULL,
	`answer` varchar(2000) NOT NULL,
	`category` varchar(100),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`seo_title` varchar(255),
	`seo_description` varchar(500),
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`logo_path` varchar(500) NOT NULL,
	`website_url` varchar(500),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` varchar(2000) NOT NULL,
	`icon_path` varchar(500),
	`image_path` varchar(500),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`author_name` varchar(150) NOT NULL,
	`author_role` varchar(150),
	`company` varchar(150),
	`avatar_path` varchar(500),
	`quote` varchar(1000) NOT NULL,
	`rating` int,
	`is_featured` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_admin_id_admins_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admins` ADD CONSTRAINT `admins_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_division_id_divisions_id_fk` FOREIGN KEY (`division_id`) REFERENCES `divisions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD CONSTRAINT `contact_messages_division_id_divisions_id_fk` FOREIGN KEY (`division_id`) REFERENCES `divisions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_library` ADD CONSTRAINT `media_library_uploaded_by_admin_id_admins_id_fk` FOREIGN KEY (`uploaded_by_admin_id`) REFERENCES `admins`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_category_id_blog_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_author_admin_id_admins_id_fk` FOREIGN KEY (`author_admin_id`) REFERENCES `admins`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `activity_logs_admin_id_idx` ON `activity_logs` (`admin_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_entity_idx` ON `activity_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `admins_role_id_idx` ON `admins` (`role_id`);--> statement-breakpoint
CREATE INDEX `products_division_id_idx` ON `products` (`division_id`);--> statement-breakpoint
CREATE INDEX `products_is_recommended_idx` ON `products` (`is_recommended`);--> statement-breakpoint
CREATE INDEX `hero_slides_page_idx` ON `hero_slides` (`page`);--> statement-breakpoint
CREATE INDEX `page_sections_page_section_key_idx` ON `page_sections` (`page`,`section_key`);--> statement-breakpoint
CREATE INDEX `stats_page_variant_idx` ON `stats` (`page`,`variant`);--> statement-breakpoint
CREATE INDEX `contact_messages_status_idx` ON `contact_messages` (`status`);--> statement-breakpoint
CREATE INDEX `contact_messages_division_id_idx` ON `contact_messages` (`division_id`);--> statement-breakpoint
CREATE INDEX `nav_items_menu_key_idx` ON `nav_items` (`menu_key`);--> statement-breakpoint
CREATE INDEX `seo_meta_page_slug_idx` ON `seo_meta` (`page_slug`);--> statement-breakpoint
CREATE INDEX `media_library_category_idx` ON `media_library` (`category`);--> statement-breakpoint
CREATE INDEX `blog_posts_category_id_idx` ON `blog_posts` (`category_id`);--> statement-breakpoint
CREATE INDEX `blog_posts_status_idx` ON `blog_posts` (`status`);--> statement-breakpoint
CREATE INDEX `pages_slug_idx` ON `pages` (`slug`);--> statement-breakpoint
CREATE INDEX `services_slug_idx` ON `services` (`slug`);