ALTER TABLE `cta_panels` ADD `variant` enum('dark','light') DEFAULT 'dark' NOT NULL;--> statement-breakpoint
ALTER TABLE `cta_panels` ADD `subheading` varchar(255);