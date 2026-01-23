import java.sql.Connection;
import java.sql.Statement;
import java.sql.SQLException;
import java.sql.ResultSet;
import com.mysql.jdbc.jdbc2.optional.MysqlDataSource;

class MySQLConnector {
  
  private MysqlDataSource ds;
  private Connection conn;
  private Statement s;
  
  public MySQLConnector(String user, String pw, String server, String db) {
    ds = new MysqlDataSource();
    ds.setUser(user);
    ds.setPassword(pw);
    ds.setServerName(server);
    ds.setDatabaseName(db);
    conn = null;
  }
  
  public void connect() throws SQLException {
    conn = ds.getConnection();
  }
  
  public void disconnect() throws SQLException {
    s.close();
    conn.close();
  }
  
  public ResultSet executeQuery(String query) throws SQLException {
    s = conn.createStatement();
    ResultSet rs = s.executeQuery(query);
    return rs;
  }
  
  public void executeUpdate(String query) throws SQLException {
    s = conn.createStatement();
    s.executeUpdate(query);
  }                                 

}
