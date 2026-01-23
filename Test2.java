import java.sql.*;
import com.mysql.jdbc.jdbc2.optional.MysqlDataSource;

class SQL_Tester {

  public static void main(String[] args) {
    // Ist aktuell für eine Verbindung zu dem verwendeten XAMPP-Server eingerichtet
    // --> für Zugriff auf eine andere Datenbank die Parameter entsprechend anpassen
    // --> die Parameter des MySQLConnector sind wie folgt strukturiert (benutzername, passwort, IP-Adresse des Datenbankservers, name der zu verwendenden Datenbank auf dem Server)
    MySQLConnector datenbank = new MySQLConnector("d0430a00", "Automato-!", "w01ba120.kasserver.com", "d0430a00");
    
    // In dem Datentyp "ResultSet" können die Ergebnisse einer Datenbankabfrage gespeichert werden.
    // Eine Dokumentation des Datentyps (Wie funktioniert er/Welche Methoden hat er) erhaltet ihr,
    // in dem ihr den Datentyp rechtsklickt und im aufklappenden Kontextmenü den Punkt "API-Hilfe" auswählt
    ResultSet ergebnis = null;

    try {
      // Verbindung zur Datenbank aufbauen
      // Tip: Der hier öfter verwendete Befehl "try" erlaubt es, im Programmablauf auftretende Fehler
      // abzufangen und auf sie zu reagieren, statt das Program bei einem Fehler direkt zu beenden
      datenbank.connect();

      try {
         // ... und Beispielwerte einfügen.  
        String befehl = "INSERT INTO 'Users' VALUES (NULL, 'Testvscode', 'passwort');";
        System.out.printf(">> %s%n", befehl);
        datenbank.executeUpdate(befehl); 
        
      } catch (SQLException e) {
        // Mögliche Fehler beim Ausführen des Befehls abfangen und Fehlermeldung ausgeben
        // ... das ist die Reaktion darauf, wenn bei dem Programmteil in einem "try" etwas schief geht
        System.out.printf("FEHLER: %s%n", e.getMessage());
      } 
     } catch (SQLException e) {
        // Mögliche Fehler beim Ausführen des Befehls abfangen und Fehlermeldung ausgeben
        // ... das ist die Reaktion darauf, wenn bei dem Programmteil in einem "try" etwas schief geht
        System.out.printf("FEHLER: %s%n", e.getMessage());
  }
}
}