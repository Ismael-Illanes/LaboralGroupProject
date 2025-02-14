<?php
require_once 'config.php';

header('Content-Type: application/json');

$accion = $_GET['accion']?? '';

switch ($accion) {
    case 'listar':
        listarUsuarios($conn);
        break;
    case 'obtener_usuario':
        obtenerUsuario($conn);
        break;
    case 'guardar_usuario':
        guardarUsuario($conn);
        break;
    case 'crear_usuario': // Nueva acción para crear un nuevo usuario
        crearUsuario($conn);
        break;
    default:
        http_response_code(400);
        echo json_encode(array("error" => "Acción no válida"));
        break;
}

function listarUsuarios($conn) {
    $pagina = $_GET['pagina'] ?? 1;
    $por_pagina = 10;
    $inicio = ($pagina - 1) * $por_pagina;
    $busqueda = $_GET['busqueda'] ?? '';

    $sql_total = "SELECT COUNT(*) AS total FROM users";
    $sql = "SELECT * FROM users";
    $where = "";
    $parametros_tipos = "";
    $parametros_valores = array();

    if (!empty($busqueda)) {
        $where = " WHERE nombre_completo LIKE ? OR dni LIKE ?";
        $parametros_tipos = "ss";
        $parametros_valores = array("%" . $busqueda . "%", "%" . $busqueda . "%");
    }

    $sql_total .= $where;
    $sql .= $where;

    $stmt_total = $conn->prepare($sql_total);

    if (!empty($where)) {
        $stmt_total->bind_param($parametros_tipos, ...$parametros_valores);
    }

    $stmt_total->execute();
    $result_total = $stmt_total->get_result();
    $total_usuarios_row = $result_total->fetch_assoc();
    $total_usuarios = $total_usuarios_row['total'];
    $stmt_total->close();

    $sql_limit = " LIMIT $inicio, $por_pagina";
    $sql .= $sql_limit;

    $stmt = $conn->prepare($sql);

    if (!empty($where)) {
        $stmt->bind_param($parametros_tipos, ...$parametros_valores);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $usuarios = array(); // **CORRECCIÓN IMPORTANTE: Inicializar $usuarios como un array VACÍO aquí**
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $usuarios[] = $row; // **Añadir cada usuario ($row) al array $usuarios**
        }
    }

    $stmt->close();

    $response = array(
        'usuarios' => $usuarios, // **Ahora $usuarios es un array de usuarios**
        'total_usuarios' => $total_usuarios,
        'pagina_actual' => intval($pagina),
        'por_pagina' => intval($por_pagina)
    );

    echo json_encode($response);
}

function obtenerUsuario($conn) {
    $id_usuario = $_GET['id']?? 0;

    if (!is_numeric($id_usuario) || $id_usuario <= 0) {
        http_response_code(400);
        echo json_encode(array("error" => "ID de usuario no válido"));
        return;
    }

    $sql = "SELECT * FROM users WHERE id =?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    $usuario = $result->fetch_assoc();
    $stmt->close();

    if ($usuario) {
        echo json_encode($usuario);
    } else {
        http_response_code(404);
        echo json_encode(array("error" => "Usuario no encontrado"));
    }
}

function guardarUsuario($conn) {
    $id_usuario = $_POST['id']?? 0;
    $dni = $_POST['dni']?? '';
    $nombre_completo = $_POST['nombre_completo']?? '';
    $fecha_nacimiento = $_POST['fecha_nacimiento']?? null;
    $telefono = $_POST['telefono']?? '';
    $email = $_POST['email']?? '';

    if (!is_numeric($id_usuario) || $id_usuario <= 0) {
        http_response_code(400);
        echo json_encode(array("error" => "ID de usuario no válido"));
        return;
    }

    // **Validación en el backend (AÑADIDO):**
    if (empty($dni) || empty($nombre_completo) || empty($fecha_nacimiento)) {
        http_response_code(400); // Bad Request
        echo json_encode(array("error" => "DNI, Nombre Completo y Fecha de Nacimiento son campos obligatorios."));
        return;
    }

    $sql = "UPDATE users SET dni =?, nombre_completo =?, fecha_nacimiento =?, telefono =?, email =? WHERE id =?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssi", $dni, $nombre_completo, $fecha_nacimiento, $telefono, $email, $id_usuario);

    if ($stmt->execute()) {
        $stmt->close();
        echo json_encode(array("success" => true));
    } else {
        http_response_code(500);
        echo json_encode(array("error" => "Error al guardar los cambios en la base de datos"));
    }
}

function crearUsuario($conn) { // Función corregida para crear un nuevo usuario
    $dni = $_POST['dni'] ?? '';
    $nombre_completo = $_POST['nombre_completo'] ?? '';
    $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? null; // Permitimos null para fecha de nacimiento opcional
    $telefono = $_POST['telefono'] ?? '';
    $email = $_POST['email'] ?? '';

    // **Validación en el backend (AÑADIDO):**
    if (empty($dni) || empty($nombre_completo) || empty($fecha_nacimiento)) {
        http_response_code(400); // Bad Request
        echo json_encode(array("error" => "DNI, Nombre Completo y Fecha de Nacimiento son campos obligatorios."));
        return;
    }

    // Validar DNI (opcional, pero recomendable):
    // ... (Aquí podrías añadir validación de formato de DNI si lo deseas) ...

    $sql = "INSERT INTO users (dni, nombre_completo, fecha_nacimiento, telefono, email) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $dni, $nombre_completo, $fecha_nacimiento, $telefono, $email);

    if ($stmt->execute()) {
        $stmt->close();
        echo json_encode(array("success" => true, "usuarios" => []));
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al crear el usuario en la base de datos"));
    }
}


$conn->close();?>