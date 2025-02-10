import { useSuiBase } from "@/hooks/use-sui-base";
import {
  bytecodeHex,
  SuiTransactionError,
  updateDecimals,
  updateDescription,
  updateMintAmount,
  updateName,
  updateSymbol,
  updateTreasuryCapRecipient,
  updateUrl,
} from "@/lib/sui";
import init, * as template from "@mysten/move-bytecode-template";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex, normalizeSuiAddress } from "@mysten/sui/utils";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";

// Types
export interface CreateTokenParams {
  name: string;
  symbol: string;
  description: string;
  url: string;
}

export interface TokenCreationResult {
  coinTreasuryCap: string;
  coinMetadataCap: string;
  coinType: string;
  digest: string;
}

// Constants
const TOKEN_DECIMALS = 9;
const MINT_AMOUNT = 10_000_000_000;

const getCreateTokenTransaction = async ({
  bytecodeHex,
  name,
  symbol,
  description,
  url,
  userAddress,
}: {
  bytecodeHex: string;
  name: string;
  symbol: string;
  description: string;
  url: string;
  userAddress: string;
}) => {
  await init();
  const templateByteCode = fromHex(bytecodeHex);

  const modifiedByteCode = template.update_identifiers(templateByteCode, {
    COIN_TEMPLATE: symbol.trim().toUpperCase().replaceAll(" ", "_"),
    coin_template: symbol.trim().toLowerCase().replaceAll(" ", "_"),
  });

  let updated = updateDecimals(modifiedByteCode, TOKEN_DECIMALS);

  updated = updateSymbol(updated, symbol);
  updated = updateName(updated, name);
  updated = updateDescription(updated, description);

  updated = updateUrl(updated, url ?? "");

  const supply = BigNumber(MINT_AMOUNT).times(
    BigNumber(10).pow(TOKEN_DECIMALS)
  );

  updated = updateMintAmount(updated, supply);
  updated = updateTreasuryCapRecipient(updated, normalizeSuiAddress("0x0"));

  const txb = new Transaction();
  const [upgradeCap] = txb.publish({
    modules: [[...updated]],
    dependencies: [normalizeSuiAddress("0x1"), normalizeSuiAddress("0x2")],
  });

  txb.transferObjects([upgradeCap], userAddress);
  return txb;
};

// Helper function to extract token info from response
const extractTokenInfo = (objectChanges: any[]) => {
  let coinTreasuryCap: string | undefined;
  let coinMetadataCap: string | undefined;
  let coinType: string | undefined;
  console.log(objectChanges);

  objectChanges?.forEach((object) => {
    if (object.type === "created") {
      if (object.objectType.startsWith("0x2::coin::TreasuryCap")) {
        coinTreasuryCap = object.objectId;
        const match = object.objectType.match(
          /0x[a-fA-F0-9]{64}::[a-zA-Z_][a-zA-Z0-9_]*::[a-zA-Z_][a-zA-Z0-9_]*/
        );
        coinType = match ? match[0]! : "";
      } else if (object.objectType.startsWith("0x2::coin::CoinMetadata")) {
        coinMetadataCap = object.objectId;
      }
    }
  });

  if (!coinTreasuryCap || !coinType || !coinMetadataCap) {
    throw new SuiTransactionError(
      "Failed to get treasury cap, metadata cap, or coin type"
    );
  }

  return {
    coinTreasuryCap,
    coinMetadataCap,
    coinType,
  };
};

// Main hook
export const useCreateTokenSc = () => {
  const { account, executeTransaction } = useSuiBase();

  return useMutation({
    mutationFn: async ({
      name,
      symbol,
      description,
      url,
    }: CreateTokenParams): Promise<TokenCreationResult> => {
      if (!account) {
        throw new Error("No account connected");
      }

      try {
        // Update bytecode with token parameters
        const transaction = await getCreateTokenTransaction({
          bytecodeHex,
          name,
          symbol,
          description,
          url,
          userAddress: account.address,
        });

        const response = await executeTransaction(transaction);

        // Extract and return token information
        return {
          ...extractTokenInfo(response.objectChanges || []),
          digest: response.digest,
        };
      } catch (error) {
        console.error("Error creating token:", error);
        throw error instanceof SuiTransactionError
          ? error
          : new SuiTransactionError("Failed to create token");
      }
    },
  });
};
