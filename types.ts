
export interface StoryNode {
  id: string;
  parentId: string | null;
  storySegment: string;
  choiceText: string;
  children: string[];
}

export interface StoryTree {
  nodes: { [key: string]: StoryNode };
  choices: { [key: string]: string[] };
}

export interface ImagePart {
    inlineData: {
        mimeType: string;
        data: string;
    }
}
