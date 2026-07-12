# Code Block and Table Picker Design

## Goal

Make rich editor content look correct after the post is saved, and make table insertion more flexible.

## Changes

- Apply code block display styles to the saved post body, not only the editor surface.
- Replace the fixed table button action with a 10 by 10 picker.
- Highlight cells from the top-left corner on hover.
- Insert the selected table size on click.

## Non-goals

- No syntax highlighter.
- No table resizing or cell editing toolbar.
- No shared CSS extraction yet; duplicate the small display CSS where it is rendered.
