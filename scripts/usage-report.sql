-- Read-only operational measurements; no guest names, emails or notes.
SELECT pg_database_size(current_database()) AS database_bytes,
       300000000 AS database_warning_bytes, 400000000 AS database_action_bytes;
SELECT bucket_id, count(*) AS objects,
       coalesce(sum((metadata->>'size')::bigint),0) AS stored_bytes,
       700000000 AS storage_warning_bytes, 850000000 AS storage_action_bytes
FROM storage.objects GROUP BY bucket_id;
SELECT status, count(*) AS invitations,
       coalesce(max(octet_length(event_data::text)),0) AS largest_event_json_bytes,
       coalesce(max(octet_length(design_data::text)),0) AS largest_design_json_bytes
FROM public.invitations GROUP BY status;
-- Cached/uncached egress and Cloudflare build quotas must be read in the
-- provider usage dashboards. They cannot be inferred from these SQL totals.
