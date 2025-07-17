import { createContext, useContext } from "react";
import { GhostHighlight, Highlight, PdfSelection, Tip } from "../types";
import { PDFViewer } from "pdfjs-dist/types/web/pdf_viewer";

/**
 * A set of utilities for to control the behaviour of {@link PdfHighlighter}.
 *
 * @category Context
 */
export type PdfHighlighterUtils = {
  /**
   * Checks whether a selection is progress, a ghost highlight, or an edit.
   *
   * @returns - `true` if editing, ghost highlighting, or selecting.
   */
  isEditingOrHighlighting(): boolean;

  /**
   * Currently selected area or text selection.
   */
  selection: PdfSelection | null;

  /**
   * Currently present ghost highlight.
   */
  ghostHighlight: GhostHighlight | null;

  /**
   * Cancel any ghost highlight.
   * The selected area will stay selected until the user clicks away.
   */
  removeGhostHighlight(): void;
  /**
   * If enabled, automatic tips/popups inside of a PdfHighlighter will be disabled.
   * Additional niceties will also be provided to prevent new highlights being made.
   */
  toggleEditInProgress(flag?: boolean): void;

  /**
   * Whether an AreaHighlight is being moved/resized, or a manual highlight edit has
   * been toggled.
   */
  isEditInProgress: boolean;

  /**
   * Whether a mouse selection or text selection is currently being performed.
   */
  isSelectionInProgress: boolean;

  /**
   * Scroll to a highlight in this viewer.
   *
   * @param highlight - A highlight provided to the {@link PdfHighlighter} to
   * scroll to.
   */
  scrollToHighlight(highlight: Highlight): void;

  /**
   * Get a reference to the currently used instance of a PDF Viewer.
   *
   * @returns - The currently active PDF Viewer.
   */
  getViewer(): PDFViewer | null;

  /**
   * Get the currently active tip, if any.
   *
   * @returns - the currently active tip or `null` if inactive.
   */
  getTip(): Tip | null;

  /**
   * Set a tip to be displayed in the current PDF Viewer.
   *
   * @param tip - tip to be displayed, or `null` to hide any tip.
   */
  setTip(tip: Tip | null): void;

  /**
   * Callback to update any currently active tip's position. This will make sure
   * the tip is visible above/below its highlight.
   */
  updateTipPosition(): void;
};

export const PdfHighlighterContext = createContext<
  PdfHighlighterUtils | undefined
>(undefined);

/**
 * Custom hook for providing {@link PdfHighlighterUtils}. Must be used
 * within a child of {@link PdfHighlighter}.
 *
 * @category Context
 */
export const usePdfHighlighterContext = () => {
  const pdfHighlighterUtils = useContext(PdfHighlighterContext);

  if (pdfHighlighterUtils === undefined) {
    throw new Error(
      "usePdfHighlighterContext must be used within PdfHighlighter!",
    );
  }

  return pdfHighlighterUtils;
};
