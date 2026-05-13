
from pathlib import Path
import re

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")

if not page.exists():
    raise SystemExit("ERRORE: page.tsx non trovato. Esegui nella root del progetto.")

s = page.read_text(encoding="utf-8")

# FIX CRASH INVENTARIO
# cost/price devono restare numeri, altrimenti .toFixed() crasha.

if "function normalizeProducts" not in s:
    marker = '''function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}'''
    insert = marker + '''

function normalizeProducts(rows: any[]): Product[] {
  if (!Array.isArray(rows)) return [];

  return rows.map((product: any) => ({
    ...product,
    id: Number(product?.id || Date.now()),
    name: String(product?.name || "Nuovo prodotto"),
    brand: String(product?.brand || "Brand"),
    size: String(product?.size || ""),
    image: String(product?.image || imageList[0]),
    cost: Number(product?.cost || 0),
    price: Number(product?.price || 0),
    status: (product?.status || "Da Caricare") as Status,
  }));
}'''
    if marker in s:
        s = s.replace(marker, insert, 1)
    else:
        print("AVVISO: loadLS non trovato, salto normalizeProducts")

s = re.sub(
    r'''const \[products, setProducts\] = useState<Product\[\]>\(\(\) =>\s*loadLS\("bt-products", defaultProducts\)\s*\);''',
    '''const [products, setProducts] = useState<Product[]>(() =>
    normalizeProducts(loadLS("bt-products", defaultProducts))
  );''',
    s,
    count=1,
    flags=re.S
)

s = s.replace(
'''  const [products, setProducts] = useState<Product[]>(() =>
    loadLS("bt-products", defaultProducts)
  );''',
'''  const [products, setProducts] = useState<Product[]>(() =>
    normalizeProducts(loadLS("bt-products", defaultProducts))
  );'''
)

s = s.replace(
'''[field]: field === "cost" || field === "price" ? (value === "" ? ("" as any) : Number(value)) : value,''',
'''[field]: field === "cost" || field === "price" ? Number(value || 0) : value,''')

s = s.replace(
'''[field]:
                field === "cost" || field === "price"
                  ? value === ""
                    ? ("" as any)
                    : Number(value)
                  : value,''',
'''[field]:
                field === "cost" || field === "price"
                  ? Number(value || 0)
                  : value,''')

s = s.replace(
'''[field]: field === "cost" || field === "price" ? Number(value) : value,''',
'''[field]: field === "cost" || field === "price" ? Number(value || 0) : value,''')

s = s.replace('cost: "" as any,', 'cost: 0,')
s = s.replace('price: "" as any,', 'price: 0,')
s = s.replace('fee: "" as any,', 'fee: 0 as any,')

s = re.sub(
    r'''function moneyValue\(value: any\) \{\s*return value === "" \|\| value === null \|\| value === undefined \? "" : String\(value\);\s*\}''',
    '''function moneyValue(value: any) {
    return value === 0 || value === "" || value === null || value === undefined ? "" : String(value);
  }''',
    s,
    count=1,
    flags=re.S
)

s = s.replace(
'''localStorage.setItem("bt-products", JSON.stringify(products));''',
'''localStorage.setItem("bt-products", JSON.stringify(normalizeProducts(products as any)));''')

s = s.replace(
'''JSON.stringify(normalizeProducts(products as any))));''',
'''JSON.stringify(normalizeProducts(products as any)));''')

page.write_text(s, encoding="utf-8")

print("OK: crash inventario sistemato.")
print("Ora fai: npm run dev")
print("Se la pagina resta nera:")
print("localStorage.removeItem('bt-products')")
print("location.reload()")
