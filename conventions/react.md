# React conventions

Builds on the language-level rules in `./typescript.md` — follow those too.

- **File naming**: PascalCase for component primitives (`DropdownMenu.tsx`), camelCase for hooks (`useSession.tsx`, `useSettings.ts`); use `.tsx` when the file exports JSX.
- **Components**: Arrow-function `const` with a named export. Default exports only where something requires one (e.g. page components for lazy-loaded routes).
- **Folder layout**: Applies wherever the source root is (`src/`, `client/src/`, ...), and to pages and context providers the same as to components.
  - **Shared hooks and lib**: The source root holds a `hooks/` folder for React hooks and a `lib/` folder for non-React helpers. Both are for modules that are generic by nature (i.e., several components could easily use them) or that more than one component uses. A generic module goes here even if only one component uses it today: the private folders below are for what shouldn't be reused, not for what merely hasn't been yet.
  - **Private hooks and lib**: A hook or lib module that only makes sense for one component lives in that component's own folder, rather than in the shared `hooks/` or `lib/`. The folder says the module is not for reuse, which a shared folder can't say.

    ```
    components/<Name>/
      <Name>.tsx   the component itself
      index.ts     re-exports what code outside the folder uses, and nothing else
      hooks/       hooks only <Name> uses
      lib/         non-React helpers only <Name> uses
      __tests__/
    ```
    - **Folder only when needed**: A component with nothing private stays a single file. It moves into a folder when it first gets a private module.
    - **Import through the index**: Code outside the folder imports from the folder (its `index.ts`), never from its `hooks/` or `lib/` directly. The index carries a `biome-ignore lint/performance/noBarrelFile` with its reason, since the shared Biome config forbids barrels everywhere else. The one exception is where going through the index would close an import cycle: there, import the file directly.
    - **A second consumer promotes it**: When a private module gains a consumer outside its folder, move it up to the shared `hooks/` or `lib/` rather than importing into another component's folder.
    - **Grouping folders**: A folder that only groups related components (`pages/`, `primitives/`, `forms/`) belongs to no one component, so it takes no `index.ts`.
- **React namespace**
  - **Types**: Reach them off the namespace — `React.ReactNode`, `React.ComponentProps<'div'>` — never by importing the name. A type reference to the `React` global needs no import where a value reference does, so there is no import line to keep in step as a file's types change.
  - **Values**: Import these by name (`import { useId, forwardRef } from 'react'`), never off the namespace, so a bundler can drop what a file doesn't use.
- **Component props**
  - **DOM prop types**: When a component wraps a DOM element and passes props through to it, compose from that element's prop types — extend them, or `Pick`/`Omit` the parts you need — rather than re-declaring the fields like `className`, `type`, `href`, etc.
  - **Component prop types**: Same goes for when a component passes props through to another component, whether ours or an external package's — export the inner component's props as `<ComponentName>Props` and compose from them with `Pick`/`Omit` rather than re-declaring the fields.
  - **Spreading props**: When there are many pass-through props to an inner component or element, spread them to it. (For one or two, name them explicitly.)
  - **Children**: Declare `children: React.ReactNode` on the props type yourself rather than reaching for `React.PropsWithChildren`, which makes it optional — a component that renders its children should fail to compile when a caller leaves them out. Mark it optional only where the component is meant to render without any. Put it last in the props type, the same place it lands in JSX: after every attribute.
- **Styling**
  - **Variant styling**: Map variants to classes in a module-level constant (`satisfies Record<Variant, string>`) and index into it — not conditionals inside JSX.
  - **Tailwind sizing**: Use the `size-X` Tailwind class, not `w-X h-X`.
  - **Commenting a `className`**: A comment above a `className` string, or a `cn(...)` call, must describe the whole string that follows it. If it only explains one class or a subgroup, split that class or subgroup into its own `cn()` argument and move the comment to sit directly above just that argument, rather than leaving it above the full multi-class string it doesn't fully describe.

    ```tsx
    // Before: the comment only explains the focus ring, not the rest of the string.
    className={cn(
      // Focus ring matches the button's own.
      'flex w-full items-center rounded-md border px-3 py-2 text-base focus:outline-none focus:ring-2 md:px-4 md:text-sm',
      className
    )}

    // After: the focus and breakpoint classes get their own arguments, with the
    // comment directly above the one it explains.
    className={cn(
      'flex w-full items-center rounded-md border px-3 py-2 text-base',
      // Focus ring matches the button's own.
      'focus:outline-none focus:ring-2',
      'md:px-4 md:text-sm',
      className
    )}
    ```
- **usehooks-ts**: Keep in mind that we can use this package for hooks (`useEventListener`, `useMediaQuery`, ...). Never use `useBoolean` — plain `useState` is no more code.
- **Test IDs**: Use `data-testid` as the HTML attribute *and* as the prop name in component interfaces (not `testId`).
- **Accessible names**: If an `aria-label`'s value would just repeat text already visible in a nearby element (e.g. a row label, column header, or adjacent title), use `aria-labelledby` pointing at that existing element's `id` (add one via React's `useId` if it doesn't have one) instead of duplicating the string. Don't introduce a new `sr-only` element just to make this work — if there's no existing visible text to point to, a plain `aria-label` is fine.
