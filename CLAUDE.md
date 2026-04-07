# CLAUDE.md — Frontend Website Rules for EVIMES

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.
- [cite_start]**Brand Mission:** Focus on digitalizing local Madrid businesses while maintaining their physical identity[cite: 4, 15].

## Brand Guidance & Assets
- [cite_start]**Project Name:** EVIMES[cite: 20].
- [cite_start]**Slogan:** "Digitalizando tu local"[cite: 20].
- **Core Palette:** - **Navy (Azul Marino):** `#1c2143` — Use for authority and trust.
    - **Cyan (Azul Eléctrico):** `#4aadaa` — Use for CTAs and innovation.
    - **White:** `#ffffff` — For transparency and order.
    - **Light Grey:** `#d9d9d9` — For professional equilibrium.
- **Typography:**
    - **Headings:** `Libre Baskerville` (Serif) — conveys tradition.
    - **Body:** Pair with a clean Sans-serif (e.g., Inter) for high readability.
- [cite_start]**Target Audience:** Local shop owners in Madrid (Ages 25–80)[cite: 14, 15]. [cite_start]Keep copy jargon-free for those with limited tech knowledge[cite: 17].

## Reference Images
- Match layout, spacing, and typography exactly if a reference is provided.
- If no reference: design from scratch using the EVIMES Navy/Cyan palette.
- Do at least 2 comparison rounds using screenshots.

## Local Server & Screenshot Workflow
- **Always serve on localhost** at `http://localhost:3000`.
- Start server: `node serve.mjs`.
- Screenshot: `node screenshot.mjs http://localhost:3000`.
- Analyze screenshots for spacing, exact hex colors, and alignment.

## Output Defaults
- Single `index.html` file with Tailwind CSS via CDN.
- Mobile-first responsive design.
- Use `https://placehold.co/` for placeholder images.

## Anti-Generic Guardrails (EVIMES Edition)
- **Colors:** Never use default Tailwind colors; use Navy `#1c2143` and Cyan `#4aadaa`.
- **Shadows:** Use layered, Navy-tinted shadows with low opacity.
- [cite_start]**Typography:** Tight tracking (`-0.03em`) on headings; generous line-height (`1.7`) for body text[cite: 17].
- **Interactive states:** Every clickable element needs hover and active states.

## Hard Rules
- Do not use `transition-all`.
- Do not use default Tailwind blue/indigo as primary color.

## Logo Rules (NEVER FORGET)
- ALL logo files have black backgrounds
- ALWAYS apply `mix-blend-mode: screen` AND `filter: brightness(2)` to every logo img element on the page
- WITHOUT these two properties logos are invisible on dark backgrounds
- This applies to: nav, hero, loader, footer, any section with a logo

## Logo Files (clean paths, no spaces)
| File | Usage |
|------|-------|
| `/assets/EVIMES_EH-logo.png` | Nav logo, hero parallax layers |
| `/assets/grey-eh-logo.svg`   | Loading screen (grey EH + EVIMES text) |
| `/assets/evimes-logo.svg`    | Animated EVIMES wordmark |

## Asset Path Rule
- All `src` paths must start with `/assets/` (absolute from server root)
- Never use `assets/` without leading slash — breaks when served
