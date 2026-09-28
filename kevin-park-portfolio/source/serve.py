# Static server that behaves like a host: directory index plus 404.html fallback.
import http.server
import io
import os
import sys

ROOT = sys.argv[1]


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, *a):
        pass

    def send_head(self):
        path = self.translate_path(self.path)
        missing = not os.path.exists(path) or (
            os.path.isdir(path) and not os.path.exists(os.path.join(path, "index.html"))
        )
        if missing:
            body = open(os.path.join(ROOT, "404.html"), "rb").read()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            return io.BytesIO(body)
        return super().send_head()


http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[2])), H).serve_forever()
