
from pathlib import Path

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")
if not page.exists():
    raise SystemExit("ERRORE: page.tsx non trovato.")

s = page.read_text(encoding="utf-8")

# MENU
if '["Content AI", Video]' not in s:
    s = s.replace(
        '["Statistiche", BarChart3]] },',
        '["Statistiche", BarChart3], ["Content AI", Video]] },'
    )

# STATE
if 'bt-content-drafts' not in s:
    marker = '  const [salesOrders, setSalesOrders] = useState<any[]>(() =>\n    loadLS("bt-sales-orders", [])\n  );'
    insert = marker + '''

  const [contentDrafts, setContentDrafts] = useState<any[]>(() =>
    loadLS("bt-content-drafts", [])
  );'''
    s = s.replace(marker, insert)

# SAVE
if 'localStorage.setItem("bt-content-drafts"' not in s:
    marker = '  useEffect(() => {\n    localStorage.setItem("bt-sales-orders", JSON.stringify(salesOrders));\n  }, [salesOrders]);'
    insert = marker + '''

  useEffect(() => {
    localStorage.setItem("bt-content-drafts", JSON.stringify(contentDrafts));
  }, [contentDrafts]);'''
    s = s.replace(marker, insert)

# COUNTER
if '"Content AI": contentDrafts.length' not in s:
    s = s.replace(
        '"Ordini Pro": salesOrders.length,',
        '"Ordini Pro": salesOrders.length,\n    "Content AI": contentDrafts.length,'
    )

# ROUTE
if '{active === "Content AI"' not in s:
    marker = '{active === "Ordini Pro" && <OrdersProSection'
    insert = '{active === "Content AI" && <ContentAISection products={products} drafts={contentDrafts} setDrafts={setContentDrafts} />}'
    s = s.replace(marker, insert + '\n        ' + marker)

component = r'''
function ContentAISection({ products, drafts, setDrafts }: any) {
  const styles = {
    luxury: {
      hooks: [
        "POV: il fit più clean del 2026.",
        "Questo pezzo sembra uscito da una boutique da 1000€.",
        "Se conosci il resell, conosci questo item."
      ],
      captions: [
        "Luxury vibes only ✨",
        "Clean aesthetic.",
        "Silent flex."
      ]
    },
    hype: {
      hooks: [
        "QUESTO DROPA TROPPO HARD 🔥",
        "Il pezzo più richiesto del momento.",
        "TikTok sta impazzendo per questo."
      ],
      captions: [
        "HYPE MODE ON 🚀",
        "Drop assurdo.",
        "Chi lo prende vince."
      ]
    },
    clean: {
      hooks: [
        "Minimal ma perfetto.",
        "Simple fit, big aura.",
        "Dettagli che fanno la differenza."
      ],
      captions: [
        "Clean outfit.",
        "Minimal style.",
        "Everyday fit."
      ]
    },
    reseller: {
      hooks: [
        "Pagato poco, rivenduto alto 📈",
        "Il margine su questo è folle.",
        "Resell game attivo."
      ],
      captions: [
        "Profit mode.",
        "Resell ready.",
        "Business mindset."
      ]
    }
  };

  function generate(product: any, mode: string) {
    const set = styles[mode as keyof typeof styles] || styles.hype;

    const hook = set.hooks[Math.floor(Math.random() * set.hooks.length)];
    const caption = set.captions[Math.floor(Math.random() * set.captions.length)];

    const script = `
🎬 HOOK
${hook}

📦 PRODOTTO
${product.name}

💰 PREZZO
€${product.price || 0}

🎥 VIDEO FLOW
- close up prodotto
- transizione outfit
- dettagli materiale
- fit indossato
- ending con prezzo

📢 CTA
"Scrivimi in DM"
"Link in bio"
"Disponibile ora"

#fashion #streetwear #resell #vinted #blacktag
`;

    const draft = {
      id: Date.now(),
      productName: product.name,
      mode,
      hook,
      caption,
      script,
      createdAt: new Date().toLocaleString()
    };

    setDrafts((prev: any[]) => [draft, ...prev]);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  return (
    <section className="space-y-5">
      <Panel>
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs font-bold text-fuchsia-200">
            CONTENT AI
          </div>

          <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">
            TikTok / Reels AI Generator
          </h3>

          <p className="text-sm text-zinc-400">
            Genera hook virali, script video, caption e CTA per i tuoi prodotti.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 12).map((product: any) => (
            <div key={product.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <img
                src={product.image}
                alt={product.name}
                className="mb-3 h-40 w-full rounded-2xl object-cover"
              />

              <h4 className="truncate text-lg font-black">{product.name}</h4>
              <p className="mb-3 text-sm text-zinc-400">
                €{product.price || 0}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => generate(product, "luxury")} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold">
                  Luxury
                </button>

                <button onClick={() => generate(product, "hype")} className="rounded-xl bg-orange-500/20 px-3 py-2 text-xs font-bold text-orange-200">
                  Hype
                </button>

                <button onClick={() => generate(product, "clean")} className="rounded-xl bg-blue-500/20 px-3 py-2 text-xs font-bold text-blue-200">
                  Clean
                </button>

                <button onClick={() => generate(product, "reseller")} className="rounded-xl bg-green-500/20 px-3 py-2 text-xs font-bold text-green-200">
                  Reseller
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-black">Bozze Generate</h4>
            <p className="text-sm text-zinc-400">
              Script TikTok/Reels salvati automaticamente.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold">
            {drafts.length} bozze
          </div>
        </div>

        <div className="space-y-4">
          {drafts.map((draft: any) => (
            <div key={draft.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-bold text-fuchsia-200">
                  {draft.mode}
                </div>

                <div className="rounded-full bg-white/10 px-3 py-1 text-xs">
                  {draft.productName}
                </div>

                <div className="rounded-full bg-white/10 px-3 py-1 text-xs">
                  {draft.createdAt}
                </div>
              </div>

              <div className="mb-3 rounded-2xl bg-black/20 p-4">
                <p className="text-xs text-zinc-500">HOOK</p>
                <p className="mt-1 text-lg font-black">{draft.hook}</p>
              </div>

              <div className="mb-3 rounded-2xl bg-black/20 p-4">
                <p className="text-xs text-zinc-500">CAPTION</p>
                <p className="mt-1">{draft.caption}</p>
              </div>

              <textarea
                value={draft.script}
                readOnly
                className="h-64 w-full resize-none rounded-2xl border border-white/10 bg-[#171925] p-4 text-sm text-white outline-none"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => copy(draft.script)}
                  className="rounded-xl bg-green-500/20 px-4 py-2 text-sm font-black text-green-200"
                >
                  Copia Script
                </button>

                <button
                  onClick={() => copy(draft.caption)}
                  className="rounded-xl bg-blue-500/20 px-4 py-2 text-sm font-black text-blue-200"
                >
                  Copia Caption
                </button>

                <button
                  onClick={() => {
                    setDrafts((prev: any[]) => prev.filter((d) => d.id !== draft.id));
                  }}
                  className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-black text-red-200"
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}

          {drafts.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
              Nessuna bozza generata.
            </div>
          )}
        </div>
      </Panel>
    </section>
  );
}
'''

if "function ContentAISection" not in s:
    s = s.replace("function CalendarPicker", component + "\nfunction CalendarPicker", 1)

page.write_text(s, encoding="utf-8")
print("OK: BLACKTAG Phase 5 Content AI installata.")
print("Ora fai: npm run dev")
