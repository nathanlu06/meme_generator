export interface DiscussionMessage {
  human: string;
  ai: string;
  token?: {
    meme_info: {
      token_image: string;
      token_name: string;
      token_story: string;
      token_symbol: string;
    };
    meme_image: string;
  };
}

export interface ChatForm {
  prompt: string;
  messages: DiscussionMessage[];
}
