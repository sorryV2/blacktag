from pathlib import Path
import re

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")
if not page.exists():
    raise SystemExit("ERRORE: page.tsx non trovato. Esegui questo script nella root del progetto BLACKTAG.")

s = page.read_text(encoding="utf-8")

# Demo data vuoti
repls = [
    (r'const defaultProducts\s*:\s*Product\[\]\s*=\s*\[.*?\];', 'const defaultProducts: Product[] = [];'),
    (r'const defaultClients\s*:\s*Client\[\]\s*=\s*\[.*?\];', 'const defaultClients: Client[] = [];'),
    (r'const defaultSuppliers\s*:\s*Supplier\[\]\s*=\s*\[.*?\];', 'const defaultSuppliers: Supplier[] = [];'),
    (r'const defaultSupplierOrders\s*:\s*SupplierOrder\[\]\s*=\s*\[.*?\];', 'const defaultSupplierOrders: SupplierOrder[] = [];'),
    (r'const defaultTrackingOrders\s*:\s*TrackingOrder\[\]\s*=\s*\[.*?\];', 'const defaultTrackingOrders: TrackingOrder[] = [];'),
    (r'const defaultExpenses\s*:\s*Expense\[\]\s*=\s*\[.*?\];', 'const defaultExpenses: Expense[] = [];'),
    (r'const defaultTrends\s*:\s*TrendItem\[\]\s*=\s*\[.*?\];', 'const defaultTrends: TrendItem[] = [];'),
]
for pat, rep in repls:
    s = re.sub(pat, rep, s, flags=re.S)

# fallback image list
s = s.replace(
    "const imageList = defaultProducts.map((p) => p.image);",
    "const imageList = [\"https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400&auto=format&fit=crop\"];"
)

# Fix graffa extra che chiude HomePage
bad = """  async function deleteFromSupabase(table: string, id: number) {
    if (!supabase) return;

    const result = await supabase.from(table).delete().eq("id", id);
    if (result.error) {
      setCloudError(result.error.message || "Errore eliminazione cloud");
    }
  }
  }

  function addProduct() {"""
good = """  async function deleteFromSupabase(table: string, id: number) {
    if (!supabase) return;

    const result = await supabase.from(table).delete().eq("id", id);
    if (result.error) {
      setCloudError(result.error.message || "Errore eliminazione cloud");
    }
  }

  function addProduct() {"""
s = s.replace(bad, good)

# Local data priority
old_load = """  useEffect(() => {
    refreshCloudData();
  }, []);"""
new_load = """  useEffect(() => {
    const hasLocalData =
      typeof window !== "undefined" &&
      (
        localStorage.getItem("bt-products") ||
        localStorage.getItem("bt-clients") ||
        localStorage.getItem("bt-suppliers") ||
        localStorage.getItem("bt-supplier-orders") ||
        localStorage.getItem("bt-expenses") ||
        localStorage.getItem("bt-tracking-orders")
      );

    if (hasLocalData) {
      setCloudReady(true);
      return;
    }

    refreshCloudData();
  }, []);"""
if old_load in s:
    s = s.replace(old_load, new_load, 1)

# replaceSupabaseTable definitivo
pattern = r'  async function replaceSupabaseTable\(table: string, rows: any\[\]\) \{.*?\n  \}'
replacement = """  async function replaceSupabaseTable(table: string, rows: any[]) {
    if (!supabase || !cloudReady) return;

    const cleanRows = removeEmptyRows(rows);
    const replaceTables = ["products", "clients", "suppliers", "supplier_orders", "expenses"];

    if (replaceTables.includes(table)) {
      const deleteResult = await supabase.from(table).delete().neq("id", 0);
      if (deleteResult.error) throw deleteResult.error;

      if (cleanRows.length > 0) {
        const insertResult = await supabase.from(table).insert(cleanRows);
        if (insertResult.error) throw insertResult.error;
      }

      return;
    }

    if (cleanRows.length > 0) {
      const upsertResult = await supabase
        .from(table)
        .upsert(cleanRows, { onConflict: "id" });

      if (upsertResult.error) throw upsertResult.error;
    }
  }"""
s, count = re.subn(pattern, replacement, s, count=1, flags=re.S)
print("replaceSupabaseTable:", count)

# Sync button = salva su Supabase
if 'async function syncLocalToCloud()' not in s and new_load in s:
    sync_fn = new_load + """

  async function syncLocalToCloud() {
    if (!supabase) {
      setCloudReady(true);
      addNotification("Salvataggio locale", "Supabase non configurato, dati salvati sul dispositivo.", "warning");
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
  }"""
    s = s.replace(new_load, sync_fn, 1)

s = s.replace("onClick={refreshCloudData}", "onClick={syncLocalToCloud}")
s = s.replace('{isSyncingCloud ? "Sync..." : "🔄 Sync"}', '{isSyncingCloud ? "Salvo..." : "🔄 Salva"}')
s = s.replace('<span className="truncate">Sync</span>', '<span className="truncate">Salva</span>')

# Input numerici cancellabili
s = s.replace('[field]: field === "cost" || field === "price" ? Number(value) : value,',
              '[field]: field === "cost" || field === "price" ? (value === "" ? ("" as any) : Number(value)) : value,')

# addProduct stabile con campi extra
add_pat = r'  function addProduct\(\) \{.*?setActive\(\"Inventario\"\);\s*\}'
add_rep = """  function addProduct() {
    const id = Date.now();

    setProducts((prev) => [
      ...prev,
      {
        id,
        name: "Nuovo prodotto",
        brand: "Brand",
        size: "",
        image: imageList[0],
        cost: "" as any,
        price: "" as any,
        status: "Da Caricare",
        sku: `BT-${id}` as any,
        category: "" as any,
        condition: "" as any,
        platform: "Vinted" as any,
        fee: "" as any,
        notes: "" as any,
      } as any,
    ]);

    setActive("Inventario");
  }"""
s, acount = re.subn(add_pat, add_rep, s, count=1, flags=re.S)
print("addProduct:", acount)

page.write_text(s, encoding="utf-8")
print("OK: BLACKTAG Phase 1 Core Build V2 applicata.")
print("Ora fai: npm run dev")