"use strict";

const get_transfer_object = async function(tezos, { receiver_address, mutez_amount, message } ) {
	let paypoint_contract = await tezos.contract.at(receiver_address);
	let transfer = paypoint_contract.methods.default(message).toTransferParams();
	transfer.mutez = true;
	transfer.amount = mutez_amount;
	return transfer;
}

export default { get_transfer_object };