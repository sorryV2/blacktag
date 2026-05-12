from pathlib import Path
import re

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")

if not page.exists():
    raise SystemExit("ERRORE: non trovo src/app/page.tsx. Esegui questo script nella root del progetto BLACKTAG.")

content = page.read_text(encoding="utf-8")

if "async function deleteSupplier(id: number)" not in content:
    marker = "  function addProduct()"
    helper = '''  async function deleteSupplier(id: number) {
    setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));

    if (!supabase) return;

    const result = await supabase.from("suppliers").delete().eq("id", id);

    if (result.error) {
      setCloudError(result.error.message || "Errore eliminazione fornitore");
    }
  }

'''
    if marker not in content:
        raise SystemExit("ERRORE: non trovo function addProduct dove inserire deleteSupplier")
    content = content.replace(marker, helper + marker, 1)

content = content.replace(
    '{active === "Fornitori" && <SuppliersSection suppliers={suppliers} setSuppliers={setSuppliers} />}',
    '{active === "Fornitori" && <SuppliersSection suppliers={suppliers} setSuppliers={setSuppliers} deleteSupplier={deleteSupplier} />}'
)

content = content.replace(
    'function SuppliersSection({ suppliers, setSuppliers }: any) {',
    'function SuppliersSection({ suppliers, setSuppliers, deleteSupplier }: any) {'
)

patterns = [
    r'onClick=\{\(\) => \{ setSuppliers\(\(prev: Supplier\[\]\) => prev\.filter\(\(s\) => s\.id !== supplier\.id\)\);\s*deleteFromSupabase\("suppliers", supplier\.id\);\s*\}\}',
    r'onClick=\{\(\) => \{ setSuppliers\(\(prev: Supplier\[\]\) => prev\.filter\(\(s\) => s\.id !== supplier\.id\)\);\s*deleteCloudRow\("suppliers", supplier\.id\);\s*\}\}',
    r'onClick=\{\(\) => \{ setSuppliers\(\(prev: Supplier\[\]\) => prev\.filter\(\(s\) => s\.id !== supplier\.id\)\);\s*\}\}',
]
for pat in patterns:
    content = re.sub(pat, 'onClick={() => deleteSupplier(supplier.id)}', content)

content = re.sub(
    r'<td><button onClick=\{[^}]+supplier\.id[^}]+\} className="rounded-xl border border-red-500/20 bg-red-500/20 px-3 py-2 text-red-300 transition hover:bg-red-500/30">Elimina</button></td>',
    '<td><button onClick={() => deleteSupplier(supplier.id)} className="rounded-xl border border-red-500/20 bg-red-500/20 px-3 py-2 text-red-300 transition hover:bg-red-500/30">Elimina</button></td>',
    content
)

# Aggiunge sync fornitori a Supabase se manca
if 'replaceSupabaseTable("suppliers", suppliers)' not in content:
    marker = '''  useEffect(() => {
    localStorage.setItem("bt-suppliers", JSON.stringify(suppliers));
  }, [suppliers]);'''
    insert = '''  useEffect(() => {
    localStorage.setItem("bt-suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    if (!cloudReady) return;

    replaceSupabaseTable("suppliers", suppliers).catch((error) =>
      setCloudError(error?.message || "Errore salvataggio fornitori")
    );
  }, [suppliers, cloudReady]);'''
    if marker in content:
        content = content.replace(marker, insert, 1)

page.write_text(content, encoding="utf-8")
print("PATCH COMPLETATA: eliminazione fornitori definitiva.")
print("Ora fai: npm run dev")
