
from pathlib import Path

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")

if not page.exists():
    raise SystemExit("ERRORE: page.tsx non trovato")

s = page.read_text(encoding="utf-8")

if "async function syncLocalToCloud()" not in s:
    marker = '''  useEffect(() => {
    refreshCloudData();
  }, []);'''

    insert = '''  useEffect(() => {
    refreshCloudData();
  }, []);

  async function syncLocalToCloud() {
    if (!supabase) {
      setCloudReady(true);
      return;
    }

    try {
      setIsSyncingCloud(true);
      setCloudError("");

      await Promise.all([
        replaceSupabaseTable("products", products),
        replaceSupabaseTable("clients", clients),
        replaceSupabaseTable("suppliers", suppliers),
        replaceSupabaseTable("supplier_orders", supplierOrders),
        replaceSupabaseTable("expenses", expenses),
      ]);

      setCloudReady(true);
      addNotification("Sync completato", "Dati salvati su Supabase.", "success");
    } catch (error: any) {
      setCloudError(error?.message || "Errore salvataggio su Supabase");
    } finally {
      setIsSyncingCloud(false);
    }
  }'''

    if marker not in s:
        raise SystemExit("ERRORE: non trovo il punto dove inserire syncLocalToCloud")
    s = s.replace(marker, insert, 1)

s = s.replace("onClick={refreshCloudData}", "onClick={syncLocalToCloud}")
s = s.replace('{isSyncingCloud ? "Sync..." : "🔄 Sync"}', '{isSyncingCloud ? "Salvo..." : "🔄 Salva"}')
s = s.replace('<span className="truncate">Sync</span>', '<span className="truncate">Salva</span>')

page.write_text(s, encoding="utf-8")
print("OK: Sync ora SALVA su Supabase invece di cancellare prendendo dati vecchi.")
print("Ora fai: npm run dev")
