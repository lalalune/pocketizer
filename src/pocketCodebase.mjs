// @pocketizer-ignore-file
// eslint-disable-next-line import/no-anonymous-default-export
export default `# START OF POCKET-JS CODEBASE
// File: pokt-network/pocket-js/packages/types/src/tx-request.ts
/**
 * Represents a /v1/rawtx RPC request
 */
export class RawTxRequest {
  public readonly address: string
  public readonly rawHexBytes: string

  /**
   * Constructor for this class
   * @param {string} address - The address hex of the sender
   * @param {string} rawHexBytes - The transaction bytes in hex format
   */
  public constructor(address: string, rawHexBytes: string) {
    this.address = address
    this.rawHexBytes = rawHexBytes
  }

  /**
   * JSON representation of this model
   * @returns {object} The JSON request specified by the /v1/rawtx RPC call
   */
  public toJSON(): { address: string; raw_hex_bytes: string } {
    return {
      address: this.address,
      raw_hex_bytes: this.rawHexBytes,
    }
  }
}


// File: pokt-network/pocket-js/packages/types/src/index.ts
/* eslint-disable @typescript-eslint/no-empty-interface */
export interface Paginable<T> {
  data: T[]
  page: number
  totalPages: number
  perPage: number
}

export interface Timeoutable {
  timeout?: number
}

export interface RawTransactionResponse {
  logs: string | null
  txhash: string
}
export interface TransactionResponse {
  logs: string | null
  txHash: string
}

export interface Block {
  block: {
    data: {
      txs: string[]
    }
    evidence: {
      evidence: any
    }
    header: {
      app_hash: string
      chain_id: string
      consensus_hash: string
      data_hash: string
      evidence_hash: string
      height: string
      last_block_id: {
        hash: string
        parts: {
          hash: string
          total: string
        }
      }
      last_commit_hash: string
      last_results_hash: string
      next_validators_hash: string
      num_txs: string
      proposer_address: string
      time: string
      total_txs: string
      validators_hash: string
      version: {
        app: string
        block: string
      }
    }
    last_commit: {
      block_id: {
        hash: string
        parts: {
          hash: string
          total: string
        }
      }
      precommits: any[]
    }
  }
  block_id: {
    hash: string
    parts: {
      hash: string
      total: string
    }
  }
}

export interface Transaction {
  hash: string
  height: number
  index: number
  tx_result: {
    code: number
    data: string
    log: string
    info: string
    events: string[]
    codespace: string
    signer: string
    recipient: string
    message_type: string
  }
  tx: string
  proof: {
    root_hash: string
    data: string
    proof: {
      total: number
      index: number
      leaf_hash: string
      aunts: string[]
    }
  }
  stdTx: {
    entropy: number
    fee: {
      amount: string
      denom: string
    }[]
    memo: string
    msg: object
    signature: {
      pub_key: string
      signature: string
    }
  }
}

export interface PaginableBlockTransactions {
  pageCount: number
  totalTxs: number
  txs: Transaction[]
}

export interface GetPaginableOptions extends Timeoutable {
  page?: number
  perPage?: number
}

export interface GetBlockTransactionsOptions extends GetPaginableOptions {
  blockHeight?: number
  includeProofs?: boolean
}

export interface GetNodesOptions extends GetPaginableOptions {
  stakingStatus?: StakingStatus
  jailedStatus?: JailedStatus
  blockHeight?: number
  blockchain?: string
}

export interface GetAppsOptions extends GetPaginableOptions {
  stakingStatus?: StakingStatus
  blockHeight?: number
  blockchain?: string
}

export interface GetAccountWithTransactionsOptions extends GetPaginableOptions {
  received?: boolean
}

export interface GetNodeClaimsOptions extends GetPaginableOptions {
  height?: number
}

export enum StakingStatus {
  Unstaked = 0,
  Unstaking = 1,
  Staked = 2,
}

export enum JailedStatus {
  NA = '',
  Jailed = 1,
  Unjailed = 2,
}

export interface App {
  address: string
  chains: string[]
  jailed: boolean
  maxRelays: string
  publicKey: string
  stakedTokens: string
  status: StakingStatus
}

export interface Node {
  address: string
  chains: string[]
  jailed: boolean
  publicKey: string
  serviceUrl: string
  stakedTokens: string
  status: StakingStatus
  unstakingTime: string
}

export interface Account {
  address: string
  balance: string
  publicKey: null | string
}

export type AccountWithTransactions = Account & {
  totalCount: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[]
}

export interface SessionHeader {
  readonly applicationPubKey: string
  readonly chain: string
  readonly sessionBlockHeight: string | number
}

export type RelayHeaders = Record<string, string>

export interface PocketAAT {
  readonly version: string
  readonly clientPublicKey: string
  readonly applicationPublicKey: string
  readonly applicationSignature: string
}

export interface Session {
  readonly blockHeight: number
  readonly header: SessionHeader
  readonly key: string
  readonly nodes: Node[]
}

export enum HTTPMethod {
  POST = 'POST',
  GET = 'GET',
  DELETE = 'DELETE',
  NA = '',
}

export interface DispatchRequest {
  readonly sessionHeader: SessionHeader
}

export interface DispatchResponse {
  readonly blockHeight: number
  readonly session: Session
}

export interface RequestHash {
  readonly payload: RelayPayload
  readonly meta: RelayMeta
}

export interface RelayProof {
  readonly entropy: string
  readonly sessionBlockHeight: number
  readonly servicerPubKey: string
  readonly blockchain: string
  readonly token: PocketAAT
  readonly signature: string
  readonly requestHash: string
}

export interface RelayPayload {
  readonly data: string
  readonly method: string
  readonly path: string
  readonly headers?: RelayHeaders | null
}

export interface RelayMeta {
  readonly blockHeight: string
}

export interface RelayRequest {
  readonly payload: RelayPayload
  readonly meta: RelayMeta
  readonly proof: RelayProof
}

export interface RelayResponse {
  readonly signature: string
  readonly payload: string
  readonly proof: RelayProof
  readonly relayRequest: RelayRequest
}

export * from './tx-request'

// File: pokt-network/pocket-js/packages/transaction-builder/src/tx-builder.ts
import { Buffer } from 'buffer'
import {
  MsgProtoAppStake,
  MsgProtoAppTransfer,
  MsgProtoAppUnstake,
  MsgProtoNodeStakeTx,
  MsgProtoNodeUnjail,
  MsgProtoNodeUnstake,
  MsgProtoSend,
} from './models/msgs'
import { AbstractProvider } from '@pokt-foundation/pocketjs-abstract-provider'
import { AbstractSigner } from '@pokt-foundation/pocketjs-signer'
import {
  RawTxRequest,
  TransactionResponse,
} from '@pokt-foundation/pocketjs-types'
import { TxEncoderFactory } from './factory/tx-encoder-factory'
import {
  CoinDenom,
  DAOAction,
  FEATURE_UPGRADE_KEY,
  FEATURE_UPGRADE_ONLY_HEIGHT,
  GovParameter,
  OLD_UPGRADE_HEIGHT_EMPTY_VALUE,
  TxMsg,
  TxSignature,
} from './models/'
import { InvalidChainIDError, NoProviderError, NoSignerError } from './errors'
import { AbstractBuilder } from './abstract-tx-builder'
import { MsgProtoGovDAOTransfer } from './models/msgs/msg-proto-gov-dao-transfer'
import { MsgProtoGovChangeParam } from './models/msgs/msg-proto-gov-change-param'
import { MsgProtoGovUpgrade } from './models/msgs/msg-proto-gov-upgrade'

export type ChainID = 'mainnet' | 'testnet' | 'localnet'

// Default Pocket Base fee.
// Using anything above 10k uPOKT means overpaying--there is no reason to do so,
// as the chain is merely focused on utility. No profit is gained by ordering txs
// in a block in a certain way.
export const DEFAULT_BASE_FEE = '10000'

/**
 * A Transaction builder lets you create transaction messages, sign them, and send them over the network.
 * Requires a properly initialized Provider and Signer to work.
 */
export class TransactionBuilder implements AbstractBuilder {
  private provider: AbstractProvider
  private signer: AbstractSigner
  private chainID: ChainID

  constructor({
    provider,
    signer,
    chainID = 'mainnet',
  }: {
    provider: AbstractProvider
    signer: AbstractSigner
    chainID: ChainID
  }) {
    if (!provider) {
      throw new NoProviderError('Please add a provider.')
    }
    if (!signer) {
      throw new NoSignerError('Please add a signer.')
    }

    this.provider = provider
    this.signer = signer
    this.chainID = chainID
  }

  /**
   * Gets the current chain ID this Transaction Builder has been initialized for.
   * @returns {ChainID} - 'mainnet', 'localnet', or 'testnet'.
   */
  public getChainID(): ChainID {
    return this.chainID
  }

  /**
   * Sets the chainID to one of the supported networks.
   */
  public setChainID(id: ChainID): void {
    if (id === 'mainnet' || id === 'testnet' || id === 'localnet') {
      this.chainID = id
    } else {
      throw new InvalidChainIDError(
        \`Invalid ChainID. Must be "mainnet", "testnet", or "localnet".\`
      )
    }
  }
  /**
   * Signs and creates a transaction object that can be submitted to the network given the parameters and called upon Msgs.
   * Will empty the msg list after succesful creation
   * @param {string} fee - The amount to pay as a fee for executing this transaction, in uPOKT (1 POKT = 1*10^6 uPOKT).
   * @param {string} memo - The memo field for this account
   * @returns {Promise<RawTxRequest>} - A Raw transaction Request which can be sent over the network.
   */
  public async createTransaction({
    fee = DEFAULT_BASE_FEE,
    memo = '',
    txMsg,
  }: {
    fee?: string | bigint
    memo?: string
    txMsg: TxMsg
  }): Promise<RawTxRequest> {
    // Let's make sure txMsg is defined.
    if (!txMsg) {
      throw new Error('txMsg should be defined.')
    }

    const entropy = Number(
      BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString()
    ).toString()

    const signer = TxEncoderFactory.createEncoder(
      entropy,
      this.chainID,
      txMsg,
      fee.toString(),
      CoinDenom.Upokt,
      memo
    )

    const bytesToSign = signer.marshalStdSignDoc()

    const txBytes = await this.signer.sign(bytesToSign.toString('hex'))

    const marshalledTx = new TxSignature(
      Buffer.from(this.signer.getPublicKey(), 'hex'),
      Buffer.from(txBytes, 'hex')
    )

    const rawHexBytes = signer.marshalStdTx(marshalledTx).toString('hex')

    return new RawTxRequest(this.signer.getAddress(), rawHexBytes)
  }

  /**
   * Submit receives a valid transaction message, creates a Raw Transaction Request and sends it over the network.
   * @param {string} fee - The amount to pay as a fee for executing this transaction, in uPOKT (1 POKT = 1*10^6 uPOKT).
   * @param {string} memo - The memo field for this account
   * @param {TxMsg} txMsg - The transaction message to use for creating the RawTxRequest that will be sent over the network.
   * @returns {Promise<TransactionResponse>} - The Transaction Response from the network, containing the transaction hash.
   */
  public async submit({
    fee = DEFAULT_BASE_FEE,
    memo = '',
    txMsg,
  }: {
    fee?: string | bigint
    memo?: string
    txMsg: TxMsg
  }): Promise<TransactionResponse> {
    const tx = await this.createTransaction({ fee, memo, txMsg })

    return await this.provider.sendTransaction(tx)
  }

  /**
   * Submit receives an already made Raw Transaction Request and sends it over the network.
   * @param {RawTxRequest} tx - The Raw Transaction Request use for creating the RawTxRequest that will be sent over the network.
   * @returns {Promise<TransactionResponse>} - The Transaction Response from the network, containing the transaction hash.
   */
  public async submitRawTransaction(
    tx: RawTxRequest
  ): Promise<TransactionResponse> {
    return await this.provider.sendTransaction(tx)
  }

  /**
   * Adds a MsgSend TxMsg for this transaction
   * @param {string} fromAddress - Origin address
   * @param {string} toAddress - Destination address
   * @param {string} amount - Amount to be sent, needs to be a valid number greater than 1 uPOKT.
   * @returns {MsgProtoSend} - The unsigned Send message.
   */
  public send({
    fromAddress = this.signer.getAddress(),
    toAddress,
    amount,
  }: {
    fromAddress?: string
    toAddress: string
    amount: string
  }): MsgProtoSend {
    return new MsgProtoSend(fromAddress, toAddress, amount)
  }

  /**
   * Adds a MsgAppStake TxMsg for this transaction
   * @param {string} appPubKey - Application Public Key
   * @param {string[]} chains - Network identifier list to be requested by this app
   * @param {string} amount - the amount to stake, must be greater than or equal to 1 POKT
   * @returns {MsgProtoAppStake} - The unsigned App Stake message.
   */
  public appStake({
    appPubKey,
    chains,
    amount,
  }: {
    appPubKey: string
    chains: string[]
    amount: string
  }): MsgProtoAppStake {
    return new MsgProtoAppStake(appPubKey, chains, amount)
  }

  /**
   * Builds a transaction message to transfer the slot of a staked app.
   * Signer must be an existing staked app to transfer the slot from.
   * @param {string} appPubKey - Application public key to be transferred to
   * @returns {MsgProtoAppTransfer} - The unsigned AppTransfer message
   */
  public appTransfer({
    appPubKey,
  }: {
    appPubKey: string
  }): MsgProtoAppTransfer {
    return new MsgProtoAppTransfer(appPubKey)
  }

  /**
   * Adds a MsgBeginAppUnstake TxMsg for this transaction
   * @param {string} address - Address of the Application to unstake for
   * @returns {MsgProtoAppUnstake} - The unsigned App Unstake message.
   */
  public appUnstake(address: string): MsgProtoAppUnstake {
    return new MsgProtoAppUnstake(address)
  }

  /**
   * Adds a NodeStake TxMsg for this transaction
   * @param {Object} params
   * @param {string} params.nodePubKey - Node Public key
   * @param {string} params.outputAddress - The address that the coins will be sent to when the node is unstaked
   * @param {string[]} params.chains - Network identifier list to be serviced by this node
   * @param {string} params.amount - the amount to stake, must be greater than or equal to 1 POKT
   * @param {URL} params.serviceURL - Node service url
   * @param {Object.<string, number>} params.rewardDelegators - Reward delegators.
   *    If undefined or another falsey value is specified, the msg removes the
   *    current delegators.
   * @returns {MsgProtoNodeStakeTx} - The unsigned Node Stake message.
   */
  public nodeStake({
    nodePubKey = this.signer.getPublicKey(),
    outputAddress = this.signer.getAddress(),
    chains,
    amount,
    serviceURL,
    rewardDelegators,
  }: {
    nodePubKey?: string
    outputAddress?: string
    chains: string[]
    amount: string
    serviceURL: URL
    rewardDelegators?: { [key: string]: number }
  }): MsgProtoNodeStakeTx {
    return new MsgProtoNodeStakeTx(
      nodePubKey,
      outputAddress,
      chains,
      amount,
      serviceURL,
      rewardDelegators,
    )
  }

  /**
   * Adds a MsgBeginUnstake TxMsg for this transaction
   * @param {string} nodeAddress - Address of the Node to unstake for
   * @param {string} signerAddress - The address that the coins will be sent to when the node is unstaked. Must be the same address entered when the node was staked
   * @returns {MsgProtoNodeUnstake} - The unsigned Node Unstake message.
   */
  public nodeUnstake({
    nodeAddress = this.signer.getAddress(),
    signerAddress = this.signer.getAddress(),
  }: {
    nodeAddress?: string
    signerAddress?: string
  }): MsgProtoNodeUnstake {
    return new MsgProtoNodeUnstake(nodeAddress, signerAddress)
  }

  /**
   * Adds a MsgUnjail TxMsg for this transaction
   * @param {string} nodeAddress - Address of the Node to unjail
   * @param {string} signerAddress - The address of where the coins will be sent to when the node is unstaked (if it is ever). Necessary to unjail the node
   * @returns {MsgProtoNodeUnjail} - The unsigned Node Unjail message.
   */
  public nodeUnjail({
    nodeAddress = this.signer.getAddress(),
    signerAddress = this.signer.getAddress(),
  }: {
    nodeAddress?: string
    signerAddress?: string
  }): MsgProtoNodeUnjail {
    return new MsgProtoNodeUnjail(nodeAddress, signerAddress)
  }

  /**
   * Adds a MsgDAOTransfer TxMsg for this transaction
   * @param {string} fromAddress - Address of the sender of the dao transfer
   * @param {string} toAddress - The receiver of the dao transfer
   * @param {string} - Amount to be used, needs to be a valid number greater than 1 uPOKT.
   * @param {DAOAction} - the action to perform using the specified amount (i.e burn or transfer)
   */
  public govDAOTransfer({
    fromAddress = this.signer.getAddress(),
    toAddress = '',
    amount,
    action,
  }: {
    fromAddress?: string
    toAddress?: string
    amount: string
    action: DAOAction
  }): MsgProtoGovDAOTransfer {
    return new MsgProtoGovDAOTransfer(fromAddress, toAddress, amount, action)
  }

  /**
   * Adds a MsgChangeParam TxMsg for this transaction
   * @param {string} fromAddress - Address of the signer, must be on the ACL
   * @param {string} paramKey - the governance parameter key
   * @param {string} paramValue - the governance parameter's new value in human-readable format (utf8).
   */
  public govChangeParam({
    fromAddress = this.signer.getAddress(),
    paramKey,
    paramValue,
    overrideGovParamsWhitelistValidation,
  }: {
    fromAddress?: string
    paramKey: GovParameter | string
    paramValue: string
    overrideGovParamsWhitelistValidation?: boolean
  }): MsgProtoGovChangeParam {
    return new MsgProtoGovChangeParam(
      fromAddress,
      paramKey,
      paramValue,
      overrideGovParamsWhitelistValidation
    )
  }

  public govUpgrade({
    fromAddress = this.signer.getAddress(),
    upgrade,
  }: {
    fromAddress?: string
    upgrade: {
      height: number
      features: string[]
      version: string
    }
  }): MsgProtoGovUpgrade {
    return new MsgProtoGovUpgrade(fromAddress, {
      height: upgrade.height,
      features: upgrade.features,
      version: upgrade.version,
      oldUpgradeHeight: OLD_UPGRADE_HEIGHT_EMPTY_VALUE,
    })
  }

  /**
   * Adds a MsgUpgrade TxMsg for this transaction
   * @param {string} fromAddress - Address of the signer
   * @param {Upgrade} upgrade - the upgrade object such as the new upgrade height and new values.
   */
  public govUpgradeVersion({
    fromAddress = this.signer.getAddress(),
    upgrade,
  }: {
    fromAddress?: string
    upgrade: {
      height: number
      version: string
    }
  }): MsgProtoGovUpgrade {
    return this.govUpgrade({
      fromAddress,
      upgrade: {
        features: [],
        height: upgrade.height,
        version: upgrade.version,
      },
    })
  }

  public govUpgradeFeatures({
    fromAddress = this.signer.getAddress(),
    upgrade,
  }: {
    fromAddress?: string
    upgrade: {
      features: string[]
    }
  }): MsgProtoGovUpgrade {
    return this.govUpgrade({
      fromAddress,
      upgrade: {
        features: upgrade.features,
        height: FEATURE_UPGRADE_ONLY_HEIGHT,
        version: FEATURE_UPGRADE_KEY,
      },
    })
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/tx-signature.ts
import * as belt from '@tendermint/belt'
import { PosmintStdSignature } from '@pokt-network/amino-js/types/src/types/pocket'

const bytesToBase64 = belt.bytesToBase64
/**
 * Represents a given signature for a Transaction
 */
export class TxSignature {
  public readonly pubKey: Buffer
  public readonly signature: Buffer
  private readonly PUBLIC_KEY_TYPE: string = 'crypto/ed25519_public_key'

  /**
   * @param pubKey {Buffer} public key of the signer
   * @param signature {Buffer} the signature
   */
  public constructor(pubKey: Buffer, signature: Buffer) {
    this.pubKey = pubKey
    this.signature = signature
  }

  /**
   * Encodes the object to it's Amino encodable form
   */
  public toPosmintStdSignature(): PosmintStdSignature {
    return {
      pub_key: {
        type: this.PUBLIC_KEY_TYPE,
        value: bytesToBase64(this.pubKey).toString(),
      },
      signature: bytesToBase64(this.signature).toString(),
    }
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/transaction-signature.ts
import { Buffer } from 'buffer'
/**
 * Model representing a ECDSA signature result
 */
export class TransactionSignature {
  public readonly publicKey: Buffer
  public readonly signature: Buffer

  constructor(publicKey: Buffer, signature: Buffer) {
    this.publicKey = publicKey
    this.signature = signature
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/proto/index.ts
export * from './generated'


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/proto/generated/tx-signer.ts
/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal.js";
import { Any } from "./google/protobuf/any.js";

export const protobufPackage = "pocketjs";

export interface ProtoStdTx {
  msg: Any | undefined;
  fee: Coin[];
  signature: ProtoStdSignature | undefined;
  memo: string;
  entropy: number;
}

export interface ProtoStdSignature {
  publicKey: Uint8Array;
  Signature: Uint8Array;
}

export interface StdSignDoc {
  ChainID: string;
  fee: Uint8Array;
  memo: string;
  msg: Uint8Array;
  entropy: number;
}

export interface Coin {
  denom: string;
  amount: string;
}

/**
 * DecCoin defines a token with a denomination and a decimal amount.
 *
 * NOTE: The amount field is an Dec which implements the custom method
 * signatures required by gogoproto.
 */
export interface DecCoin {
  denom: string;
  amount: string;
}

export interface MsgProtoStake {
  pubKey: Uint8Array;
  chains: string[];
  value: string;
}

export interface MsgBeginUnstake {
  Address: Uint8Array;
}

export interface MsgUnjail {
  AppAddr: Uint8Array;
}

export interface MsgProtoNodeStake8 {
  Publickey: Uint8Array;
  Chains: string[];
  value: string;
  ServiceUrl: string;
  OutAddress: Uint8Array;
  RewardDelegators: { [key: string]: number };
}

export interface MsgProtoNodeStake8_RewardDelegatorsEntry {
  key: string;
  value: number;
}

export interface MsgBeginNodeUnstake8 {
  Address: Uint8Array;
  Signer: Uint8Array;
}

export interface MsgNodeUnjail {
  ValidatorAddr: Uint8Array;
}

export interface MsgNodeUnjail8 {
  ValidatorAddr: Uint8Array;
  Signer: Uint8Array;
}

export interface MsgSend {
  FromAddress: Uint8Array;
  ToAddress: Uint8Array;
  amount: string;
}

export interface MsgDAOTransfer {
  fromAddress: Uint8Array;
  toAddress: Uint8Array;
  amount: string;
  action: string;
}

export interface Upgrade {
  height: number;
  version: string;
  oldUpgradeHeight: number;
  features: string[];
}

export interface MsgUpgrade {
  address: Uint8Array;
  upgrade: Upgrade | undefined;
}

export interface MsgChangeParam {
  FromAddress: Uint8Array;
  paramKey: string;
  paramVal: Uint8Array;
}

function createBaseProtoStdTx(): ProtoStdTx {
  return { msg: undefined, fee: [], signature: undefined, memo: "", entropy: 0 };
}

export const ProtoStdTx = {
  encode(message: ProtoStdTx, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.msg !== undefined) {
      Any.encode(message.msg, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.fee) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.signature !== undefined) {
      ProtoStdSignature.encode(message.signature, writer.uint32(26).fork()).ldelim();
    }
    if (message.memo !== "") {
      writer.uint32(34).string(message.memo);
    }
    if (message.entropy !== 0) {
      writer.uint32(40).int64(message.entropy);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProtoStdTx {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProtoStdTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.msg = Any.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.fee.push(Coin.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.signature = ProtoStdSignature.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.memo = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.entropy = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProtoStdTx {
    return {
      msg: isSet(object.msg) ? Any.fromJSON(object.msg) : undefined,
      fee: globalThis.Array.isArray(object?.fee) ? object.fee.map((e: any) => Coin.fromJSON(e)) : [],
      signature: isSet(object.signature) ? ProtoStdSignature.fromJSON(object.signature) : undefined,
      memo: isSet(object.memo) ? globalThis.String(object.memo) : "",
      entropy: isSet(object.entropy) ? globalThis.Number(object.entropy) : 0,
    };
  },

  toJSON(message: ProtoStdTx): unknown {
    const obj: any = {};
    if (message.msg !== undefined) {
      obj.msg = Any.toJSON(message.msg);
    }
    if (message.fee?.length) {
      obj.fee = message.fee.map((e) => Coin.toJSON(e));
    }
    if (message.signature !== undefined) {
      obj.signature = ProtoStdSignature.toJSON(message.signature);
    }
    if (message.memo !== "") {
      obj.memo = message.memo;
    }
    if (message.entropy !== 0) {
      obj.entropy = Math.round(message.entropy);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ProtoStdTx>, I>>(base?: I): ProtoStdTx {
    return ProtoStdTx.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ProtoStdTx>, I>>(object: I): ProtoStdTx {
    const message = createBaseProtoStdTx();
    message.msg = (object.msg !== undefined && object.msg !== null) ? Any.fromPartial(object.msg) : undefined;
    message.fee = object.fee?.map((e) => Coin.fromPartial(e)) || [];
    message.signature = (object.signature !== undefined && object.signature !== null)
      ? ProtoStdSignature.fromPartial(object.signature)
      : undefined;
    message.memo = object.memo ?? "";
    message.entropy = object.entropy ?? 0;
    return message;
  },
};

function createBaseProtoStdSignature(): ProtoStdSignature {
  return { publicKey: new Uint8Array(0), Signature: new Uint8Array(0) };
}

export const ProtoStdSignature = {
  encode(message: ProtoStdSignature, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.publicKey.length !== 0) {
      writer.uint32(10).bytes(message.publicKey);
    }
    if (message.Signature.length !== 0) {
      writer.uint32(18).bytes(message.Signature);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProtoStdSignature {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProtoStdSignature();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.publicKey = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.Signature = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProtoStdSignature {
    return {
      publicKey: isSet(object.publicKey) ? bytesFromBase64(object.publicKey) : new Uint8Array(0),
      Signature: isSet(object.Signature) ? bytesFromBase64(object.Signature) : new Uint8Array(0),
    };
  },

  toJSON(message: ProtoStdSignature): unknown {
    const obj: any = {};
    if (message.publicKey.length !== 0) {
      obj.publicKey = base64FromBytes(message.publicKey);
    }
    if (message.Signature.length !== 0) {
      obj.Signature = base64FromBytes(message.Signature);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ProtoStdSignature>, I>>(base?: I): ProtoStdSignature {
    return ProtoStdSignature.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ProtoStdSignature>, I>>(object: I): ProtoStdSignature {
    const message = createBaseProtoStdSignature();
    message.publicKey = object.publicKey ?? new Uint8Array(0);
    message.Signature = object.Signature ?? new Uint8Array(0);
    return message;
  },
};

function createBaseStdSignDoc(): StdSignDoc {
  return { ChainID: "", fee: new Uint8Array(0), memo: "", msg: new Uint8Array(0), entropy: 0 };
}

export const StdSignDoc = {
  encode(message: StdSignDoc, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ChainID !== "") {
      writer.uint32(10).string(message.ChainID);
    }
    if (message.fee.length !== 0) {
      writer.uint32(18).bytes(message.fee);
    }
    if (message.memo !== "") {
      writer.uint32(26).string(message.memo);
    }
    if (message.msg.length !== 0) {
      writer.uint32(34).bytes(message.msg);
    }
    if (message.entropy !== 0) {
      writer.uint32(40).int64(message.entropy);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StdSignDoc {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStdSignDoc();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.ChainID = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.fee = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.memo = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.msg = reader.bytes();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.entropy = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StdSignDoc {
    return {
      ChainID: isSet(object.ChainID) ? globalThis.String(object.ChainID) : "",
      fee: isSet(object.fee) ? bytesFromBase64(object.fee) : new Uint8Array(0),
      memo: isSet(object.memo) ? globalThis.String(object.memo) : "",
      msg: isSet(object.msg) ? bytesFromBase64(object.msg) : new Uint8Array(0),
      entropy: isSet(object.entropy) ? globalThis.Number(object.entropy) : 0,
    };
  },

  toJSON(message: StdSignDoc): unknown {
    const obj: any = {};
    if (message.ChainID !== "") {
      obj.ChainID = message.ChainID;
    }
    if (message.fee.length !== 0) {
      obj.fee = base64FromBytes(message.fee);
    }
    if (message.memo !== "") {
      obj.memo = message.memo;
    }
    if (message.msg.length !== 0) {
      obj.msg = base64FromBytes(message.msg);
    }
    if (message.entropy !== 0) {
      obj.entropy = Math.round(message.entropy);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StdSignDoc>, I>>(base?: I): StdSignDoc {
    return StdSignDoc.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<StdSignDoc>, I>>(object: I): StdSignDoc {
    const message = createBaseStdSignDoc();
    message.ChainID = object.ChainID ?? "";
    message.fee = object.fee ?? new Uint8Array(0);
    message.memo = object.memo ?? "";
    message.msg = object.msg ?? new Uint8Array(0);
    message.entropy = object.entropy ?? 0;
    return message;
  },
};

function createBaseCoin(): Coin {
  return { denom: "", amount: "" };
}

export const Coin = {
  encode(message: Coin, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    if (message.amount !== "") {
      writer.uint32(18).string(message.amount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Coin {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoin();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.denom = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.amount = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Coin {
    return {
      denom: isSet(object.denom) ? globalThis.String(object.denom) : "",
      amount: isSet(object.amount) ? globalThis.String(object.amount) : "",
    };
  },

  toJSON(message: Coin): unknown {
    const obj: any = {};
    if (message.denom !== "") {
      obj.denom = message.denom;
    }
    if (message.amount !== "") {
      obj.amount = message.amount;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Coin>, I>>(base?: I): Coin {
    return Coin.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Coin>, I>>(object: I): Coin {
    const message = createBaseCoin();
    message.denom = object.denom ?? "";
    message.amount = object.amount ?? "";
    return message;
  },
};

function createBaseDecCoin(): DecCoin {
  return { denom: "", amount: "" };
}

export const DecCoin = {
  encode(message: DecCoin, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    if (message.amount !== "") {
      writer.uint32(18).string(message.amount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DecCoin {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDecCoin();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.denom = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.amount = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DecCoin {
    return {
      denom: isSet(object.denom) ? globalThis.String(object.denom) : "",
      amount: isSet(object.amount) ? globalThis.String(object.amount) : "",
    };
  },

  toJSON(message: DecCoin): unknown {
    const obj: any = {};
    if (message.denom !== "") {
      obj.denom = message.denom;
    }
    if (message.amount !== "") {
      obj.amount = message.amount;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<DecCoin>, I>>(base?: I): DecCoin {
    return DecCoin.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<DecCoin>, I>>(object: I): DecCoin {
    const message = createBaseDecCoin();
    message.denom = object.denom ?? "";
    message.amount = object.amount ?? "";
    return message;
  },
};

function createBaseMsgProtoStake(): MsgProtoStake {
  return { pubKey: new Uint8Array(0), chains: [], value: "" };
}

export const MsgProtoStake = {
  encode(message: MsgProtoStake, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.pubKey.length !== 0) {
      writer.uint32(10).bytes(message.pubKey);
    }
    for (const v of message.chains) {
      writer.uint32(18).string(v!);
    }
    if (message.value !== "") {
      writer.uint32(26).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgProtoStake {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgProtoStake();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.pubKey = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.chains.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgProtoStake {
    return {
      pubKey: isSet(object.pubKey) ? bytesFromBase64(object.pubKey) : new Uint8Array(0),
      chains: globalThis.Array.isArray(object?.chains) ? object.chains.map((e: any) => globalThis.String(e)) : [],
      value: isSet(object.value) ? globalThis.String(object.value) : "",
    };
  },

  toJSON(message: MsgProtoStake): unknown {
    const obj: any = {};
    if (message.pubKey.length !== 0) {
      obj.pubKey = base64FromBytes(message.pubKey);
    }
    if (message.chains?.length) {
      obj.chains = message.chains;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgProtoStake>, I>>(base?: I): MsgProtoStake {
    return MsgProtoStake.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgProtoStake>, I>>(object: I): MsgProtoStake {
    const message = createBaseMsgProtoStake();
    message.pubKey = object.pubKey ?? new Uint8Array(0);
    message.chains = object.chains?.map((e) => e) || [];
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseMsgBeginUnstake(): MsgBeginUnstake {
  return { Address: new Uint8Array(0) };
}

export const MsgBeginUnstake = {
  encode(message: MsgBeginUnstake, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.Address.length !== 0) {
      writer.uint32(10).bytes(message.Address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBeginUnstake {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBeginUnstake();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.Address = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgBeginUnstake {
    return { Address: isSet(object.Address) ? bytesFromBase64(object.Address) : new Uint8Array(0) };
  },

  toJSON(message: MsgBeginUnstake): unknown {
    const obj: any = {};
    if (message.Address.length !== 0) {
      obj.Address = base64FromBytes(message.Address);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgBeginUnstake>, I>>(base?: I): MsgBeginUnstake {
    return MsgBeginUnstake.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgBeginUnstake>, I>>(object: I): MsgBeginUnstake {
    const message = createBaseMsgBeginUnstake();
    message.Address = object.Address ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgUnjail(): MsgUnjail {
  return { AppAddr: new Uint8Array(0) };
}

export const MsgUnjail = {
  encode(message: MsgUnjail, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.AppAddr.length !== 0) {
      writer.uint32(10).bytes(message.AppAddr);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUnjail {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnjail();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.AppAddr = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgUnjail {
    return { AppAddr: isSet(object.AppAddr) ? bytesFromBase64(object.AppAddr) : new Uint8Array(0) };
  },

  toJSON(message: MsgUnjail): unknown {
    const obj: any = {};
    if (message.AppAddr.length !== 0) {
      obj.AppAddr = base64FromBytes(message.AppAddr);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUnjail>, I>>(base?: I): MsgUnjail {
    return MsgUnjail.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUnjail>, I>>(object: I): MsgUnjail {
    const message = createBaseMsgUnjail();
    message.AppAddr = object.AppAddr ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgProtoNodeStake8(): MsgProtoNodeStake8 {
  return {
    Publickey: new Uint8Array(0),
    Chains: [],
    value: "",
    ServiceUrl: "",
    OutAddress: new Uint8Array(0),
    RewardDelegators: {},
  };
}

export const MsgProtoNodeStake8 = {
  encode(message: MsgProtoNodeStake8, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.Publickey.length !== 0) {
      writer.uint32(10).bytes(message.Publickey);
    }
    for (const v of message.Chains) {
      writer.uint32(18).string(v!);
    }
    if (message.value !== "") {
      writer.uint32(26).string(message.value);
    }
    if (message.ServiceUrl !== "") {
      writer.uint32(34).string(message.ServiceUrl);
    }
    if (message.OutAddress.length !== 0) {
      writer.uint32(42).bytes(message.OutAddress);
    }
    Object.entries(message.RewardDelegators).forEach(([key, value]) => {
      MsgProtoNodeStake8_RewardDelegatorsEntry.encode({ key: key as any, value }, writer.uint32(50).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgProtoNodeStake8 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgProtoNodeStake8();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.Publickey = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.Chains.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.value = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.ServiceUrl = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.OutAddress = reader.bytes();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          const entry6 = MsgProtoNodeStake8_RewardDelegatorsEntry.decode(reader, reader.uint32());
          if (entry6.value !== undefined) {
            message.RewardDelegators[entry6.key] = entry6.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgProtoNodeStake8 {
    return {
      Publickey: isSet(object.Publickey) ? bytesFromBase64(object.Publickey) : new Uint8Array(0),
      Chains: globalThis.Array.isArray(object?.Chains) ? object.Chains.map((e: any) => globalThis.String(e)) : [],
      value: isSet(object.value) ? globalThis.String(object.value) : "",
      ServiceUrl: isSet(object.ServiceUrl) ? globalThis.String(object.ServiceUrl) : "",
      OutAddress: isSet(object.OutAddress) ? bytesFromBase64(object.OutAddress) : new Uint8Array(0),
      RewardDelegators: isObject(object.RewardDelegators)
        ? Object.entries(object.RewardDelegators).reduce<{ [key: string]: number }>((acc, [key, value]) => {
          acc[key] = Number(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: MsgProtoNodeStake8): unknown {
    const obj: any = {};
    if (message.Publickey.length !== 0) {
      obj.Publickey = base64FromBytes(message.Publickey);
    }
    if (message.Chains?.length) {
      obj.Chains = message.Chains;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    if (message.ServiceUrl !== "") {
      obj.ServiceUrl = message.ServiceUrl;
    }
    if (message.OutAddress.length !== 0) {
      obj.OutAddress = base64FromBytes(message.OutAddress);
    }
    if (message.RewardDelegators) {
      const entries = Object.entries(message.RewardDelegators);
      if (entries.length > 0) {
        obj.RewardDelegators = {};
        entries.forEach(([k, v]) => {
          obj.RewardDelegators[k] = Math.round(v);
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgProtoNodeStake8>, I>>(base?: I): MsgProtoNodeStake8 {
    return MsgProtoNodeStake8.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgProtoNodeStake8>, I>>(object: I): MsgProtoNodeStake8 {
    const message = createBaseMsgProtoNodeStake8();
    message.Publickey = object.Publickey ?? new Uint8Array(0);
    message.Chains = object.Chains?.map((e) => e) || [];
    message.value = object.value ?? "";
    message.ServiceUrl = object.ServiceUrl ?? "";
    message.OutAddress = object.OutAddress ?? new Uint8Array(0);
    message.RewardDelegators = Object.entries(object.RewardDelegators ?? {}).reduce<{ [key: string]: number }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = globalThis.Number(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBaseMsgProtoNodeStake8_RewardDelegatorsEntry(): MsgProtoNodeStake8_RewardDelegatorsEntry {
  return { key: "", value: 0 };
}

export const MsgProtoNodeStake8_RewardDelegatorsEntry = {
  encode(message: MsgProtoNodeStake8_RewardDelegatorsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(16).uint32(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgProtoNodeStake8_RewardDelegatorsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgProtoNodeStake8_RewardDelegatorsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.value = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgProtoNodeStake8_RewardDelegatorsEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.Number(object.value) : 0,
    };
  },

  toJSON(message: MsgProtoNodeStake8_RewardDelegatorsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgProtoNodeStake8_RewardDelegatorsEntry>, I>>(
    base?: I,
  ): MsgProtoNodeStake8_RewardDelegatorsEntry {
    return MsgProtoNodeStake8_RewardDelegatorsEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgProtoNodeStake8_RewardDelegatorsEntry>, I>>(
    object: I,
  ): MsgProtoNodeStake8_RewardDelegatorsEntry {
    const message = createBaseMsgProtoNodeStake8_RewardDelegatorsEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? 0;
    return message;
  },
};

function createBaseMsgBeginNodeUnstake8(): MsgBeginNodeUnstake8 {
  return { Address: new Uint8Array(0), Signer: new Uint8Array(0) };
}

export const MsgBeginNodeUnstake8 = {
  encode(message: MsgBeginNodeUnstake8, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.Address.length !== 0) {
      writer.uint32(10).bytes(message.Address);
    }
    if (message.Signer.length !== 0) {
      writer.uint32(18).bytes(message.Signer);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBeginNodeUnstake8 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBeginNodeUnstake8();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.Address = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.Signer = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgBeginNodeUnstake8 {
    return {
      Address: isSet(object.Address) ? bytesFromBase64(object.Address) : new Uint8Array(0),
      Signer: isSet(object.Signer) ? bytesFromBase64(object.Signer) : new Uint8Array(0),
    };
  },

  toJSON(message: MsgBeginNodeUnstake8): unknown {
    const obj: any = {};
    if (message.Address.length !== 0) {
      obj.Address = base64FromBytes(message.Address);
    }
    if (message.Signer.length !== 0) {
      obj.Signer = base64FromBytes(message.Signer);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgBeginNodeUnstake8>, I>>(base?: I): MsgBeginNodeUnstake8 {
    return MsgBeginNodeUnstake8.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgBeginNodeUnstake8>, I>>(object: I): MsgBeginNodeUnstake8 {
    const message = createBaseMsgBeginNodeUnstake8();
    message.Address = object.Address ?? new Uint8Array(0);
    message.Signer = object.Signer ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgNodeUnjail(): MsgNodeUnjail {
  return { ValidatorAddr: new Uint8Array(0) };
}

export const MsgNodeUnjail = {
  encode(message: MsgNodeUnjail, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ValidatorAddr.length !== 0) {
      writer.uint32(10).bytes(message.ValidatorAddr);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgNodeUnjail {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgNodeUnjail();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.ValidatorAddr = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgNodeUnjail {
    return { ValidatorAddr: isSet(object.ValidatorAddr) ? bytesFromBase64(object.ValidatorAddr) : new Uint8Array(0) };
  },

  toJSON(message: MsgNodeUnjail): unknown {
    const obj: any = {};
    if (message.ValidatorAddr.length !== 0) {
      obj.ValidatorAddr = base64FromBytes(message.ValidatorAddr);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgNodeUnjail>, I>>(base?: I): MsgNodeUnjail {
    return MsgNodeUnjail.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgNodeUnjail>, I>>(object: I): MsgNodeUnjail {
    const message = createBaseMsgNodeUnjail();
    message.ValidatorAddr = object.ValidatorAddr ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgNodeUnjail8(): MsgNodeUnjail8 {
  return { ValidatorAddr: new Uint8Array(0), Signer: new Uint8Array(0) };
}

export const MsgNodeUnjail8 = {
  encode(message: MsgNodeUnjail8, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ValidatorAddr.length !== 0) {
      writer.uint32(10).bytes(message.ValidatorAddr);
    }
    if (message.Signer.length !== 0) {
      writer.uint32(18).bytes(message.Signer);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgNodeUnjail8 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgNodeUnjail8();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.ValidatorAddr = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.Signer = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgNodeUnjail8 {
    return {
      ValidatorAddr: isSet(object.ValidatorAddr) ? bytesFromBase64(object.ValidatorAddr) : new Uint8Array(0),
      Signer: isSet(object.Signer) ? bytesFromBase64(object.Signer) : new Uint8Array(0),
    };
  },

  toJSON(message: MsgNodeUnjail8): unknown {
    const obj: any = {};
    if (message.ValidatorAddr.length !== 0) {
      obj.ValidatorAddr = base64FromBytes(message.ValidatorAddr);
    }
    if (message.Signer.length !== 0) {
      obj.Signer = base64FromBytes(message.Signer);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgNodeUnjail8>, I>>(base?: I): MsgNodeUnjail8 {
    return MsgNodeUnjail8.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgNodeUnjail8>, I>>(object: I): MsgNodeUnjail8 {
    const message = createBaseMsgNodeUnjail8();
    message.ValidatorAddr = object.ValidatorAddr ?? new Uint8Array(0);
    message.Signer = object.Signer ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgSend(): MsgSend {
  return { FromAddress: new Uint8Array(0), ToAddress: new Uint8Array(0), amount: "" };
}

export const MsgSend = {
  encode(message: MsgSend, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.FromAddress.length !== 0) {
      writer.uint32(10).bytes(message.FromAddress);
    }
    if (message.ToAddress.length !== 0) {
      writer.uint32(18).bytes(message.ToAddress);
    }
    if (message.amount !== "") {
      writer.uint32(26).string(message.amount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSend {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSend();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.FromAddress = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.ToAddress = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.amount = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgSend {
    return {
      FromAddress: isSet(object.FromAddress) ? bytesFromBase64(object.FromAddress) : new Uint8Array(0),
      ToAddress: isSet(object.ToAddress) ? bytesFromBase64(object.ToAddress) : new Uint8Array(0),
      amount: isSet(object.amount) ? globalThis.String(object.amount) : "",
    };
  },

  toJSON(message: MsgSend): unknown {
    const obj: any = {};
    if (message.FromAddress.length !== 0) {
      obj.FromAddress = base64FromBytes(message.FromAddress);
    }
    if (message.ToAddress.length !== 0) {
      obj.ToAddress = base64FromBytes(message.ToAddress);
    }
    if (message.amount !== "") {
      obj.amount = message.amount;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSend>, I>>(base?: I): MsgSend {
    return MsgSend.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgSend>, I>>(object: I): MsgSend {
    const message = createBaseMsgSend();
    message.FromAddress = object.FromAddress ?? new Uint8Array(0);
    message.ToAddress = object.ToAddress ?? new Uint8Array(0);
    message.amount = object.amount ?? "";
    return message;
  },
};

function createBaseMsgDAOTransfer(): MsgDAOTransfer {
  return { fromAddress: new Uint8Array(0), toAddress: new Uint8Array(0), amount: "", action: "" };
}

export const MsgDAOTransfer = {
  encode(message: MsgDAOTransfer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.fromAddress.length !== 0) {
      writer.uint32(10).bytes(message.fromAddress);
    }
    if (message.toAddress.length !== 0) {
      writer.uint32(18).bytes(message.toAddress);
    }
    if (message.amount !== "") {
      writer.uint32(26).string(message.amount);
    }
    if (message.action !== "") {
      writer.uint32(34).string(message.action);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDAOTransfer {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDAOTransfer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.fromAddress = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.toAddress = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.amount = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.action = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgDAOTransfer {
    return {
      fromAddress: isSet(object.fromAddress) ? bytesFromBase64(object.fromAddress) : new Uint8Array(0),
      toAddress: isSet(object.toAddress) ? bytesFromBase64(object.toAddress) : new Uint8Array(0),
      amount: isSet(object.amount) ? globalThis.String(object.amount) : "",
      action: isSet(object.action) ? globalThis.String(object.action) : "",
    };
  },

  toJSON(message: MsgDAOTransfer): unknown {
    const obj: any = {};
    if (message.fromAddress.length !== 0) {
      obj.fromAddress = base64FromBytes(message.fromAddress);
    }
    if (message.toAddress.length !== 0) {
      obj.toAddress = base64FromBytes(message.toAddress);
    }
    if (message.amount !== "") {
      obj.amount = message.amount;
    }
    if (message.action !== "") {
      obj.action = message.action;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgDAOTransfer>, I>>(base?: I): MsgDAOTransfer {
    return MsgDAOTransfer.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgDAOTransfer>, I>>(object: I): MsgDAOTransfer {
    const message = createBaseMsgDAOTransfer();
    message.fromAddress = object.fromAddress ?? new Uint8Array(0);
    message.toAddress = object.toAddress ?? new Uint8Array(0);
    message.amount = object.amount ?? "";
    message.action = object.action ?? "";
    return message;
  },
};

function createBaseUpgrade(): Upgrade {
  return { height: 0, version: "", oldUpgradeHeight: 0, features: [] };
}

export const Upgrade = {
  encode(message: Upgrade, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.height !== 0) {
      writer.uint32(8).int64(message.height);
    }
    if (message.version !== "") {
      writer.uint32(18).string(message.version);
    }
    if (message.oldUpgradeHeight !== 0) {
      writer.uint32(24).int64(message.oldUpgradeHeight);
    }
    for (const v of message.features) {
      writer.uint32(34).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Upgrade {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpgrade();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.height = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.version = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.oldUpgradeHeight = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.features.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Upgrade {
    return {
      height: isSet(object.height) ? globalThis.Number(object.height) : 0,
      version: isSet(object.version) ? globalThis.String(object.version) : "",
      oldUpgradeHeight: isSet(object.oldUpgradeHeight) ? globalThis.Number(object.oldUpgradeHeight) : 0,
      features: globalThis.Array.isArray(object?.features) ? object.features.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: Upgrade): unknown {
    const obj: any = {};
    if (message.height !== 0) {
      obj.height = Math.round(message.height);
    }
    if (message.version !== "") {
      obj.version = message.version;
    }
    if (message.oldUpgradeHeight !== 0) {
      obj.oldUpgradeHeight = Math.round(message.oldUpgradeHeight);
    }
    if (message.features?.length) {
      obj.features = message.features;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Upgrade>, I>>(base?: I): Upgrade {
    return Upgrade.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Upgrade>, I>>(object: I): Upgrade {
    const message = createBaseUpgrade();
    message.height = object.height ?? 0;
    message.version = object.version ?? "";
    message.oldUpgradeHeight = object.oldUpgradeHeight ?? 0;
    message.features = object.features?.map((e) => e) || [];
    return message;
  },
};

function createBaseMsgUpgrade(): MsgUpgrade {
  return { address: new Uint8Array(0), upgrade: undefined };
}

export const MsgUpgrade = {
  encode(message: MsgUpgrade, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address.length !== 0) {
      writer.uint32(10).bytes(message.address);
    }
    if (message.upgrade !== undefined) {
      Upgrade.encode(message.upgrade, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpgrade {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpgrade();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.address = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.upgrade = Upgrade.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgUpgrade {
    return {
      address: isSet(object.address) ? bytesFromBase64(object.address) : new Uint8Array(0),
      upgrade: isSet(object.upgrade) ? Upgrade.fromJSON(object.upgrade) : undefined,
    };
  },

  toJSON(message: MsgUpgrade): unknown {
    const obj: any = {};
    if (message.address.length !== 0) {
      obj.address = base64FromBytes(message.address);
    }
    if (message.upgrade !== undefined) {
      obj.upgrade = Upgrade.toJSON(message.upgrade);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpgrade>, I>>(base?: I): MsgUpgrade {
    return MsgUpgrade.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpgrade>, I>>(object: I): MsgUpgrade {
    const message = createBaseMsgUpgrade();
    message.address = object.address ?? new Uint8Array(0);
    message.upgrade = (object.upgrade !== undefined && object.upgrade !== null)
      ? Upgrade.fromPartial(object.upgrade)
      : undefined;
    return message;
  },
};

function createBaseMsgChangeParam(): MsgChangeParam {
  return { FromAddress: new Uint8Array(0), paramKey: "", paramVal: new Uint8Array(0) };
}

export const MsgChangeParam = {
  encode(message: MsgChangeParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.FromAddress.length !== 0) {
      writer.uint32(10).bytes(message.FromAddress);
    }
    if (message.paramKey !== "") {
      writer.uint32(18).string(message.paramKey);
    }
    if (message.paramVal.length !== 0) {
      writer.uint32(26).bytes(message.paramVal);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgChangeParam {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgChangeParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.FromAddress = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.paramKey = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.paramVal = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgChangeParam {
    return {
      FromAddress: isSet(object.FromAddress) ? bytesFromBase64(object.FromAddress) : new Uint8Array(0),
      paramKey: isSet(object.paramKey) ? globalThis.String(object.paramKey) : "",
      paramVal: isSet(object.paramVal) ? bytesFromBase64(object.paramVal) : new Uint8Array(0),
    };
  },

  toJSON(message: MsgChangeParam): unknown {
    const obj: any = {};
    if (message.FromAddress.length !== 0) {
      obj.FromAddress = base64FromBytes(message.FromAddress);
    }
    if (message.paramKey !== "") {
      obj.paramKey = message.paramKey;
    }
    if (message.paramVal.length !== 0) {
      obj.paramVal = base64FromBytes(message.paramVal);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgChangeParam>, I>>(base?: I): MsgChangeParam {
    return MsgChangeParam.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgChangeParam>, I>>(object: I): MsgChangeParam {
    const message = createBaseMsgChangeParam();
    message.FromAddress = object.FromAddress ?? new Uint8Array(0);
    message.paramKey = object.paramKey ?? "";
    message.paramVal = object.paramVal ?? new Uint8Array(0);
    return message;
  },
};

function bytesFromBase64(b64: string): Uint8Array {
  if ((globalThis as any).Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if ((globalThis as any).Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/proto/generated/google/protobuf/any.ts
/* eslint-disable */
import _m0 from "protobufjs/minimal.js";

export const protobufPackage = "google.protobuf";

/**
 * \`Any\` contains an arbitrary serialized protocol buffer message along with a
 * URL that describes the type of the serialized message.
 *
 * Protobuf library provides support to pack/unpack Any values in the form
 * of utility functions or additional generated methods of the Any type.
 *
 * Example 1: Pack and unpack a message in C++.
 *
 *     Foo foo = ...;
 *     Any any;
 *     any.PackFrom(foo);
 *     ...
 *     if (any.UnpackTo(&foo)) {
 *       ...
 *     }
 *
 * Example 2: Pack and unpack a message in Java.
 *
 *     Foo foo = ...;
 *     Any any = Any.pack(foo);
 *     ...
 *     if (any.is(Foo.class)) {
 *       foo = any.unpack(Foo.class);
 *     }
 *     // or ...
 *     if (any.isSameTypeAs(Foo.getDefaultInstance())) {
 *       foo = any.unpack(Foo.getDefaultInstance());
 *     }
 *
 *  Example 3: Pack and unpack a message in Python.
 *
 *     foo = Foo(...)
 *     any = Any()
 *     any.Pack(foo)
 *     ...
 *     if any.Is(Foo.DESCRIPTOR):
 *       any.Unpack(foo)
 *       ...
 *
 *  Example 4: Pack and unpack a message in Go
 *
 *      foo := &pb.Foo{...}
 *      any, err := anypb.New(foo)
 *      if err != nil {
 *        ...
 *      }
 *      ...
 *      foo := &pb.Foo{}
 *      if err := any.UnmarshalTo(foo); err != nil {
 *        ...
 *      }
 *
 * The pack methods provided by protobuf library will by default use
 * 'type.googleapis.com/full.type.name' as the type URL and the unpack
 * methods only use the fully qualified type name after the last '/'
 * in the type URL, for example "foo.bar.com/x/y.z" will yield type
 * name "y.z".
 *
 * JSON
 * ====
 * The JSON representation of an \`Any\` value uses the regular
 * representation of the deserialized, embedded message, with an
 * additional field \`@type\` which contains the type URL. Example:
 *
 *     package google.profile;
 *     message Person {
 *       string first_name = 1;
 *       string last_name = 2;
 *     }
 *
 *     {
 *       "@type": "type.googleapis.com/google.profile.Person",
 *       "firstName": <string>,
 *       "lastName": <string>
 *     }
 *
 * If the embedded message type is well-known and has a custom JSON
 * representation, that representation will be embedded adding a field
 * \`value\` which holds the custom JSON in addition to the \`@type\`
 * field. Example (for message [google.protobuf.Duration][]):
 *
 *     {
 *       "@type": "type.googleapis.com/google.protobuf.Duration",
 *       "value": "1.212s"
 *     }
 */
export interface Any {
  /**
   * A URL/resource name that uniquely identifies the type of the serialized
   * protocol buffer message. This string must contain at least
   * one "/" character. The last segment of the URL's path must represent
   * the fully qualified name of the type (as in
   * \`path/google.protobuf.Duration\`). The name should be in a canonical form
   * (e.g., leading "." is not accepted).
   *
   * In practice, teams usually precompile into the binary all types that they
   * expect it to use in the context of Any. However, for URLs which use the
   * scheme \`http\`, \`https\`, or no scheme, one can optionally set up a type
   * server that maps type URLs to message definitions as follows:
   *
   * * If no scheme is provided, \`https\` is assumed.
   * * An HTTP GET on the URL must yield a [google.protobuf.Type][]
   *   value in binary format, or produce an error.
   * * Applications are allowed to cache lookup results based on the
   *   URL, or have them precompiled into a binary to avoid any
   *   lookup. Therefore, binary compatibility needs to be preserved
   *   on changes to types. (Use versioned type names to manage
   *   breaking changes.)
   *
   * Note: this functionality is not currently available in the official
   * protobuf release, and it is not used for type URLs beginning with
   * type.googleapis.com. As of May 2023, there are no widely used type server
   * implementations and no plans to implement one.
   *
   * Schemes other than \`http\`, \`https\` (or the empty scheme) might be
   * used with implementation specific semantics.
   */
  typeUrl: string;
  /** Must be a valid serialized protocol buffer of the above specified type. */
  value: Uint8Array;
}

function createBaseAny(): Any {
  return { typeUrl: "", value: new Uint8Array(0) };
}

export const Any = {
  encode(message: Any, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.typeUrl !== "") {
      writer.uint32(10).string(message.typeUrl);
    }
    if (message.value.length !== 0) {
      writer.uint32(18).bytes(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Any {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAny();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.typeUrl = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Any {
    return {
      typeUrl: isSet(object.typeUrl) ? globalThis.String(object.typeUrl) : "",
      value: isSet(object.value) ? bytesFromBase64(object.value) : new Uint8Array(0),
    };
  },

  toJSON(message: Any): unknown {
    const obj: any = {};
    if (message.typeUrl !== "") {
      obj.typeUrl = message.typeUrl;
    }
    if (message.value.length !== 0) {
      obj.value = base64FromBytes(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Any>, I>>(base?: I): Any {
    return Any.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Any>, I>>(object: I): Any {
    const message = createBaseAny();
    message.typeUrl = object.typeUrl ?? "";
    message.value = object.value ?? new Uint8Array(0);
    return message;
  },
};

function bytesFromBase64(b64: string): Uint8Array {
  if ((globalThis as any).Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if ((globalThis as any).Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/tx-msg.ts
/**
 * Parent class to all Msg to be sent over inside Transactions
 */
export abstract class TxMsg {
  public abstract toStdSignDocMsgObj(): object
  public abstract toStdTxMsgObj(): any
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/msg-proto-send.ts
import { Buffer } from 'buffer'
import { MsgSend } from './../proto/generated/tx-signer'
import { Any } from '../proto/generated/google/protobuf/any'
import { TxMsg } from './tx-msg'

/**
 * Model representing a MsgSend to send POKT from one account to another
 */
export class MsgProtoSend extends TxMsg {
  public readonly fromAddress: string
  public readonly toAddress: string
  public readonly amount: string
  public readonly KEY: string = '/x.nodes.MsgSend'
  public readonly AMINO_KEY: string = 'pos/Send'

  /**
   * Constructor this message
   * @param {string} fromAddress - Origin address
   * @param {string} toAddress - Destination address
   * @param {string} amount - Amount to be sent, needs to be a valid number greater than 0
   * @param {CoinDenom | undefined} amountDenom  - Amount value denomination
   */
  public constructor(fromAddress: string, toAddress: string, amount: string) {
    super()
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount

    if (fromAddress === toAddress) {
      throw new Error('fromAddress cannot be equal to toAddress')
    }

    const amountNumber = Number(this.amount)

    if (isNaN(amountNumber)) {
      throw new Error('Amount is not a valid number')
    } else if (amountNumber < 0) {
      throw new Error('Amount < 0')
    }
  }
  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {object} - Msg type key value.
   * @memberof MsgSend
   */
  public toStdSignDocMsgObj(): object {
    return {
      type: this.AMINO_KEY,
      value: {
        amount: this.amount,
        from_address: this.fromAddress.toLowerCase(),
        to_address: this.toAddress.toLowerCase(),
      },
    }
  }

  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {any} - Msg type key value.
   * @memberof MsgSend
   */
  public toStdTxMsgObj(): any {
    const data = {
      FromAddress: Buffer.from(this.fromAddress, 'hex'),
      ToAddress: Buffer.from(this.toAddress, 'hex'),
      amount: this.amount,
    }

    const result = Any.fromJSON({
      typeUrl: this.KEY,
      value: Buffer.from(MsgSend.encode(data).finish()).toString('base64'),
    })

    return result
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/msg-proto-node-unstake.ts
import { Buffer } from 'buffer'
import { MsgBeginNodeUnstake8 } from './../proto/generated/tx-signer'
import { Any } from '../proto/generated/google/protobuf/any'
import { TxMsg } from './tx-msg'
/**
 * Model representing a MsgNodeStake to unstake as an Node in the Pocket Network
 */
export class MsgProtoNodeUnstake extends TxMsg {
  public readonly KEY: string = '/x.nodes.MsgBeginUnstake8'
  public readonly AMINO_KEY: string = 'pos/8.0MsgBeginUnstake'
  public readonly nodeAddress: string
  public readonly signerAddress: string

  /**
   * @param {string} nodeAddress - Node address
   */
  public constructor(nodeAddress: string, signerAddress: string) {
    super()
    this.nodeAddress = nodeAddress
    this.signerAddress = signerAddress
  }
  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {object} - Msg type key value.
   * @memberof MsgNodeUnstake
   */
  public toStdSignDocMsgObj(): object {
    return {
      type: this.AMINO_KEY,
      value: {
        signer_address: this.signerAddress,
        validator_address: this.nodeAddress,
      },
    }
  }

  /**
   * Converts an Msg Object to StdTx
   * @returns {any} - Msg type key value.
   * @memberof MsgNodeUnstake
   */
  public toStdTxMsgObj(): any {
    const data = {
      Address: Buffer.from(this.nodeAddress, 'hex'),
      Signer: Buffer.from(this.signerAddress, 'hex'),
    }

    return Any.fromJSON({
      typeUrl: this.KEY,
      value: Buffer.from(MsgBeginNodeUnstake8.encode(data).finish()).toString(
        'base64'
      ),
    })
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/msg-proto-node-unjail.ts
import { Buffer } from 'buffer'
import { MsgNodeUnjail8 } from '../proto/generated/tx-signer'
import { Any } from '../proto/generated/google/protobuf/any'
import { TxMsg } from './tx-msg'

/**
 * Model representing a MsgNodeUnjail to unjail as an Node in the Pocket Network
 */
export class MsgProtoNodeUnjail extends TxMsg {
  public readonly KEY: string = '/x.nodes.MsgUnjail8'
  public readonly AMINO_KEY: string = 'pos/8.0MsgUnjail'
  public readonly nodeAddress: string
  public readonly signerAddress: string

  /**
   * @param {string} nodeAddress - Node address to be unjailed
   * @param {string} signerAddress - Signer address (who triggered the unjail)
   */
  public constructor(nodeAddress: string, signerAddress: string) {
    super()
    this.nodeAddress = nodeAddress
    this.signerAddress = signerAddress
  }
  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {object} - Msg type key value.
   * @memberof MsgNodeUnjail
   */
  public toStdSignDocMsgObj(): object {
    return {
      type: this.AMINO_KEY,
      value: {
        address: this.nodeAddress,
        signer_address: this.signerAddress,
      },
    }
  }

  /**
   * Converts an Msg Object to StdTx
   * @returns {any} - Msg type key value.
   * @memberof MsgNodeUnjail
   */
  public toStdTxMsgObj(): any {
    const data = {
      ValidatorAddr: Buffer.from(this.nodeAddress, 'hex'),
      Signer: Buffer.from(this.signerAddress, 'hex'),
    }

    return Any.fromJSON({
      typeUrl: this.KEY,
      value: Buffer.from(MsgNodeUnjail8.encode(data).finish()).toString(
        'base64'
      ),
    })
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/msg-proto-node-stake.ts
import { Buffer } from 'buffer'
import { MsgProtoNodeStake8 } from './../proto/generated/tx-signer'
import { Any } from '../proto/generated/google/protobuf/any'
import { TxMsg } from './tx-msg'

const MINIMUM_STAKE_AMOUNT = 15000000000

/**
 * Model representing a MsgNodeStake to stake as an Node in the Pocket Network
 */
export class MsgProtoNodeStakeTx extends TxMsg {
  public readonly KEY: string = '/x.nodes.MsgProtoStake8'
  public readonly AMINO_KEY: string = 'pos/8.0MsgStake'
  public readonly DEFAULT_PORT: string = '443'
  public readonly DEFAULT_PROTOCOL: string = 'https:'
  public readonly pubKey: Buffer
  public readonly outputAddress: Buffer
  public readonly chains: string[]
  public readonly amount: string
  public readonly serviceURL: URL
  public readonly rewardDelegators: { [key: string]: number } | undefined

  /**
   * @param {string} pubKey - Public key
   * @param {string[]} chains - String array containing a list of blockchain hashes
   * @param {string} amount - Amount to be sent, has to be a valid number and cannot be lesser than 0
   * @param {URL} serviceURL - Service node URL, needs to be https://
   * @param {Object.<string, number>} rewardDelegators - Reward delegators
   */
  constructor(
    pubKey: string,
    outputAddress: string,
    chains: string[],
    amount: string,
    serviceURL: URL,
    rewardDelegators: { [key: string]: number } | undefined,
  ) {
    super()
    this.pubKey = Buffer.from(pubKey, 'hex')
    this.outputAddress = Buffer.from(outputAddress, 'hex')
    this.chains = chains
    this.amount = amount
    this.serviceURL = serviceURL
    this.rewardDelegators = rewardDelegators

    if (!this.serviceURL.port) {
      this.serviceURL.port = '443'
    }

    const amountNumber = Number(this.amount)

    if (isNaN(amountNumber)) {
      throw new Error('Amount is not a valid number')
    } else if (amountNumber < MINIMUM_STAKE_AMOUNT) {
      throw new Error(
        \`Amount below minimum stake amount (\${MINIMUM_STAKE_AMOUNT})\`
      )
    } else if (this.chains.length === 0) {
      throw new Error('Chains is empty')
    }
  }

  /**
   * Returns the parsed serviceURL
   * @returns {string} - Parsed serviceURL
   * @memberof MsgNodeStake
   */
  private getParsedServiceURL(): string {
    return \`\${
      this.serviceURL.protocol
        ? this.serviceURL.protocol
        : this.DEFAULT_PROTOCOL
    }//\${this.serviceURL.hostname}:\${
      this.serviceURL.port ? this.serviceURL.port : this.DEFAULT_PORT
    }\`
  }

  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {object} - Msg type key value.
   * @memberof MsgNodeStake
   */
  public toStdSignDocMsgObj(): object {
    const msg = {
      chains: this.chains,
      output_address: this.outputAddress.toString('hex'),
      public_key: {
        type: 'crypto/ed25519_public_key',
        value: this.pubKey.toString('hex'),
      },
      service_url: this.getParsedServiceURL(),
      value: this.amount,
    };
    if (this.rewardDelegators) {
      msg['reward_delegators'] = this.rewardDelegators;
    }
    return {
      type: this.AMINO_KEY,
      value: msg,
    }
  }

  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {any} - Msg type key value.
   * @memberof MsgNodeStake
   */
  public toStdTxMsgObj(): any {
    const data = {
      Publickey: this.pubKey,
      Chains: this.chains,
      value: this.amount,
      ServiceUrl: this.getParsedServiceURL(),
      OutAddress: this.outputAddress,
      RewardDelegators: this.rewardDelegators || {},
    }

    return Any.fromJSON({
      typeUrl: this.KEY,
      value: Buffer.from(MsgProtoNodeStake8.encode(data).finish()).toString(
        'base64'
      ),
    })
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/msg-proto-gov-upgrade.ts
import { Buffer } from 'buffer'
import { MsgUpgrade, Upgrade } from './../proto/generated/tx-signer'
import { Any } from '../proto/generated/google/protobuf/any'
import { TxMsg } from './tx-msg'

/**
 * Model representing a MsgGovUpgrade to indicate an upgrade height for protocol updates, i.e consensus breaking changes
 */
export class MsgProtoGovUpgrade extends TxMsg {
  public readonly fromAddress: string
  public readonly upgrade: Upgrade

  public readonly KEY: string = '/x.gov.MsgUpgrade'
  public readonly AMINO_KEY: string = 'gov/msg_upgrade'

  /**
   * Constructor this message
   * @param {string} fromAddress - Origin address
   * @param {string} upgrade - the upgrade details such as upgrade height and features being activated
   */
  public constructor(fromAddress: string, upgrade: Upgrade) {
    super()
    this.fromAddress = fromAddress
    this.upgrade = upgrade

    if (fromAddress.length == 0) {
      throw new Error('fromAddress cannot be empty')
    }

    if (upgrade.height == 0) {
      throw new Error('upgrade height cannot be zero')
    }

    if (upgrade.version.length == 0) {
      throw new Error(
        'version cannot be empty, it should be a semantic version or FEATURE'
      )
    }

    // Validate that features are provided
    if (upgrade.version == 'FEATURE') {
      if (upgrade.height != 1) {
        throw new Error('Features cannot be added unless height is 1')
      }

      const zeroFeatures = upgrade.features.length == 0
      if (zeroFeatures) {
        throw new Error(
          'Zero features was provided to upgrade, despite being a feature upgrade.'
        )
      }

      upgrade.features.forEach((f) => {
        const featureKeyHeightTuple = f.split(':')

        if (featureKeyHeightTuple.length != 2) {
          throw new Error(
            \`\${f} is malformed for feature upgrade, format should be: KEY:HEIGHT\`
          )
        }

        const featureHeight = featureKeyHeightTuple[1]
        if (isNaN(parseInt(featureHeight))) {
          throw new Error(
            \`\${featureHeight} is malformed for feature upgrade, feature height should be an integer.\`
          )
        }
      })
    } else {
      // Version upgrade but features were added
      if (upgrade.features.length > 0) {
        throw new Error('Features cannot be added unless version is FEATURE')
      }
    }
  }
  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {object} - Msg type key value.
   * @memberof MsgSend
   */
  public toStdSignDocMsgObj(): object {
    // Upgrades are conditional
    let upgradeMsg: {
      Features?: string[]
      Height: string
      Version: string
    } = {
      ...(this.upgrade.features.length > 0 && {
        Features: this.upgrade.features,
      }),
      Height: \`\${this.upgrade.height}\`,
      Version: this.upgrade.version,
    }

    return {
      type: this.AMINO_KEY,
      value: {
        address: this.fromAddress.toLowerCase(),
        upgrade: upgradeMsg,
      },
    }
  }

  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {any} - Msg type key value.
   * @memberof MsgSend
   */
  public toStdTxMsgObj(): any {
    const data = {
      address: Buffer.from(this.fromAddress.toLowerCase(), 'hex'),
      upgrade: this.upgrade,
    }

    const result = Any.fromJSON({
      typeUrl: this.KEY,
      value: Buffer.from(MsgUpgrade.encode(data).finish()).toString('base64'),
    })

    return result
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/msg-proto-gov-dao-transfer.ts
import { Buffer } from 'buffer'
import { MsgDAOTransfer } from './../proto/generated/tx-signer'
import { Any } from '../proto/generated/google/protobuf/any'
import { TxMsg } from './tx-msg'
import { DAOAction } from '../gov'

/**
 * Model representing a MsgGovDAOTransfer to send POKT from the DAO Module Account to another account
 */
export class MsgProtoGovDAOTransfer extends TxMsg {
  public readonly fromAddress: string
  public readonly toAddress: string
  public readonly amount: string
  public readonly KEY: string = '/x.gov.MsgDAOTransfer'
  public readonly AMINO_KEY: string = 'gov/msg_dao_transfer'
  public readonly action: DAOAction

  /**
   * Constructor this message
   * @param {string} fromAddress - DAOOwner Address
   * @param {string} toAddress - Destination address
   * @param {string} amount - Amount to be sent, needs to be a valid number greater than 0
   * @param {CoinDenom | undefined} amountDenom  - Amount value denomination
   * @param {DAOAction} action  - dao action to perform for transfers
   */
  public constructor(
    fromAddress: string,
    toAddress: string,
    amount: string,
    action: DAOAction
  ) {
    super()
    this.fromAddress = fromAddress
    this.toAddress = toAddress || ''
    this.amount = amount
    this.action = action

    if (fromAddress.length == 0) {
      throw new Error('fromAddress cannot be empty')
    }

    if (fromAddress === toAddress) {
      throw new Error('fromAddress cannot be equal to toAddress')
    }

    const amountNumber = Number(this.amount)

    if (isNaN(amountNumber)) {
      throw new Error('Amount is not a valid number')
    } else if (amountNumber < 0) {
      throw new Error('Amount < 0')
    }

    // Whitelisting valid actions just in case someone ignores types.
    if (!Object.values(DAOAction).includes(action)) {
      throw new Error('Invalid DAOAction: ' + action)
    }

    if (action == DAOAction.Transfer && toAddress.length == 0) {
      throw new Error('toAddress cannot be empty if action is transfer')
    }
  }
  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {object} - Msg type key value.
   * @memberof MsgSend
   */
  public toStdSignDocMsgObj(): object {
    return {
      type: this.AMINO_KEY,
      value: {
        action: this.action.toString(),
        amount: this.amount,
        from_address: this.fromAddress.toLowerCase(),
        to_address: this.toAddress.toLowerCase(),
      },
    }
  }

  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {any} - Msg type key value.
   * @memberof MsgSend
   */
  public toStdTxMsgObj(): any {
    const data = {
      fromAddress: Buffer.from(this.fromAddress.toLowerCase(), 'hex'),
      toAddress: Buffer.from(this.toAddress.toLowerCase(), 'hex'),
      amount: this.amount,
      action: this.action.toString(),
    }

    const result = Any.fromJSON({
      typeUrl: this.KEY,
      value: Buffer.from(MsgDAOTransfer.encode(data).finish()).toString(
        'base64'
      ),
    })

    return result
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/msg-proto-gov-change-param.ts
import { Buffer } from 'buffer'
import { MsgChangeParam } from './../proto/generated/tx-signer'
import { Any } from '../proto/generated/google/protobuf/any'
import { TxMsg } from './tx-msg'
import { GovParameter } from '../gov'

/**
 * Model representing a MsgGovChangeParam to change an existing governance parameter
 */
export class MsgProtoGovChangeParam extends TxMsg {
  public readonly fromAddress: string
  public readonly paramKey: string
  public readonly paramValue: string
  public readonly KEY: string = '/x.gov.MsgChangeParam'
  public readonly AMINO_KEY: string = 'gov/msg_change_param'

  /**
   * Constructor this message
   * @param {string} fromAddress - Origin address
   * @param {string} paramKey - the acl key for governance parameter
   * @param {string} paramValue - the plain text (ASCII) value the governance parameter will represent
   * @param {string} overrideGovParamsWhitelistValidation - In the event that the PocketJS does not support the specified paramKey, this parameter can be set to true to override the validation check.
   */
  public constructor(
    fromAddress: string,
    paramKey: GovParameter | string,
    paramValue: string,
    overrideGovParamsWhitelistValidation?: boolean
  ) {
    super()
    this.fromAddress = fromAddress
    this.paramKey = paramKey
    this.paramValue = paramValue

    if (paramKey.length == 0) {
      throw new Error('paramKey cannot be empty')
    }

    if (paramValue.length == 0) {
      throw new Error('paramValue cannot be empty')
    }

    if (
      !overrideGovParamsWhitelistValidation &&
      !Object.values(GovParameter).includes(paramKey as GovParameter)
    ) {
      throw new Error(
        \`\${paramKey} is not a valid gov parameter, if this is an error, you can set overrideGovParamsWhitelistValidation to true to bypass the validation\`
      )
    }
  }
  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {object} - Msg type key value.
   * @memberof MsgSend
   */
  public toStdSignDocMsgObj(): object {
    return {
      type: this.AMINO_KEY,
      value: {
        address: this.fromAddress.toLowerCase(),
        param_key: this.paramKey,
        param_value: Buffer.from(JSON.stringify(this.paramValue)).toString(
          'base64'
        ),
      },
    }
  }

  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {any} - Msg type key value.
   * @memberof MsgSend
   */
  public toStdTxMsgObj(): any {
    const data = {
      FromAddress: Buffer.from(this.fromAddress.toLowerCase(), 'hex'),
      paramKey: this.paramKey,
      paramVal: Buffer.from(
        Buffer.from(JSON.stringify(this.paramValue)).toString('base64'),
        'base64'
      ),
    }

    const result = Any.fromJSON({
      typeUrl: this.KEY,
      value: Buffer.from(MsgChangeParam.encode(data).finish()).toString(
        'base64'
      ),
    })

    return result
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/msg-proto-app-unstake.ts
import { Buffer } from 'buffer'
import { MsgBeginUnstake } from './../proto/generated/tx-signer'
import { Any } from '../proto/generated/google/protobuf/any'
import { TxMsg } from './tx-msg'

/**
 * Model representing a MsgAppStake to unstake an Application in the Pocket Network
 */
export class MsgProtoAppUnstake extends TxMsg {
  public readonly KEY: string = '/x.apps.MsgBeginUnstake'
  public readonly AMINO_KEY: string = 'apps/MsgAppBeginUnstake'
  public readonly appAddress: string

  /**
   * The address hex of the Application to unstake for
   * @param {string} appAddress - Application address
   */
  public constructor(appAddress: string) {
    super()
    this.appAddress = appAddress
  }
  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {object} - Msg type key value.
   * @memberof MsgAppUnstake
   */
  public toStdSignDocMsgObj(): object {
    return {
      type: this.AMINO_KEY,
      value: {
        application_address: this.appAddress.toLowerCase(),
      },
    }
  }

  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {any} - Msg type key value.
   * @memberof MsgAppUnstake
   */
  public toStdTxMsgObj(): any {
    const data = { Address: Buffer.from(this.appAddress, 'hex') }

    return Any.fromJSON({
      typeUrl: this.KEY,
      value: Buffer.from(MsgBeginUnstake.encode(data).finish()).toString(
        'base64'
      ),
    })
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/msg-proto-app-unjail.ts
import { Buffer } from 'buffer'
import { MsgUnjail } from './../proto/generated/tx-signer'
import { Any } from '../proto/generated/google/protobuf/any'
import { TxMsg } from './tx-msg'

/**
 * Model representing a MsgAppUnjail to unjail an Application in the Pocket Network
 */
export class MsgProtoAppUnjail extends TxMsg {
  public readonly KEY: string = 'x.nodes.MsgUnjail'
  public readonly AMINO_KEY: string = 'apps/MsgAppUnjail'
  public readonly address: string

  /**
   *
   * @param {string} address - The address of the Application to unjail
   */
  public constructor(address: string) {
    super()
    this.address = address
  }

  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {object} - Msg type key value.
   * @memberof MsgAppUnjail
   */
  public toStdSignDocMsgObj(): object {
    return {
      type: this.AMINO_KEY,
      value: {
        address: this.address.toLowerCase(),
      },
    }
  }

  /**
   * Converts an Msg Object to StdTx
   * @returns {any} - Msg type key value.
   * @memberof MsgAppUnjail
   */
  public toStdTxMsgObj(): any {
    const data = { AppAddr: Buffer.from(this.address) }

    return Any.fromJSON({
      typeUrl: this.KEY,
      value: Buffer.from(MsgUnjail.encode(data).finish()).toString('base64'),
    })
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/msg-proto-app-transfer.ts
import { Buffer } from 'buffer'
import { MsgProtoStake } from '../proto/generated/tx-signer'
import { Any } from '../proto/generated/google/protobuf/any'
import { TxMsg } from './tx-msg'

/**
 * MsgProtoAppTransfer is a special case of MsgProtoAppStake where
 * chains and amount are not set
 */
export class MsgProtoAppTransfer extends TxMsg {
  public readonly KEY: string = '/x.apps.MsgProtoStake'
  public readonly AMINO_KEY: string = 'apps/MsgAppStake'
  public readonly pubKey: Buffer

  /**
   * Constructor for this class
   * @param {Buffer} pubKey - Application public key to be transferred to
   */
  constructor(pubKey: string) {
    super()
    this.pubKey = Buffer.from(pubKey, 'hex')
  }

  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {object} - Msg type key value.
   * @memberof MsgAppStake
   */
  public toStdSignDocMsgObj(): object {
    return {
      type: this.AMINO_KEY,
      value: {
        chains: null,
        pubkey: {
          type: 'crypto/ed25519_public_key',
          value: this.pubKey.toString('hex'),
        },
        value: '0',
      },
    }
  }

  /**
   * Converts an Msg Object for StdTx encoding
   * @returns {any} - Msg type key value.
   * @memberof MsgAppStake
   */
  public toStdTxMsgObj(): any {
    const data : MsgProtoStake = {
      pubKey: this.pubKey,
      chains: [],
      value: '0',
    }

    return Any.fromJSON({
      typeUrl: this.KEY,
      value: Buffer.from(MsgProtoStake.encode(data).finish()).toString(
        'base64'
      ),
    })
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/msg-proto-app-stake.ts
import { Buffer } from 'buffer'
import { MsgProtoStake } from '../proto/generated/tx-signer'
import { Any } from '../proto/generated/google/protobuf/any'
import { TxMsg } from './tx-msg'

const MINIMUM_STAKE_AMOUNT = 1000000

/**
 * Model representing a MsgAppStake to stake as an Application in the Pocket Network
 */
export class MsgProtoAppStake extends TxMsg {
  public readonly KEY: string = '/x.apps.MsgProtoStake'
  public readonly AMINO_KEY: string = 'apps/MsgAppStake'
  public readonly pubKey: Buffer
  public readonly chains: string[]
  public readonly amount: string

  /**
   * Constructor for this class
   * @param {Buffer} pubKey - Public key buffer
   * @param {string[]} chains - Network identifier list to be requested by this app
   * @param {string} amount - The amount to stake, must be greater than 0
   */
  constructor(pubKey: string, chains: string[], amount: string) {
    super()
    this.pubKey = Buffer.from(pubKey, 'hex')
    this.chains = chains
    this.amount = amount

    const amountNumber = Number(this.amount)

    if (isNaN(amountNumber)) {
      throw new Error('Amount is not a valid number')
    } else if (amountNumber < MINIMUM_STAKE_AMOUNT) {
      throw new Error(
        'Amount should be bigger than \${MINIMUM_STAKE_AMOUNT} uPOKT'
      )
    } else if (this.chains.length === 0) {
      throw new Error('Chains is empty')
    }
  }

  /**
   * Returns the msg type key
   * @returns {string} - Msg type key value.
   * @memberof MsgAppStake
   */
  public getMsgTypeKey(): string {
    return this.KEY
  }

  /**
   * Converts an Msg Object to StdSignDoc
   * @returns {object} - Msg type key value.
   * @memberof MsgAppStake
   */
  public toStdSignDocMsgObj(): object {
    return {
      type: this.AMINO_KEY,
      value: {
        chains: this.chains,
        pubkey: {
          type: 'crypto/ed25519_public_key',
          value: this.pubKey.toString('hex'),
        },
        value: this.amount,
      },
    }
  }

  /**
   * Converts an Msg Object for StdTx encoding
   * @returns {any} - Msg type key value.
   * @memberof MsgAppStake
   */
  public toStdTxMsgObj(): any {
    const data = {
      pubKey: this.pubKey,
      chains: this.chains,
      value: this.amount,
    }

    return Any.fromJSON({
      typeUrl: this.KEY,
      value: Buffer.from(MsgProtoStake.encode(data).finish()).toString(
        'base64'
      ),
    })
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/msgs/index.ts
export * from './msg-proto-app-stake'
export * from './msg-proto-app-transfer'
export * from './msg-proto-app-unstake'
export * from './msg-proto-node-stake'
export * from './msg-proto-node-unjail'
export * from './msg-proto-node-unstake'
export * from './msg-proto-send'
export * from './tx-msg'


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/index.ts
export * from './msgs'
export * from './coin-denom'
export * from './transaction-signature'
export * from './tx-signature'
export * from './gov'


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/gov.ts
export const FEATURE_UPGRADE_ONLY_HEIGHT = 1
export const FEATURE_UPGRADE_KEY = 'FEATURE'

// This is not really used, just filling in for an empty value since proto was not optional
export const OLD_UPGRADE_HEIGHT_EMPTY_VALUE = 0

export enum GovParameter {
  APPLICATION_ApplicationStakeMinimum = 'application/ApplicationStakeMinimum',
  APPLICATION_AppUnstakingTime = 'application/AppUnstakingTime',
  APPLICATION_BaseRelaysPerPOKT = 'application/BaseRelaysPerPOKT',
  APPLICATION_MaxApplications = 'application/MaxApplications',
  APPLICATION_MaximumChains = 'application/MaximumChains',
  APPLICATION_ParticipationRateOn = 'application/ParticipationRateOn',
  APPLICATION_StabilityAdjustment = 'application/StabilityAdjustment',
  AUTH_MaxMemoCharacters = 'auth/MaxMemoCharacters',
  AUTH_TxSigLimit = 'auth/TxSigLimit',
  GOV_Acl = 'gov/acl',
  GOV_DaoOwner = 'gov/daoOwner',
  GOV_Upgrade = 'gov/upgrade',
  POCKETCORE_ClaimExpiration = 'pocketcore/ClaimExpiration',
  AUTH_FeeMultipliers = 'auth/FeeMultipliers',
  POCKETCORE_ReplayAttackBurnMultiplier = 'pocketcore/ReplayAttackBurnMultiplier',
  POS_ProposerPercentage = 'pos/ProposerPercentage',
  POCKETCORE_ClaimSubmissionWindow = 'pocketcore/ClaimSubmissionWindow',
  POCKETCORE_MinimumNumberOfProofs = 'pocketcore/MinimumNumberOfProofs',
  POCKETCORE_SessionNodeCount = 'pocketcore/SessionNodeCount',
  POCKETCORE_SupportedBlockchains = 'pocketcore/SupportedBlockchains',
  POS_BlocksPerSession = 'pos/BlocksPerSession',
  POS_DAOAllocation = 'pos/DAOAllocation',
  POS_DowntimeJailDuration = 'pos/DowntimeJailDuration',
  POS_MaxEvidenceAge = 'pos/MaxEvidenceAge',
  POS_MaximumChains = 'pos/MaximumChains',
  POS_MaxJailedBlocks = 'pos/MaxJailedBlocks',
  POS_MaxValidators = 'pos/MaxValidators',
  POS_MinSignedPerWindow = 'pos/MinSignedPerWindow',
  POS_RelaysToTokensMultiplier = 'pos/RelaysToTokensMultiplier',
  POS_SignedBlocksWindow = 'pos/SignedBlocksWindow',
  POS_SlashFractionDoubleSign = 'pos/SlashFractionDoubleSign',
  POS_SlashFractionDowntime = 'pos/SlashFractionDowntime',
  POS_StakeDenom = 'pos/StakeDenom',
  POS_StakeMinimum = 'pos/StakeMinimum',
  POS_UnstakingTime = 'pos/UnstakingTime',
  POS_ServicerStakeWeightMultiplier = 'pos/ServicerStakeWeightMultiplier',
}

export enum DAOAction {
  Transfer = 'dao_transfer',
  Burn = 'dao_burn',
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/models/coin-denom.ts
/**
 * An enum to represent all the valid Coin Denominations in Pocket Network
 */
export enum CoinDenom {
  Upokt = 'Upokt',
  Pokt = 'Pokt',
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/index.ts
export * from './tx-builder'
export * from './errors'
export * from './models'
export * from './factory'


// File: pokt-network/pocket-js/packages/transaction-builder/src/factory/tx-encoder-factory.ts
import { ProtoTxEncoder } from './proto-tx-encoder'
import { BaseTxEncoder } from './base-tx-encoder'
import { TxMsg } from '../models/msgs'
import { CoinDenom } from '../models/coin-denom'

export class TxEncoderFactory {
  public static createEncoder(
    entropy: string,
    chainID: string,
    msg: TxMsg,
    fee: string,
    feeDenom?: CoinDenom,
    memo?: string
  ): BaseTxEncoder {
    return new ProtoTxEncoder(entropy, chainID, msg, fee, feeDenom, memo)
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/factory/proto-tx-encoder.ts
import * as varint from 'varint'
import { Buffer } from 'buffer'
import { BaseTxEncoder } from './base-tx-encoder'
import { CoinDenom } from '../models/coin-denom'
import { TxSignature } from '../models/tx-signature'
import {
  ProtoStdSignature,
  ProtoStdTx,
} from '../models/proto/generated/tx-signer'
import { stringifyObjectWithSort } from '@pokt-foundation/pocketjs-utils'

export class ProtoTxEncoder extends BaseTxEncoder {
  public getFeeObj() {
    return [
      {
        amount: this.fee,
        denom:
          this.feeDenom !== undefined
            ? CoinDenom[this.feeDenom].toLowerCase()
            : 'upokt',
      },
    ]
  }

  // Returns the bytes to be signed by the account sending the transaction
  public marshalStdSignDoc(): Buffer {
    const stdSignDoc = {
      chain_id: this.chainID,
      entropy: this.entropy,
      fee: this.getFeeObj(),
      memo: this.memo,
      msg: this.msg.toStdSignDocMsgObj(),
    }

    // Use stringifyObject instead JSON.stringify to get a deterministic result.
    return Buffer.from(stringifyObjectWithSort(stdSignDoc), 'utf-8')
  }

  // Returns the encoded transaction
  public marshalStdTx(signature: TxSignature): Buffer {
    const txSig: ProtoStdSignature = {
      publicKey: signature.pubKey,
      Signature: signature.signature,
    }
    const stdTx: ProtoStdTx = {
      msg: this.msg.toStdTxMsgObj(),
      fee: this.getFeeObj(),
      signature: txSig,
      memo: this.memo ? this.memo : '',
      entropy: parseInt(this.entropy, 10),
    }

    // Create the Proto Std Tx bytes
    const protoStdTxBytes: Buffer = Buffer.from(
      ProtoStdTx.encode(stdTx).finish()
    )

    // Create the prefix
    const prefixBytes = varint.encode(protoStdTxBytes.length)
    const prefix = Buffer.from(prefixBytes)

    // Concatenate for the result
    return Buffer.concat([prefix, protoStdTxBytes])
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/factory/proto-tx-decoder.ts
/* eslint-disable no-case-declarations */
import { Buffer } from 'buffer'
import { MsgSend, ProtoStdTx } from '../models/proto/generated/tx-signer'

export class ProtoTxDecoder {
  // Returns partially decoded transaction
  public unmarshalStdTx(
    encodedTxBytes: Buffer,
    length: number = encodedTxBytes.length
  ): ProtoStdTx {
    return ProtoStdTx.decode(encodedTxBytes.subarray(2), length - 2)
  }

  // Returns decoded transaction message data
  public decodeStdTxData(protoStdTx: ProtoStdTx) {
    switch (protoStdTx.msg?.typeUrl) {
      case '/x.nodes.MsgSend':
        const msgSendData = MsgSend.decode(protoStdTx.msg.value)

        const decodedStdTxData = {
          memo: protoStdTx.memo,
          entropy: protoStdTx.entropy,
          fee: protoStdTx.fee,
          msg: {
            typeUrl: protoStdTx.msg.typeUrl,
            value: {
              amount: msgSendData.amount,
              FromAddress: Buffer.from(msgSendData.FromAddress).toString('hex'),
              ToAddress: Buffer.from(msgSendData.ToAddress).toString('hex'),
            },
          },
          signature: protoStdTx.signature
            ? {
                publicKey: Buffer.from(protoStdTx.signature.publicKey).toString(
                  'hex'
                ),
                Signature: Buffer.from(protoStdTx.signature.Signature).toString(
                  'hex'
                ),
              }
            : protoStdTx.signature,
        }

        return decodedStdTxData
      default:
        throw Error('Decoding for transaction type not supported yet.')
    }
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/factory/index.ts
export * from './base-tx-encoder'
export * from './proto-tx-decoder'
export * from './proto-tx-encoder'
export * from './tx-encoder-factory'


// File: pokt-network/pocket-js/packages/transaction-builder/src/factory/base-tx-encoder.ts
import { TxSignature } from '../models/tx-signature'
import { CoinDenom, TxMsg } from '../models'

export abstract class BaseTxEncoder {
  entropy: string
  chainID: string
  msg: TxMsg
  fee: string
  feeDenom?: CoinDenom
  memo?: string = ''

  // Concrete constructor
  constructor(
    entropy: string,
    chainID: string,
    msg: TxMsg,
    fee: string,
    feeDenom?: CoinDenom,
    memo?: string
  ) {
    this.entropy = entropy
    this.chainID = chainID
    this.msg = msg
    this.fee = fee
    this.feeDenom = feeDenom
    this.memo = memo ? memo : ''
  }

  // Abstract functions
  abstract marshalStdSignDoc(): Buffer
  abstract marshalStdTx(signature: TxSignature): Buffer
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/errors.ts
export class InvalidChainIDError extends Error {
  constructor(message: string, ...params: any[]) {
    super(...params)
    this.message = message
    this.name = 'InvalidChainIDError'
  }
}

export class NoProviderError extends Error {
  constructor(message: string, ...params: any[]) {
    super(...params)
    this.message = message
    this.name = 'NoProviderError'
  }
}

export class NoSignerError extends Error {
  constructor(message: string, ...params: any[]) {
    super(...params)
    this.message = message
    this.name = 'NoSignerError'
  }
}


// File: pokt-network/pocket-js/packages/transaction-builder/src/abstract-tx-builder.ts
import {
  MsgProtoAppStake,
  MsgProtoAppUnstake,
  MsgProtoNodeStakeTx,
  MsgProtoNodeUnjail,
  MsgProtoNodeUnstake,
  MsgProtoSend,
} from './models/msgs'
import {
  RawTxRequest,
  TransactionResponse,
} from '@pokt-foundation/pocketjs-types'
import { TxMsg } from './models/'

export type ChainID = 'mainnet' | 'testnet' | 'localnet'

export abstract class AbstractBuilder {
  /**
   * Gets the current chain ID this Transaction Builder has been initialized for.
   * @returns {ChainID} - 'mainnet', 'localnet', or 'testnet'.
   */
  abstract getChainID(): ChainID

  /**
   * Sets the chainID to one of the supported networks.
   */
  abstract setChainID(id: ChainID): void

  /**
   * Signs and creates a transaction object that can be submitted to the network given the parameters and called upon Msgs.
   * Will empty the msg list after succesful creation
   * @param {string} fee - The amount to pay as a fee for executing this transaction, in uPOKT (1 POKT = 1*10^6 uPOKT).
   * @param {string} memo - The memo field for this account
   * @returns {Promise<RawTxRequest>} - A Raw transaction Request which can be sent over the network.
   */
  abstract createTransaction({
    fee,
    memo,
    txMsg,
  }: {
    fee?: string | bigint
    memo?: string
    txMsg: TxMsg
  }): Promise<RawTxRequest>

  /**
   * Submit receives a valid transaction message, creates a Raw Transaction Request and sends it over the network.
   * @param {string} fee - The amount to pay as a fee for executing this transaction, in uPOKT (1 POKT = 1*10^6 uPOKT).
   * @param {string} memo - The memo field for this account
   * @param {TxMsg} txMsg - The transaction message to use for creating the RawTxRequest that will be sent over the network.
   * @returns {Promise<TransactionResponse>} - The Transaction Response from the network, containing the transaction hash.
   */
  abstract submit({
    fee,
    memo,
    txMsg,
  }: {
    fee?: string | bigint
    memo?: string
    txMsg: TxMsg
  }): Promise<TransactionResponse>

  /**
   * Submit receives an already made Raw Transaction Request and sends it over the network.
   * @param {RawTxRequest} tx - The Raw Transaction Request use for creating the RawTxRequest that will be sent over the network.
   * @returns {Promise<TransactionResponse>} - The Transaction Response from the network, containing the transaction hash.
   */
  abstract submitRawTransaction(tx: RawTxRequest): Promise<TransactionResponse>

  /**
   * Adds a MsgSend TxMsg for this transaction
   * @param {string} fromAddress - Origin address
   * @param {string} toAddress - Destination address
   * @param {string} amount - Amount to be sent, needs to be a valid number greater than 1 uPOKT.
   * @returns {MsgProtoSend} - The unsigned Send message.
   */
  abstract send({
    fromAddress,
    toAddress,
    amount,
  }: {
    fromAddress: string
    toAddress: string
    amount: string
  }): MsgProtoSend
  /**
   * Adds a MsgAppStake TxMsg for this transaction
   * @param {string} appPubKey - Application Public Key
   * @param {string[]} chains - Network identifier list to be requested by this app
   * @param {string} amount - the amount to stake, must be greater than or equal to 1 POKT
   * @returns {MsgProtoAppStake} - The unsigned App Stake message.
   */
  abstract appStake({
    appPubKey,
    chains,
    amount,
  }: {
    appPubKey: string
    chains: string[]
    amount: string
  }): MsgProtoAppStake

  /**
   * Adds a MsgBeginAppUnstake TxMsg for this transaction
   * @param {string} address - Address of the Application to unstake for
   * @returns {MsgProtoAppUnstake} - The unsigned App Unstake message.
   */
  abstract appUnstake(address: string): MsgProtoAppUnstake

  /**
   * Adds a NodeStake TxMsg for this transaction
   * @param {string} nodePubKey - Node Public key
   * @param {string} outputAddress - The address that the coins will be sent to when the node is unstaked
   * @param {string[]} chains - Network identifier list to be serviced by this node
   * @param {string} amount - the amount to stake, must be greater than or equal to 1 POKT
   * @param {URL} serviceURL - Node service url
   * @param { [key: string]: number } rewardDelegators - Reward delegators
   * @returns {MsgProtoNodeStakeTx} - The unsigned Node Stake message.
   */
  abstract nodeStake({
    nodePubKey,
    outputAddress,
    chains,
    amount,
    serviceURL,
    rewardDelegators,
  }: {
    nodePubKey: string
    outputAddress: string
    chains: string[]
    amount: string
    serviceURL: URL
    rewardDelegators: { [key: string]: number } | undefined
  }): MsgProtoNodeStakeTx

  /**
   * Adds a MsgBeginUnstake TxMsg for this transaction
   * @param {string} nodeAddress - Address of the Node to unstake for
   * @param {string} signerAddress - The address that the coins will be sent to when the node is unstaked. Must be the same address entered when the node was staked
   * @returns {MsgProtoNodeUnstake} - The unsigned Node Unstake message.
   */
  abstract nodeUnstake({
    nodeAddress,
    signerAddress,
  }: {
    nodeAddress?: string
    signerAddress?: string
  }): MsgProtoNodeUnstake

  /**
   * Adds a MsgUnjail TxMsg for this transaction
   * @param {string} nodeAddress - Address of the Node to unjail
   * @returns {MsgProtoNodeUnjail} - The unsigned Node Unjail message.
   */
  abstract nodeUnjail({
    nodeAddress,
    signerAddress,
  }: {
    nodeAddress?: string
    signerAddress?: string
  }): MsgProtoNodeUnjail
}


// File: pokt-network/pocket-js/packages/signer/src/key-manager.ts
import Sodium from 'libsodium-wrappers'
import crypto from 'isomorphic-crypto'
import { Buffer } from 'buffer'
import debug from 'debug'
import {
  getAddressFromPublicKey,
  publicKeyFromPrivate,
} from '@pokt-foundation/pocketjs-utils'
import scrypt from 'scrypt-js'
import { InvalidPPKError } from './errors'
import { AbstractSigner, Account } from './abstract-signer'

const HEX_REGEX = /^[0-9a-fA-F]+$/
// Scrypt-related constants
const SCRYPT_HASH_LENGTH = 32
const SCRYPT_OPTIONS = {
  N: 32768,
  r: 8,
  p: 1,
  maxmem: 4294967290,
}

/**
 * A KeyManager lets you import accounts with their private key or PPK (Portable Private Key)
 * and get its address, public key, private key, and sign messages.
 **/
export class KeyManager implements AbstractSigner {
  private address: string

  private publicKey: string
  private privateKey: string

  constructor({
    address,
    privateKey,
    publicKey,
  }: {
    address: string
    privateKey: string
    publicKey: string
  }) {
    this.privateKey = privateKey
    this.publicKey = publicKey
    this.address = address
  }

  /**
   * signs a valid hex-string payload with the imported private key.
   * @param {string} payload - The hex payload to sign.
   * @returns {string} - The signed payload as a string.
   * */
  async sign(payload: string): Promise<string> {
    await Sodium.ready
    return Buffer.from(
      Sodium.crypto_sign_detached(
        Buffer.from(payload, 'hex'),
        Buffer.from(this.getPrivateKey(), 'hex')
      )
    ).toString('hex')
  }

  /**
   * Creates a new, random Pocket account.
   * @returns {KeyManager} - A new Key Manager instance with the account attached.
   * */
  static async createRandom(): Promise<KeyManager> {
    await Sodium.ready
    const keypair = Sodium.crypto_sign_keypair()
    const privateKey = Buffer.from(keypair.privateKey).toString('hex')
    const publicKey = Buffer.from(keypair.publicKey).toString('hex')
    const addr = await getAddressFromPublicKey(publicKey)

    const logger = debug('KeyManager')
    logger(\`Created account with public key \${publicKey} and address \${addr}\`)

    return new KeyManager({ privateKey, publicKey, address: addr })
  }

  /**
   * Instanciates a new KeyManager from a valid ED25519 private key.
   * @param {string} privateKey - The private key to use to instanciate the new Key manager.
   * @returns {KeyManager} - A new Key Manager instance with the account attached.
   * */
  static async fromPrivateKey(privateKey: string): Promise<KeyManager> {
    await Sodium.ready
    const publicKey = publicKeyFromPrivate(privateKey)
    const addr = await getAddressFromPublicKey(publicKey)

    return new KeyManager({ privateKey, publicKey, address: addr })
  }

  /**
   * Instanciates a new KeyManager from a valid Portable-Private-Key file.
   * @param {string} password - The password that was used in the PPK.
   * @param {string} ppk - The stringified PPK.
   * @returns {KeyManager} - A new Key Manager instance with the account attached.
   * */
  static async fromPPK({
    password,
    ppk,
  }: {
    password: string
    ppk: string
  }): Promise<KeyManager> {
    const isPPKValid = this.validatePPKJSON(ppk)

    if (!isPPKValid) {
      throw new InvalidPPKError()
    }

    const jsonObject = JSON.parse(ppk)
    const scryptHashLength = 32
    const ivLength = Number(jsonObject.secparam)
    const tagLength = 16
    const algorithm = 'aes-256-gcm'
    const scryptOptions = {
      N: 32768,
      r: 8,
      p: 1,
      maxmem: 4294967290,
    }
    // Retrieve the salt
    const decryptSalt = Buffer.from(jsonObject.salt, 'hex')
    // Scrypt hash
    const scryptHash = scrypt.syncScrypt(
      Buffer.from(password, 'utf8'),
      decryptSalt,
      scryptOptions.N,
      scryptOptions.r,
      scryptOptions.p,
      scryptHashLength
    )
    // Create a buffer from the ciphertext
    const inputBuffer = Buffer.from(jsonObject.ciphertext, 'base64')

    // Create empty iv, tag and data constants
    const iv = scryptHash.slice(0, ivLength)
    const tag = inputBuffer.slice(inputBuffer.length - tagLength)
    const data = inputBuffer.slice(0, inputBuffer.length - tagLength)

    // Create the decipher
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(scryptHash),
      iv
    )
    // Set the auth tag
    decipher.setAuthTag(tag)
    // Update the decipher with the data to utf8
    let privateKey = decipher.update(data, undefined, 'utf8')
    privateKey += decipher.final('utf8')

    // generate public key and address from private key extracted
    const publicKey = publicKeyFromPrivate(privateKey)
    const addr = await getAddressFromPublicKey(publicKey)

    return new KeyManager({
      privateKey: privateKey.toString('hex'),
      publicKey,
      address: addr,
    })
  }

  /**
   * Exports a private key as a Portable-Private-Key, unlockable with the used password.
   * @param {string} password - The password to use in the PPK.
   * @param {string} privateKey - The private key to create the PPK from.
   * @param {string} hint - Password hint.
   * @returns {string} - The PPK in string format.
   * */
  static async exportPPK({
    privateKey,
    password,
    hint,
  }: {
    privateKey: string
    password: string
    hint: string
  }): Promise<string> {
    const secParam = 12
    const algorithm = 'aes-256-gcm'
    const salt = crypto.randomBytes(16)
    const scryptHash = scrypt.syncScrypt(
      Buffer.from(password, 'utf8'),
      salt,
      SCRYPT_OPTIONS.N,
      SCRYPT_OPTIONS.r,
      SCRYPT_OPTIONS.p,
      SCRYPT_HASH_LENGTH
    )
    // Create the nonce from the first 12 bytes of the sha256 Scrypt hash
    const scryptHashBuffer = Buffer.from(scryptHash)
    const iv = Buffer.allocUnsafe(secParam)
    scryptHashBuffer.copy(iv, 0, 0, secParam)
    // Generate ciphertext by using the privateKey, nonce and sha256 Scrypt hash
    const cipher = await crypto.createCipheriv(algorithm, scryptHashBuffer, iv)
    let cipherText = cipher.update(privateKey, 'utf8', 'hex')
    cipherText += cipher.final('hex')
    // Concatenate the ciphertext final + auth tag
    cipherText = cipherText + cipher.getAuthTag().toString('hex')
    // Returns the Armored JSON string
    return JSON.stringify({
      kdf: 'scrypt',
      salt: salt.toString('hex'),
      secparam: secParam.toString(),
      hint: hint,
      ciphertext: Buffer.from(cipherText, 'hex').toString('base64'),
    })
  }

  /**
   * Validates the PPK json string properties
   * @param {string} jsonStr - JSON String holding the ppk information.
   * @returns {boolean} True or false.
   */
  static validatePPKJSON(jsonStr: string): boolean {
    const jsonObject = JSON.parse(jsonStr)
    // Check if undefined
    if (
      jsonObject.kdf === undefined ||
      jsonObject.salt === undefined ||
      jsonObject.secparam === undefined ||
      jsonObject.ciphertext === undefined
    ) {
      return false
    }
    // Validate the properties
    if (
      jsonObject.kdf !== 'scrypt' ||
      !new RegExp(HEX_REGEX).test(jsonObject.salt) ||
      jsonObject.secparam <= 0 ||
      jsonObject.ciphertext.length <= 0
    ) {
      return false
    }
    return true
  }

  /**
   * Gets the account address.
   * @returns {string} - The attached account's address.
   * */
  getAddress(): string {
    return this.address
  }

  /**
   * Gets the account public key.
   * @returns {string} - The attached account's public key.
   * */
  getPublicKey(): string {
    return this.publicKey
  }

  /**
   * Gets the account private key.
   * @returns {string} - The attached account's private key.
   * */
  getPrivateKey(): string {
    return this.privateKey
  }

  /**
   * Gets and exports the attached account.
   * @returns {Account} - The attached account.
   * */
  getAccount(): Account {
    return {
      address: this.address,
      publicKey: this.publicKey,
      privateKey: this.privateKey,
    }
  }

  /**
   * Exports a private key as a Portable-Private-Key, unlockable with the used password.
   * @param {string} password - The password to use in the PPK.
   * @param {string} hint - Password hint.
   * @returns {string} - The stringified PPK.
   * */
  async exportPPK({
    password,
    hint = '',
  }: {
    password: string
    hint?: string
  }): Promise<string> {
    return KeyManager.exportPPK({
      privateKey: this.getPrivateKey(),
      password,
      hint,
    })
  }
}


// File: pokt-network/pocket-js/packages/signer/src/index.ts
export * from './abstract-signer'
export * from './key-manager'


// File: pokt-network/pocket-js/packages/signer/src/errors.ts
export class InvalidPPKError extends Error {
  constructor() {
    super()
    this.name = 'InvalidPPKError'
    this.message =
      'Invalid PPK. One or more of the properties of this PPK have been tampered with.'
  }
}


// File: pokt-network/pocket-js/packages/signer/src/abstract-signer.ts
/**
 * An abstract signer describes a to-be-implemented signer.
 * Useful for creating custom signers, if ever needed.
 * */
export abstract class AbstractSigner {
  abstract getAddress(): string
  abstract getAccount(): Account
  abstract getPublicKey(): string
  abstract getPrivateKey(): string
  abstract sign(payload: string): Promise<string>
}

export interface Account {
  address: string
  publicKey: string
  privateKey: string
}


// File: pokt-network/pocket-js/packages/relayer/src/relayer.ts
import crypto from 'isomorphic-webcrypto'
import debug from 'debug'
import sha3 from 'js-sha3'
import { JsonRpcProvider } from '@pokt-foundation/pocketjs-provider'
import { AbstractSigner, KeyManager } from '@pokt-foundation/pocketjs-signer'
import {
  HTTPMethod,
  Node,
  PocketAAT,
  RelayHeaders,
  RelayPayload,
  Session,
} from '@pokt-foundation/pocketjs-types'
import { AbstractRelayer } from './abstract-relayer'
import {
  EmptyKeyManagerError,
  NoServiceNodeError,
  ServiceNodeNotInSessionError,
  validateRelayResponse,
} from './errors'

export class Relayer implements AbstractRelayer {
  readonly keyManager: KeyManager
  readonly provider: JsonRpcProvider
  readonly dispatchers: string[]
  private secureEnsured = false

  constructor({ keyManager, provider, dispatchers }) {
    this.keyManager = keyManager
    this.provider = provider
    this.dispatchers = dispatchers
  }

  /**
   * Performs a dispatch request to obtain a new session. Fails if no dispatcher is provided through the provider.
   * @param {string} applicationPubKey - The application's public key.
   * @param {string} chain - The chain for the session.
   * @param {string} sessionBlockHeight - The session block height. Defaults to 0, as usually you'd want the latest session.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.retryAttempts - The number of retries to perform if the first call fails.
   * @param {boolean} options.rejectSelfSignedCertificates - Option to reject self signed certificates or not.
   * @param {timeout} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {DispatchResponse} - The dispatch response from the dispatcher node, as a session.
   * */
  async getNewSession({
    applicationPubKey,
    chain,
    sessionBlockHeight = 0,
    options = {
      retryAttempts: 3,
      rejectSelfSignedCertificates: false,
    },
  }: {
    applicationPubKey?: string
    chain: string
    sessionBlockHeight?: number
    options?: {
      retryAttempts?: number
      rejectSelfSignedCertificates?: boolean
      timeout?: number
    }
  }): Promise<Session> {
    const dispatchResponse = await this.provider.dispatch(
      {
        sessionHeader: {
          applicationPubKey:
            applicationPubKey ?? this.keyManager.getPublicKey(),
          chain,
          sessionBlockHeight: sessionBlockHeight ?? 0,
        },
      },
      options
    )

    return dispatchResponse.session as Session
  }

  static async relay({
    blockchain,
    data,
    headers = null,
    keyManager,
    method = '',
    node,
    path = '',
    pocketAAT,
    provider,
    session,
    options = {
      retryAttempts: 0,
      rejectSelfSignedCertificates: false,
    },
  }: {
    blockchain: string
    data: string
    headers?: RelayHeaders | null
    keyManager: KeyManager | AbstractSigner
    method: HTTPMethod | ''
    node: Node
    path: string
    pocketAAT: PocketAAT
    provider: JsonRpcProvider
    session: Session
    options?: {
      retryAttempts?: number
      rejectSelfSignedCertificates?: boolean
      timeout?: number
    }
  }) {
    const logger = debug('Relayer')
    const startTime = process.hrtime()

    if (!keyManager) {
      logger('Found error: no keymanager')
      throw new EmptyKeyManagerError('You need a signer to send a relay')
    }

    const serviceNode = node ?? Relayer.getRandomSessionNode(session)

    if (!serviceNode) {
      logger('Found error: no service node to use')
      throw new NoServiceNodeError(\`Couldn't find a service node to use.\`)
    }

    if (!this.isNodeInSession(session, serviceNode)) {
      logger('Found error: provided node not in session')
      throw new ServiceNodeNotInSessionError(
        \`Provided node is not in the current session\`
      )
    }

    const servicerPubKey = serviceNode.publicKey

    const relayPayload = {
      data,
      method,
      path,
      headers,
    } as RelayPayload

    const relayMeta = {
      block_height: Number(session.header.sessionBlockHeight.toString()),
    }

    const requestHash = {
      payload: relayPayload,
      meta: relayMeta,
    }

    const entropy = this.getRandomIntInclusive()

    const proofBytes = this.generateProofBytes({
      entropy,
      sessionBlockHeight: Number(session.header.sessionBlockHeight.toString()),
      servicerPublicKey: servicerPubKey,
      blockchain,
      pocketAAT,
      requestHash,
    })
    const signedProofBytes = await keyManager.sign(proofBytes)

    const relayProof = {
      entropy: Number(entropy.toString()),
      session_block_height: Number(
        session.header.sessionBlockHeight.toString()
      ),
      servicer_pub_key: servicerPubKey,
      blockchain,
      aat: {
        version: pocketAAT.version,
        app_pub_key: pocketAAT.applicationPublicKey,
        client_pub_key: pocketAAT.clientPublicKey,
        signature: pocketAAT.applicationSignature,
      },
      signature: signedProofBytes,
      request_hash: this.hashRequest(requestHash),
    }

    const relayRequest = {
      payload: relayPayload,
      meta: relayMeta,
      proof: relayProof,
    }

    const totalTime = process.hrtime(startTime)
    logger(\`Relay data structure generated, TOOK \${totalTime}\`)

    const relay = await provider.relay(
      relayRequest,
      serviceNode.serviceUrl.toString(),
      options
    )

    const relayResponse = await validateRelayResponse(relay)

    return {
      response: relayResponse,
      relayProof: {
        entropy: relayProof.entropy,
        sessionBlockheight: relayProof.session_block_height,
        servicerPubKey: servicerPubKey,
        blockchain,
        aat: {
          version: pocketAAT.version,
          appPubKey: pocketAAT.applicationPublicKey,
          clientPubKey: pocketAAT.clientPublicKey,
          signature: pocketAAT.applicationSignature,
        },
        signature: signedProofBytes,
        requestHash: this.hashRequest(requestHash),
      },
      serviceNode,
    }
  }

  /**
   * Sends a relay to the network.
   * @param {string} blockchain - The chain for the session.
   * @param {string} data - The data to send, stringified.
   * @param {object} headers - The headers to include in the call, if any.
   * @param {Node} node - The node to send the relay to. The node must belong to the current session.
   * @param {string} path - The path to query in the relay e.g "/v1/query/node". Useful for chains like AVAX.
   * @param {AAT} pocketAAT - The pocket AAT used to authenticate the relay.
   * @param {Session} session - The current session the app is assigned to.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.retryAttempts - The number of retries to perform if the first call fails.
   * @param {boolean} options.rejectSelfSignedCertificates - Option to reject self signed certificates or not.
   * @param {timeout} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {RelayResponse} - The relay response.
   * */
  async relay({
    blockchain,
    data,
    headers = null,
    method = '',
    node,
    path = '',
    pocketAAT,
    session,
    options = {
      retryAttempts: 0,
      rejectSelfSignedCertificates: false,
    },
  }: {
    data: string
    blockchain: string
    pocketAAT: PocketAAT
    headers?: RelayHeaders | null
    method: HTTPMethod | ''
    session: Session
    node: Node
    path: string
    options?: {
      retryAttempts?: number
      rejectSelfSignedCertificates?: boolean
      timeout?: number
    }
  }) {
    if (!this.keyManager) {
      throw new Error('You need a signer to send a relay')
    }
    const serviceNode = node ?? undefined

    // React native only:
    // If this SDK is used in a mobile context,
    // the native crypto library needs to be used in a secure context to properly
    // generate random values.
    if (!this.secureEnsured) {
      if (crypto.ensureSecure) {
        await crypto.ensureSecure()
      }
      this.secureEnsured = true
    }

    return Relayer.relay({
      blockchain,
      data,
      headers,
      method,
      node: serviceNode,
      path,
      pocketAAT,
      session,
      keyManager: this.keyManager,
      provider: this.provider,
      options,
    })
  }

  static getRandomSessionNode(session: Session): Node {
    const nodesInSession = session.nodes.length
    const rng = Math.floor(Math.random() * 100) % nodesInSession

    return session.nodes[rng]
  }

  static isNodeInSession(session: Session, node: Node): boolean {
    return Boolean(session.nodes.find((n) => n.publicKey === node.publicKey))
  }

  static generateProofBytes({
    entropy,
    sessionBlockHeight,
    servicerPublicKey,
    blockchain,
    pocketAAT,
    requestHash,
  }: {
    entropy: bigint | string | number
    sessionBlockHeight: string | number
    servicerPublicKey: string
    blockchain: string
    pocketAAT: PocketAAT
    requestHash: any
  }): string {
    const proofJSON = {
      entropy: Number(entropy.toString()),
      session_block_height: Number(sessionBlockHeight.toString()),
      servicer_pub_key: servicerPublicKey,
      blockchain: blockchain,
      signature: '',
      token: this.hashAAT(pocketAAT),
      request_hash: this.hashRequest(requestHash),
    }
    const proofJSONStr = JSON.stringify(proofJSON)
    // Hash proofJSONStr
    const hash = sha3.sha3_256.create()
    hash.update(proofJSONStr)
    return hash.hex()
  }

  static hashAAT(aat: PocketAAT): string {
    const token = {
      version: aat.version,
      app_pub_key: aat.applicationPublicKey,
      client_pub_key: aat.clientPublicKey,
      signature: '',
    }
    const hash = sha3.sha3_256.create()
    hash.update(JSON.stringify(token))
    return hash.hex()
  }

  static hashRequest(requestHash): string {
    const hash = sha3.sha3_256.create()
    hash.update(JSON.stringify(requestHash))
    return hash.hex()
  }

  static getRandomIntInclusive(min = 0, max = Number.MAX_SAFE_INTEGER) {
    const randomBuffer = new Uint32Array(1)

    crypto.getRandomValues(randomBuffer)

    const randomNumber = randomBuffer[0] / (0xffffffff + 1)

    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(randomNumber * (max - min + 1)) + min
  }

  static async GenerateAAT(
    applicationPrivKey: KeyManager,
    clientPubKey: string,
  ): Promise<PocketAAT> {
    const aat = {
        version: "0.0.1",
        applicationPublicKey: applicationPrivKey.getPublicKey(),
        clientPublicKey: clientPubKey,
        applicationSignature: "",
    };
    const hash = this.hashAAT(aat);
    aat.applicationSignature = await applicationPrivKey.sign(hash);
    return aat;
  }
}


// File: pokt-network/pocket-js/packages/relayer/src/index.ts
export * from './abstract-relayer'
export * from './relayer'
export * from './errors'


// File: pokt-network/pocket-js/packages/relayer/src/errors.ts
export class ServiceNodeNotInSessionError extends Error {
  constructor(message: string, ...params: any[]) {
    super(...params)
    this.message = message
    this.name = 'ServiceNodeNotInSessionError'
  }
}

export class EmptyKeyManagerError extends Error {
  constructor(message: string, ...params: any[]) {
    super(...params)
    this.message = message
    this.name = 'EmptyKeyManagerError'
  }
}

export class NoServiceNodeError extends Error {
  constructor(message: string, ...params: any[]) {
    super(...params)
    this.message = message
    this.name = 'NoServiceNodeError'
  }
}

export enum PocketCoreErrorCodes {
  AppNotFoundError = 45,
  DuplicateProofError = 37,
  EmptyPayloadDataError = 25,
  EvidenceSealedError = 90,
  HTTPExecutionError = 28,
  InvalidBlockHeightError = 60,
  InvalidSessionError = 14,
  OutOfSyncRequestError = 75,
  OverServiceError = 71,
  RequestHashError = 74,
  UnsupportedBlockchainError = 76,
}

export class PocketCoreError extends Error {
  code: number
  message: string

  constructor(code: number, message: string, ...params: any[]) {
    super(...params)
    this.code = code
    this.message = message
  }
}

export class EmptyPayloadDataError extends PocketCoreError {
  constructor(code: number, message: string, ...params: any[]) {
    super(code, message, ...params)
    this.name = 'EmptyPayloadError'
  }
}

export class RequestHashError extends PocketCoreError {
  constructor(code: number, message: string, ...params: any[]) {
    super(code, message, ...params)
    this.name = 'RequestHashError'
  }
}

export class UnsupportedBlockchainError extends PocketCoreError {
  constructor(code: number, message: string, ...params: any[]) {
    super(code, message, ...params)
    this.name = 'UnsupportedBlockchainError'
  }
}

export class InvalidBlockHeightError extends PocketCoreError {
  constructor(code: number, message: string, ...params: any[]) {
    super(code, message, ...params)
    this.name = 'InvalidBlockHeightError'
  }
}

export class InvalidSessionError extends PocketCoreError {
  constructor(code: number, message: string, ...params: any[]) {
    super(code, message, ...params)
    this.name = 'InvalidSessionError'
  }
}

export class AppNotFoundError extends PocketCoreError {
  constructor(code: number, message: string, ...params: any[]) {
    super(code, message, ...params)
    this.name = 'AppNotFoundError'
  }
}

export class EvidenceSealedError extends PocketCoreError {
  constructor(code: number, message: string, ...params: any[]) {
    super(code, message, ...params)
    this.name = 'EvidenceSealedError'
  }
}

export class DuplicateProofError extends PocketCoreError {
  constructor(code: number, message: string, ...params: any[]) {
    super(code, message, ...params)
    this.name = 'DuplicateProofError'
  }
}

export class OutOfSyncRequestError extends PocketCoreError {
  constructor(code: number, message: string, ...params: any[]) {
    super(code, message, ...params)
    this.name = 'OutOfSyncRequestError'
  }
}

export class OverServiceError extends PocketCoreError {
  constructor(code: number, message: string, ...params: any[]) {
    super(code, message, ...params)
    this.name = 'OverServiceError'
  }
}

export class HTTPExecutionError extends PocketCoreError {
  constructor(code: number, message: string, ...params: any[]) {
    super(code, message, ...params)
    this.name = 'HTTPExecutionError'
  }
}

export function validateRelayResponse(relayResponse: any) {
  if ('response' in relayResponse && 'signature' in relayResponse) {
    return relayResponse.response
  }

  // probably an unhandled error
  if (!('response' in relayResponse) && !('error' in relayResponse)) {
    return relayResponse
  }

  switch (relayResponse.error.code) {
    case PocketCoreErrorCodes.AppNotFoundError:
      throw new AppNotFoundError(
        PocketCoreErrorCodes.AppNotFoundError,
        relayResponse.error.message ?? ''
      )
    case PocketCoreErrorCodes.DuplicateProofError:
      throw new DuplicateProofError(
        PocketCoreErrorCodes.DuplicateProofError,
        relayResponse.error.message
      )
    case PocketCoreErrorCodes.EmptyPayloadDataError:
      throw new EmptyPayloadDataError(
        PocketCoreErrorCodes.EmptyPayloadDataError,
        relayResponse.error.message
      )
    case PocketCoreErrorCodes.EvidenceSealedError:
      throw new EvidenceSealedError(
        PocketCoreErrorCodes.EvidenceSealedError,
        relayResponse.error.message
      )
    case PocketCoreErrorCodes.InvalidBlockHeightError:
      throw new InvalidBlockHeightError(
        PocketCoreErrorCodes.InvalidBlockHeightError,
        relayResponse.error.message
      )
    case PocketCoreErrorCodes.OutOfSyncRequestError:
      throw new OutOfSyncRequestError(
        PocketCoreErrorCodes.OutOfSyncRequestError,
        relayResponse.error.message
      )
    case PocketCoreErrorCodes.OverServiceError:
      throw new OverServiceError(
        PocketCoreErrorCodes.OverServiceError,
        relayResponse.error.message
      )
    case PocketCoreErrorCodes.RequestHashError:
      throw new RequestHashError(
        PocketCoreErrorCodes.RequestHashError,
        relayResponse.error.message
      )
    case PocketCoreErrorCodes.UnsupportedBlockchainError:
      throw new UnsupportedBlockchainError(
        PocketCoreErrorCodes.UnsupportedBlockchainError,
        relayResponse.error.message
      )
    case PocketCoreErrorCodes.HTTPExecutionError:
      throw new HTTPExecutionError(
        PocketCoreErrorCodes.HTTPExecutionError,
        relayResponse.error.message
      )
    case PocketCoreErrorCodes.InvalidSessionError:
      throw new InvalidSessionError(
        PocketCoreErrorCodes.InvalidSessionError,
        relayResponse.error.message
      )
    default:
      throw new PocketCoreError(
        relayResponse.error.code,
        relayResponse.error.message ?? ''
      )
  }
}


// File: pokt-network/pocket-js/packages/relayer/src/abstract-relayer.ts
import { AbstractSigner, KeyManager } from '@pokt-foundation/pocketjs-signer'
import { AbstractProvider } from '@pokt-foundation/pocketjs-abstract-provider'
import {
  HTTPMethod,
  Node,
  PocketAAT,
  RelayHeaders,
  Session,
} from '@pokt-foundation/pocketjs-types'

export abstract class AbstractRelayer {
  readonly keyManager: KeyManager | AbstractSigner
  readonly provider: AbstractProvider
  readonly dispatchers: string[]

  constructor({ keyManager, provider, dispatchers }) {
    this.keyManager = keyManager
    this.provider = provider
    this.dispatchers = dispatchers
  }

  abstract getNewSession({
    pocketAAT,
    chain,
    options,
  }: {
    pocketAAT: PocketAAT
    chain: string
    options?: { retryAttempts: number; rejectSelfSignedCertificates: boolean }
  }): Promise<Session>

  abstract relay({
    data,
    blockchain,
    pocketAAT,
    headers,
    method,
    session,
    node,
    path,
  }: {
    data: string
    blockchain: string
    pocketAAT: PocketAAT
    headers: RelayHeaders
    method: HTTPMethod
    session: Session
    node: Node
    path: string
  }): void
}


// File: pokt-network/pocket-js/packages/provider/tests/test-utils.ts
export const DEFAULT_URL = 'http://localhost:4200'


// File: pokt-network/pocket-js/packages/provider/tests/response-samples/index.ts
import accountTxs from './accounttxs.json'
import queryBlockResponse from './queryblockres.json'
import txResponse from './tx.json'

export const responseSamples = {
  balance() {
    return {
      request: JSON.stringify({
        address: 'ce16bb2714f93cfb3c00b5bd4b16dc5d8ca1687a',
      }),
      response: {
        balance: 577231840000,
      },
    }
  },
  accountTxs() {
    return {
      request: JSON.stringify({
        address: 'ce16bb2714f93cfb3c00b5bd4b16dc5d8ca1687a',
      }),
      response: accountTxs,
    }
  },
  queryAppFail() {
    return {
      request: JSON.stringify({
        address: 'ce16bb2714f93cfb3c00b5bd4b16dc5d8ca1687a',
      }),
      response: {
        code: 400,
        message:
          'ERROR:\nCodespace: application\nCode: 101\nMessage: "application does not exist for that address"\n',
      },
    }
  },
  queryNodeFail() {
    return {
      request: JSON.stringify({
        address: 'ce16bb2714f93cfb3c00b5bd4b16dc5d8ca1687a',
      }),
      response: {
        code: 400,
        message:
          'validator not found for ce16bb2714f93cfb3c00b5bd4b16dc5d8ca1687a',
      },
    }
  },
  queryApp() {
    return {
      request: /3808c2de7d2e8eeaa2e13768feb78b10b13c8699/,
      response: {
        address: '3808c2de7d2e8eeaa2e13768feb78b10b13c8699',
        chains: ['0021'],
        jailed: false,
        max_relays: '83500',
        public_key:
          'a3edc0d94701ce5e0692754b519ab125c921c704f11439638834894a5ec5fa53',
        staked_tokens: '50000000000',
        status: 2,
        unstaking_time: '0001-01-01T00:00:00Z',
      },
    }
  },
  queryNode() {
    return {
      request: /3808c2de7d2e8eeaa2e13768feb78b10b13c8699/,
      response: {
        address: '3808c2de7d2e8eeaa2e13768feb78b10b13c8699',
        chains: [
          '03DF',
          '0003',
          '0005',
          '0009',
          '0021',
          '0022',
          '0023',
          '0024',
          '0025',
          '0026',
          '0027',
          '0028',
          '0040',
          '0047',
          '0049',
        ],
        jailed: false,
        public_key:
          'b3ec0904fbaa3b61e41502641af78dfa72f93437a760bf5c529cd97444bd101f',
        service_url: 'https://node830.thunderstake.io:443',
        status: 2,
        tokens: '15050000000',
        unstaking_time: '0001-01-01T00:00:00Z',
      },
    }
  },
  sendTransaction() {
    return {
      request: JSON.stringify({
        address: '3808c2de7d2e8eeaa2e13768feb78b10b13c8699',
        raw_hex_bytes:
          'd9010a490a102f782e6e6f6465732e4d736753656e6412350a14073b1fbbf246d17bb75d270580c53fd356876d7012145f8027e4aa0b971842199998cb585a1d65b200651a0731303030303030120e0a0575706f6b74120531303030301a640a207e3acf8a3b238e193836adbb20ebd95071fabc39f5c483e0dcc508d5c770c28112404d5baec2b57ae446ce7b47704aae0d7332eded723ee95caed6d59bf34aaf873be63e5612ec34c8c0830101705858413f10cf2209237825647565e378a3462f09220d4d736753656e644a7354657374288dcf86fb89b4c303',
      }),
      response: {
        logs: null,
        txhash:
          'E18E06C9FE249394449EB508EFB696D10A48CFABD982B13407FFC6ED34243E73',
      },
    }
  },
  queryBlock() {
    return {
      request: JSON.stringify({
        height: 59133,
      }),
      response: queryBlockResponse,
    }
  },
  queryTransaction() {
    return {
      request: JSON.stringify({
        hash: '2145F7E1C9017DEC6008E9C957B7448AEAB28A1719BF35DF1ADB5D08E4742586',
      }),
      response: txResponse,
    }
  },
  queryHeight() {
    return {
      request: JSON.stringify({}),
      response: { height: 59133 },
    }
  },
}

// File: pokt-network/pocket-js/packages/provider/src/json-rpc-provider.ts
import AbortController from 'abort-controller'
import debug from 'debug'
import { Buffer } from 'buffer'
import { fetch, Response } from 'undici'
import {
  Account,
  AccountWithTransactions,
  App,
  Block,
  DispatchRequest,
  DispatchResponse,
  GetAccountWithTransactionsOptions,
  GetAppsOptions,
  GetBlockTransactionsOptions,
  GetNodeClaimsOptions,
  GetNodesOptions,
  GetPaginableOptions,
  Node,
  Paginable,
  PaginableBlockTransactions,
  RawTransactionResponse,
  RawTxRequest,
  SessionHeader,
  Transaction,
  TransactionResponse,
} from '@pokt-foundation/pocketjs-types'
import {
  AbstractProvider,
  DispatchersFailureError,
  RelayFailureError,
  TimeoutError,
  validateTransactionResponse,
  V1RpcRoutes,
} from '@pokt-foundation/pocketjs-abstract-provider'

const DEFAULT_TIMEOUT = 10000

/**
 * extractBasicAuth extracts basic authentication credentials from the given
 * url into a separate base64-encoded string so that we can pass it to Fetch API.
 **/
export function extractBasicAuth(urlStr: string) {
  const url = new URL(urlStr);
  if (!url.username && !url.password) {
    return {
      urlStr,
    };
  }

  const credential =
    Buffer.from(\`\${url.username}:\${url.password}\`).toString('base64');
  url.username = '';
  url.password = '';
  return {
    urlStr: url.toString(),
    basicAuth: \`Basic \${credential}\`,
  };
}

/**
 * A JSONRPCProvider lets you query data from the chain and send relays to the network.
 * NodeJS only, not Isomorphic or Browser compatible.
 *  **/
export class JsonRpcProvider implements AbstractProvider {
  private rpcUrl: string
  private dispatchers: string[]
  private logger

  constructor({
    rpcUrl = '',
    dispatchers = [],
  }: {
    rpcUrl: string
    dispatchers?: string[]
  }) {
    this.rpcUrl = rpcUrl
    this.dispatchers = dispatchers ?? []
    this.logger = debug('JsonRpcProvider')
  }

  private async perform({
    route,
    body,
    rpcUrl,
    timeout = DEFAULT_TIMEOUT,
    retryAttempts = 0,
    retriesPerformed = 0,
  }: {
    route: V1RpcRoutes
    body: any
    rpcUrl?: string
    timeout?: number
    retryAttempts?: number
    retriesPerformed?: number
  }): Promise<Response> {
    const startTime = process.hrtime()
    const shouldRetryOnFailure = retriesPerformed < retryAttempts
    const performRetry = () =>
      this.perform({
        route,
        body,
        rpcUrl,
        timeout,
        retryAttempts,
        retriesPerformed: retriesPerformed + 1,
      })

    const controller = new AbortController()
    setTimeout(() => controller.abort(), timeout)

    const finalRpcUrl = rpcUrl
      ? rpcUrl
      : route === V1RpcRoutes.ClientDispatch
      ? this.dispatchers[
          Math.floor(Math.random() * 100) % this.dispatchers.length
        ]
      : this.rpcUrl

    const headers = {
      'Content-Type': 'application/json',
    };

    const {urlStr, basicAuth} = extractBasicAuth(finalRpcUrl);
    if (basicAuth) {
      headers['Authorization'] = basicAuth;
    }

    const routedRpcUrl = urlStr + route;

    const rpcResponse = await fetch(routedRpcUrl, {
      method: 'POST',
      signal: controller.signal as AbortSignal,
      headers: headers,
      body: JSON.stringify(body),
    }).catch((error) => {
      debug(\`\${routedRpcUrl} attempt \${retriesPerformed + 1} failure\`)
      if (shouldRetryOnFailure) {
        return performRetry()
      } else {
        debug(\`\${routedRpcUrl} total failure\`)
        throw error
      }
    })

    const totalTime = process.hrtime(startTime)
    debug(
      \`\${routedRpcUrl} (attempt \${
        retriesPerformed + 1
      }) CALL DURATION: \${totalTime}\`
    )

    // Fetch can fail by either throwing due to a network error or responding with
    // ok === false on 40x/50x so both situations be explicitly handled separately.
    return !rpcResponse.ok && shouldRetryOnFailure
      ? performRetry()
      : rpcResponse
  }

  /**
   * Fetches the provided address's balance.
   * @param {string} address - The address to query.
   * @returns {bigint} - The address's balance.
   * */
  async getBalance(address: string | Promise<string>): Promise<bigint> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryBalance,
      body: { address: await address },
    })
    const { balance } = (await res.json()) as { balance: number }
    return BigInt(balance.toString())
  }

  /**
   * Fetches the provided address's transaction count.
   * @param {string} address - The address to query.
   * @returns {number} - The address's transaction count.
   * */
  async getTransactionCount(
    address: string | Promise<string>
  ): Promise<number> {
    const txsRes = await this.perform({
      route: V1RpcRoutes.QueryAccountTxs,
      body: { address: await address },
    })
    const txs = (await txsRes.json()) as any

    if (!('total_txs' in txs)) {
      throw new Error('RPC Error')
    }

    const { total_txs } = txs

    return total_txs
  }

  /**
   * Gets the address's acount type (node, app, or account).
   * @param {string} address - The address to query.
   * @returns {'node' | 'app' | 'account'} - The address's account type.
   * */
  async getType(
    address: string | Promise<string>
  ): Promise<'node' | 'app' | 'account'> {
    const appRes = await this.perform({
      route: V1RpcRoutes.QueryApp,
      body: { address: await address },
    })
    const nodeRes = await this.perform({
      route: V1RpcRoutes.QueryNode,
      body: { address: await address },
    })
    const node = (await nodeRes.json()) as any
    const app = (await appRes.json()) as any

    if (!('service_url' in node) && 'max_relays' in app) {
      return 'app'
    }

    if ('service_url' in node && !('max_relays' in app)) {
      return 'node'
    }

    return 'account'
  }

  /**
   * Sends a signed transaction from this provider.
   * @param {TransactionRequest} transaction - The transaction to send, formatted as a \`TransactionRequest\`.
   * @returns {TransactionResponse} - The network's response to the transaction.
   * */
  async sendTransaction(
    transaction: RawTxRequest
  ): Promise<TransactionResponse> {
    const res = await this.perform({
      route: V1RpcRoutes.ClientRawTx,
      body: { ...transaction.toJSON() },
    })

    const transactionResponse = (await res.json()) as RawTransactionResponse

    return validateTransactionResponse(transactionResponse)
  }

  /**
   * Gets an specific block by its block number.
   * @param {number} blockNumber - the number (height) of the block to query.
   * @returns {Block} - The block requested.
   * */
  async getBlock(blockNumber: number): Promise<Block> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryBlock,
      body: { height: blockNumber },
    })

    const block = (await res.json()) as Block

    if (!('block' in block)) {
      throw new Error('RPC Error')
    }

    return block
  }

  /**
   * Gets an specific transaction specified by its hash.
   * @param {string} transactionHash - the hash of the transaction to get.
   * @returns {TransactionResponse} - The transaction requested.
   * */
  async getTransaction(transactionHash: string): Promise<Transaction> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryTX,
      body: { hash: transactionHash },
    })

    const tx = (await res.json()) as Transaction

    if (!('hash' in tx)) {
      throw new Error('RPC Error')
    }

    return tx
  }

  /**
   * Fetches the latest block number.
   * @returns {number} - The latest height as observed by the node the Provider is connected to.
   * */
  async getBlockNumber(): Promise<number> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryHeight,
      body: {},
    })

    const { height } = (await res.json()) as { height: number }

    if (!height) {
      throw new Error('RPC Error')
    }

    return height
  }

  /**
   * Fetches the requested block's transactions.
   * @param {GetBlockTransactionsOptions} GetBlockTransactionsOptions - The options to pass in to the query.
   * @ returns {PaginableBlockTransactions} - The block's transactions.
   * */
  async getBlockTransactions(
    GetBlockTransactionsOptions: GetBlockTransactionsOptions = {
      blockHeight: 0,
      page: 1,
      perPage: 100,
      includeProofs: false,
    }
  ): Promise<PaginableBlockTransactions> {
    const {
      blockHeight: height,
      includeProofs,
      page,
      perPage,
    } = GetBlockTransactionsOptions
    const res = await this.perform({
      route: V1RpcRoutes.QueryBlockTxs,
      body: {
        height,
        prove: includeProofs,
        page,
        perPage,
      },
    })

    const blockTxs = (await res.json()) as any

    if (!('txs' in blockTxs)) {
      throw new Error('RPC Error')
    }

    return {
      pageCount: blockTxs.page_count,
      totalTxs: blockTxs.total_txs,
      txs: blockTxs.txs,
    } as PaginableBlockTransactions
  }

  /**
   * Fetches nodes active from the network with the options provided.
   * @param {GetNodesOptions} getNodesOptions - the options to pass in to the query.
   * @returns {Node[]} - An array with the nodes requested and their information.
   * */
  async getNodes(
    GetNodesOptions: GetNodesOptions = {
      blockHeight: 0,
      page: 1,
      perPage: 100,
    }
  ): Promise<Paginable<Node>> {
    const { blockHeight: height } = GetNodesOptions

    const res = await this.perform({
      route: V1RpcRoutes.QueryApps,
      body: {
        height,
        opts: {
          page: GetNodesOptions.page ?? 1,
          per_page: GetNodesOptions.perPage ?? 100,
          ...(GetNodesOptions?.blockchain
            ? { blockchain: GetNodesOptions.blockchain }
            : {}),
          ...(GetNodesOptions?.stakingStatus
            ? { staking_status: GetNodesOptions.stakingStatus }
            : {}),
          ...(GetNodesOptions?.jailedStatus
            ? { jailed_status: GetNodesOptions.jailedStatus }
            : {}),
        },
      },
      ...(GetNodesOptions?.timeout ? { timeout: GetNodesOptions.timeout } : {}),
    })

    const parsedRes = (await res.json()) as any

    if (!('result' in parsedRes)) {
      throw new Error('Failed to get apps')
    }

    const nodes = parsedRes.result.map((node) => {
      const {
        address,
        chains,
        jailed,
        public_key,
        staked_tokens,
        status,
        service_url,
      } = node

      return {
        address,
        chains,
        publicKey: public_key,
        jailed,
        stakedTokens: staked_tokens ?? '0',
        status,
        serviceUrl: service_url,
      } as Node
    })

    return {
      data: nodes,
      page: GetNodesOptions.page,
      perPage: GetNodesOptions.perPage,
      totalPages: parsedRes.total_pages,
    } as Paginable<Node>
  }

  /**
   * Fetches a node from the network with the options provided.
   * @param {string} address - The address corresponding to the node.
   * @param {GetNodesOptions} getNodesOptions - The options to pass in to the query.
   * @returns {Node} - The node requested and its information.
   * */
  async getNode({
    address,
    blockHeight,
  }: {
    address: string | Promise<string>
    blockHeight?: number
  }): Promise<Node> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryNode,
      body: {
        address: await address,
        ...(blockHeight ? { height: blockHeight } : {}),
      },
    })
    const node = (await res.json()) as any

    if (!('chains' in node)) {
      throw new Error('RPC Error')
    }

    const {
      chains,
      jailed,
      public_key,
      service_url,
      status,
      tokens,
      unstaking_time,
    } = node

    return {
      address: await address,
      chains,
      publicKey: public_key,
      jailed,
      serviceUrl: service_url,
      stakedTokens: tokens.toString(),
      status,
      unstakingTime: unstaking_time,
    } as Node
  }

  /**
   * Fetches apps from the network with the options provided.
   * @param {GetAppOptions} getAppOptions - The options to pass in to the query.
   * @returns {App} - An array with the apps requested and their information.
   * */
  async getApps(
    GetAppsOptions: GetAppsOptions = {
      blockHeight: 0,
      page: 1,
      perPage: 100,
    }
  ): Promise<Paginable<App>> {
    const { blockHeight: height } = GetAppsOptions

    const res = await this.perform({
      route: V1RpcRoutes.QueryApps,
      body: {
        height,
        opts: {
          page: GetAppsOptions.page ?? 1,
          per_page: GetAppsOptions.perPage ?? 100,
          ...(GetAppsOptions?.stakingStatus
            ? { staking_status: GetAppsOptions.stakingStatus }
            : {}),
          ...(GetAppsOptions?.blockchain
            ? { blockchain: GetAppsOptions.blockchain }
            : {}),
        },
      },
      ...(GetAppsOptions?.timeout ? { timeout: GetAppsOptions.timeout } : {}),
    })

    const parsedRes = (await res.json()) as any

    if (!('result' in parsedRes)) {
      throw new Error('Failed to get apps')
    }

    const apps = parsedRes.result.map((app) => {
      const {
        address,
        chains,
        jailed,
        max_relays,
        public_key,
        staked_tokens,
        status,
      } = app

      return {
        address,
        chains,
        publicKey: public_key,
        jailed,
        maxRelays: max_relays ?? '',
        stakedTokens: staked_tokens ?? '0',
        status,
      } as App
    })

    return {
      data: apps,
      page: GetAppsOptions.page,
      perPage: GetAppsOptions.perPage,
      totalPages: parsedRes.total_pages,
    } as Paginable<App>
  }

  /**
   * Fetches an app from the network with the options provided.
   * @param {string} address - The address of the app to fetch.
   * @param {GetAppOptions} getAppOptions - The options to pass in to the query.
   * @returns {App} - The app requested and its information.
   * */
  async getApp({
    address,
    blockHeight,
  }: {
    address: string | Promise<string>
    blockHeight?: number
  }): Promise<App> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryApp,
      body: {
        address: await address,
        ...(blockHeight ? { height: blockHeight } : {}),
      },
    })

    const app = (await res.json()) as any

    if (!('chains' in app)) {
      throw new Error('RPC Error')
    }

    const { chains, jailed, max_relays, public_key, staked_tokens, status } =
      app

    return {
      address: await address,
      chains,
      publicKey: public_key,
      jailed,
      maxRelays: max_relays ?? '',
      stakedTokens: staked_tokens ?? '0',
      status,
    } as App
  }

  /**
   * Fetches an account from the network.
   * @param {string} address - The address of the account to fetch.
   * @returns {Account} - The account requested and its information.
   * */
  async getAccount(address: string | Promise<string>): Promise<Account> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryAccount,
      body: { address: await address },
    })
    const account = (await res.json()) as any

    if (!('address' in account)) {
      throw new Error('RPC Error')
    }

    const { coins, public_key } = account

    return {
      address: await address,
      balance: coins[0]?.amount ?? 0,
      publicKey: public_key,
    }
  }

  /**
   * Fetches an account from the network, along with its transactions.
   * @param {string} address - The address of the account to fetch.
   * @returns {AccountWithTransaction} - The account requested and its information, along with its transactions.
   * */
  async getAccountWithTransactions(
    address: string | Promise<string>,
    options: GetAccountWithTransactionsOptions = {
      page: 1,
      perPage: 100,
    }
  ): Promise<AccountWithTransactions> {
    const accountRes = await this.perform({
      route: V1RpcRoutes.QueryAccount,
      body: { address: await address },
    })
    const txsRes = await this.perform({
      route: V1RpcRoutes.QueryAccountTxs,
      body: { address: await address, ...options },
    })
    const account = (await accountRes.json()) as any
    const txs = (await txsRes.json()) as any

    if (!('address' in account)) {
      throw new Error('RPC Error')
    }
    if (!('total_count' in txs)) {
      throw new Error('RPC Error')
    }

    const { coins, public_key } = account
    const { total_txs, txs: transactions } = txs

    return {
      address: await address,
      balance: coins[0]?.amount ?? 0,
      publicKey: public_key,
      totalCount: total_txs,
      transactions: transactions,
    }
  }

  /**
   * Performs a dispatch request to a random dispatcher from the ones provided. Fails if no dispatcher is found.
   * @param {DispatchRequest} request - The dispatch request.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.retryAttempts - The number of retries to perform if the first call fails.
   * @param {boolean} options.rejectSelfSignedCertificates - Option to reject self signed certificates or not.
   * @param {timeout} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {DispatchResponse} - The dispatch response from the dispatcher node.
   * */
  async dispatch(
    request: DispatchRequest,
    options: {
      retryAttempts?: number
      rejectSelfSignedCertificates?: boolean
      timeout?: number
    } = {
      retryAttempts: 0,
      rejectSelfSignedCertificates: false,
    }
  ): Promise<DispatchResponse> {
    if (!this.dispatchers.length) {
      throw new Error('You need to have dispatchers to perform a dispatch call')
    }

    try {
      const dispatchRes = await this.perform({
        route: V1RpcRoutes.ClientDispatch,
        body: {
          app_public_key: request.sessionHeader.applicationPubKey,
          chain: request.sessionHeader.chain,
          session_height: request.sessionHeader.sessionBlockHeight,
        },
        ...options,
      })

      const dispatch = (await dispatchRes.json()) as any

      if (!('session' in dispatch)) {
        throw new Error('RPC Error')
      }

      const { block_height: blockHeight, session } = dispatch

      const { header, key, nodes } = session
      const formattedNodes: Node[] = nodes.map((node) => {
        const {
          address,
          chains,
          jailed,
          public_key,
          service_url,
          status,
          tokens,
          unstaking_time,
        } = node

        return {
          address,
          chains,
          publicKey: public_key,
          jailed,
          serviceUrl: service_url,
          stakedTokens: tokens.toString(),
          status,
          unstakingTime: unstaking_time,
        } as Node
      })

      const formattedHeader: SessionHeader = {
        applicationPubKey: header.app_public_key,
        chain: header.chain,
        sessionBlockHeight: header.session_height,
      }

      return {
        blockHeight,
        session: {
          blockHeight,
          header: formattedHeader,
          key,
          nodes: formattedNodes,
        },
      }
    } catch (err: any) {
      this.logger(JSON.stringify(err, Object.getOwnPropertyNames(err)))
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw new DispatchersFailureError()
    }
  }

  /**
   * Sends a relay to the network through the main RPC URL provided. Best used through a Relayer.
   * @param {any} request - The relay request.
   * @param {string} rpcUrl - The RPC URL to use, if the main RPC URL is not a suitable node to relay requests.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.retryAttempts - The number of retries to perform if the first call fails.
   * @param {boolean} options.rejectSelfSignedCertificates - Option to reject self signed certificates or not.
   * @param {timeout} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - A relay response.
   * * */
  async relay(
    request,
    rpcUrl: string,
    options: {
      retryAttempts?: number
      rejectSelfSignedCertificates?: boolean
      timeout?: number
    } = {
      retryAttempts: 0,
      rejectSelfSignedCertificates: false,
    }
  ): Promise<unknown> {
    try {
      const relayAttempt = await this.perform({
        route: V1RpcRoutes.ClientRelay,
        body: request,
        rpcUrl,
        ...options,
      })

      const relayResponse = await relayAttempt.json()
      this.logger(JSON.stringify(relayResponse))

      return relayResponse
    } catch (err: any) {
      this.logger(
        \`ERROR: \${JSON.stringify(err, Object.getOwnPropertyNames(err))}\`
      )
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw new RelayFailureError()
    }
  }

  /**
   * Gets all the parameters used to configure the Pocket Network.
   * @param {number} height - The block height to use to determine the params.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The raw params.
   * * */
  public async getAllParams(
    height: number,
    options: {
      timeout?: number
    }
  ): Promise<any> {
    if (height < 0) {
      throw new Error('Invalid height input')
    }

    try {
      const res = await this.perform({
        route: V1RpcRoutes.QueryAllParams,
        body: { height },
        ...options,
      })

      const params = await res.json()
      this.logger(JSON.stringify(params))

      return params
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }

  /**
   * Gets the corresponding node's claims.
   * @param {string} address - The address of the node to get the claims from.
   * @param {object} GetNodeClaimsOptions - The options available to tweak the request itself.
   * @param {number} options.height - The block height to use to determine the result of the call.
   * @param {number} options.page - The page to get the node claims from.
   * @param {number} options.perPage - How many claims per page to retrieve.
   * @param {timeout} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The raw node claims.
   * * */
  public async getNodeClaims(
    address: string,
    options: GetNodeClaimsOptions
  ): Promise<Paginable<any>> {
    try {
      const res = await this.perform({
        route: V1RpcRoutes.QueryNodeClaims,
        body: {
          address,
          ...(options.height ? { height: options.height } : {}),
          ...(options.page ? { page: options.page } : {}),
          ...(options.perPage ? { per_page: options.perPage } : {}),
        },
        ...options,
      })

      const nodeClaims = (await res.json()) as any
      this.logger(JSON.stringify(nodeClaims))

      if (!('result' in nodeClaims)) {
        throw new Error('RPC Error')
      }

      return {
        data: nodeClaims.result,
        page: nodeClaims.page,
        totalPages: nodeClaims.total_pages,
        perPage: options?.perPage ?? 100,
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }

  /**
   * Gets the requested supply information.
   * @param {number} height - The block height to use to determine the current supply.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The raw supply info.
   * * */
  public async getSupply(
    height: number = 0,
    options: {
      timeout?: number
    }
  ): Promise<any> {
    if (height < 0) {
      throw new Error('Invalid height input')
    }

    try {
      const res = await this.perform({
        route: V1RpcRoutes.QuerySupply,
        body: { height },
        ...options,
      })

      const supply = await res.json()
      this.logger(JSON.stringify(supply))

      return supply
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }

  /**
   * Gets the supported chains.
   * @param {number} height - The block height to use to determine the supported chains at that point in time.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The currently supported chains.
   * * */
  public async getSupportedChains(
    height: number = 0,
    options: {
      timeout?: number
    }
  ): Promise<any> {
    if (height < 0) {
      throw new Error('Invalid height input')
    }

    try {
      const res = await this.perform({
        route: V1RpcRoutes.QuerySupportedChains,
        body: { height },
        ...options,
      })

      const supportedChains = await res.json()
      this.logger(JSON.stringify(supportedChains))

      return supportedChains
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }

  /**
   * Gets the current Pocket Network Params.
   * @param {number} height - The block height to use to determine the Pocket Params at that point in time.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The raw pocket params.
   * * */
  public async getPocketParams(
    height: number = 0,
    options: {
      timeout?: number
    }
  ): Promise<any> {
    if (height < 0) {
      throw new Error('Invalid height input')
    }

    try {
      const res = await this.perform({
        route: V1RpcRoutes.QueryPocketParams,
        body: { height },
        ...options,
      })

      const pocketParams = await res.json()
      this.logger(JSON.stringify(pocketParams))

      return pocketParams
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }

  /**
   * Gets the current Application Params.
   * @param {number} height - The block height to use to determine the Application Params at that point in time.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The raw application params.
   * * */
  public async getAppParams(
    height: number = 0,
    options: {
      timeout?: number
    }
  ): Promise<any> {
    if (height < 0) {
      throw new Error('Invalid height input')
    }

    try {
      const res = await this.perform({
        route: V1RpcRoutes.QueryAppParams,
        body: { height },
        ...options,
      })

      const appParams = await res.json()
      this.logger(JSON.stringify(appParams))

      return appParams
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }
}

// File: pokt-network/pocket-js/packages/isomorphic-provider/src/index.ts
import AbortController from 'abort-controller'
import debug from 'debug'
import fetch from 'isomorphic-unfetch'
import {
  Account,
  AccountWithTransactions,
  App,
  Block,
  DispatchRequest,
  DispatchResponse,
  GetAccountWithTransactionsOptions,
  GetAppsOptions,
  GetBlockTransactionsOptions,
  GetNodesOptions,
  Node,
  Paginable,
  PaginableBlockTransactions,
  RawTransactionResponse,
  GetNodeClaimsOptions,
  RawTxRequest,
  SessionHeader,
  Transaction,
  TransactionResponse,
} from '@pokt-foundation/pocketjs-types'
import {
  AbstractProvider,
  DispatchersFailureError,
  RelayFailureError,
  TimeoutError,
  validateTransactionResponse,
  V1RpcRoutes,
} from '@pokt-foundation/pocketjs-abstract-provider'
import { hrtime } from '@pokt-foundation/pocketjs-utils'

const DEFAULT_TIMEOUT = 10000

/**
 * An IsomorphicProvider lets you query data from the chain and send relays to the network.
 * Browser & NodeJS Compatible.
 *  **/
export class IsomorphicProvider implements AbstractProvider {
  private rpcUrl: string
  private dispatchers: string[]
  private logger

  constructor({
    rpcUrl = '',
    dispatchers = [],
  }: {
    rpcUrl: string
    dispatchers?: string[]
  }) {
    this.rpcUrl = rpcUrl
    this.dispatchers = dispatchers ?? []
    this.logger = debug('JsonRpcProvider')
  }

  private async perform({
    route,
    body,
    rpcUrl,
    timeout = DEFAULT_TIMEOUT,
    retryAttempts = 0,
    retriesPerformed = 0,
  }: {
    route: V1RpcRoutes
    body: any
    rpcUrl?: string
    timeout?: number
    retryAttempts?: number
    retriesPerformed?: number
  }): Promise<Response> {
    const startTime = hrtime()
    const shouldRetryOnFailure = retriesPerformed < retryAttempts
    const performRetry = () =>
      this.perform({
        route,
        body,
        rpcUrl,
        timeout,
        retryAttempts,
        retriesPerformed: retriesPerformed + 1,
      })

    const controller = new AbortController()
    setTimeout(() => controller.abort(), timeout)

    const finalRpcUrl = rpcUrl
      ? rpcUrl
      : route === V1RpcRoutes.ClientDispatch
      ? this.dispatchers[
          Math.floor(Math.random() * 100) % this.dispatchers.length
        ]
      : this.rpcUrl

    const routedRpcUrl = \`\${finalRpcUrl}\${route}\`

    const rpcResponse = await fetch(routedRpcUrl, {
      method: 'POST',
      signal: controller.signal as AbortSignal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).catch((error) => {
      debug(\`\${routedRpcUrl} attempt \${retriesPerformed + 1} failure\`)
      if (shouldRetryOnFailure) {
        return performRetry()
      } else {
        throw error
      }
    })

    const totalTime = hrtime(startTime)
    debug(
      \`\${routedRpcUrl} (attempt \${
        retriesPerformed + 1
      }) CALL DURATION: \${totalTime}\`
    )

    // Fetch can fail by either throwing due to a network error or responding with
    // ok === false on 40x/50x so both situations be explicitly handled separately.
    return !rpcResponse.ok && shouldRetryOnFailure
      ? performRetry()
      : rpcResponse
  }

  /**
   * Fetches the provided address's balance.
   * @param {string} address - The address to query.
   * @returns {bigint} - The address's balance.
   * */
  async getBalance(address: string | Promise<string>): Promise<bigint> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryBalance,
      body: { address: await address },
    })
    const { balance } = (await res.json()) as { balance: number }
    return BigInt(balance.toString())
  }

  /**
   * Fetches the provided address's transaction count.
   * @param {string} address - The address to query.
   * @returns {number} - The address's transaction count.
   * */
  async getTransactionCount(
    address: string | Promise<string>
  ): Promise<number> {
    const txsRes = await this.perform({
      route: V1RpcRoutes.QueryAccountTxs,
      body: { address: await address },
    })
    const txs = (await txsRes.json()) as any

    if (!('total_txs' in txs)) {
      throw new Error('RPC Error')
    }

    const { total_txs } = txs

    return total_txs
  }

  /**
   * Gets the address's acount type (node, app, or account).
   * @param {string} address - The address to query.
   * @returns {'node' | 'app' | 'account'} - The address's account type.
   * */
  async getType(
    address: string | Promise<string>
  ): Promise<'node' | 'app' | 'account'> {
    const appRes = await this.perform({
      route: V1RpcRoutes.QueryApp,
      body: { address: await address },
    })
    const nodeRes = await this.perform({
      route: V1RpcRoutes.QueryNode,
      body: { address: await address },
    })
    const node = (await nodeRes.json()) as any
    const app = (await appRes.json()) as any

    if (!('service_url' in node) && 'max_relays' in app) {
      return 'app'
    }

    if ('service_url' in node && !('max_relays' in app)) {
      return 'node'
    }

    return 'account'
  }

  /**
   * Sends a signed transaction from this provider.
   * @param {TransactionRequest} transaction - The transaction to sign, formatted as a \`TransactionRequest\`.
   * @returns {TransactionResponse} - The network's response to the transaction.
   * */
  async sendTransaction(
    transaction: RawTxRequest
  ): Promise<TransactionResponse> {
    const res = await this.perform({
      route: V1RpcRoutes.ClientRawTx,
      body: { ...transaction.toJSON() },
    })

    const transactionResponse = (await res.json()) as RawTransactionResponse

    return validateTransactionResponse(transactionResponse)
  }

  /**
   * Gets an specific block specified by its block number.
   * @param {number} blockNumber - the number (height) of the block to query.
   * @returns {Block} - The block requested.
   * */
  async getBlock(blockNumber: number): Promise<Block> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryBlock,
      body: { height: blockNumber },
    })

    const block = (await res.json()) as Block

    if (!('block' in block)) {
      throw new Error('RPC Error')
    }

    return block
  }

  /**
   * Fetches the requested block's transactions.
   * @param {GetBlockTransactionsOptions} GetBlockTransactionsOptions - The options to pass in to the query.
   * @ returns {PaginableBlockTransactions} - The block's transactions.
   * */
  async getBlockTransactions(
    GetBlockTransactionsOptions: GetBlockTransactionsOptions = {
      blockHeight: 0,
      page: 1,
      perPage: 100,
      includeProofs: false,
    }
  ): Promise<PaginableBlockTransactions> {
    const {
      blockHeight: height,
      includeProofs,
      page,
      perPage,
    } = GetBlockTransactionsOptions
    const res = await this.perform({
      route: V1RpcRoutes.QueryBlockTxs,
      body: {
        height,
        prove: includeProofs,
        page,
        perPage,
      },
    })

    const blockTxs = (await res.json()) as any

    if (!('txs' in blockTxs)) {
      throw new Error('RPC Error')
    }

    return {
      pageCount: blockTxs.page_count,
      totalTxs: blockTxs.total_txs,
      txs: blockTxs.txs,
    } as PaginableBlockTransactions
  }

  /**
   * Gets an specific transaction specified by its hash.
   * @param {string} transactionHash - the hash of the transaction to get.
   * @returns {TransactionResponse} - The transaction requested.
   * */
  async getTransaction(transactionHash: string): Promise<Transaction> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryTX,
      body: { hash: transactionHash },
    })

    const tx = (await res.json()) as Transaction

    if (!('hash' in tx)) {
      throw new Error('RPC Error')
    }

    return tx
  }

  /**
   * Fetches the latest block number.
   * @returns {number} - The latest height as observed by the node the Provider is connected to.
   * */
  async getBlockNumber(): Promise<number> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryHeight,
      body: {},
    })

    const { height } = (await res.json()) as { height: number }

    if (!height) {
      throw new Error('RPC Error')
    }

    return height
  }

  /**
   * Fetches nodes active from the network with the options provided.
   * @param {GetNodesOptions} getNodesOptions - the options to pass in to the query.
   * @returns {PaginatedNode} - An array with the nodes requested and their information.
   * */
  async getNodes(
    GetNodesOptions: GetNodesOptions = {
      blockHeight: 0,
      page: 1,
      perPage: 100,
    }
  ): Promise<Paginable<Node>> {
    const { blockHeight: height } = GetNodesOptions

    const res = await this.perform({
      route: V1RpcRoutes.QueryApps,
      body: {
        height,
        opts: {
          page: GetNodesOptions.page ?? 1,
          per_page: GetNodesOptions.perPage ?? 100,
          ...(GetNodesOptions?.blockchain
            ? { blockchain: GetNodesOptions.blockchain }
            : {}),
          ...(GetNodesOptions?.stakingStatus
            ? { staking_status: GetNodesOptions.stakingStatus }
            : {}),
          ...(GetNodesOptions?.jailedStatus
            ? { jailed_status: GetNodesOptions.jailedStatus }
            : {}),
        },
      },
      ...(GetNodesOptions?.timeout ? { timeout: GetNodesOptions.timeout } : {}),
    })

    const parsedRes = (await res.json()) as any

    if (!('result' in parsedRes)) {
      throw new Error('Failed to get apps')
    }

    const nodes = parsedRes.result.map((node) => {
      const {
        address,
        chains,
        jailed,
        public_key,
        staked_tokens,
        status,
        service_url,
      } = node

      return {
        address,
        chains,
        publicKey: public_key,
        jailed,
        stakedTokens: staked_tokens ?? '0',
        status,
        serviceUrl: service_url,
      } as Node
    })

    return {
      data: nodes,
      page: GetNodesOptions.page,
      perPage: GetNodesOptions.perPage,
      totalPages: parsedRes.total_pages,
    } as Paginable<Node>
  }

  /**
   * Fetches a node from the network with the options provided.
   * @param {string} address - The address corresponding to the node.
   * @param {GetNodesOptions} getNodesOptions - The options to pass in to the query.
   * @returns {Node} - The node requested and its information.
   * */
  async getNode({
    address,
    blockHeight,
  }: {
    address: string | Promise<string>
    blockHeight?: number
  }): Promise<Node> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryNode,
      body: {
        address: await address,
        ...(blockHeight ? { height: blockHeight } : {}),
      },
    })
    const node = (await res.json()) as any

    if (!('chains' in node)) {
      throw new Error('RPC Error')
    }

    const {
      chains,
      jailed,
      public_key,
      service_url,
      status,
      tokens,
      unstaking_time,
    } = node

    return {
      address: await address,
      chains,
      publicKey: public_key,
      jailed,
      serviceUrl: service_url,
      stakedTokens: tokens.toString(),
      status,
      unstakingTime: unstaking_time,
    } as Node
  }

  /**
   * Fetches apps from the network with the options provided.
   * @param {GetAppOptions} getAppOptions - The options to pass in to the query.
   * @returns {App} - An array with the apps requested and their information.
   * */
  async getApps(
    GetAppsOptions: GetAppsOptions = {
      blockHeight: 0,
      page: 1,
      perPage: 100,
    }
  ): Promise<Paginable<App>> {
    const { blockHeight: height } = GetAppsOptions

    const res = await this.perform({
      route: V1RpcRoutes.QueryApps,
      body: {
        height,
        opts: {
          page: GetAppsOptions.page ?? 1,
          per_page: GetAppsOptions.perPage ?? 100,
          ...(GetAppsOptions?.stakingStatus
            ? { staking_status: GetAppsOptions.stakingStatus }
            : {}),
          ...(GetAppsOptions?.blockchain
            ? { blockchain: GetAppsOptions.blockchain }
            : {}),
        },
      },
      ...(GetAppsOptions?.timeout ? { timeout: GetAppsOptions.timeout } : {}),
    })

    const parsedRes = (await res.json()) as any

    if (!('result' in parsedRes)) {
      throw new Error('Failed to get apps')
    }

    const apps = parsedRes.result.map((app) => {
      const {
        address,
        chains,
        jailed,
        max_relays,
        public_key,
        staked_tokens,
        status,
      } = app

      return {
        address,
        chains,
        publicKey: public_key,
        jailed,
        maxRelays: max_relays ?? '',
        stakedTokens: staked_tokens ?? '0',
        status,
      } as App
    })

    return {
      data: apps,
      page: GetAppsOptions.page,
      perPage: GetAppsOptions.perPage,
      totalPages: parsedRes.total_pages,
    } as Paginable<App>
  }

  /**
   * Fetches an app from the network with the options provided.
   * @param {string} address - The address of the app to fetch.
   * @param {GetAppOptions} getAppOptions - The options to pass in to the query.
   * @returns {App} - The app requested and its information.
   * */
  async getApp({
    address,
    blockHeight,
  }: {
    address: string | Promise<string>
    blockHeight?: number
  }): Promise<App> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryApp,
      body: {
        address: await address,
        ...(blockHeight ? { height: blockHeight } : {}),
      },
    })

    const app = (await res.json()) as any

    if (!('chains' in app)) {
      throw new Error('RPC Error')
    }

    const { chains, jailed, max_relays, public_key, staked_tokens, status } =
      app

    return {
      address: await address,
      chains,
      publicKey: public_key,
      jailed,
      maxRelays: max_relays ?? '',
      stakedTokens: staked_tokens ?? '0',
      status,
    } as App
  }

  /**
   * Fetches an account from the network.
   * @param {string} address - The address of the account to fetch.
   * @returns {Account} - The account requested and its information.
   * */
  async getAccount(address: string | Promise<string>): Promise<Account> {
    const res = await this.perform({
      route: V1RpcRoutes.QueryAccount,
      body: { address: await address },
    })
    const account = (await res.json()) as any

    if (!('address' in account)) {
      throw new Error('RPC Error')
    }

    const { coins, public_key } = account

    return {
      address: await address,
      balance: coins[0]?.amount ?? 0,
      publicKey: public_key,
    }
  }

  /**
   * Fetches an account from the network, along with its transactions.
   * @param {string} address - The address of the account to fetch.
   * @returns {AccountWithTransaction} - The account requested and its information, along with its transactions.
   * */
  async getAccountWithTransactions(
    address: string | Promise<string>,
    options: GetAccountWithTransactionsOptions = {
      page: 1,
      perPage: 100,
    }
  ): Promise<AccountWithTransactions> {
    const accountRes = await this.perform({
      route: V1RpcRoutes.QueryAccount,
      body: { address: await address },
    })
    const txsRes = await this.perform({
      route: V1RpcRoutes.QueryAccountTxs,
      body: { address: await address, ...options },
    })
    const account = (await accountRes.json()) as any
    const txs = (await txsRes.json()) as any

    if (!('address' in account)) {
      throw new Error('RPC Error')
    }
    if (!('total_txs' in txs)) {
      throw new Error('RPC Error')
    }

    const { coins, public_key } = account
    const { total_txs, txs: transactions } = txs

    return {
      address: await address,
      balance: coins[0]?.amount ?? 0,
      publicKey: public_key,
      totalCount: total_txs,
      transactions: transactions,
    }
  }

  /**
   * Performs a dispatch request to a random dispatcher from the ones provided. Fails if no dispatcher is found.
   * @param {DispatchRequest} request - The dispatch request.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.retryAttempts - The number of retries to perform if the first call fails.
   * @param {boolean} options.rejectSelfSignedCertificates - Option to reject self signed certificates or not.
   * @param {timeout} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {DispatchResponse} - The dispatch response from the dispatcher node.
   * */
  async dispatch(
    request: DispatchRequest,
    options: {
      retryAttempts?: number
      rejectSelfSignedCertificates?: boolean
      timeout?: number
    } = {
      retryAttempts: 0,
      rejectSelfSignedCertificates: false,
    }
  ): Promise<DispatchResponse> {
    if (!this.dispatchers.length) {
      throw new Error('You need to have dispatchers to perform a dispatch call')
    }

    try {
      const dispatchRes = await this.perform({
        route: V1RpcRoutes.ClientDispatch,
        body: {
          app_public_key: request.sessionHeader.applicationPubKey,
          chain: request.sessionHeader.chain,
          session_height: request.sessionHeader.sessionBlockHeight,
        },
        ...options,
      })

      const dispatch = (await dispatchRes.json()) as any

      if (!('session' in dispatch)) {
        throw new Error('RPC Error')
      }

      const { block_height: blockHeight, session } = dispatch

      const { header, key, nodes } = session
      const formattedNodes: Node[] = nodes.map((node) => {
        const {
          address,
          chains,
          jailed,
          public_key,
          service_url,
          status,
          tokens,
          unstaking_time,
        } = node

        return {
          address,
          chains,
          publicKey: public_key,
          jailed,
          serviceUrl: service_url,
          stakedTokens: tokens.toString(),
          status,
          unstakingTime: unstaking_time,
        } as Node
      })

      const formattedHeader: SessionHeader = {
        applicationPubKey: header.app_public_key,
        chain: header.chain,
        sessionBlockHeight: header.session_height,
      }

      return {
        blockHeight,
        session: {
          blockHeight,
          header: formattedHeader,
          key,
          nodes: formattedNodes,
        },
      }
    } catch (err: any) {
      this.logger(JSON.stringify(err, Object.getOwnPropertyNames(err)))
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw new DispatchersFailureError()
    }
  }

  /**
   * Sends a relay to the network through the main RPC URL provided. Best used through a Relayer.
   * @param {request} request - The relay request.
   * @param {string} rpcUrl - The RPC URL to use, if the main RPC URL is not a suitable node to relay requests.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.retryAttempts - The number of retries to perform if the first call fails.
   * @param {boolean} options.rejectSelfSignedCertificates - Option to reject self signed certificates or not.
   * @param {timeout} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - A relay response.
   * * */
  async relay(
    request,
    rpcUrl: string,
    options: {
      retryAttempts?: number
      rejectSelfSignedCertificates?: boolean
      timeout?: number
    } = {
      retryAttempts: 0,
      rejectSelfSignedCertificates: false,
    }
  ): Promise<unknown> {
    try {
      const relayAttempt = await this.perform({
        route: V1RpcRoutes.ClientRelay,
        body: request,
        rpcUrl,
        ...options,
      })

      const relayResponse = await relayAttempt.json()
      this.logger(JSON.stringify(relayResponse))

      return relayResponse
    } catch (err: any) {
      this.logger(
        \`ERROR: \${JSON.stringify(err, Object.getOwnPropertyNames(err))}\`
      )
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw new RelayFailureError()
    }
  }

  /**
   * Gets all the parameters used to configure the Pocket Network.
   * @param {number} height - The block height to use to determine the params.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The raw params.
   * * */
  public async getAllParams(
    height: number,
    options: {
      timeout?: number
    }
  ): Promise<unknown> {
    if (height < 0) {
      throw new Error('Invalid height input')
    }

    try {
      const res = await this.perform({
        route: V1RpcRoutes.QueryAllParams,
        body: { height },
        ...options,
      })

      const params = await res.json()
      this.logger(JSON.stringify(params))

      return params
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }

  /**
   * Gets the corresponding node's claims.
   * @param {string} address - The address of the node to get the claims from.
   * @param {object} GetNodeClaimsOptions - The options available to tweak the request itself.
   * @param {number} options.height - The block height to use to determine the result of the call.
   * @param {number} options.page - The page to get the node claims from.
   * @param {number} options.perPage - How many claims per page to retrieve.
   * @param {timeout} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The raw node claims.
   * * */
  public async getNodeClaims(
    address: string,
    options: GetNodeClaimsOptions
  ): Promise<Paginable<unknown>> {
    try {
      const res = await this.perform({
        route: V1RpcRoutes.QueryNodeClaims,
        body: {
          address,
          ...(options.height ? { height: options.height } : {}),
          ...(options.page ? { page: options.page } : {}),
          ...(options.perPage ? { per_page: options.perPage } : {}),
        },
        ...options,
      })

      const nodeClaims = (await res.json()) as any
      this.logger(JSON.stringify(nodeClaims))

      if (!('result' in nodeClaims)) {
        throw new Error('RPC Error')
      }

      return {
        data: nodeClaims.result,
        page: nodeClaims.page,
        totalPages: nodeClaims.total_pages,
        perPage: options?.perPage ?? 100,
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }

  /**
   * Gets the requested supply information.
   * @param {number} height - The block height to use to determine the current supply.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The raw supply info.
   * * */
  public async getSupply(
    height: number = 0,
    options: {
      timeout?: number
    }
  ): Promise<unknown> {
    if (height < 0) {
      throw new Error('Invalid height input')
    }

    try {
      const res = await this.perform({
        route: V1RpcRoutes.QuerySupply,
        body: { height },
        ...options,
      })

      const supply = await res.json()
      this.logger(JSON.stringify(supply))

      return supply
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }

  /**
   * Gets the supported chains.
   * @param {number} height - The block height to use to determine the supported chains at that point in time.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The currently supported chains.
   * * */
  public async getSupportedChains(
    height: number = 0,
    options: {
      timeout?: number
    }
  ): Promise<unknown> {
    if (height < 0) {
      throw new Error('Invalid height input')
    }

    try {
      const res = await this.perform({
        route: V1RpcRoutes.QuerySupportedChains,
        body: { height },
        ...options,
      })

      const supportedChains = await res.json()
      this.logger(JSON.stringify(supportedChains))

      return supportedChains
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }

  /**
   * Gets the current Pocket Network Params.
   * @param {number} height - The block height to use to determine the Pocket Params at that point in time.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The raw pocket params.
   * * */
  public async getPocketParams(
    height: number = 0,
    options: {
      timeout?: number
    }
  ): Promise<unknown> {
    if (height < 0) {
      throw new Error('Invalid height input')
    }

    try {
      const res = await this.perform({
        route: V1RpcRoutes.QueryPocketParams,
        body: { height },
        ...options,
      })

      const pocketParams = await res.json()
      this.logger(JSON.stringify(pocketParams))

      return pocketParams
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }

  /**
   * Gets the current Application Params.
   * @param {number} height - The block height to use to determine the Application Params at that point in time.
   * @param {object} options - The options available to tweak the request itself.
   * @param {number} options.timeout - Timeout before the call fails. In milliseconds.
   * @returns {any} - The raw application params.
   * * */
  public async getAppParams(
    height: number = 0,
    options: {
      timeout?: number
    }
  ): Promise<unknown> {
    if (height < 0) {
      throw new Error('Invalid height input')
    }

    try {
      const res = await this.perform({
        route: V1RpcRoutes.QueryAppParams,
        body: { height },
        ...options,
      })

      const appParams = await res.json()
      this.logger(JSON.stringify(appParams))

      return appParams
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw err
    }
  }
}

// File: pokt-network/pocket-js/packages/abstract-provider/src/routes.ts
/**
 * Enum listing versions supported by this SDK
 */
enum Versions {
  V1 = '/v1',
}

/**
 * Enum indicating all the routes in the V1 RPC Interface
 */
export enum V1RpcRoutes {
  ClientChallenge = Versions.V1 + '/client/challenge',
  ClientDispatch = Versions.V1 + '/client/dispatch',
  ClientRawTx = Versions.V1 + '/client/rawtx',
  ClientRelay = Versions.V1 + '/client/relay',
  QueryAccount = Versions.V1 + '/query/account',
  QueryAccountTxs = Versions.V1 + '/query/accounttxs',
  QueryAllParams = Versions.V1 + '/query/allparams',
  QueryApp = Versions.V1 + '/query/app',
  QueryAppParams = Versions.V1 + '/query/appparams',
  QueryApps = Versions.V1 + '/query/apps',
  QueryBalance = Versions.V1 + '/query/balance',
  QueryBlock = Versions.V1 + '/query/block',
  QueryBlockTxs = Versions.V1 + '/query/blocktxs',
  QueryHeight = Versions.V1 + '/query/height',
  QueryNode = Versions.V1 + '/query/node',
  QueryNodeClaim = Versions.V1 + '/query/nodeclaim',
  QueryNodeClaims = Versions.V1 + '/query/nodeclaims',
  QueryNodeParams = Versions.V1 + '/query/nodeparams',
  QueryNodeReceipt = Versions.V1 + '/query/nodereceipt',
  QueryNodeReceipts = Versions.V1 + '/query/nodereceipts',
  QueryNodes = Versions.V1 + '/query/nodes',
  QueryPocketParams = Versions.V1 + '/query/pocketparams',
  QuerySupply = Versions.V1 + '/query/supply',
  QuerySupportedChains = Versions.V1 + '/query/supportedchains',
  QueryTX = Versions.V1 + '/query/tx',
  QueryUpgrade = Versions.V1 + '/query/upgrade',
}


// File: pokt-network/pocket-js/packages/abstract-provider/src/index.ts
export * from './abstract-provider'
export * from './errors'
export * from './routes'


// File: pokt-network/pocket-js/packages/abstract-provider/src/errors.ts
import { TransactionResponse } from '@pokt-foundation/pocketjs-types'

export class PocketCoreError extends Error {
  code: number
  message: string

  constructor(code: number, message: string, ...params: any[]) {
    super(...params)
    this.code = code
    this.message = message
  }
}

export enum PocketCoreErrorCodes {
  UnauthorizedError = 4,
}

export class DispatchersFailureError extends Error {
  constructor(...params: any[]) {
    super(...params)
    this.name = 'DispatchersFailureError'
    this.message = 'Failed to obtain a session due to dispatchers failure'
  }
}

export class RelayFailureError extends Error {
  constructor(...params: any[]) {
    super(...params)
    this.name = 'RelayFailureError'
    this.message = 'Provider node returned an invalid non JSON response'
  }
}

export class TimeoutError extends Error {
  constructor(...params: any[]) {
    super(...params)
    this.name = 'TimeoutError'
    this.message = 'Provider timed out during request'
  }
}

export class SignatureVerificationFailedError extends PocketCoreError {
  constructor(message: string, ...params: any[]) {
    super(PocketCoreErrorCodes.UnauthorizedError, message, ...params)
    this.name = 'SignatureVerificationFailedError'
  }
}

export function validateTransactionResponse(transactionResponse: any) {
  if (!('code' in transactionResponse) && !('raw_log' in transactionResponse)) {
    return {
      logs: transactionResponse.logs,
      txHash: transactionResponse.txhash,
    } as TransactionResponse
  }

  switch (transactionResponse.code) {
    case PocketCoreErrorCodes.UnauthorizedError:
      throw new SignatureVerificationFailedError(
        'Signature verification failed for the transaction. Make sure you have the correct parameters and that your ChainID is either "mainnet", "testnet", or "localnet"'
      )
    default:
      throw new PocketCoreError(
        transactionResponse.code,
        transactionResponse?.raw_log ?? ''
      )
  }
}


// File: pokt-network/pocket-js/packages/abstract-provider/src/abstract-provider.ts
import {
  Account,
  AccountWithTransactions,
  App,
  Block,
  GetAccountWithTransactionsOptions,
  GetAppsOptions,
  GetNodesOptions,
  Node,
  Paginable,
  RawTxRequest,
  Transaction,
  TransactionResponse,
} from '@pokt-foundation/pocketjs-types'

export abstract class AbstractProvider {
  // Account
  abstract getBalance(address: string | Promise<string>): Promise<bigint>
  abstract getTransactionCount(
    address: string | Promise<string>
  ): Promise<number>
  abstract getType(
    address: string | Promise<string>
  ): Promise<'node' | 'app' | 'account'>
  // Txs
  abstract sendTransaction(
    transaction: RawTxRequest
  ): Promise<TransactionResponse>
  // Network
  abstract getBlock(blockNumber: number): Promise<Block>
  abstract getTransaction(transactionHash: string): Promise<Transaction>
  abstract getBlockNumber(): Promise<number>
  abstract getNodes(getNodesOptions: GetNodesOptions): Promise<Paginable<Node>>
  abstract getNode({
    address,
    blockHeight,
  }: {
    address: string | Promise<string>
    blockHeight?: number
  }): Promise<Node>
  abstract getApps(getAppOption: GetAppsOptions): Promise<Paginable<App>>
  abstract getApp({
    address,
    blockHeight,
  }: {
    address: string | Promise<string>
    blockHeight?: number
  }): Promise<App>
  abstract getAccount(address: string | Promise<string>): Promise<Account>
  abstract getAccountWithTransactions(
    address: string | Promise<string>,
    options: GetAccountWithTransactionsOptions
  ): Promise<AccountWithTransactions>

  // TODO: Add methods for params/requestChallenge
}

# END OF POCKET-JS CODEBASE

# START OF POCKET-JS README
# PocketJS

![Build](https://github.com/pokt-foundation/pocket-js-slim/actions/workflows/node.js.yml/badge.svg)

A complete, fast and slim SDK to interact with the Pocket Network.

## Installation

You can install the packages using your favorite package manager like yarn, npm,
or pnpm.  See the usages below to know which package needs to be installed in
your project.

\`\`\`shell
yarn add @pokt-foundation/pocketjs-provider
yarn add @pokt-foundation/pocketjs-signer
yarn add @pokt-foundation/pocketjs-transaction-builder
yarn add @pokt-foundation/pocketjs-relayer
yarn add @pokt-foundation/pocketjs-utils
\`\`\`

## Usage

### Send a read-only query

This example queries the latest height and a wallet's balance in the network
specified by \`PoktEndpoint\`.

\`PoktEndpoint\` is a string representing an endpoint URL to any Pocket-based
network, POKT Mainnet, Testnet or your own devnet.  It may or may not contain
basic authentication credentials like "https://scott:tiger@example.pokt.network".

You can get an endpoint to POKT Mainnet from one of Pocket's Gateways.  See
https://docs.pokt.network/developers/use-a-gateway for details. For example,
Grove's endpoint is like \`https://mainnet.rpc.grove.city/v1/<AccessKey>\`.

\`\`\`js
import "dotenv/config";
import { JsonRpcProvider } from "@pokt-foundation/pocketjs-provider";

const PoktEndpoint = process.env.POKT_ENDPOINT;

async function main() {
  const provider = new JsonRpcProvider({
    rpcUrl: PoktEndpoint,
  });

  // Get the latest height
  const height = await provider.getBlockNumber();
  console.log(height);

  // Get the balance of a wallet in μPOKT
  const balance = await provider.getBalance(
    "85efd04b9bad9da612ee2f80db9b62bb413e32fb",
  );
  console.log(balance);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
\`\`\`

Output:

\`\`\`
125085
20009130876n
\`\`\`

### Send POKT

This example sends 1 POKT from a wallet associated with \`SIGNER_PRIVATE_KEY\`
to the address \`fc1c79e7efecf89f071ebb2ba7c6f5a98dcdfc3c\` in POKT Testnet and
prints the transaction hash.

To send tokens, a send message must be signed by a sender account's private key.
There are two ways to import a private key into \`TransactionBuilder\`.

1. \`KeyManager.fromPrivateKey\` takes a private key in a raw format.
   You can get it from "pocket accounts export-raw" command.  This example
   demonstrates this usecase.

2. \`KeyManager.fromPPK\` takes the content of an armored keypair file and its
   passphrade.  A keypair file can be exported by "pocket accounts export"
   command.  You can see this usecase in the next example.

\`\`\`js
import "dotenv/config";
import { JsonRpcProvider } from "@pokt-foundation/pocketjs-provider";
import { KeyManager } from "@pokt-foundation/pocketjs-signer";
import { TransactionBuilder } from "@pokt-foundation/pocketjs-transaction-builder";

async function main() {
  const provider = new JsonRpcProvider({rpcUrl: process.env.POKT_ENDPOINT});

  const txSignerKey = process.env.SIGNER_PRIVATE_KEY;
  const txSigner = await KeyManager.fromPrivateKey(txSignerKey);
  const transactionBuilder = new TransactionBuilder({
    provider,
    signer: txSigner,

    // To submit a transaction to a non-Mainnet network, you need to specify
    // the network ID in \`chainID\`.
    chainID: "testnet",
  });

  // Create a message to send POKT
  const txMsg = transactionBuilder.send({
    fromAddress: txSigner.getAddress(),
    toAddress: "fc1c79e7efecf89f071ebb2ba7c6f5a98dcdfc3c",
    // Amount in μPOKT ("1000000" means 1 POKT)
    amount: "1000000",
  });
  // Submit the message as a transaction
  const txResponse = await transactionBuilder.submit({
    txMsg,
    memo: "Send 1 POKT via PocketJS",
  });
  console.log(txResponse.txHash);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
\`\`\`

Output:

\`\`\`
2958AC49C3C00DD9F3E6FF2C7983D56E93B4164FF197F6D9DD6954A0BF4FD066
\`\`\`

### Stake a node

\`transactionBuilder.nodeStake\` creates a message to stake a new node or
edit a staked node.

This examples stakes a node with the output address and delegators in POKT
Testnet.

A signer's private is imported from an armored keypair file
"pocket-account-e95c3df1649d9525ae65949eb4c8466ee7ee8bef.json".

\`\`\`js
import "dotenv/config";
import { JsonRpcProvider } from "@pokt-foundation/pocketjs-provider";
import { KeyManager } from "@pokt-foundation/pocketjs-signer";
import { TransactionBuilder } from "@pokt-foundation/pocketjs-transaction-builder";
import ArmoredJson from './pocket-account-e95c3df1649d9525ae65949eb4c8466ee7ee8bef.json' assert { type: 'json' };

async function main() {
  const provider = new JsonRpcProvider({rpcUrl: process.env.POKT_ENDPOINT});

  const txSigner = await KeyManager.fromPPK({
    ppk: JSON.stringify(ArmoredJson),
    password: "password",
  });
  const transactionBuilder = new TransactionBuilder({
    provider,
    signer: txSigner,
    chainID: "testnet",
  });

  // Create a message to stake a node with delegators
  const txMsg = transactionBuilder.nodeStake({
    amount: "16000000000",
    chains: ["0001", "0002"],
    serviceURL: new URL("https://node1.testnet.pokt.network:443"),
    outputAddress: "fc1c79e7efecf89f071ebb2ba7c6f5a98dcdfc3c",
    rewardDelegators: {
      "8147ed5182da6e7dea33f36d78db6327f9df6ba0": 10,
      "54751ae3431c015a6e24d711c9d1ed4e5a276479": 50,
    }
  });
  const txResponse = await transactionBuilder.submit({
    txMsg,
    memo: "NodeStake via PocketJS",
  });
  console.log(txResponse.txHash);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
\`\`\`

Output:

\`\`\`
E85F8D495722B9832B9FA36E2F41012737A8FFF2DD2428A8F9C22847907032C7
\`\`\`

There are some variations of a node-stake message.

1. Stake from the output address

   Instantiate \`TransactionBuilder\` with the private key of the output address
   and specify the node's public key in \`nodePubKey\`.

    \`\`\`js
    const transactionBuilder = new TransactionBuilder({
      provider,
      signer: txOutputSigner, // this must be the key of the output address
      chainID: "testnet",
    });
    const txMsg = transactionBuilder.nodeStake({
      nodePubKey: "f53b9120f4f18c09f883e82b5c1554eddb78cd56eb753eb2ae0dfdbc492cfaaf",
      amount: "16000000000",
      chains: ["0001", "0002"],
      serviceURL: new URL("https://node1.testnet.pokt.network:443"),
      outputAddress: "fc1c79e7efecf89f071ebb2ba7c6f5a98dcdfc3c",
      rewardDelegators: {
        "8147ed5182da6e7dea33f36d78db6327f9df6ba0": 10,
        "54751ae3431c015a6e24d711c9d1ed4e5a276479": 50,
      }
    });
    \`\`\`

2. Stake without delegators or remove delegators from a staked node

    Simply skip \`rewardDelegators\` to create a message.  If you submit this
    transaction to an existing node with delegators, this removes the existing
    delegators from the node.

    \`\`\`js
    const txMsg = transactionBuilder.nodeStake({
      amount: "16000000000",
      chains: ["0001", "0002"],
      serviceURL: new URL("https://node1.testnet.pokt.network:443"),
      outputAddress: "fc1c79e7efecf89f071ebb2ba7c6f5a98dcdfc3c",
    });
    \`\`\`

### Stake an app

This examples stakes an app with 1000 POKT in POKT Testnet.

\`\`\`js
import "dotenv/config";
import { JsonRpcProvider } from "@pokt-foundation/pocketjs-provider";
import { KeyManager } from "@pokt-foundation/pocketjs-signer";
import { TransactionBuilder } from "@pokt-foundation/pocketjs-transaction-builder";

async function main() {
  const provider = new JsonRpcProvider({rpcUrl: process.env.POKT_ENDPOINT});

  const txSignerKey = process.env.SIGNER_PRIVATE_KEY;
  const txSigner = await KeyManager.fromPrivateKey(txSignerKey);
  const transactionBuilder = new TransactionBuilder({
    provider,
    signer: txSigner,

    // To submit a transaction to a non-Mainnet network, you need to specify
    // the network ID in \`chainID\`.
    chainID: "testnet",
  });

  // Create a message to stake an app
  const txMsg = transactionBuilder.appStake({
    appPubKey: "f53b9120f4f18c09f883e82b5c1554eddb78cd56eb753eb2ae0dfdbc492cfaaf",
    chains: ["0001", "0002"],
    // Amount in μPOKT ("1000000000" means 1000 POKT)
    amount: "1000000000",
  });
  const txResponse = await transactionBuilder.submit({
    txMsg,
    memo: "AppStake via PocketJS",
  });
  console.log(txResponse.txHash);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
\`\`\`

Output:

\`\`\`
137BF72DAB2EA4DE9D27B25FFBCDC13C072687F6938F9530116FE96C91DC8F51
\`\`\`

### Transfer an app

You can directly transfer the slot of a staked app to a new empty address
without unstaking the app.

This examples transfers the slot of a staked app from the address associated
with \`process.env.SIGNER_PRIVATE_KEY\` to \`fc1c79e7efecf89f071ebb2ba7c6f5a98dcdfc3c\`
that is the address of the public key
\`0c872497365fad64c3909c934983853865b79e50fe7b8b8003a47baf99d5a64d\`.

\`\`\`js
import "dotenv/config";
import { JsonRpcProvider } from "@pokt-foundation/pocketjs-provider";
import { KeyManager } from "@pokt-foundation/pocketjs-signer";
import { TransactionBuilder } from "@pokt-foundation/pocketjs-transaction-builder";

async function main() {
  const provider = new JsonRpcProvider({rpcUrl: process.env.POKT_ENDPOINT});

  const txSignerKey = process.env.SIGNER_PRIVATE_KEY;
  const txSigner = await KeyManager.fromPrivateKey(txSignerKey);
  const transactionBuilder = new TransactionBuilder({
    provider,
    signer: txSigner,

    // To submit a transaction to a non-Mainnet network, you need to specify
    // the network ID in \`chainID\`.
    chainID: "testnet",
  });

  // Create a message to transfer the app slot
  const txMsg = transactionBuilder.appTransfer({
    appPubKey: "0c872497365fad64c3909c934983853865b79e50fe7b8b8003a47baf99d5a64d",
  });
  const txResponse = await transactionBuilder.submit({
    txMsg,
    memo: "AppTransfer via PocketJS",
  });
  console.log(txResponse.txHash);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
\`\`\`

Output:

\`\`\`
AAF82443ADF0D5B0F43DE8E3537BF140B8F4122949F342D4831A57790AE0215D
\`\`\`

### Send a jsonrpc to a relay chain

This example submits the call of \`eth_chainId\` to the chain \`005A\` in the
network specified by \`process.env.POKT_ENDPOINT\`.

\`\`\`js
import "dotenv/config";
import { JsonRpcProvider } from "@pokt-foundation/pocketjs-provider";
import { KeyManager } from "@pokt-foundation/pocketjs-signer";
import { Relayer } from "@pokt-foundation/pocketjs-relayer";

const AppPrivateKey = process.env.APP_PRIVATE_KEY;

async function main() {
  // Client signer adds a signature to every relay request.  This example
  // generates a new key every time for demonstration purpose.
  const clientSigner = await KeyManager.createRandom();

  // AAT (= Application Authentication Token) must be attached to every relay
  // request.  Otherwise it's rejected by the network.  To generate an AAT,
  // you need to have the private key of a staked application.
  // This example generates an AAT every request for demonstration purpose.
  // Usually a relayer pre-creates an AAT with Client public key, which is
  // also pre-created, and uses the AAT and the Client private key in the
  // relayer.
  const appSigner = await KeyManager.fromPrivateKey(AppPrivateKey);
  const aat = await Relayer.GenerateAAT(
    appSigner,
    clientSigner.publicKey,
  );

  // To use \`Relayer\`, you need to specify \`dispatchers\`.
  const provider = new JsonRpcProvider({
    dispatchers: [process.env.POKT_ENDPOINT],
  });
  const relayer = new Relayer({
    keyManager: clientSigner,
    provider,
  });

  const chain = '005A';
  const payload = {"id":1,"jsonrpc":"2.0","method":"eth_chainId"};

  const sessionResp = await provider.dispatch({
    sessionHeader: {
      sessionBlockHeight: 0,
      chain,
      applicationPubKey: appSigner.publicKey,
    },
  });

  const relayResp = await relayer.relay({
    blockchain: chain,
    data: JSON.stringify(payload),
    pocketAAT: aat,
    session: sessionResp.session,
    options: {
      retryAttempts: 5,
      rejectSelfSignedCertificates: false,
      timeout: 8000,
    },
  });

  console.log(relayResp.response);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
\`\`\`

Output:

\`\`\`
{"jsonrpc":"2.0","id":1,"result":"0xc0d31"}
\`\`\`

# END OF POCKET-JS README

The above code was taken from the codebase at https://github.com/pokt-network/pocket-js`