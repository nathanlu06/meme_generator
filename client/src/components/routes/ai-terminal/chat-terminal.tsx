import { IconSend } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn, truncateAddress } from "@/lib/utils";
import { ChatForm } from "@/schemas/chat.schema";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import useFormPersist from "react-hook-form-persist";
import { CreateTokenForm } from "./create-token-form";

export enum ViewSize {
  MINIMUM = "MINIMUM",
  HALF = "HALF",
  FULL = "FULL",
}

interface ChatTerminalProps {
  viewSize?: ViewSize;
}

const ChatTerminal = ({ viewSize }: ChatTerminalProps) => {
  const account = useCurrentAccount();
  const form = useForm<ChatForm>();
  useFormPersist(`chat-form-${account?.address ?? ""}`, {
    watch: form.watch,
    setValue: form.setValue,
  });
  const { status, data: session } = useSession();

  const messages = useFieldArray({
    control: form.control,
    name: "messages",
  });

  const watchedMessages = messages.fields.map((message, index) => ({
    ...message,
    ...form.watch(`messages.${index}`),
  }));
  const scrollToBottom = () => {
    setTimeout(() => {
      const chatEnd = document.getElementById("chat-end");
      if (chatEnd) {
        chatEnd.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // const { mutateAsync: sendChat, isPending } = useMutation({
  //   mutationKey: ["chat", account?.address, watchedMessages],
  //   mutationFn: async ({ index, ...data }: ChatForm & { index: number }) => {
  //     const response = await fetch("/api/chat", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(data),
  //     });

  //     if (!response.body) {
  //       throw new Error("Stream response not available");
  //     }

  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder();
  //     let aiResponse = "";

  //     while (true) {
  //       const { done, value } = await reader.read();
  //       if (done) break;
  //       aiResponse += decoder.decode(value, { stream: true });

  //       form.setValue(`messages.${index}.ai`, aiResponse);

  //       // Scroll to the end of the chat
  //       scrollToBottom();
  //     }

  //     return aiResponse;
  //   },
  // });
  const { mutateAsync: sendChat, isPending } = useMutation({
    mutationKey: ["chat", account?.address, watchedMessages],
    mutationFn: async ({ index, ...data }: ChatForm & { index: number }) => {
      const response = await fetch("/api/generate-meme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      form.setValue(`messages.${index}.token`, result);
      scrollToBottom();
      return result;
    },
  });

  const handleSubmit = async (data: ChatForm) => {
    if (!account) {
      if (status === "authenticated") {
        await signOut({ redirect: false });
      }
      return;
    }

    if (status === "authenticated" && session?.user?.name !== account.address) {
      await signOut({ redirect: false });
    }

    async function submitMessage() {
      // Append the user message first
      messages.append({ human: data.prompt, ai: "" });

      // Clear the prompt field
      form.setValue("prompt", "");

      // Scroll to the end of the chat
      scrollToBottom();

      await sendChat({
        prompt: data.prompt,
        messages: messages.fields,
        index: messages.fields.length,
      });
    }

    await submitMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(handleSubmit)();
    }
  };

  useEffect(() => {
    if (!account) {
      form.reset({}, { keepValues: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <div className="w-full h-full flex flex-col">
      <ScrollArea
        className={cn(
          "w-full h-full flex-grow flex flex-col overflow-y-scroll",
          "bg-center bg-no-repeat bg-contain bg-[url(/images/bg-terminal.png)]",
          "transition-all duration-300 ease-in-out",
          {
            "h-[50vh]": viewSize === ViewSize.HALF,
            "h-0": viewSize === ViewSize.MINIMUM,
            "h-[75vh]": viewSize === ViewSize.FULL,
          }
        )}
      >
        <div className={cn("w-full flex flex-col gap-4")}>
          {account &&
            watchedMessages.map((message, index) => (
              <React.Fragment key={message.id}>
                {message.human && (
                  <div className="flex flex-row items-start justify-start gap-4">
                    <div className="size-8 sm:size-10 text-center flex items-center justify-center text-2xl rounded-full border border-black p-1">
                      {/* <Image
                        src="/images/user-avatar.png"
                        width={100}
                        height={100}
                        className="w-full h-full object-contain"
                        alt="User Avatar"
                      /> */}
                      👤
                    </div>
                    <div className="flex flex-col">
                      <p className="text-black text-sm sm:text-base">
                        {truncateAddress(account.address)}
                      </p>
                      <p className="text-xs sm:text-sm text-black">
                        {message.human}
                      </p>
                    </div>
                  </div>
                )}
                {message.ai && (
                  <div className="flex flex-row items-start justify-start gap-4">
                    <div className="size-8 sm:size-10 text-center flex items-center justify-center text-2xl rounded-full border border-black p-1">
                      {/* <Image
                          src="/images/ai-avatar.png"
                          width={100}
                          height={100}
                          className="w-full h-full object-contain"
                          alt="AI Avatar"
                        /> */}
                      🤖
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-primary text-sm sm:text-base">
                        AI Terminal
                      </p>
                      <p className="text-xs sm:text-sm text-black text-wrap w-full">
                        {message.ai}
                      </p>
                    </div>
                  </div>
                )}
                {message.token && (
                  <div className="flex flex-row items-start justify-start gap-4">
                    <CreateTokenForm
                      initialValues={{
                        description: message.token.meme_info.token_story,
                        name: message.token.meme_info.token_name,
                        symbol: message.token.meme_info.token_symbol.replace(
                          /[^A-Za-z]/g,
                          ""
                        ),
                        url: message.token.meme_image,
                      }}
                      onCancel={() => {
                        form.setValue(`messages.${index}.token`, undefined);
                      }}
                      onSuccess={({ tokenAddress }) => {
                        form.setValue(`messages.${index}.token`, undefined);
                        form.setValue(
                          `messages.${index}.ai`,
                          `Token created successfully! ${tokenAddress}`
                        );
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
        </div>
        <div id="chat-end" className="h-4" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-row items-center gap-4 bg-white border border-black p-2 rounded"
      >
        <textarea
          {...form.register("prompt", { required: true })}
          rows={1}
          onKeyDown={handleKeyDown}
          placeholder={account ? "TYPE YOUR MESSAGE..." : "CONNECT TO CHAT"}
          className="w-full ring-0 outline-none resize-none leading-tight py-2"
        />
        <Button
          type="submit"
          className="p-1.5 w-fit h-fit rounded bg-black"
          disabled={!account}
          loading={isPending}
        >
          <IconSend className="size-4 sm:size-6" />
        </Button>
      </form>
    </div>
  );
};

export default ChatTerminal;
