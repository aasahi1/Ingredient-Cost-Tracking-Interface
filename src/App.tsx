import { useEffect, useRef, useState } from "react";
import { A, allNavigation, flavors, inventoryRecords, moreNav, primaryNav, productInventory, purchasingNav, recentSales, voteItems, type Flavor } from "./demo-data";
import Metric from "./Metric";
import { FlavorLabPage, InventoryPage, RecipesPage, SuppliersPage, TaxesPage, type PurchaseItem } from "./OperationsPages";

function Icon({ src }: { src: string }) {
  return <img aria-hidden="true" className="icon" src={`${A}/${src}`} />;
}

function Header({ active, onNavigate }: { active: string; onNavigate: (item: string) => void }) {
  const [purchasingOpen, setPurchasingOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const selectPage = (route: string) => {
    onNavigate(route);
    setPurchasingOpen(false);
    setMoreOpen(false);
    setMobileOpen(false);
  };
  return (
    <header className="topbar">
      <a className="brand" href="#main" aria-label="Grandma's Bakery home">
        <img src={`${A}/e7037.png`} alt="" />
        <strong>Grandma&apos;s Bakery</strong>
      </a>
      <nav className="primary-nav" aria-label="Main navigation">
        {primaryNav.map((item) => (
          <button
            className={active === item.route ? "nav-button active" : "nav-button"}
            key={item.route}
            onClick={() => selectPage(item.route)}
            aria-current={active === item.route ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
        <div className="nav-more">
          <button className={purchasingNav.some((item) => item.route === active) ? "nav-button active" : "nav-button"} aria-expanded={purchasingOpen}  onClick={() => { setPurchasingOpen((open) => !open); setMoreOpen(false); }}>Purchasing</button>
          {purchasingOpen && <div className="nav-more-menu" role="group" aria-label="Purchasing pages">{purchasingNav.map((item) => <button aria-current={active === item.route ? "page" : undefined} onClick={() => selectPage(item.route)} key={item.route}><b>{item.label}</b><small>{item.description}</small></button>)}</div>}
        </div>
        <div className="nav-more">
          <button className={moreNav.some((item) => item.route === active) ? "nav-button active" : "nav-button"} aria-expanded={moreOpen}  onClick={() => { setMoreOpen((open) => !open); setPurchasingOpen(false); }}>More</button>
          {moreOpen && <div className="nav-more-menu" role="group" aria-label="More pages">{moreNav.map((item) => <button aria-current={active === item.route ? "page" : undefined} onClick={() => selectPage(item.route)} key={item.route}><b>{item.label}</b><small>{item.description}</small></button>)}</div>}
        </div>
      </nav>
      <div className="header-actions">
        <span className="live"><span /> Sample data</span>
      </div>
      <div className="mobile-nav">
        <button className={mobileOpen ? "mobile-nav-trigger active" : "mobile-nav-trigger"} aria-expanded={mobileOpen}  onClick={() => setMobileOpen((open) => !open)}>Menu</button>
        {mobileOpen && <div className="mobile-nav-menu" role="group" aria-label="Main navigation">{allNavigation.map((item) => <button aria-current={active === item.route ? "page" : undefined} onClick={() => selectPage(item.route)} key={item.route}><span>{item.label}</span>{active === item.route && <b>Current</b>}</button>)}</div>}
      </div>
    </header>
  );
}

function FlavorTable({ filter, selected, onSelect }: { filter: string; selected: string; onSelect: (flavor: Flavor) => void }) {
  const shown = flavors.filter((flavor) => filter === "All Flavors" || flavor.type === filter);
  return (
    <div className="table-wrap" role="region" aria-label="Flavour sales table" tabIndex={0}>
      <table>
        <thead>
          <tr>
            <th>Flavour</th><th>Type</th><th>Sold</th><th>Revenue</th><th>Margin</th><th>Sell-through</th><th>Waste</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((flavor) => (
            <tr className={selected === flavor.name ? "selected-product-row" : ""} key={flavor.name}>
              <td>
                <div className="flavor-name">
                  <img src={`${A}/${flavor.image}`} alt="" />
                  <span><button className="product-link" onClick={() => onSelect(flavor)}>{flavor.name}</button><small>{flavor.price} · cost {flavor.cost}</small></span>
                </div>
              </td>
              <td><span className={`tag ${flavor.type === "Weekly" ? "yellow" : ""}`}>{flavor.type}</span></td>
              <td><b>{flavor.sold}</b></td>
              <td><b>{flavor.revenue}</b></td>
              <td className="positive"><b>{flavor.margin}</b></td>
              <td>
                <b className={flavor.sellThrough < 70 ? "danger-text" : flavor.sellThrough < 85 ? "warning-text" : "positive"}>{flavor.sellThrough}%</b>
                <div className="mini-track"><span style={{ width: `${flavor.sellThrough}%` }} /></div>
              </td>
              <td className={flavor.waste === "$0" ? "positive" : "danger-text"}><b>{flavor.waste}</b></td>
              <td><span className={`status ${flavor.status.replace(" ", "-").toLowerCase()}`}>{flavor.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Votes() {
  const [votes, setVotes] = useState(voteItems);
  const [message, setMessage] = useState("");
  const totalVotes = votes.reduce((total, item) => total + item.votes, 0);
  function addVote(index: number) {
    setVotes((current) => current.map((item, i) => i === index ? { ...item, votes: item.votes + 1 } : item));
    setMessage(`Temporary demo vote added for ${votes[index].name}.`);
  }
  return (
    <section className="votes-panel" aria-labelledby="votes-title">
      <div className="votes-heading">
        <div><h2 id="votes-title">Customer Flavour Votes</h2><span>{totalVotes} votes across listed flavours</span></div>
      </div>
      <div className="vote-tabs"><button className="active">Comeback votes</button><button>Recurring loves</button></div>
      <p className="helper">These are illustrative vote totals. Select a flavour to add a temporary demo vote.</p>
      <p className="sr-only" aria-live="polite">{message}</p>
      <ol className="vote-list">
        {votes.map((item, index) => (
          <li key={item.name}>
            <button className="vote-row" onClick={() => addVote(index)} aria-label={`Vote for ${item.name}, currently ${item.votes} votes`}>
              <span className="rank">{index + 1}</span>
              <img src={`${A}/${item.image}`} alt="" />
              <span className="vote-info">
                <span><b>{item.name}</b><strong>{item.votes} votes</strong></span>
                <span className="vote-track"><i style={{ width: `${(item.votes / 70) * 100}%` }} /></span>
                <small>{item.note}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="poll-note">Demo votes reset when you leave this section.</div>
    </section>
  );
}

const productChanges: Record<string, { thisWeek: string; lastWeek: string; change: string; decision: string }> = {
  "Coffee Cream Parfait": { thisWeek: "38 sold", lastWeek: "31 sold", change: "+7 units", decision: "Sold out today. Check granola stock before preparing another batch." },
  "Strawberry Shortcake Parfait": { thisWeek: "24 sold", lastWeek: "29 sold", change: "−5 units", decision: "Moving slower than last week. Use prepared stock before making more." },
  "Golden Caramel Parfait": { thisWeek: "31 sold", lastWeek: "28 sold", change: "+3 units", decision: "Steady sales. Current ingredients cover approximately three more production days." },
  "Matcha Cloud Parfait": { thisWeek: "19 sold", lastWeek: "22 sold", change: "−3 units", decision: "Sales have slowed. Avoid increasing the next production batch." },
  "Blueberry Lemon Parfait": { thisWeek: "14 sold", lastWeek: "20 sold", change: "−6 units", decision: "Slow-moving, but compote expires soon. Consider a smaller limited-time batch rather than normal production." },
  "Mango Yuzu Parfait": { thisWeek: "34 sold", lastWeek: "31 sold", change: "+3 units", decision: "Selling quickly in the sample period. Check mango and yogurt coverage before preparing another batch." },
};

const inventoryIngredientAliases: Record<string, string> = {
  "Vanilla yogurt cream": "Vanilla yogurt",
  "Oat granola": "Granola",
  "Caramel granola": "Granola",
  "Lemon granola": "Granola",
  "Berry compote": "Blueberry compote",
};

function SalesContextPanel({ flavor, onNavigate, onSupplierFor, onOpenRecipe }: { flavor: Flavor; onNavigate: (page: string) => void; onSupplierFor: (ingredient: string) => void; onOpenRecipe: (recipe: string) => void }) {
  const [tab, setTab] = useState("Product & inventory");
  const ingredients = productInventory[flavor.name] || [];
  const change = productChanges[flavor.name];
  return (
    <aside className="sales-context-panel" aria-label="Sales and inventory details">
      <div className="context-tabs" role="group" aria-label="Sales details"><button aria-pressed={tab === "Product & inventory"} className={tab === "Product & inventory" ? "active" : ""} onClick={() => setTab("Product & inventory")}>Product &amp; inventory</button><button aria-pressed={tab === "Customer votes"} className={tab === "Customer votes" ? "active" : ""} onClick={() => setTab("Customer votes")}>Customer votes</button></div>
      {tab === "Customer votes" ? <Votes /> : <div className="product-impact">
        <div className="impact-product"><img src={`${A}/${flavor.image}`} alt="" /><div><span>Selected product</span><h2>{flavor.name}</h2><p>{flavor.type} · {flavor.price} selling price</p></div></div>
        <section className="impact-section"><div className="impact-heading"><h3>Sales performance</h3><button onClick={() => onNavigate("Sales & Votes")}>Full sales</button></div><div className="impact-metrics"><span><small>Sold this week</small><b>{flavor.sold}</b></span><span><small>Sell-through</small><b>{flavor.sellThrough}%</b></span><span><small>Revenue</small><b>{flavor.revenue}</b></span></div>{change && <div className="change-comparison"><span><small>This week</small><b>{change.thisWeek}</b></span><span><small>Last week</small><b>{change.lastWeek}</b></span><strong className={change.change.startsWith("+") ? "positive" : "warning-text"}>{change.change}</strong></div>}<div className="decision-guidance"><b>What this means</b><p>{change?.decision}</p></div><button className="secondary-button" onClick={() => onOpenRecipe(flavor.name)}>View product recipe</button></section>
        <section className="impact-section"><div className="impact-heading"><h3>Ingredients this product uses</h3><button onClick={() => onNavigate("Inventory")}>Open inventory</button></div><div className="consumption-list">{ingredients.map((item) => { const stockName = inventoryIngredientAliases[item.ingredient] || item.ingredient; const stock = inventoryRecords.find((record) => record.name === stockName); return <div className="consumption-item" key={item.ingredient}><div><b>{item.ingredient}</b><small>{item.used}</small><small>{stock ? `${stock.supplier} · $${stock.unitCost.toFixed(2)}${stock.costUnit}` : "Supplier cost unavailable in this sample"}</small></div><span><small>Current inventory</small><b>{stock ? `${stock.quantity} ${stock.unit}` : item.remaining}</b></span><span className={item.attention ? "inventory-attention" : ""}><small>Coverage / expiry</small><b>{item.attention || stock?.status || item.coverage}</b></span><div className="consumption-actions"><button onClick={() => onNavigate("Inventory")}>View stock</button><button onClick={() => onSupplierFor(stock?.name || item.ingredient)}>Suppliers</button></div></div>; })}</div></section>
        <div className="impact-path" aria-label="Decision path"><span>Product</span><i>→</i><span>Sales</span><i>→</i><span>Ingredients</span><i>→</i><span>Inventory</span><i>→</i><button onClick={() => onSupplierFor(ingredients[0]?.ingredient || "")}>Suppliers</button></div>
      </div>}
    </aside>
  );
}

function SalesDashboard({ onOrder, onNavigate, onSupplierFor, onOpenRecipe }: { onOrder: () => void; onNavigate: (page: string) => void; onSupplierFor: (ingredient: string) => void; onOpenRecipe: (recipe: string) => void }) {
  const [filter, setFilter] = useState("All Flavors");
  const [view, setView] = useState("Product performance");
  const [selectedFlavor, setSelectedFlavor] = useState(flavors[0]);
  const [syncState, setSyncState] = useState<"idle" | "loading" | "success">("idle");
  const [expiryItems, setExpiryItems] = useState([
    ["Heavy cream", "1.4 L remaining · Expires Jul 15", "1 day"],
    ["Blueberry compote", "480 g remaining · Expires Jul 18", "4 days"],
    ["Fresh strawberries", "6 kg remaining · Expires Jul 18", "4 days"],
  ]);
  const reconcileSales = () => {
    setSyncState("loading");
    window.setTimeout(() => setSyncState("success"), 700);
  };
  return (
    <div className="sales-layout">
      <main id="main" className="main-content">
        <div className="page-heading">
          <div>
            <h1>Sales &amp; Flavour Votes</h1>
            <p>See what sold, what is sitting, and what each product means for ingredient stock.</p>
          </div>
          <div className="heading-actions">
            <button className="primary-button" disabled={syncState === "loading"} onClick={reconcileSales}><Icon src="e8774.svg" /> {syncState === "loading" ? "Reviewing sample…" : "Review sample sales"}</button>
          </div>
        </div>
        <div className="summary-pills">
          <span>Week of Jul 8–14</span><span>Customer vote history</span><span>3 items near expiry</span>
        </div>
        <section className="metrics" aria-label="Weekly sales summary">
          <Metric label="Recorded sales" value="$1,284" detail="Up 12% from last week" />
          <Metric label="Average margin" value="64%" detail="Ingredient cost $462" />
          <Metric label="Waste value" value="$38" detail="3 items near expiry" tone="danger-text" />
          <Metric label="Sell-through" value="88%" detail="4 items sold out this week" />
        </section>
        <div className={`sync-banner ${syncState === "loading" ? "is-loading" : ""}`} role="status" aria-live="polite">
          <span className="sync-dot" />
          {syncState === "loading" ? "Reviewing the sample sales records…" : syncState === "success" ? "Demo review complete. No external sales system was contacted." : "Sample sales from Jul 8–14, 2025. No point-of-sale connection is configured."}
        </div>
        <section className="sales-signals" aria-label="Sales signals requiring a decision">
          <button onClick={() => setSelectedFlavor(flavors[0])}><span className="positive">Best seller</span><b>Coffee Cream Parfait</b><small>38 sold · sold out today</small></button>
          <button onClick={() => setSelectedFlavor(flavors[4])}><span className="warning-text">Slow-moving</span><b>Blueberry Lemon Parfait</b><small>14 sold · 56% sell-through</small></button>
          <button onClick={() => setSelectedFlavor(flavors[1])}><span className="danger-text">Stock decision</span><b>Strawberry Shortcake Parfait</b><small>Uses cream expiring tomorrow</small></button>
        </section>
        <div className="sales-view-tabs" role="group" aria-label="Sales views"><button aria-pressed={view === "Product performance"} className={view === "Product performance" ? "active" : ""} onClick={() => setView("Product performance")}>Product performance</button><button aria-pressed={view === "Recent sales"} className={view === "Recent sales" ? "active" : ""} onClick={() => setView("Recent sales")}>Recent sales</button></div>
        {view === "Product performance" ? <>
        <section aria-labelledby="flavor-sales-title">
          <h2 className="sr-only" id="flavor-sales-title">Flavour sales</h2>
          <div className="filter-tabs" role="group" aria-label="Filter flavours">
            {["All Flavors", "Original", "Weekly"].map((item) => (
              <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item === "Weekly" ? "Weekly Specials" : item === "All Flavors" ? "All Flavours" : item}</button>
            ))}
          </div>
          <FlavorTable filter={filter} selected={selectedFlavor.name} onSelect={setSelectedFlavor} />
        </section>
        <section className="bottom-grid">
          <article className="card expiry-card">
            <div className="card-title"><h2>Ingredients approaching expiry</h2><span>{expiryItems.length} items</span></div>
            {expiryItems.map((item) => (
              <div className="expiry-item" key={item[0]}>
                <span className="food-dot" />
                <span><b>{item[0]}</b><small>{item[1]}</small></span>
                <strong>{item[2]}</strong>
                <button onClick={() => setExpiryItems((all) => all.filter((current) => current[0] !== item[0]))}>Used</button>
              </div>
            ))}
            {expiryItems.length === 0 && <p className="empty-state">All expiring ingredients have been handled.</p>}
          </article>
          <article className="card special-card">
            <div className="card-title"><h2>Best next weekly special</h2><span>Recommended</span></div>
            <div className="special-body">
              <img src={`${A}/parfait-strawberry.jpg`} alt="" />
              <div><h3>Strawberry Cream Parfait</h3><p>Uses expiring cream · High vote demand · 63 votes</p></div>
            </div>
            <div className="recommendations"><span>High vote demand</span><span>Uses expiring stock</span><span>Est. margin 67%</span></div>
            <button className="primary-button" onClick={onOrder}>Use in Weekly Special</button>
          </article>
        </section>
        </> : <section className="recent-sales-section" aria-labelledby="recent-sales-title"><div className="section-bar"><div><h2 id="recent-sales-title">Recent sample sales</h2><p>Illustrative transactions; inventory is not updated by these examples.</p></div><span className="auto-status">Sample records</span></div><div className="table-wrap recent-sales-table"><table><thead><tr><th>Time</th><th>Product</th><th>Quantity</th><th>Total</th><th>Payment</th><th>Inventory</th></tr></thead><tbody>{recentSales.map((sale) => <tr key={`${sale.time}-${sale.product}`}><td>{sale.time}</td><td><button className="product-link" onClick={() => { const product = flavors.find((item) => item.name === sale.product); if (product) { setSelectedFlavor(product); setView("Product performance"); } }}>{sale.product}</button></td><td>{sale.quantity}</td><td><b>{sale.total}</b></td><td>{sale.payment}</td><td><span className="status">Not synced</span></td></tr>)}</tbody></table></div></section>}
      </main>
      <SalesContextPanel flavor={selectedFlavor} onNavigate={onNavigate} onSupplierFor={onSupplierFor} onOpenRecipe={onOpenRecipe} />
    </div>
  );
}

type WorkspaceData = {
  title: string;
  intro: string;
  primaryAction: string;
  pills: string[];
  metrics: { label: string; value: string; detail: string; tone?: string }[];
  notice: string;
  tabs: string[];
  tableTitle: string;
  columns: string[];
  rows: { name: string; detail: string; cells: string[]; status: string; action: string }[];
  sideTitle: string;
  sideIntro: string;
  sideItems: { title: string; detail: string; badge: string; image?: string }[];
};

const moduleData: Record<string, WorkspaceData> = {
  Overview: {
    title: "Good morning",
    intro: "Your complete view of today’s sales, stock, suppliers, and bills.",
    primaryAction: "Record a new sale",
    pills: ["Sample day · Jul 14, 2025", "2 urgent actions", "Demo records"],
    metrics: [
      { label: "Today’s revenue", value: "$847", detail: "Up 18% from yesterday" },
      { label: "Average order", value: "$5.96", detail: "Weekly average $5.56" },
      { label: "Sell-through", value: "83%", detail: "Strawberry cream is lagging" },
      { label: "Bills due", value: "$354", detail: "2 payments need attention", tone: "danger-text" },
    ],
    notice: "Illustrative sales records only. No point-of-sale connection is configured.",
    tabs: ["Today", "This Week", "Needs Attention"],
    tableTitle: "Today’s priorities",
    columns: ["Priority", "Area", "Due", "Value", "Status", "Action"],
    rows: [
      { name: "Use heavy cream", detail: "1.4L remaining · expires tomorrow", cells: ["Inventory", "Today", "$18 at risk"], status: "Urgent", action: "Use now" },
      { name: "FreshCo delivery", detail: "Mango, cream and butter · 18 items", cells: ["Orders", "10–11 AM", "$284.50"], status: "Arriving", action: "View" },
      { name: "Mango supplier deal", detail: "20% off · deal ends Friday", cells: ["Suppliers", "Friday", "Save $24"], status: "Deal", action: "Order" },
      { name: "Strawberry Parfait comeback", detail: "63 customer votes this week", cells: ["Flavor Lab", "This week", "67% margin"], status: "Popular", action: "Create" },
    ],
    sideTitle: "Quick view",
    sideIntro: "The most useful information for your next decision.",
    sideItems: [
      { title: "Mango Yuzu Parfait", detail: "97% sold through · 34 sold today", badge: "Trending", image: "parfait-mango.jpg" },
      { title: "Heavy cream", detail: "Use before tomorrow", badge: "Use first" },
      { title: "SweetRoot bill", detail: "$158 · four days overdue", badge: "Pay now" },
    ],
  },
  "Flavor Lab": {
    title: "Flavor Lab",
    intro: "Turn discounted and near-expiry ingredients into profitable weekly specials.",
    primaryAction: "Create a new flavor",
    pills: ["Week 24 special active", "196 votes across listed flavours", "3 smart suggestions"],
    metrics: [
      { label: "Projected margin", value: "71%", detail: "Target is 65% or higher" },
      { label: "Customer votes", value: "124", detail: "Recorded this week" },
      { label: "Ingredient cost", value: "$2.18", detail: "Per serving" },
      { label: "Stock saved", value: "$42", detail: "Near-expiry ingredients used" },
    ],
    notice: "Best opportunity: Strawberry Chantilly Parfait uses cream expiring in 4 days and has strong customer demand.",
    tabs: ["All ideas", "Uses available stock", "High demand"],
    tableTitle: "Flavor ideas",
    columns: ["Flavor", "Main ingredient", "Cost", "Margin", "Demand", "Action"],
    rows: [
      { name: "Strawberry Chantilly Parfait", detail: "Cream · strawberry · granola · rose", cells: ["Chantilly cream", "$2.18", "71%"], status: "High demand", action: "Edit" },
      { name: "Mango Matcha Parfait", detail: "Mango · matcha cream · oat crunch", cells: ["Discounted matcha", "$2.34", "68%"], status: "Good fit", action: "Build" },
      { name: "Blueberry Lemon Parfait", detail: "Blueberry · lemon curd · vanilla", cells: ["Blueberry compote", "$2.09", "70%"], status: "Uses stock", action: "Build" },
      { name: "Coconut Cream Parfait", detail: "Coconut · mochi · toasted sesame", cells: ["Coconut cream", "$2.42", "66%"], status: "New idea", action: "Review" },
    ],
    sideTitle: "Ingredient opportunities",
    sideIntro: "Ingredients that can inspire this week’s special.",
    sideItems: [
      { title: "Fresh strawberry cream", detail: "600g · expires in 2 days", badge: "Use first", image: "parfait-strawberry.jpg" },
      { title: "Matcha powder", detail: "20% supplier discount", badge: "Great deal", image: "parfait-matcha.jpg" },
      { title: "Customer favorite", detail: "Coffee Cream Parfait has 63 comeback votes", badge: "Popular", image: "parfait-coffee.png" },
    ],
  },
  Inventory: {
    title: "Inventory & Expiry",
    intro: "Know what is in stock, what is running low, and what should be used first.",
    primaryAction: "Add inventory",
    pills: ["142 ingredients", "3 near expiry", "5 low-stock items"],
    metrics: [
      { label: "Stock value", value: "$2,840", detail: "Across all ingredients" },
      { label: "Near-expiry value", value: "$38", detail: "3 ingredients need attention", tone: "danger-text" },
      { label: "Low stock", value: "5", detail: "2 already on order" },
      { label: "Waste avoided", value: "$126", detail: "This month" },
    ],
    notice: "Use heavy cream first. Coconut cream is available as a replacement and costs $3.30 less per kilogram.",
    tabs: ["All ingredients", "Use first", "Reorder soon"],
    tableTitle: "Ingredient stock",
    columns: ["Ingredient", "Category", "On hand", "Unit cost", "Expiry", "Action"],
    rows: [
      { name: "Heavy cream", detail: "Sunshine Dairy · fridge 1", cells: ["Dairy", "1.4 L", "$5.90/L"], status: "Tomorrow", action: "Use first" },
      { name: "Strawberries", detail: "FreshFarm · 500g punnets", cells: ["Fruit", "6 kg", "$3.20/kg"], status: "4 days", action: "View" },
      { name: "Matcha powder", detail: "TopSource · discounted batch", cells: ["Dry goods", "3 kg", "$5.10/kg"], status: "21 days", action: "View" },
      { name: "Coconut cream", detail: "GreenLeaf Supply · substitute", cells: ["Dairy alt.", "2 kg", "$3.50/kg"], status: "14 days", action: "Reorder" },
      { name: "Blueberry compote", detail: "Berry & Bloom · fridge 2", cells: ["Toppings", "480 g", "$4.80/kg"], status: "4 days", action: "Use soon" },
    ],
    sideTitle: "Smart replacements",
    sideIntro: "Lower-cost options when an ingredient is unavailable.",
    sideItems: [
      { title: "Heavy cream → Coconut cream", detail: "Save $3.30/kg · similar texture", badge: "Recommended" },
      { title: "Mascarpone → Oat cream", detail: "Save $2.10/kg · vegan option", badge: "Alternative" },
      { title: "Fresh mango → Frozen mango", detail: "Save 22% through Friday", badge: "Supplier deal" },
    ],
  },
  Suppliers: {
    title: "Suppliers & Ingredient Costs",
    intro: "Compare prices, discounts, lead times, reliability, and ingredient replacements.",
    primaryAction: "Create purchase order",
    pills: ["8 active suppliers", "4 current deals", "1 price increase"],
    metrics: [
      { label: "Monthly spend", value: "$1,426", detail: "Down 6% from last month" },
      { label: "Savings found", value: "$94", detail: "From active supplier deals" },
      { label: "On-time delivery", value: "96%", detail: "Across all suppliers" },
      { label: "Price changes", value: "3", detail: "One needs review", tone: "danger-text" },
    ],
    notice: "Frozen mango is 22% off at SweetRoots. The deal fits next week’s Mango Parfait special.",
    tabs: ["All prices", "Best prices & deals", "Price changes"],
    tableTitle: "Ingredient price comparison",
    columns: ["Ingredient", "Supplier", "Unit cost", "Lead time", "Reliability", "Action"],
    rows: [
      { name: "Strawberries", detail: "500g punnet", cells: ["FreshFarm", "$3.20/kg", "2 days"], status: "Best price", action: "Add" },
      { name: "Strawberries", detail: "500g punnet", cells: ["SweetRoots", "$3.80/kg", "1 day"], status: "Fastest", action: "Add" },
      { name: "Frozen mango", detail: "5kg carton · 22% off", cells: ["SweetRoots", "$4.68/kg", "3 days"], status: "Deal", action: "Add" },
      { name: "Heavy cream", detail: "2L carton · price up 18%", cells: ["PeakDairy", "$6.20/L", "2 days"], status: "Price rise", action: "Replace" },
      { name: "Coconut cream", detail: "1L carton", cells: ["FreshFarm", "$2.40/L", "2 days"], status: "Save 61%", action: "Add" },
    ],
    sideTitle: "Order draft",
    sideIntro: "Three items selected from the best available suppliers.",
    sideItems: [
      { title: "Strawberries · 10 units", detail: "FreshFarm", badge: "$32.00" },
      { title: "Frozen mango · 8 units", detail: "SweetRoots", badge: "$37.44" },
      { title: "Coconut cream · 4 units", detail: "FreshFarm", badge: "$9.60" },
    ],
  },
  Orders: {
    title: "Orders, Bills & Tax",
    intro: "Track incoming stock, pay supplier bills, and review auto-filled tax details.",
    primaryAction: "New purchase order",
    pills: ["3 upcoming deliveries", "2 bills due", "Tax auto-filled"],
    metrics: [
      { label: "Open orders", value: "$893", detail: "Across 3 suppliers" },
      { label: "Bills due", value: "$354", detail: "One payment is overdue", tone: "danger-text" },
      { label: "Tax credits", value: "$87.40", detail: "From matched supplier bills" },
      { label: "Next delivery", value: "Today", detail: "Sunshine Dairy · 10–11 AM" },
    ],
    notice: "Cream is low. Sunshine Dairy can add two cartons to today’s delivery before 9:30 AM.",
    tabs: ["All activity", "Deliveries", "Bills due"],
    tableTitle: "Upcoming deliveries",
    columns: ["Supplier", "Order", "Items", "Total", "Delivery", "Action"],
    rows: [
      { name: "Sunshine Dairy Co.", detail: "Cream, butter and milk", cells: ["PO #2241", "18 items", "$284.50"], status: "Today 10–11", action: "Receive" },
      { name: "Golden Grain Supplies", detail: "Flour, oats and almonds", cells: ["PO #2242", "24 items", "$196.00"], status: "Tomorrow", action: "Confirm" },
      { name: "Berry & Bloom Farm", detail: "Strawberries, blueberries and mango", cells: ["PO #2239", "30 items", "$412.80"], status: "Thursday", action: "View" },
      { name: "SweetRoot Co.", detail: "Sugar and vanilla · invoice #558", cells: ["Bill", "2 items", "$158.00"], status: "Overdue", action: "Pay now" },
    ],
    sideTitle: "Bills & payments",
    sideIntro: "Payments requiring review or confirmation.",
    sideItems: [
      { title: "SweetRoot Co.", detail: "Invoice #558 · 4 days overdue", badge: "$158.00" },
      { title: "Golden Grain", detail: "Invoice #612 · due Jul 16", badge: "$196.00" },
      { title: "Cafe Essentials", detail: "Receipt matched and verified", badge: "Paid" },
    ],
  },
};

function WorkspacePage({ name, onAction }: { name: string; onAction: (label: string) => void }) {
  const data = moduleData[name];
  const [tab, setTab] = useState(data.tabs[0]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("priority");
  const matchesTab = (row: WorkspaceData["rows"][number]) => {
    if (tab === data.tabs[0]) return true;
    if (tab === "Uses available stock") return ["Uses stock", "Good fit"].includes(row.status);
    if (tab === "High demand") return row.status === "High demand";
    if (tab === "Use first") return ["Tomorrow", "4 days"].includes(row.status);
    if (tab === "Reorder soon") return row.action === "Reorder";
    if (tab === "Best prices & deals") return ["Best price", "Deal", "Save 61%"].includes(row.status);
    if (tab === "Price changes") return row.status === "Price rise";
    if (tab === "Deliveries") return row.cells[0].startsWith("PO");
    if (tab === "Bills due") return row.cells[0] === "Bill";
    return true;
  };
  const visibleRows = data.rows
    .filter(matchesTab)
    .filter((row) => `${row.name} ${row.detail} ${row.cells.join(" ")} ${row.status}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "status" ? a.status.localeCompare(b.status) : 0);
  return (
    <div className="workspace-layout">
      <main className="workspace-main" id="main">
        <div className="page-heading">
          <div><h1>{data.title}</h1><p>{data.intro}</p></div>
          <div className="heading-actions">
            <button className="primary-button" onClick={() => onAction(data.primaryAction)}>{data.primaryAction}</button>
          </div>
        </div>
        <div className="summary-pills">{data.pills.map((pill) => <span key={pill}>{pill}</span>)}</div>
        <section className="metrics" aria-label={`${name} summary`}>
          {data.metrics.map((metric) => <Metric {...metric} key={metric.label} />)}
        </section>
        <div className="sync-banner workspace-notice" role="status"><span className="sync-dot" />{data.notice}<button onClick={() => onAction("View recommendation")}>Review</button></div>
        <section aria-labelledby="workspace-table-title">
          <div className="section-bar">
            <div><h2 id="workspace-table-title">{data.tableTitle}</h2><p>Updated from your latest stock, supplier, and sales information.</p></div>
            <div className="filter-tabs compact" role="group" aria-label={`Filter ${data.tableTitle}`}>
              {data.tabs.map((item) => <button className={tab === item ? "active" : ""} aria-pressed={tab === item} key={item} onClick={() => setTab(item)}>{item}</button>)}
            </div>
          </div>
          <div className="table-tools">
            <label className="table-search"><span className="sr-only">Search {data.tableTitle}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${data.tableTitle.toLowerCase()}`} /></label>
            <label className="sort-control"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="priority">Recommended order</option><option value="name">Name A–Z</option><option value="status">Status</option></select></label>
            <span className="result-count" aria-live="polite">{visibleRows.length} {visibleRows.length === 1 ? "result" : "results"}</span>
          </div>
          <div className="table-wrap workspace-table" role="region" aria-label={data.tableTitle} tabIndex={0}>
            <table>
              <thead><tr>{data.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
              <tbody>{visibleRows.map((row) => (
                <tr key={`${row.name}-${row.detail}`}>
                  <td><span className="primary-cell"><b>{row.name}</b><small>{row.detail}</small></span></td>
                  {row.cells.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}
                  <td><span className={`status ${row.status.toLowerCase().replace(/ /g, "-")}`}>{row.status}</span></td>
                  <td><button className="table-action" onClick={() => onAction(`${row.action}: ${row.name}`)}>{row.action}</button></td>
                </tr>
              ))}
              {visibleRows.length === 0 && <tr><td colSpan={data.columns.length}><div className="table-empty"><b>No matching items</b><span>Try another filter or clear your search.</span><button onClick={() => { setQuery(""); setTab(data.tabs[0]); }}>Clear filters</button></div></td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <aside className="workspace-side">
        <div className="side-heading"><h2>{data.sideTitle}</h2><span>{data.sideItems.length}</span></div>
        <p>{data.sideIntro}</p>
        <div className="side-list">{data.sideItems.map((item) => (
          <button className="side-item" key={item.title} onClick={() => onAction(item.title)}>
            {item.image ? <img src={`${A}/${item.image}`} alt="" /> : <span className="side-marker" />}
            <span><b>{item.title}</b><small>{item.detail}</small></span>
            <strong>{item.badge}</strong>
          </button>
        ))}</div>
      </aside>
    </div>
  );
}

type DecisionItem = {
  id: string;
  tone: "urgent" | "warning" | "info" | "positive";
  category: string;
  title: string;
  summary: string;
  detail: string;
  actions: { label: string; page?: string; modal?: string }[];
};

function DecisionList({ items, expanded, onExpand, onNavigate, onAction }: { items: DecisionItem[]; expanded: string; onExpand: (id: string) => void; onNavigate: (page: string) => void; onAction: (label: string) => void }) {
  return <div className="decision-list">{items.map((item) => {
    const isOpen = expanded === item.id;
    return <article className={`decision-row ${item.tone}`} key={item.id}>
      <button className="decision-summary" onClick={() => onExpand(isOpen ? "" : item.id)} aria-expanded={isOpen}>
        <span className="decision-dot" /><span className="decision-category">{item.category}</span><span className="decision-copy"><b>{item.title}</b><small>{item.summary}</small></span><span className="decision-chevron" aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className="decision-detail"><p>{item.detail}</p><div>{item.actions.map((action) => <button className={action.modal ? "primary-button" : "secondary-button"} key={action.label} onClick={() => action.page ? onNavigate(action.page) : onAction(action.modal || action.label)}>{action.label}</button>)}</div></div>}
    </article>;
  })}</div>;
}

function OverviewPage({ onNavigate, onAction }: { onNavigate: (page: string) => void; onAction: (label: string) => void }) {
  const [expanded, setExpanded] = useState("cream-expiry");
  const [activityTab, setActivityTab] = useState("Upcoming orders");
  const priorities: DecisionItem[] = [
    { id: "cream-expiry", tone: "urgent", category: "Expires soon", title: "Heavy cream expires tomorrow", summary: "1.4 L remaining · $8.26 estimated value", detail: "The sample inventory links this cream to Strawberry Shortcake, Coffee Cream, and Mango Yuzu Parfaits.", actions: [{ label: "View ingredient", page: "Inventory" }, { label: "See possible uses", page: "Flavor Lab" }] },
    { id: "granola-low", tone: "warning", category: "Low stock", title: "Granola is below minimum stock", summary: "2 kg remaining · about 2 days of stock", detail: "Golden Grain Supplies lists $4.20/kg. SweetRoots lists a higher unit price with a same-day delivery option.", actions: [{ label: "Compare suppliers", page: "Suppliers" }, { label: "Create order", modal: "Create purchase order" }] },
    { id: "delivery", tone: "info", category: "Arriving today", title: "Sunshine Dairy delivery at 10–11 AM", summary: "18 items · $284.50 · PO #2241", detail: "The delivery includes cream, butter, and milk. Check quantities and temperatures when it arrives.", actions: [{ label: "View order", page: "Orders" }] },
    { id: "bill", tone: "urgent", category: "Payment due", title: "SweetRoot bill is 4 days overdue", summary: "$158.00 · invoice #558", detail: "This bill is matched to its receipt and ready to pay. Paying it will clear the only overdue supplier balance.", actions: [{ label: "Review bill", page: "Orders" }] },
  ];
  const performance: DecisionItem[] = [
    { id: "sales-today", tone: "positive", category: "Sample sales · Jul 14", title: "$847 across 31 transactions", summary: "Average order $5.96 · illustrative records", detail: "These are historical sample figures. No live sales feed or transaction matching is configured.", actions: [{ label: "Review sales", page: "Sales & Votes" }] },
    { id: "best-seller", tone: "positive", category: "Selling quickly", title: "Mango Yuzu Parfait is nearly sold out", summary: "34 sold · 97% sell-through · 6 portions left", detail: "At the current pace it may sell out before 2 PM. Review the recipe before preparing another batch.", actions: [{ label: "View product sales", page: "Sales & Votes" }, { label: "View recipe", page: "Recipes" }] },
      { id: "slow-seller", tone: "warning", category: "Sitting unsold", title: "Blueberry Lemon Parfait is moving slowly", summary: "14 sold · 56% sell-through · compote expires soon", detail: "Sales are slower than the other listed flavours. Consider a smaller batch that uses the compote before it expires.", actions: [{ label: "Review sales", page: "Sales & Votes" }] },
    { id: "cost-change", tone: "warning", category: "Cost change", title: "Heavy cream cost increased 18%", summary: "Now $6.20/L from PeakDairy", detail: "Coconut cream is $2.40/L from FreshFarm and can replace heavy cream in two current recipes.", actions: [{ label: "Compare suppliers", page: "Suppliers" }, { label: "View substitutes", page: "Inventory" }] },
  ];
  const activity: Record<string, { title: string; meta: string; value: string; action: string; page: string }[]> = {
    "Upcoming orders": [
      { title: "Sunshine Dairy Co.", meta: "Today, 10–11 AM · 18 items", value: "$284.50", action: "Track", page: "Orders" },
      { title: "Golden Grain Supplies", meta: "Tomorrow · 24 items", value: "$196.00", action: "Review", page: "Orders" },
      { title: "Berry & Bloom Farm", meta: "Thursday · 30 items", value: "$412.80", action: "Review", page: "Orders" },
    ],
    "Recent bills": [
      { title: "Cafe Essentials", meta: "Paid Jul 12 · receipt matched", value: "$67.20", action: "View", page: "Orders" },
      { title: "Verifone processing", meta: "Paid Jul 10 · tax recorded", value: "$86.40", action: "View", page: "Taxes" },
      { title: "SweetRoot Co.", meta: "Overdue · ready to pay", value: "$158.00", action: "Pay", page: "Orders" },
    ],
    "Useful trends": [
      { title: "Ingredient waste", meta: "Down $12 from last week", value: "$38", action: "Review", page: "Inventory" },
      { title: "Average ingredient cost", meta: "Up 3% this month", value: "$2.18", action: "Compare", page: "Suppliers" },
      { title: "Comeback flavor votes", meta: "Coffee Cream leads this week", value: "196", action: "View", page: "Sales & Votes" },
    ],
  };
  return (
    <main className="overview-page decision-dashboard" id="main">
      <div className="page-heading overview-heading">
        <div><span className="eyebrow">Monday, July 14</span><h1>Good morning</h1><p>Four items need attention before today&apos;s service gets busy.</p></div>
        <div className="heading-actions"><button className="secondary-button" onClick={() => onNavigate("Orders")}>Review orders</button><button className="primary-button" onClick={() => onAction("Record a new sale")}>Record sale</button></div>
      </div>
      <div className="overview-status"><span className="sync-dot" /><b>Sample workspace.</b> The sales figures shown are illustrative and are not connected to Verifone.<button onClick={() => onNavigate("Sales & Votes")}>View sales</button></div>

      <nav className="operations-flow" aria-label="Bakery operations flow">
        <span className="flow-caption">Follow the work</span>
        {[["Supplier costs", "Suppliers"], ["Inventory", "Inventory"], ["Expiry", "Inventory"], ["Products", "Recipes"], ["Sales", "Sales & Votes"], ["Customer demand", "Sales & Votes"], ["Purchasing", "Orders"]].map(([label, page], index) => <span className="flow-step" key={`${label}-${index}`}>
          {index > 0 && <span className="flow-arrow" aria-hidden="true">→</span>}
          <button onClick={() => onNavigate(page)}>{label}</button>
        </span>)}
      </nav>

      <section className="dashboard-section priority-section" aria-labelledby="priorities-title">
        <div className="dashboard-section-heading"><div><span className="section-number">1</span><div><h2 id="priorities-title">Today&apos;s priorities</h2><p>Expiry, low stock, deliveries, and payments requiring action.</p></div></div><span className="attention-count">4 items</span></div>
        <DecisionList items={priorities} expanded={expanded} onExpand={setExpanded} onNavigate={onNavigate} onAction={onAction} />
      </section>

      <section className="dashboard-section" aria-labelledby="performance-title">
        <div className="dashboard-section-heading"><div><span className="section-number">2</span><div><h2 id="performance-title">How today is going</h2><p>Only the sales and cost signals that may change what you do next.</p></div></div></div>
        <DecisionList items={performance} expanded={expanded} onExpand={setExpanded} onNavigate={onNavigate} onAction={onAction} />
      </section>

      <section className="dashboard-section activity-section" aria-labelledby="activity-title">
        <div className="dashboard-section-heading"><div><span className="section-number">3</span><div><h2 id="activity-title">Coming up</h2><p>Orders, payments, and trends to review after today&apos;s priorities.</p></div></div></div>
        <div className="activity-tabs" role="group" aria-label="Coming up information">{Object.keys(activity).map((tab) => <button aria-pressed={activityTab === tab} className={activityTab === tab ? "active" : ""} onClick={() => setActivityTab(tab)} key={tab}>{tab}</button>)}</div>
        <div className="activity-list">{activity[activityTab].map((item) => <div className="activity-row" key={item.title}><span><b>{item.title}</b><small>{item.meta}</small></span><strong>{item.value}</strong><button onClick={() => onNavigate(item.page)}>{item.action}</button></div>)}</div>
      </section>
    </main>
  );
}

const purchaseCatalog: Record<string, number> = {
  "Granola · 1kg": 4.2,
  "Heavy cream · 2L": 11.8,
  "Fresh strawberries · 500g": 3.2,
  "Frozen mango · 1kg": 4.68,
  "Blueberry compote · 1kg": 4.8,
  "Matcha powder · 1kg": 5.1,
  "Coconut cream · 1L": 2.4,
  "Matcha powder · 250g": 12.75,
};

function useDialogFocus(onClose: () => void) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.getAttribute("aria-hidden") !== "true");
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first?.focus();
      }
    };
    (focusable()[0] || dialog).focus();
    dialog.addEventListener("keydown", handleKeyDown);
    return () => {
      dialog.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return dialogRef;
}

function PurchaseOrderModal({ onClose, initialSupplier = "Sunshine Dairy Co.", initialItems = [] }: { onClose: () => void; initialSupplier?: string; initialItems?: PurchaseItem[] }) {
  const dialogRef = useDialogFocus(onClose);
  const [supplier, setSupplier] = useState(initialSupplier);
  const [delivery, setDelivery] = useState("2025-07-16");
  const [items, setItems] = useState<PurchaseItem[]>(initialItems.length ? initialItems : [{ id: 1, ingredient: "Heavy cream · 2L", quantity: 2, price: 11.8 }]);
  const [notes, setNotes] = useState("Please call before delivery.");
  const [created, setCreated] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const tax = subtotal * 0.08;
  const updateItem = (id: number, changes: Partial<PurchaseItem>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  const addItem = () => setItems((current) => [...current, { id: Date.now(), ingredient: "Fresh strawberries · 500g", quantity: 1, price: 3.2 }]);
  const removeItem = (id: number) => setItems((current) => current.filter((item) => item.id !== id));
  if (created) return (
    <div className="modal-backdrop" role="presentation">
      <section ref={dialogRef} tabIndex={-1} className="modal purchase-modal success-modal" role="dialog" aria-modal="true" aria-labelledby="purchase-success-title">
        <span className="success-mark">Done</span><span className="modal-kicker">Example order preview</span>
        <h2 id="purchase-success-title">Order preview ready</h2><p>This ${ (subtotal + tax).toFixed(2) } example order for {supplier} is shown for review. It has not been saved or sent.</p>
        <div className="order-success-details"><span>Delivery requested</span><b>{delivery}</b><span>Items</span><b>{items.length}</b></div>
        <div className="modal-actions"><button className="primary-button" onClick={onClose}>Close preview</button></div>
      </section>
    </div>
  );
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} tabIndex={-1} className="modal purchase-modal" role="dialog" aria-modal="true" aria-labelledby="purchase-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close purchase order">×</button>
        <span className="modal-kicker">Order preview</span><h2 id="purchase-title">Review example order</h2><p>Adjust ingredients and quantities to preview an example order. Nothing is saved or sent.</p>
        <div className="purchase-fields">
          <label>Supplier<select value={supplier} onChange={(event) => setSupplier(event.target.value)}><option>Sunshine Dairy Co.</option><option>FreshFarm</option><option>SweetRoots</option><option>Golden Grain Supplies</option><option>PeakDairy</option><option>Berry &amp; Bloom Farm</option><option>Pantry Co.</option></select></label>
          <label>Requested delivery<input type="date" value={delivery} onChange={(event) => setDelivery(event.target.value)} /></label>
        </div>
        <div className="purchase-items-heading"><h3>Order items</h3><button onClick={addItem}>+ Add ingredient</button></div>
        <div className="purchase-items">
          {items.map((item) => <div className="purchase-item" key={item.id}>
            <label><span>Ingredient</span><select value={item.ingredient} onChange={(event) => updateItem(item.id, { ingredient: event.target.value, price: purchaseCatalog[event.target.value] })}>{Object.keys(purchaseCatalog).map((name) => <option key={name}>{name}</option>)}</select></label>
            <label><span>Quantity</span><input min="1" type="number" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Math.max(1, Number(event.target.value)) })} /></label>
            <span className="line-total"><small>Line total</small><b>${(item.quantity * item.price).toFixed(2)}</b></span>
            <button className="remove-item" onClick={() => removeItem(item.id)} disabled={items.length === 1} aria-label={`Remove ${item.ingredient}`}>×</button>
          </div>)}
        </div>
        <label className="purchase-notes">Order notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        <div className="purchase-summary"><span>Subtotal<b>${subtotal.toFixed(2)}</b></span><span>Example tax (8%)<b>${tax.toFixed(2)}</b></span><strong>Order total<b>${(subtotal + tax).toFixed(2)}</b></strong></div>
        <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={() => setCreated(true)} disabled={!items.length}>Preview total</button></div>
      </section>
    </div>
  );
}

function Modal({ title, onClose }: { title: string; onClose: () => void }) {
  const dialogRef = useDialogFocus(onClose);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} tabIndex={-1} className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">×</button>
        <span className="modal-kicker">Demo action</span>
        <h2 id="dialog-title">{title}</h2>
        <p>This action is represented in the demo only. No records are changed or saved, and no external service is contacted.</p>
        <div className="modal-actions"><button className="primary-button" onClick={onClose}>Close</button></div>
      </section>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("Overview");
  const [modal, setModal] = useState("");
  const [supplierNeed, setSupplierNeed] = useState("granola");
  const [flavorOpportunity, setFlavorOpportunity] = useState("strawberry");
  const [recipeToOpen, setRecipeToOpen] = useState<string | undefined>();
  const [purchaseDraft, setPurchaseDraft] = useState<{ supplier: string; items: PurchaseItem[] } | null>(null);
  const closePurchaseOrder = () => { setModal(""); setPurchaseDraft(null); };
  const handleAction = (label: string) => {
    if (label.toLowerCase().includes("purchase order")) {
      setPurchaseDraft(null);
      setModal("Create purchase order");
      return;
    }
    setModal(label);
  };
  const openSuppliersFor = (ingredient: string) => {
    const normalized = ingredient.toLowerCase();
    setSupplierNeed(normalized.includes("strawberr") ? "strawberries" : normalized.includes("cream") ? "cream" : normalized.includes("mango") ? "mango" : normalized.includes("matcha") ? "matcha" : normalized.includes("blueberry") || normalized.includes("compote") ? "compote" : "granola");
    setActive("Suppliers");
  };
  const openFlavorForIngredient = (ingredient: string) => {
    const normalized = ingredient.toLowerCase();
    setFlavorOpportunity(normalized.includes("mango") ? "mango" : normalized.includes("blueberry") || normalized.includes("compote") ? "blueberry" : "strawberry");
    setActive("Flavor Lab");
  };
  const openRecipe = (recipe: string) => {
    setRecipeToOpen(recipe);
    setActive("Recipes");
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to main content</a>
      <Header active={active} onNavigate={setActive} />
      <div className="sample-data-banner" role="note"><b>Demo data</b><span>Illustrative records dated July 2025. Interactive changes are temporary and reset when you leave a section or reload.</span></div>
      {active === "Overview" ? <OverviewPage onNavigate={setActive} onAction={handleAction} /> : active === "Sales & Votes" ? <SalesDashboard onOrder={() => openFlavorForIngredient("strawberries")} onNavigate={setActive} onSupplierFor={openSuppliersFor} onOpenRecipe={openRecipe} /> : active === "Recipes" ? <RecipesPage key={recipeToOpen || "default"} initialRecipe={recipeToOpen} onAction={handleAction} /> : active === "Flavor Lab" ? <FlavorLabPage key={flavorOpportunity} initialOpportunity={flavorOpportunity} onNavigate={setActive} /> : active === "Inventory" ? <InventoryPage onNavigate={setActive} onAction={handleAction} onSupplierFor={openSuppliersFor} onOpenRecipe={openRecipe} onCreateFlavor={openFlavorForIngredient} /> : active === "Suppliers" ? <SuppliersPage key={supplierNeed} initialNeed={supplierNeed} onCreateOrder={(supplier, items) => { setPurchaseDraft({ supplier, items }); setModal("Create purchase order"); }} /> : active === "Taxes" ? <TaxesPage onAction={handleAction} /> : <WorkspacePage key={active} name={active} onAction={handleAction} />}
      {(modal === "Create purchase order" || modal === "New purchase order") ? <PurchaseOrderModal onClose={closePurchaseOrder} initialSupplier={purchaseDraft?.supplier} initialItems={purchaseDraft?.items} /> : modal && <Modal title={modal} onClose={() => setModal("")} />}
    </div>
  );
}
