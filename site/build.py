"""Gera as páginas públicas em site/ a partir de docs/legal/*.md.

Uso (na raiz do repositório):  python site/build.py
Requer:  pip install markdown
"""
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
PAGES = {
    "termos-de-uso": "Termos de Uso",
    "politica-de-privacidade": "Política de Privacidade",
}
TEMPLATE = """<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} | Destrava</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header><a href="index.html">Destrava</a></header>
    <main>
{body}
    </main>
    <footer>
      <a href="termos-de-uso.html">Termos de Uso</a> ·
      <a href="politica-de-privacidade.html">Política de Privacidade</a>
    </footer>
  </body>
</html>
"""

for slug, title in PAGES.items():
    body = markdown.markdown((ROOT / "docs/legal" / f"{slug}.md").read_text(encoding="utf-8"))
    (ROOT / "site" / f"{slug}.html").write_text(TEMPLATE.format(title=title, body=body), encoding="utf-8")

index = "<h1>Destrava</h1>\n<p>Documentos legais do aplicativo.</p>\n<ul>\n" + "".join(
    f'<li><a href="{slug}.html">{title}</a></li>\n' for slug, title in PAGES.items()
) + "</ul>"
(ROOT / "site" / "index.html").write_text(TEMPLATE.format(title="Documentos legais", body=index), encoding="utf-8")
print("Páginas geradas em site/")
