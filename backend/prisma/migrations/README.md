# Auth0 Migration

This migration:
1. Changes User.id from Int to String to support Auth0 sub IDs
2. Removes passwordHash as we're using Auth0 for authentication
3. Updates all related foreign keys
4. Preserves existing data by prefixing old IDs with 'legacy_'

To rollback:
1. Restore from backup
2. Run: psql -U your_username -d your_database < backup.sql 