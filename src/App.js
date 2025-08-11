import React, { useState, useEffect } from 'react';

const HerramientaIncidentes = () => {
  const [showForm, setShowForm] = useState(true);
  const [jsPDFLoaded, setJsPDFLoaded] = useState(false);
  const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
  
  useEffect(() => {
    // Cargar jsPDF
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script1.onload = () => setJsPDFLoaded(true);
    document.head.appendChild(script1);
    
    // Cargar html2canvas (necesario para jsPDF)
    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script2.onload = () => setHtml2canvasLoaded(true);
    document.head.appendChild(script2);
    
    return () => {
      if (document.head.contains(script1)) document.head.removeChild(script1);
      if (document.head.contains(script2)) document.head.removeChild(script2);
    };
  }, []);
  const [formData, setFormData] = useState({
    estado: 'En Revision',
    prioridad: 'P2',
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '',
    horaFin: '',
    descripcion: '',
    situacionActual: '',
    serviciosAfectados: '',
    accionesRecuperacion: '',
    causaRaiz: '',
    solucionDefinitiva: '',
    responsable: '',
    fechaEjecucion: '',
    horaEjecucion: '',
    empresa: 'Diners Club'
  });

  const [calculadora, setCalculadora] = useState({
    mostrar: false,
    afectacion: 0,
    impactoUsuarios: 1,
    urgencia: 2,
    horario: 2
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePrioridad = (field, value) => {
    const newCalc = { ...calculadora, [field]: value };
    setCalculadora(newCalc);
    
    const puntaje = newCalc.afectacion + newCalc.impactoUsuarios + newCalc.urgencia + newCalc.horario;
    let prioridad = 'P4';
    if (puntaje >= 12) prioridad = 'P1';
    else if (puntaje >= 10) prioridad = 'P2';
    else if (puntaje >= 5) prioridad = 'P3';
    
    handleChange('prioridad', prioridad);
  };

  const calcularDuracion = () => {
    if (!formData.fechaInicio || !formData.fechaFin || !formData.horaInicio || !formData.horaFin) return '';
    
    try {
      const inicio = new Date(formData.fechaInicio + 'T' + formData.horaInicio);
      const fin = new Date(formData.fechaFin + 'T' + formData.horaFin);
      const diff = fin - inicio;
      
      if (diff <= 0) return '';
      
      const totalSegundos = Math.floor(diff / 1000);
      const horas = Math.floor(totalSegundos / 3600);
      const minutos = Math.floor((totalSegundos % 3600) / 60);
      const segundos = totalSegundos % 60;
      
      return String(horas).padStart(2, '0') + ':' + String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0');
    } catch {
      return '';
    }
  };

  const limpiar = () => {
    setFormData({
      estado: 'En Revision',
      prioridad: 'P2',
      fechaInicio: '',
      fechaFin: '',
      horaInicio: '',
      horaFin: '',
      descripcion: '',
      situacionActual: '',
      serviciosAfectados: '',
      accionesRecuperacion: '',
      causaRaiz: '',
      solucionDefinitiva: '',
      responsable: '',
      fechaEjecucion: '',
      horaEjecucion: '',
      empresa: 'Diners Club'
    });
    setCalculadora({ mostrar: false, afectacion: 0, impactoUsuarios: 1, urgencia: 2, horario: 2 });
  };

  const exportarPDF = async () => {
    if (!jsPDFLoaded || !html2canvasLoaded || !window.jspdf || !window.html2canvas) {
      alert('⏳ Por favor espera mientras se cargan los recursos necesarios...');
      return;
    }
    
    try {
      const elemento = document.querySelector('[data-communication="preview"]');
      if (!elemento) {
        alert('No se pudo encontrar el comunicado');
        return;
      }

      // Generar canvas con html2canvas
      const canvas = await window.html2canvas(elemento, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Crear PDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calcular dimensiones para centrar la imagen en el PDF
      const imgWidth = 190; // Ancho en mm (con márgenes)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPosition = 10; // Margen izquierdo
      const yPosition = 10; // Margen superior

      // Agregar la imagen al PDF
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        xPosition,
        yPosition,
        imgWidth,
        imgHeight
      );

      // Descargar el PDF
      const filename = `comunicado_${formData.estado.replace(' ', '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
      pdf.save(filename);
      
      alert('✅ PDF descargado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al generar el PDF. Intenta de nuevo.');
    }
  };

  if (showForm) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2c4b73 30%, #3d5a7a 70%, #4a6b85 100%)',
          color: 'white',
          padding: '20px 30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '600' }}>
            Crear Comunicado de Incidente
          </h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            Sistema de gestión y notificación técnica
          </p>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="En Revision">En Revision</option>
                <option value="Recuperado">Recuperado</option>
                <option value="Detalle Incidentes">Detalle Incidentes</option>
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Prioridad</label>
                {formData.estado !== 'Detalle Incidentes' && (
                  <button
                    type="button"
                    onClick={() => setCalculadora(prev => ({ ...prev, mostrar: !prev.mostrar }))}
                    style={{ fontSize: '12px', color: '#0066B2', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {calculadora.mostrar ? 'Ocultar calculadora' : 'Calcular prioridad'}
                  </button>
                )}
              </div>
              <select
                value={formData.prioridad}
                onChange={(e) => handleChange('prioridad', e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Empresa</label>
              <select
                value={formData.empresa}
                onChange={(e) => handleChange('empresa', e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="Diners Club">Diners Club</option>
                <option value="Interdin">Interdin</option>
              </select>
            </div>
          </div>

          {calculadora.mostrar && formData.estado !== 'Detalle Incidentes' && (
            <div style={{ border: '1px solid #b3d1ff', backgroundColor: '#e6f0ff', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#0066B2', textAlign: 'center' }}>
                Calculadora de Prioridad - Puntaje: {calculadora.afectacion + calculadora.impactoUsuarios + calculadora.urgencia + calculadora.horario} - Prioridad: {formData.prioridad}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div style={{ border: '1px solid #b3d1ff', padding: '10px', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#0066B2', marginBottom: '10px', textAlign: 'center', fontSize: '14px' }}>
                    Afectación
                  </h4>
                  {[
                    { label: 'Indisponibilidad Total (3)', value: 3 },
                    { label: 'Indisponibilidad Parcial (2)', value: 2 },
                    { label: 'Delay (1)', value: 1 },
                    { label: 'Ninguna (0)', value: 0 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name="afectacion"
                        checked={calculadora.afectacion === opcion.value}
                        onChange={() => updatePrioridad('afectacion', opcion.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <label style={{ fontSize: '12px' }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>

                <div style={{ border: '1px solid #b3d1ff', padding: '10px', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#0066B2', marginBottom: '10px', textAlign: 'center', fontSize: '14px' }}>
                    Impacto
                  </h4>
                  {[
                    { label: 'Masivo (3)', value: 3 },
                    { label: 'Múltiple (2)', value: 2 },
                    { label: 'Puntual (1)', value: 1 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name="impactoUsuarios"
                        checked={calculadora.impactoUsuarios === opcion.value}
                        onChange={() => updatePrioridad('impactoUsuarios', opcion.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <label style={{ fontSize: '12px' }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>

                <div style={{ border: '1px solid #b3d1ff', padding: '10px', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#0066B2', marginBottom: '10px', textAlign: 'center', fontSize: '14px' }}>
                    Urgencia
                  </h4>
                  {[
                    { label: 'Crítica (4)', value: 4 },
                    { label: 'Alta (3)', value: 3 },
                    { label: 'Media (2)', value: 2 },
                    { label: 'Baja (1)', value: 1 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name="urgencia"
                        checked={calculadora.urgencia === opcion.value}
                        onChange={() => updatePrioridad('urgencia', opcion.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <label style={{ fontSize: '12px' }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>

                <div style={{ border: '1px solid #b3d1ff', padding: '10px', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#0066B2', marginBottom: '10px', textAlign: 'center', fontSize: '14px' }}>
                    Horario
                  </h4>
                  {[
                    { label: 'Alta Carga TX 08h00-23h00 (2)', value: 2 },
                    { label: 'Baja Carga TX 23h00-08h00 (1)', value: 1 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name="horario"
                        checked={calculadora.horario === opcion.value}
                        onChange={() => updatePrioridad('horario', opcion.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <label style={{ fontSize: '11px' }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder={formData.estado === 'Detalle Incidentes' ? 'TÍTULO COMPONENTE AFECTADO' : 'DESCRIPCIÓN BREVE DEL INCIDENTE'}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {formData.estado !== 'Detalle Incidentes' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Inicio</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => handleChange('fechaInicio', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Fin</label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => handleChange('fechaFin', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora Inicio</label>
                  <input
                    type="time"
                    step="1"
                    value={formData.horaInicio}
                    onChange={(e) => handleChange('horaInicio', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>Hora ecuatoriana (GMT-5) - Incluye segundos</span>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora Fin</label>
                  <input
                    type="time"
                    step="1"
                    value={formData.horaFin}
                    onChange={(e) => handleChange('horaFin', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>Hora ecuatoriana (GMT-5) - Incluye segundos</span>
                </div>
              </div>

              {formData.fechaInicio && formData.fechaFin && formData.horaInicio && formData.horaFin && (
                <div style={{ backgroundColor: '#e6f0ff', border: '1px solid #b3d1ff', padding: '10px', borderRadius: '4px', marginBottom: '15px', color: '#0066B2' }}>
                  <strong>Duración: {calcularDuracion()}</strong>
                  {formData.fechaInicio !== formData.fechaFin && (
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                      Incidente de múltiples días: {formData.fechaInicio} al {formData.fechaFin}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {formData.estado === 'En Revision' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Situación actual</label>
                <textarea
                  value={formData.situacionActual}
                  onChange={(e) => handleChange('situacionActual', e.target.value)}
                  placeholder="Detallar el estado en donde se encuentra la revisión (Relevante)."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Servicios afectados</label>
                <textarea
                  value={formData.serviciosAfectados}
                  onChange={(e) => handleChange('serviciosAfectados', e.target.value)}
                  placeholder="Se detalla los servicios que se encuentran impactados."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </>
          )}

          {formData.estado === 'Recuperado' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Acciones de recuperación</label>
                <textarea
                  value={formData.accionesRecuperacion}
                  onChange={(e) => handleChange('accionesRecuperacion', e.target.value)}
                  placeholder="Detallar la acción que permitió la recuperación del servicio."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Servicios afectados</label>
                <textarea
                  value={formData.serviciosAfectados}
                  onChange={(e) => handleChange('serviciosAfectados', e.target.value)}
                  placeholder="Se detalla los servicios que se encuentran impactados."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Causa raíz preliminar</label>
                <textarea
                  value={formData.causaRaiz}
                  onChange={(e) => handleChange('causaRaiz', e.target.value)}
                  placeholder="Detallar el motivo de la afectación al servicio."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </>
          )}

          {formData.estado === 'Detalle Incidentes' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Causa raíz</label>
                <textarea
                  value={formData.causaRaiz}
                  onChange={(e) => handleChange('causaRaiz', e.target.value)}
                  placeholder="Origen de la afectación al servicio."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Solución definitiva</label>
                <textarea
                  value={formData.solucionDefinitiva}
                  onChange={(e) => handleChange('solucionDefinitiva', e.target.value)}
                  placeholder="Detallar la acción ejecutada para su solución."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Responsable</label>
                <input
                  value={formData.responsable}
                  onChange={(e) => handleChange('responsable', e.target.value)}
                  placeholder="Nombre área interna / externa."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de ejecución</label>
                  <input
                    type="date"
                    value={formData.fechaEjecucion}
                    onChange={(e) => handleChange('fechaEjecucion', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora de ejecución</label>
                  <input
                    type="time"
                    step="1"
                    value={formData.horaEjecucion}
                    onChange={(e) => handleChange('horaEjecucion', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>Incluye segundos para mayor precisión</span>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            <button
              onClick={() => setShowForm(false)}
              style={{ flex: 1, padding: '12px 20px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Vista Previa del Comunicado
            </button>
            <button
              onClick={limpiar}
              style={{ padding: '12px 20px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
            >
              Limpiar Campos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderVistaPrevia = () => {
    switch (formData.estado) {
      case 'En Revision':
        return (
          <>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Inicio: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{formData.fechaInicio}, {formData.horaInicio}</span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Situación actual:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                {formData.situacionActual || 'Detallar el estado en donde se encuentra la revisión (Relevante).'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Servicios afectados:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                {formData.serviciosAfectados || 'Se detalla los servicios que se encuentran impactados.'}
              </span>
            </div>
          </>
        );

      case 'Recuperado':
        return (
          <>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Inicio: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{formData.fechaInicio}, {formData.horaInicio}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366', marginLeft: '20px' }}>Fin: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{formData.fechaFin}, {formData.horaFin}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366', marginLeft: '20px' }}>Duración: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{calcularDuracion() || 'N/A'}</span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Acciones de recuperación:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333', whiteSpace: 'pre-wrap' }}>
                {formData.accionesRecuperacion || 'Detallar la acción que permitió la recuperación del servicio.'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Servicios afectados:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                {formData.serviciosAfectados || 'Se detalla los servicios que se encuentran impactados.'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Causa raíz preliminar:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                {formData.causaRaiz || 'Detallar el motivo de la afectación al servicio, en el caso de que se deba indagar más en la causa se colocará "Continúa la revisión para determinar la causa raíz"'}
              </span>
            </div>
          </>
        );

      case 'Detalle Incidentes':
        return (
          <>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Inicio: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{formData.fechaInicio}, {formData.horaInicio}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366', marginLeft: '20px' }}>Fin: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{formData.fechaFin}, {formData.horaFin}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366', marginLeft: '20px' }}>Duración: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{calcularDuracion() || 'N/A'}</span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Causa raíz:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                {formData.causaRaiz || 'Origen de la afectación al servicio.'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Solución definitiva:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                <strong>1.</strong> {formData.solucionDefinitiva || 'Detallar la acción ejecutada para su solución.'}
              </span>
              <br />
              <span style={{ fontSize: '16px', color: '#333', marginTop: '10px', display: 'block' }}>
                <strong>Responsable:</strong> {formData.responsable || 'Nombre área interna / externa.'}
              </span>
              <span style={{ fontSize: '16px', color: '#333', marginTop: '5px', display: 'block' }}>
                <strong>Ejecutado:</strong> {formData.fechaEjecucion || 'dd/mm/aaaa'}, {formData.horaEjecucion || 'hh:mm'}
              </span>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} data-communication="preview">
        <div style={{ backgroundColor: '#0066cc', color: 'white', padding: '15px 30px', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '600', letterSpacing: '1px', fontFamily: 'Arial, sans-serif' }}>
            GESTIÓN DE INCIDENTES
          </h1>
        </div>

        <div style={{ padding: '30px 40px', position: 'relative', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: '30px', right: '40px', display: 'flex', gap: '15px', zIndex: 10, alignItems: 'center' }}>
            {formData.estado !== 'Detalle Incidentes' && (
              <div style={{
                backgroundColor: '#ffffff',
                color: formData.estado === 'Recuperado' ? '#28a745' : formData.estado === 'En Revision' ? '#ff6b35' : '#333',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '15px',
                fontWeight: '600',
                border: `2px solid ${formData.estado === 'Recuperado' ? '#28a745' : formData.estado === 'En Revision' ? '#ff6b35' : '#e0e0e0'}`,
                display: 'inline-block',
                fontFamily: 'Arial, sans-serif',
                lineHeight: '1',
                whiteSpace: 'nowrap'
              }}>
                <span style={{ fontSize: '12px', verticalAlign: 'middle' }}>●</span>
                <span style={{ marginLeft: '6px', verticalAlign: 'middle' }}>{formData.estado}</span>
              </div>
            )}

            <div style={{
              backgroundColor: '#ffffff',
              color: '#0066cc',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '15px',
              fontWeight: '600',
              border: '2px solid #0066cc',
              display: 'inline-block',
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1',
              whiteSpace: 'nowrap'
            }}>
              Prioridad: {formData.prioridad}
            </div>
          </div>

          <div style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            flex: 1,
            paddingTop: '10px'
          }}>
            <div style={{ marginBottom: '20px', paddingRight: '300px', wordWrap: 'break-word', lineHeight: '1.4' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Descripción: </span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', textTransform: 'uppercase' }}>
                {formData.descripcion || (formData.estado === 'Detalle Incidentes' ? 'TÍTULO COMPONENTE AFECTADO' : 'DESCRIPCIÓN BREVE DEL INCIDENTE')}
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '25px'
            }}>
              {renderVistaPrevia()}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#0066cc',
          color: 'white',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '16px' }}>
              <strong>Email:</strong> monitoreot@dinersclub.com.ec
            </p>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '1px' }}>
            PRODUCCIÓN Y SERVICIOS
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '40px auto 0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: '12px 20px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
          >
            Volver al Editor
          </button>
          <button
            onClick={exportarPDF}
            style={{ padding: '12px 20px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default HerramientaIncidentes;
