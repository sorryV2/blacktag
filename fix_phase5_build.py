
from pathlib import Path

page = Path("src/app/page.tsx")
if not page.exists():
    page = Path("page.tsx")

if not page.exists():
    raise SystemExit("ERRORE: page.tsx non trovato. Esegui nella root del progetto BLACKTAG.")

s = page.read_text(encoding="utf-8")

# Fix build Phase 5:
# La Phase 5 usa l'icona Video nel menu, ma non era importata da lucide-react.
if "Video" not in s.split("from \"lucide-react\";")[0]:
    s = s.replace(
        "GripVertical",
        "GripVertical, Video",
        1
    )

page.write_text(s, encoding="utf-8")

print("OK: import Video aggiunto.")
print("Ora fai:")
print("npm run build")
