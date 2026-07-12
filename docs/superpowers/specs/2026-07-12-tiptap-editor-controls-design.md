# Tiptap Editor Controls Design

## Goal

Make the existing post editor easier to scan without changing the saved HTML shape.

## Changes

- Replace the inline text color hex buttons with one `글자색` button.
- Open a compact 10-color swatch palette from that button.
- Move font family and font size controls to the bottom of the toolbar as dropdowns.
- Style generated code blocks as a dark code window with a top bar and non-functional window dots.

## Non-goals

- No new Tiptap package or icon package.
- No syntax highlighting engine yet.
- No language picker yet; the code block label is visual only.

## Verification

- Run the Svelte type checker.
- Run the existing unit test suite.
