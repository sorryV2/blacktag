from pathlib import Path
import re

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")

if not page.exists():
    raise SystemExit("ERRORE: non trovo src/app/page.tsx. Esegui lo script nella root del progetto BLACKTAG.")

content = page.read_text(encoding="utf-8")

# 1) Estende il type Client
old_client_type = """type Client = {
  id: number;
  name: string;
  business: string;
  monthly: number;
  paid: number;
  site: string;
  status: "Venduto" | "Attivo" | "Da contattare" | "In sviluppo";
};"""

new_client_type = """type Client = {
  id: number;
  name: string;
  business: string;
  monthly: number;
  paid: number;
  site: string;
  status: "Venduto" | "Attivo" | "Da contattare" | "In sviluppo";
  domain?: string;
  hosting?: string;
  domainExpiry?: string;
  hostingExpiry?: string;
  renewalDate?: string;
  paymentStatus?: "Pagato" | "Da pagare" | "Scaduto";
  lastInvoice?: string;
  notes?: string;
};"""

if old_client_type in content:
    content = content.replace(old_client_type, new_client_type)

# 2) Migliora PDF fattura con campi CRM
content = content.replace(
    "<p>Sito: ${client.site}</p>",
    """<p>Sito: ${client.site}</p>
            <p>Dominio: ${client.domain || "-"}</p>
            <p>Hosting: ${client.hosting || "-"}</p>
            <p>Stato pagamento: ${client.paymentStatus || "Da pagare"}</p>
            <p>Rinnovo: ${client.renewalDate || "-"}</p>
            <p>Scadenza dominio: ${client.domainExpiry || "-"}</p>
            <p>Scadenza hosting: ${client.hostingExpiry || "-"}</p>
            <p>Fattura: ${client.lastInvoice || "-"}</p>"""
)

# 3) Usa CRMProSection al posto della vecchia ClientsSection renderizzata
content = re.sub(
    r'\{active === "Clienti" && <ClientsSection clients=\{clients\} setClients=\{setClients\} exportClientInvoice=\{exportClientInvoice\} addNotification=\{addNotification\} />\}',
    '{active === "Clienti" && <CRMProSection clients={clients} setClients={setClients} exportClientInvoice={exportClientInvoice} addNotification={addNotification} />}',
    content
)

# 4) Aggiunge componenti CRM pro prima di SitesSection
if "function CRMProSection" not in content:
    insert_before = content.find("function SitesSection")
    if insert_before == -1:
        raise SystemExit("ERRORE: non trovo function SitesSection per inserire CRMProSection.")

    component = r"""
function crmDaysUntil(dateText?: string) {
  if (!dateText) return null;

  const today = new Date();
  const target = new Date(dateText);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function CRMProSection({ clients, setClients, exportClientInvoice, addNotification }: any) {
  const activeClients = clients.filter((client: Client) => client.status === "Attivo" || client.status === "Venduto");
  const totalMonthly = activeClients.reduce((sum: number, client: Client) => sum + Number(client.monthly || 0), 0);
  const totalPaid = clients.reduce((sum: number, client: Client) => sum + Number(client.paid || 0), 0);
  const openPayments = clients.filter((client: Client) => client.paymentStatus === "Da pagare" || client.paymentStatus === "Scaduto").length;
  const expiringDomains = clients.filter((client: Client) => {
    const days = crmDaysUntil(client.domainExpiry);
    return days !== null && days <= 30;
  }).length;

  function addClient() {
    setClients((prev: Client[]) => [
      ...prev,
      {
        id: Date.now(),
        name: "Nuovo Cliente",
        business: "Tipo attività",
        monthly: 0,
        paid: 0,
        site: "sitocliente.it",
        status: "Da contattare",
        domain: "sitocliente.it",
        hosting: "Vercel",
        domainExpiry: new Date().toISOString().slice(0, 10),
        hostingExpiry: new Date().toISOString().slice(0, 10),
        renewalDate: new Date().toISOString().slice(0, 10),
        paymentStatus: "Da pagare",
        lastInvoice: "",
        notes: "",
      },
    ]);
  }

  function deleteClient(id: number) {
    setClients((prev: Client[]) => prev.filter((client) => client.id !== id));
  }

  function updateClient(id: number, field: keyof Client, value: string) {
    const oldClient = clients.find((client: Client) => client.id === id);

    setClients((prev: Client[]) =>
      prev.map((client: Client) =>
        client.id === id
          ? {
              ...client,
              [field]: field === "monthly" || field === "paid" ? Number(value) : value,
            }
          : client
      )
    );

    if (field === "status" && oldClient?.status !== value && addNotification) {
      addNotification("Cliente aggiornato", `${oldClient?.name || "Cliente"} ora è ${value}.`, "info");
    }

    if (field === "paymentStatus" && value === "Pagato" && addNotification) {
      addNotification("Pagamento ricevuto", `${oldClient?.name || "Cliente"} segnato come pagato.`, "success");
    }
  }

  function paymentClass(value?: string) {
    if (value === "Pagato") return "border-green-500/20 bg-green-500/15 text-green-300";
    if (value === "Scaduto") return "border-red-500/20 bg-red-500/15 text-red-300";
    return "border-yellow-500/20 bg-yellow-500/15 text-yellow-300";
  }

  return (
    <section className="space-y-5">
      <Panel>
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-200">
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-lg shadow-green-400/60" />
              CRM CLIENTI WEB
            </div>
            <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">Clienti Siti Web</h3>
            <p className="text-sm text-zinc-400">Domini, hosting, rinnovi, pagamenti, fatture e note clienti.</p>
          </div>

          <button
            onClick={addClient}
            className="rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-600 px-5 py-3 text-sm font-black shadow-lg shadow-purple-700/25 transition hover:-translate-y-0.5 hover:shadow-purple-700/40"
          >
            + Aggiungi Cliente
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric title="MRR Mensile" value={`€${totalMonthly.toFixed(2)}`} tone="green" />
          <Metric title="Siti Pagati" value={`€${totalPaid.toFixed(2)}`} tone="purple" />
          <Metric title="Clienti Attivi" value={activeClients.length} tone="blue" />
          <Metric title="Pagamenti Aperti" value={openPayments} tone={openPayments ? "yellow" : "green"} />
          <Metric title="Domini 30gg" value={expiringDomains} tone={expiringDomains ? "red" : "blue"} />
        </div>
      </Panel>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((client: Client) => {
          const renewalDays = crmDaysUntil(client.renewalDate);
          const domainDays = crmDaysUntil(client.domainExpiry);
          const hostingDays = crmDaysUntil(client.hostingExpiry);

          return (
            <div key={client.id} className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0e19]/78 p-5 shadow-2xl shadow-black/45 backdrop-blur-2xl transition hover:border-purple-500/30">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl transition group-hover:bg-fuchsia-500/15" />

              <div className="relative z-10">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-purple-500/30 bg-purple-500/15 text-purple-200">
                    <Store size={22} />
                  </div>

                  <span className={`rounded-xl border px-3 py-1 text-xs font-black ${paymentClass(client.paymentStatus)}`}>
                    {client.paymentStatus || "Da pagare"}
                  </span>
                </div>

                <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Nome cliente</label>
                <input value={client.name} onChange={(e) => updateClient(client.id, "name", e.target.value)} className="mb-3 w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-3 text-lg font-black text-white outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20" />

                <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Tipo attività</label>
                <input value={client.business} onChange={(e) => updateClient(client.id, "business", e.target.value)} className="mb-3 w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Canone</label>
                    <div className="mt-1 flex items-center gap-2">
                      <span>€</span>
                      <input type="number" value={client.monthly} onChange={(e) => updateClient(client.id, "monthly", e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-3 font-black text-white outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Sito pagato</label>
                    <div className="mt-1 flex items-center gap-2">
                      <span>€</span>
                      <input type="number" value={client.paid} onChange={(e) => updateClient(client.id, "paid", e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-3 font-black text-white outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20" />
                    </div>
                  </div>
                </div>

                <label className="mt-3 block text-[11px] uppercase tracking-[0.14em] text-zinc-500">Sito web</label>
                <input value={client.site} onChange={(e) => updateClient(client.id, "site", e.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-3 text-sm font-semibold text-purple-200 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20" />

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Dominio</label>
                    <input value={client.domain || ""} onChange={(e) => updateClient(client.id, "domain", e.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-3 py-3 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Hosting</label>
                    <input value={client.hosting || ""} onChange={(e) => updateClient(client.id, "hosting", e.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-3 py-3 text-sm text-white outline-none" />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Rinnovo</label>
                    <input type="date" value={client.renewalDate || ""} onChange={(e) => updateClient(client.id, "renewalDate", e.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-3 py-3 text-sm text-white outline-none" />
                    <p className={`mt-1 text-xs ${renewalDays !== null && renewalDays <= 7 ? "text-red-300" : "text-zinc-500"}`}>{renewalDays === null ? "Nessuna data" : renewalDays < 0 ? `Scaduto da ${Math.abs(renewalDays)}g` : `${renewalDays}g`}</p>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Dominio exp</label>
                    <input type="date" value={client.domainExpiry || ""} onChange={(e) => updateClient(client.id, "domainExpiry", e.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-3 py-3 text-sm text-white outline-none" />
                    <p className={`mt-1 text-xs ${domainDays !== null && domainDays <= 30 ? "text-yellow-300" : "text-zinc-500"}`}>{domainDays === null ? "Nessuna data" : domainDays < 0 ? `Scaduto da ${Math.abs(domainDays)}g` : `${domainDays}g`}</p>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Hosting exp</label>
                    <input type="date" value={client.hostingExpiry || ""} onChange={(e) => updateClient(client.id, "hostingExpiry", e.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-3 py-3 text-sm text-white outline-none" />
                    <p className={`mt-1 text-xs ${hostingDays !== null && hostingDays <= 30 ? "text-yellow-300" : "text-zinc-500"}`}>{hostingDays === null ? "Nessuna data" : hostingDays < 0 ? `Scaduto da ${Math.abs(hostingDays)}g` : `${hostingDays}g`}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <select value={client.status} onChange={(e) => updateClient(client.id, "status", e.target.value)} className="rounded-xl border border-purple-400/25 bg-[#171925] px-3 py-3 text-xs font-bold text-white outline-none">
                    <option>Venduto</option>
                    <option>Attivo</option>
                    <option>Da contattare</option>
                    <option>In sviluppo</option>
                  </select>

                  <select value={client.paymentStatus || "Da pagare"} onChange={(e) => updateClient(client.id, "paymentStatus", e.target.value)} className="rounded-xl border border-purple-400/25 bg-[#171925] px-3 py-3 text-xs font-bold text-white outline-none">
                    <option>Pagato</option>
                    <option>Da pagare</option>
                    <option>Scaduto</option>
                  </select>
                </div>

                <label className="mt-3 block text-[11px] uppercase tracking-[0.14em] text-zinc-500">Ultima fattura</label>
                <input value={client.lastInvoice || ""} onChange={(e) => updateClient(client.id, "lastInvoice", e.target.value)} placeholder="Es. FT-001" className="mt-1 w-full rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-3 text-sm text-white outline-none" />

                <label className="mt-3 block text-[11px] uppercase tracking-[0.14em] text-zinc-500">Note</label>
                <textarea value={client.notes || ""} onChange={(e) => updateClient(client.id, "notes", e.target.value)} placeholder="Note cliente, modifiche richieste, prossimi step..." className="mt-1 h-20 w-full resize-none rounded-2xl border border-white/10 bg-[#171925]/80 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20" />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-zinc-500">
                    Valore annuo: <b className="text-green-300">€{(Number(client.monthly || 0) * 12).toFixed(2)}</b>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => exportClientInvoice && exportClientInvoice(client)} className="rounded-xl border border-purple-500/20 bg-purple-500/20 px-3 py-2 text-xs font-bold text-purple-200 transition hover:bg-purple-500/30">PDF</button>
                    <button onClick={() => deleteClient(client.id)} className="rounded-xl border border-red-500/20 bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/30">Elimina</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

"""
    content = content[:insert_before] + component + content[insert_before:]

page.write_text(content, encoding="utf-8")
print("PATCH COMPLETATA: CRM clienti aggiornato. Ora fai npm run dev")
