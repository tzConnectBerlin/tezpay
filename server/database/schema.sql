CREATE SCHEMA IF NOT EXISTS tezpay;

CREATE TABLE IF NOT EXISTS tezpay.payments
(
	external_id character varying(128) NOT NULL,
	mutez_amount numeric(18,0) NOT NULL,
	receiver_address character(36) NOT NULL,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	last_updated_at timestamp with time zone NOT NULL DEFAULT now(),
    is_cancelled boolean NOT NULL DEFAULT false,
	CONSTRAINT payments_pkey PRIMARY KEY (external_id)
);

CREATE OR REPLACE FUNCTION tezpay.update_last_updated_at_column()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
   NEW.last_updated_at = now();
   RETURN NEW;
END;
$BODY$;

DO $$ BEGIN
CREATE TRIGGER update_payments_last_updated_at
    BEFORE UPDATE
    ON tezpay.payments
    FOR EACH ROW
    EXECUTE FUNCTION tezpay.update_last_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
