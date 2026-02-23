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

    // connects to the database using the provided credentials
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

    // POST-Request
    if ("POST".equals(exchange.getRequestMethod())) {       // Post-Request from HTML-Form

        // read the request body
        InputStream input = exchange.getRequestBody();
        String body = new String(input.readAllBytes(), StandardCharsets.UTF_8);

        // parse form data
        Map<String, String> params = parseFormData(body);
        String username = params.get("username");
        String password = params.get("password");

        // checking if username and password are present in the database
        String sql = "SELECT * FROM Users WHERE Username = ? AND Password = ?";
        boolean loginSuccess = false;

        try (Connection con = connect();    // connecting to the database in order to check if the provided username and password are correct
            PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();       //  run SQL-Query

            if (rs.next()) {
            loginSuccess = true;
            }
        } catch (Exception e) {
        e.printStackTrace();
        }

        // Daten sind jetzt verfügbar
        System.out.println("Login abgeschickt!");
        System.out.println("Username: " + username);
        System.out.println("Password: " + password);

        // Optional: Verbindung zur Datenbank prüfen
        // boolean success = checkUserInDB(username, password);

        // was the login succesful?
        String response;
        if (loginSuccess) {
            response = "Login successful";
            System.out.println("Login successful");
        } else {
            response = "Login failed";
            System.out.println("Login failed");
        }
        
        // respond to the client wether the login was successful or not
        exchange.sendResponseHeaders(200, response.length());
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
        
    }
});
        //server
        server.start();
        System.out.println("Serving on http://localhost:" + port + "/");
    

        // now only used for testing the database connection, can be a good example for how to use the database connection in the future
        try (Connection con = connect()) {
            System.out.println("Database connection successful!");
        }
        catch (Exception e) {
            System.out.println("Error during database operation:");
            e.printStackTrace();
        }

        String sql1 = "DO 0;";               // Change to your desired SQL command, Example: INSERT INTO Users (Username, Password) VALUES ('test1', 'password123')
        try (Connection con = connect(); PreparedStatement ps = con.prepareStatement(sql1)) {
            ps.executeUpdate();
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    // important function to parse the form data from the request body, it will be used in the future to get the username and password from the login form
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
