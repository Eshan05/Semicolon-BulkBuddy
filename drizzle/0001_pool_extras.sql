ALTER TABLE pool_participant ADD COLUMN is_anonymous integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE pool_participant ADD COLUMN display_name text;
--> statement-breakpoint
CREATE TABLE `pool_vibe_check` (
  `id` text PRIMARY KEY NOT NULL,
  `pool_id` text NOT NULL REFERENCES pool(id) ON DELETE cascade,
  `user_id` text NOT NULL REFERENCES user(id) ON DELETE cascade,
  `matched_specs` integer NOT NULL,
  `chat_helpful` integer NOT NULL,
  `would_pool_again` integer NOT NULL,
  `comment` text,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX pool_vibe_check_unique ON pool_vibe_check(pool_id, user_id);
--> statement-breakpoint
CREATE INDEX pool_vibe_check_pool_idx ON pool_vibe_check(pool_id);
--> statement-breakpoint
CREATE INDEX pool_vibe_check_user_idx ON pool_vibe_check(user_id);
