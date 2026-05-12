from pathlib import Path
import re

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")

if not page.exists():
    raise SystemExit("ERRORE: metti questo script nella root del progetto BLACKTAG oppure accanto a page.tsx")

content = page.read_text(encoding="utf-8")

# 1) Rimuove lo state TrackingOrders messo per errore dentro CalendarPicker
content = re.sub(
    r'\n\s*const \[trackingOrders,\s*setTrackingOrders\]\s*=\s*useState<TrackingOrder\[\]>\(\(\)\s*=>\s*\n\s*loadLS\("bt-tracking-orders",\s*defaultTrackingOrders\)\s*\n\s*\);\s*(?=\n\s*const firstDay = new Date\(year, month, 1\);)',
    '\n',
    content,
    flags=re.S
)

# 2) Aggiunge lo state trackingOrders DENTRO HomePage, subito dopo expenses
if "const [trackingOrders, setTrackingOrders]" not in content:
    pattern = r'(const \[expenses,\s*setExpenses\]\s*=\s*useState<Expense\[\]>\(\(\)\s*=>\s*\n\s*loadLS\("bt-expenses",\s*defaultExpenses\)\s*\n\s*\);)'
    replacement = """\\1
  const [trackingOrders, setTrackingOrders] = useState<TrackingOrder[]>(() =>
    loadLS("bt-tracking-orders", defaultTrackingOrders)
  );"""
    content, n = re.subn(pattern, replacement, content, count=1, flags=re.S)
    if n == 0:
        raise SystemExit("ERRORE: non trovo lo state expenses dove inserire trackingOrders")

# 3) Salva trackingOrders in localStorage
if 'localStorage.setItem("bt-tracking-orders"' not in content:
    marker = """  useEffect(() => {
    localStorage.setItem("bt-expenses", JSON.stringify(expenses));
  }, [expenses]);"""
    insert = marker + """

  useEffect(() => {
    localStorage.setItem("bt-tracking-orders", JSON.stringify(trackingOrders));
  }, [trackingOrders]);"""
    if marker in content:
        content = content.replace(marker, insert, 1)
    else:
        content = content.replace(
            "  const stats = useMemo(() => {",
            """  useEffect(() => {
    localStorage.setItem("bt-tracking-orders", JSON.stringify(trackingOrders));
  }, [trackingOrders]);

  const stats = useMemo(() => {""",
            1
        )

# 4) Rimuove la chiamata deleteFromSupabase dentro SuppliersSection: lì è fuori scope
content = re.sub(
    r'\s*deleteFromSupabase\("suppliers",\s*supplier\.id\);\s*',
    ' ',
    content
)

# 5) Normalizza bottone elimina fornitori
content = content.replace(
    'onClick={() => { setSuppliers((prev: Supplier[]) => prev.filter((s) => s.id !== supplier.id));  }}',
    'onClick={() => { setSuppliers((prev: Supplier[]) => prev.filter((s) => s.id !== supplier.id)); }}'
)

page.write_text(content, encoding="utf-8")
print("OK: page.tsx sistemato. Ora fai npm run dev")
