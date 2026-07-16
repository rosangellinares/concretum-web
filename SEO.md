# SEO.md

Convención de SEO para páginas nuevas en `concretum-web-modern`. No hay build ni plantillas
vivas — cada página es un `.html` final — así que "reutilizable" aquí significa: copia este
bloque en la página nueva y rellena los huecos, y deja que `scripts/revisar-web.mjs` te avise
si falta algo.

## Verificación automática

```bash
node scripts/revisar-web.mjs
```

Además de comprobar enlaces e imágenes rotas, ahora también avisa (y sale con código de error)
si a cualquier página le falta: `<title>`, meta description, `<link rel="canonical">`, un `<h1>`
único, o si alguna `<img>` no tiene `alt`. Ejecútalo después de crear o tocar una página.
`/unknown` es la página de error interna del crawler y está excluida a propósito (ver
`CLAUDE.md`).

## Bloque de `<head>` a copiar en cada página nueva

Sustituye `TÍTULO`, `DESCRIPCIÓN`, `/ruta`, `CIUDAD, CA` y las coordenadas por los datos reales
de la página. El dominio de producción es siempre `https://concretumoperis.com` — nunca dejes
referencias al dominio de pruebas `solid-build-craft.base44.app` (si ves una, es un resto viejo
del generador y hay que quitarla, no copiarla).

```html
<meta content="US-CA" name="geo.region" />
<meta content="CIUDAD, CA" name="geo.placename" />
<meta content="LATITUD;LONGITUD" name="geo.position" />
<meta content="LATITUD, LONGITUD" name="ICBM" />
<title>TÍTULO (50-60 caracteres) | Concretum Operis</title>
<meta content="DESCRIPCIÓN (120-160 caracteres, con ciudad y servicio)" name="description" />

<meta content="TÍTULO | Concretum Operis" property="og:title" />
<meta content="DESCRIPCIÓN" property="og:description" />
<meta content="https://concretumoperis.com/media/.../01.jpg" property="og:image" />
<meta content="https://concretumoperis.com/ruta" property="og:url" />
<meta content="website" property="og:type" />
<meta content="Concretum Operis" property="og:site_name" />
<meta content="TÍTULO | Concretum Operis" name="twitter:title" />
<meta content="DESCRIPCIÓN" name="twitter:description" />
<meta content="https://concretumoperis.com/media/.../01.jpg" name="twitter:image" />
<meta content="summary_large_image" name="twitter:card" />
<meta content="https://concretumoperis.com/ruta" name="twitter:url" />
<link href="https://concretumoperis.com/ruta" rel="canonical" />
```

### Datos estructurados (JSON-LD)

Un único bloque `<script id="page-schema" type="application/ld+json">` con un array. Como
mínimo, un `BreadcrumbList` que llegue **hasta la propia página** (no se quede un nivel antes):

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://concretumoperis.com/" },
    { "@type": "ListItem", "position": 2, "name": "Sección", "item": "https://concretumoperis.com/seccion" },
    { "@type": "ListItem", "position": 3, "name": "Título de la página", "item": "https://concretumoperis.com/seccion/pagina" }
  ]
}
```

Las páginas de servicio añaden además un bloque `Service` (ver cualquier
`public/services/*/index.html` como ejemplo); home y contacto llevan el `LocalBusiness`
completo (nombre, dirección, teléfono, geo, horario, áreas de servicio, `sameAs` con las redes
sociales). No dupliques ese `LocalBusiness` en cada página — solo hace falta una vez.

**No** añadas `FAQPage` pensando en aparecer como resultado enriquecido: Google dejó de mostrar
los FAQ enriquecidos en mayo de 2026.

## Imágenes

- Ruta local: `/media/services/<slug>/NN.jpg` o `/media/projects/<slug>/NN.jpg`, numeradas
  `01.jpg`, `02.jpg`... Nunca subas imágenes de más de ~1.5MB — conviértelas a JPEG (calidad
  ~82, lado máximo ~1800px) antes de añadirlas.
- Cada `<img>` de contenido lleva `width`/`height` reales (evita saltos de layout) y un `alt`
  que describe **lo que se ve en esa foto concreta** — nunca reutilices el mismo `alt` en varias
  fotos de la misma galería, y nunca un `alt` genérico tipo "foto del proyecto 3".
- Las imágenes de héroe (la primera pantalla) no llevan `loading="lazy"`; el resto de la
  galería sí.

## Sitemap y robots

`public/sitemap.xml` y `public/robots.txt` se generaron a mano listando las rutas reales de
`public/`. Si añades o quitas una página, actualiza `public/sitemap.xml` (añade/quita la
`<url>` correspondiente) — no hay generación automática.
