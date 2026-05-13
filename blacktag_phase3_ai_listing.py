
from pathlib import Path

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")
if not page.exists():
    raise SystemExit("ERRORE: page.tsx non trovato. Esegui nella root del progetto BLACKTAG.")

s = page.read_text(encoding="utf-8")

s = s.replace('["Generatore Descrizioni", Bot]', '["Listing Generator", Bot]')

if '{active === "Listing Generator"' not in s:
    old = '        {active === "Generatore Descrizioni" && <DescriptionGenerator />}'
    new = '        {active === "Listing Generator" && <AIListingGenerator products={products} setActive={setActive} />}'
    if old in s:
        s = s.replace(old, new, 1)
    else:
        marker = '        {active === "AI Tools" && <AIToolsSection products={products} stats={stats} />}'
        s = s.replace(marker, marker + '\n        {active === "Listing Generator" && <AIListingGenerator products={products} setActive={setActive} />}', 1)

component = '''
function AIListingGenerator({ products, setActive }: any) {
  const [selectedId, setSelectedId] = useState<string>(() => loadLS("bt-ai-listing-selected", ""));
  const [platform, setPlatform] = useState<string>(() => loadLS("bt-ai-listing-platform", "Vinted"));
  const [extra, setExtra] = useState<string>(() => loadLS("bt-ai-listing-extra", ""));
  const [draft, setDraft] = useState<any>(() => loadLS("bt-ai-listing-draft", null));
  const [savedDrafts, setSavedDrafts] = useState<any[]>(() => loadLS("bt-ai-listing-drafts", []));

  const selectedProduct = products.find((p: any) => String(p.id) === String(selectedId)) || products[0];

  useEffect(() => localStorage.setItem("bt-ai-listing-selected", JSON.stringify(selectedId)), [selectedId]);
  useEffect(() => localStorage.setItem("bt-ai-listing-platform", JSON.stringify(platform)), [platform]);
  useEffect(() => localStorage.setItem("bt-ai-listing-extra", JSON.stringify(extra)), [extra]);
  useEffect(() => localStorage.setItem("bt-ai-listing-draft", JSON.stringify(draft)), [draft]);
  useEffect(() => localStorage.setItem("bt-ai-listing-drafts", JSON.stringify(savedDrafts)), [savedDrafts]);

  function cleanHash(text: string) {
    return String(text || "").replaceAll(" ", "").replaceAll("-", "").toLowerCase();
  }

  function detectCategory(product: any) {
    const text = `${product?.name || ""} ${product?.brand || ""} ${product?.category || ""}`.toLowerCase();
    if (text.includes("scarpe") || text.includes("samba") || text.includes("dunk")) return "Scarpe";
    if (text.includes("hoodie") || text.includes("felpa") || text.includes("fleece")) return "Felpe";
    if (text.includes("giacca") || text.includes("jacket")) return "Giacche";
    if (text.includes("pantal") || text.includes("cargo") || text.includes("jeans")) return "Pantaloni";
    if (text.includes("shirt") || text.includes("maglia") || text.includes("tee")) return "T-Shirt";
    return product?.category || "Streetwear";
  }

  function generateListing(product: any) {
    if (!product) return;

    const cost = Number(product.cost || 0);
    const price = Number(product.price || 0);
    const fee = Number(product.fee || 0);
    const brand = product.brand || "Brand";
    const name = product.name || "Prodotto";
    const size = product.size || "Taglia da verificare";
    const category = detectCategory(product);
    const condition = product.condition || "Ottime condizioni";
    const targetPrice = price > 0 ? price : Math.max(9.99, cost * 2.15 + fee);
    const minPrice = Math.max(0, cost * 1.45 + fee);
    const profit = targetPrice - cost - fee;

    const title = platform === "TikTok Shop"
      ? `${brand} ${name} | ${category} virale`
      : `${brand} ${name} ${size}`;

    const intro = platform === "TikTok Shop"
      ? `Prodotto perfetto per video outfit, haul e resell. ${brand} ${name} e facile da mostrare e vendere.`
      : `${brand} ${name} disponibile, controllato e pronto da spedire.`;

    const description = `${title}

${intro}

Dettagli:
- Brand: ${brand}
- Categoria: ${category}
- Taglia: ${size}
- Condizione: ${condition}
- Prezzo consigliato: €${targetPrice.toFixed(2)}

${extra ? `Note extra: ${extra}\\n\\n` : ""}Perche comprarlo:
- Prodotto controllato
- Spedizione veloce
- Imballaggio curato
- Disponibile subito

${platform === "TikTok Shop" ? "CTA: Ordina ora prima che finisca lo stock." : "Scrivimi per info o foto aggiuntive."}`;

    const hashtags = platform === "TikTok Shop"
      ? `#blacktag #resell #tiktokshop #viralproduct #haul #outfit #${cleanHash(brand)}`
      : `#blacktag #vinted #vinteditalia #resell #streetwear #secondhand #${cleanHash(brand)}`;

    setDraft({
      id: Date.now(),
      productId: product.id,
      productName: name,
      platform,
      title,
      description,
      hashtags,
      targetPrice,
      minPrice,
      profit,
      checklist: [
        "Foto frontale pulita",
        "Foto logo/brand",
        "Foto taglia/etichetta",
        "Prezzo controllato",
        "Descrizione copiata",
        "Hashtag inseriti",
        "Stato prodotto aggiornato",
      ],
      createdAt: new Date().toLocaleString("it-IT"),
    });
  }

  function copyAll() {
    if (!draft) return;
    const text = `${draft.title}

${draft.description}

Hashtag:
${draft.hashtags}

Prezzo consigliato: €${draft.targetPrice.toFixed(2)}
Prezzo minimo: €${draft.minPrice.toFixed(2)}
Profitto stimato: €${draft.profit.toFixed(2)}`;
    navigator.clipboard?.writeText(text);
  }

  function saveDraft() {
    if (!draft) return;
    setSavedDrafts((prev) => [draft, ...prev.filter((item) => item.id !== draft.id)].slice(0, 30));
  }

  return (
    <section className="space-y-5">
      <Panel>
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-200">
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-lg shadow-green-400/60" />
              AI LISTING GENERATOR
            </div>
            <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">Generatore Listing AI</h3>
            <p className="text-sm text-zinc-400">Titolo, descrizione, hashtag, prezzo consigliato e checklist per Vinted/TikTok Shop.</p>
          </div>

          <button onClick={() => setActive("Inventario")} className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-zinc-100">
            Apri Inventario
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <div>
            <label className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Prodotto</label>
            <select value={selectedId || selectedProduct?.id || ""} onChange={(e) => setSelectedId(e.target.value)} className="mt-1 w-full rounded-2xl border border-purple-400/25 bg-[#171925] px-4 py-3 text-sm font-black text-white outline-none">
              {products.map((product: any) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Piattaforma</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1 w-full rounded-2xl border border-purple-400/25 bg-[#171925] px-4 py-3 text-sm font-black text-white outline-none">
              <option>Vinted</option>
              <option>TikTok Shop</option>
              <option>eBay</option>
              <option>Instagram</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Note extra</label>
            <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Difetti, fit, materiale..." className="mt-1 w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-3 text-sm text-white outline-none" />
          </div>

          <div className="flex items-end">
            <button onClick={() => generateListing(selectedProduct)} disabled={!selectedProduct} className="w-full rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-5 py-3 text-sm font-black shadow-lg shadow-purple-700/25 disabled:opacity-50">
              Genera Listing
            </button>
          </div>
        </div>
      </Panel>

      {draft && (
        <div className="grid gap-5 xl:grid-cols-3">
          <Panel className="xl:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-2xl font-black tracking-[-0.03em]">Listing generato</h4>
                <p className="text-xs text-zinc-500">{draft.createdAt}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={copyAll} className="rounded-xl bg-purple-500/20 px-4 py-2 text-xs font-black text-purple-200">Copia tutto</button>
                <button onClick={saveDraft} className="rounded-xl bg-green-500/20 px-4 py-2 text-xs font-black text-green-200">Salva bozza</button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">Titolo</p>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full bg-transparent text-xl font-black outline-none" />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">Descrizione</p>
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="h-80 w-full resize-none bg-transparent text-sm leading-6 text-zinc-100 outline-none" />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">Hashtag</p>
                <textarea value={draft.hashtags} onChange={(e) => setDraft({ ...draft, hashtags: e.target.value })} className="h-20 w-full resize-none bg-transparent text-sm text-purple-200 outline-none" />
              </div>
            </div>
          </Panel>

          <Panel>
            <h4 className="mb-4 text-xl font-black">Prezzo & Checklist</h4>
            <div className="grid grid-cols-1 gap-3">
              <Metric title="Prezzo AI" value={`€${draft.targetPrice.toFixed(2)}`} tone="green" />
              <Metric title="Prezzo minimo" value={`€${draft.minPrice.toFixed(2)}`} tone="yellow" />
              <Metric title="Profitto stimato" value={`€${draft.profit.toFixed(2)}`} tone={draft.profit >= 0 ? "green" : "red"} />
            </div>

            <div className="mt-5 space-y-2">
              {draft.checklist.map((item: string) => (
                <label key={item} className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-purple-600" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </Panel>
        </div>
      )}

      <Panel>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-xl font-black">Bozze salvate</h4>
          <button onClick={() => setSavedDrafts([])} className="rounded-xl bg-red-500/15 px-3 py-2 text-xs font-black text-red-300">Pulisci</button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {savedDrafts.map((item) => (
            <button key={item.id} onClick={() => setDraft(item)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-purple-500/30">
              <p className="truncate font-black">{item.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{item.platform} · {item.createdAt}</p>
              <p className="mt-3 text-sm text-green-300">€{item.targetPrice.toFixed(2)}</p>
            </button>
          ))}
          {savedDrafts.length === 0 && <p className="text-sm text-zinc-400">Nessuna bozza salvata.</p>}
        </div>
      </Panel>
    </section>
  );
}
'''

if "function AIListingGenerator" not in s:
    s = s.replace("function CalendarPicker", component + "\nfunction CalendarPicker", 1)

page.write_text(s, encoding="utf-8")
print("OK: BLACKTAG Phase 3 AI Listing Generator installata.")
print("Ora fai: npm run dev")
