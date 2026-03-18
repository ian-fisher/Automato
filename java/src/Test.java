import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

//ignore: "java": "cd $dir && javac -cp ../lib/mysql-connector-j-9.6.0.jar $fileName && java -cp .;../lib/mysql-connector-j-9.6.0.jar $fileNameWithoutExt",

//Use in the terminal:
//cd java\src
//javac -cp ..\lib\mysql-connector-j-9.6.0.jar Test.java
//java -cp .;..\lib\mysql-connector-j-9.6.0.jar Test



public class Test {
    public static Connection connect() throws Exception {
        String url = "jdbc:mysql://w01ba120.kasserver.com:3306/d0430a00";
        String user = "d0430a00";
        String password = "Automato-!";
        return DriverManager.getConnection(url, user, password);
    }

    public static void main(String[] args) {
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

}