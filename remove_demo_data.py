
from pathlib import Path
import re

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")

if not page.exists():
    raise SystemExit("ERRORE: page.tsx non trovato")

s = page.read_text(encoding="utf-8")

patterns = [
    (
        r'const defaultSupplierOrders\s*:\s*SupplierOrder\[\]\s*=\s*\[.*?\];',
        'const defaultSupplierOrders: SupplierOrder[] = [];'
    ),
    (
        r'const defaultExpenses\s*:\s*Expense\[\]\s*=\s*\[.*?\];',
        'const defaultExpenses: Expense[] = [];'
    ),
]

for pattern, replacement in patterns:
    s = re.sub(pattern, replacement, s, flags=re.S)

page.write_text(s, encoding="utf-8")

print("OK: demo fornitori e spese rimossi.")
print("Ora apri il sito e fai nella console:")
print("localStorage.clear()")
print("location.reload()")
