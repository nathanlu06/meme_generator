import {
	useCurrentAccount,
	useSignTransaction,
	useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
	executeSuiTransaction,
	SuiTransactionError,
	handleSuiError,
} from "@/lib/sui";

export const useSuiBase = () => {
	const client = useSuiClient();
	const account = useCurrentAccount();
	const { mutateAsync: signTransaction } = useSignTransaction();

	const executeTransaction = async (transaction: Transaction) => {
		if (!account?.chains[0]) {
			throw new SuiTransactionError("No account connected");
		}

		try {
			const { signature, bytes } = await signTransaction({
				transaction,
			});

			return executeSuiTransaction({
				client,
				signature,
				bytes,
			});
		} catch (error) {
			throw handleSuiError(error);
		}
	};

	return {
		client,
		account,
		signTransaction,
		executeTransaction,
	};
};
