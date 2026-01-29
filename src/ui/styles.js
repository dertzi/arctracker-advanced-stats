/**
 * Custom CSS to override ArcTracker's grid layout rules
 *
 * Problem: ArcTracker's CSS forces all grid children to span 1 column
 * Solution: Use namespaced classes with !important to regain control
 *
 * See docs/LAYOUT_FIX.md for full documentation
 */

/**
 * Inject custom styles into the page
 */
export function injectStyles() {
  // Check if styles already injected
  if (document.getElementById("arcStatsCustomStyles")) {
    return;
  }

  const styles = `
    /* =============================================================================
       ARC STATS CUSTOM GRID SYSTEM
       Overrides ArcTracker's forced grid-column rules with !important
       ============================================================================= */

    /* Base container styling */
    #arcStatsBlock {
      width: 100% !important;
      max-width: 100% !important;
    }

    /* 4-column grid (for 75%/25% or other layouts) */
    #arcStatsBlock .arc-row-4cols {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 0.75rem !important;
      width: 100% !important;
    }

    /* 2-column grid (for 50%/50% layouts) */
    #arcStatsBlock .arc-row-2cols {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 0.75rem !important;
      width: 100% !important;
    }

    /* Single column (full-width) */
    #arcStatsBlock .arc-row-1col {
      display: block !important;
      width: 100% !important;
    }

    /* Column span classes */
    #arcStatsBlock .arc-span-4 {
      grid-column: span 4 / span 4 !important;
    }

    #arcStatsBlock .arc-span-3 {
      grid-column: span 3 / span 3 !important;
    }

    #arcStatsBlock .arc-span-2 {
      grid-column: span 2 / span 2 !important;
    }

    #arcStatsBlock .arc-span-1 {
      grid-column: span 1 / span 1 !important;
    }

    /* Responsive behavior for tablets */
    @media (max-width: 768px) {
      #arcStatsBlock .arc-row-4cols {
        grid-template-columns: repeat(2, 1fr) !important;
      }

      #arcStatsBlock .arc-span-3 {
        grid-column: span 2 / span 2 !important;
      }
    }

    /* Responsive behavior for mobile */
    @media (max-width: 640px) {
      #arcStatsBlock .arc-row-4cols,
      #arcStatsBlock .arc-row-2cols {
        grid-template-columns: 1fr !important;
      }

      #arcStatsBlock .arc-span-4,
      #arcStatsBlock .arc-span-3,
      #arcStatsBlock .arc-span-2,
      #arcStatsBlock .arc-span-1 {
        grid-column: span 1 / span 1 !important;
      }
    }
  `;

  // Create style element with ID for reference
  const styleElement = document.createElement("style");
  styleElement.id = "arcStatsCustomStyles";
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);

  console.log("[ArcStats] Custom grid styles injected");
}
