"use strict";

import { SigningType } from "@airgap/beacon-sdk";
import { char2Bytes } from "@taquito/utils";

export function generate_receipt_payload({ dapp_url, tez_amount, receiver_address, message, opg_hash }) {
	let receipt = `Tezos Signed Message: ${dapp_url} ${new Date().toISOString()} Payment slip for ${tez_amount} tez to ${receiver_address} with message '${message}' and on-chain locator ${opg_hash}`
	console.log(receipt);
	let receipt_hex = char2Bytes(receipt);
	let receipt_length_hex = (~~(receipt_hex.length / 2)).toString(16).padStart(8, '0');
	let payload = '0501' + receipt_length_hex + receipt_hex;
	return payload;
};

export async function sign_well_formed_payload(payload, beacon_dappclient) {
	let acct = await beacon_dappclient.getActiveAccount();
	const response = await beacon_dappclient.requestSignPayload({
		signingType: SigningType.MICHELINE,
		payload
	});
	if (response.signature) {
		return {
			payload,
			signature: response.signature,
			public_key: acct.publicKey
		};
	}
	return null;
};
