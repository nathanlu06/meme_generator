import Header from "@/components/layout/header";
import {
  ModalProvider,
  NextAuthProvider,
  QueryProvider,
  SuiProvider,
} from "@/providers";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AI Terminal",
  description: "Chat and create meme coins with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <SuiProvider>
        <NextAuthProvider>
          <html lang="en">
            <body>
              <ModalProvider>
                <Header />
                <Toaster />
                {children}
              </ModalProvider>
            </body>
          </html>
        </NextAuthProvider>
      </SuiProvider>
    </QueryProvider>
  );
}
