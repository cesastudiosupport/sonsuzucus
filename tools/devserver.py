"""Sonsuz Ucus gelistirme sunucusu.

web/ klasorunu no-cache basliklariyla servis eder; boylece tarayici
game.js/game.css degisikliklerini her yenilemede yeniden ceker.

Kullanim:  python tools/devserver.py [port]
"""

import base64
import functools
import http.server
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WEB = os.path.join(ROOT, "web")
SNAP_DIR = os.path.join(ROOT, "tools", "snapshots")
AUDIO_SRC_DIR = os.path.join(ROOT, "tools", "audio_src")


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_POST(self):
        """Tarayicidan diske yazma uclari.

        POST /snap?name=x   -> tools/snapshots/x.png
        POST /audio?name=x  -> tools/audio_src/x.wav

        Ikincisi OGG gibi Python'da cozemedigimiz formatlari tarayicida
        cozup WAV olarak geri almak icin. Govde base64 (data: URL de olur).
        """
        from urllib.parse import parse_qs, urlparse

        if self.path.startswith("/snap"):
            out_dir, ext, default = SNAP_DIR, "png", "frame"
        elif self.path.startswith("/audio"):
            out_dir, ext, default = AUDIO_SRC_DIR, "wav", "clip"
        else:
            self.send_error(404)
            return

        name = default
        if "?" in self.path:
            q = parse_qs(urlparse(self.path).query)
            name = os.path.basename(q.get("name", [default])[0]) or default

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8", "replace")
        if "," in body:
            body = body.split(",", 1)[1]

        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, f"{name}.{ext}")
        with open(path, "wb") as fh:
            fh.write(base64.b64decode(body))

        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(path.encode("utf-8"))

    def log_message(self, fmt, *args):
        pass


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8823
    handler = functools.partial(NoCacheHandler, directory=WEB)
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"Sonsuz Ucus dev sunucusu: http://localhost:{port}  (kok: {WEB})")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
