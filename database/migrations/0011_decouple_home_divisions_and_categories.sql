CREATE TABLE IF NOT EXISTS `home_divisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(150),
	`numeral` varchar(20),
	`name` varchar(255) NOT NULL,
	`subtitle` varchar(255),
	`description` varchar(1000),
	`image_path` varchar(500),
	`href` varchar(255),
	`cta_label` varchar(100) DEFAULT 'GO TO PRODUCTS',
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `home_divisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `divisions` ADD `icon_path` varchar(500);
--> statement-breakpoint
ALTER TABLE `divisions` ADD `bg_color` varchar(50);
--> statement-breakpoint
INSERT INTO `home_divisions` (`id`, `slug`, `numeral`, `name`, `subtitle`, `description`, `image_path`, `href`, `cta_label`, `sort_order`, `is_active`, `created_at`, `updated_at`)
SELECT 1, 'animal-nutrition', 'Division 1', 'Animal Nutrition & Veterinary Raw Materials', 'The Building Blocks of Animal Health Start Here', NULL, 'categories/division-animal-nutrition.png', '/divisions#animal-nutrition', 'GO TO PRODUCTS', 0, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `home_divisions` WHERE `id` = 1 OR `slug` = 'animal-nutrition' OR `numeral` = 'Division 1');
--> statement-breakpoint
INSERT INTO `home_divisions` (`id`, `slug`, `numeral`, `name`, `subtitle`, `description`, `image_path`, `href`, `cta_label`, `sort_order`, `is_active`, `created_at`, `updated_at`)
SELECT 2, 'water-treatment', 'Division 2', 'Water Treatment Chemicals', 'Clean Water Demands Reliable Chemistry.', NULL, 'categories/division-water-treatment.png', '/divisions#water-treatment', 'GO TO PRODUCTS', 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `home_divisions` WHERE `id` = 2 OR `slug` = 'water-treatment' OR `numeral` = 'Division 2');
--> statement-breakpoint
INSERT INTO `home_divisions` (`id`, `slug`, `numeral`, `name`, `subtitle`, `description`, `image_path`, `href`, `cta_label`, `sort_order`, `is_active`, `created_at`, `updated_at`)
SELECT 3, 'base-oils', 'Division 3', 'Base Oils & Petroleum Products', 'Precision-Grade Base Oils for Industrial Applications.', NULL, 'categories/division-base-oils.png', '/divisions#base-oils', 'GO TO PRODUCTS', 2, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `home_divisions` WHERE `id` = 3 OR `slug` = 'base-oils' OR `numeral` = 'Division 3');
--> statement-breakpoint
UPDATE `divisions` SET `icon_path` = '/assets/icons/icon-category-feed-additives.png', `bg_color` = '#34C759', `short_name` = 'Animal Nutrition' WHERE `slug` = 'animal-nutrition';
--> statement-breakpoint
UPDATE `divisions` SET `icon_path` = '/assets/icons/icon-category-water-treatment.svg', `bg_color` = '#4EC5F9', `short_name` = 'Water Treatment' WHERE `slug` = 'water-treatment';
--> statement-breakpoint
UPDATE `divisions` SET `icon_path` = '/assets/icons/icon-category-base-oils.svg', `bg_color` = '#F7DA8D', `short_name` = 'Base Oils' WHERE `slug` = 'base-oils';
--> statement-breakpoint
INSERT INTO `divisions` (`slug`, `name`, `short_name`, `icon_path`, `bg_color`, `sort_order`, `is_active`)
SELECT 'industrial-laundry-detergent', 'Industrial Laundry Detergent', 'Industrial Laundry', '/assets/icons/icon-category-industrial-laundry.svg', '#FF6060', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM `divisions` WHERE `slug` = 'industrial-laundry-detergent');
--> statement-breakpoint
UPDATE `divisions` SET `icon_path` = '/assets/icons/icon-category-industrial-laundry.svg', `bg_color` = '#FF6060', `short_name` = 'Industrial Laundry' WHERE `slug` = 'industrial-laundry-detergent';
--> statement-breakpoint
INSERT INTO `divisions` (`slug`, `name`, `short_name`, `icon_path`, `bg_color`, `sort_order`, `is_active`)
SELECT 'glass-manufacturing-raw-materials', 'Glass Manufacturing Raw Materials', 'Glass Manufacturing', '/assets/icons/icon-category-glass-manufacturing.svg', '#BEBEBE', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM `divisions` WHERE `slug` = 'glass-manufacturing-raw-materials');
--> statement-breakpoint
UPDATE `divisions` SET `icon_path` = '/assets/icons/icon-category-glass-manufacturing.svg', `bg_color` = '#BEBEBE', `short_name` = 'Glass Manufacturing' WHERE `slug` = 'glass-manufacturing-raw-materials';
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Sodium Bicarbonate' LIMIT 1), 'Sodium Bicarbonate', 'Feed Grade / Food Grade', 'Rumen buffer, heat stress, electrolytes', 0, 1
FROM `divisions` d WHERE d.slug = 'animal-nutrition'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Sodium Bicarbonate');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Sodium Carbonate (Soda Ash)' LIMIT 1), 'Sodium Carbonate (Soda Ash)', 'Dense / Light', 'pH regulation, feed processing', 1, 1
FROM `divisions` d WHERE d.slug = 'animal-nutrition'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Sodium Carbonate (Soda Ash)');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Potassium Chloride' LIMIT 1), 'Potassium Chloride', 'Min. 96%', 'Electrolyte formulations', 2, 1
FROM `divisions` d WHERE d.slug = 'animal-nutrition'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Potassium Chloride');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Magnesium Chloride' LIMIT 1), 'Magnesium Chloride', 'Min. 97%', 'Mineral supplements, anti-tetany', 3, 1
FROM `divisions` d WHERE d.slug = 'animal-nutrition'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Magnesium Chloride');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Calcium Chloride' LIMIT 1), 'Calcium Chloride', '77% / 94%', 'Milk fever treatment, mineral balance', 4, 1
FROM `divisions` d WHERE d.slug = 'animal-nutrition'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Calcium Chloride');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Ammonium Sulfate' LIMIT 1), 'Ammonium Sulfate', 'Min. 98%', 'Non-protein nitrogen for ruminants', 5, 1
FROM `divisions` d WHERE d.slug = 'animal-nutrition'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Ammonium Sulfate');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Humic Acid' LIMIT 1), 'Humic Acid', 'Min. 70% Solid', 'Gut health, mineral absorption', 6, 1
FROM `divisions` d WHERE d.slug = 'animal-nutrition'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Humic Acid');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Dolomite' LIMIT 1), 'Dolomite', 'Feed Grade', 'Calcium & magnesium supplement', 7, 1
FROM `divisions` d WHERE d.slug = 'animal-nutrition'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Dolomite');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Sodium Chloride' LIMIT 1), 'Sodium Chloride', 'Min. 99%', 'Electrolyte, feed mineral', 8, 1
FROM `divisions` d WHERE d.slug = 'animal-nutrition'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Sodium Chloride');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Bentonite' LIMIT 1), 'Bentonite', 'Feed Grade', 'Mycotoxin binder, pellet binder', 9, 1
FROM `divisions` d WHERE d.slug = 'animal-nutrition'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Bentonite');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Poly Aluminium Chloride (PAC 18-30%)' LIMIT 1), 'Poly Aluminium Chloride (PAC 18-30%)', 'Drinking Water Grade / Industrial', 'Coagulation & flocculation, turbidity removal', 0, 1
FROM `divisions` d WHERE d.slug = 'water-treatment'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Poly Aluminium Chloride (PAC 18-30%)');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Sodium Metabisulphite' LIMIT 1), 'Sodium Metabisulphite', 'Min. 97%', 'Dechlorination, RO membrane protection', 1, 1
FROM `divisions` d WHERE d.slug = 'water-treatment'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Sodium Metabisulphite');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Magnesium Hydroxide' LIMIT 1), 'Magnesium Hydroxide', 'Min. 96%', 'pH correction, brine treatment', 2, 1
FROM `divisions` d WHERE d.slug = 'water-treatment'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Magnesium Hydroxide');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Sodium Hydroxide (Caustic Soda)' LIMIT 1), 'Sodium Hydroxide (Caustic Soda)', 'Min. 98%', 'pH adjustment, post-treatment remineralization', 3, 1
FROM `divisions` d WHERE d.slug = 'water-treatment'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Sodium Hydroxide (Caustic Soda)');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Calcium Chloride' LIMIT 1), 'Calcium Chloride', 'Flakes / 50%', 'Remineralization of desalinated water', 4, 1
FROM `divisions` d WHERE d.slug = 'water-treatment'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Calcium Chloride');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Sodium Carbonate' LIMIT 1), 'Sodium Carbonate', 'Liquid 77% / 94%', 'Water softening, alkalinity adjustment', 5, 1
FROM `divisions` d WHERE d.slug = 'water-treatment'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Sodium Carbonate');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Antiscalant (BW60 & RO Series)' LIMIT 1), 'Antiscalant (BW60 & RO Series)', 'Min. 99%', 'Scale prevention on RO membranes', 6, 1
FROM `divisions` d WHERE d.slug = 'water-treatment'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Antiscalant (BW60 & RO Series)');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Calcium Hypochlorite' LIMIT 1), 'Calcium Hypochlorite', 'Various / 65-70%', 'Disinfection & shock chlorination', 7, 1
FROM `divisions` d WHERE d.slug = 'water-treatment'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Calcium Hypochlorite');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Base Oil' LIMIT 1), 'Base Oil', 'SN 150 / SN 500 / SN 600', 'Lubricants, industrial oils, transformer oils', 0, 1
FROM `divisions` d WHERE d.slug = 'base-oils'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Base Oil');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Bitumen' LIMIT 1), 'Bitumen', '40/50, 50/70, 60/70, 80/100', 'Road paving, waterproofing, infrastructure', 1, 1
FROM `divisions` d WHERE d.slug = 'base-oils'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Bitumen');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Oxidized Bitumen' LIMIT 1), 'Oxidized Bitumen', '75/25, 85/25, 90/15, 115/15', 'Industrial coating, cable filling, roofing', 2, 1
FROM `divisions` d WHERE d.slug = 'base-oils'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Oxidized Bitumen');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, (SELECT p.id FROM `products` p WHERE p.division_id = d.id AND p.name = 'Bitumen Emulsion' LIMIT 1), 'Bitumen Emulsion', 'SS1, RS1, RS2, MS1, CMS2', 'Road maintenance, cold-mix applications', 3, 1
FROM `divisions` d WHERE d.slug = 'base-oils'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Bitumen Emulsion');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, NULL, 'Base Oil', 'SN 150 / SN 500 / SN 600', 'Lubricants, industrial oils, transformer oils', 0, 1
FROM `divisions` d WHERE d.slug = 'industrial-laundry-detergent'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Base Oil');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, NULL, 'Bitumen', '40/50, 50/70, 60/70, 80/100', 'Road paving, waterproofing, infrastructure', 1, 1
FROM `divisions` d WHERE d.slug = 'industrial-laundry-detergent'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Bitumen');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, NULL, 'Base Oil', 'SN 150 / SN 500 / SN 600', 'Lubricants, industrial oils, transformer oils', 0, 1
FROM `divisions` d WHERE d.slug = 'glass-manufacturing-raw-materials'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Base Oil');
--> statement-breakpoint
INSERT INTO `division_spec_rows` (`division_id`, `product_id`, `name`, `spec`, `description`, `sort_order`, `is_active`)
SELECT d.id, NULL, 'Bitumen', '40/50, 50/70, 60/70, 80/100', 'Road paving, waterproofing, infrastructure', 1, 1
FROM `divisions` d WHERE d.slug = 'glass-manufacturing-raw-materials'
AND NOT EXISTS (SELECT 1 FROM `division_spec_rows` sr WHERE sr.division_id = d.id AND sr.name = 'Bitumen');
