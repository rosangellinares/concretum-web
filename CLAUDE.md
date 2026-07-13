# CLAUDE.md

`concretum-web-modern` — sitio estático autocontenido (Concretum Operis) servido por un servidor
Node sin dependencias, desplegable en un VPS con Docker detrás de un proxy inverso ya existente.

> **El propietario no programa.** Pide los cambios en lenguaje natural, describiendo lo que quiere
> ver, y no revisa el código. La primera mitad de este documento (en español) es su manual de uso;
> la segunda (en inglés) son las notas técnicas del repo.

---

# PARTE 1 — Trabajar con el propietario

## Mapa de la web (cómo la nombra él)

Él nombra las páginas en español; las rutas reales están en inglés. Traduce tú, nunca le pidas la
ruta.

| Como la llama él                | Dirección real                    |
|---------------------------------|-----------------------------------|
| Inicio / portada                | `/`                               |
| Sobre nosotros                  | `/about`                          |
| Servicios                       | `/services`                       |
| Hormigón (servicio)             | `/services/concrete-richmond-ca`  |
| Excavación (servicio)           | `/services/excavation-richmond-ca`|
| Perforación (servicio)          | `/services/drilling-richmond-ca`  |
| Proyectos                       | `/projects`                       |
| Contacto                        | `/contact`                        |
| Política de privacidad          | `/privacy-policy`                 |

(`/unknown` es la página de error interna; no se toca salvo petición explícita.)

**La web está en inglés** (`lang="en-US"`). Él pide en español, pero todo texto publicado se escribe
en inglés. Colores, tipografías, contacto y tono: ver `MARCA.md`, y respétalo en cada cambio.

Zonas de una página, en sus palabras:

- **"la cabecera"** — el header: logo + menú de navegación, arriba del todo.
- **"el pie"** — el footer: logo, datos y enlaces legales, abajo del todo.
- **"la portada"** — la primera pantalla de `/`, lo que se ve sin bajar (hero).
- **"el menú"** — los enlaces de navegación de la cabecera.

Si menciona una página o zona que no está aquí, pregúntale a cuál se refiere en vez de adivinar.

## Cómo se piden los cambios (estilo base44)

Él describe lo que quiere ver ("haz el logo más pequeño", "cambia el teléfono de contacto", "añade
una sección de proyectos"). **Ante cualquier petición de cambio, invoca la skill del proyecto
`karpathy-code-workflow`** (`.claude/skills/karpathy-code-workflow/SKILL.md`): decide el modo de
implementación — **Directo**, **Guiado** o **Spec** — y fija los principios (plan antes de código,
edición quirúrgica, verificación, mínima superficie).

- Tú eliges el modo; no le preguntes cuál quiere.
- Anuncia el modo elegido en una frase antes de tocar nada.
- Habla siempre de lo que se ve en la web, no de archivos ni de código, salvo que él pregunte.

## Resumen después de cada cambio

Tras **cualquier** cambio, termina siempre con un resumen breve y sin jerga:

- **Qué ha cambiado**, por lo que se ve ("el logo del pie ahora es la mitad de grande", no "he
  editado `--logo-size` en `main.css`").
- **Dónde verlo**: la página o páginas afectadas.
- **Qué hacer ahora**: "Visualizar cambios en local" para verlo, y luego "Confirmar los Cambios" o
  "Revertir Cambios".

Nada de listas de archivos, hashes ni diffs salvo que los pida.

## Órdenes en lenguaje natural

Estas frases (o variantes evidentes, en cualquier capitalización) disparan un flujo completo.
Ejecútalo sin pedir detalles técnicos ni proponer alternativas.

### "¿Cómo está la web?"

**Ponme al día, no recuerdo por dónde iba.** Resume en dos o tres frases:

1. **Cambios sin confirmar** (`git status`): descríbelos por lo que se ve, o di que no hay.
2. **Vista previa**: si el servidor local responde, dale la URL; si no, di que está apagada.
3. **Descartes guardados** (`git branch --list 'descartes/*'`): cuántos y de cuándo, si los hay.

### "Visualizar cambios en local"

**Quiero abrir la web en mi navegador y ver cómo ha quedado.**

1. Comprueba si ya está levantado (`curl -sI http://localhost:3000`). Si responde, no lo levantes
   otra vez.
2. Si no, arranca `npm start` **en background** (`run_in_background`), nunca en primer plano: debe
   sobrevivir entre turnos.
3. Confirma con `curl` que devuelve `200`.
4. Dale la URL en una línea, tal cual: **http://localhost:3000**.
5. Indícale la página concreta si el cambio afecta a una ruta (Contacto → `/contact`; ver "Mapa de
   la web"), y recuérdale recargar con Ctrl+Shift+R si no ve el cambio (caché del navegador).

**La URL debe ser siempre la misma (`http://localhost:3000`).** Si el puerto está ocupado por una
vista previa antigua, mátala y relevántala ahí; no saltes de puerto salvo que lo tenga ocupado un
proceso ajeno al proyecto.

Los cambios en HTML/CSS se ven recargando. **Solo** hay que reiniciar si se ha tocado `server.js`.

### "Apagar la vista previa"

**Ya he terminado de mirar.** Mata el proceso `node server.js` (el del background de la sesión, o
`pkill -f "node server.js"`), verifica con `curl` que el puerto 3000 ya no responde y dilo en una
frase. No afecta al servidor de producción — esto es solo su ordenador.

### "Cambiar la marca"

**Cambia algo que afecta a toda la web, no a una página.** También sirven variantes como "el color
de la marca ahora es azul", "cambia el teléfono en toda la web", "usa otra tipografía".

Un cambio de marca tiene **dos caras y son inseparables**:

1. **La web**: aplicarlo en todas las páginas donde aparezca (no solo donde él lo vio).
2. **`MARCA.md`**: actualizar el dato, para que la guía no quede mintiendo.

Procedimiento:

1. Localiza **todas** las apariciones antes de tocar nada (`grep -r` sobre `public/`) y dile cuántas
   son y en qué páginas: "el naranja aparece 488 veces, en las 10 páginas".
2. Confírmale el alcance con `AskUserQuestion` — es un cambio irreversible a ojo y conviene que sepa
   que va a afectar a todo el sitio.
3. Aplícalo en la web **y** actualiza `MARCA.md` en el mismo movimiento.
4. Pasa `node scripts/revisar-web.mjs` para asegurarte de que nada se rompió.
5. Resume por lo que se ve y recuérdale "Visualizar cambios en local" antes de confirmar.

### Detección de cambios de marca (regla permanente)

**Nunca modifiques nada de `MARCA.md` de forma silenciosa, ni dejes que la web se desvíe de él sin
avisar.** Si una petición cualquiera —aunque parezca local— toca uno de estos elementos:

- un **color** de la paleta, una **tipografía**, el **correo** o el **teléfono** oficiales,
- el **tono** de los textos, o el **idioma** de la web,

entonces **párate antes de editar** y pregúntale explícitamente con `AskUserQuestion`:

- **¿Solo aquí?** — lo cambio únicamente en la página que ha pedido, y `MARCA.md` sigue mandando en
  el resto. Deja constancia de que esa página queda como excepción.
- **¿En toda la web?** — es un cambio de marca: sigue el procedimiento de "Cambiar la marca" y
  actualiza `MARCA.md`.

Ejemplo: pide "pon el botón de Contacto en azul". El azul no está en la paleta → preguntas si es un
capricho de esa página o el nuevo color de la marca. No lo decidas tú.

### "Revisa la web"

**Comprueba que no he roto nada.**

Ejecuta `node scripts/revisar-web.mjs`: recorre todas las páginas de `public/` y verifica que ningún
enlace, imagen, hoja de estilo o script apunta a algo inexistente (resolviendo las rutas igual que
`server.js`).

- Si sale limpio: dilo en una frase ("Las 10 páginas cargan y no hay ningún enlace ni imagen rota").
- Si hay roturas: explícalas por lo que el visitante vería ("en Contacto, el enlace al aviso legal
  no lleva a ninguna parte") y ofrécete a arreglarlas.

No lo ejecutes por tu cuenta en cada cambio: solo cuando él lo pida.

### "Historial de cambios"

**¿Qué se ha hecho hasta ahora?**

Lee `git log` y preséntalo en español, por lo que se ve, con fecha y en cristiano:

```
13 jul — El logo del pie ahora es la mitad de grande
12 jul — Nuevo texto en la página de Servicios
```

Deduce la descripción del mensaje del commit y, si hace falta, del diff. Sin hashes, sin nombres de
rama. Los más recientes arriba. Si pide más detalle de uno, cuéntaselo también en lenguaje llano.

### "Volver a la versión de..."

**Deshaz hasta un punto anterior, no solo el último cambio.**

Acepta cualquier forma de señalarlo: por fecha ("vuelve a como estaba el lunes"), por descripción
("vuelve a antes de tocar el logo") o eligiendo de la lista del historial.

1. Muéstrale el historial y **confirma con él a qué punto exacto quiere volver** antes de tocar nada
   (`AskUserQuestion` si hay ambigüedad). Este paso no se salta nunca.
2. **Guarda primero lo actual**: crea una rama `descartes/<fecha>-<descripcion>` con el estado de
   `main` tal como está ahora, cambios sin commitear incluidos. Sin esto no se sigue.
3. Devuelve `main` a ese punto (`git reset --hard <commit>`), **solo** tras verificar que la rama de
   descarte ya contiene lo anterior.
4. Dile qué versión ha quedado activa y que lo deshecho está guardado por si se arrepiente
   ("Recuperar lo descartado" lo trae de vuelta).

### "Confirmar los Cambios"

**Da por buena la última tanda de trabajo y commitéala en `main`.**

1. Revisa `git status` y `git diff`.
2. `git add -A` de lo relevante (nunca secretos, `.env` ni artefactos temporales).
3. **Un solo commit** en `main` (varios solo si toca áreas claramente distintas), siguiendo las
   convenciones de commit de la Parte 2.
4. Responde en una frase: qué se ha commiteado.

No hagas `git push` salvo que lo pida ("sube los cambios", "publica").

### "Revertir Cambios"

**La última tanda no sirve; quítala de `main` pero no la pierdas.**

1. Crea una rama de descarte con fecha: `descartes/2026-07-13-logo-footer`.
2. Deja ahí **todo** el trabajo a descartar:
   - Sin commitear → cambia a la rama nueva y commitea ahí (`chore: guarda trabajo descartado`).
   - Ya commiteado en `main` → apunta la rama nueva al `HEAD` actual y devuelve `main` al commit
     anterior (`git reset --hard <commit-bueno>`), **solo después** de confirmar que la rama de
     descarte contiene esos commits.
3. Vuelve a `main`, que debe quedar como estaba antes del trabajo descartado.
4. Responde en una frase: qué se ha revertido y dónde ha quedado guardado.

**Nunca** ejecutes `git restore`, `git clean` ni `git reset --hard` sin haber salvado antes el
trabajo en la rama de descarte (o en un `git stash`).

### "Recuperar lo descartado"

**Me arrepiento; quiero de vuelta algo que descarté.**

1. Lista las ramas `descartes/*`. Si no hay ninguna, dilo y termina.
2. Preséntaselas por lo que hacían, no por su nombre técnico: fecha + contenido ("13 de julio — el
   logo más pequeño en el pie"). Deduce la descripción del commit y del diff.
3. Que elija una (`AskUserQuestion` si hay varias; si solo hay una, confirma que es esa).
4. Si `main` tiene cambios sin confirmar, **haz `git stash` primero** y dilo.
5. Trae el contenido a `main` **sin commitear** (`git checkout <rama> -- .`), como trabajo pendiente
   de revisar.
6. No borres la rama de descarte: es la copia de seguridad.

## Guardarraíles

- **No toques el despliegue sin permiso explícito.** `deploy/deploy-concretum.sh` y
  `.github/workflows/deploy.yml` publican la web en el servidor: no los modifiques aunque veas algo
  mejorable. Si detectas un problema, dilo y espera su decisión.
- **Nunca commitees secretos**: claves SSH, contraseñas, tokens, `.env`. Si una petición implica
  meter una credencial en el repo, párate, explícalo y propón la alternativa (secreto de GitHub,
  variable de entorno en el VPS).
- **Avisa cuando un cambio sea sobrescribible.** `public/` lo genera el proyecto `website-crawler`:
  una edición a mano se perderá si el sitio se vuelve a crawlear. Dilo en una frase al terminar, sin
  bloquear el cambio ni repetirlo dentro de la misma tanda.
- **Publicar en producción no está automatizado como orden.** Si pide subir la web al servidor real,
  trátalo como una petición normal y confirma con él la vía antes de ejecutar nada.

## Modelo de ramas

- `main` es la **única** rama de trabajo: historia lineal, todo se commitea directamente ahí.
- **No** hay ramas de feature, ni PRs, ni merges.
- Las únicas ramas admisibles son `descartes/*`: guardan trabajo rechazado y son borrables.

## Convenciones de commits

Estilo `release-plan`: `<tipo>: <descripción>` (tipos: `feat`, `fix`, `chore`, `refactor`, `docs`,
`test`), título ≤72 chars, en español, **sin** `Co-Authored-By` ni atribución de IA.

- Título en tercera persona del singular, sin punto final (`feat: anade logo al footer`).
- Body opcional, ≤72 chars/línea: solo si el título no basta, explicando el *porqué*. Si toca varias
  áreas, una línea por área empezando por `- `.
- Sin footers `Refs #N` / `Closes #N`: aquí no se trabaja por issues.

---

# PARTE 2 — Notas técnicas

## Build & run

```bash
npm start                  # runs server.js (port 3000)
PORT=4000 node server.js   # override port
```

No build step — `public/` is final static output, produced upstream by the `website-crawler`
project (crawl + de-reactify), not regenerated here.

## Deploy (Docker)

```bash
docker compose up -d --build   # container listens on 7779
```

Single-service `docker-compose.yml`; `Dockerfile` is `node:22-alpine`, non-root, no multi-stage (no
deps, no build). Container port fixed to `7779` (`ENV PORT=7779` + `7779:7779`) — the port the
reverse proxy should `proxy_pass` to. `deploy/deploy-concretum.sh` and
`.github/workflows/deploy.yml` drive the VPS deploy over SSH. See README for the systemd
alternative.

## Structure

- `public/` — the static site (one `index.html` per route, hashed assets)
- `server.js` — HTTP server (`node:http` only): canonical URLs are extensionless and slash-less
  (`/about`), with `301` redirects from `/about/` and `/about/index.html`; resolves a path to
  `<path>/index.html`, `404`s otherwise; `Cache-Control: public, max-age=3600` (`no-cache` on
  `sw.js`); path traversal blocked in `resolveFilePath`
- `package.json` — no runtime dependencies
- `Dockerfile` / `docker-compose.yml` / `.dockerignore` — container layer (`.dockerignore`
  deliberately does **not** exclude `public/`, which is the site itself)
- `.claude/skills/karpathy-code-workflow/` — project skill that governs how change requests are
  triaged (see Parte 1)
- `scripts/revisar-web.mjs` — zero-dep link/asset checker over `public/`, mirroring `server.js`'s
  path resolution; exits non-zero on any broken reference
- `MARCA.md` — brand facts (language, colours, fonts, contact, tone) that constrain content changes

## Code conventions

- Keep `server.js` dependency-free; if a real feature is needed beyond static serving, evaluate
  whether this project is still the right place for it before adding a framework
- Hand-edits under `public/` are acceptable when the request *is* a site-content change — just warn
  the owner they diverge from the crawler source (see Guardarraíles)
- This repo's git history predates the server/docs additions (cloned from the crawler's own history
  to preserve the site's edit history)
