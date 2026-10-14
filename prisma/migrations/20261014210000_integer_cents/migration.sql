-- Apply only after reviewing reconciliation output and testing a restorable backup.
-- Original column names are retained through Prisma @map; values change from euros to integer cents.
BEGIN;
DO $$
DECLARE money_field RECORD;
DECLARE invalid_count BIGINT;
BEGIN
  FOR money_field IN SELECT * FROM (VALUES
    ('Contract', 'fee'), ('Period', 'fee'), ('Loan', 'fee'), ('Loan', 'initial'), ('Subscription', 'fee')
  ) AS fields(table_name, column_name)
  LOOP
    EXECUTE format('SELECT count(*) FROM %I WHERE %I < 0 OR %I > 21474836.47 OR %I IN (''NaN''::float8, ''Infinity''::float8, ''-Infinity''::float8)', money_field.table_name, money_field.column_name, money_field.column_name, money_field.column_name) INTO invalid_count;
    IF invalid_count > 0 THEN RAISE EXCEPTION 'Money reconciliation required for %.%', money_field.table_name, money_field.column_name; END IF;
  END LOOP;
END $$;
ALTER TABLE "Contract" ALTER COLUMN "fee" TYPE INTEGER USING ROUND("fee"::numeric * 100)::integer;
ALTER TABLE "Period" ALTER COLUMN "fee" TYPE INTEGER USING ROUND("fee"::numeric * 100)::integer;
ALTER TABLE "Loan" ALTER COLUMN "fee" TYPE INTEGER USING ROUND("fee"::numeric * 100)::integer;
ALTER TABLE "Loan" ALTER COLUMN "initial" DROP DEFAULT;
ALTER TABLE "Loan" ALTER COLUMN "initial" TYPE INTEGER USING ROUND("initial"::numeric * 100)::integer;
ALTER TABLE "Loan" ALTER COLUMN "initial" SET DEFAULT 0;
ALTER TABLE "Subscription" ALTER COLUMN "fee" TYPE INTEGER USING ROUND("fee"::numeric * 100)::integer;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_fee_nonnegative" CHECK ("fee" >= 0);
ALTER TABLE "Period" ADD CONSTRAINT "Period_fee_nonnegative" CHECK ("fee" >= 0);
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_fee_nonnegative" CHECK ("fee" >= 0 AND "initial" >= 0);
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_fee_nonnegative" CHECK ("fee" >= 0);
COMMIT;
