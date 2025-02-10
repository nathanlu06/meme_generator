import { AITerminal } from "@/components/routes/ai-terminal";
import { Metadata } from "next";

const AITerminalPage: React.FC = () => {
  return <AITerminal />;
};

export const metadata: Metadata = {
  title: "AI Terminal",
  description: "Chat with AI Terminal",
};

export default AITerminalPage;
