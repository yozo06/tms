# Vayu Auto-Review — Full Run — 2026-03-26

## Overview

| Metric | Count |
|---|---|
| Total open PRs found | 28 |
| Skipped (yogesh.zope author) | 3 (PR#4552, #4553, #4495) |
| Conflicted — rebase requested | 1 (PR#4536) |
| Already reviewed (this session) | 1 (PR#4546) |
| PRs reviewed this run | 23 |
| Review comments posted | 9 total (1 rebase + 8 inline) |

---

## Rebase Requests

| PR | Author | Title |
|---|---|---|
| [#4536](https://bitbucket.juspay.net/projects/BZ/repos/vayu/pull-requests/4536) | bhumika.saluja | BZN-49091: feat: Set Better defaults for backend |

Commented: *"This PR has merge conflicts with the target branch. Please rebase onto the latest `beta` branch and resolve conflicts before this can be reviewed or merged."*

---

## PRIORITY 0 — CATS Test Integrity Violations (3 PRs flagged)

### 🔴 PR#4548 — BZ-1255: fix: Handling the order creation failure (swetha.s.001)
**File:** `scripts/cats/server/utils/httpMod.js:426`

Added a hardcoded mock response block for `/order/` endpoints that converts 401/403 auth failures into a fabricated 200 OK response with fake order data (`id`, `trackingUrl`, `cartId`, etc.). This bypasses auth requirements in CATS without fixing the root cause.

> *Why does this endpoint fail auth in CATS? Either set up proper auth in the test fixture or define 401 as a valid response in the path YAML under `doc/paths/`.*

---

### 🔴 PR#4512 — BZ-1289: fix: Make status field required in IndependentShop (kanaboina.vignesh)
**File:** `scripts/cats/server/utils/httpMod.js:327`

Adds mock server block for `/abandonment/v2` that intercepts 500 responses and replaces them with a fake `{"status": "success"}` 200. This masks a real server error in CATS.

> *Why is this endpoint returning 500 during CATS runs? The fix should be in the actual endpoint or the DB seed, not in the mock server.*

---

### 🟠 PR#4528 — BZ-1354: feat: enable cross-type CPO combinability (punyam.singh)
**File:** `scripts/cats/server/utils/httpMod.js:1147`

Converts 400 responses for customer-identity endpoints into fake 200 `{customerIdentities: []}`. The old code was a raw string replace (`400 Bad Request` → `200 OK`); the new code creates a proper mock body — improvement over old code, but still bypassing the real response.

> *If the endpoint legitimately returns 400 for unknown providers, declare that 400 in the path YAML with a proper schema instead of intercepting it here.*

---

## PRIORITY 1 — Architecture Violations (4 PRs flagged)

### PR#4510 — BZ-1281: fix: add logging and API fallback for variant metafield (aryan.singh)
**File:** `src/Vayu/Services/External/Shopify/Order/Main.hs:1004`

`CartItem.findCartItems` — a DB query from `Services/Internal/` — is called directly inside the External layer.

> *External should never touch the DB. Either accept cart items as a parameter passed from Product/Internal, or move this fetch to `Services/Internal/Platform/Order.hs`.*

---

### PR#4539 — BZ-184: fix: Add Manual_Address_Entry tag for new address (titan.a_1)
**File:** `src/Vayu/Services/External/Shopify/Utils.hs:1386`

`AddressMain.isAddressCreatedInSession` (an Internal service) is imported and called from within the External layer.

> *External should not depend on Internal. Lift this Redis check to the Internal/Platform caller and pass the result down as a parameter.*

---

### PR#4549 — CA-508: feat: Add POST /mandate/forceExecute/{mandateOrderId} (titan.a_1)
**File:** `src/Vayu/Product/Subscription/Main.hs:200`

`forceExecuteMandateByOrderId` in Product calls `EulerMandate.callEulerMandateStatus` (External) directly — same pattern as the previously flagged `revokeMandate` in PR#4546.

> *Product should not call External directly. Wrap Euler mandate calls in `Services/Internal/Euler/Mandate.hs`. See `Services/Internal/Platform/Shopify.hs` for the abstraction pattern.*

---

### PR#4544 — BZ-1420: inventory optimisation db queries and redis cache (harshita.rupani)
**File:** `src/Vayu/Services/External/Shopify/Inventory.hs:332`

`Zone.getShippingZonesWithIds` is defined in `Product/Shipping/Zone.hs`. External calling Product is a layer inversion.

> *Can `getShippingZonesWithIds` be moved to `Services/Internal/Shipping/Zone/` so External/Inventory can call it from Internal instead?*

---

## PRIORITY 5 — Performance (1 PR flagged)

### PR#4535 — BZ-520: feat: add GET endpoint to fetch customer subscriptions (harshita.rupani)
**File:** `src/Vayu/Product/Subscription/Main.hs:148`

`enrichSubscription` fires 3+ DB queries per subscription (order lookup, cart fetch, address fetch) inside a `mapM` loop — classic N+1 pattern.

> *Batch-fetch orders, carts, and addresses upfront using their IDs and build HashMap lookup maps, similar to the pattern in `Product/Shipping/Zone.hs`.*

---

## PRs Reviewed with No Comments

These PRs were reviewed and found clean (no violations in the changed code):

| PR | Author | Title |
|---|---|---|
| #4554 | swetha.s.001 | BZ-1293: filter zero-quantity items in cart |
| #4542 | mohit.radadiya | BZ-1418: Simplify Offer Dashboard APIs architecture |
| #4550 | kanaboina.vignesh | BZ-284: atomic surcharge update |
| #4484 | sabarish.m | BZN-48810: signature-verified bundle price |
| #4551 | ganipudi.yugesh | BZ-1658: pass clientIp in Shopify storefront |
| #4447 | sahil.tyagi | BZ-416: parallel/batched cart mutation |
| #4547 | rajarshi.pal | BZ-1641: behavioral validation in CATS |
| #4540 | shreyash.gupta | BZ-1278: subscription fields in notes |
| #4494 | titan.a_1 | BZ-1217: Flipkart lastUsedDate fallback |
| #4543 | bhumika.saluja | BZ-1436: revert free gift support |
| #4453 | priyanshi.shivhare | BZ-48606: fix putOffer tax update |
| #4541 | titan.a_1 | BZ-1412: GV amount to note_attributes |
| #4516 | titan.a_1 | BZ-1302: findActiveOrInactiveAddressWithId |
| #4530 | akkul.gautam | BZ-1360: add/delete multiple shops |
| #4521 | titan.a_1 | BZ-1225: cluster products with add-ons |

---

## Key Themes This Run

1. **CATS mock server is becoming a dumping ground.** Three separate PRs this run added mock response interception in `httpMod.js` to convert errors (401, 400, 500) into fake successes. The pattern needs to stop — each case has a proper fix via the OpenAPI spec or test setup.

2. **Product→External and External→Internal calls are recurring.** The three-layer boundary keeps getting breached. The pattern of Product calling External directly for Euler API calls is now in at least 3 PRs (4546, 4549, and likely others). An Internal wrapper for Euler mandate APIs would resolve this permanently.

3. **External layer accumulating DB access.** PR#4510 adds a DB query (`CartItem.findCartItems`) directly in the External/Shopify/Order module, continuing a pattern of External modules reaching into Internal DB layers.

---

*Generated by vayu-pr-review scheduled task | 2026-03-26 16:xx IST*
