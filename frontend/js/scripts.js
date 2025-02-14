$(document).ready(function () {
  var paginaActualUsuarios = 1;
  var busquedaActualUsuarios = "";

  //CARGAR USUARIOS************************************
  function cargarUsuarios(pagina, busqueda) {
    paginaActualUsuarios = pagina;
    busquedaActualUsuarios = busqueda;
    $.ajax({
      url: "../backend/users.php?accion=listar",
      type: "GET",
      data: { pagina: pagina, busqueda: busqueda },
      dataType: "json",
      success: function (response) {
        var tbody = $("#dataTable tbody");
        tbody.empty();

        var usuarios = response.usuarios;
        var totalUsuarios = response.total_usuarios;
        var paginaActual = response.pagina_actual;
        var porPagina = response.por_pagina;

        if (usuarios.length > 0) {
          $.each(usuarios, function (index, usuario) {
            var fila = $("<tr>");
            fila.append("<td>" + usuario.dni + "</td>");
            fila.append("<td>" + usuario.nombre_completo + "</td>");
            fila.append("<td>" + usuario.fecha_nacimiento + "</td>");
            fila.append("<td>" + usuario.telefono + "</td>");
            fila.append("<td>" + usuario.email + "</td>");
            fila.append(
              '<td><button class="btn btn-sm btn-primary btn-editar-usuario" data-id="' +
                usuario.id +
                '"><i class="fas fa-edit"></i> Editar</button></td>'
            );
            tbody.append(fila);
          });
        } else {
          tbody.append(
            '<tr><td colspan="6" class="text-center">No se encontraron usuarios</td></tr>'
          );
        }

        generarPaginacion(totalUsuarios, paginaActual, porPagina, busqueda);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("Error al cargar usuarios:", textStatus, errorThrown);
        $("#dataTable tbody").html(
          '<tr><td colspan="6" class="text-center text-danger">Error al cargar los usuarios.</td></tr>'
        );
      },
    });
  }
  //Paginación ************************************

  function generarPaginacion(totalUsuarios, paginaActual, porPagina, busqueda) {
    var totalPaginas = Math.ceil(totalUsuarios / porPagina);
    var paginacionHtml = "";
    var paginacion = $("#paginacionUsuarios");
    paginacion.empty();

    if (totalPaginas > 1) {
      paginacionHtml +=
        '<li class="page-item ' + (paginaActual == 1 ? "disabled" : "") + '">';
      paginacionHtml +=
        '<a class="page-link" href="#" data-pagina="' +
        (paginaActual - 1) +
        '" aria-label="Previous">';
      paginacionHtml += '<span aria-hidden="true">&laquo;</span>';
      paginacionHtml += "</a></li>";

      var inicio = Math.max(1, paginaActual - 2);
      var fin = Math.min(totalPaginas, paginaActual + 2);

      for (var i = inicio; i <= fin; i++) {
        paginacionHtml +=
          '<li class="page-item ' + (paginaActual == i ? "active" : "") + '">';
        paginacionHtml +=
          '<a class="page-link" href="#" data-pagina="' +
          i +
          '">' +
          i +
          "</a></li>";
      }

      paginacionHtml +=
        '<li class="page-item ' +
        (paginaActual == totalPaginas ? "disabled" : "") +
        '">';
      paginacionHtml +=
        '<a class="page-link" href="#" data-pagina="' +
        (paginaActual + 1) +
        '" aria-label="Next">';
      paginacionHtml += '<span aria-hidden="true">&raquo;</span>';
      paginacionHtml += "</a></li>";
    }

    paginacion.append(paginacionHtml);
  }

  //Cargar datos users ************************************

  function cargarDatosUsuarioParaEdicion(idUsuario) {
    $.ajax({
      url: "../backend/users.php?accion=obtener_usuario",
      type: "GET",
      data: { id: idUsuario },
      dataType: "json",
      success: function (usuario) {
        $("#editarUsuarioId").val(usuario.id);
        $("#editarDNI").val(usuario.dni);
        $("#editarNombreCompleto").val(usuario.nombre_completo);
        $("#editarFechaNacimiento").val(usuario.fecha_nacimiento);
        $("#editarTelefono").val(usuario.telefono);
        $("#editarEmail").val(usuario.email);
        $("#editarUsuarioModal").modal("show");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error(
          "Error al cargar datos de usuario para edición:",
          textStatus,
          errorThrown
        );
        alert(
          "Error al cargar datos del usuario. Por favor, intenta de nuevo."
        );
      },
    });
  }

  $("#btnGuardarCambiosUsuario").click(function () {
    var editarDNI = $("#editarDNI").val();
    var editarNombreCompleto = $("#editarNombreCompleto").val();
    var editarFechaNacimiento = $("#editarFechaNacimiento").val();

    if (
      editarDNI.trim() === "" ||
      editarNombreCompleto.trim() === "" ||
      editarFechaNacimiento.trim() === ""
    ) {
      alert(
        "DNI, Nombre Completo y Fecha de Nacimiento son campos obligatorios."
      );
      return;
    }

    var datosUsuario = $("#formEditarUsuario").serialize();
    $.ajax({
      url: "../backend/users.php?accion=guardar_usuario",
      type: "POST",
      data: datosUsuario,
      dataType: "json",
      success: function (response) {
        if (response.success) {
          $("#editarUsuarioModal").modal("hide");
          cargarUsuarios(paginaActualUsuarios, busquedaActualUsuarios);
          alert("Usuario actualizado correctamente.");
        } else {
          alert("Error al guardar los cambios: " + response.error);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error(
          "Error al guardar cambios del usuario:",
          textStatus,
          errorThrown
        );
        alert("Error al guardar los cambios. Por favor, intenta de nuevo.");
      },
    });
  });

  $("#btnNuevoUsuario").click(function () {
    $("#nuevoUsuarioModal").modal("show");
  });

  $("#btnCrearNuevoUsuario").click(function () {
    var nuevoDNI = $("#nuevoDNI").val();
    var nuevoNombreCompleto = $("#nuevoNombreCompleto").val();
    var nuevoFechaNacimiento = $("#nuevoFechaNacimiento").val();

    if (
      nuevoDNI.trim() === "" ||
      nuevoNombreCompleto.trim() === "" ||
      nuevoFechaNacimiento.trim() === ""
    ) {
      alert(
        "DNI, Nombre Completo y Fecha de Nacimiento son campos obligatorios."
      );
      return;
    }

    var datosNuevoUsuario = $("#formNuevoUsuario").serialize();
    $.ajax({
      url: "../backend/users.php?accion=crear_usuario",
      type: "POST",
      data: datosNuevoUsuario,
      dataType: "json",
      success: function (response) {
        if (response.success) {
          $("#nuevoUsuarioModal").modal("hide");
          cargarUsuarios(1, "");
          alert("Usuario creado correctamente.");
          $("#formNuevoUsuario")[0].reset();
        } else {
          alert("Error al crear usuario: " + response.error);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("Error al crear nuevo usuario:", textStatus, errorThrown);
        alert("Error al crear el usuario. Por favor, intenta de nuevo.");
      },
    });
  });

  $("#dataTable tbody").on("click", ".btn-editar-usuario", function () {
    var idUsuario = $(this).data("id");
    cargarDatosUsuarioParaEdicion(idUsuario);
  });

  cargarUsuarios(1, "");

  $("#btnBuscarUsuarios").click(function () {
    var textoBusqueda = $("#buscadorUsuarios").val();
    cargarUsuarios(1, textoBusqueda);
  });

  $("#paginacionUsuarios").on(
    "click",
    "li.page-item a.page-link",
    function (e) {
      e.preventDefault();
      if (
        !$(this).parent().hasClass("disabled") &&
        !$(this).parent().hasClass("active")
      ) {
        var pagina = $(this).data("pagina");
        cargarUsuarios(pagina, $("#buscadorUsuarios").val());
      }
    }
  );
});
