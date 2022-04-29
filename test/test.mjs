import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import { v4 as uuidv4 } from 'uuid';
import { createRequire } from 'module'
const require = createRequire(import.meta.url);

const { Pool } = require('pg');
const config = require('./config.json');

import Tezpay from '../server/tezpay.mjs'
import TezpayClient from '../client/client.mjs'

const init = async function({ dbConnection, paypointSchema, confirmations, rpcUrl, privateKey }) {
	let db_pool = new Pool(dbConnection);
	let tezpay = new Tezpay({ paypoint_schema_name: paypointSchema, db_pool, block_confirmations: confirmations});
	const tezos = new TezosToolkit(rpcUrl);
	const signer = new InMemorySigner(privateKey);
	const address = await signer.publicKeyHash();
	console.log("Signer initialized for originating address ", address);
	tezos.setSignerProvider(signer);

	return {
		tezpay,
		tezos
	};
};

const main = async function() {
	console.log('Initializing Tezpay serverside');
	let { tezpay, tezos } = await init(config);

	let payment_id = uuidv4();
	const print_payment_status = async function() {
		let status = await tezpay.get_payment(payment_id);
		console.log("Payment status report:\n", JSON.stringify(status));
		return true;
	}

	let payment_data = await tezpay.init_payment({
		external_id: payment_id,
		mutez_amount: config.mutezAmount
	});
	console.log('Serverside payment object created:\n', JSON.stringify(payment_data));
	await print_payment_status();
	
	let payment_tx = await TezpayClient.get_transfer_object(tezos, payment_data);
	console.log('Payment transaction object created:\n', JSON.stringify(payment_tx));

	let sent_tx = await tezos.wallet.transfer(payment_tx).send();
	let op_hash = sent_tx.opHash;
	console.log('Sent transaction with hash', op_hash, "\n");
	let result = await sent_tx.confirmation(config.block_confirmations + 1);

	console.log('Transaction baked:\n', JSON.stringify(result));
	await print_payment_status();
	
	return true;
}

main();