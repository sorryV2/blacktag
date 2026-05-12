
from pathlib import Path
import re

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")

if not page.exists():
    raise SystemExit("ERRORE: non trovo src/app/page.tsx")

s = page.read_text(encoding="utf-8")

# 1) Nel render Clienti deve passare deleteClient, non deleteClientCloud
s = s.replace("deleteClientCloud={deleteClientCloud}", "deleteClientCloud={deleteClient}")
s = s.replace("deleteClient={deleteClientCloud}", "deleteClient={deleteClient}")

# 2) Nel bottone elimina del vecchio ClientsSection, usa solo la prop deleteClientCloud se presente
s = s.replace(
    "deleteClientCloud ? deleteClientCloud(client.id) : deleteClient(client.id)",
    "deleteClientCloud ? deleteClientCloud(client.id) : setClients((prev: Client[]) => prev.filter((c) => c.id !== client.id))"
)

# 3) Rimuove TUTTE le funzioni locali duplicate "function deleteClient" fuori da HomePage.
# Lascia solo async function deleteClient dentro HomePage.
pattern = r'\n\s*function deleteClient\(id: number\) \{\s*setClients\(\(prev: Client\[\]\) => prev\.filter\(\(client\) => client\.id !== id\)\);\s*\}\n'
s = re.sub(pattern, "\n", s)

# 4) Se per qualche motivo c'è ancora deleteClientCloud non definito nel JSX, sostituisce con deleteClient
s = s.replace("deleteClientCloud={deleteClientCloud}", "deleteClientCloud={deleteClient}")

# 5) Se CRMProSection ha creato una funzione locale deleteClient, rimuovila anche in forma più larga
s = re.sub(
    r'\n\s*function deleteClient\(id: number\) \{.*?setClients\(\(prev: Client\[\]\).*?\n\s*\}\n',
    "\n",
    s,
    flags=re.S
)

page.write_text(s, encoding="utf-8")
print("OK: duplicati deleteClient rimossi.")
print("Ora fai: npm run dev")
