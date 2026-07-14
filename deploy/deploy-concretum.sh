#!/usr/bin/env bash
#
# Despliegue de concretum-web-modern en la VPS mediante deploy key SSH (solo lectura).
# Ejecutar en la VPS. Idempotente: si ya existe la clave o el repo, no los duplica.
#
set -euo pipefail

REPO="reiarseni/concretum-web-modern"
DEST="/opt/concretum-web-modern"
KEY="$HOME/.ssh/concretum_web_deploy"
SSH_HOST="github-concretum"

# --- 1. Generar la deploy key (si no existe) --------------------------------
if [[ -f "$KEY" ]]; then
  echo "==> La clave $KEY ya existe, la reutilizo."
else
  echo "==> Generando deploy key..."
  mkdir -p "$HOME/.ssh" && chmod 700 "$HOME/.ssh"
  ssh-keygen -t ed25519 -C "vps-concretum-deploy" -f "$KEY" -N ""
fi

# --- 2. Configurar el host SSH dedicado (si no está) ------------------------
if ! grep -q "Host $SSH_HOST" "$HOME/.ssh/config" 2>/dev/null; then
  echo "==> Añadiendo el host '$SSH_HOST' a ~/.ssh/config..."
  cat >> "$HOME/.ssh/config" <<EOF

Host $SSH_HOST
    HostName github.com
    User git
    IdentityFile $KEY
    IdentitiesOnly yes
EOF
  chmod 600 "$HOME/.ssh/config"
else
  echo "==> El host '$SSH_HOST' ya está en ~/.ssh/config."
fi

# --- 3. Pausa: añadir la clave pública en GitHub ----------------------------
echo
echo "============================================================"
echo " AÑADE ESTA CLAVE PÚBLICA COMO DEPLOY KEY EN GITHUB:"
echo " GitHub → repo $REPO → Settings → Deploy keys → Add deploy key"
echo " (deja SIN marcar 'Allow write access')"
echo "------------------------------------------------------------"
cat "$KEY.pub"
echo "============================================================"
echo
read -rp "Pulsa ENTER cuando la hayas añadido en GitHub... " _

# --- 4. Confiar en github.com y probar la conexión --------------------------
echo "==> Registrando la huella de github.com en known_hosts..."
ssh-keyscan -t ed25519 github.com >> "$HOME/.ssh/known_hosts" 2>/dev/null
sort -u "$HOME/.ssh/known_hosts" -o "$HOME/.ssh/known_hosts"

echo "==> Probando autenticación con GitHub..."
# GitHub siempre cierra con código 1 aunque la auth sea correcta; filtramos el mensaje.
if ssh -T "$SSH_HOST" 2>&1 | grep -q "successfully authenticated"; then
  echo "    OK: autenticación correcta."
else
  echo "    ERROR: la clave no autentica. Revisa que la añadiste en el repo correcto." >&2
  exit 1
fi

# --- 5. Clonar (o actualizar) el repo ---------------------------------------
if [[ -d "$DEST/.git" ]]; then
  echo "==> El repo ya existe en $DEST, hago pull..."
  git -C "$DEST" pull --ff-only
else
  echo "==> Clonando en $DEST..."
  # sudo por si /opt no es escribible por el usuario actual
  if [[ -w "$(dirname "$DEST")" ]]; then
    git clone "git@$SSH_HOST:$REPO.git" "$DEST"
  else
    sudo git clone "git@$SSH_HOST:$REPO.git" "$DEST"
    sudo chown -R "$USER:$USER" "$DEST"
  fi
fi

# --- 6. Desplegar con Docker ------------------------------------------------
echo "==> Levantando el contenedor (puerto 7779)..."
cd "$DEST"
docker compose up -d --build

echo
echo "==> Estado del servicio:"
docker compose ps

echo
echo "Listo. Comprueba: curl -I http://localhost:7779/"
