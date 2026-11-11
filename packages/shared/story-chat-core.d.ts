export interface StoryCharacter {
  id: string;
  name: string;
  role: string;
  desc: string;
}

export interface StoryLocation {
  id: string;
  name: string;
  type: string;
  desc: string;
}

export interface StoryTimeline {
  id: string;
  title: string;
  time: string;
  desc: string;
}

export interface StoryOverviewItem {
  id: string;
  title: string;
  desc: string;
}

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  thinking?: string;
  isThinking?: boolean;
  thinkingDuration?: string;
  thoughtOpen?: boolean;
  autoSavedToCanvas?: boolean;
  timestamp?: number;
  updatedAt?: number;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  characters: StoryCharacter[];
  locations: StoryLocation[];
  timelines: StoryTimeline[];
  overview: StoryOverviewItem[];
  chatMessages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface StreamingState {
  thinking: string;
  story: string;
  isThinking: boolean;
  isDone: boolean;
  startTime: number;
  elapsedSec: string;
}

export interface SplitCanvasResult {
  chatText: string;
  canvasText: string;
  hasCanvasContent: boolean;
  autoExtracted?: boolean;
}

declare const StoryChatCore: {
  createDefaultStory(customProps?: Partial<Story>): Story;
  addNewStory(
    stories: Story[],
    title?: string
  ): { stories: Story[]; newStory: Story; activeStoryId: string };
  switchStory(
    stories: Story[],
    targetStoryId: string
  ): { story: Story; activeStoryId: string };
  deleteStory(
    stories: Story[],
    activeStoryId: string,
    storyIdToDelete: string
  ): { stories: Story[]; activeStoryId: string; isReset: boolean };
  startNewChat(story: Story): Story;
  deleteChatMessage(chatMessages: ChatMessage[], messageIndex: number): ChatMessage[];
  addChatMessage(
    chatMessages: ChatMessage[],
    role: "user" | "ai",
    content: string,
    thinking?: string
  ): ChatMessage[];
  prepareRegenerateChat(
    chatMessages: ChatMessage[]
  ): { updatedMessages: ChatMessage[]; lastUserPrompt: string | null };
  editChatMessage(
    chatMessages: ChatMessage[],
    messageIndex: number,
    newContent: string
  ): ChatMessage[];
  clearCanvasContent(): string;
  deleteNoteItem<T extends { id: string }>(items: T[], itemId: string): T[];
  addNoteItem<T extends { id: string }>(
    items: T[],
    newItem: Omit<T, "id"> & { id?: string }
  ): T[];
  buildStoryContextPrompt(
    story: Story,
    plainCanvasText: string,
    activeStyle?: string
  ): string;
  cleanCanvasNovelContent(text: string): string;
  isEditingCommand(userPrompt?: string): boolean;
  splitChatAndCanvasContent(
    rawAiText: string,
    userPrompt?: string
  ): SplitCanvasResult;
  extractPureStoryContent(rawAiText: string): string;
  parseSseStreamChunk(
    rawChunkText: string
  ): Array<{ event: string; data: Record<string, unknown> }>;
  parseSseBlocks(
    buffer: string
  ): {
    events: Array<{ event: string; data: Record<string, unknown> }>;
    remainingBuffer: string;
  };
  createStreamingState(): StreamingState;
  appendStreamChunk(
    streamState: StreamingState,
    eventType: string,
    data?: { chunk?: string; thinking_logs?: string; story_output?: string }
  ): StreamingState;
  parseThinkingSteps(thinkingText: string, isWorking?: boolean): string[];
  escapeHtml(text: string): string;
  formatAiResponseText(text: string): string;
};

export = StoryChatCore;
