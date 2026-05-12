from pathlib import Path
import re

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")

if not page.exists():
    raise SystemExit("ERRORE: non trovo src/app/page.tsx. Esegui questo script nella root del progetto BLACKTAG.")

content = page.read_text(encoding="utf-8")

def replace_between(content, start_marker, end_marker, replacement):
    start = content.find(start_marker)
    end = content.find(end_marker, start)
    if start == -1 or end == -1:
        print(f"AVVISO: marker non trovato: {start_marker}")
        return content
    return content[:start] + replacement + content[end:]

# Tolgo i dati demo che ritornano dopo update/cache/localStorage vuoto
content = replace_between(content, "const defaultProducts: Product[] = [", "const defaultClients:", "const defaultProducts: Product[] = [];\n\n")
content = replace_between(content, "const defaultSuppliers: Supplier[] = [", "const defaultSupplierOrders:", "const defaultSuppliers: Supplier[] = [];\n\n")
content = replace_between(content, "const defaultSupplierOrders: SupplierOrder[] = [", "const defaultTrackingOrders:", "const defaultSupplierOrders: SupplierOrder[] = [];\n\n")
content = replace_between(content, "const defaultTrackingOrders: TrackingOrder[] = [", "const defaultExpenses:", "const defaultTrackingOrders: TrackingOrder[] = [];\n\n")
content = replace_between(content, "const defaultExpenses: Expense[] = [", "const defaultTrends:", "const defaultExpenses: Expense[] = [];\n\n")
content = replace_between(content, "const defaultTrends: TrendItem[] = [", "const imageList", "const defaultTrends: TrendItem[] = [];\n\n")

# Se imageList era basata su defaultProducts, ora serve fallback per non rompere addProduct
content = content.replace(
    "const imageList = defaultProducts.map((p) => p.image);",
    "const imageList = [\n  \"https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400&auto=format&fit=crop\",\n];"
)

# Aggiungo helper cloud globale per cancellare davvero da Supabase anche fuori da HomePage
if "async function deleteCloudRow" not in content:
    marker = "function removeEmptyRows"
    helper = "async function deleteCloudRow(table: string, id: number) {\n  if (!supabase) return;\n\n  await supabase.from(table).delete().eq(\"id\", id);\n}\n\n"
    content = content.replace(marker, helper + marker, 1)

# Fornitori: quando premi Elimina, cancella anche da Supabase
content = re.sub(
    r'onClick=\{\(\) => \{ setSuppliers\(\(prev: Supplier\[\]\) => prev\.filter\(\(s\) => s\.id !== supplier\.id\)\);\s*(?:deleteFromSupabase\("suppliers", supplier\.id\);\s*)?\}\}',
    'onClick={() => { setSuppliers((prev: Supplier[]) => prev.filter((s) => s.id !== supplier.id)); deleteCloudRow("suppliers", supplier.id); }}',
    content
)

page.write_text(content, encoding="utf-8")
print("PATCH COMPLETATA: tolti dati demo e fix cancellazione fornitori cloud.")
print("Ora fai: npm run dev")
