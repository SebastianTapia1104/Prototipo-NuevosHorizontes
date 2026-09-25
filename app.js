const cuentas = {
  administrador: { clave: "1234", rol: "admin", nombre: "Administración del edificio" },
  residente: { clave: "1234", rol: "residente", nombre: "Andrés Paredes", unidad: "1202" }
};

const semilla = {
  residentes: [
    { id: 1, nombre: "Camila Soto", unidad: "804", contacto: "camila.soto@correo.cl", tipo: "Propietario" },
    { id: 2, nombre: "Andrés Paredes", unidad: "1202", contacto: "andres.paredes@correo.cl", tipo: "Arrendatario" },
    { id: 3, nombre: "Elena Muñoz", unidad: "305", contacto: "elena.munoz@correo.cl", tipo: "Propietario" }
  ],
  cuotas: [
    { id: 1, residenteId: 1, concepto: "Gastos comunes marzo", monto: 85000, fecha: "2026-03-05", estado: "Pagado" },
    { id: 2, residenteId: 1, concepto: "Gastos comunes abril", monto: 85000, fecha: "2026-04-05", estado: "Pendiente" },
    { id: 3, residenteId: 2, concepto: "Gastos comunes marzo", monto: 85000, fecha: "2026-03-05", estado: "Vencido" },
    { id: 4, residenteId: 2, concepto: "Gastos comunes abril", monto: 92000, fecha: "2026-04-05", estado: "Vencido" },
    { id: 5, residenteId: 3, concepto: "Gastos comunes abril", monto: 85000, fecha: "2026-04-10", estado: "Pendiente" }
  ],
  alertas: [
    { id: 1, residenteId: 2, fecha: "2026-04-12", texto: "Tiene cuotas vencidas por $177.000. Regularice el pago para evitar recargos." }
  ]
};

const estado = cargar();
let sesion = null;

function cargar() {
  const guardado = localStorage.getItem("nh-proto");
  if (guardado) return JSON.parse(guardado);
  return structuredClone(semilla);
}

function guardar() {
  localStorage.setItem("nh-proto", JSON.stringify(estado));
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

function entrar(cuenta, usuario) {
  sesion = { usuario, ...cuenta };
  $("vista-login").hidden = true;
  $("vista-app").hidden = false;
  $("btn-salir").hidden = false;
  $("sesion-texto").hidden = false;
  $("sesion-texto").textContent = `${cuenta.nombre} · ${cuenta.rol === "admin" ? "Administración" : "Residente"}`;
  $("saludo").textContent = cuenta.rol === "admin" ? "Panel de administración" : `Hola, ${cuenta.nombre}`;
  $("texto-rol").textContent = cuenta.rol === "admin"
    ? "Desde aquí se registran residentes, se revisan cuotas y se envían recordatorios a quienes están en morosidad."
    : "Desde aquí consulta sus cuotas, el historial de pagos y los recordatorios recibidos.";
  const esAdmin = cuenta.rol === "admin";
  $("form-residente").hidden = !esAdmin;
  $("form-pago").hidden = !esAdmin;
  $("bloque-envio").hidden = !esAdmin;
  $("bloque-bandeja").hidden = esAdmin;
  $("ayuda-residentes").textContent = esAdmin
    ? "Registre nombre, unidad y contacto. El edificio distingue propietarios y arrendatarios."
    : "Estos son los datos de residentes visibles para su unidad. El alta la realiza la administración.";
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
  const lista = sesion && sesion.rol === "residente"
    ? estado.residentes.filter((r) => r.nombre === sesion.nombre)
    : estado.residentes;
  const filas = lista.map((r) =>
    `<tr><td>${r.nombre}</td><td>${r.unidad}</td><td>${r.contacto}</td><td>${r.tipo}</td></tr>`
  ).join("");
  $("tabla-residentes").innerHTML = filas || "<tr><td colspan='4'>Sin residentes registrados.</td></tr>";
}

function cuotasVisibles() {
  if (!sesion || sesion.rol === "admin") return estado.cuotas;
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

  const select = $("cuota-pago");
  const abiertas = (sesion && sesion.rol === "admin" ? estado.cuotas : lista).filter((c) => c.estado !== "Pagado");
  select.innerHTML = abiertas.map((c) => {
    const r = residentePorId(c.residenteId);
    return `<option value="${c.id}">${r ? r.unidad : ""} · ${c.concepto} · ${formatoMonto(c.monto)} · ${c.estado}</option>`;
  }).join("");
  $("form-pago").hidden = !sesion || sesion.rol !== "admin" || abiertas.length === 0;
}

function morosos() {
  const ids = new Set(estado.cuotas.filter((c) => c.estado === "Vencido").map((c) => c.residenteId));
  return estado.residentes.filter((r) => ids.has(r.id));
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
  $("ayuda-alertas").textContent = sesion && sesion.rol === "admin"
    ? "Identifique a quienes tienen cuotas vencidas y envíe un aviso con el monto adeudado."
    : "Aquí aparecen los recordatorios que la administración envió por cuotas vencidas.";
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
  estado.residentes.push({
    id,
    nombre: data.get("nombre").trim(),
    unidad: data.get("unidad").trim(),
    contacto: data.get("contacto").trim(),
    tipo: data.get("tipo")
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
