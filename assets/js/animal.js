// /js/animal.js
import { guardarData, cargarData } from "./storage.js";

let data = { fincas: [] };
let animal = JSON.parse(localStorage.getItem("animal_seleccionado")) || null;

(async () => {
  data = await cargarData();

  // Aseguramos historial
  if (animal && !animal.historial) {
    animal.historial = [];
  }

  // 📌 Guardar cambios globales
  async function guardarCambios() {
    data.fincas.forEach(finca => {
      finca.lotes.forEach(lote => {
        const idx = lote.animales.findIndex(a => a.numero_id === animal.numero_id);
        if (idx >= 0) {
          lote.animales[idx] = animal;
        }
      });
    });

    await guardarData(data); // ✅ ahora en IndexedDB
    localStorage.setItem("animal_seleccionado", JSON.stringify(animal)); // solo para navegación
  }

  // 📌 Botón Actualizar → añade un precedente
  document.getElementById("btn-actualizar").addEventListener("click", () => {
    document.getElementById("formAnimal").reset();
    document.getElementById("modalAnimalLabel").innerText = "Nueva actualización";
    const modal = new bootstrap.Modal(document.getElementById("modalAnimal"));
    modal.show();

    document.getElementById("btn-guardar-animal").onclick = async () => {
      const nuevoRegistro = {
        peso: document.getElementById("peso").value,
        edad: document.getElementById("edad").value,
        salud: document.querySelector("input[name='salud']:checked")?.value || "",
        fecha: new Date().toISOString().split("T")[0],
        anotaciones: document.getElementById("anotaciones").value
      };

      animal.historial.push(nuevoRegistro);
      await guardarCambios();
      modal.hide();
      alert("Nueva actualización registrada ✅");
      location.reload();
    };
  });

  // 📌 Botón Editar → corrige última entrada
  document.getElementById("btn-editar").addEventListener("click", () => {
    if (animal.historial.length === 0) {
      alert("No hay actualizaciones para editar");
      return;
    }

    const ultima = animal.historial[animal.historial.length - 1];

    document.getElementById("peso").value = ultima.peso || "";
    document.getElementById("edad").value = ultima.edad || "";
    document.getElementById("anotaciones").value = ultima.anotaciones || "";
    document.querySelector(`input[name="salud"][value="${ultima.salud}"]`)?.click();

    document.getElementById("modalAnimalLabel").innerText = "Editar última actualización";
    const modal = new bootstrap.Modal(document.getElementById("modalAnimal"));
    modal.show();

    document.getElementById("btn-guardar-animal").onclick = async () => {
      ultima.peso = document.getElementById("peso").value;
      ultima.edad = document.getElementById("edad").value;
      ultima.salud = document.querySelector("input[name='salud']:checked")?.value || "";
      ultima.anotaciones = document.getElementById("anotaciones").value;

      await guardarCambios();
      modal.hide();
      alert("Última actualización corregida ✏️");
      location.reload();
    };
  });

  // 📌 Botón Historial → mostrar todas las actualizaciones
  document.getElementById("btn-historial").addEventListener("click", () => {
    const contenedor = document.getElementById("historial-body");
    contenedor.innerHTML = "";

    if (animal.historial.length === 0) {
      contenedor.innerHTML = "<p>No hay registros todavía</p>";
    } else {
      animal.historial.forEach((h, i) => {
        contenedor.innerHTML += `
          <li class="list-group-item">
            <strong>Fecha:</strong> ${h.fecha} <br>
            <strong>Peso:</strong> ${h.peso} kg <br>
            <strong>Edad:</strong> ${h.edad} meses <br>
            <strong>Salud:</strong> ${h.salud} <br>
            <strong>Anotaciones:</strong> ${h.anotaciones || "-"}
          </li>
        `;
      });
    }

    const modal = new bootstrap.Modal(document.getElementById("modalHistorial"));
    modal.show();
  });

  // 📌 Gráfica de peso
  const ctx = document.getElementById("graficaPeso").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: animal.historial.map(h => h.fecha),
      datasets: [{
        label: "Peso (kg)",
        data: animal.historial.map(h => h.peso),
        borderColor: "blue",
        fill: false
      }]
    }
  });

  // 📌 Mostrar ID en encabezado
  document.addEventListener("DOMContentLoaded", () => {
    if (animal) {
      document.getElementById("animal-id").textContent = animal.numero_id || '';
    }
  });
})();
