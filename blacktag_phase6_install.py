from pathlib import Path

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")

if not page.exists():
    raise SystemExit("page.tsx non trovato")

text = page.read_text(encoding="utf-8")

if "CalendarDays" not in text:
    text = text.replace(
        "Video,",
        "Video, CalendarDays, TrendingUp, Crown, BellRing,",
        1
    )

if '[\"Phase 6\",' not in text:
    text = text.replace(
        '["Content AI", Video]]',
        '["Content AI", Video], ["Phase 6", TrendingUp]]'
    )

if "bt-trend-posts" not in text:
    marker = 'loadLS("bt-content-drafts", [])\n  );'
    insert = '''loadLS("bt-content-drafts", [])
  );

  const [trendPosts, setTrendPosts] = useState<any[]>(() =>
    loadLS("bt-trend-posts", [
      {
        id: 1,
        title: "Nike tech dark fit",
        score: 94,
        hour: "19:30",
        platform: "TikTok"
      }
    ])
  );

  const [vipClients, setVipClients] = useState<any[]>(() =>
    loadLS("bt-vip-clients", [])
  );'''
    text = text.replace(marker, insert)

if 'bt-trend-posts' not in text.split('bt-content-drafts')[-1]:
    text = text.replace(
        'localStorage.setItem("bt-content-drafts", JSON.stringify(contentDrafts));',
        '''localStorage.setItem("bt-content-drafts", JSON.stringify(contentDrafts));
    localStorage.setItem("bt-trend-posts", JSON.stringify(trendPosts));
    localStorage.setItem("bt-vip-clients", JSON.stringify(vipClients));'''
    )

if '"Phase 6": trendPosts.length' not in text:
    text = text.replace(
        '"Content AI": contentDrafts.length,',
        '"Content AI": contentDrafts.length,\n    "Phase 6": trendPosts.length,'
    )

route = '{active === "Phase 6" && <Phase6Section trendPosts={trendPosts} vipClients={vipClients} setVipClients={setVipClients} />}'

if route not in text:
    text = text.replace(
        '{active === "Content AI"',
        route + '\n        {active === "Content AI"',
        1
    )

component = '''

function Phase6Section({ trendPosts, vipClients, setVipClients }: any) {

  function addVip() {
    const name = prompt("Nome cliente VIP");
    if (!name) return;

    setVipClients((prev: any[]) => [
      {
        id: Date.now(),
        name,
        spent: Math.floor(Math.random() * 3000) + 200,
        notes: "Cliente premium",
        reminder: "Ricontattare presto"
      },
      ...prev
    ]);
  }

  return (
    <section className="space-y-5">

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm text-zinc-400">Trend attivi</div>
          <div className="mt-3 text-4xl font-black">{trendPosts.length}</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm text-zinc-400">Clienti VIP</div>
          <div className="mt-3 text-4xl font-black">{vipClients.length}</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm text-zinc-400">Viral score</div>
          <div className="mt-3 text-4xl font-black">87%</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm text-zinc-400">Best posting hour</div>
          <div className="mt-3 text-4xl font-black">19:30</div>
        </div>

      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black">CRM VIP</h3>
            <p className="text-sm text-zinc-400">Clienti premium reseller</p>
          </div>

          <button
            onClick={addVip}
            className="rounded-2xl bg-yellow-500/20 px-4 py-2 text-sm font-black text-yellow-200"
          >
            + VIP
          </button>
        </div>

        <div className="space-y-3">
          {vipClients.map((client: any) => (
            <div key={client.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <div className="font-black">{client.name}</div>
                <div className="text-fuchsia-300">€{client.spent}</div>
              </div>

              <div className="mt-2 text-sm text-zinc-400">
                {client.notes}
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
'''

if "function Phase6Section" not in text:
    text = text.replace(
        "function ContentAISection",
        component + "\nfunction ContentAISection",
        1
    )

page.write_text(text, encoding="utf-8")

print("BLACKTAG Phase 6 installata")
print("npm run dev")
