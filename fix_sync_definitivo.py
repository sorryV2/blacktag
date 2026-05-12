
from pathlib import Path
import re

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")

if not page.exists():
    raise SystemExit("ERRORE: page.tsx non trovato")

s = page.read_text(encoding="utf-8")

pattern = r'''  async function replaceSupabaseTable\(table: string, rows: any\[\]\) \{.*?\n  \}'''

replacement = '''  async function replaceSupabaseTable(table: string, rows: any[]) {
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
  }'''

s2, count = re.subn(pattern, replacement, s, count=1, flags=re.S)

if count == 0:
    raise SystemExit("ERRORE: non ho trovato replaceSupabaseTable da sostituire")

if 'replaceSupabaseTable("expenses", expenses)' not in s2:
    marker = '''  useEffect(() => {
    localStorage.setItem("bt-expenses", JSON.stringify(expenses));
  }, [expenses]);'''
    insert = '''  useEffect(() => {
    localStorage.setItem("bt-expenses", JSON.stringify(expenses));

    if (!cloudReady) return;
    replaceSupabaseTable("expenses", expenses).catch((error) =>
      setCloudError(error?.message || "Errore salvataggio spese")
    );
  }, [expenses, cloudReady]);'''
    s2 = s2.replace(marker, insert, 1)

if 'replaceSupabaseTable("supplier_orders", supplierOrders)' not in s2:
    marker = '''  useEffect(() => {
    localStorage.setItem("bt-supplier-orders", JSON.stringify(supplierOrders));
  }, [supplierOrders]);'''
    insert = '''  useEffect(() => {
    localStorage.setItem("bt-supplier-orders", JSON.stringify(supplierOrders));

    if (!cloudReady) return;
    replaceSupabaseTable("supplier_orders", supplierOrders).catch((error) =>
      setCloudError(error?.message || "Errore salvataggio ordini fornitori")
    );
  }, [supplierOrders, cloudReady]);'''
    s2 = s2.replace(marker, insert, 1)

page.write_text(s2, encoding="utf-8")
print("OK: Sync sistemato davvero. Ora Supabase viene allineato a quello che vedi nell'app.")
print("Fai: npm run dev")
