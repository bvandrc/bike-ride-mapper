# React conventions

Builds on the language-level rules in `./typescript.md` — follow those too.

- **File naming**: PascalCase for component primitives (`DropdownMenu.tsx`), camelCase for hooks (`useSession.tsx`, `useSettings.ts`); use `.tsx` when the file exports JSX.
- **Components**: Arrow-function `const` with a named export. Default exports only where something requires one (e.g. page components for lazy-loaded routes).
- **Component props**
  - **DOM prop types**: When a component wraps a DOM element and passes props through to it, compose from that element's prop types — extend them, or `Pick`/`Omit` the parts you need — rather than re-declaring the fields like `className`, `type`, `href`, etc.
  - **Component prop types**: Same goes for when a component passes props through to another component, whether ours or an external package's — export the inner component's props as `<ComponentName>Props` and compose from them with `Pick`/`Omit` rather than re-declaring the fields.
  - **Spreading props**: When there are many pass-through props to an inner component or element, spread them to it. (For one or two, name them explicitly.)
- **Styling**
  - **Variant styling**: Map variants to classes in a module-level constant (`satisfies Record<Variant, string>`) and index into it — not conditionals inside JSX.
  - **Tailwind sizing**: Use the `size-X` Tailwind class, not `w-X h-X`.
- **usehooks-ts**: Keep in mind that we can use this package for hooks (`useEventListener`, `useMediaQuery`, ...). Never use `useBoolean` — plain `useState` is no more code.
- **Test IDs**: Use `data-testid` as the HTML attribute *and* as the prop name in component interfaces (not `testId`).
- **Accessible names**: If an `aria-label`'s value would just repeat text already visible in a nearby element (e.g. a row label, column header, or adjacent title), use `aria-labelledby` pointing at that existing element's `id` (add one via React's `useId` if it doesn't have one) instead of duplicating the string. Don't introduce a new `sr-only` element just to make this work — if there's no existing visible text to point to, a plain `aria-label` is fine.
