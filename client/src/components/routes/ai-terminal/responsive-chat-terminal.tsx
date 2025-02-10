"use client";

import { cn } from "@/lib/utils";
import React from "react";
import ChatTerminal, { ViewSize } from "./chat-terminal";
import { Button } from "@/components/ui/button";
import { IconChevronUp, IconClose } from "@/components/icons";

const ResponsiveChatTerminal = () => {
  const [viewSize, setViewSize] = React.useState<ViewSize>(ViewSize.MINIMUM);

  return (
    <div
      className={cn(
        "fixed left-0 right-0 bottom-0 sm:relative w-full h-auto sm:h-full border border-black px-6 pb-4 sm:p-4 rounded-t-2xl sm:rounded-lg bg-white"
      )}
      onClick={
        viewSize === ViewSize.MINIMUM
          ? () => setViewSize(ViewSize.HALF)
          : undefined
      }
    >
      <div className="sm:hidden flex flex-row items-center justify-between mt-4 mb-10">
        <h2 className="text-lg leading-none text-black">Live Chat</h2>
        <div className="flex flex-row items-center justify-center">
          <Button
            className="border-none bg-transparent p-0"
            onClick={() => {
              setViewSize(
                viewSize === ViewSize.MINIMUM
                  ? ViewSize.HALF
                  : viewSize === ViewSize.HALF
                  ? ViewSize.FULL
                  : ViewSize.HALF
              );
            }}
          >
            <IconChevronUp
              className={cn(
                "size-6 transition-transform duration-300 ease-in-out",
                viewSize === ViewSize.FULL && "rotate-180"
              )}
            />
          </Button>

          <Button
            className={cn(
              "border-none bg-transparent p-0",
              "transition-all duration-300 ease-in-out ml-2",
              viewSize === ViewSize.MINIMUM && "w-0 h-0 p-0 ml-0"
            )}
            onClick={() => setViewSize(ViewSize.MINIMUM)}
          >
            <IconClose className={"size-6"} />
          </Button>
        </div>
      </div>
      <ChatTerminal viewSize={viewSize} />
    </div>
  );
};

export default ResponsiveChatTerminal;
