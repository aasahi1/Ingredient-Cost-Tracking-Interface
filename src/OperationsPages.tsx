import { useState } from "react";
import { A, inventoryRecords } from "./demo-data";
import Metric from "./Metric";

type ExpiryIngredient = {
  id: number;
  name: string;
  quantity: string;
  expires: string;
  days: number;
  value: number;
  source: string;
  location: string;
  uses: string[];
  urgency: "Use today" | "Use soon" | "Plan ahead";
  state: "active" | "used" | "wasted";
  prioritized: boolean;
};

const initialExpiryIngredients: ExpiryIngredient[] = [
  { id: 1, name: "Heavy cream", quantity: "1.4 L remaining", expires: "Jul 15, 2025", days: 1, value: 8.26, source: "Sunshine Dairy Co. · PO #2229", location: "Fridge 1", uses: ["Strawberry Shortcake Parfait", "Coffee Cream Parfait", "Mango Yuzu Parfait"], urgency: "Use today", state: "active", prioritized: false },
  { id: 2, name: "Blueberry compote", quantity: "480 g remaining", expires: "Jul 18, 2025", days: 4, value: 2.3, source: "Berry & Bloom Farm · PO #2218", location: "Fridge 2", uses: ["Blueberry Lemon Parfait"], urgency: "Use soon", state: "active", prioritized: false },
  { id: 3, name: "Fresh strawberries", quantity: "6 kg remaining", expires: "Jul 18, 2025", days: 4, value: 38.4, source: "FreshFarm · PO #2234", location: "Cold room", uses: ["Strawberry Shortcake Parfait"], urgency: "Use soon", state: "active", prioritized: false },
  { id: 4, name: "Vanilla yogurt", quantity: "3.2 kg remaining", expires: "Jul 21, 2025", days: 7, value: 9.92, source: "Sunshine Dairy Co. · PO #2229", location: "Fridge 1", uses: ["Golden Caramel Parfait", "Blueberry Lemon Parfait", "Coffee Cream Parfait"], urgency: "Plan ahead", state: "active", prioritized: false },
];

function WasteRecorder({ item, onCancel, onConfirm }: { item: ExpiryIngredient; onCancel: () => void; onConfirm: (quantity: string, reason: string) => void }) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("Spoiled");
  const [reviewing, setReviewing] = useState(false);
  const available = Number.parseFloat(item.quantity);
  const unit = item.quantity.replace(/^[\d.]+\s*/, "").replace(" remaining", "");
  const validQuantity = Number(quantity) > 0 && Number(quantity) <= available;
  if (reviewing) return <div className="waste-confirmation" role="group" aria-labelledby={`waste-confirm-${item.id}`}>
    <div><h3 id={`waste-confirm-${item.id}`}>Confirm demo waste entry</h3><p><b>{quantity} {unit}</b> of {item.name} will be marked as waste in this temporary view. No inventory record or report will be changed.</p><span>Reason: {reason}</span></div>
    <div><button className="secondary-button" onClick={() => setReviewing(false)}>Go back</button><button className="waste-confirm-button" onClick={() => onConfirm(quantity, reason)}>Confirm waste</button></div>
  </div>;
  return <div className="waste-form"><div><h3>Record waste</h3><p>Enter a quantity up to the available {item.quantity}.</p></div><label>Quantity wasted ({unit})<input type="number" min="0.01" max={available} step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} aria-invalid={Boolean(quantity) && !validQuantity} /></label><label>Reason<select value={reason} onChange={(event) => setReason(event.target.value)}><option>Spoiled</option><option>Quality issue</option><option>Preparation waste</option><option>Other</option></select></label><div><button className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={!validQuantity} onClick={() => setReviewing(true)}>Review waste</button></div></div>;
}

export function InventoryPage({ onNavigate, onAction, onSupplierFor, onOpenRecipe, onCreateFlavor }: { onNavigate: (page: string) => void; onAction: (label: string) => void; onSupplierFor: (ingredient: string) => void; onOpenRecipe: (recipe: string) => void; onCreateFlavor: (ingredient: string) => void }) {
  const [view, setView] = useState("Near expiry");
  const [ingredients, setIngredients] = useState(initialExpiryIngredients);
  const [expanded, setExpanded] = useState(1);
  const [filter, setFilter] = useState("Active");
  const [sort, setSort] = useState("urgency");
  const [wasteId, setWasteId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const active = ingredients.filter((item) => item.state === "active");
  const valueAtRisk = active.reduce((sum, item) => sum + item.value, 0);
  const shown = ingredients
    .filter((item) => filter === "All" || (filter === "Active" ? item.state === "active" : item.state !== "active"))
    .sort((a, b) => sort === "value" ? b.value - a.value : a.days - b.days);
  const update = (id: number, changes: Partial<ExpiryIngredient>, feedback: string) => {
    setIngredients((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
    setMessage(feedback);
  };
  const saveWaste = (item: ExpiryIngredient, quantity: string, reason: string) => {
    update(item.id, { state: "wasted" }, `${quantity} of ${item.name} marked as waste (${reason}) in this temporary demo view. No inventory record was changed.`);
    setWasteId(null);
  };
  return (
    <main className="inventory-page" id="main">
      <div className="page-heading">
        <div><h1>Inventory &amp; Expiry</h1><p>Use ingredients in time, plan production, and reduce avoidable waste.</p></div>
        <div className="heading-actions"><button className="secondary-button" onClick={() => onAction("Add inventory count")}>Update stock</button><button className="primary-button" onClick={() => onAction("Preview purchase order")}>Preview order</button></div>
      </div>
      <div className="inventory-nav" role="group" aria-label="Inventory views">{["Near expiry", "All inventory", "Low stock"].map((item) => <button aria-pressed={view === item} className={view === item ? "active" : ""} onClick={() => setView(item)} key={item}>{item}{item === "Near expiry" && <span>{active.length}</span>}</button>)}</div>
      {view === "Near expiry" ? <>
        <section className="expiry-summary" aria-label="Near expiry summary">
          <div><span>Needs attention</span><strong>{active.filter((item) => item.days <= 4).length} ingredients</strong><small>Expiring within 4 days</small></div>
          <div><span>Approximate value at risk</span><strong>${valueAtRisk.toFixed(2)}</strong><small>Based on quantity remaining</small></div>
          <div><span>Production priorities</span><strong>{active.filter((item) => item.prioritized).length}</strong><small>Added to upcoming production</small></div>
        </section>
        <div className="expiry-explainer"><span className="item-indicator red" /><div><b>Why this matters</b><p>Ingredients are ordered by urgency. Open an item to see its quantity, source, possible uses, and next steps.</p></div></div>
        <section aria-labelledby="near-expiry-title">
          <div className="expiry-toolbar">
            <div><h2 id="near-expiry-title">Near expiry</h2><p>Review the most urgent ingredients first.</p></div>
            <div><label>Show<select value={filter} onChange={(event) => setFilter(event.target.value)}><option>Active</option><option>Completed</option><option>All</option></select></label><label>Sort<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="urgency">Soonest expiry</option><option value="value">Highest value at risk</option></select></label></div>
          </div>
          <p className="sr-only" aria-live="polite">{message}</p>
          {message && <div className="update-feedback" role="status"><span className="data-health-dot" /><b>{message}</b><button onClick={() => setMessage("")}>Dismiss</button></div>}
          <div className="expiry-workflow">
            {shown.map((item) => {
              const isOpen = expanded === item.id;
              return <article className={`expiry-workflow-item ${item.state}`} key={item.id}>
                <button className="expiry-workflow-summary" onClick={() => setExpanded(isOpen ? 0 : item.id)} aria-expanded={isOpen}>
                  <span className={`urgency-badge ${item.urgency.toLowerCase().replace(/ /g, "-")}`}>{item.urgency}</span>
                  <span className="expiry-identity"><b>{item.name}</b><small>{item.quantity} · {item.location}</small></span>
                  <span><small>Expires</small><b>{item.expires}</b></span>
                  <span><small>Days left</small><b>{item.days} {item.days === 1 ? "day" : "days"}</b></span>
                  <span><small>Value at risk</small><b>${item.value.toFixed(2)}</b></span>
                  <span className="decision-chevron">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <div className="expiry-workflow-detail">
                  <div className="expiry-context"><div><span>Supplier &amp; location</span><b>{item.source} · {item.location}</b></div><div><span>Estimated ingredient value</span><b>${item.value.toFixed(2)} at current unit cost</b></div><div><span>Why it needs attention</span><b>{item.days <= 1 ? "Use today to avoid waste" : `${item.quantity} should be planned into production`}</b></div></div>
                  <div className="possible-uses"><div className="possible-uses-heading"><h3>Products using {item.name}</h3><button onClick={() => onNavigate("Recipes")}>View all recipes</button></div><ul>{item.uses.map((use) => <li key={use}><span>{use}</span><button onClick={() => onOpenRecipe(use)}>View recipe</button></li>)}</ul></div>
                  {wasteId === item.id ? <WasteRecorder item={item} onCancel={() => setWasteId(null)} onConfirm={(quantity, reason) => saveWaste(item, quantity, reason)} /> :
                  <div className="expiry-actions">
                    <button className="secondary-button" onClick={() => onSupplierFor(item.name)}>Compare supplier options</button>
                    <button className="secondary-button" onClick={() => onCreateFlavor(item.name)}>Create limited-time flavour</button>
                    <button className={item.prioritized ? "action-confirmed" : "secondary-button"} disabled={item.prioritized || item.state !== "active"} onClick={() => update(item.id, { prioritized: true }, `${item.name} prioritized for production.`)}>{item.prioritized ? "Prioritized for production" : "Prioritize in production"}</button>
                    <button className="secondary-button" disabled={item.state !== "active"} onClick={() => update(item.id, { state: "used" }, `${item.name} marked as used in this temporary demo view. No inventory record was changed.`)}>Mark as used</button>
                    <button className="waste-button" disabled={item.state !== "active"} onClick={() => setWasteId(item.id)}>Record waste</button>
                  </div>}
                </div>}
              </article>;
            })}
            {shown.length === 0 && <div className="expiry-empty"><b>No ingredients in this view</b><span>{filter === "Completed" ? "Used and wasted ingredients will appear here." : "Nothing currently needs expiry attention."}</span></div>}
          </div>
        </section>
      </> : <InventoryStockView lowOnly={view === "Low stock"} onAction={onAction} onSupplierFor={onSupplierFor} onOpenRecipe={onOpenRecipe} />}
    </main>
  );
}

function InventoryStockView({ lowOnly, onAction, onSupplierFor, onOpenRecipe }: { lowOnly: boolean; onAction: (label: string) => void; onSupplierFor: (ingredient: string) => void; onOpenRecipe: (recipe: string) => void }) {
  const stock = inventoryRecords.filter((item) => !lowOnly || item.status === "Low stock");
  return <section className="stock-view"><div className="section-bar"><div><h2>{lowOnly ? "Low-stock ingredients" : "All inventory"}</h2><p>Quantities, supplier cost, expiry, and recent stock movement.</p></div></div><div className="table-wrap workspace-table"><table><thead><tr><th>Ingredient</th><th>On hand</th><th>Supplier</th><th>Cost / unit</th><th>Expiry</th><th>Status</th><th>Recent change</th><th>Used in</th><th>Action</th></tr></thead><tbody>{stock.map((item) => <tr key={item.name}><td><b>{item.name}</b><small>{item.location}</small></td><td><b>{item.quantity} {item.unit}</b></td><td>{item.supplier}</td><td>${item.unitCost.toFixed(2)}{item.costUnit}</td><td>{item.expiryDate}</td><td><span className={`status ${item.status.toLowerCase().replace(/ /g, "-")}`}>{item.status}</span></td><td>{item.recentChange}</td><td><div className="related-products">{item.products.map((product) => <button className="product-link" key={product} onClick={() => onOpenRecipe(product)}>{product}</button>)}</div></td><td><button className="table-action" onClick={() => item.status === "Low stock" ? onAction("Create purchase order") : onSupplierFor(item.name)}>{item.status === "Low stock" ? "Order" : "Supplier"}</button></td></tr>)}</tbody></table></div></section>;
}

type SupplierOffer = {
  id: string;
  supplier: string;
  price: number;
  priceLabel: string;
  available: string;
  unit: string;
  delivery: string;
  discount: string;
  previous: string;
};

const ingredientNeeds = [
  { id: "granola", name: "Granola", catalogName: "Granola · 1kg", reason: "Below minimum stock · about 2 days remaining", suggested: 4, offers: [
    { id: "gg-granola", supplier: "Golden Grain Supplies", price: 4.2, priceLabel: "$4.20/kg", available: "38 kg", unit: "1 kg bag", delivery: "Tomorrow · $12 delivery", discount: "No current discount", previous: "$4.20/kg" },
    { id: "sr-granola", supplier: "SweetRoots", price: 4.45, priceLabel: "$4.45/kg", available: "22 kg", unit: "1 kg bag", delivery: "Today by 4 PM · $18 delivery", discount: "5% off 10+ bags", previous: "$4.68/kg" },
    { id: "pc-granola", supplier: "Pantry Co.", price: 4.7, priceLabel: "$4.70/kg", available: "64 kg", unit: "2 kg bag", delivery: "2 days · free over $80", discount: "No current discount", previous: "$4.55/kg" },
  ] },
  { id: "cream", name: "Heavy cream", catalogName: "Heavy cream · 2L", reason: "1.4 L remaining · needed for daily parfait production", suggested: 3, offers: [
    { id: "sd-cream", supplier: "Sunshine Dairy Co.", price: 11.8, priceLabel: "$5.90/L", available: "24 cartons", unit: "2 L carton", delivery: "Tomorrow, 10–11 AM · free", discount: "Regular account price", previous: "$5.90/L" },
    { id: "pd-cream", supplier: "PeakDairy", price: 12.4, priceLabel: "$6.20/L", available: "18 cartons", unit: "2 L carton", delivery: "2 days · $10 delivery", discount: "No current discount", previous: "$5.25/L" },
  ] },
  { id: "strawberries", name: "Fresh strawberries", catalogName: "Fresh strawberries · 500g", reason: "6 kg remaining · weekly order due in 2 days", suggested: 10, offers: [
    { id: "ff-strawberries", supplier: "FreshFarm", price: 3.2, priceLabel: "$3.20/punnet", available: "42 punnets", unit: "500 g punnet", delivery: "2 days · free over $30", discount: "Best current price", previous: "$3.40/punnet" },
    { id: "sr-strawberries", supplier: "SweetRoots", price: 3.8, priceLabel: "$3.80/punnet", available: "68 punnets", unit: "500 g punnet", delivery: "Tomorrow · $8 delivery", discount: "10% off 20+ punnets", previous: "$4.20/punnet" },
    { id: "bb-strawberries", supplier: "Berry & Bloom Farm", price: 3.55, priceLabel: "$3.55/punnet", available: "30 punnets", unit: "500 g punnet", delivery: "Thursday · free", discount: "Seasonal price", previous: "Not available" },
  ] },
  { id: "compote", name: "Blueberry compote", catalogName: "Blueberry compote · 1kg", reason: "480 g on hand · expires in 4 days", suggested: 1, offers: [
    { id: "bb-compote", supplier: "Berry & Bloom Farm", price: 4.8, priceLabel: "$4.80/kg", available: "18 kg", unit: "1 kg tub", delivery: "Tomorrow · free over $40", discount: "Current account price", previous: "$4.80/kg" },
    { id: "ff-compote", supplier: "FreshFarm", price: 5.2, priceLabel: "$5.20/kg", available: "12 kg", unit: "1 kg tub", delivery: "2 days · free over $30", discount: "No current discount", previous: "$5.20/kg" },
  ] },
  { id: "matcha", name: "Matcha powder", catalogName: "Matcha powder · 1kg", reason: "3 kg on hand · current recipe ingredient", suggested: 1, offers: [
    { id: "ts-matcha", supplier: "TopSource", price: 5.1, priceLabel: "$5.10/kg", available: "12 kg", unit: "1 kg pouch", delivery: "3 days · free over $50", discount: "20% seasonal discount", previous: "$6.38/kg" },
    { id: "gg-matcha", supplier: "Golden Grain Supplies", price: 5.8, priceLabel: "$5.80/kg", available: "8 kg", unit: "1 kg pouch", delivery: "Tomorrow · $12 delivery", discount: "No current discount", previous: "$5.80/kg" },
  ] },
  { id: "mango", name: "Frozen mango", catalogName: "Frozen mango · 1kg", reason: "Supplier deal fits next week’s Mango Matcha Parfait", suggested: 8, offers: [
    { id: "sr-mango", supplier: "SweetRoots", price: 4.68, priceLabel: "$4.68/kg", available: "36 kg", unit: "1 kg bag", delivery: "3 days · free over $40", discount: "22% off through Friday", previous: "$6.00/kg" },
    { id: "ff-mango", supplier: "FreshFarm", price: 5.35, priceLabel: "$5.35/kg", available: "18 kg", unit: "1 kg bag", delivery: "2 days · free over $30", discount: "No current discount", previous: "$5.35/kg" },
  ] },
];

export function SuppliersPage({ onCreateOrder, initialNeed = "granola" }: { onCreateOrder: (supplier: string, items: PurchaseItem[]) => void; initialNeed?: string }) {
  const [needId, setNeedId] = useState(initialNeed);
  const need = ingredientNeeds.find((item) => item.id === needId) || ingredientNeeds[0];
  const [selectedOffers, setSelectedOffers] = useState<Record<string, string>>({ granola: "gg-granola", cream: "sd-cream", strawberries: "ff-strawberries", mango: "sr-mango", compote: "bb-compote", matcha: "ts-matcha" });
  const selected = need.offers.find((offer) => offer.id === selectedOffers[need.id]) || need.offers[0];
  const [quantity, setQuantity] = useState<Record<string, number>>({ granola: 4, cream: 3, strawberries: 10, mango: 8, compote: 1, matcha: 1 });
  const [draftSupplier, setDraftSupplier] = useState("");
  const [draft, setDraft] = useState<PurchaseItem[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const supplierDataState = "partial";
  const [confirmClear, setConfirmClear] = useState(false);
  const subtotal = draft.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const tax = subtotal * 0.08;
  const supplierConflict = Boolean(draftSupplier && draftSupplier !== selected.supplier);
  const chooseOffer = (offer: SupplierOffer) => setSelectedOffers((current) => ({ ...current, [need.id]: offer.id }));
  const addToDraft = () => {
    if (supplierConflict) return;
    setDraftSupplier(selected.supplier);
    setDraft((current) => {
      const existing = current.find((item) => item.ingredient === need.catalogName);
      return existing ? current.map((item) => item.ingredient === need.catalogName ? { ...item, quantity: quantity[need.id], price: selected.price } : item) : [...current, { id: Date.now(), ingredient: need.catalogName, quantity: quantity[need.id], price: selected.price }];
    });
    setMessage(`${need.name} added to the ${selected.supplier} order.`);
  };
  const updateDraftQuantity = (id: number, next: number) => setDraft((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, next) } : item));
  const clearDraft = () => { setDraft([]); setDraftSupplier(""); setConfirmClear(false); setMessage("Order draft cleared. No order was sent."); };
  const refreshSupplierData = () => setMessage("This demo uses sample supplier information. No supplier connection is configured.");
  return (
    <main className="suppliers-page" id="main">
      <div className="page-heading">
        <div><h1>Suppliers &amp; Purchasing</h1><p>Compare what affects your order, then create it without re-entering details.</p></div>
        <button className="primary-button" disabled={!draft.length} onClick={() => onCreateOrder(draftSupplier, draft)}>Preview order</button>
      </div>
      <p className="sr-only" aria-live="polite">{message}</p>
      <div className={`data-health ${supplierDataState}`} role="status" aria-live="polite">
        <span className="data-health-dot" />
        <div><b>Sample supplier information</b><small>Prices and delivery details are illustrative. No supplier connection is configured.</small></div>
        <button onClick={refreshSupplierData}>About this data</button>
      </div>
      <div className="purchasing-layout">
        <section className="supplier-compare-main" aria-labelledby="ingredient-need-title">
          <div className="need-selector">
            <div><span className="eyebrow">Ingredient need</span><h2 id="ingredient-need-title">What do you need to order?</h2></div>
            <div role="group" aria-label="Ingredients to compare">{ingredientNeeds.map((item) => <button aria-pressed={need.id === item.id} className={need.id === item.id ? "active" : ""} onClick={() => setNeedId(item.id)} key={item.id}><b>{item.name}</b><small>{item.reason}</small></button>)}</div>
          </div>
          <div className="compare-heading"><div><h2>Compare suppliers for {need.name}</h2><p>Prices apply to the listed unit size. Delivery charges are stated separately.</p></div><button className={saved.includes(need.id) ? "saved-button" : "secondary-button"} onClick={() => { const wasSaved = saved.includes(need.id); setSaved((current) => wasSaved ? current.filter((id) => id !== need.id) : [...current, need.id]); setMessage(wasSaved ? `${need.name} removed from saved items.` : `${need.name} saved for later.`); }}>{saved.includes(need.id) ? "Saved for later" : "Save for later"}</button></div>
          <div className="supplier-offers">
            <div className="supplier-offer header"><span>Select</span><span>Supplier</span><span>Price</span><span>Available</span><span>Unit size</span><span>Delivery</span><span>Discount &amp; history</span></div>
            {need.offers.map((offer) => <label className={selected.id === offer.id ? "supplier-offer selected" : "supplier-offer"} key={offer.id}>
              <span><input type="radio" name={`supplier-${need.id}`} checked={selected.id === offer.id} onChange={() => chooseOffer(offer)} /><span className="sr-only">Select {offer.supplier}</span></span>
              <b>{offer.supplier}</b><span><strong>{offer.priceLabel}</strong><small>{offer.previous === offer.priceLabel ? "Unchanged" : `Previous: ${offer.previous}`}</small></span>
              <span>{offer.available}</span><span>{offer.unit}</span><span>{offer.delivery}</span>
              <span><b className={offer.discount.includes("%") || offer.discount.includes("Best") ? "positive" : ""}>{offer.discount}</b><small>{offer.previous === "Not available" ? "No previous price" : `Previous: ${offer.previous}`}</small></span>
            </label>)}
          </div>
          <div className="supplier-selection">
            <div><span>Selected supplier</span><b>{selected.supplier}</b><small>{selected.priceLabel} · {selected.unit} · {selected.delivery}</small></div>
            <label>Quantity<input type="number" min="1" value={quantity[need.id]} onChange={(event) => setQuantity((current) => ({ ...current, [need.id]: Math.max(1, Number(event.target.value)) }))} /></label>
            <div className="selection-total"><span>Item subtotal</span><b>${(quantity[need.id] * selected.price).toFixed(2)}</b></div>
            <button className="primary-button" disabled={supplierConflict} onClick={addToDraft}>Add to order</button>
          </div>
          {supplierConflict && <div className="supplier-conflict" role="alert"><div><b>Your current draft is for {draftSupplier}.</b><span>Create or clear that order before adding an item from {selected.supplier}.</span></div><button onClick={() => setConfirmClear(true)}>Clear current draft</button></div>}
        </section>
        <aside className="order-draft-panel" aria-labelledby="draft-title">
          <div className="draft-heading"><div><span className="eyebrow">Order draft</span><h2 id="draft-title">{draftSupplier || "No supplier selected"}</h2></div>{draft.length > 0 && <button onClick={() => setConfirmClear(true)}>Clear</button>}</div>
          {confirmClear && <div className="draft-clear-confirm" role="alert"><b>Clear this order draft?</b><p>{draft.length} {draft.length === 1 ? "ingredient" : "ingredients"} and the quantity changes will be removed. Nothing has been sent to the supplier.</p><div><button onClick={() => setConfirmClear(false)}>Keep draft</button><button onClick={clearDraft}>Clear draft</button></div></div>}
          {draft.length === 0 ? <div className="draft-empty"><b>Your order is empty</b><p>Select a supplier, choose a quantity, and add an ingredient.</p></div> : <>
            <div className="draft-items">{draft.map((item) => <div className="draft-item" key={item.id}><span><b>{item.ingredient}</b><small>${item.price.toFixed(2)} per unit</small></span><label><span className="sr-only">Quantity for {item.ingredient}</span><input type="number" min="1" value={item.quantity} onChange={(event) => updateDraftQuantity(item.id, Number(event.target.value))} /></label><strong>${(item.quantity * item.price).toFixed(2)}</strong><button aria-label={`Remove ${item.ingredient}`} onClick={() => { const next = draft.filter((current) => current.id !== item.id); setDraft(next); if (!next.length) setDraftSupplier(""); }}>×</button></div>)}</div>
            <div className="draft-totals"><span>Subtotal<b>${subtotal.toFixed(2)}</b></span><span>Example tax (8%)<b>${tax.toFixed(2)}</b></span><strong>Total<b>${(subtotal + tax).toFixed(2)}</b></strong></div>
            <button className="primary-button create-draft-order" onClick={() => onCreateOrder(draftSupplier, draft)}>Preview order</button><p>This demo preview does not save or send an order.</p>
          </>}
          {saved.length > 0 && <div className="saved-needs"><h3>Saved for later</h3>{saved.map((id) => <button key={id} onClick={() => setNeedId(id)}>{ingredientNeeds.find((item) => item.id === id)?.name}<span>Compare</span></button>)}</div>}
        </aside>
      </div>
    </main>
  );
}

const flavorSteps = [
  "Discover opportunity",
  "Available ingredients",
  "Supplier prices",
  "Flavour combinations",
  "Ingredient cost",
  "Customer history",
  "Create product",
  "Preview",
  "Confirm & publish",
];

const flavorOpportunities = [
  { id: "strawberry", name: "Strawberry Chantilly Parfait", image: "parfait-strawberry.jpg", reason: "Uses heavy cream expiring tomorrow and strawberries expiring in 4 days.", signals: ["2 ingredients need using", "63 recorded comeback votes", "All ingredients available"] },
  { id: "mango", name: "Mango Matcha Parfait", image: "parfait-mango.jpg", reason: "Uses matcha currently discounted 20% and frozen mango discounted 22%.", signals: ["2 supplier discounts", "38 recorded votes", "Stock available"] },
  { id: "blueberry", name: "Blueberry Lemon Parfait", image: "parfait-berry.jpg", reason: "Uses 480 g of blueberry compote that expires in 4 days.", signals: ["Compote expires soon", "41 recorded votes", "No extra order needed"] },
];

export function FlavorLabPage({ onNavigate, initialOpportunity = "strawberry" }: { onNavigate: (page: string) => void; initialOpportunity?: string }) {
  const [step, setStep] = useState(0);
  const [opportunity, setOpportunity] = useState(() => flavorOpportunities.find((item) => item.id === initialOpportunity) || flavorOpportunities[0]);
  const [combination, setCombination] = useState("Strawberry · Chantilly cream · Granola · Rose");
  const [name, setName] = useState("Strawberry Chantilly Parfait");
  const [price, setPrice] = useState("7.50");
  const [availability, setAvailability] = useState("In-store only");
  const [startDate, setStartDate] = useState("2025-07-16");
  const [endDate, setEndDate] = useState("2025-07-22");
  const [reviewed, setReviewed] = useState(false);
  const [published, setPublished] = useState(false);
  const goNext = () => setStep((current) => Math.min(flavorSteps.length - 1, current + 1));
  const goBack = () => setStep((current) => Math.max(0, current - 1));
  const chooseOpportunity = (item: typeof flavorOpportunities[number]) => {
    setOpportunity(item);
    setName(item.name);
    setPrice(item.id === "mango" ? "8.50" : item.id === "blueberry" ? "4.00" : "7.50");
    setReviewed(false);
    setPublished(false);
    setCombination(item.id === "mango" ? "Mango · Matcha cream · Oat crunch · Coconut" : item.id === "blueberry" ? "Blueberry compote · Vanilla yogurt · Lemon granola" : "Strawberry · Chantilly cream · Granola · Rose");
  };
  const ingredients = opportunity.id === "mango" ? [
    ["Frozen mango", "8 kg", "12 kg", "21 days", "SweetRoots · 22% discount"],
    ["Matcha powder", "1.2 kg", "3 kg", "21 days", "TopSource · 20% discount"],
    ["Vanilla yogurt", "3.2 kg", "3.2 kg", "7 days", "Sunshine Dairy"],
    ["Oat granola", "1.6 kg", "2 kg", "30 days", "Golden Grain"],
  ] : opportunity.id === "blueberry" ? [
    ["Blueberry compote", "480 g", "480 g", "4 days", "Berry & Bloom"],
    ["Vanilla yogurt", "2.4 kg", "3.2 kg", "7 days", "Sunshine Dairy"],
    ["Lemon granola", "1.2 kg", "2.8 kg", "28 days", "Golden Grain"],
  ] : [
    ["Heavy cream", "1.2 L", "1.4 L", "1 day", "Sunshine Dairy"],
    ["Fresh strawberries", "2.4 kg", "6 kg", "4 days", "FreshFarm"],
    ["Granola", "1.6 kg", "2 kg", "30 days", "Golden Grain"],
    ["Rose syrup", "240 ml", "1.1 L", "45 days", "Pantry stock"],
  ];
  const supplierRows = opportunity.id === "mango" ? [
    ["Frozen mango", "SweetRoots", "$4.68/kg", "Regular $6.00/kg", "22% discount"],
    ["Matcha powder", "TopSource", "$5.10/kg", "Regular $6.38/kg", "20% discount"],
    ["Vanilla yogurt", "Sunshine Dairy", "$3.10/kg", "GreenLeaf · $3.40/kg", "Current source lower"],
  ] : opportunity.id === "blueberry" ? [
    ["Blueberry compote", "Berry & Bloom", "$4.80/kg", "FreshFarm · $5.20/kg", "Current source lower"],
    ["Vanilla yogurt", "Sunshine Dairy", "$3.10/kg", "GreenLeaf · $3.40/kg", "Current source lower"],
    ["Lemon granola", "Golden Grain", "$4.40/kg", "Pantry Co. · $4.85/kg", "Current source lower"],
  ] : [
    ["Heavy cream", "Sunshine Dairy", "$5.90/L", "PeakDairy · $6.20/L", "Current source lower"],
    ["Fresh strawberries", "FreshFarm", "$3.20/kg", "SweetRoots · $3.80/kg", "Best current price"],
    ["Granola", "Golden Grain", "$4.20/kg", "Pantry Co. · $4.70/kg", "Current source lower"],
  ];
  const costProfile = opportunity.id === "mango" ? {
    total: "2.34", lines: [["Frozen mango", "90 g per serving", "$0.72"], ["Matcha cream", "120 g per serving", "$0.86"], ["Oat crunch and coconut", "55 g per serving", "$0.53"], ["Cup, lid, and spoon", "One set", "$0.23"]],
  } : opportunity.id === "blueberry" ? {
    total: "2.09", lines: [["Blueberry compote", "60 g per serving", "$0.58"], ["Vanilla yogurt", "140 g per serving", "$0.71"], ["Lemon granola", "55 g per serving", "$0.57"], ["Cup, lid, and spoon", "One set", "$0.23"]],
  } : {
    total: "2.18", lines: [["Chantilly cream", "120 g per serving", "$0.78"], ["Fresh strawberries", "80 g per serving", "$0.64"], ["Granola and rose syrup", "55 g per serving", "$0.53"], ["Cup, lid, and spoon", "One set", "$0.23"]],
  };
  const voteProfile = opportunity.id === "mango" ? [["Mango flavours", "38 votes", "Comeback poll · this week"], ["Matcha flavours", "19 votes", "Recurring favourites · last 4 weeks"], ["Similar past special", "19 sold", "Matcha special · recorded result"]] : opportunity.id === "blueberry" ? [["Blueberry flavours", "41 votes", "Comeback poll · this week"], ["Fruit and yogurt flavours", "36 votes", "Recurring favourites · last 4 weeks"], ["Similar past special", "14 sold", "Blueberry special · recorded result"]] : [["Strawberry cream flavours", "63 votes", "Comeback poll · this week"], ["Fruit and granola flavours", "41 votes", "Recurring favourites · last 4 weeks"], ["Similar past special", "24 sold", "Strawberry Cream special · recorded result"]];
  const combinations = opportunity.id === "mango" ? [
    ["Mango Matcha Crunch", "Mango · Matcha cream · Oat crunch", "Uses both discounted ingredients"],
    ["Mango Coconut Cloud", "Mango · Coconut cream · Granola", "Uses mango deal and low-stock coconut cream"],
    ["Matcha Yogurt Swirl", "Matcha · Vanilla yogurt · Sesame granola", "Uses discounted matcha"],
  ] : opportunity.id === "blueberry" ? [
    ["Blueberry Lemon Parfait", "Blueberry compote · Vanilla yogurt · Lemon granola", "Uses all expiring compote"],
    ["Blueberry Cream Crunch", "Blueberry compote · Chantilly cream · Granola", "Uses compote and cream"],
    ["Berry Rose Parfait", "Blueberry compote · Strawberry · Rose cream", "Uses two near-expiry fruits"],
  ] : [
    ["Strawberry Chantilly Parfait", "Strawberry · Chantilly cream · Granola · Rose", "Uses the most cream and strawberries"],
    ["Strawberry Coffee Crunch", "Strawberry · Coffee cream · Cocoa granola", "Matches a popular existing flavour"],
    ["Strawberry Lemon Cloud", "Strawberry · Lemon yogurt · Oat crumble", "Uses less cream per serving"],
  ];
  const stepContent = [
    <section className="flavor-step" key="discover"><div className="step-intro"><span>Step 1</span><h2>Discover an opportunity</h2><p>These options are surfaced because of expiring stock, supplier discounts, or recorded customer interest.</p></div><div className="opportunity-list">{flavorOpportunities.map((item) => <button className={opportunity.id === item.id ? "opportunity-item selected" : "opportunity-item"} key={item.id} onClick={() => chooseOpportunity(item)}><img src={`${A}/${item.image}`} alt="" /><span><b>{item.name}</b><p>{item.reason}</p><span>{item.signals.map((signal) => <small key={signal}>{signal}</small>)}</span></span><strong>{opportunity.id === item.id ? "Selected" : "Review"}</strong></button>)}</div></section>,
    <section className="flavor-step" key="ingredients"><div className="step-intro"><span>Step 2</span><h2>Review available ingredients</h2><p>See what the product requires, what is already available, and why each ingredient matters.</p></div><div className="flavor-table"><div className="flavor-table-row header"><span>Ingredient</span><span>Required</span><span>Available</span><span>Expiry</span><span>Why shown</span></div>{ingredients.map((item) => <div className="flavor-table-row" key={item[0]}><b>{item[0]}</b><span>{item[1]}</span><span>{item[2]}</span><span>{item[3]}</span><span>{Number.parseFloat(item[2]) >= Number.parseFloat(item[1]) ? "Available now" : "Order needed"}</span></div>)}</div><div className="transparent-note"><b>Why this opportunity?</b><span>{opportunity.reason}</span></div></section>,
    <section className="flavor-step" key="suppliers"><div className="step-intro"><span>Step 3</span><h2>Check supplier prices and discounts</h2><p>Current prices are shown alongside the supplier you already use. No order is created until you confirm it.</p></div><div className="supplier-compare"><div className="flavor-table-row header"><span>Ingredient</span><span>Current source</span><span>Current price</span><span>Alternative</span><span>Difference</span></div>{supplierRows.map((row) => <div className="flavor-table-row" key={row[0]}><b>{row[0]}</b><span>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span><span className={row[4].includes("discount") || row[4].includes("Best") ? "positive" : ""}>{row[4]}</span></div>)}</div><button className="secondary-button supplier-link" onClick={() => onNavigate("Suppliers")}>Open full supplier comparison</button></section>,
    <section className="flavor-step" key="combinations"><div className="step-intro"><span>Step 4</span><h2>Explore flavour combinations</h2><p>Each combination explains the inventory or customer signal behind it.</p></div><div className="combination-list">{combinations.map((item) => <button className={combination.startsWith(item[1].split(" · ")[0]) || combination === item[1] ? "combination-item selected" : "combination-item"} key={item[0]} onClick={() => { setCombination(item[1]); setName(item[0]); }}><span><b>{item[0]}</b><small>{item[1]}</small></span><p>{item[2]}</p><strong>{combination === item[1] ? "Selected" : "Choose"}</strong></button>)}</div></section>,
    <section className="flavor-step" key="cost"><div className="step-intro"><span>Step 5</span><h2>Review estimated ingredient cost</h2><p>Estimated from current inventory values and supplier prices. Packaging is included.</p></div><div className="cost-breakdown">{costProfile.lines.map((line) => <div key={line[0]}><span>{line[0]}</span><small>{line[1]}</small><b>{line[2]}</b></div>)}<strong><span>Estimated cost per serving</span><b>${costProfile.total}</b></strong></div><div className="sample-data-note">Planning estimate based on the sample inventory and supplier records shown in this workspace. Actual cost may vary with portion size.</div></section>,
    <section className="flavor-step" key="votes"><div className="step-intro"><span>Step 6</span><h2>Review customer voting history</h2><p>Recorded votes provide context only. They are not a sales forecast.</p></div><div className="vote-history">{voteProfile.map((item) => <div key={item[0]}><span>{item[0]}</span><b>{item[1]}</b><small>{item[2]}</small></div>)}</div><button className="secondary-button supplier-link" onClick={() => onNavigate("Sales & Votes")}>Review all votes and sales history</button></section>,
    <section className="flavor-step" key="create"><div className="step-intro"><span>Step 7</span><h2>Create the limited-time flavour</h2><p>Set the customer-facing name, price, availability, and dates.</p></div><div className="flavor-form"><label>Product name<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Sell price<input type="number" min="0" step=".10" value={price} onChange={(event) => setPrice(event.target.value)} /></label><label>Available through<select value={availability} onChange={(event) => setAvailability(event.target.value)}><option>In-store only</option><option>Online only</option><option>In-store and online</option></select></label><label>Start date<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>End date<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label><label>Selected layers<input value={combination} readOnly /></label></div></section>,
    <section className="flavor-step" key="preview"><div className="step-intro"><span>Step 8</span><h2>Preview the product</h2><p>Check how the limited-time flavour will appear before publishing.</p></div><div className="product-preview"><img src={`${A}/${opportunity.image}`} alt="" /><div><span>Limited-time parfait</span><h2>{name || "Untitled flavour"}</h2><p>{combination}</p><strong>${Number(price || 0).toFixed(2)}</strong><div><small>{availability}</small><small>{startDate} to {endDate}</small></div></div></div><div className="transparent-note"><b>Why it was created</b><span>{opportunity.reason} Estimated ingredient cost is ${costProfile.total} per serving.</span></div></section>,
    <section className="flavor-step" key="publish"><div className="step-intro"><span>Step 9</span><h2>Confirm demo preview</h2><p>Review the decision record for this temporary preview.</p></div>{published ? <div className="publish-success" role="status"><span className="success-mark">Done</span><h2>{name} preview is ready</h2><p>This demo preview is set for {startDate} through {endDate} and {availability.toLowerCase()}. It has not been published to a menu.</p><button className="primary-button" onClick={() => onNavigate("Sales & Votes")}>View sample sales</button></div> : <div className="publish-review"><div><span>Product</span><b>{name}</b></div><div><span>Dates</span><b>{startDate} to {endDate}</b></div><div><span>Estimated ingredient cost</span><b>${costProfile.total} per serving</b></div><div><span>Inventory reason</span><b>{opportunity.reason}</b></div><div><span>Customer context</span><b>{voteProfile[0][1]} recorded for related {opportunity.id} flavours</b></div><label><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} /> I reviewed the ingredients, costs, dates, and product details.</label><button className="primary-button publish-button" disabled={!reviewed} onClick={() => setPublished(true)}>Save demo preview</button></div>}</section>,
  ];
  return (
    <main className="flavor-workflow-page" id="main">
      <div className="page-heading">
        <div><span className="eyebrow">Limited-time product workflow</span><h1>Flavour of the Week</h1><p>Turn available, discounted, or near-expiry ingredients into a well-informed product decision.</p></div>
        <span className="workflow-progress">Step {step + 1} of {flavorSteps.length}</span>
      </div>
      <div className="planning-notice"><span className="sync-dot" /><b>Planning data</b> Costs and inventory in this workspace use the current sample records shown in the product. Customer votes and past sales are historical context, not forecasts.</div>
      <div className="flavor-workflow-layout">
        <nav className="workflow-steps" aria-label="Flavour creation steps">{flavorSteps.map((label, index) => <button className={step === index ? "active" : index < step ? "complete" : ""} aria-current={step === index ? "step" : undefined} onClick={() => setStep(index)} key={label}><span>{index + 1}</span><b>{label}</b></button>)}</nav>
        <div className="workflow-content">{stepContent[step]}<div className="workflow-footer"><button className="secondary-button" onClick={goBack} disabled={step === 0}>Back</button><span>Your selections are kept as you review each step.</span>{step < flavorSteps.length - 1 && <button className="primary-button" onClick={goNext}>Continue</button>}</div></div>
      </div>
    </main>
  );
}

const recipes = [
  { name: "Coffee Cream Parfait", category: "Original", image: "parfait-coffee.png", time: "12 min", serves: "8", cost: "$1.90", margin: "65%", stock: "All in stock", ingredients: ["Vanilla yogurt cream · 800g", "Espresso syrup · 160ml", "Oat granola · 240g", "Chocolate curls · 80g"], steps: ["Whip the vanilla yogurt cream until soft peaks form.", "Layer granola, espresso syrup, and cream in parfait glasses.", "Finish with chocolate curls and chill before serving."] },
  { name: "Strawberry Shortcake Parfait", category: "Weekly Special", image: "parfait-strawberry.jpg", time: "18 min", serves: "10", cost: "$2.60", margin: "63%", stock: "Cream expires soon", ingredients: ["Strawberry cream · 1kg", "Vanilla cake crumb · 400g", "Berry compote · 300g", "Fresh strawberries · 20"], steps: ["Prepare the vanilla cake crumb.", "Layer cake crumb, berry compote, and strawberry cream in parfait glasses.", "Top with fresh strawberry and serve chilled."] },
  { name: "Golden Caramel Parfait", category: "Original", image: "parfait-mango.jpg", time: "10 min", serves: "6", cost: "$1.40", margin: "69%", stock: "All in stock", ingredients: ["Vanilla yogurt · 600g", "Caramel granola · 240g", "Mango pieces · 300g", "Caramel drizzle · 60ml"], steps: ["Spoon vanilla yogurt into each parfait glass.", "Layer with mango and caramel granola.", "Finish with caramel drizzle and chill."] },
  { name: "Matcha Cloud Parfait", category: "Weekly Special", image: "parfait-matcha.jpg", time: "15 min", serves: "8", cost: "$2.20", margin: "63%", stock: "Matcha discounted", ingredients: ["Matcha yogurt cream · 800g", "Mochi cubes · 320g", "Sesame granola · 160g", "White chocolate · 80g"], steps: ["Fold matcha into chilled yogurt cream.", "Layer with mochi and sesame granola in parfait glasses.", "Finish with white chocolate and chill."] },
  { name: "Blueberry Lemon Parfait", category: "Original", image: "parfait-berry.jpg", time: "20 min", serves: "8", cost: "$1.60", margin: "60%", stock: "Compote expires soon", ingredients: ["Blueberry compote · 480g", "Vanilla yogurt · 640g", "Lemon granola · 240g", "Lemon zest · 20g"], steps: ["Spoon vanilla yogurt into chilled parfait glasses.", "Layer with blueberry compote and lemon granola.", "Finish with lemon zest."] },
  { name: "Mango Yuzu Parfait", category: "Weekly Special", image: "parfait-mango.jpg", time: "14 min", serves: "8", cost: "$2.40", margin: "68%", stock: "Check mango and yogurt coverage", ingredients: ["Frozen mango · 720g", "Yuzu curd · 240g", "Vanilla yogurt · 640g", "Oat granola · 160g"], steps: ["Spoon vanilla yogurt into chilled parfait glasses.", "Layer with frozen mango, yuzu curd, and oat granola.", "Finish with yuzu zest and serve chilled."] },
  { name: "Chocolate Mochi Parfait", category: "Archived", image: "parfait-chocolate.jpg", time: "16 min", serves: "8", cost: "$2.10", margin: "66%", stock: "One item low", ingredients: ["Chocolate yogurt cream · 720g", "Mochi · 320g", "Cocoa granola · 160g", "Chocolate curls · 80g"], steps: ["Prepare the chocolate yogurt cream.", "Layer cream, mochi, and cocoa granola in parfait glasses.", "Finish with chocolate curls."] },
];

export function RecipesPage({ onAction, initialRecipe }: { onAction: (label: string) => void; initialRecipe?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Recipes");
  const [selected, setSelected] = useState(() => recipes.find((recipe) => recipe.name === initialRecipe) || recipes[0]);
  const categories = ["All Recipes", "Original", "Weekly Special", "Archived"];
  const shown = recipes.filter((recipe) => (category === "All Recipes" || recipe.category === category) && recipe.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="recipes-layout">
      <main className="recipes-main" id="main">
        <div className="page-heading">
          <div><h1>Recipes</h1><p>Every recipe, ingredient quantity, cost, and preparation step in one place.</p></div>
          <div className="heading-actions"><button className="primary-button" onClick={() => onAction("Create a new recipe")}>New recipe</button></div>
        </div>
        <div className="summary-pills"><span>6 total recipes</span><span>4 active today</span><span>2 use expiring stock</span></div>
        <section className="metrics" aria-label="Recipe summary">
          <Metric label="Active recipes" value="4" detail="Available to make today" />
          <Metric label="Average margin" value="64%" detail="Across the complete menu" />
          <Metric label="Ready to make" value="5" detail="Ingredients currently available" />
          <Metric label="Need attention" value="2" detail="Use expiring stock first" tone="danger-text" />
        </section>
        <div className="recipe-tools">
          <label className="search-box"><span className="sr-only">Search recipes</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search recipes by name" /></label>
          <div className="filter-tabs compact" role="group" aria-label="Filter recipes">{categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        </div>
        <section className="recipe-grid" aria-label="Recipe library">
          {shown.map((recipe) => (
            <button className={selected.name === recipe.name ? "recipe-card selected" : "recipe-card"} key={recipe.name} onClick={() => setSelected(recipe)}>
              <img src={`${A}/${recipe.image}`} alt="" />
              <span className="recipe-card-body">
                <span className="recipe-card-top"><span className="tag yellow">{recipe.category}</span><strong>{recipe.margin} margin</strong></span>
                <b>{recipe.name}</b>
                <small>{recipe.time} · Makes {recipe.serves} · {recipe.cost} each</small>
                <span className={recipe.stock.includes("expires") ? "stock-warning" : "stock-ok"}>{recipe.stock}</span>
              </span>
            </button>
          ))}
          {shown.length === 0 && <div className="empty-recipes"><h2>No recipes found</h2><p>Try a different name or category.</p></div>}
        </section>
      </main>
      <aside className="recipe-detail" aria-live="polite">
        <div className="detail-hero"><img src={`${A}/${selected.image}`} alt="" /><span><small>{selected.category}</small><h2>{selected.name}</h2><p>{selected.time} preparation · Makes {selected.serves}</p></span></div>
        <div className="detail-costs"><span><small>Cost each</small><b>{selected.cost}</b></span><span><small>Margin</small><b>{selected.margin}</b></span><span><small>Stock</small><b>{selected.stock}</b></span></div>
        <section className="detail-section"><div className="card-title"><h3>Ingredients</h3><span>Makes {selected.serves}</span></div><ul>{selected.ingredients.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="detail-section"><div className="card-title"><h3>Method</h3></div><ol>{selected.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol></section>
        <div className="detail-actions"><button className="secondary-button" onClick={() => onAction(`Edit ${selected.name}`)}>Edit recipe</button><button className="primary-button" onClick={() => onAction(`Start a batch of ${selected.name}`)}>Start batch</button></div>
      </aside>
    </div>
  );
}

const taxExpenses = [
  { id: 1, date: "Jul 12", supplier: "Sunshine Dairy", category: "Ingredients", amount: 284.5, tax: 22.76, status: "Matched" },
  { id: 2, date: "Jul 11", supplier: "SweetRoot Co.", category: "Ingredients", amount: 158, tax: 12.64, status: "Review" },
  { id: 3, date: "Jul 10", supplier: "Cafe Essentials", category: "Packaging", amount: 67.2, tax: 5.38, status: "Matched" },
  { id: 4, date: "Jul 8", supplier: "Verifone", category: "Processing fees", amount: 86.4, tax: 6.91, status: "Matched" },
];

export function TaxesPage({ onAction }: { onAction: (label: string) => void }) {
  const [period, setPeriod] = useState("Jul 1–13, 2025");
  const [included, setIncluded] = useState(taxExpenses.map((item) => item.id));
  const [reviewedEstimate, setReviewedEstimate] = useState(false);
  const [receiptReviewed, setReceiptReviewed] = useState(false);
  const inputCredits = taxExpenses.filter((item) => included.includes(item.id)).reduce((sum, item) => sum + item.tax, 0);
  const salesTax = 421;
  const owing = salesTax - inputCredits;
  const toggleExpense = (id: number) => setIncluded((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return (
    <div className="tax-layout">
      <main className="tax-main" id="main">
        <div className="page-heading">
          <div><h1>Taxes</h1><p>Review example sales tax totals and supplier receipt records.</p></div>
          <div className="heading-actions"><button className="secondary-button" onClick={() => onAction("Download tax working paper")}>Download report</button><button className="primary-button" onClick={() => setReviewedEstimate(true)}>Mark estimate reviewed</button></div>
        </div>
        <div className="tax-period-row">
          <label><span>Filing period</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Jul 1–13, 2025</option><option>Jun 1–30, 2025</option><option>Apr 1–Jun 30, 2025</option></select></label>
          <span className="tax-data-status"><span className="auto-status">Sample records · July 2025</span><span className="stale-status">No accounting connection</span></span>
        </div>
        <section className="metrics" aria-label="Tax summary">
          <Metric label="Taxable sales" value="$4,210" detail="47 matched transactions" />
          <Metric label="Sales tax collected" value="$421.00" detail="From example receipts" />
          <Metric label="Input tax credits" value={`$${inputCredits.toFixed(2)}`} detail={`${included.length} deductible expenses`} />
          <Metric label="Net tax owing" value={`$${owing.toFixed(2)}`} detail="Due Jul 28, 2025" tone="warning-text" />
        </section>
        {reviewedEstimate ? <div className="tax-success" role="status"><b>Estimate marked as reviewed in this demo.</b><span>No tax return was prepared, submitted, or filed. Confirm the records with your accounting software or tax professional.</span></div> : <div className="sync-banner workspace-notice" role="status"><span className="sync-dot" />Sample tax figures only. One example supplier receipt is marked for review.<button onClick={() => setReceiptReviewed(true)}>{receiptReviewed ? "Example receipt reviewed" : "Mark example reviewed"}</button></div>}
        <section>
          <div className="section-bar"><div><h2>Deductible business expenses</h2><p>Select the expenses to include as input tax credits.</p></div><span className="selection-count">{included.length} of {taxExpenses.length} included</span></div>
          <div className="table-wrap workspace-table tax-table" role="region" aria-label="Deductible expenses" tabIndex={0}>
            <table><thead><tr><th>Include</th><th>Date &amp; supplier</th><th>Category</th><th>Expense</th><th>Tax credit</th><th>Status</th></tr></thead>
              <tbody>{taxExpenses.map((expense) => <tr key={expense.id}>
                <td><input className="tax-checkbox" type="checkbox" checked={included.includes(expense.id)} onChange={() => toggleExpense(expense.id)} aria-label={`Include ${expense.supplier} expense`} /></td>
                <td><span className="primary-cell"><b>{expense.supplier}</b><small>{expense.date} · Receipt attached</small></span></td>
                <td>{expense.category}</td><td>${expense.amount.toFixed(2)}</td><td className="positive"><b>${expense.tax.toFixed(2)}</b></td>
                <td><span className={`status ${expense.status.toLowerCase()}`}>{expense.status}</span></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>
        <section className="tax-breakdown">
          <div><h2>How your amount is calculated</h2><p>Sales tax collected</p><p>Minus deductible input tax credits</p><strong>Estimated tax to pay</strong></div>
          <div className="tax-amounts"><span>$421.00</span><span>− ${inputCredits.toFixed(2)}</span><b>${owing.toFixed(2)}</b></div>
        </section>
      </main>
      <aside className="tax-side">
        <div className="side-heading"><h2>Filing checklist</h2><span>4</span></div>
        <p>Complete these checks before you submit the return.</p>
        <ol className="checklist">
          <li className="done"><span>1</span><div><b>Sample sales included</b><small>Illustrative figures only; no Verifone connection</small></div></li>
          <li className="done"><span>2</span><div><b>Supplier bills added</b><small>Four expenses are available</small></div></li>
          <li className={receiptReviewed ? "done" : ""}><span>3</span><div><b>Review SweetRoot receipt</b><small>Example review state only · $12.64 listed</small></div></li>
          <li className={reviewedEstimate ? "done" : ""}><span>4</span><div><b>Review estimate</b><small>Filing deadline is not configured</small></div></li>
        </ol>
        <div className="tax-help"><span>Plain-language help</span><h3>What is an input tax credit?</h3><p>It is tax you paid on business purchases. It lowers the amount of sales tax you need to send.</p></div>
        <p className="tax-disclaimer">Figures are estimates based on matched records. Review them or ask your tax professional before filing.</p>
      </aside>
    </div>
  );
}

export type PurchaseItem = { id: number; ingredient: string; quantity: number; price: number };
