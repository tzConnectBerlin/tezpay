type storage = address

type argument = string

let pay_address ( payee, payment_amount : address * tez ) : operation =
	let payee_contract : unit contract = Tezos.get_contract_with_error payee "ERROR: invalid payee address" in
	Tezos.transaction unit payment_amount payee_contract

let main ( _, beneficiary : argument * storage ) : (operation list * storage) =
	let payment_amount = Tezos.amount in
	let payment_forward = pay_address ( beneficiary, payment_amount ) in
	[ payment_forward ], beneficiary
