# concretum-web-modern

Copia estática del sitio de Concretum Operis (`solid-build-craft.base44.app`), crawleada y des-reactificada a HTML/CSS/JS vanilla con el proyecto `website-crawler` (herramienta interna basada en Playwright), servida por un servidor Node minimalista sin dependencias.

## Estructura

- `public/` — el sitio estático completo (HTML por ruta, assets con nombre por hash, service worker de precache)
- `server.js` — servidor HTTP en Node puro (`node:http`), sin dependencias
- `package.json` — script `start`, cero dependencias de producción

No hay paso de build: `public/` ya es el resultado final.

## Uso local

```bash
npm start
# o
PORT=4000 node server.js
```

Por defecto escucha en el puerto `3000`.

## Rutas servidas

El sitio usa una carpeta por ruta (`about/index.html`, `contact/index.html`, etc.). El servidor resuelve automáticamente:

- `/` → `public/index.html`
- `/about` o `/about/` → `public/about/index.html`
- `/services/concrete-richmond-ca/` → `public/services/concrete-richmond-ca/index.html`
- Cualquier ruta sin archivo correspondiente → `404`

`sw.js` se sirve siempre con `Cache-Control: no-cache` (el service worker debe revalidarse en cada carga); el resto de assets usa una caché corta (`max-age=3600`).

## Despliegue en VPS

**Prerrequisito**: se asume que la VPS ya tiene un reverse proxy (nginx o Caddy) delante para TLS. Este servidor solo habla HTTP en un puerto interno.

1. Clona el repo en la VPS y entra en el directorio:
   ```bash
   git clone <ruta-o-url-del-repo> /opt/concretum-web-modern
   cd /opt/concretum-web-modern
   ```
2. Instala Node >= 18 si no está presente.
3. Crea el servicio systemd `/etc/systemd/system/concretum-web-modern.service`:
   ```ini
   [Unit]
   Description=concretum-web-modern static site server
   After=network.target

   [Service]
   Type=simple
   WorkingDirectory=/opt/concretum-web-modern
   ExecStart=/usr/bin/node server.js
   Environment=PORT=3000
   Restart=on-failure
   User=www-data

   [Install]
   WantedBy=multi-user.target
   ```
4. Habilita y arranca:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now concretum-web-modern
   ```
5. Configura el reverse proxy para hacer `proxy_pass` al puerto `3000` interno y servir TLS en el puerto 443.

## Procedencia

El contenido de `public/` conserva el historial git original del crawl (crawleo inicial → eliminación del runtime de React → ajustes de navegación). No se modifica el contenido del sitio como parte de este proyecto; solo se le añade la capa de servidor y despliegue.
