CREATE TABLE `ailment_therapies` (
	`ailment_id` integer NOT NULL,
	`therapy_id` integer NOT NULL,
	PRIMARY KEY(`ailment_id`, `therapy_id`),
	FOREIGN KEY (`ailment_id`) REFERENCES `ailments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`therapy_id`) REFERENCES `therapies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ailment_therapies_therapy_id_idx` ON `ailment_therapies` (`therapy_id`);--> statement-breakpoint
CREATE TABLE `therapies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`duration_minutes` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `therapies_name_unique` ON `therapies` (`name`);