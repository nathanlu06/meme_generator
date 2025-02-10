import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import { getCsrfToken, signIn } from "next-auth/react";
import { toast } from "sonner";

export const useLoginSuiWallet = () => {
  const { mutateAsync: signMessage } = useSignPersonalMessage();
  const account = useCurrentAccount();
  return useMutation({
    mutationFn: async () => {
      try {
        if (!account) {
          throw new Error("Account not found");
        }

        const csrfToken = await getCsrfToken();

        const signature = await signMessage({
          account,
          message: new TextEncoder().encode(csrfToken),
        });

        const response = await signIn("credentials", {
          signature: signature.signature,
          address: account.address,
          redirect: false,
        });

        if (response?.error) {
          throw new Error(response.error);
        }

        return response;
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unknown error occurred");
        }
      }
    },
  });
};
