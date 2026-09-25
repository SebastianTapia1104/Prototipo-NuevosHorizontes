const cuentas = {
  administrador: { clave: "1234", rol: "administrador", administra: true, nombre: "Camila Soto", unidad: "804" },
  administrador2: { clave: "1234", rol: "administrador", administra: true, nombre: "Elena Muñoz", unidad: "305" },
  arrendatario: { clave: "1234", rol: "arrendatario", administra: false, nombre: "Andrés Paredes", unidad: "1202" }
};

const semilla = {
  residentes: [
    { id: 1, nombre: "Camila Soto", unidad: "804", contacto: "camila.soto@correo.cl", tipo: "Administrador" },
    { id: 11, nombre: "Andrés Paredes", unidad: "1202", contacto: "andres.paredes@correo.cl", tipo: "Arrendatario", propietarioId: 1 },
    { id: 12, nombre: "Paula Riquelme", unidad: "1203", contacto: "paula.riquelme@correo.cl", tipo: "Arrendatario", propietarioId: 1 },
    { id: 13, nombre: "Mateo Fuentes", unidad: "1205", contacto: "mateo.fuentes@correo.cl", tipo: "Arrendatario", propietarioId: 1 },
    { id: 14, nombre: "Sofía Araya", unidad: "1206", contacto: "sofia.araya@correo.cl", tipo: "Arrendatario", propietarioId: 1 },
    { id: 15, nombre: "Diego Salas", unidad: "1208", contacto: "diego.salas@correo.cl", tipo: "Arrendatario", propietarioId: 1 },
    { id: 2, nombre: "Elena Muñoz", unidad: "305", contacto: "elena.munoz@correo.cl", tipo: "Administrador" },
    { id: 21, nombre: "Luis Rojas", unidad: "306", contacto: "luis.rojas@correo.cl", tipo: "Arrendatario", propietarioId: 2 },
    { id: 22, nombre: "Valentina Cruz", unidad: "307", contacto: "valentina.cruz@correo.cl", tipo: "Arrendatario", propietarioId: 2 },
    { id: 23, nombre: "Jorge Núñez", unidad: "308", contacto: "jorge.nunez@correo.cl", tipo: "Arrendatario", propietarioId: 2 },
    { id: 24, nombre: "Camila Herrera", unidad: "309", contacto: "camila.herrera@correo.cl", tipo: "Arrendatario", propietarioId: 2 },
    { id: 25, nombre: "Renato Vidal", unidad: "310", contacto: "renato.vidal@correo.cl", tipo: "Arrendatario", propietarioId: 2 }
  ],
  cuotas: [
    { id: 101, residenteId: 1, concepto: "Gastos comunes abril", monto: 85000, fecha: "2026-04-05", estado: "Pendiente" },
    { id: 111, residenteId: 11, concepto: "Gastos comunes marzo", monto: 85000, fecha: "2026-03-05", estado: "Vencido" },
    { id: 112, residenteId: 11, concepto: "Gastos comunes abril", monto: 92000, fecha: "2026-04-05", estado: "Vencido" },
    { id: 121, residenteId: 12, concepto: "Gastos comunes abril", monto: 85000, fecha: "2026-04-05", estado: "Pagado" },
    { id: 131, residenteId: 13, concepto: "Gastos comunes abril", monto: 85000, fecha: "2026-04-08", estado: "Pendiente" },
    { id: 141, residenteId: 14, concepto: "Gastos comunes abril", monto: 85000, fecha: "2026-04-05", estado: "Vencido" },
    { id: 151, residenteId: 15, concepto: "Gastos comunes abril", monto: 85000, fecha: "2026-04-12", estado: "Pagado" },
    { id: 201, residenteId: 2, concepto: "Gastos comunes abril", monto: 85000, fecha: "2026-04-10", estado: "Pagado" },
    { id: 211, residenteId: 21, concepto: "Gastos comunes abril", monto: 85000, fecha: "2026-04-05", estado: "Vencido" },
    { id: 221, residenteId: 22, concepto: "Gastos comunes abril", monto: 78000, fecha: "2026-04-06", estado: "Pendiente" },
    { id: 231, residenteId: 23, concepto: "Gastos comunes abril", monto: 85000, fecha: "2026-04-04", estado: "Vencido" },
    { id: 241, residenteId: 24, concepto: "Gastos comunes abril", monto: 85000, fecha: "2026-04-09", estado: "Pagado" },
    { id: 251, residenteId: 25, concepto: "Gastos comunes abril", monto: 90000, fecha: "2026-04-11", estado: "Pendiente" }
  ],
  alertas: [
    { id: 1, residenteId: 11, fecha: "2026-04-12", texto: "Tiene cuotas vencidas por $177.000. Regularice el pago para evitar recargos." },
    { id: 2, residenteId: 21, fecha: "2026-04-12", texto: "Unidad 306: tiene una cuota vencida por $85.000. Revise el detalle en Cuotas y pagos." }
  ]
};

const estado = cargar();
let sesion = null;

function cargar() {
  const guardado = localStorage.getItem("nh-proto-v4");
  if (guardado) return JSON.parse(guardado);
  return structuredClone(semilla);
}

function guardar() {
  localStorage.setItem("nh-proto-v4", JSON.stringify(estado));
}

function $(id) { return document.getElementById(id); }

function formatoMonto(n) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function formatoFecha(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function residentePorId(id) {
  return estado.residentes.find((r) => r.id === id);
}

function aplicarModo(modo) {
  const baja = modo === "baja";
  document.body.classList.toggle("modo-baja", baja);
  document.body.classList.toggle("modo-alta", !baja);
  $("btn-baja").setAttribute("aria-pressed", String(baja));
  $("btn-alta").setAttribute("aria-pressed", String(!baja));
  $("estilos").disabled = baja;
  document.querySelectorAll(".solo-alta").forEach((el) => { el.hidden = baja; });
  document.querySelectorAll(".solo-baja").forEach((el) => { el.hidden = !baja; });
  localStorage.setItem("nh-modo", modo);
}

function mostrar(idPantalla) {
  document.querySelectorAll(".pantalla").forEach((p) => {
    p.hidden = true;
    p.classList.remove("activa");
  });
  const activa = $(`pantalla-${idPantalla}`);
  activa.hidden = false;
  activa.classList.add("activa");
  document.querySelectorAll(".nav-item").forEach((b) => {
    b.setAttribute("aria-current", b.dataset.pantalla === idPantalla ? "page" : "false");
  });
  if (idPantalla === "residentes") pintarResidentes();
  if (idPantalla === "cuotas") pintarCuotas();
  if (idPantalla === "alertas") pintarAlertas();
}

function etiquetaRol(cuenta) {
  if (cuenta.administra) return "Administrador";
  return "Arrendatario";
}

function textoRol(cuenta) {
  if (cuenta.administra) {
    return `${cuenta.nombre} es administrador y gestiona solo a sus arrendatarios. Desde aquí los registra, cobra sus cuotas y les envía recordatorios. No ve la información del otro administrador.`;
  }
  return "Desde aquí consulta lo que debe su unidad y los recordatorios por morosidad. No administra las cuentas del edificio.";
}

function idPropietarioSesion() {
  const propio = estado.residentes.find((r) => r.nombre === sesion.nombre && r.tipo === "Administrador");
  return propio ? propio.id : null;
}

function arrendatariosDelPropietario() {
  const id = idPropietarioSesion();
  return estado.residentes.filter((r) => r.tipo === "Arrendatario" && r.propietarioId === id);
}

function entrar(cuenta, usuario) {
  sesion = { usuario, ...cuenta };
  $("vista-login").hidden = true;
  $("vista-app").hidden = false;
  $("btn-salir").hidden = false;
  $("sesion-texto").hidden = false;
  $("sesion-texto").textContent = `${cuenta.nombre} · ${etiquetaRol(cuenta)}`;
  $("saludo").textContent = cuenta.administra ? "Cobro del edificio" : `Hola, ${cuenta.nombre}`;
  $("texto-rol").textContent = textoRol(cuenta);
  const esAdmin = cuenta.administra;
  $("form-residente").hidden = !esAdmin;
  $("bloque-envio").hidden = !esAdmin;
  $("bloque-bandeja").hidden = esAdmin;
  $("nav-residentes").textContent = esAdmin ? "2 · Registro de residentes" : "2 · Ficha de arrendatario";
  $("titulo-card-residentes").textContent = esAdmin ? "Registro de residentes" : "Ficha de arrendatario";
  $("etiqueta-residentes").textContent = esAdmin
    ? "Función 2 · Gestión del registro de residentes"
    : "Función 2 · Ficha de arrendatario";
  $("titulo-residentes").textContent = esAdmin ? "Residentes a su cargo" : "Ficha de arrendatario";
  $("tabla-residentes-wrap").hidden = !esAdmin;
  $("ficha-arrendatario").hidden = esAdmin;
  $("ayuda-residentes").textContent = esAdmin
    ? "Solo ve a los arrendatarios de su cargo. No aparece la información del otro administrador. El alta es únicamente de arrendatarios."
    : "Estos son sus datos de arrendatario. No administra el registro de otros residentes.";
  const textos = esAdmin
    ? ["Agregar arrendatarios a su cargo.", "Cobro de las cuotas de sus residentes.", "Avisos a sus arrendatarios con cuotas vencidas."]
    : ["Sus datos de arrendatario.", "Pagar la cuota de su unidad.", "Avisos de morosidad recibidos."];
  document.querySelectorAll(".funcion p").forEach((p, i) => { p.textContent = textos[i]; });
  mostrar("inicio");
}

function salir() {
  sesion = null;
  $("vista-app").hidden = true;
  $("vista-login").hidden = false;
  $("btn-salir").hidden = true;
  $("sesion-texto").hidden = true;
  $("form-login").reset();
  $("error-login").hidden = true;
}

function pintarResidentes() {
  if (sesion && !sesion.administra) {
    const ficha = estado.residentes.find((r) => r.nombre === sesion.nombre);
    $("datos-ficha").innerHTML = ficha
      ? `<dt>Nombre</dt><dd>${ficha.nombre}</dd><dt>Unidad</dt><dd>${ficha.unidad}</dd><dt>Contacto</dt><dd>${ficha.contacto}</dd><dt>Tipo</dt><dd>Arrendatario</dd>`
      : "";
    return;
  }
  const filas = arrendatariosDelPropietario().map((r) =>
    `<tr><td>${r.nombre}</td><td>${r.unidad}</td><td>${r.contacto}</td><td>Arrendatario · paga su cuota</td></tr>`
  ).join("");
  $("tabla-residentes").innerHTML = filas || "<tr><td colspan='4'>Aún no tiene arrendatarios a su cargo.</td></tr>";
}

function cuotasVisibles() {
  if (!sesion) return [];
  if (sesion.administra) {
    const ids = new Set(arrendatariosDelPropietario().map((r) => r.id));
    const yo = idPropietarioSesion();
    if (yo) ids.add(yo);
    return estado.cuotas.filter((c) => ids.has(c.residenteId));
  }
  const propio = estado.residentes.find((r) => r.nombre === sesion.nombre);
  return estado.cuotas.filter((c) => propio && c.residenteId === propio.id);
}

function pintarCuotas() {
  const lista = cuotasVisibles();
  $("tabla-cuotas").innerHTML = lista.map((c) => {
    const r = residentePorId(c.residenteId);
    const clase = c.estado.toLowerCase();
    const etiquetaFecha = c.estado === "Pagado" ? "Pago" : "Vencimiento";
    return `<tr>
      <td>${r ? r.nombre : "—"}</td>
      <td>${r ? r.unidad : "—"}</td>
      <td>${c.concepto}</td>
      <td>${formatoMonto(c.monto)}</td>
      <td>${etiquetaFecha}: ${formatoFecha(c.fecha)}</td>
      <td><span class="estado estado-${clase}">${c.estado}</span></td>
    </tr>`;
  }).join("") || "<tr><td colspan='6'>No hay cuotas para mostrar.</td></tr>";

  const pendientes = lista.filter((c) => c.estado !== "Pagado");
  const pagadas = lista.filter((c) => c.estado === "Pagado");
  const deuda = pendientes.reduce((s, c) => s + c.monto, 0);
  $("resumen-cuotas").innerHTML = `
    <p><strong>Pendientes o vencidas:</strong> ${pendientes.length}</p>
    <p><strong>Pagadas:</strong> ${pagadas.length}</p>
    <p><strong>Monto por regularizar:</strong> ${formatoMonto(deuda)}</p>`;

  $("ayuda-cuotas").textContent = sesion && sesion.administra
    ? "Como administrador ve las cuentas de sus residentes y registra el cobro. El estado se lee en texto: Pagado, Pendiente o Vencido."
    : "Como arrendatario ve la cuota de su unidad y puede pagarla. El estado se lee en texto: Pagado, Pendiente o Vencido.";

  const select = $("cuota-pago");
  const abiertas = lista.filter((c) => c.estado !== "Pagado");
  select.innerHTML = abiertas.map((c) => {
    const r = residentePorId(c.residenteId);
    return `<option value="${c.id}">${r ? r.unidad : ""} · ${c.concepto} · ${formatoMonto(c.monto)} · ${c.estado}</option>`;
  }).join("");
  const hay = abiertas.length > 0;
  $("form-pago").hidden = !hay;
  if (sesion && sesion.administra) {
    $("titulo-pago").textContent = "Registrar cobro";
    $("label-cuota").textContent = "Cuota por cobrar";
    $("btn-pago").textContent = "Registrar cobro";
  } else {
    $("titulo-pago").textContent = "Pagar mi cuota";
    $("label-cuota").textContent = "Cuota de mi unidad";
    $("btn-pago").textContent = "Pagar";
  }
}

function morosos() {
  const ids = new Set(estado.cuotas.filter((c) => c.estado === "Vencido").map((c) => c.residenteId));
  return arrendatariosDelPropietario().filter((r) => ids.has(r.id));
}

function pintarAlertas() {
  const lista = morosos();
  $("lista-morosos").innerHTML = lista.length
    ? lista.map((r) => {
        const deuda = estado.cuotas.filter((c) => c.residenteId === r.id && c.estado === "Vencido")
          .reduce((s, c) => s + c.monto, 0);
        return `<li><strong>${r.nombre}</strong> · unidad ${r.unidad}<br><span class="meta">${r.contacto} · deuda vencida ${formatoMonto(deuda)}</span></li>`;
      }).join("")
    : "<li>No hay residentes con cuotas vencidas.</li>";

  const propio = sesion && estado.residentes.find((r) => r.nombre === sesion.nombre);
  const avisos = propio ? estado.alertas.filter((a) => a.residenteId === propio.id) : [];
  $("bandeja").innerHTML = avisos.length
    ? avisos.map((a) => `<li><strong>Recordatorio ${formatoFecha(a.fecha)}</strong><br>${a.texto}</li>`).join("")
    : "<li>No tiene recordatorios.</li>";
  $("ayuda-alertas").textContent = sesion && sesion.administra
    ? "Identifique a quienes tienen cuotas vencidas y envíe el aviso. El cobro lo hace cada administrador sobre sus residentes."
    : "Aquí aparecen los recordatorios que su administrador envió a su unidad.";
}

$("form-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const usuario = $("usuario").value.trim().toLowerCase();
  const clave = $("clave").value;
  const cuenta = cuentas[usuario];
  const error = $("error-login");
  if (!cuenta || cuenta.clave !== clave) {
    error.hidden = false;
    error.textContent = "Usuario o contraseña incorrectos. Revise los datos e intente de nuevo.";
    return;
  }
  error.hidden = true;
  entrar(cuenta, usuario);
});

$("btn-salir").addEventListener("click", salir);
$("btn-baja").addEventListener("click", () => aplicarModo("baja"));
$("btn-alta").addEventListener("click", () => aplicarModo("alta"));

document.querySelectorAll("[data-pantalla]").forEach((b) => {
  b.addEventListener("click", () => mostrar(b.dataset.pantalla));
});

$("form-residente").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const id = Date.now();
  const idDueno = idPropietarioSesion();
  estado.residentes.push({
    id,
    nombre: data.get("nombre").trim(),
    unidad: data.get("unidad").trim(),
    contacto: data.get("contacto").trim(),
    tipo: "Arrendatario",
    propietarioId: idDueno
  });
  estado.cuotas.push({
    id: id + 1,
    residenteId: id,
    concepto: "Gastos comunes abril",
    monto: 85000,
    fecha: "2026-04-30",
    estado: "Pendiente"
  });
  guardar();
  e.target.reset();
  $("ok-residente").textContent = "Arrendatario agregado. Solo usted lo ve; no se creó otro administrador.";
  $("ok-residente").hidden = false;
  pintarResidentes();
});

$("form-pago").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = Number($("cuota-pago").value);
  const cuota = estado.cuotas.find((c) => c.id === id);
  if (!cuota) return;
  cuota.estado = "Pagado";
  cuota.fecha = $("fecha-pago").value;
  guardar();
  $("ok-pago").textContent = sesion && sesion.administra
    ? "Cobro registrado. La cuota pasó a estado Pagado."
    : "Pago realizado. La cuota de su unidad pasó a estado Pagado.";
  $("ok-pago").hidden = false;
  pintarCuotas();
});

$("btn-enviar").addEventListener("click", () => {
  const hoy = new Date().toISOString().slice(0, 10);
  morosos().forEach((r) => {
    const deuda = estado.cuotas.filter((c) => c.residenteId === r.id && c.estado === "Vencido")
      .reduce((s, c) => s + c.monto, 0);
    estado.alertas.push({
      id: Date.now() + r.id,
      residenteId: r.id,
      fecha: hoy,
      texto: `Unidad ${r.unidad}: tiene cuotas vencidas por ${formatoMonto(deuda)}. Puede revisar el detalle en Cuotas y pagos.`
    });
  });
  guardar();
  $("ok-alerta").hidden = false;
  pintarAlertas();
});

aplicarModo(localStorage.getItem("nh-modo") || "alta");
$("fecha-pago").value = new Date().toISOString().slice(0, 10);
