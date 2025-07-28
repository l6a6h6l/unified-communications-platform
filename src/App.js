import React, { useState } from 'react';

// ===============================
// CONSTANTES Y CONFIGURACIÓN GLOBAL
// ===============================

const HERRAMIENTAS = {
  INCIDENTES: 'incidentes',
  COMUNICADOS: 'comunicados'
};

const EMPRESAS = {
  INTERDIN: 'INTERDIN S.A.',
  DINERS: 'DINERS CLUB DEL ECUADOR'
};

const IDIOMAS = {
  ES: 'es',
  EN: 'en'
};

// Sistema de traducciones para Herramienta 2
const TRADUCCIONES = {
  [IDIOMAS.ES]: {
    titulo: 'COMUNICADO OFICIAL',
    introText: (empresa) => `Se informa que ${empresa} realizará la siguiente actividad programada`,
    labels: {
      actividad: 'Actividad',
      fechaHora: 'Fecha y Hora\nEjecución',
      servicio: 'Servicio\nAfectado',
      periodo: 'Periodo de\nAfectación',
      inicio: 'Inicio',
      fin: 'Fin'
    },
    monitoreo: 'Se mantiene el monitoreo activo durante la actividad para asegurar el\nrestablecimiento del servicio.',
    contacto: 'Cualquier duda favor comunicarse con Monitoreo Tecnología',
    correo: '02-2981-300 Ext. 4297 o correo',
    formulario: {
      titulo: 'Generador de Comunicados Oficiales',
      datosDelComunicado: 'Datos del Comunicado',
      empresa: 'Empresa:',
      actividad: 'Actividad:',
      fechaHoraInicio: 'Fecha y Hora de Inicio:',
      fechaHoraFin: 'Fecha y Hora de Fin:',
      servicioAfectado: 'Servicio Afectado:',
      periodoAfectacion: 'Periodo de Afectación:',
      vistaPrevia: 'Vista previa:',
      generarComunicado: 'Generar Comunicado',
      limpiar: 'Limpiar',
      cargarEjemplo: '📝 Cargar Ejemplo',
      vistaPreviaComunicado: 'Vista Previa del Comunicado',
      copiar: '📋 Copiar Imagen',
      calculadoAutomaticamente: '⏱️ Calculado automáticamente (puede editarlo si lo desea)',
      infoTimezone: 'ℹ️ Todas las fechas y horas se mostrarán en formato GMT-5 (Ecuador)',
      completeCampos: 'Complete los campos y haga clic en "Generar Comunicado" para ver la vista previa',
      procesando: '⏳ Procesando...',
      traduciendo: '⏳ Traduciendo...',
      idiomaComunicado: '🌐 Idioma del comunicado:',
      placeholders: {
        actividad: 'Ej: Depuración semanal del Centro Autorizador (CAO)',
        servicioAfectado: 'Describa los servicios que se verán afectados...',
        periodoAfectacion: 'Se calcula automáticamente o ingrese manualmente'
      },
      alertas: {
        camposIncompletos: 'Por favor, complete todos los campos antes de generar el comunicado',
        fechaInvalida: 'La fecha y hora de fin debe ser posterior a la fecha y hora de inicio',
        copiaExitosa: '✅ ¡Imagen copiada!\n\nYa puedes pegarla con Ctrl+V (o Cmd+V en Mac) en WhatsApp, Email, Word, etc.',
        errorCopia: '⚠️ Error al copiar la imagen. Se está descargando en su lugar.',
        descargaExitosa: '✅ Imagen descargada\n\nLa imagen se ha descargado a tu carpeta de descargas.',
        errorGeneral: '❌ Ocurrió un error. Por favor, intente nuevamente.'
      }
    }
  },
  [IDIOMAS.EN]: {
    titulo: 'OFFICIAL STATEMENT',
    introText: (empresa) => `It is reported that ${empresa === EMPRESAS.INTERDIN ? 'INTERDIN S.A.' : 'DINERS CLUB OF ECUADOR'} will carry out the following scheduled activity`,
    labels: {
      actividad: 'Activity',
      fechaHora: 'Date and Time\nExecution',
      servicio: 'Affected\nService',
      periodo: 'Period of\nAffectation',
      inicio: 'Start',
      fin: 'End'
    },
    monitoreo: 'Active monitoring is maintained during the activity to ensure\nservice restoration.',
    contacto: 'For any questions please contact Technology Monitoring',
    correo: '02-2981-300 Ext. 4297 or email'
  }
};

// ===============================
// SERVICIOS COMPARTIDOS
// ===============================

class TraduccionService {
  static cache = new Map();
  
  static async traducir(texto, deIdioma, aIdioma) {
    const cacheKey = `${texto}_${deIdioma}_${aIdioma}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const resultado = this.traduccionFallback(texto, deIdioma, aIdioma);
      this.cache.set(cacheKey, resultado);
      return resultado;
    } catch (error) {
      console.error('Error al traducir:', error);
      return this.traduccionFallback(texto, deIdioma, aIdioma);
    }
  }
  
  static traduccionFallback(texto, deIdioma, aIdioma) {
    const traducciones = {
      'Depuración semanal del Centro Autorizador (CAO)': 'Weekly Authorization Center (CAO) Maintenance',
      'Consumos realizados en redes propias y ajenas mediante el uso de tarjetas de crédito/débito.': 'Transactions made in own and external networks using credit/debit cards.',
      'Durante la ventana, las transacciones serán procesadas por Standin': 'During the window, transactions will be processed by Standin'
    };
    
    const periodoMatch = texto.match(/(\d+)\s+(hora|horas|minuto|minutos)(?:\s+y\s+(\d+)\s+(minuto|minutos))?/);
    if (periodoMatch && aIdioma === 'en') {
      if (periodoMatch[3]) {
        const horas = periodoMatch[1];
        const minutos = periodoMatch[3];
        return `${horas} hour${horas > 1 ? 's' : ''} and ${minutos} minute${minutos > 1 ? 's' : ''}`;
      } else {
        const cantidad = periodoMatch[1];
        const unidad = periodoMatch[2];
        if (unidad.includes('hora')) {
          return `${cantidad} hour${cantidad > 1 ? 's' : ''}`;
        } else {
          return `${cantidad} minute${cantidad > 1 ? 's' : ''}`;
        }
      }
    }
    
    return traducciones[texto] || texto;
  }
}

class FormatoService {
  static formatearFecha(fecha, hora, idioma) {
    if (!fecha || !hora) return '';
    
    const fechaObj = new Date(fecha + 'T' + hora);
    
    if (idioma === IDIOMAS.EN) {
      const diasEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const mesesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      
      const diaSemana = diasEn[fechaObj.getDay()];
      const dia = fechaObj.getDate();
      const mes = mesesEn[fechaObj.getMonth()];
      const año = fechaObj.getFullYear();
      const horas = fechaObj.getHours();
      const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
      const ampm = horas >= 12 ? 'PM' : 'AM';
      const hora12 = horas % 12 || 12;
      
      return `${diaSemana}, ${mes} ${dia}, ${año} ${hora12.toString().padStart(2, '0')}:${minutos} ${ampm} (GMT-5)`;
    } else {
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      
      const diaSemana = dias[fechaObj.getDay()];
      const dia = fechaObj.getDate().toString().padStart(2, '0');
      const mes = meses[fechaObj.getMonth()];
      const año = fechaObj.getFullYear();
      const horas = fechaObj.getHours();
      const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
      const ampm = horas >= 12 ? 'PM' : 'AM';
      const hora12 = horas % 12 || 12;
      
      return `${diaSemana}, ${dia} de ${mes} de ${año} ${hora12.toString().padStart(2, '0')}:${minutos} ${ampm} (GMT-5)`;
    }
  }
  
  static calcularPeriodo(fechaInicio, horaInicio, fechaFin, horaFin) {
    if (!fechaInicio || !horaInicio || !fechaFin || !horaFin) return '';
    
    const inicio = new Date(fechaInicio + 'T' + horaInicio);
    const fin = new Date(fechaFin + 'T' + horaFin);
    const diferencia = fin - inicio;
    
    if (diferencia <= 0) return '';
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    let periodo = '';
    if (horas > 0) {
      periodo = horas + (horas === 1 ? ' hora' : ' horas');
      if (minutosRestantes > 0) {
        periodo += ' y ' + minutosRestantes + (minutosRestantes === 1 ? ' minuto' : ' minutos');
      }
    } else {
      periodo = minutos + (minutos === 1 ? ' minuto' : ' minutos');
    }
    
    return periodo;
  }
}

// ===============================
// COMPONENTE DE LOGIN UNIFICADO
// ===============================
function LoginComponent({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (usuario === "admin" && password === "1234") {
      onLogin();
    } else {
      alert("Credenciales incorrectas");
      setUsuario("");
      setPassword("");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1929 0%, #1e3a5f 30%, #2c4b73 60%, #1e3a5f 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "white"
    }}>
      <div style={{
        maxWidth: "420px",
        width: "100%",
        textAlign: "center"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "30px 25px",
          marginBottom: "40px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <h1 style={{
            color: "white",
            margin: "0 0 8px 0",
            fontSize: "32px",
            fontWeight: "700",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            letterSpacing: "0.5px"
          }}>
            Sistema de Herramientas
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.9)",
            margin: 0,
            fontSize: "16px",
            fontWeight: "300"
          }}>
            Diners Club International
          </p>
        </div>
        
        <div style={{marginBottom: "30px"}}>
          <label style={{
            display: "block", 
            marginBottom: "12px", 
            color: "white", 
            fontWeight: "600",
            fontSize: "16px",
            textAlign: "left",
            textShadow: "0 1px 2px rgba(0,0,0,0.3)"
          }}>
            Usuario
          </label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{
              width: "100%",
              padding: "18px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "10px",
              fontSize: "16px",
              boxSizing: "border-box",
              transition: "all 0.3s ease",
              outline: "none",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "white",
              backdropFilter: "blur(10px)"
            }}
            placeholder="Ingrese su usuario"
          />
        </div>
        
        <div style={{marginBottom: "40px"}}>
          <label style={{
            display: "block", 
            marginBottom: "12px", 
            color: "white", 
            fontWeight: "600",
            fontSize: "16px",
            textAlign: "left",
            textShadow: "0 1px 2px rgba(0,0,0,0.3)"
          }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "18px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "10px",
              fontSize: "16px",
              boxSizing: "border-box",
              transition: "all 0.3s ease",
              outline: "none",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "white",
              backdropFilter: "blur(10px)"
            }}
            placeholder="Ingrese su contraseña"
          />
        </div>
        
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.2)",
            color: "white",
            border: "2px solid rgba(255,255,255,0.4)",
            padding: "20px",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: "pointer",
            fontWeight: "700",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            marginBottom: "15px"
          }}
        >
          Iniciar Sesión
        </button>
        
        <button
          onClick={onLogin}
          style={{
            width: "100%",
            background: "rgba(40, 167, 69, 0.8)",
            color: "white",
            border: "2px solid rgba(40, 167, 69, 0.9)",
            padding: "15px",
            borderRadius: "10px",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
            letterSpacing: "0.5px"
          }}
        >
          🚀 Acceso Directo (Desarrollo)
        </button>
      </div>
    </div>
  );
}

// ===============================
// SELECTOR DE HERRAMIENTAS
// ===============================
function SelectorHerramientas({ onSelectTool, onLogout }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        maxWidth: "800px",
        width: "100%",
        textAlign: "center"
      }}>
        {/* Header */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          marginBottom: "40px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
          <h1 style={{
            color: "#1a3a52",
            margin: "0 0 12px 0",
            fontSize: "36px",
            fontWeight: "700"
          }}>
            Centro de Herramientas
          </h1>
          <p style={{
            color: "#666",
            margin: 0,
            fontSize: "18px",
            fontWeight: "300"
          }}>
            Seleccione la herramienta que desea utilizar
          </p>
        </div>

        {/* Grid de herramientas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          marginBottom: "40px"
        }}>
          {/* Herramienta 1: Incidentes */}
          <div
            onClick={() => onSelectTool(HERRAMIENTAS.INCIDENTES)}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              border: "3px solid transparent"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
              e.target.style.borderColor = "#dc3545";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
              e.target.style.borderColor = "transparent";
            }}
          >
            <div style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #dc3545, #c82333)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto"
            }}>
              <span style={{fontSize: "36px"}}>🚨</span>
            </div>
            <h3 style={{
              color: "#1a3a52",
              margin: "0 0 12px 0",
              fontSize: "24px",
              fontWeight: "600"
            }}>
              Gestión de Incidentes
            </h3>
            <p style={{
              color: "#666",
              margin: 0,
              fontSize: "16px",
              lineHeight: "1.5"
            }}>
              Crear comunicados de incidentes técnicos con calculadora de prioridad automática y sistema de estados
            </p>
            <div style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap"
            }}>
              <span style={{
                background: "#dc3545",
                color: "white",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px"
              }}>Prioridades P1-P4</span>
              <span style={{
                background: "#28a745",
                color: "white", 
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px"
              }}>Estados dinámicos</span>
              <span style={{
                background: "#007bff",
                color: "white",
                padding: "4px 8px", 
                borderRadius: "12px",
                fontSize: "12px"
              }}>Copia perfecta</span>
            </div>
          </div>

          {/* Herramienta 2: Comunicados */}
          <div
            onClick={() => onSelectTool(HERRAMIENTAS.COMUNICADOS)}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              border: "3px solid transparent"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
              e.target.style.borderColor = "#1976d2";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
              e.target.style.borderColor = "transparent";
            }}
          >
            <div style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #1976d2, #1565c0)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto"
            }}>
              <span style={{fontSize: "36px"}}>📋</span>
            </div>
            <h3 style={{
              color: "#1a3a52",
              margin: "0 0 12px 0",
              fontSize: "24px",
              fontWeight: "600"
            }}>
              Comunicados Oficiales
            </h3>
            <p style={{
              color: "#666",
              margin: 0,
              fontSize: "16px",
              lineHeight: "1.5"
            }}>
              Generar comunicados oficiales programados con traducción automática y formato profesional
            </p>
            <div style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap"
            }}>
              <span style={{
                background: "#1976d2",
                color: "white",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px"
              }}>ES/EN</span>
              <span style={{
                background: "#ff9800",
                color: "white",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px"
              }}>Auto-cálculos</span>
              <span style={{
                background: "#4caf50",
                color: "white",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px"
              }}>Diseño premium</span>
            </div>
          </div>
        </div>

        {/* Botón de logout */}
        <button
          onClick={onLogout}
          style={{
            background: "#6c757d",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#5a6268"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#6c757d"}
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

// ===============================
// HERRAMIENTA 1: GESTIÓN DE INCIDENTES
// ===============================
function HerramientaIncidentes({ onBack }) {
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    tipoNotificacion: "GESTIÓN INCIDENTE",
    estado: "En Revisión",
    prioridad: "P2",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    descripcion: "",
    impacto: "",
    resolucion: "",
    nota: "Describir la nota si aplica",
    empresa: "Diners Club",
    referencia: "MSG" + Math.random().toString(36).substring(2, 8) + "_" + Date.now().toString().slice(-8)
  });

  // Estados para el cálculo de prioridad
  const [mostrarCalculadoraPrioridad, setMostrarCalculadoraPrioridad] = useState(false);
  const [afectacion, setAfectacion] = useState(0);
  const [impactoUsuarios, setImpactoUsuarios] = useState(1);
  const [urgencia, setUrgencia] = useState(2);
  const [horario, setHorario] = useState(2);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleDateChange = (dateValue) => {
    try {
      const dateObj = new Date(dateValue);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      handleInputChange('fecha', `${day}/${month}/${year}`);
    } catch (e) {
      console.log("Error con la fecha");
    }
  };

  // Obtener color según estado
  const getColorEstado = () => {
    const colores = {
      'En Revisión': '#FFD700',
      'Avance': '#FFA07A', 
      'Recuperado': '#90EE90'
    };
    return colores[formData.estado] || '#FFD700';
  };

  // Calcular el puntaje de prioridad
  const calcularPuntajePrioridad = () => {
    return afectacion + impactoUsuarios + urgencia + horario;
  };

  // Actualizar la prioridad basada en el puntaje
  const actualizarPrioridad = (puntaje) => {
    let nuevaPrioridad;
    if (puntaje >= 12) {
      nuevaPrioridad = 'P1';
    } else if (puntaje >= 10 && puntaje <= 11) {
      nuevaPrioridad = 'P2';
    } else if (puntaje >= 5 && puntaje <= 9) {
      nuevaPrioridad = 'P3';
    } else {
      nuevaPrioridad = 'P4';
    }
    handleInputChange('prioridad', nuevaPrioridad);
  };

  // Manejar cambios en el cálculo de prioridad
  const handleAfectacionChange = (value) => {
    setAfectacion(value);
    const newPuntaje = value + impactoUsuarios + urgencia + horario;
    actualizarPrioridad(newPuntaje);
  };

  const handleImpactoChange = (value) => {
    setImpactoUsuarios(value);
    const newPuntaje = afectacion + value + urgencia + horario;
    actualizarPrioridad(newPuntaje);
  };

  const handleUrgenciaChange = (value) => {
    setUrgencia(value);
    const newPuntaje = afectacion + impactoUsuarios + value + horario;
    actualizarPrioridad(newPuntaje);
  };

  const handleHorarioChange = (value) => {
    setHorario(value);
    const newPuntaje = afectacion + impactoUsuarios + urgencia + value;
    actualizarPrioridad(newPuntaje);
  };
  
  const calcularDuracion = () => {
    if (!formData.horaInicio || !formData.horaFin) return "";
    
    try {
      const [horaI, minI] = formData.horaInicio.split(":").map(num => parseInt(num, 10));
      const [horaF, minF] = formData.horaFin.split(":").map(num => parseInt(num, 10));
      
      let diferenciaEnMinutos = (horaF * 60 + minF) - (horaI * 60 + minI);
      if (diferenciaEnMinutos < 0) diferenciaEnMinutos += 24 * 60;
      
      const horas = Math.floor(diferenciaEnMinutos / 60);
      const minutos = diferenciaEnMinutos % 60;
      
      return `${horas}h ${minutos}m`;
    } catch (error) {
      return "";
    }
  };

  const limpiarCampos = () => {
    setFormData({
      tipoNotificacion: "GESTIÓN INCIDENTE",
      estado: "En Revisión",
      prioridad: "P2",
      fecha: "",
      horaInicio: "",
      horaFin: "",
      descripcion: "",
      impacto: "",
      resolucion: "",
      nota: "Describir la nota si aplica",
      empresa: "Diners Club",
      referencia: "MSG" + Math.random().toString(36).substring(2, 8) + "_" + Date.now().toString().slice(-8)
    });
    
    setAfectacion(0);
    setImpactoUsuarios(1);
    setUrgencia(2);
    setHorario(2);
    setMostrarCalculadoraPrioridad(false);
  };

  const copyAsImage = async () => {
    try {
      let communicationElement = document.querySelector('[data-communication="preview"]');
      
      if (!communicationElement) {
        alert('❌ Error: No se encontró el comunicado para capturar.\nAsegúrate de estar en la vista previa.');
        return;
      }

      const originalText = 'Copiar como Imagen';
      const button = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.includes('Copiar como Imagen')
      );
      
      if (button) {
        button.textContent = '⏳ Procesando...';
        button.disabled = true;
      }

      const loadHtml2Canvas = async () => {
        if (window.html2canvas) {
          return window.html2canvas;
        }

        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.crossOrigin = 'anonymous';
          
          script.onload = () => {
            if (window.html2canvas) {
              resolve(window.html2canvas);
            } else {
              reject(new Error('La librería no se cargó correctamente'));
            }
          };
          
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      try {
        const html2canvas = await loadHtml2Canvas();
        
        let targetElement = communicationElement;
        let parent = communicationElement.parentElement;
        
        while (parent) {
          const parentRect = parent.getBoundingClientRect();
          const elemRect = communicationElement.getBoundingClientRect();
          
          if (parentRect.height >= elemRect.height && 
              parentRect.top <= elemRect.top && 
              parentRect.bottom >= elemRect.bottom) {
            targetElement = parent;
            console.log('Usando contenedor padre:', parent.tagName, parent.className);
            break;
          }
          parent = parent.parentElement;
          
          if (parent === document.body) break;
        }
        
        const originalStyles = {};
        
        const elementsToFix = [targetElement, communicationElement];
        elementsToFix.forEach((el, index) => {
          if (el) {
            originalStyles[index] = {
              height: el.style.height,
              maxHeight: el.style.maxHeight,
              minHeight: el.style.minHeight,
              overflow: el.style.overflow,
              overflowY: el.style.overflowY,
              position: el.style.position
            };
            
            el.style.height = 'auto';
            el.style.maxHeight = 'none';
            el.style.minHeight = 'auto';
            el.style.overflow = 'visible';
            el.style.overflowY = 'visible';
            if (el.style.position === 'absolute') {
              el.style.position = 'relative';
            }
          }
        });
        
        communicationElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const canvas = await html2canvas(targetElement, {
          backgroundColor: '#ffffff',
          scale: 1,
          useCORS: true,
          allowTaint: false,
          logging: true,
          removeContainer: false,
          imageTimeout: 0,
          scrollX: 0,
          scrollY: 0,
          foreignObjectRendering: true,
          svgRendering: true,
          ignoreElements: (element) => {
            return element.tagName === 'IFRAME' || 
                   element.tagName === 'SCRIPT' ||
                   element.style.visibility === 'hidden';
          }
        });

        elementsToFix.forEach((el, index) => {
          if (el && originalStyles[index]) {
            Object.keys(originalStyles[index]).forEach(prop => {
              el.style[prop] = originalStyles[index][prop];
            });
          }
        });

        if (!canvas) {
          throw new Error('No se pudo generar la imagen');
        }

        let finalCanvas = canvas;
        
        if (targetElement !== communicationElement) {
          const targetRect = targetElement.getBoundingClientRect();
          const commRect = communicationElement.getBoundingClientRect();
          
          const offsetX = commRect.left - targetRect.left;
          const offsetY = commRect.top - targetRect.top;
          
          const croppedCanvas = document.createElement('canvas');
          const croppedCtx = croppedCanvas.getContext('2d');
          
          croppedCanvas.width = commRect.width;
          croppedCanvas.height = commRect.height;
          
          croppedCtx.drawImage(
            canvas,
            offsetX, offsetY, commRect.width, commRect.height,
            0, 0, commRect.width, commRect.height
          );
          
          finalCanvas = croppedCanvas;
        }

        const blob = await new Promise((resolve, reject) => {
          finalCanvas.toBlob(
            (blob) => {
              if (blob && blob.size > 1000) {
                resolve(blob);
              } else {
                reject(new Error('Imagen generada está vacía'));
              }
            }, 
            'image/png', 
            0.95
          );
        });

        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('✅ ¡Comunicado copiado!\n\n📋 Imagen en tu portapapeles\n📧 Pégala en tu correo con Ctrl+V');
        } else {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
          link.download = `incidente_${formData.empresa.toLowerCase().replace(' ', '_')}_${timestamp}.png`;
          link.href = url;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          alert('📁 Imagen descargada\n\n💾 Revisa tu carpeta de descargas');
        }

      } catch (captureError) {
        console.error('Error en captura:', captureError);
        alert('❌ Error al capturar\n\n🔄 Intenta actualizar la página');
      }

    } catch (error) {
      console.error('Error completo:', error);
      alert('❌ Error técnico\n\n🔄 Intenta actualizar la página');
      
    } finally {
      if (button) {
        button.textContent = originalText;
        button.disabled = false;
      }
    }
  };
  
  if (showForm) {
    return (
      <div style={{maxWidth: "800px", margin: "0 auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", overflow: "hidden"}}>
        <div style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2c4b73 30%, #3d5a7a 70%, #4a6b85 100%)",
          color: "white", 
          padding: "20px 30px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(5px)"
          }}></div>
          <div style={{position: "relative", zIndex: 1, textAlign: "center"}}>
            <h1 style={{
              margin: 0, 
              fontSize: "32px", 
              fontWeight: "600",
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              letterSpacing: "0.5px"
            }}>
              Crear Comunicado de {formData.tipoNotificacion.includes("INCIDENTE") ? "Incidente" : "Evento"}
            </h1>
            <p style={{
              margin: "8px 0 0 0",
              fontSize: "14px",
              opacity: 0.9,
              fontWeight: "300"
            }}>
              Sistema de gestión y notificación técnica
            </p>
          </div>
        </div>

        <div style={{padding: "20px"}}>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px", marginBottom: "15px"}}>
            <div>
              <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px"}}>
                Estado
              </label>
              <select 
                value={formData.estado}
                onChange={(e) => handleInputChange("estado", e.target.value)}
                style={{width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px"}}
              >
                <option value="En Revisión">En Revisión</option>
                <option value="Avance">Avance</option>
                <option value="Recuperado">Recuperado</option>
              </select>
            </div>
            
            <div>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px"}}>
                <label style={{display: "block", fontWeight: "bold", fontSize: "14px"}}>
                  Prioridad
                </label>
                <button 
                  type="button"
                  onClick={() => setMostrarCalculadoraPrioridad(!mostrarCalculadoraPrioridad)}
                  style={{fontSize: "12px", color: "#0066B2", backgroundColor: "transparent", border: "none", cursor: "pointer", textDecoration: "underline"}}
                >
                  {mostrarCalculadoraPrioridad ? 'Ocultar calculadora' : 'Calcular prioridad'}
                </button>
              </div>
              <select 
                value={formData.prioridad}
                onChange={(e) => handleInputChange("prioridad", e.target.value)}
                style={{width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px"}}
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
              </select>
            </div>
            
            <div>
              <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px"}}>
                Tipo de Notificación
              </label>
              <select 
                value={formData.tipoNotificacion}
                onChange={(e) => handleInputChange("tipoNotificacion", e.target.value)}
                style={{width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px"}}
              >
                <option value="GESTIÓN INCIDENTE">GESTIÓN INCIDENTE</option>
                <option value="GESTIÓN EVENTO">GESTIÓN EVENTO</option>
              </select>
            </div>

            <div>
              <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px"}}>
                Empresa
              </label>
              <select 
                value={formData.empresa}
                onChange={(e) => handleInputChange("empresa", e.target.value)}
                style={{width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px"}}
              >
                <option value="Diners Club">Diners Club</option>
                <option value="Interdin">Interdin</option>
              </select>
            </div>
          </div>
          
          {mostrarCalculadoraPrioridad && (
            <div style={{border: "1px solid #b3d1ff", backgroundColor: "#e6f0ff", borderRadius: "8px", padding: "15px", marginBottom: "15px"}}>
              <h3 style={{fontSize: "18px", fontWeight: "bold", marginBottom: "10px", color: "#0066B2", textAlign: "center"}}>Calculadora de Prioridad</h3>
              <p style={{textAlign: "center", marginBottom: "10px"}}>
                Puntaje actual: <span style={{fontWeight: "bold"}}>{calcularPuntajePrioridad()}</span> - Prioridad: <span style={{fontWeight: "bold", color: "#e74c3c"}}>{formData.prioridad}</span>
              </p>
              
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px", marginBottom: "15px"}}>
                <div style={{border: "1px solid #b3d1ff", padding: "10px", borderRadius: "8px", backgroundColor: "#f0f8ff"}}>
                  <h4 style={{fontWeight: "bold", color: "#0066B2", marginBottom: "10px", textAlign: "center", fontSize: "14px"}}>Afectación</h4>
                  {[
                    {label: 'Indisponibilidad Total (3)', value: 3},
                    {label: 'Indisponibilidad Parcial (2)', value: 2},
                    {label: 'Delay (1)', value: 1},
                    {label: 'Ninguna (0)', value: 0}
                  ].map((item, idx) => (
                    <div key={idx} style={{display: "flex", alignItems: "center", marginBottom: "8px"}}>
                      <input
                        type="radio"
                        name="afectacion"
                        checked={afectacion === item.value}
                        onChange={() => handleAfectacionChange(item.value)}
                        style={{marginRight: "8px"}}
                      />
                      <label style={{fontSize: "12px"}}>{item.label}</label>
                    </div>
                  ))}
                </div>
                
                <div style={{border: "1px solid #b3d1ff", padding: "10px", borderRadius: "8px", backgroundColor: "#f0f8ff"}}>
                  <h4 style={{fontWeight: "bold", color: "#0066B2", marginBottom: "10px", textAlign: "center", fontSize: "14px"}}>Impacto</h4>
                  {[
                    {label: 'Masivo (3)', value: 3},
                    {label: 'Múltiple (2)', value: 2},
                    {label: 'Puntual (1)', value: 1}
                  ].map((item, idx) => (
                    <div key={idx} style={{display: "flex", alignItems: "center", marginBottom: "8px"}}>
                      <input
                        type="radio"
                        name="impactoUsuarios"
                        checked={impactoUsuarios === item.value}
                        onChange={() => handleImpactoChange(item.value)}
                        style={{marginRight: "8px"}}
                      />
                      <label style={{fontSize: "12px"}}>{item.label}</label>
                    </div>
                  ))}
                </div>
                
                <div style={{border: "1px solid #b3d1ff", padding: "10px", borderRadius: "8px", backgroundColor: "#f0f8ff"}}>
                  <h4 style={{fontWeight: "bold", color: "#0066B2", marginBottom: "10px", textAlign: "center", fontSize: "14px"}}>Urgencia</h4>
                  {[
                    {label: 'Crítica (4)', value: 4},
                    {label: 'Alta (3)', value: 3},
                    {label: 'Media (2)', value: 2},
                    {label: 'Baja (1)', value: 1}
                  ].map((item, idx) => (
                    <div key={idx} style={{display: "flex", alignItems: "center", marginBottom: "8px"}}>
                      <input
                        type="radio"
                        name="urgencia"
                        checked={urgencia === item.value}
                        onChange={() => handleUrgenciaChange(item.value)}
                        style={{marginRight: "8px"}}
                      />
                      <label style={{fontSize: "12px"}}>{item.label}</label>
                    </div>
                  ))}
                </div>
                
                <div style={{border: "1px solid #b3d1ff", padding: "10px", borderRadius: "8px", backgroundColor: "#f0f8ff"}}>
                  <h4 style={{fontWeight: "bold", color: "#0066B2", marginBottom: "10px", textAlign: "center", fontSize: "14px"}}>Horario</h4>
                  {[
                    {label: 'Alta Carga TX 08h00-23h00 (2)', value: 2},
                    {label: 'Baja Carga TX 23h00-08h00 (1)', value: 1}
                  ].map((item, idx) => (
                    <div key={idx} style={{display: "flex", alignItems: "center", marginBottom: "8px"}}>
                      <input
                        type="radio"
                        name="horario"
                        checked={horario === item.value}
                        onChange={() => handleHorarioChange(item.value)}
                        style={{marginRight: "8px"}}
                      />
                      <label style={{fontSize: "11px"}}>{item.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{borderTop: "1px solid #b3d1ff", paddingTop: "10px", backgroundColor: "white", padding: "10px", borderRadius: "8px"}}>
                <p style={{fontSize: "14px", marginBottom: "10px", textAlign: "center", fontWeight: "bold"}}>Criterios de prioridad:</p>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px"}}>
                  {[
                    {bg: '#ffebeb', titulo: 'P1 (≥12)', nivel: 'Alta', tiempo: '5 minutos'},
                    {bg: '#fff3e0', titulo: 'P2 (10-11)', nivel: 'Media', tiempo: '10 minutos'},
                    {bg: '#fffbf0', titulo: 'P3 (5-9)', nivel: 'Baja', tiempo: '15 minutos'},
                    {bg: '#f0f8e8', titulo: 'P4 (≤4)', nivel: 'Muy Baja', tiempo: '20 minutos'}
                  ].map((criterio, idx) => (
                    <div key={idx} style={{backgroundColor: criterio.bg, padding: "8px", borderRadius: "4px", textAlign: "center"}}>
                      <p style={{fontSize: "12px", margin: 0, fontWeight: "bold"}}>{criterio.titulo}</p>
                      <p style={{fontSize: "11px", margin: 0}}>{criterio.nivel}</p>
                      <p style={{fontSize: "11px", margin: 0}}>Atención en {criterio.tiempo}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px"}}>
            <div>
              <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px"}}>
                Fecha (DD/MM/YYYY)
              </label>
              <input 
                type="date"
                onChange={(e) => handleDateChange(e.target.value)}
                style={{width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px"}}
              />
            </div>
            
            <div>
              <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px"}}>
                Hora Inicio (HH:MM)
              </label>
              <input 
                type="time"
                onChange={(e) => handleInputChange("horaInicio", e.target.value)}
                style={{width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px"}}
              />
              <span style={{fontSize: "12px", color: "#666"}}>Hora ecuatoriana (GMT-5)</span>
            </div>
            
            <div>
              <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px"}}>
                Hora Fin (HH:MM)
              </label>
              <input 
                type="time"
                onChange={(e) => handleInputChange("horaFin", e.target.value)}
                style={{width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px"}}
              />
            </div>
          </div>
          
          {formData.horaInicio && formData.horaFin && (
            <div style={{backgroundColor: "#e6f0ff", border: "1px solid #b3d1ff", padding: "10px", borderRadius: "4px", marginBottom: "15px", color: "#0066B2"}}>
              <span style={{fontWeight: "bold"}}>Duración estimada: </span>
              {calcularDuracion()}
            </div>
          )}
          
          <div style={{marginBottom: "15px"}}>
            <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px"}}>
              Descripción del Problema
            </label>
            <textarea 
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              placeholder="Aquí describir brevemente el incidente o evento técnico incluyendo detalles relevantes"
              style={{
                width: "100%", 
                padding: "8px", 
                border: "1px solid #ccc", 
                borderRadius: "4px", 
                fontSize: "14px", 
                minHeight: "80px",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: "1.5"
              }}
              rows={4}
            />
          </div>
          
          <div style={{marginBottom: "15px"}}>
            <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px"}}>
              Impacto
            </label>
            <textarea 
              value={formData.impacto}
              onChange={(e) => handleInputChange("impacto", e.target.value)}
              placeholder="Detallar las consecuencias para los usuarios/clientes y posibles plazos de resolución"
              style={{
                width: "100%", 
                padding: "8px", 
                border: "1px solid #ccc", 
                borderRadius: "4px", 
                fontSize: "14px", 
                minHeight: "80px",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: "1.5"
              }}
              rows={4}
            />
          </div>
          
          <div style={{marginBottom: "15px"}}>
            <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px"}}>
              Resolución
            </label>
            <textarea 
              value={formData.resolucion}
              onChange={(e) => handleInputChange("resolucion", e.target.value)}
              placeholder="Explicar las acciones tomadas para resolver el problema y su estado actual"
              style={{
                width: "100%", 
                padding: "8px", 
                border: "1px solid #ccc", 
                borderRadius: "4px", 
                fontSize: "14px", 
                minHeight: "80px",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: "1.5"
              }}
              rows={4}
            />
          </div>
          
          <div style={{marginBottom: "15px"}}>
            <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px"}}>
              Texto de Nota
            </label>
            <textarea 
              value={formData.nota}
              onChange={(e) => handleInputChange("nota", e.target.value)}
              placeholder="Describir la nota si aplica - información adicional relevante"
              style={{
                width: "100%", 
                padding: "8px", 
                border: "1px solid #ccc", 
                borderRadius: "4px", 
                fontSize: "14px", 
                minHeight: "80px",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: "1.5"
              }}
              rows={4}
            />
          </div>
          
          <div style={{display: "flex", gap: "15px", marginTop: "15px"}}>
            <button 
              onClick={() => setShowForm(false)}
              style={{backgroundColor: "#0066B2", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "16px"}}
            >
              Vista Previa del Comunicado
            </button>
            
            <button 
              onClick={limpiarCampos}
              style={{backgroundColor: "#6c757d", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", fontSize: "16px"}}
            >
              Limpiar Campos
            </button>
            
            <button
              onClick={onBack}
              style={{backgroundColor: "#dc3545", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", fontSize: "16px"}}
            >
              ← Volver al Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista previa
  const duracion = calcularDuracion();
  let problemaTexto = formData.descripcion || "No se ha proporcionado información del problema";
  
  if (formData.fecha && formData.horaInicio && formData.horaFin) {
    problemaTexto = `Desde ${formData.horaInicio} hasta ${formData.horaFin}`;
    if (duracion) problemaTexto += ` (${duracion})`;
    problemaTexto += ` el ${formData.fecha}, ${formData.descripcion}`;
  }

  return (
    <div>
      <div style={{maxWidth: "800px", margin: "0 auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", overflow: "hidden"}} data-communication="preview">
        <div style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2c4b73 30%, #3d5a7a 70%, #4a6b85 100%)",
          color: "white", 
          padding: "20px 30px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(5px)"
          }}></div>
          <div style={{position: "relative", zIndex: 1, textAlign: "center"}}>
            <h1 style={{
              margin: 0, 
              fontSize: "36px", 
              fontWeight: "700",
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              letterSpacing: "0.5px"
            }}>
              {formData.tipoNotificacion}
            </h1>
          </div>
        </div>
        
        <div style={{padding: "20px"}}>
          <div style={{border: "1px solid #ccc", padding: "20px", marginBottom: "15px", position: "relative"}}>
            <div style={{position: "absolute", top: "20px", right: "20px", display: "flex", gap: "15px"}}>
              <svg width="110" height="40" style={{borderRadius: "12px", overflow: "visible"}}>
                <rect x="0" y="0" width="110" height="40" rx="12" ry="12" 
                      fill="#f8f9fa" stroke="#6c757d" strokeWidth="2"/>
                <circle cx="20" cy="20" r="8" fill={getColorEstado()}/>
                <text x="36" y="25" fontSize="14" fontWeight="600" fill="#495057" fontFamily="system-ui, -apple-system, sans-serif">
                  {formData.estado === "En Revisión" ? "Revisión" : formData.estado}
                </text>
              </svg>
              
              <svg width="110" height="40" style={{borderRadius: "12px", overflow: "visible"}}>
                <rect x="0" y="0" width="110" height="40" rx="12" ry="12" 
                      fill="#f0f8ff" stroke="#0066B2" strokeWidth="2"/>
                <text x="20" y="26" fontSize="16" fontWeight="700" fill="#0066B2" fontFamily="system-ui, -apple-system, sans-serif">
                  {formData.prioridad}
                </text>
                <text x="46" y="25" fontSize="14" fontWeight="600" fill="#0066B2" fontFamily="system-ui, -apple-system, sans-serif">
                  Prioridad
                </text>
              </svg>
            </div>
            
            <div style={{marginRight: "260px"}}>
              <h2 style={{color: "#0066B2", fontSize: "16px", marginBottom: "5px", fontWeight: "bold"}}>Descripción</h2>
              <p style={{fontSize: "14px", lineHeight: "1.5", margin: "0 0 15px 0", whiteSpace: "pre-wrap"}}>{problemaTexto}</p>
              
              <h2 style={{color: "#0066B2", fontSize: "16px", marginBottom: "5px", fontWeight: "bold"}}>Impacto</h2>
              <p style={{fontSize: "14px", lineHeight: "1.5", margin: "0 0 15px 0", whiteSpace: "pre-wrap"}}>{formData.impacto || "No se ha proporcionado información sobre el impacto"}</p>
              
              <h2 style={{color: "#0066B2", fontSize: "16px", marginBottom: "5px", fontWeight: "bold"}}>Resolución</h2>
              <p style={{fontSize: "14px", lineHeight: "1.5", margin: "0 0 15px 0", whiteSpace: "pre-wrap"}}>{formData.resolucion || "No se ha proporcionado información sobre la resolución"}</p>
              
              <h2 style={{color: "#0066B2", fontSize: "16px", marginBottom: "5px", fontWeight: "bold"}}>Nota</h2>
              <p style={{fontSize: "14px", lineHeight: "1.5", margin: "0", whiteSpace: "pre-wrap"}}>
                {formData.nota}
              </p>
            </div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, #4a6b85 0%, #3d5a7a 30%, #2c4b73 70%, #1e3a5f 100%)",
            color: "white", 
            padding: "30px",
            textAlign: "center",
            boxShadow: "0 -4px 15px rgba(0,0,0,0.2)",
            margin: "0 -20px -20px -20px"
          }}>
            <h2 style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "400",
              letterSpacing: "2px",
              fontFamily: "serif",
              textShadow: "0 2px 8px rgba(0,0,0,0.4)"
            }}>
              {formData.empresa}
            </h2>
          </div>
        </div>
      </div>
      
      <div style={{maxWidth: "800px", margin: "40px auto 0 auto", textAlign: "center"}}>
        <div style={{display: "flex", gap: "15px", justifyContent: "center"}}>
          <button 
            onClick={() => setShowForm(true)}
            style={{backgroundColor: "#666", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer"}}
          >
            Volver al Editor
          </button>
          
          <button 
            onClick={copyAsImage}
            style={{backgroundColor: "#1e3a5f", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer"}}
          >
            Copiar como Imagen
          </button>
          
          <button
            onClick={onBack}
            style={{backgroundColor: "#dc3545", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer"}}
          >
            ← Volver al Menú
          </button>
        </div>
      </div>
    </div>
  );
}

// ===============================
// HERRAMIENTA 2: COMUNICADOS OFICIALES
// ===============================

// Componente Logo Diners
const LogoDiners = () => (
  <div style={{ 
    display: 'block',
    backgroundColor: '#ffffff',
    padding: '10px 18px',
    verticalAlign: 'middle'
  }}>
    <span style={{
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      fontSize: '20px',
      color: '#0066B3',
      letterSpacing: '1px'
    }}>
      DINERS
    </span>
    <span style={{
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      fontSize: '18px',
      color: '#0066B3',
      marginLeft: '6px'
    }}>
      CLUB
    </span>
  </div>
);

// Componente Logo INTERDIN
const LogoInterdin = () => (
  <div style={{ 
    display: 'block',
    backgroundColor: '#ffffff',
    padding: '10px 18px',
    verticalAlign: 'middle'
  }}>
    <span style={{ 
      color: '#1a3a52',
      fontWeight: 'bold',
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      letterSpacing: '1px'
    }}>
      INTER
    </span>
    <span style={{ 
      backgroundColor: '#e60000',
      color: '#ffffff',
      padding: '4px 10px',
      fontSize: '20px',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
      marginLeft: '3px',
      letterSpacing: '1px'
    }}>
      DIN
    </span>
  </div>
);

// Componente Selector de Idioma
const SelectorIdioma = ({ idioma, onChange, cargando }) => {
  const textos = TRADUCCIONES[IDIOMAS.ES].formulario;
  
  return (
    <div style={{
      marginBottom: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#e8f4f8',
      padding: '10px 15px',
      borderRadius: '4px',
      border: '1px solid #b3e0f2'
    }}>
      <span style={{
        fontSize: '14px',
        color: '#0d47a1',
        fontWeight: '500'
      }}>
        {textos.idiomaComunicado}
      </span>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <select
          value={idioma}
          onChange={(e) => onChange(e.target.value)}
          disabled={cargando}
          style={{
            padding: '6px 12px',
            fontSize: '14px',
            border: '1px solid #1976d2',
            borderRadius: '4px',
            cursor: cargando ? 'wait' : 'pointer',
            backgroundColor: 'white',
            color: '#1976d2',
            fontWeight: '500'
          }}
        >
          <option value={IDIOMAS.ES}>🇪🇨 Español</option>
          <option value={IDIOMAS.EN}>🇺🇸 English</option>
        </select>
        {cargando && (
          <span style={{
            fontSize: '12px',
            color: '#1976d2'
          }}>{textos.traduciendo}</span>
        )}
      </div>
    </div>
  );
};

// Componente Vista Previa del Comunicado
const VistaPreviaComunicado = ({ datos }) => {
  const [idioma, setIdioma] = React.useState(IDIOMAS.ES);
  const [textoTraducido, setTextoTraducido] = React.useState(null);
  const [cargandoTraduccion, setCargandoTraduccion] = React.useState(false);
  
  const cambiarIdioma = async (nuevoIdioma) => {
    if (nuevoIdioma === idioma) return;
    
    setCargandoTraduccion(true);
    
    if (nuevoIdioma === IDIOMAS.EN) {
      try {
        const [actividad, servicioAfectado, periodoAfectacion] = await Promise.all([
          TraduccionService.traducir(datos.actividad, IDIOMAS.ES, IDIOMAS.EN),
          TraduccionService.traducir(datos.servicioAfectado, IDIOMAS.ES, IDIOMAS.EN),
          TraduccionService.traducir(datos.periodoAfectacion, IDIOMAS.ES, IDIOMAS.EN)
        ]);
        
        setTextoTraducido({ actividad, servicioAfectado, periodoAfectacion });
      } catch (error) {
        console.error('Error en traducción:', error);
      }
    } else {
      setTextoTraducido(null);
    }
    
    setIdioma(nuevoIdioma);
    setCargandoTraduccion(false);
  };
  
  const obtenerTextos = () => {
    const traducciones = TRADUCCIONES[idioma];
    const fechaInicioFormateada = FormatoService.formatearFecha(
      datos.fechaInicioDate, 
      datos.horaInicio, 
      idioma
    );
    const fechaFinFormateada = FormatoService.formatearFecha(
      datos.fechaFinDate, 
      datos.horaFin, 
      idioma
    );
    
    if (idioma === IDIOMAS.ES || !textoTraducido) {
      return {
        ...traducciones,
        empresa: datos.empresa,
        introText: traducciones.introText(datos.empresa),
        actividad: datos.actividad,
        servicioAfectado: datos.servicioAfectado,
        periodoAfectacion: datos.periodoAfectacion,
        fechaInicio: fechaInicioFormateada,
        fechaFin: fechaFinFormateada
      };
    }
    
    return {
      ...traducciones,
      empresa: datos.empresa === EMPRESAS.INTERDIN ? 'INTERDIN S.A.' : 'DINERS CLUB OF ECUADOR',
      introText: traducciones.introText(datos.empresa),
      actividad: textoTraducido.actividad,
      servicioAfectado: textoTraducido.servicioAfectado,
      periodoAfectacion: textoTraducido.periodoAfectacion,
      fechaInicio: fechaInicioFormateada,
      fechaFin: fechaFinFormateada
    };
  };
  
  const textos = obtenerTextos();
  
  return (
    <div>
      <SelectorIdioma 
        idioma={idioma}
        onChange={cambiarIdioma}
        cargando={cargandoTraduccion}
      />
      
      <div id="vista-comunicado-inner" style={{ 
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '900px',
        margin: '0 auto'
      }}>
        {/* Header simplificado */}
        <div style={{ 
          backgroundColor: '#1a3a52',
          padding: '50px 80px',
          color: 'white'
        }}>
          <div style={{ borderTop: '2px solid white', borderBottom: '2px solid white', padding: '40px 0' }}>
            <div style={{ display: 'table', width: '100%' }}>
              <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
                <h1 style={{ 
                  fontSize: '38px',
                  fontWeight: '700',
                  letterSpacing: '2.5px',
                  fontFamily: 'Arial, sans-serif',
                  margin: '0'
                }}>{textos.titulo}</h1>
                <h2 style={{ 
                  fontSize: '26px',
                  fontWeight: '400',
                  letterSpacing: '2px',
                  fontFamily: 'Arial, sans-serif',
                  margin: '10px 0 0 0'
                }}>{textos.empresa}</h2>
              </div>
              <div style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'right', width: '200px' }}>
                <div style={{ 
                  backgroundColor: 'white',
                  display: 'inline-block',
                  padding: '15px 25px',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  {datos.empresa === EMPRESAS.INTERDIN ? <LogoInterdin /> : <LogoDiners />}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenido */}
        <div style={{ padding: '50px 80px' }}>
          <p style={{ fontSize: '18px', marginBottom: '40px', fontFamily: 'Arial, sans-serif' }}>
            {textos.introText}
          </p>
          
          {/* Campos */}
          <div style={{ marginBottom: '40px' }}>
            {/* Actividad */}
            <div style={{ display: 'table', width: '100%', marginBottom: '12px', border: '1px solid #ddd' }}>
              <div style={{ display: 'table-cell', backgroundColor: '#1976d2', color: 'white', padding: '24px', fontSize: '20px', fontWeight: 'bold', width: '320px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
                {textos.labels.actividad}
              </div>
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: '#f9f9f9', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
                {textos.actividad}
              </div>
            </div>
            
            {/* Fecha y Hora */}
            <div style={{ display: 'table', width: '100%', marginBottom: '12px', border: '1px solid #ddd' }}>
              <div style={{ display: 'table-cell', backgroundColor: '#1976d2', color: 'white', padding: '24px', fontSize: '20px', fontWeight: 'bold', width: '320px', textAlign: 'center', fontFamily: 'Arial, sans-serif', verticalAlign: 'middle' }}>
                <div>{textos.labels.fechaHora.split('\n')[0]}</div>
                <div>{textos.labels.fechaHora.split('\n')[1]}</div>
              </div>
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: 'white', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>{textos.labels.inicio}:</strong> {textos.fechaInicio}
                </div>
                <div>
                  <strong>{textos.labels.fin}:</strong> {textos.fechaFin}
                </div>
              </div>
            </div>
            
            {/* Servicio Afectado */}
            <div style={{ display: 'table', width: '100%', marginBottom: '12px', border: '1px solid #ddd' }}>
              <div style={{ display: 'table-cell', backgroundColor: '#1976d2', color: 'white', padding: '24px', fontSize: '20px', fontWeight: 'bold', width: '320px', textAlign: 'center', fontFamily: 'Arial, sans-serif', verticalAlign: 'middle' }}>
                <div>{textos.labels.servicio.split('\n')[0]}</div>
                <div>{textos.labels.servicio.split('\n')[1]}</div>
              </div>
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: '#f9f9f9', fontSize: '18px', fontFamily: 'Arial, sans-serif', whiteSpace: 'pre-wrap' }}>
                {textos.servicioAfectado}
              </div>
            </div>
            
            {/* Periodo */}
            <div style={{ display: 'table', width: '100%', border: '1px solid #ddd' }}>
              <div style={{ display: 'table-cell', backgroundColor: '#1976d2', color: 'white', padding: '24px', fontSize: '20px', fontWeight: 'bold', width: '320px', textAlign: 'center', fontFamily: 'Arial, sans-serif', verticalAlign: 'middle' }}>
                <div>{textos.labels.periodo.split('\n')[0]}</div>
                <div>{textos.labels.periodo.split('\n')[1]}</div>
              </div>
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: 'white', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
                {textos.periodoAfectacion}
              </div>
            </div>
          </div>
          
          <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '40px', fontFamily: 'Arial, sans-serif' }}>
            {textos.monitoreo.split('\n')[0]}<br/>
            {textos.monitoreo.split('\n')[1]}
          </p>
          
          <div style={{ backgroundColor: '#f0f0f0', padding: '24px', borderRadius: '10px', textAlign: 'center', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
            <strong>{textos.contacto}</strong><br/>
            {textos.correo} <a href="mailto:monitoreot@dinersclub.com.ec" style={{ color: '#1976d2' }}>
              monitoreot@dinersclub.com.ec
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

function HerramientaComunicados({ onBack }) {
  const [formData, setFormData] = React.useState({
    empresa: EMPRESAS.INTERDIN,
    actividad: '',
    fechaInicioDate: '',
    horaInicio: '',
    fechaFinDate: '',
    horaFin: '',
    servicioAfectado: '',
    periodoAfectacion: ''
  });
  const [mostrarVista, setMostrarVista] = React.useState(false);
  const [copiando, setCopiando] = React.useState(false);
  
  const textos = TRADUCCIONES[IDIOMAS.ES].formulario;
  
  // Auto-calcular periodo
  React.useEffect(() => {
    const periodo = FormatoService.calcularPeriodo(
      formData.fechaInicioDate,
      formData.horaInicio,
      formData.fechaFinDate,
      formData.horaFin
    );
    
    if (periodo) {
      setFormData(prev => ({ ...prev, periodoAfectacion: periodo }));
    }
  }, [formData.fechaInicioDate, formData.horaInicio, formData.fechaFinDate, formData.horaFin]);
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const validarFormulario = () => {
    const camposRequeridos = [
      'actividad', 'fechaInicioDate', 'horaInicio', 
      'fechaFinDate', 'horaFin', 'servicioAfectado', 'periodoAfectacion'
    ];
    
    if (!camposRequeridos.every(campo => formData[campo])) {
      alert(textos.alertas.camposIncompletos);
      return false;
    }
    
    const inicio = new Date(formData.fechaInicioDate + 'T' + formData.horaInicio);
    const fin = new Date(formData.fechaFinDate + 'T' + formData.horaFin);
    
    if (fin <= inicio) {
      alert(textos.alertas.fechaInvalida);
      return false;
    }
    
    return true;
  };
  
  const generarComunicado = () => {
    if (validarFormulario()) {
      setMostrarVista(true);
    }
  };
  
  const limpiarFormulario = () => {
    setFormData({
      empresa: EMPRESAS.INTERDIN,
      actividad: '',
      fechaInicioDate: '',
      horaInicio: '',
      fechaFinDate: '',
      horaFin: '',
      servicioAfectado: '',
      periodoAfectacion: ''
    });
    setMostrarVista(false);
  };
  
  const cargarEjemplo = () => {
    setFormData({
      empresa: EMPRESAS.INTERDIN,
      actividad: 'Depuración semanal del Centro Autorizador (CAO)',
      fechaInicioDate: '2025-06-09',
      horaInicio: '02:00',
      fechaFinDate: '2025-06-09',
      horaFin: '02:45',
      servicioAfectado: 'Consumos realizados en redes propias y ajenas mediante el uso de tarjetas de crédito/débito.\n\nDurante la ventana, las transacciones serán procesadas por Standin',
      periodoAfectacion: '45 minutos'
    });
  };
  
  const copiarImagen = async () => {
    setCopiando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(textos.alertas.copiaExitosa);
    } catch (error) {
      console.error('Error:', error);
      alert(textos.alertas.errorCopia);
    }
    
    setCopiando(false);
  };
  
  const fechaInicio = FormatoService.formatearFecha(
    formData.fechaInicioDate, 
    formData.horaInicio, 
    IDIOMAS.ES
  );
  const fechaFin = FormatoService.formatearFecha(
    formData.fechaFinDate, 
    formData.horaFin, 
    IDIOMAS.ES
  );
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '40px',
          color: '#1a3a52',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>{textos.titulo}</h1>
        
        <div style={{
          display: 'flex',
          gap: '40px',
          alignItems: 'flex-start'
        }}>
          {/* Panel de edición */}
          <div style={{
            flex: '0 0 450px',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              marginBottom: '20px',
              color: '#333'
            }}>{textos.datosDelComunicado}</h2>
            
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#1565c0'
            }}>
              {textos.infoTimezone}
            </div>
            
            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold'
              }}>{textos.empresa}</label>
              <select 
                value={formData.empresa} 
                onChange={(e) => updateField('empresa', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <option value={EMPRESAS.INTERDIN}>{EMPRESAS.INTERDIN}</option>
                <option value={EMPRESAS.DINERS}>{EMPRESAS.DINERS}</option>
              </select>
            </div>
            
            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold'
              }}>{textos.actividad}</label>
              <textarea
                value={formData.actividad}
                onChange={(e) => updateField('actividad', e.target.value)}
                placeholder={textos.placeholders.actividad}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold'
              }}>{textos.fechaHoraInicio}</label>
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <input
                  type="date"
                  value={formData.fechaInicioDate}
                  onChange={(e) => updateField('fechaInicioDate', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => updateField('horaInicio', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              {fechaInicio && (
                <div style={{
                  marginTop: '5px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {textos.vistaPrevia} {fechaInicio}
                </div>
              )}
            </div>
            
            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold'
              }}>{textos.fechaHoraFin}</label>
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <input
                  type="date"
                  value={formData.fechaFinDate}
                  onChange={(e) => updateField('fechaFinDate', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <input
                  type="time"
                  value={formData.horaFin}
                  onChange={(e) => updateField('horaFin', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              {fechaFin && (
                <div style={{
                  marginTop: '5px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {textos.vistaPrevia} {fechaFin}
                </div>
              )}
            </div>
            
            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold'
              }}>{textos.servicioAfectado}</label>
              <textarea
                value={formData.servicioAfectado}
                onChange={(e) => updateField('servicioAfectado', e.target.value)}
                placeholder={textos.placeholders.servicioAfectado}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  minHeight: '120px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold'
              }}>{textos.periodoAfectacion}</label>
              <input
                type="text"
                value={formData.periodoAfectacion}
                onChange={(e) => updateField('periodoAfectacion', e.target.value)}
                placeholder={textos.placeholders.periodoAfectacion}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: formData.periodoAfectacion && formData.fechaInicioDate && formData.fechaFinDate ? '#f0f7ff' : 'white'
                }}
              />
              {formData.fechaInicioDate && formData.horaInicio && formData.fechaFinDate && formData.horaFin && (
                <div style={{
                  marginTop: '5px',
                  fontSize: '12px',
                  color: '#1976d2'
                }}>
                  {textos.calculadoAutomaticamente}
                </div>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '30px'
            }}>
              <button
                onClick={generarComunicado}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
              >
                {textos.generarComunicado}
              </button>
              <button
                onClick={limpiarFormulario}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#555'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#666'}
              >
                {textos.limpiar}
              </button>
            </div>
            
            <button
              onClick={cargarEjemplo}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            >
              {textos.cargarEjemplo}
            </button>

            <button
              onClick={onBack}
              style={{
                width: '100%',
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              ← Volver al Menú
            </button>
            
            <div style={{
              backgroundColor: '#fff3cd',
              padding: '10px',
              borderRadius: '4px',
              marginTop: '20px',
              fontSize: '12px',
              color: '#856404',
              border: '1px solid #ffeeba'
            }}>
              💡 Traducción automática: Una vez generado el comunicado, podrás traducirlo al inglés usando el selector de idioma.
            </div>
          </div>
          
          {/* Panel de vista previa */}
          <div style={{flex: 1}}>
            {mostrarVista ? (
              <>
                <div style={{
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{
                    margin: 0,
                    color: '#1a3a52'
                  }}>{textos.vistaPreviaComunicado}</h3>
                  <button
                    onClick={copiarImagen}
                    disabled={copiando}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: copiando ? 'wait' : 'pointer',
                      transition: 'background-color 0.2s',
                      opacity: copiando ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => !copiando && (e.target.style.backgroundColor = '#fb8c00')}
                    onMouseLeave={(e) => !copiando && (e.target.style.backgroundColor = '#ff9800')}
                  >
                    {copiando ? textos.procesando : textos.copiar}
                  </button>
                </div>
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: '20px',
                  borderRadius: '8px'
                }}>
                  <VistaPreviaComunicado datos={formData} />
                </div>
              </>
            ) : (
              <div style={{
                backgroundColor: 'white',
                padding: '60px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center',
                color: '#999'
              }}>
                <h3>{textos.vistaPreviaComunicado}</h3>
                <p>{textos.completeCampos}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===============================
// COMPONENTE PRINCIPAL - APLICACIÓN UNIFICADA
// ===============================
function SistemaUnificado() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [herramientaSeleccionada, setHerramientaSeleccionada] = useState(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setHerramientaSeleccionada(null);
  };

  const handleSelectTool = (herramienta) => {
    setHerramientaSeleccionada(herramienta);
  };

  const handleBackToMenu = () => {
    setHerramientaSeleccionada(null);
  };

  // Renderizar según el estado actual
  if (!isLoggedIn) {
    return <LoginComponent onLogin={handleLogin} />;
  }

  if (!herramientaSeleccionada) {
    return (
      <SelectorHerramientas 
        onSelectTool={handleSelectTool} 
        onLogout={handleLogout} 
      />
    );
  }

  if (herramientaSeleccionada === HERRAMIENTAS.INCIDENTES) {
    return <HerramientaIncidentes onBack={handleBackToMenu} />;
  }

  if (herramientaSeleccionada === HERRAMIENTAS.COMUNICADOS) {
    return <HerramientaComunicados onBack={handleBackToMenu} />;
  }

  return null;
}

export default SistemaUnificado;
