<?php
require __DIR__.'/vendor/autoload.php';

$d = new Symfony\Component\Dotenv\Dotenv();
$d->load(__DIR__.'/.env');
$d->load(__DIR__.'/.env.local');

$url = $_SERVER['DATABASE_URL'];
$p = parse_url($url);
$host = $p['host'];
$port = $p['port'] ?? 3306;
$user = $p['user'];
$pass = $p['pass'] ?? '';
$db = ltrim($p['path'] ?? '', '/');

echo "Connecting to $host:$port/$db as $user...\n";
$conn = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass);
echo "Connected.\n";

// Find pages with unicode escapes (with or without backslash prefix)
$stmt = $conn->query("SELECT id, title, html_content FROM page WHERE html_content LIKE '%u00%'");
$count = 0;

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $before = $row['html_content'];
    
    // Replace both \uXXXX and uXXXX patterns with actual UTF-8
    // First handle the standard \uXXXX JSON escapes
    $after = preg_replace_callback('/\\\\u([0-9a-fA-F]{4})/', function($m) {
        return mb_chr(hexdec($m[1]), 'UTF-8') ?? $m[0];
    }, $before);
    
    // Then handle bare uXXXX (backslash stripped, as found in DB)
    $after = preg_replace_callback('/(?<!\\\\)u([0-9a-fA-F]{4})/', function($m) {
        $char = mb_chr(hexdec($m[1]), 'UTF-8');
        // Only replace if it's a valid character (avoid false positives)
        return ($char !== null && mb_strlen($char) === 1) ? $char : $m[0];
    }, $after);
    
    if ($after !== $before) {
        $upd = $conn->prepare('UPDATE page SET html_content = ? WHERE id = ?');
        $upd->execute([$after, $row['id']]);
        $count++;
        echo "Fixed: ID {$row['id']} — {$row['title']}\n";
    } else {
        echo "No changes: ID {$row['id']} — {$row['title']}\n";
    }
}

echo "\nTotal: $count pages fixed.\n";
