import * as template from "@mysten/move-bytecode-template";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import BigNumber from "bignumber.js";
import { fromHex, normalizeSuiAddress, toHex } from "@mysten/sui/utils";

export class SuiTransactionError extends Error {
  constructor(
    message: string,
    public readonly digest?: string,
    public readonly effects?: any,
    public readonly isCancelled: boolean = false
  ) {
    super(message);
    this.name = "SuiTransactionError";
  }
}

export const handleSuiError = (error: unknown) => {
  if (error instanceof SuiTransactionError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message.includes("User rejected the request")) {
      return new SuiTransactionError(
        "Transaction cancelled by user",
        undefined,
        undefined,
        true
      );
    }
    return new SuiTransactionError(error.message);
  }

  return new SuiTransactionError("Unknown error occurred");
};

export const executeSuiTransaction = async ({
  client,
  signature,
  bytes,
}: {
  client: SuiClient;
  signature: string | string[];
  bytes: string;
}): Promise<SuiTransactionBlockResponse> => {
  const { digest } = await client.executeTransactionBlock({
    signature,
    transactionBlock: bytes,
    requestType: "WaitForEffectsCert",
  });

  const response = await client.waitForTransaction({
    digest,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  if (response.effects?.status.status !== "success") {
    throw new SuiTransactionError(
      response.effects?.status.error || "Transaction failed",
      digest,
      response.effects
    );
  }

  return response;
};

const Address = bcs.bytes(32).transform({
  // To change the input type, you need to provide a type definition for the input
  input: (val: string) => fromHex(val),
  output: (val) => toHex(val),
});

export const updateDecimals = (
  modifiedByteCode: Uint8Array,
  decimals: number = 9
) =>
  template.update_constants(
    modifiedByteCode,
    bcs.u8().serialize(decimals).toBytes(),
    bcs.u8().serialize(9).toBytes(),
    "U8"
  );

export const updateSymbol = (modifiedByteCode: Uint8Array, symbol: string) =>
  template.update_constants(
    modifiedByteCode,
    bcs.string().serialize(symbol.trim()).toBytes(),
    bcs.string().serialize("SYMBOL").toBytes(),
    "Vector(U8)"
  );

export const updateName = (modifiedByteCode: Uint8Array, name: string) => {
  return template.update_constants(
    modifiedByteCode,
    bcs.string().serialize(name.trim()).toBytes(),
    bcs.string().serialize("NAME").toBytes(),
    "Vector(U8)"
  );
};

export const updateDescription = (
  modifiedByteCode: Uint8Array,
  description: string
) =>
  template.update_constants(
    modifiedByteCode,
    bcs.string().serialize(description.trim()).toBytes(),
    bcs.string().serialize("DESCRIPTION").toBytes(),
    "Vector(U8)"
  );

export const updateUrl = (modifiedByteCode: Uint8Array, url: string) =>
  template.update_constants(
    modifiedByteCode,
    bcs.string().serialize(url).toBytes(),
    bcs.string().serialize("url").toBytes(),
    "Vector(U8)"
  );

export const updateMintAmount = (
  modifiedByteCode: Uint8Array,
  supply: BigNumber
) =>
  template.update_constants(
    modifiedByteCode,
    bcs.u64().serialize(supply.toString()).toBytes(),
    bcs.u64().serialize(0).toBytes(),
    "U64"
  );

export const updateTreasuryCapRecipient = (
  modifiedByteCode: Uint8Array,
  recipient: string
) =>
  template.update_constants(
    modifiedByteCode,
    Address.serialize(recipient).toBytes(),
    Address.serialize(normalizeSuiAddress("0x0")).toBytes(),
    "Address"
  );

export const bytecodeHex =
  "a11ceb0b060000000a01000c020c1e032a2d04570a05616307c401e70108ab0360068b04570ae204050ce704360007010d02060212021302140000020001020701000002010c01000102030c0100010404020005050700000a000100011105060100020808090102020b0c010100030e0501010c030f0e01010c04100a0b00050c030400010402070307050d040f02080007080400020b020108000b03010800010a02010805010900010b01010900010800070900020a020a020a020b01010805070804020b030109000b0201090001060804010504070b030109000305070804010b0301080002090005010b020108000d434f494e5f54454d504c4154450c436f696e4d65746164617461064f7074696f6e0b5472656173757279436170095478436f6e746578740355726c04636f696e0d636f696e5f74656d706c6174650f6372656174655f63757272656e63790b64756d6d795f6669656c6404696e6974116d696e745f616e645f7472616e73666572156e65775f756e736166655f66726f6d5f6279746573066f7074696f6e137075626c69635f73686172655f6f626a6563740f7075626c69635f7472616e736665720673656e64657204736f6d65087472616e736665720a74785f636f6e746578740375726c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020201090a02070653594d424f4c0a0205044e414d450a020c0b4445534352495054494f4e0a02040375726c030800000000000000000520000000000000000000000000000000000000000000000000000000000000000000020109010000000002190b0007000701070207030704110738000a0138010c020c030d0307050a012e11060b0138020b03070638030b0238040200";
