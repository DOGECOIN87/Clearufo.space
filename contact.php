<?php
// contact.php

// Configuration
$recipientEmail = 'mattrickbeats@gmail.com; // Replace with your email

// Check if form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Validate name
    $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
    if (empty($name)) {
        die('Invalid name provided.');
    }

    // Validate email
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        die('Invalid email provided.');
    }

    // Validate message
    $messageContent = filter_var($_POST['message'], FILTER_SANITIZE_STRING);
    if (empty($messageContent)) {
        die('Message content is required.');
    }

    // Prepare email
    $subject = 'New Contact Message from ' . $name;
    $message = "Name: $name\nEmail: $email\n\nMessage:\n$messageContent";
    $headers = 'From: no-reply@clearufo.space' . "\r\n" .
               'Reply-To: ' . $email . "\r\n" .
               'X-Mailer: PHP/' . phpversion();

    // Send email
    if (mail($recipientEmail, $subject, $message, $headers)) {
        echo 'Thank you for contacting us. We will get back to you soon.';
    } else {
        die('There was an error sending your message.');
    }
} else {
    die('Invalid request method.');
}
?>
