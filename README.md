# react-pdf-highlighter-extended

[![Node.js CI](https://github.com/DanielArnould/react-pdf-highlighter-extended/actions/workflows/node.js.yml/badge.svg)](https://github.com/DanielArnould/react-pdf-highlighter-extended/actions/workflows/node.js.yml)
[![npm version](https://badge.fury.io/js/react-pdf-highlighter-extended.svg)](https://badge.fury.io/js/react-pdf-highlighter-extended)

`react-pdf-highlighter-extended` is a [React](https://reactjs.org/) library that provides a highly customisable annotation experience for PDF documents on the web, with text and rectangular highlights both supported. It leverages [PDF.js](https://github.com/mozilla/pdf.js) as its viewer. The highlight data format is also independent of the viewport, making it suitable for saving on a server.

This originally started as a fork of [`react-pdf-highlighter`](https://github.com/agentcooper/react-pdf-highlighter) but so much has been refactored and redesigned that it would be a burden to pull it to the original repo. Some of these changes include: addition of `HighlightContext`, `PdfHighlighterContext`, and `MonitoredHighlightContainer`; zoom support; exposed styling on all components; and numerous bugfixes. Efforts will be made to try to ensure feature parity with the original repo, but there are no guarantees that syntax and usage will be the same.

## Table of Contents

- [Documentation](#documentation)
- [Example](#example)
- [Installation](#installation)
- [Usage](#usage)
  - [PdfLoader](#pdfloader)
    - [Example loading document with `string`](#example-loading-document-with-string)
    - [Example loading document with `DocumentInitParameters`](#example-loading-document-with-documentinitparameters)
  - [PdfHighlighter](#pdfhighlighter)
    - [Example](#example-1)
  - [User-defined HighlightContainer](#user-defined-highlightcontainer)
    - [Example](#example-2)
    - [Example with categories and custom highlights](#example-with-categories-and-custom-highlights)
    - [Example with comments and `MonitoredHighlightContainer`](#example-with-comments-and-monitoredhighlightcontainer)
  - [Tips](#tips)
    - [Example](#example-3)
- [Contribute](#contribute)

## Documentation

If you just want to use this library, you can find comprehensive docs for all aspects by visiting the [official documentation page](https://danielarnould.github.io/react-pdf-highlighter-extended/docs/).

If you wish to contribute, most internal components are documented in code, though not to the same depth.

## Example

For a live demo check https://danielarnould.github.io/react-pdf-highlighter-extended/example-app/.

To run the example app locally:

```
git clone https://github.com/DanielArnould/react-pdf-highlighter-extended.git
npm install
npm run dev
```

## Installation

`npm install pdfjs-dist react-pdf-highlighter-extended --save`

or

`yarn add pdfjs-dist react-pdf-highlighter-extended`

## Usage

Here are some simple usage examples of this library to help you get started with your application. Please note that these examples and explanations are not exhaustive and many additional props are not shown. To see more extensive usage, have a look at the example app or refer to the documentation.

### PDF.js CSS

First all, you should copy `pdfjs-dist/web/pdf_viewer.css` to your `public` folder, then import it in your `index.html` as below:

```html
<link rel="stylesheet" href="/pdf_viewer.css" />
```

### PdfLoader

The PdfLoader creates a container to load PDF documents with PDF.js.

#### Example loading document with `string`

```javascript
const url = "https://arxiv.org/pdf/1708.08021.pdf";

<PdfLoader document={url}>
  {(pdfDocument) => (/* PdfHighlighter component goes here */)}
</PdfLoader>;
```

#### Example loading document with `DocumentInitParameters`

You can also pass any extra parameters to the PdfLoader document that are accepted by PDF.js. For example, you could use this to specify HTTP headers for retrieving your document.

```javascript
const pdfDocument: Partial<DocumentInitParameters> = {
  url: "https://arxiv.org/pdf/1708.08021.pdf",
  httpHeaders: {
      "Authorization": "Bearer JWT_TOKEN_HERE"
  },
  password: "PDF_PASSWORD_HERE"
}

<PdfLoader document={pdfDocument}>
  {(pdfDocument) => (/* PdfHighlighter component goes here */)}
</PdfLoader>
```

### PdfHighlighter

The PdfHighlighter provides a PDF.js viewer along with various helpful event listeners and niceties for creating a fully-fledged and robust highlighter. It does **NOT** render any highlights on its own. Instead, it expects a user-defined Highlight Container as its child, which will be rendered and given context for each individual highlights. Please also note for styling that the PDF.js viewer renders its pages with `absolute` positioning.

#### Example

```javascript
const myPdfHighlighter = () => {
  const [highlights, setHighlights] = useState<Array<Highlight>>([]);

  /** Refs for PdfHighlighter utilities
   * These contain numerous helpful functions, such as scrollToHighlight,
   * getCurrentSelection, setTip, and many more
   */
  const highlighterUtilsRef = useRef<PdfHighlighterUtils>();

return (
  <PdfLoader document={url}>
    {(pdfDocument) => (
      <PdfHighlighter
        enableAreaSelection={(event) => event.altKey}
        pdfDocument={pdfDocument}
        utilsRef={(_pdfHighlighterUtils) => {
          highlighterUtilsRef.current = _pdfHighlighterUtils;
        }}
        selectionTip={<ExpandableTip />} // Component will render as a tip upon any selection
        highlights={highlights}
      >
        {/* User-defined HighlightContainer component goes here */}
      </PdfHighlighter>
    )}
  </PdfLoader>
);
}
```

### User-defined HighlightContainer

You must create your own Highlight Container which will be rendered as needed for each highlight inside the PdfHighlighter. This container will receive the context it needs through the `useHighlightContainerContext` hook. Additionally, you can access numerous useful utility functions through the `usePdfHighlighterContext` hook. This library also provides two ready-to-use componenets, `TextHighlight` and `AreaHighlight`, which you can place inside your container to easily render some standard highlight styles.

#### Example

```javascript
interface MyHighlightContainerProps {
  editHighlight: (idToUpdate: string, edit: Partial<Highlight>) => void; // This could update highlights in the parent
}

const MyHighlightContainer = ({
  editHighlight,
}: MyHighlightContainerProps) => {

  const {
    highlight, // The highlight being rendred
    viewportToScaled, // Convert a highlight position to platform agnostic coords (useful for saving edits)
    screenshot, // Screenshot a bounding rectangle
    isScrolledTo, // Whether the highlight has been auto-scrolled to
    highlightBindings, // Whether the highlight has been auto-scrolled to
  } = useHighlightContainerContext();

  const {
    currentTip,
    setTip,
    toggleEditInProgress,
    isEditInProgress
  } = useTipViewerUtils();

  const { toggleEditInProgress } =
    usePdfHighlighterContext();

  const isTextHighlight = !Boolean(
    highlight.content && highlight.content.image
  );

  const component = isTextHighlight ? (
    <TextHighlight
      isScrolledTo={isScrolledTo}
      highlight={highlight}
    />
  ) : (
    <AreaHighlight
      isScrolledTo={isScrolledTo}
      highlight={highlight}
      onChange={(boundingRect) => {
        const edit = {
          position: {
            boundingRect: viewportToScaled(boundingRect),
            rects: [],
          },
          content: {
            image: screenshot(boundingRect),
          },
        };

        editHighlight(highlight.id, edit);
        toggleEditInProgress(false);
      }}
      bounds={highlightBindings.textLayer}
      onEditStart={() => toggleEditInProgress(true)}
    />
  );

  return (component);
};
```

#### Example with categories and custom highlights

The power of a user-defined highlight container is that you can customise your highlight rendering as much as you want. For example, here is how you could extend your application to support highlights with categories.

```javascript
export interface MyCustomHighlight extends Highlight {
    category: string
}
```

You could then use this in your HighlightContainer to render highlights with different colors depending on their category.

```javascript
// Same logic as above examples

  const {
    highlight,
    viewportToScaled,
    screenshot,
    isScrolledTo,
    highlightBindings,
  } = useHighlightContainerContext<MyCustomHighlight>();

const category = highlight.category;
let highlightColor = "rgba(199,227,114,1)";

if (category === "red") {
  highlightColor = "rgba(239,90,104,1)";
} else if (category === "blue") {
  highlightColor = "rgba(154,208,220,1)";
}

const component = isTextHighlight ? (
  <TextHighlight highlight={highlight} style={{ background: highlightColor }} />
) : (
  <AreaHighlight
    highlight={highlight}
    style={{
      background: highlightColor,
    }}
  />
);

// Same return as above examples
```

#### Example with comments and `MonitoredHighlightContainer`

Very often you might want to display a popup, tip, or comment if the user hovers over a highlight. To facilitate this, this library offers a `MonitoredHighlightContainer`, which you can wrap around your rendered highlight to create a mouse listener both over the highlight and any popup content you might display above it. Combining this with custom highlights allows you to associate all sorts of displayable information with your highlights.

```javascript
export interface MyCustomHighlight extends Highlight {
    comment?: string
}

const MyHighlightPopup = (highlight: ViewportHighlight<MyCustomHighlight>) => {
  return highlight.comment ? (
    <div>{highlight.comment}</div>
  ) : (
    <div>Highlight has no comment</div>
  );
};

const MyHighlightContainer = ({
  editHighlight,
}: MyHighlightContainerProps) => {

  // Same hooks as above example
  // Same logic as above example

  const highlightTip: Tip = {
    position: highlight.position,
    content: <HighlightPopup highlight={highlight} />
  };

  return (
    <MonitoredHighlightContainer
      highlightTip={highlightTip}
      key={highlight.id}
      children={component}
    />
  );
};
```

### Tips

At any point you can use `getTip()` and `setTip()` from the `usePdfHighlighterContext()` hook or the `utilsRef` property on `PdfHighlighter`. To set a tip, simply provide the position of a highlight, ghost highlight, or selection and the component you wish to render. This will automatically place your tip in the middle and slightly above your given highlight (or below if necessary). However, since the `PdfHighlighter` is not aware of the state of your tip, you must tell it to update its position if your tip ever changes size and you want it to remain above/below your given highlight. Fortunately, you can do this quite easily with `updateTipPosition()` within a `PdfHighlighterContext`.

#### Example

```javascript
const MyExpandableTip = () => {
  const [compact, setCompact] = useState(true);

  const { getCurrentSelection, updateTipPosition } =
    usePdfHighlighterContext();

  useLayoutEffect(() => {
    updateTipPosition!();
  }, [compact]);

  return (
    <div className="Tip">
      {compact ? (
        <button
          onClick={() => {
            setCompact(false);
            if (getCurrentSelection()) {
              getCurrentSelection().makeGhostHighlight();
            }
          }}
        >
          Expand Tip
        </button>
      ) : (
        <div style={{ padding: "50px" }}>Expanded content</div>
      )}
    </div>
  );
};
```

## Contribute

If you have a bug to report, please add it as an issue with clear steps to reproduce it.

If you have a feature request, please add it as an issue or make a pull request. If you do wish to make a pull request, consider checking whether your feature has already been implemented or tested in the original [`react-pdf-highlighter`](https://github.com/agentcooper/react-pdf-highlighter).
