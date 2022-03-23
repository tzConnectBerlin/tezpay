"use strict";

const get_transfer_object = async function(tezos, { paypoint_contract_address, amount, message } ) {
	let paypoint_contract = await tezos.contract.at(paypoint_contract_address);
	let transfer = paypoint_contract.methods.main(message).toTransferParams();
	transfer.amount = amount;
	return transfer;
}
