import { agentPrompt } from "@/lib/prompt";
import { CallbackManager } from "@langchain/core/callbacks/manager";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { NextResponse } from "next/server";

const promptTemplate = ChatPromptTemplate.fromTemplate(agentPrompt);

export async function POST(req: Request) {
  const body = await req.json();
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const chat = new ChatOpenAI({
    streaming: true,
    callbackManager: CallbackManager.fromHandlers({
      handleLLMNewToken: async (token: string) => {
        await writer.ready;
        await writer.write(encoder.encode(token));
      },
      handleLLMEnd: async () => {
        await writer.ready;
        await writer.close();
      },
      handleLLMError: async (e) => {
        await writer.ready;
        await writer.abort(e);
      },
    }),
    configuration: {
      baseURL: process.env.OPENAI_BASE_URL,
    },
  });

  const formattedPrompt = await promptTemplate.format({
    user_input: body.prompt,
  });

  const messages = body.messages || [];
  const chatHistory = messages.flatMap(
    (message: { human: string; ai: string }) => [
      new HumanMessage(message.human),
      new AIMessage(message.ai),
    ]
  );

  chat.invoke([...chatHistory, new HumanMessage(formattedPrompt)]);

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
