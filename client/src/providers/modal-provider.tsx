"use client";

import NiceModal from "@ebay/nice-modal-react";
import { PropsWithChildren } from "react";

export const ModalProvider = ({ children }: PropsWithChildren) => {
  return <NiceModal.Provider>{children}</NiceModal.Provider>;
};
