"""Consulta mínima a Supabase para que el proyecto no se pause por inactividad.

Se ejecuta desde GitHub Actions (ver .github/workflows/supabase-keep-alive.yml).
Usa la clave anon: solo puede leer filas permitidas por RLS.
"""

import os
import urllib.parse
import urllib.request

supabase_url = os.environ["SUPABASE_URL"].rstrip("/")
anon_key = os.environ["SUPABASE_ANON_KEY"]
table = os.environ.get("SUPABASE_TABLE", "site_settings")

query = urllib.parse.urlencode({
    "select": "*",
    "limit": 1,
})

url = f"{supabase_url}/rest/v1/{table}?{query}"

request = urllib.request.Request(
    url,
    headers={
        "apikey": anon_key,
        "Authorization": f"Bearer {anon_key}",
    },
)

with urllib.request.urlopen(request, timeout=20) as response:
    if response.status != 200:
        raise RuntimeError(f"Supabase respondió {response.status}")

    print(f"Consulta a '{table}' realizada correctamente.")
