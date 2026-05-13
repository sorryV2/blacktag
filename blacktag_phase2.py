from pathlib import Path
import re

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")
if not page.exists():
    raise SystemExit("ERRORE: page.tsx non trovato. Esegui nella root del progetto BLACKTAG.")

s = page.read_text(encoding="utf-8")

old_menu = '{ title: "STRUMENTI AI", items: [["Generatore Descrizioni", Bot], ["Ricerca Trend", Search], ["Suggeritore Prezzi", Sparkles]] },'
new_menu = '{ title: "TIKTOK & VINTED", items: [["TikTok Shop", TrendingUp], ["Vinted Center", ShoppingBag], ["Content Planner", Calendar]] },\n  { title: "STRUMENTI AI", items: [["AI Tools", Wand2], ["Generatore Descrizioni", Bot], ["Ricerca Trend", Search], ["Suggeritore Prezzi", Sparkles]] },'
if "TikTok Shop" not in s:
    s = s.replace(old_menu, new_menu)

route_marker = '        {active === "Generatore Descrizioni" && <DescriptionGenerator />}'
routes = '''        {active === "TikTok Shop" && <TikTokShopSection products={products} expenses={expenses} />}
        {active === "Vinted Center" && <VintedCenterSection products={products} generateVintedDraft={generateVintedDraft} setActive={setActive} />}
        {active === "Content Planner" && <ContentPlannerSection />}
        {active === "AI Tools" && <AIToolsSection products={products} stats={stats} />}
'''
if '{active === "TikTok Shop"' not in s:
    s = s.replace(route_marker, routes + route_marker, 1)

s = s.replace(
'{active === "Suggeritore Prezzi" && <Empty title="Suggeritore Prezzi" text="Qui calcoleremo prezzo consigliato, margine, profitto e prezzo minimo." icon={Sparkles} />}',
'{active === "Suggeritore Prezzi" && <PriceAdvisorSection products={products} />}'
)

components = r'''

function getPhase2Metrics(products: any[], expenses: any[]) {
  const sold = products.filter((p) => p.status === "Venduto");
  const stock = products.filter((p) => p.status !== "Venduto");
  const revenue = sold.reduce((sum, p) => sum + Number(p.price || 0), 0);
  const cost = sold.reduce((sum, p) => sum + Number(p.cost || 0), 0);
  const fees = sold.reduce((sum, p) => sum + Number(p.fee || 0), 0);
  const expensesTotal = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netProfit = revenue - cost - fees - expensesTotal;
  const stockValue = stock.reduce((sum, p) => sum + Number(p.cost || 0), 0);
  const roi = cost > 0 ? (netProfit / cost) * 100 : 0;
  return { sold, stock, revenue, cost, fees, expensesTotal, netProfit, stockValue, roi };
}

function TikTokShopSection({ products, expenses }: any) {
  const metrics = getPhase2Metrics(products, expenses);
  const tiktokProducts = products.filter((p: any) => (p.platform || "").toLowerCase().includes("tiktok"));
  const ideas = [
    { name: "Unboxing prodotto", hook: "Ho trovato questo prodotto a poco e il margine è alto", score: 91 },
    { name: "Prima/Dopo outfit", hook: "Questo cambia completamente il fit", score: 86 },
    { name: "3 motivi per comprarlo", hook: "Se vendi online ti serve questo prodotto", score: 79 },
  ];

  return (
    <section className="space-y-5">
      <Panel>
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-200">
              <span className="h-2 w-2 rounded-full bg-pink-400 shadow-lg shadow-pink-400/60" />
              TIKTOK SHOP CENTER
            </div>
            <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">TikTok Shop</h3>
            <p className="text-sm text-zinc-400">Prodotti virali, idee video, fee, ROI e strategia contenuti.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
            Prodotti TikTok: <b className="text-pink-300">{tiktokProducts.length}</b>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Metric title="Profitto Netto" value={`€${metrics.netProfit.toFixed(2)}`} tone={metrics.netProfit >= 0 ? "green" : "red"} />
          <Metric title="ROI" value={`${metrics.roi.toFixed(1)}%`} tone="purple" />
          <Metric title="Fee Totali" value={`€${metrics.fees.toFixed(2)}`} tone="yellow" />
          <Metric title="Stock Value" value={`€${metrics.stockValue.toFixed(2)}`} tone="blue" />
        </div>
      </Panel>

      <Panel>
        <h4 className="mb-4 text-xl font-black">Viral Product Finder</h4>
        <div className="grid gap-3 md:grid-cols-3">
          {ideas.map((idea) => (
            <div key={idea.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <b>{idea.name}</b>
                <span className="rounded-xl bg-pink-500/20 px-2 py-1 text-xs font-black text-pink-200">{idea.score}</span>
              </div>
              <p className="text-sm text-zinc-400">{idea.hook}</p>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function VintedCenterSection({ products, generateVintedDraft, setActive }: any) {
  const upload = products.filter((p: any) => p.status === "Da Caricare");
  const online = products.filter((p: any) => p.status === "Online");
  const sold = products.filter((p: any) => p.status === "Venduto");

  return (
    <section className="space-y-5">
      <Panel>
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-200">
              <span className="h-2 w-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/60" />
              VINTED CENTER
            </div>
            <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">Vinted Automation</h3>
            <p className="text-sm text-zinc-400">Bozze, prodotti da caricare, online, venduti e pricing AI.</p>
          </div>
          <button onClick={() => setActive("Inventario")} className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-5 py-3 text-sm font-black shadow-lg shadow-purple-700/25">
            Apri Inventario
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Metric title="Prodotti" value={products.length} tone="purple" />
          <Metric title="Da Caricare" value={upload.length} tone="yellow" />
          <Metric title="Online" value={online.length} tone="blue" />
          <Metric title="Venduti" value={sold.length} tone="green" />
        </div>
      </Panel>

      <Panel>
        <h4 className="mb-4 text-xl font-black">Bozze rapide Vinted</h4>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 6).map((product: any) => (
            <div key={product.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center gap-3">
                <img src={product.image} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-black">{product.name}</p>
                  <p className="text-xs text-zinc-500">{product.brand} · {product.size || "Taglia"}</p>
                </div>
              </div>
              <button onClick={() => generateVintedDraft(product)} className="w-full rounded-xl bg-purple-500/20 px-3 py-2 text-xs font-black text-purple-200">
                Genera descrizione
              </button>
            </div>
          ))}
          {products.length === 0 && <p className="text-sm text-zinc-400">Nessun prodotto ancora.</p>}
        </div>
      </Panel>
    </section>
  );
}

function ContentPlannerSection() {
  const [ideas, setIdeas] = useState<any[]>(() => loadLS("bt-content-planner", []));
  const [topic, setTopic] = useState("");

  useEffect(() => {
    localStorage.setItem("bt-content-planner", JSON.stringify(ideas));
  }, [ideas]);

  function addIdea() {
    if (!topic.trim()) return;
    setIdeas((prev) => [
      {
        id: Date.now(),
        topic,
        hook: `POV: hai trovato ${topic} a prezzo basso e vuoi rivenderlo`,
        caption: `${topic} disponibile ora. Scrivimi per info.`,
        hashtags: "#vinted #tiktokshop #resell #blacktag",
        status: "Da fare",
      },
      ...prev,
    ]);
    setTopic("");
  }

  return (
    <Panel>
      <div className="mb-5">
        <h3 className="text-3xl font-black tracking-[-0.04em]">Content Planner</h3>
        <p className="text-sm text-zinc-400">Hook, caption, CTA e hashtag per TikTok/Reels.</p>
      </div>

      <div className="mb-5 flex gap-3">
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Es. Nike Tech Fleece" className="w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-3 text-sm text-white outline-none" />
        <button onClick={addIdea} className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-5 py-3 text-sm font-black">Genera</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ideas.map((idea) => (
          <div key={idea.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-2 flex items-center justify-between">
              <b>{idea.topic}</b>
              <span className="rounded-lg bg-yellow-500/15 px-2 py-1 text-xs text-yellow-300">{idea.status}</span>
            </div>
            <p className="text-sm text-zinc-300">{idea.hook}</p>
            <p className="mt-3 text-xs text-zinc-500">{idea.caption}</p>
            <p className="mt-3 text-xs text-purple-300">{idea.hashtags}</p>
            <button onClick={() => setIdeas((prev) => prev.filter((x) => x.id !== idea.id))} className="mt-4 rounded-xl bg-red-500/15 px-3 py-2 text-xs font-black text-red-300">Elimina</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AIToolsSection({ products, stats }: any) {
  const best = [...products].sort((a: any, b: any) => (Number(b.price || 0) - Number(b.cost || 0)) - (Number(a.price || 0) - Number(a.cost || 0)))[0];

  return (
    <Panel>
      <div className="mb-5">
        <h3 className="text-3xl font-black tracking-[-0.04em]">AI Tools BLACKTAG</h3>
        <p className="text-sm text-zinc-400">Suggerimenti automatici su prezzi, margini e prodotti.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5">
          <Sparkles className="mb-3 text-purple-300" />
          <h4 className="font-black">Miglior prodotto</h4>
          <p className="mt-2 text-sm text-zinc-300">{best ? best.name : "Aggiungi prodotti per iniziare."}</p>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
          <TrendingUp className="mb-3 text-green-300" />
          <h4 className="font-black">Profitto attuale</h4>
          <p className="mt-2 text-2xl font-black text-green-300">€{stats.profit.toFixed(2)}</p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
          <Bot className="mb-3 text-blue-300" />
          <h4 className="font-black">Consiglio AI</h4>
          <p className="mt-2 text-sm text-zinc-300">Imposta fee e piattaforma per calcolare margini più precisi.</p>
        </div>
      </div>
    </Panel>
  );
}

function PriceAdvisorSection({ products }: any) {
  return (
    <Panel>
      <h3 className="mb-5 text-3xl font-black tracking-[-0.04em]">Suggeritore Prezzi</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product: any) => {
          const cost = Number(product.cost || 0);
          const fee = Number(product.fee || 0);
          const suggested = cost * 2.15 + fee;
          const min = cost * 1.45 + fee;
          return (
            <div key={product.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-black">{product.name}</p>
              <p className="text-xs text-zinc-500">{product.brand}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-green-500/10 p-3">
                  <p className="text-xs text-zinc-500">Consigliato</p>
                  <b className="text-green-300">€{suggested.toFixed(2)}</b>
                </div>
                <div className="rounded-xl bg-yellow-500/10 p-3">
                  <p className="text-xs text-zinc-500">Minimo</p>
                  <b className="text-yellow-300">€{min.toFixed(2)}</b>
                </div>
              </div>
            </div>
          );
        })}
        {products.length === 0 && <p className="text-sm text-zinc-400">Aggiungi prodotti per ricevere prezzi suggeriti.</p>}
      </div>
    </Panel>
  );
}
'''

if "function TikTokShopSection" not in s:
    s = s.replace("function CalendarPicker", components + "\nfunction CalendarPicker", 1)

page.write_text(s, encoding="utf-8")
print("OK: BLACKTAG Phase 2 installata.")
print("Ora fai: npm run dev")
