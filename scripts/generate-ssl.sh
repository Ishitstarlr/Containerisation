#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="${SCRIPT_DIR}/../nginx/certs"
mkdir -p "${CERTS_DIR}"

KEY_FILE="${CERTS_DIR}/server.key"
CRT_FILE="${CERTS_DIR}/server.crt"

if [[ -f "${KEY_FILE}" && -f "${CRT_FILE}" ]]; then
    echo "SSL certificates already exist at ${CERTS_DIR}."
    exit 0
fi

echo "Generating self-signed SSL certificate with SAN for localhost..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "${KEY_FILE}" \
    -out "${CRT_FILE}" \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

chmod 600 "${KEY_FILE}"
chmod 644 "${CRT_FILE}"

echo "SSL certificates successfully generated in ${CERTS_DIR}:"
echo "  - Private Key: ${KEY_FILE}"
echo "  - Certificate: ${CRT_FILE}"
