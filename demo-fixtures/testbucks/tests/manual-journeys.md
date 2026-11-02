# Optional starting test inventory

- Search and filter the menu; recover from no matching drinks.
- Customize size, milk, extra shot and quantity; reconcile displayed and cart prices.
- Exercise quantities 0, 1, 10 and 11 using the UI.
- Apply BREW10 once and repeatedly; verify discount and tax rounding.
- Decline and timeout checkout; confirm the cart survives and no order is created.
- Complete a synthetic order, reload, then cancel it; confirm history persists.
- Navigate with the keyboard and inspect a narrow mobile viewport.

Run each check before assigning an outcome. This file supplies test intent only.
# Expanded journeys (October 23, 2026)

These are test candidates, not recorded passes. Use synthetic names only.

1. Combine plant-based, tea category, and price sorting; verify the results and no-match case. Save/remove a favorite and reload with favorites-only enabled.
2. Confirm the sold-out Pumpkin latte cannot be customized. A caffeine-free base with an extra shot must not be represented as a caffeine-free finished drink.
3. Customize a latte with oat milk and extra shot: $6.05 subtotal / $6.66 taxed. Edit it from the cart and test quantities 0, 1, 10, 11, fractional, and blank.
4. Apply BREW10: $6.05 becomes $5.98 taxed. An invalid replacement code removes the discount. Confirm the checkout summary matches.
5. Decline and timeout create no order and preserve the cart. Retry successfully. Repeated submit creates one order; leaving checkout during processing creates none.
6. Advance an order through confirmed, preparing, ready, collected. No points before collection; 10 points per dollar paid, rounded down, after collection. Repeated collection must not earn twice.
7. Earn at least 100 points, redeem $2, and cancel the new uncollected order. Confirm exact restoration, not an extra reward. Collected orders cannot be cancelled.
8. Reorder into a nonempty cart, edit the new items, and confirm historical items/prices are unchanged. Test the 30-line limit without partial addition.
9. Reload orders/favorites, then reset with both Cancel and Confirm. Verify unrelated browser storage is untouched. A server restart intentionally starts a fresh session.
10. Test keyboard navigation, Escape and focus on the customization dialog, live status announcements, narrow iPhone-sized layouts, and reduced motion. Inspect actual evidence before reporting a pass.

