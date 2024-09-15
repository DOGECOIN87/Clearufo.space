<?php
// upload.php

// Configuration
$uploadDir = 'uploads/';
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
$maxFileSize = 100 * 1024 * 1024; // 100 MB
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

    // Validate payment details
    $paymentDetails = filter_var($_POST['payment-details'], FILTER_SANITIZE_STRING);
    if (empty($paymentDetails)) {
        die('Payment details are required.');
    }

    // Check if file was uploaded without errors
    if (isset($_FILES['media']) && $_FILES['media']['error'] == UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['media']['tmp_name'];
        $fileName = basename($_FILES['media']['name']);
        $fileSize = $_FILES['media']['size'];
        $fileType = mime_content_type($fileTmpPath);

        // Validate file type
        if (!in_array($fileType, $allowedTypes)) {
            die('Unsupported file type. Allowed types are JPEG, PNG, GIF images, and MP4, MOV videos.');
        }

        // Validate file size
        if ($fileSize > $maxFileSize) {
            die('File size exceeds the maximum allowed size of 100 MB.');
        }

        // Sanitize and create unique file name
        $newFileName = uniqid('media_', true) . '_' . preg_replace('/[^a-zA-Z0-9.-]/', '_', $fileName);
        $destPath = $uploadDir . $newFileName;

        // Create upload directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Move the file to the upload directory
        if (move_uploaded_file($fileTmpPath, $destPath)) {
            // Send notification email
            $subject = 'New Media Upload from ' . $name;
            $message = "Name: $name\nEmail: $email\nPayment Details: $paymentDetails\nFile: $destPath";
            $headers = 'From: no-reply@clearufo.space' . "\r\n" .
                       'Reply-To: ' . $email . "\r\n" .
                       'X-Mailer: PHP/' . phpversion();

            mail($recipientEmail, $subject, $message, $headers);

            echo 'Your media has been uploaded successfully. Thank you!';
        } else {
            die('There was an error moving the uploaded file.');
        }
    } else {
        die('No file uploaded or there was an upload error.');
    }
} else {
    die('Invalid request method.');
}
?>
