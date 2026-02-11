import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

public class  Main {

    public static Connection connect() throws Exception {
        String url = "jdbc:mysql://w01ba120.kasserver.com:3306/d0430a00";
        String user = "d0430a00";
        String password = "Automato-!";
        return DriverManager.getConnection(url, user, password);
    }
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
        
        server.createContext("/submit", exchange -> {

    // Nur POST verarbeiten
    if ("POST".equals(exchange.getRequestMethod())) {

        // Body auslesen
        InputStream input = exchange.getRequestBody();
        String body = new String(input.readAllBytes(), StandardCharsets.UTF_8);

        // Formulardaten parsen
        Map<String, String> params = parseFormData(body);
        String username = params.get("username");
        String password = params.get("password");

        // Daten sind jetzt verfügbar
        System.out.println("Login abgeschickt!");
        System.out.println("Username: " + username);
        System.out.println("Password: " + password);

        // Optional: Verbindung zur Datenbank prüfen
        // boolean success = checkUserInDB(username, password);

        String response = "Login erhalten"; // oder "Login erfolgreich" / "Login fehlgeschlagen"
        exchange.sendResponseHeaders(200, response.length());
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }
});

        server.start();
        System.out.println("Serving on http://localhost:" + port + "/");
    
        try (Connection con = connect()) {
            System.out.println("✅ Database connection successful!");
        }
        catch (Exception e) {
            System.out.println("❌ Error during database operation:");
            e.printStackTrace();
        }

        String sql = "DO 0;";               // Change to your desired SQL command, Example: INSERT INTO Users (Username, Password) VALUES ('test1', 'password123')
        try (Connection con = connect(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.executeUpdate();
        }
        catch (Exception e) {
            e.printStackTrace();
        }

        try (Connection con = connect(); PreparedStatement ps = con.prepareStatement("SELECT * FROM Users"); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                String username = rs.getString("Username");
                String password = rs.getString("Password");
                System.out.println("Username: " + username + ", Password: " + password);
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        
    }
    private static Map<String, String> parseFormData(String body) throws UnsupportedEncodingException {
    Map<String, String> params = new HashMap<>();

    String[] pairs = body.split("&");
    for (String pair : pairs) {
        String[] keyValue = pair.split("=");
        if (keyValue.length == 2) {
            String key = URLDecoder.decode(keyValue[0], StandardCharsets.UTF_8);
            String value = URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8);
            params.put(key, value);
        }
    }
    

    return params;
}
    

    
}
