# Tez proof-of-payment system

The purpose of this project is to deliver reliable, robust payment receipts on the Tezos infrastructure, while minimizing chain usage and maximizing privacy.

## Payment receipt contents

The receipt needs to be easily human readable, for purposes of signing. The general text format is as follows:

`Payment slip for {amount} mutez to {destination address} with message '{message}' and on-chain locator {opg_hash}[.{op_index}.{internal_index}]`

The `message` field differs between requested payments, where it is a server-side payment id, and peer to peer transfers, where it can be an arbitrary message. The current iteration focuses on using server-side ids.

## Architecture

### Serverside

#### Components

- Transfer indexer: indexing the receiving address
- Cleanup worker: /NOT DONE/
    - Refunds unclaimed transfers (minus fee) via Peppermint
    - Cleans up timed out payment processes
- Payment processor class:
    - Records payment processes (from store / backend)
    - Records payment receipts (from user / frontend)
    - Provides confirmation of payment
- Peppermint
    - Originates transfers

### Clientside

#### Components

- Wallet (Beacon)
- Taquito
- Payment manager

#### Behavior

- FRONTEND: Accepts payment data from serverside
- FRONTEND: Sends tez through Beacon / taquito
  - USER confirms transfer operation
- FRONTEND -> TEZPAY_CLIENT: Generates well-formed receipt payload
- FRONTEND -> TEZPAY_CLIENT: Signs receipt payload through Beacon
  - USER confirms payload signing
- FRONTEND: Sends signed payload to server

## Threat analysis

- Impersonation: a malicious party claiming another's payment
    - Prevented by requiring the receipt to be signed with the key of the sender address
- MITM: a sophisticated fake dApp could get a user to sign a manipulated receipt (eg. replacing the payment identifier)
    - Mitigated by purchase id clearly readable in metadata, actively validated by backend
    - Mitigated by requiring payment amount to exactly match invoice
- Replay: a malicious party re-using a signed payment receipt
    - Non-issue; the on-chain transfer is unique
