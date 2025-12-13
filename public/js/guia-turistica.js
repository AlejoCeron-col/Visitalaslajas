// Inicializar mapa centrado en Las Lajas
    const mapa = L.map('mapa').setView([0.8150, -77.6200], 13);

    // Capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);

    // Almacenar marcadores y control de ruta
    const marcadores = {};
    let routingControl = null;
    let lineaSimple = null;
    // Guía seleccionada (global dentro de este script)
    let selectedGuia = null;

    // Función para crear marcador personalizado
    function crearMarcador(lat, lng, color, icono, nombre, descripcion) {
      const markerHtml = `
        <img style="
          background: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          border: 3px solid white;
        " src="${icono}"></img>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(`
          <div class="popup-content">
            <h4>${nombre}</h4>
            <p>${descripcion}</p>
          </div>
        `);

      return marker;
    }

    function actualizarBotonReserva() {
      const lugaresActivos = Object.keys(marcadores);
      const btnReservar = document.getElementById('btn-reservar');
      // Deshabilitar si no hay lugares o no hay guía seleccionado
      btnReservar.disabled = (lugaresActivos.length === 0) || (!selectedGuia);
    }

    // Función para actualizar la ruta
    function actualizarRuta() {
      const lugaresActivos = Object.values(marcadores);
      const infoRuta = document.getElementById('info-ruta');
      const lugaresActivosContainer = document.getElementById('lugares-activos');

      // Limpiar ruta anterior
      if (routingControl) {
        mapa.removeControl(routingControl);
        routingControl = null;
      }
      if (lineaSimple) {
        mapa.removeLayer(lineaSimple);
        lineaSimple = null;
      }

      // Actualizar badges de lugares activos
      lugaresActivosContainer.innerHTML = lugaresActivos.map(m => `
        <span class="badge">
          <span class="badge-dot" style="background: ${m.color}"></span>
          ${m.nombre}
        </span>
      `).join('');

      // Actualizar botón de reserva
      actualizarBotonReserva();

      if (lugaresActivos.length < 2) {
        
        return;
      }

      // Crear waypoints para la ruta
      const waypoints = lugaresActivos.map(m => L.latLng(m.lat, m.lng));

      // Intentar crear ruta por carretera
      try {
        routingControl = L.Routing.control({
          waypoints: waypoints,
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: false,
          createMarker: function() { return null; },
          lineOptions: {
            styles: [
              { color: '#059669', weight: 5, opacity: 0.8 },
              { color: '#10b981', weight: 3, opacity: 0.5 }
            ]
          },
          router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
          })
        }).addTo(mapa);

        routingControl.on('routesfound', function(e) {
          const route = e.routes[0];
          const distancia = (route.summary.totalDistance / 1000).toFixed(1);
          const tiempo = Math.round(route.summary.totalTime / 60);

          
        });

        routingControl.on('routingerror', function() {
          dibujarLineaSimple(waypoints);
        });

      } catch (error) {
        dibujarLineaSimple(waypoints);
      }
    }

    // Función para dibujar línea simple como fallback
    function dibujarLineaSimple(waypoints) {
      lineaSimple = L.polyline(waypoints, {
        color: '#059669',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(mapa);

      mapa.fitBounds(lineaSimple.getBounds(), { padding: [50, 50] });

      document.getElementById('info-ruta').innerHTML = `
        <div class="info-ruta">
          <h3>Ruta Aproximada</h3>
          <p><strong>Paradas:</strong> ${waypoints.length} lugares</p>
          <p style="font-size: 0.8rem; color: #6b7280;">
            (Linea aproximada - ruta real puede variar)
          </p>
        </div>
      `;
    }

    // Manejar cambios en los switches
    document.querySelectorAll('.lugar-switch').forEach(switchEl => {
      switchEl.addEventListener('change', function() {
        const id = this.dataset.id;
        const nombre = this.dataset.nombre;
        const lat = parseFloat(this.dataset.lat);
        const lng = parseFloat(this.dataset.lng);
        const color = this.dataset.color;
        const icono = this.dataset.icono;
        const descripcion = this.dataset.descripcion;
        const lugarItem = this.closest('.lugar-item');

        if (this.checked) {
          const marker = crearMarcador(lat, lng, color, icono, nombre, descripcion);
          marker.addTo(mapa);
          marcadores[id] = { marker, lat, lng, color, nombre };
          lugarItem.classList.add('active');
          mapa.setView([lat, lng], 15, { animate: true });
        } else {
          if (marcadores[id]) {
            mapa.removeLayer(marcadores[id].marker);
            delete marcadores[id];
          }
          lugarItem.classList.remove('active');
        }

        actualizarRuta();
      });
    });

    // Función para limpiar selección
    function limpiarSeleccion() {
      document.querySelectorAll('.lugar-switch').forEach(switchEl => {
        if (switchEl.checked) {
          switchEl.checked = false;
          const id = switchEl.dataset.id;
          if (marcadores[id]) {
            mapa.removeLayer(marcadores[id].marker);
            delete marcadores[id];
          }
          switchEl.closest('.lugar-item').classList.remove('active');
        }
      });
      actualizarRuta();
      mapa.setView([0.8150, -77.6200], 13);
    }

    // Click en item para toggle
    document.querySelectorAll('.lugar-item').forEach(item => {
      item.addEventListener('click', function(e) {
        if (e.target.type !== 'checkbox') {
          const switchEl = this.querySelector('.lugar-switch');
          switchEl.checked = !switchEl.checked;
          switchEl.dispatchEvent(new Event('change'));
        }
      });
    });

      // Selección de guía
      document.querySelectorAll('.guia-item').forEach(item => {
        item.addEventListener('click', function(e) {
          // evitar toggle si se hizo click sobre elementos interactivos
          const radio = this.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
          // limpiar clases
          document.querySelectorAll('.guia-item').forEach(i => i.classList.remove('active'));
          this.classList.add('active');
          selectedGuia = this.dataset.id;
          // actualizar estado del botón de reservar
          actualizarBotonReserva();
        });
      });

    document.getElementById('form-reserva').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const lugaresSeleccionados = Object.keys(marcadores);
      
      if (lugaresSeleccionados.length === 0) {
        document.getElementById('mensaje-reserva').innerHTML = `
          <div class="mensaje error">Debes seleccionar al menos un lugar turistico.</div>
        `;
        return;
      }

      const datos = {
        cedula: document.getElementById('cedula').value,
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        fechaVisita: document.getElementById('fechaVisita').value,
        lugaresSeleccionados: lugaresSeleccionados
      };

      if (selectedGuia) {
        datos.guiaId = selectedGuia;
      }

      try {
        const response = await fetch('/api/reservas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: "include", 
          body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (response.ok) {
          // Mostrar modal de éxito en lugar del mensaje en línea
          openSuccessModal(datos.cedula);
        } else {
          document.getElementById('mensaje-reserva').innerHTML = `
            <div class="mensaje error">${resultado.error}</div>
          `;
        }
      } catch (error) {
        document.getElementById('mensaje-reserva').innerHTML = `
          <div class="mensaje error">Error al guardar la reserva. Intenta nuevamente.</div>
        `;
      }
    });

    // Establecer fecha mínima como hoy
    document.getElementById('fechaVisita').min = new Date().toISOString().split('T')[0];

    function openSuccessModal(cedula) {
      const overlay = document.getElementById('success-modal-overlay');
      const content = document.getElementById('success-modal-content');
      content.querySelector('.modal-body').textContent = `Registro guardado con éxito. Puedes consultar tu reserva con el número de cédula: ${cedula}`;
      overlay.style.display = 'flex';
      const btn = document.getElementById('success-modal-continue');

      function cleanup() {
        btn.removeEventListener('click', onContinue);
      }

      function onContinue() {
        overlay.style.display = 'none';
        // reset form and selections
        const form = document.getElementById('form-reserva');
        if (form) form.reset();
        // limpiar marcadores y ruta
        if (typeof limpiarSeleccion === 'function') limpiarSeleccion();
        if (typeof limpiarMapa === 'function') limpiarMapa();
        cleanup();
      }

      btn.addEventListener('click', onContinue);
    }