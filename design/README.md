# Design source assets

Originals that the shipped assets are derived from. **Nothing here is served** —
these are kept so the production assets can be regenerated without going back
to git history.

Do not delete these because they look unreferenced. They are unreferenced by
design; that is what "source asset" means.

## Contents

### `veyra-lockup-source.png`

The Veyra lockup: V ribbon + wordmark, on white, with generous whitespace
padding.

| | |
|---|---|
| Dimensions | 1881 × 836 (ratio 2.250) |
| Size | 750 KB |

**Derived production assets**, both in `frontend/public/`:

| File | Dimensions | Notes |
|---|---|---|
| `veyra-logo.png` | 1458 × 379 | Dark wordmark, trimmed. For light surfaces. |
| `veyra-logo-white.png` | 1458 × 379 | White wordmark. For dark surfaces. |

Both are the same lockup trimmed to the artwork — hence the tighter 3.847
ratio, which `frontend/components/Logo.tsx` hardcodes as:

```ts
const LOCKUP_RATIO = 1458 / 379;
```

If you re-crop the source, that constant has to change with it, or the header
and footer logos will render at the wrong aspect ratio.

`frontend/public/veyra-symbol.png` (475 × 355) is the standalone V mark, not a
crop of this file.

## Note on file sizes

The production PNGs look heavy (120–200 KB), but they are served through
`next/image`, which resizes them and emits WebP/AVIF. What actually reaches a
browser is the optimised derivative at the requested width, not these files.
