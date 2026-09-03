CREATE INDEX `categories_sort_order_idx` ON `divisions` (`sort_order`);
--> statement-breakpoint
-- Backfill: compact sort_order into distinct sequential values (0..n) following each
-- row's CURRENT relative order (sort_order, then id as tiebreaker), so admins who never
-- touched sort_order (mostly 0s) get a stable starting order and nothing visibly jumps
-- the moment drag-and-drop reordering ships.
UPDATE `divisions` d
JOIN (
	SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order ASC, id ASC) - 1 AS new_sort_order
	FROM `divisions`
) ranked ON ranked.id = d.id
SET d.sort_order = ranked.new_sort_order;