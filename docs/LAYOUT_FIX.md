# 📄 **ArcTracker Userscript Layout Issue — Root Cause & Solution**

## ❗ Problem Summary

When injecting custom UI elements into ArcTracker (inside `<div data-slot="card-content">`), any grid-based layout — especially `col-span-*` Tailwind classes — fails to behave correctly.

Typical symptoms:

- A `grid grid-cols-4` container renders fine
- But child items always act as **1-column items**, regardless of `col-span-*`
- Intended layouts like **75% / 25%** collapse into:
  ```
  [Card A][Card B][Empty][Empty]
  ```
- Changing `md:col-span-*` or `lg:col-span-*` does nothing
- Adding width, breakpoints, flex, or Tailwind utilities has no effect

## ❗ Root Cause

ArcTracker's internal CSS (based on Shadcn / Radix UI) includes **high-specificity grid rules** inside the card-content area.

These rules forcibly override **all `grid-column` values** on children of grid containers, something like:

```css
[data-slot="card-content"] > div {
  grid-column: span 1 / span 1 !important;
}
```

This means:

- Your injected elements **are always forced to span only 1 column**
- Tailwind's classes (`col-span-3`, `col-span-1`) are **ignored**
- The grid always displays your blocks in the first 1–2 columns
- Even though your grid columns themselves (`repeat(4, 1fr)`) _do_ exist

**The spans were being overwritten, not the grid.**

## ✔ How We Confirmed the Cause

A diagnostic test using inline overrides:

```js
combined.style.setProperty("grid-column", "span 3 / span 3", "important");
summary.style.setProperty("grid-column", "span 1 / span 1", "important");
```

immediately snapped the layout into the correct 75% / 25% structure.

This proved that the site's CSS was overriding spans.

## ✔ Permanent Solution

Override ArcTracker's forced grid rules by applying your own **inline grid-column rules with `!important`**.

### Our Implementation

We created a custom CSS module that injects styles using namespaced classes:

**File: `src/ui/styles.js`**

```js
export function injectStyles() {
  // Check if styles already injected
  if (document.getElementById("arcStatsCustomStyles")) {
    return;
  }

  const styles = `
    /* Custom grid system with !important overrides */
    #arcStatsBlock .arc-row-4cols {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 0.75rem !important;
    }

    #arcStatsBlock .arc-row-2cols {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 0.75rem !important;
    }

    #arcStatsBlock .arc-span-3 {
      grid-column: span 3 / span 3 !important;
    }

    #arcStatsBlock .arc-span-1 {
      grid-column: span 1 / span 1 !important;
    }

    /* Responsive behavior */
    @media (max-width: 640px) {
      #arcStatsBlock .arc-row-4cols,
      #arcStatsBlock .arc-row-2cols {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.id = "arcStatsCustomStyles";
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
```

Then in your HTML structure:

```html
<div id="arcStatsBlock">
  <div class="arc-row-4cols">
    <div class="arc-span-3 ...">Combined Stats (75%)</div>
    <div class="arc-span-1 ...">Raid Summary (25%)</div>
  </div>
</div>
```

## ✔ Why This Works

- **High specificity** — `#arcStatsBlock .arc-*` beats generic selectors
- **`!important` override** — Ensures your spans take precedence over ArcTracker's rules
- **Namespaced classes** — `arc-*` prefix avoids conflicts with site classes
- **DOM-injected styles** — Using `document.head.appendChild` ensures styles load before UI rendering
- Restores full control of grid layouts within injected content

## 💡 Best Practices for Future Injected Layouts

1. **Never rely on Tailwind's `col-span-*` inside ArcTracker** — always assume spans may be overridden.

2. **Use namespaced classes with inline CSS overrides** for grid control.

3. **Test spans using devtools**:

   ```js
   getComputedStyle(element).gridColumn;
   ```

4. **If spans read "auto / auto", the site has overridden them.**

5. Use your own CSS layer (via `document.head.appendChild` or `GM_addStyle` in userscript environments) to regain control of layout.

## 🎯 Adding New Grid Layouts

To add new grid layouts in the future:

1. **Add new grid container class** in `src/ui/styles.js`:

   ```css
   #arcStatsBlock .arc-row-3cols {
     display: grid !important;
     grid-template-columns: repeat(3, 1fr) !important;
     gap: 0.75rem !important;
   }
   ```

2. **Add any new span classes** you need:

   ```css
   #arcStatsBlock .arc-span-2 {
     grid-column: span 2 / span 2 !important;
   }
   ```

3. **Use in your HTML** structure:

   ```html
   <div class="arc-row-3cols">
     <div class="arc-span-2">Wide card (66%)</div>
     <div class="arc-span-1">Narrow card (33%)</div>
   </div>
   ```

4. **Don't forget responsive behavior** if needed:
   ```css
   @media (max-width: 768px) {
     #arcStatsBlock .arc-row-3cols {
       grid-template-columns: 1fr !important;
     }
   }
   ```

## 📊 Current Layout Structure

### Row 1: 75% / 25% Layout

- Container: `arc-row-4cols` (4-column grid)
- Combined Stats: `arc-span-3` (spans 3 columns = 75%)
- Raid Summary: `arc-span-1` (spans 1 column = 25%)

### Row 2: Full Width

- Single container, no grid (profit chart)

### Row 3: 50% / 50% Layout

- Container: `arc-row-2cols` (2-column grid)
- Histogram: `arc-span-1` (spans 1 column = 50%)
- Map Stats: `arc-span-1` (spans 1 column = 50%)

## 🔍 Troubleshooting

### Layout still not working?

1. Check if styles are injected:
   ```js
   document.getElementById("arcStatsCustomStyles");
   ```
2. Inspect computed grid-column values:
   ```js
   getComputedStyle(element).gridColumn;
   ```
3. Verify `!important` is present in your CSS
4. Check browser console for CSS conflicts or errors
5. Ensure `injectStyles()` is called before `renderStatsUI()`

---

**Last Updated:** January 29, 2026  
**Userscript Environment:** ViolentMonkey  
**ArcTracker Version:** Compatible with Shadcn/Radix UI based layouts
