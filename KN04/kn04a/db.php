<?php
$servername = "m347-kn04a-db";
$username = "root";
$password = "rootpassword";
$dbname = "mysql";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h1>Datenbankverbindung erfolgreich!</h1>";
echo "<p>Verbunden mit Datenbank auf: " . $servername . "</p>";

$sql = "SELECT User, Host FROM mysql.user";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "<table border='1'><tr><th>User</th><th>Host</th></tr>";
    while($row = $result->fetch_assoc()) {
        echo "<tr><td>" . $row["User"] . "</td><td>" . $row["Host"] . "</td></tr>";
    }
    echo "</table>";
}
$conn->close();
?>
