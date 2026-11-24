# React conventions

Builds on `./typescript.md`; follow it too.

- **File naming**: PascalCase for component primitives (`DropdownMenu.tsx`), camelCase for hooks (`useSession.tsx`, `useSettings.ts`), and `.tsx` when the file exports JSX.
- **Components**: Arrow-function `const` with a named export. Default exports only where something requires one (e.g. lazy-loaded route pages).
- **Folder layout**: Applies wherever the source root is (`src/`, `client/src/`, ...), and to pages and context providers the same as to components.
  - **Shared hooks and lib**: The source root's `hooks/` (React hooks) and `lib/` (non-React helpers) hold modules that are generic by nature or used by more than one component. A generic module goes there even if only one component uses it today.
  - **Private hooks and lib**: A module that only makes sense for one component lives in that component's folder:

    ```
    components/<Name>/
      <Name>.tsx   the component itself
      index.ts     re-exports what code outside the folder uses, and nothing else
      hooks/       hooks only <Name> uses
      lib/         non-React helpers only <Name> uses
      __tests__/
    ```

    - **Folder only when needed**: A component with nothing private stays a single file until it gets its first private module.
    - **Import through the index**: Code outside the folder imports from its `index.ts`, never from its `hooks/` or `lib/`. The index carries a `biome-ignore lint/performance/noBarrelFile` with its reason, since the shared Biome config forbids barrels elsewhere. Where going through the index would close an import cycle, import the file directly.
    - **A second consumer promotes it**: A private module that gains a consumer outside its folder moves up to the shared `hooks/` or `lib/`.
    - **Grouping folders**: A folder that only groups components (`pages/`, `primitives/`, `forms/`) takes no `index.ts`.
- **React namespace**
  - **Types**: Off the namespace (`React.ReactNode`, `React.ComponentProps<'div'>`), never imported by name: the `React` global needs no import for a type.
  - **Values**: Imported by name (`import { useId, forwardRef } from 'react'`), never off the namespace.
- **Component props**
  - **DOM prop types**: A component that passes props through to a DOM element composes from that element's prop types (extend, `Pick`, or `Omit`) rather than redeclaring fields like `className` or `href`.
  - **Component prop types**: The same for props passed through to another component, ours or a package's: export the inner component's props as `<ComponentName>Props` and compose from them.
  - **Spreading props**: Spread many pass-through props; name one or two explicitly.
  - **Children**: Declare `children: React.ReactNode` yourself, not `React.PropsWithChildren`, which makes it optional. Mark it optional only where the component is meant to render without any. Put it last in the props type.
- **Styling**
  - **Variant styling**: Styling variants (`variant`, `size`, ...) go through [`cva`](https://cva.style), typed with its `VariantProps`. A `cva` with no variants is just base classes: pass them to `cn` instead. Any other value-to-classes mapping is a module-level constant indexed into, never conditionals inside JSX.
  - **Tailwind sizing**: `size-X`, not `w-X h-X`.
  - **Commenting a `className`**: A comment above a `className` string or `cn(...)` call must describe all of it. A comment that explains only one class or group moves that group into its own `cn()` argument and sits directly above it.
- **Available packages**: Every React repo should have these installed. Check them before writing your own.
  - **[usehooks-ts](https://usehooks-ts.com)**: General-purpose hooks. Never `useBoolean`; plain `useState` is no more code.
  - **[@bvandrc/react-toolkit](https://github.com/bvandrc/react-toolkit#readme)**: Our own UI behavior hooks and helpers: viewport and device, page lifecycle, scrolling, focus, press and toggle, input, state and timing, and one active tab at a time, plus helpers for sharing and device IDs, and Tailwind's breakpoints as constants. Check its README first.
    - Its `test-support` entry point has Vitest mocks for browser APIs test DOMs lack (`matchMedia`, `visualViewport`, `ResizeObserver`, ...). Use them rather than your own.
- **Test IDs**: `data-testid` as both the HTML attribute and the prop name (not `testId`).
- **Accessible names**: Where an `aria-label` would repeat visible text nearby (a row label, column header, or title), use `aria-labelledby` pointing at that element's `id` (adding one with `useId` if needed). Don't add an `sr-only` element for it; with no visible text to point to, a plain `aria-label` is fine.
