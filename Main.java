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

// "java": "cd $dir && javac -cp \".;lib/*\" $fileName && java -cp \".;lib/*\" $fileNameWithoutExt",

public class Main {

    public static Connection connect() throws Exception {
        String url = "jdbc:mysql://w01ba120.kasserver.com:3306/d0430a00";
        String user = "d0430a00";
        String password = "Automato-!";
        return DriverManager.getConnection(url, user, password);
    }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        Path root = Path.of(".").toAbsolutePath().normalize();

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // ---------------------------------------------------------------
        // STATIC FILE SERVER
        // ---------------------------------------------------------------
        server.createContext("/", exchange -> {
            try {
                String reqPath = exchange.getRequestURI().getPath();
                if (reqPath.equals("/")) reqPath = "/index.html";

                Path file = root.resolve(reqPath.substring(1)).normalize();

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

        // ---------------------------------------------------------------
        // LOGIN — POST /submit
        // Setzt userID UND username als Cookie
        // ---------------------------------------------------------------
        server.createContext("/submit", exchange -> {
            if ("POST".equals(exchange.getRequestMethod())) {

                String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                Map<String, String> params = parseFormData(body);
                String username = params.get("username");
                String password = params.get("password");

                String sql = "SELECT UserID FROM Users WHERE Username = ? AND Password = ?";
                int foundUserID = -1;

                try (Connection con = connect();
                     PreparedStatement ps = con.prepareStatement(sql)) {
                    ps.setString(1, username);
                    ps.setString(2, password);
                    ResultSet rs = ps.executeQuery();
                    if (rs.next()) foundUserID = rs.getInt("UserID");
                } catch (Exception e) {
                    e.printStackTrace();
                }

                System.out.println("Login: " + username + " — " + (foundUserID != -1 ? "SUCCESS" : "FAILED"));

                String response;
                if (foundUserID != -1) {
                    // Beide Cookies setzen: userID und username
                    exchange.getResponseHeaders().add("Set-Cookie", "userID=" + foundUserID + "; Path=/");
                    exchange.getResponseHeaders().add("Set-Cookie", "username=" + URLDecoder.decode(username, StandardCharsets.UTF_8) + "; Path=/");
                    response = "{\"success\":true,\"userID\":" + foundUserID + "}";
                } else {
                    response = "{\"error\":\"Invalid username or password\"}";
                }

                byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, bytes.length);
                exchange.getResponseBody().write(bytes);
                exchange.close();
            }
        });

        // ---------------------------------------------------------------
        // PROJEKTE LADEN — GET /projects?userID=3
        // ---------------------------------------------------------------
        server.createContext("/projects", exchange -> {
            if ("GET".equals(exchange.getRequestMethod())) {

                String query = exchange.getRequestURI().getQuery();
                int userID = -1;
                if (query != null) {
                    for (String param : query.split("&")) {
                        String[] kv = param.split("=");
                        if (kv.length == 2 && kv[0].equals("userID")) {
                            try { userID = Integer.parseInt(kv[1]); } catch (Exception ignored) {}
                        }
                    }
                }

                StringBuilder json = new StringBuilder("[");
                String sql = "SELECT projectID, ProjectName, ProjectType FROM Projects WHERE UserID = ?";

                try (Connection con = connect();
                     PreparedStatement ps = con.prepareStatement(sql)) {
                    ps.setInt(1, userID);
                    ResultSet rs = ps.executeQuery();
                    boolean first = true;
                    while (rs.next()) {
                        if (!first) json.append(",");
                        String name = rs.getString("ProjectName").replace("\"", "\\\"");
                        String type = rs.getString("ProjectType");
                        if (type == null) type = "acceptor";
                        json.append(String.format(
                            "{\"id\":%d,\"name\":\"%s\",\"type\":\"%s\"}",
                            rs.getInt("projectID"), name, type
                        ));
                        first = false;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }

                json.append("]");
                byte[] bytes = json.toString().getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, bytes.length);
                exchange.getResponseBody().write(bytes);
                exchange.close();
            }
        });

        // ---------------------------------------------------------------
        // PROJEKT ERSTELLEN — POST /createProject
        // ---------------------------------------------------------------
        server.createContext("/createProject", exchange -> {
            if ("POST".equals(exchange.getRequestMethod())) {

                String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                Map<String, String> params = parseFormData(body);

                int userID = -1;
                try { userID = Integer.parseInt(params.get("userID")); } catch (Exception ignored) {}
                String name = params.get("name");
                String type = params.getOrDefault("type", "acceptor");

                if (name == null || name.isBlank() || userID == -1) {
                    String err = "{\"error\":\"missing fields\"}";
                    byte[] bytes = err.getBytes(StandardCharsets.UTF_8);
                    exchange.getResponseHeaders().set("Content-Type", "application/json");
                    exchange.sendResponseHeaders(400, bytes.length);
                    exchange.getResponseBody().write(bytes);
                    exchange.close();
                    return;
                }

                String sql = "INSERT INTO Projects (UserID, ProjectName, Json, ProjectType) VALUES (?, ?, ?, ?)";
                int newID = -1;

                try (Connection con = connect();
                     PreparedStatement ps = con.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
                    ps.setInt(1, userID);
                    ps.setString(2, name);
                    ps.setString(3, "{}");
                    ps.setString(4, type);
                    ps.executeUpdate();
                    ResultSet keys = ps.getGeneratedKeys();
                    if (keys.next()) newID = keys.getInt(1);
                } catch (Exception e) {
                    e.printStackTrace();
                }

                String response = "{\"id\":" + newID + "}";
                byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, bytes.length);
                exchange.getResponseBody().write(bytes);
                exchange.close();
            }
        });

        // ---------------------------------------------------------------
        // PROJEKT SPEICHERN — POST /saveProject?projectID=5
        // Body: roher Cytoscape-JSON String
        // ---------------------------------------------------------------
        server.createContext("/saveProject", exchange -> {
            if ("POST".equals(exchange.getRequestMethod())) {

                // projectID aus Query-Parameter lesen
                String query = exchange.getRequestURI().getQuery();
                int projectID = -1;
                if (query != null) {
                    for (String param : query.split("&")) {
                        String[] kv = param.split("=", 2);
                        if (kv.length == 2 && kv[0].equals("projectID")) {
                            try { projectID = Integer.parseInt(kv[1]); } catch (Exception ignored) {}
                        }
                    }
                }

                // Graph-JSON direkt aus Body lesen — kein Parsing nötig
                String jsonData = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8).trim();

                if (projectID == -1 || jsonData.isEmpty()) {
                    String err = "{\"error\":\"missing fields\"}";
                    byte[] bytes = err.getBytes(StandardCharsets.UTF_8);
                    exchange.getResponseHeaders().set("Content-Type", "application/json");
                    exchange.sendResponseHeaders(400, bytes.length);
                    exchange.getResponseBody().write(bytes);
                    exchange.close();
                    return;
                }

                String sql = "UPDATE Projects SET Json = ? WHERE projectID = ?";
                try (Connection con = connect();
                     PreparedStatement ps = con.prepareStatement(sql)) {
                    ps.setString(1, jsonData);
                    ps.setInt(2, projectID);
                    ps.executeUpdate();
                    System.out.println("Project " + projectID + " saved. JSON length: " + jsonData.length());
                } catch (Exception e) {
                    e.printStackTrace();
                }

                String response = "{\"success\":true}";
                byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, bytes.length);
                exchange.getResponseBody().write(bytes);
                exchange.close();
            }
        });

        // ---------------------------------------------------------------
        // PROJEKT LADEN — GET /loadProject?projectID=5
        // ---------------------------------------------------------------
        server.createContext("/loadProject", exchange -> {
            if ("GET".equals(exchange.getRequestMethod())) {

                String query = exchange.getRequestURI().getQuery();
                int projectID = -1;
                if (query != null) {
                    for (String param : query.split("&")) {
                        String[] kv = param.split("=");
                        if (kv.length == 2 && kv[0].equals("projectID")) {
                            try { projectID = Integer.parseInt(kv[1]); } catch (Exception ignored) {}
                        }
                    }
                }

                String jsonData = "{}";
                String sql = "SELECT Json FROM Projects WHERE projectID = ?";
                try (Connection con = connect();
                     PreparedStatement ps = con.prepareStatement(sql)) {
                    ps.setInt(1, projectID);
                    ResultSet rs = ps.executeQuery();
                    if (rs.next()) jsonData = rs.getString("Json");
                } catch (Exception e) {
                    e.printStackTrace();
                }

                // Graph-JSON direkt zurückgeben (kein Wrapper)
                String response = jsonData;
                byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, bytes.length);
                exchange.getResponseBody().write(bytes);
                exchange.close();
            }
        });

        // ---------------------------------------------------------------
        // PROJEKT LÖSCHEN — POST /deleteProject
        // ---------------------------------------------------------------
        server.createContext("/deleteProject", exchange -> {
            if ("POST".equals(exchange.getRequestMethod())) {

                String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                Map<String, String> params = parseFormData(body);

                int projectID = -1;
                try { projectID = Integer.parseInt(params.get("projectID")); } catch (Exception ignored) {}

                if (projectID != -1) {
                    String sql = "DELETE FROM Projects WHERE projectID = ?";
                    try (Connection con = connect();
                         PreparedStatement ps = con.prepareStatement(sql)) {
                        ps.setInt(1, projectID);
                        ps.executeUpdate();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                exchange.sendResponseHeaders(200, 0);
                exchange.close();
            }
        });

        // ---------------------------------------------------------------
        // SERVER STARTEN
        // ---------------------------------------------------------------
        server.start();
        System.out.println("Serving on http://localhost:" + port + "/");

        try (Connection con = connect()) {
            System.out.println("Database connection successful!");
        } catch (Exception e) {
            System.out.println("Database connection failed:");
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
