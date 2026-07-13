# Instalar el proyecto en Windows

Guía para poner la web de Concretum Operis a funcionar en un ordenador con Windows y poder pedirle
cambios a Claude en lenguaje normal. No hace falta saber programar. Son unos 20 minutos.

Cuando termines, lee `GUIA.md`: ahí están las órdenes que puedes escribirle.

---

## Antes de empezar

Necesitas tres programas. Instálalos **en este orden** y no te saltes ninguno.

### 1. Git — el que guarda el historial

Es lo que permite deshacer cambios y volver atrás. Sin esto no hay red de seguridad.

1. Entra en <https://git-scm.com/download/win> y descarga el instalador de 64 bits.
2. Ejecútalo y dale a **Siguiente** en todas las pantallas. Las opciones por defecto valen.

### 2. Node.js — el que enseña la web en tu navegador

1. Entra en <https://nodejs.org> y descarga la versión **LTS** (la que recomiendan, no la "Current").
2. Ejecuta el instalador y acepta las opciones por defecto.

### 3. Claude Code — el asistente

1. Entra en <https://claude.com/download> y descarga la aplicación de escritorio para Windows.
2. Instálala y entra con tu cuenta de Anthropic.

> Si prefieres la versión de terminal, se instala abriendo PowerShell y escribiendo
> `npm install -g @anthropic-ai/claude-code`. Con la aplicación de escritorio es suficiente.

### 4. Comprobar que todo está

Abre **PowerShell** (botón de Inicio → escribe `powershell` → Enter) y escribe estas dos líneas, una
detrás de otra:

```powershell
git --version
node --version
```

Cada una debe responder con un número de versión. Si dice *"no se reconoce como el nombre de un
cmdlet"*, ese programa no se instaló bien: repite su paso y **reinicia el ordenador**.

---

## Descargar el proyecto

El proyecto vive en GitHub, en un repositorio **privado**: necesitas que el propietario te dé acceso
con tu usuario de GitHub. Sin acceso, el paso siguiente falla con un error de permisos.

En PowerShell, escribe:

```powershell
cd $HOME\Documents
git clone https://github.com/reiarseni/concretum-web-modern.git
cd concretum-web-modern
```

La primera vez te pedirá entrar en tu cuenta de GitHub desde el navegador. Acepta.

Ya tienes el proyecto en `Documentos\concretum-web-modern`.

---

## Abrirlo con Claude

1. Abre la aplicación de **Claude Code**.
2. Elige abrir una carpeta y selecciona `Documentos\concretum-web-modern`.
3. Escríbele: **¿Cómo está la web?**

Si contesta con el estado del proyecto, todo funciona. Ya puedes pedirle cambios en lenguaje normal
y usar las órdenes de `GUIA.md`.

---

## Ver la web en el navegador

Dile a Claude: **Visualizar cambios en local**. Él enciende la web y te da la dirección
`http://localhost:3000` para abrirla en el navegador.

Si prefieres hacerlo tú a mano, en PowerShell dentro de la carpeta del proyecto:

```powershell
npm start
```

Y abre <http://localhost:3000>. Para apagarlo, pulsa **Ctrl+C** en esa ventana.

> La primera vez Windows puede preguntar si permites que Node.js acceda a la red: dile que **sí**
> (basta con redes privadas). Es solo para enseñarte la web en tu propio ordenador.

---

## Trabajar en equipo sin pisarse

El propietario y tú compartís el mismo proyecto en GitHub. Para que no haya líos:

- **Antes de empezar a trabajar**, dile a Claude: *"trae los últimos cambios"* (hace `git pull`).
- **Cuando termines y confirmes**, dile: *"sube los cambios"* (hace `git push`).

Si os saltáis esto, cada uno tendrá una versión distinta de la web y luego hay que arreglarlo a mano.

---

## Lo que esto **no** hace

Confirmar un cambio lo guarda en tu ordenador y en GitHub, pero **no lo publica en internet**: la web
real que ven los clientes sigue igual. Publicar es un paso aparte y deliberadamente manual, para que
nadie suba algo sin querer.

---

## Si algo va mal

| Lo que ves | Qué pasa |
|---|---|
| `git no se reconoce...` | Git no está instalado o falta reiniciar el ordenador. |
| `Repository not found` al clonar | No tienes acceso al repositorio privado. Pídeselo al propietario. |
| `http://localhost:3000` no carga | La web no está encendida. Dile a Claude "Visualizar cambios en local". |
| Ves la web, pero no tu cambio | Es la caché del navegador. Recarga con **Ctrl+Shift+R**. |
| El puerto 3000 está ocupado | Otro programa lo usa. Díselo a Claude y lo resuelve. |
