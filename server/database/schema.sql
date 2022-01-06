CREATE SCHEMA IF NOT EXISTS tezpay;

CREATE TABLE IF NOT EXISTS tezpay.payments
(
	external_id character varying(128) NOT NULL,
	mutez_amount numeric(18) NOT NULL,
	receiver_address character(36) NOT NULL,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	last_updated_at timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT payments_pkey PRIMARY KEY (external_id)
);

CREATE TABLE IF NOT EXISTS tezpay.receipts
(
	id SERIAL,
	payment_id character varying(128) NOT NULL,
	mutez_amount numeric(18) NOT NULL,
	receiver_address character(36) NOT NULL,
	opg_hash character(51) NOT NULL,
--	operation_index integer NOT NULL,
--	internal_operation_index integer,
	signed_by_address character(36) NOT NULL,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	last_updated_at timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT receipts_pkey PRIMARY KEY (id),
	CONSTRAINT fk_receipt_payment FOREIGN KEY (payment_id)
		REFERENCES tezpay.payments (external_id) MATCH SIMPLE
		ON UPDATE NO ACTION
		ON DELETE NO ACTION
);

-- CREATE TABLE IF NOT EXISTS tezpay.refunds
-- (
-- 	id SERIAL,
-- 	opg_hash character(51) NOT NULL,
-- 	peppermint_opid integer NOT NULL,
-- 	created_at timestamp with time zone NOT NULL DEFAULT now(),
-- 	last_updated_at timestamp with time zone NOT NULL DEFAULT now(),
-- 	CONSTRAINT refunds_pkey PRIMARY KEY (id)
-- );

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

DO $$ BEGIN
CREATE TRIGGER update_receipts_last_updated_at
    BEFORE UPDATE
    ON tezpay.receipts
    FOR EACH ROW
    EXECUTE FUNCTION tezpay.update_last_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- DO $$ BEGIN
-- CREATE TRIGGER update_refunds_last_updated_at
--     BEFORE UPDATE
--     ON tezpay.refunds
--     FOR EACH ROW
--     EXECUTE FUNCTION tezpay.update_last_updated_at_column();
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;