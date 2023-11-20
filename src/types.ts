import { ReactElement, ReactNode } from "react";

export type LTWH = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type LTWHP = LTWH & {
  pageNumber: number;
};

export type Scaled = {
  x1: number;
  y1: number;

  x2: number;
  y2: number;

  width: number;
  height: number;

  pageNumber: number;
};

export type Position = {
  boundingRect: LTWHP;
  rects: Array<LTWHP>;
};

export type ScaledPosition = {
  boundingRect: Scaled;
  rects: Array<Scaled>;
  usePdfCoordinates?: boolean;
};

export type Content = {
  text?: string;
  image?: string;
};

export type Comment = {
  text: string;
  icon?: ReactNode;
};

export type Highlight = {
  comment: Comment;
  content: Content;
  position: ScaledPosition;
  id: string;
};

export type NewHighlight = Omit<Highlight, "id">;

export type ViewportHighlight = Highlight & {
  position: Position;
};

export interface Viewport {
  convertToPdfPoint: (x: number, y: number) => Array<number>;
  convertToViewportRectangle: (pdfRectangle: Array<number>) => Array<number>;
  width: number;
  height: number;
}

export type Page = {
  node: HTMLElement;
  number: number;
};

export type HighlightTransformer = (
  highlight: ViewportHighlight,
  index: number,
  setTip: (
    highlight: ViewportHighlight,
    callback: (highlight: ViewportHighlight) => ReactElement
  ) => void,
  hideTip: () => void,
  viewportToScaled: (rect: LTWHP) => Scaled,
  screenshot: (position: LTWH) => string,
  isScrolledTo: boolean
) => ReactNode;
