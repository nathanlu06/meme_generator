import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        signature: {},
        address: {},
      },
      async authorize(credentials, req) {
        if (!credentials?.signature || !credentials?.address) {
          throw new Error("Invalid credentials");
        }

        const { signature, address } = credentials;
        const csrfToken = req.body?.csrfToken;

        if (!csrfToken) {
          throw new Error("Unable to identify user");
        }

        const publicKey = await verifyPersonalMessageSignature(
          new TextEncoder().encode(csrfToken),
          signature
        );

        if (publicKey.toSuiAddress() !== address) {
          throw new Error("Invalid signature");
        }

        return { id: address, name: address };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
};
