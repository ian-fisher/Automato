import com.sun.net.httpserver.HttpServer;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;

public class  Main {

    public static void main(String[] args) throws Exception {
        int port = 8080;
        Path root = Path.of(".").toAbsolutePath().normalize(); // serve current directory

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/", exchange -> {
            try {
                String reqPath = exchange.getRequestURI().getPath();
                if (reqPath.equals("/")) reqPath = "/index.html";

                Path file = root.resolve(reqPath.substring(1)).normalize();

                // prevent path traversal (..)
                if (!file.startsWith(root) || !Files.exists(file) || Files.isDirectory(file)) {
                    exchange.sendResponseHeaders(404, -1);
                    return;
                }

                String mime = Files.probeContentType(file);
                if (mime == null) mime = "application/octet-stream";
                exchange.getResponseHeaders().set("Content-Type", mime);

                byte[] data = Files.readAllBytes(file);
                exchange.sendResponseHeaders(200, data.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(data);
                }
            } catch (Exception e) {
                exchange.sendResponseHeaders(500, -1);
            }
        });

        server.start();
        System.out.println("Serving on http://localhost:" + port + "/");
    }

}
