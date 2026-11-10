#!/usr/bin/env python3
"""
server_dinamica1.py
-------------------
Servidor web para desplegar la aplicación en `dinamica1` (o localmente) y conectarla
con el servidor LM Studio (`https://dinamica1.fciencias.unam.mx/v1`) usando
el modelo `openai/default` y autenticación por API Key (`LLM_API_KEY`).

Variables de entorno soportadas (o flags de línea de comandos):
  LLM_BASE_URL="https://dinamica1.fciencias.unam.mx/v1"
  LLM_API_KEY="sk-lm-tu-token-aqui"
  LLM_MODEL="openai/default"

Uso en dinamica1:
  export LLM_BASE_URL="https://dinamica1.fciencias.unam.mx/v1"
  export LLM_API_KEY="sk-lm-tu-token-aqui"
  python3 app/server_dinamica1.py --port 8080
"""

import argparse
import http.server
import json
import os
import socketserver
import ssl
import urllib.error
import urllib.request
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
DEFAULT_LLM_URL = os.environ.get("LLM_BASE_URL", "https://dinamica1.fciencias.unam.mx/v1")
DEFAULT_LLM_KEY = os.environ.get("LLM_API_KEY", "")
DEFAULT_LLM_MODEL = os.environ.get("LLM_MODEL", "openai/default")


class DinamicaHandler(http.server.SimpleHTTPRequestHandler):
    llm_url = DEFAULT_LLM_URL
    llm_key = DEFAULT_LLM_KEY
    llm_model = DEFAULT_LLM_MODEL

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/llm-status"):
            self.handle_llm_status()
            return
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/llm-explain"):
            self.handle_llm_explain()
            return
        self.send_error(404, "Endpoint not found")

    def _build_headers(self, api_key: str) -> dict:
        headers = {"Content-Type": "application/json"}
        token = api_key or self.llm_key
        if token:
            headers["Authorization"] = f"Bearer {token}"
        return headers

    def handle_llm_status(self):
        base_url = self.llm_url.rstrip("/")
        models = []
        status_ok = False
        error_msg = None

        models_url = f"{base_url}/models" if base_url.endswith("/v1") else f"{base_url}/v1/models"
        try:
            ctx = ssl.create_default_context()
            req = urllib.request.Request(models_url, headers=self._build_headers(""), method="GET")
            with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                status_ok = True
                if "data" in data:
                    models = [m.get("id") for m in data["data"] if m.get("id")]
        except Exception as e:
            error_msg = str(e)

        payload = {
            "connected": status_ok,
            "llm_url": base_url,
            "default_model": self.llm_model,
            "has_api_key": bool(self.llm_key),
            "models": models,
            "error": None if status_ok else error_msg,
        }
        self._send_json(200, payload)

    def handle_llm_explain(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = json.loads(self.rfile.read(length).decode("utf-8")) if length > 0 else {}
        except Exception as e:
            self._send_json(400, {"error": f"Invalid JSON body: {e}"})
            return

        prompt = body.get("prompt", "")
        system_prompt = body.get("system_prompt", "")
        custom_url = (body.get("llm_url") or self.llm_url).rstrip("/")
        model = body.get("model") or self.llm_model
        api_key = body.get("api_key") or self.llm_key

        chat_url = f"{custom_url}/chat/completions" if custom_url.endswith("/v1") else f"{custom_url}/v1/chat/completions"
        req_payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.25,
        }

        try:
            ctx = ssl.create_default_context()
            req = urllib.request.Request(
                chat_url,
                data=json.dumps(req_payload).encode("utf-8"),
                headers=self._build_headers(api_key),
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=90, context=ctx) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                text = res_data["choices"][0]["message"]["content"]
                self._send_json(200, {"ok": True, "response": text, "model": model})
        except Exception as e:
            self._send_json(
                502,
                {
                    "ok": False,
                    "error": f"Error conectando a LM Studio en {chat_url} (modelo: {model}): {e}",
                },
            )

    def _send_json(self, status_code: int, payload: dict):
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)


def main():
    parser = argparse.ArgumentParser(description="Servidor para dinamica1 con conexión a LM Studio")
    parser.add_argument("--host", default="0.0.0.0", help="Host a escuchar (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8080, help="Puerto HTTP (default: 8080)")
    parser.add_argument("--llm-url", default=DEFAULT_LLM_URL, help="URL base de LM Studio (default: https://dinamica1.fciencias.unam.mx/v1)")
    parser.add_argument("--llm-key", default=DEFAULT_LLM_KEY, help="API Key de LM Studio (o variable LLM_API_KEY)")
    parser.add_argument("--llm-model", default=DEFAULT_LLM_MODEL, help="Modelo en LM Studio (default: openai/default)")
    args = parser.parse_args()

    DinamicaHandler.llm_url = args.llm_url
    DinamicaHandler.llm_key = args.llm_key
    DinamicaHandler.llm_model = args.llm_model

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((args.host, args.port), DinamicaHandler) as httpd:
        print(f"============================================================")
        print(f" Scientometric Specialization Explorer (dinamica1 server)")
        print(f" URL Web:       http://{args.host}:{args.port}/")
        print(f" LM Studio URL: {args.llm_url} (Modelo: {args.llm_model})")
        print(f" API Key:       {'Configurada' if args.llm_key else 'No definida en env (se puede ingresar en UI)'}")
        print(f"============================================================")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
