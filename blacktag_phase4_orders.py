
from pathlib import Path

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")
if not page.exists():
    raise SystemExit("ERRORE: page.tsx non trovato. Esegui nella root del progetto BLACKTAG.")

s = page.read_text(encoding="utf-8")

if '["Ordini Pro", ReceiptText]' not in s:
    s = s.replace(
        '{ title: "VINTED BUSINESS", items: [["Inventario", Package], ["Da Caricare", Upload], ["Online", Globe], ["Venduti", ShoppingBag], ["Ordini da Spedire", Truck], ["Tracking Ordini", Truck], ["Statistiche", BarChart3]] },',
        '{ title: "VINTED BUSINESS", items: [["Inventario", Package], ["Da Caricare", Upload], ["Online", Globe], ["Venduti", ShoppingBag], ["Ordini da Spedire", Truck], ["Ordini Pro", ReceiptText], ["Tracking Ordini", Truck], ["Statistiche", BarChart3]] },'
    )

if 'bt-sales-orders' not in s:
    marker = '''  const [trackingOrders, setTrackingOrders] = useState<TrackingOrder[]>(() =>
    loadLS("bt-tracking-orders", defaultTrackingOrders)
  );'''
    insert = marker + '''
  const [salesOrders, setSalesOrders] = useState<any[]>(() =>
    loadLS("bt-sales-orders", [])
  );'''
    s = s.replace(marker, insert, 1)

if 'localStorage.setItem("bt-sales-orders"' not in s:
    marker = '''  useEffect(() => {
    localStorage.setItem("bt-tracking-orders", JSON.stringify(trackingOrders));
  }, [trackingOrders]);'''
    insert = marker + '''

  useEffect(() => {
    localStorage.setItem("bt-sales-orders", JSON.stringify(salesOrders));
  }, [salesOrders]);'''
    s = s.replace(marker, insert, 1)

if '"Ordini Pro": salesOrders.length' not in s:
    s = s.replace(
        '"Tracking Ordini": trackingOrders.length,',
        '"Tracking Ordini": trackingOrders.length,\n    "Ordini Pro": salesOrders.length,'
    )

if '{active === "Ordini Pro"' not in s:
    marker = '        {active === "Tracking Ordini" && <TrackingOrdersSection orders={trackingOrders} setOrders={setTrackingOrders} />}'
    insert = '        {active === "Ordini Pro" && <OrdersProSection products={products} setProducts={setProducts} orders={salesOrders} setOrders={setSalesOrders} addNotification={addNotification} />}'
    s = s.replace(marker, insert + "\n" + marker, 1)

component = r'''
function OrdersProSection({ products, setProducts, orders, setOrders, addNotification }: any) {
  const statuses = ["Venduto", "Da spedire", "Spedito", "Consegnato", "Reso"];
  const couriers = ["Poste Italiane", "BRT", "SDA", "DHL", "UPS", "GLS", "InPost", "Altro"];

  function productById(id: any) {
    return products.find((p: any) => String(p.id) === String(id));
  }

  function makeOrderFromProduct(product: any) {
    if (!product) return;

    const price = Number(product.price || 0);
    const cost = Number(product.cost || 0);
    const fee = Number(product.fee || 0);

    const order = {
      id: Date.now(),
      code: `BT-ORD-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productName: product.name || "Prodotto",
      platform: product.platform || "Vinted",
      buyer: "",
      salePrice: price,
      productCost: cost,
      platformFee: fee,
      shippingCost: 0,
      netProfit: price - cost - fee,
      status: "Venduto",
      tracking: "",
      courier: "Poste Italiane",
      saleDate: new Date().toISOString().slice(0, 10),
      notes: "",
    };

    setOrders((prev: any[]) => [order, ...prev]);

    setProducts((prev: any[]) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, status: "Venduto" }
          : p
      )
    );

    addNotification?.("Ordine creato", `${product.name} segnato come venduto.`, "success");
  }

  function addBlankOrder() {
    const firstProduct = products[0];
    const price = Number(firstProduct?.price || 0);
    const cost = Number(firstProduct?.cost || 0);
    const fee = Number(firstProduct?.fee || 0);

    setOrders((prev: any[]) => [
      {
        id: Date.now(),
        code: `BT-ORD-${Date.now().toString().slice(-6)}`,
        productId: firstProduct?.id || "",
        productName: firstProduct?.name || "Ordine manuale",
        platform: firstProduct?.platform || "Vinted",
        buyer: "",
        salePrice: price,
        productCost: cost,
        platformFee: fee,
        shippingCost: 0,
        netProfit: price - cost - fee,
        status: "Venduto",
        tracking: "",
        courier: "Poste Italiane",
        saleDate: new Date().toISOString().slice(0, 10),
        notes: "",
      },
      ...prev,
    ]);
  }

  function updateOrder(id: number, field: string, value: any) {
    setOrders((prev: any[]) =>
      prev.map((order) => {
        if (order.id !== id) return order;

        const next = {
          ...order,
          [field]:
            ["salePrice", "productCost", "platformFee", "shippingCost"].includes(field)
              ? Number(value || 0)
              : value,
        };

        if (field === "productId") {
          const product = productById(value);
          if (product) {
            next.productName = product.name;
            next.platform = product.platform || next.platform || "Vinted";
            next.salePrice = Number(product.price || 0);
            next.productCost = Number(product.cost || 0);
            next.platformFee = Number(product.fee || 0);
          }
        }

        next.netProfit =
          Number(next.salePrice || 0) -
          Number(next.productCost || 0) -
          Number(next.platformFee || 0) -
          Number(next.shippingCost || 0);

        return next;
      })
    );
  }

  function deleteOrder(id: number) {
    setOrders((prev: any[]) => prev.filter((order) => order.id !== id));
  }

  function markProductStatus(order: any, status: string) {
    updateOrder(order.id, "status", status);

    if (order.productId) {
      setProducts((prev: any[]) =>
        prev.map((product) =>
          String(product.id) === String(order.productId)
            ? { ...product, status: status === "Reso" ? "Online" : "Venduto" }
            : product
        )
      );
    }
  }

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.salePrice || 0), 0);
  const totalProfit = orders.reduce((sum: number, order: any) => sum + Number(order.netProfit || 0), 0);
  const shippingTotal = orders.reduce((sum: number, order: any) => sum + Number(order.shippingCost || 0), 0);
  const pending = orders.filter((order: any) => order.status === "Da spedire" || order.status === "Venduto").length;

  return (
    <section className="space-y-5">
      <Panel>
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-200">
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-lg shadow-green-400/60" />
              ORDERS PRO
            </div>
            <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">Ordini & Profitto Reale</h3>
            <p className="text-sm text-zinc-400">Collega vendite ai prodotti, tracking, buyer, corriere e profitto netto.</p>
          </div>

          <button
            onClick={addBlankOrder}
            className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-5 py-3 text-sm font-black shadow-lg shadow-purple-700/25"
          >
            + Ordine manuale
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Metric title="Ordini" value={orders.length} tone="purple" />
          <Metric title="Fatturato" value={`€${totalRevenue.toFixed(2)}`} tone="blue" />
          <Metric title="Profitto Netto" value={`€${totalProfit.toFixed(2)}`} tone={totalProfit >= 0 ? "green" : "red"} />
          <Metric title="Da spedire" value={pending} tone={pending > 0 ? "yellow" : "green"} />
        </div>
      </Panel>

      <Panel>
        <div className="mb-5">
          <h4 className="text-xl font-black">Crea ordine da prodotto</h4>
          <p className="text-sm text-zinc-400">Seleziona un prodotto in stock e trasformalo in ordine venduto.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {products.filter((p: any) => p.status !== "Venduto").slice(0, 8).map((product: any) => (
            <div key={product.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center gap-3">
                <img src={product.image} alt={product.name} className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-black">{product.name}</p>
                  <p className="text-xs text-zinc-500">€{Number(product.price || 0).toFixed(2)} · {product.platform || "Vinted"}</p>
                </div>
              </div>
              <button onClick={() => makeOrderFromProduct(product)} className="w-full rounded-xl bg-green-500/20 px-3 py-2 text-xs font-black text-green-200">
                Segna venduto
              </button>
            </div>
          ))}
          {products.filter((p: any) => p.status !== "Venduto").length === 0 && (
            <p className="text-sm text-zinc-400">Nessun prodotto disponibile da vendere.</p>
          )}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {statuses.map((status) => (
          <Panel key={status}>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-black">{status}</h4>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                {orders.filter((order: any) => order.status === status).length}
              </span>
            </div>

            <div className="space-y-3">
              {orders.filter((order: any) => order.status === status).map((order: any) => (
                <div key={order.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-purple-300">{order.code}</p>
                      <input value={order.productName || ""} onChange={(e) => updateOrder(order.id, "productName", e.target.value)} className="mt-1 w-full bg-transparent text-sm font-black outline-none" />
                    </div>
                    <button onClick={() => deleteOrder(order.id)} className="rounded-lg bg-red-500/20 px-2 py-1 text-xs text-red-300">X</button>
                  </div>

                  <select value={order.productId || ""} onChange={(e) => updateOrder(order.id, "productId", e.target.value)} className="mb-2 w-full rounded-xl border border-white/10 bg-[#171925] px-3 py-2 text-xs text-white outline-none">
                    <option value="">Ordine manuale</option>
                    {products.map((product: any) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2">
                    <input value={order.platform || ""} onChange={(e) => updateOrder(order.id, "platform", e.target.value)} placeholder="Piattaforma" className="rounded-xl border border-white/10 bg-[#171925]/80 px-3 py-2 text-xs text-white outline-none" />
                    <input value={order.buyer || ""} onChange={(e) => updateOrder(order.id, "buyer", e.target.value)} placeholder="Buyer" className="rounded-xl border border-white/10 bg-[#171925]/80 px-3 py-2 text-xs text-white outline-none" />
                    <input type="number" value={order.salePrice || ""} onChange={(e) => updateOrder(order.id, "salePrice", e.target.value)} placeholder="Vendita" className="rounded-xl border border-white/10 bg-[#171925]/80 px-3 py-2 text-xs text-white outline-none" />
                    <input type="number" value={order.productCost || ""} onChange={(e) => updateOrder(order.id, "productCost", e.target.value)} placeholder="Costo" className="rounded-xl border border-white/10 bg-[#171925]/80 px-3 py-2 text-xs text-white outline-none" />
                    <input type="number" value={order.platformFee || ""} onChange={(e) => updateOrder(order.id, "platformFee", e.target.value)} placeholder="Fee" className="rounded-xl border border-white/10 bg-[#171925]/80 px-3 py-2 text-xs text-white outline-none" />
                    <input type="number" value={order.shippingCost || ""} onChange={(e) => updateOrder(order.id, "shippingCost", e.target.value)} placeholder="Spedizione" className="rounded-xl border border-white/10 bg-[#171925]/80 px-3 py-2 text-xs text-white outline-none" />
                  </div>

                  <div className={`mt-3 rounded-xl p-3 ${Number(order.netProfit || 0) >= 0 ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"}`}>
                    <p className="text-xs text-zinc-400">Profitto netto</p>
                    <p className="text-xl font-black">€{Number(order.netProfit || 0).toFixed(2)}</p>
                  </div>

                  <input value={order.tracking || ""} onChange={(e) => updateOrder(order.id, "tracking", e.target.value)} placeholder="Tracking number" className="mt-2 w-full rounded-xl border border-white/10 bg-[#171925]/80 px-3 py-2 text-xs text-purple-200 outline-none" />

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <select value={order.courier || "Poste Italiane"} onChange={(e) => updateOrder(order.id, "courier", e.target.value)} className="rounded-xl border border-white/10 bg-[#171925] px-3 py-2 text-xs text-white outline-none">
                      {couriers.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <input type="date" value={order.saleDate || ""} onChange={(e) => updateOrder(order.id, "saleDate", e.target.value)} className="rounded-xl border border-white/10 bg-[#171925]/80 px-3 py-2 text-xs text-white outline-none" />
                  </div>

                  <select value={order.status} onChange={(e) => markProductStatus(order, e.target.value)} className="mt-2 w-full rounded-xl border border-purple-400/25 bg-[#171925] px-3 py-2 text-xs font-bold text-white outline-none">
                    {statuses.map((item) => <option key={item}>{item}</option>)}
                  </select>

                  <textarea value={order.notes || ""} onChange={(e) => updateOrder(order.id, "notes", e.target.value)} placeholder="Note ordine..." className="mt-2 h-16 w-full resize-none rounded-xl border border-white/10 bg-[#171925]/80 px-3 py-2 text-xs text-white outline-none" />
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <Panel>
        <h4 className="mb-4 text-xl font-black">Riepilogo economico ordini</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Metric title="Fatturato" value={`€${totalRevenue.toFixed(2)}`} tone="blue" />
          <Metric title="Spedizioni" value={`€${shippingTotal.toFixed(2)}`} tone="yellow" />
          <Metric title="Profitto" value={`€${totalProfit.toFixed(2)}`} tone={totalProfit >= 0 ? "green" : "red"} />
          <Metric title="Margine Medio" value={`€${orders.length ? (totalProfit / orders.length).toFixed(2) : "0.00"}`} tone="purple" />
        </div>
      </Panel>
    </section>
  );
}

'''

if "function OrdersProSection" not in s:
    s = s.replace("function CalendarPicker", component + "\nfunction CalendarPicker", 1)

page.write_text(s, encoding="utf-8")
print("OK: BLACKTAG Phase 4 Orders Pro installata.")
print("Ora fai: npm run dev")
