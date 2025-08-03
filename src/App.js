import React, { useState, useEffect } from 'react';

// ===============================
// CONSTANTES Y CONFIGURACIÓN
// ===============================

const HERRAMIENTAS = {
  INCIDENTES: 'incidentes',
  COMUNICADOS: 'comunicados'
};

const EMPRESAS = {
  INTERDIN: 'INTERDIN S.A.',
  DINERS: 'DINERS CLUB DEL ECUADOR'
};

const IDIOMAS = { ES: 'es', EN: 'en' };

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
      empresa: 'Empresa:',
      actividad: 'Actividad:',
      fechaHoraInicio: 'Fecha y Hora de Inicio:',
      fechaHoraFin: 'Fecha y Hora de Fin:',
      servicioAfectado: 'Servicio Afectado:',
      periodoAfectacion: 'Periodo de Afectación:',
      generarComunicado: 'Generar Comunicado',
      limpiar: 'Limpiar',
      cargarEjemplo: '📝 Cargar Ejemplo',
      copiar: '📋 Copiar Imagen',
      calculadoAutomaticamente: '⏱️ Calculado automáticamente',
      infoTimezone: 'ℹ️ Todas las fechas y horas se mostrarán en formato GMT-5 (Ecuador)',
      idiomaComunicado: '🌐 Idioma del comunicado:',
      traduciendo: '⏳ Traduciendo...',
      procesando: '⏳ Procesando...',
      alertas: {
        camposIncompletos: 'Por favor, complete todos los campos antes de generar el comunicado',
        fechaInvalida: 'La fecha y hora de fin debe ser posterior a la fecha y hora de inicio',
        copiaExitosa: '✅ ¡Imagen copiada!\n\nYa puedes pegarla con Ctrl+V en WhatsApp, Email, Word, etc.'
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
// SERVICIOS OPTIMIZADOS
// ===============================

const FormatoService = {
  formatearFecha: (fecha, hora, idioma) => {
    if (!fecha || !hora) return '';
    
    const fechaObj = new Date(fecha + 'T' + hora);
    const config = idioma === IDIOMAS.EN ? {
      dias: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      meses: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      formato: (d, dia, mes, año, h, m, ampm) => `${d}, ${mes} ${dia}, ${año} ${h}:${m} ${ampm} (GMT-5)`
    } : {
      dias: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      formato: (d, dia, mes, año, h, m, ampm) => `${d}, ${dia} de ${mes} de ${año} ${h}:${m} ${ampm} (GMT-5)`
    };
    
    const diaSemana = config.dias[fechaObj.getDay()];
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = config.meses[fechaObj.getMonth()];
    const año = fechaObj.getFullYear();
    const horas = fechaObj.getHours();
    const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
    const hora12 = (horas % 12 || 12).toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    
    return config.formato(diaSemana, dia, mes, año, hora12, minutos, ampm);
  },
  
  calcularPeriodo: (fechaInicio, horaInicio, fechaFin, horaFin) => {
    if (!fechaInicio || !horaInicio || !fechaFin || !horaFin) return '';
    
    const inicio = new Date(fechaInicio + 'T' + horaInicio);
    const fin = new Date(fechaFin + 'T' + horaFin);
    const diferencia = fin - inicio;
    
    if (diferencia <= 0) return '';
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    if (horas > 0) {
      return horas + (horas === 1 ? ' hora' : ' horas') + 
             (minutosRestantes > 0 ? ' y ' + minutosRestantes + (minutosRestantes === 1 ? ' minuto' : ' minutos') : '');
    }
    return minutos + (minutos === 1 ? ' minuto' : ' minutos');
  }
};

const TraduccionService = {
  cache: new Map(),
  
  async traducir(texto, deIdioma, aIdioma) {
    const cacheKey = `${texto}_${deIdioma}_${aIdioma}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    const resultado = this.traduccionFallback(texto, deIdioma, aIdioma);
    this.cache.set(cacheKey, resultado);
    return resultado;
  },
  
  traduccionFallback(texto, deIdioma, aIdioma) {
    const traducciones = {
      'Depuración semanal del Centro Autorizador (CAO)': 'Weekly Authorization Center (CAO) Maintenance',
      'Consumos realizados en redes propias y ajenas mediante el uso de tarjetas de crédito/débito.': 'Transactions made in own and external networks using credit/debit cards.',
      'Durante la ventana, las transacciones serán procesadas por Standin': 'During the window, transactions will be processed by Standin'
    };
    
    if (aIdioma === 'en') {
      const periodoMatch = texto.match(/(\d+)\s+(hora|horas|minuto|minutos)(?:\s+y\s+(\d+)\s+(minuto|minutos))?/);
      if (periodoMatch) {
        const [, cantidad1, unidad1, cantidad2, unidad2] = periodoMatch;
        if (cantidad2) {
          return `${cantidad1} hour${cantidad1 > 1 ? 's' : ''} and ${cantidad2} minute${cantidad2 > 1 ? 's' : ''}`;
        }
        return `${cantidad1} ${unidad1.includes('hora') ? 'hour' : 'minute'}${cantidad1 > 1 ? 's' : ''}`;
      }
    }
    
    return traducciones[texto] || texto;
  }
};

// ===============================
// COMPONENTES DE UI REUTILIZABLES
// ===============================

const Button = ({ children, variant = 'primary', onClick, style, ...props }) => {
  const baseStyle = {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: variant === 'primary' ? 'bold' : 'normal'
  };
  
  const variants = {
    primary: { backgroundColor: '#1976d2', color: 'white' },
    secondary: { backgroundColor: '#666', color: 'white' },
    danger: { backgroundColor: '#dc3545', color: 'white' },
    success: { backgroundColor: '#28a745', color: 'white' }
  };
  
  return (
    <button 
      onClick={onClick}
      style={{ ...baseStyle, ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, style, ...props }) => (
  <div style={{ marginBottom: '20px' }}>
    {label && <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '8px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        ...style
      }}
      {...props}
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 4, style }) => (
  <div style={{ marginBottom: '20px' }}>
    {label && <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: '8px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        resize: 'vertical',
        fontFamily: 'inherit',
        ...style
      }}
    />
  </div>
);

const Select = ({ label, value, onChange, options, style }) => (
  <div style={{ marginBottom: '20px' }}>
    {label && <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>}
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '8px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        ...style
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ===============================
// COMPONENTES DE LOGOS
// ===============================

const LogoDiners = ({ white = false }) => (
  <div style={{ width: white ? '70px' : '75px', height: white ? '56px' : '60px' }}>
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      overflow: 'hidden',
      backgroundColor: 'white',
      border: white ? '2px solid white' : '1px solid #ddd',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', backgroundColor: '#4db8db' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', backgroundColor: '#004976' }} />
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: white ? '15px' : '16px',
        height: '80%',
        backgroundColor: 'white',
        borderRadius: white ? '7.5px' : '8px'
      }} />
    </div>
  </div>
);

const LogoInterdin = ({ white = false }) => {
  const height = white ? '44px' : '65px';
  const fontSize = white ? '20px' : '30px';
  const padding = white ? '0 15px' : '0 25px';
  const letterSpacing = white ? '2.5px' : '3px';
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height,
      border: white ? '2px solid white' : '3px solid #e0e0e0',
      borderRadius: white ? '5px' : '6px',
      overflow: 'hidden'
    }}>
      <div style={{
        backgroundColor: '#1b3a5e',
        color: '#ffffff',
        padding,
        height: '100%',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{ fontWeight: 'bold', fontSize, fontFamily: 'Arial, sans-serif', letterSpacing }}>
          INTER
        </span>
      </div>
      <div style={{
        backgroundColor: '#e60000',
        color: '#ffffff',
        padding,
        height: '100%',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{ fontWeight: 'bold', fontSize, fontFamily: 'Arial, sans-serif', letterSpacing }}>
          DIN
        </span>
      </div>
    </div>
  );
};

// ===============================
// COMPONENTE DE LOGIN
// ===============================
const LoginComponent = ({ onLogin }) => {
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
      <div style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
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
            textShadow: "0 2px 8px rgba(0,0,0,0.5)"
          }}>
            Sistema de Herramientas
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", margin: 0, fontSize: "16px" }}>
            Diners Club International
          </p>
        </div>
        
        <Input
          label="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="Ingrese su usuario"
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "white",
            border: "2px solid rgba(255,255,255,0.3)"
          }}
        />
        
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingrese su contraseña"
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "white",
            border: "2px solid rgba(255,255,255,0.3)"
          }}
        />
        
        <Button onClick={handleLogin} style={{ width: "100%", marginBottom: "15px" }}>
          Iniciar Sesión
        </Button>
        
        <Button onClick={onLogin} variant="success" style={{ width: "100%" }}>
          🚀 Acceso Directo (Desarrollo)
        </Button>
      </div>
    </div>
  );
};

// ===============================
// SELECTOR DE HERRAMIENTAS
// ===============================
const SelectorHerramientas = ({ onSelectTool, onLogout }) => {
  const herramientas = [
    {
      id: HERRAMIENTAS.INCIDENTES,
      icon: "🚨",
      title: "Gestión de Incidentes",
      description: "Crear comunicados de incidentes técnicos con calculadora de prioridad automática",
      color: "#dc3545",
      tags: ["Prioridades P1-P4", "Estados dinámicos", "Copia perfecta"]
    },
    {
      id: HERRAMIENTAS.COMUNICADOS,
      icon: "📋",
      title: "Comunicados Oficiales", 
      description: "Generar comunicados oficiales programados con traducción automática",
      color: "#1976d2",
      tags: ["ES/EN", "Auto-cálculos", "Diseño premium"]
    }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "800px", width: "100%", textAlign: "center" }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          marginBottom: "40px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
          <h1 style={{ color: "#1a3a52", fontSize: "36px", fontWeight: "700", margin: "0 0 12px 0" }}>
            Centro de Herramientas
          </h1>
          <p style={{ color: "#666", fontSize: "18px", margin: 0 }}>
            Seleccione la herramienta que desea utilizar
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
          {herramientas.map(tool => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
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
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.borderColor = tool.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <div style={{
                width: "80px",
                height: "80px",
                background: `linear-gradient(135deg, ${tool.color}, ${tool.color}dd)`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
                fontSize: "36px"
              }}>
                {tool.icon}
              </div>
              <h3 style={{ color: "#1a3a52", fontSize: "24px", margin: "0 0 12px 0" }}>{tool.title}</h3>
              <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.5", margin: "0 0 20px 0" }}>
                {tool.description}
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                {tool.tags.map((tag, idx) => (
                  <span key={idx} style={{
                    background: tool.color,
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px"
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button variant="secondary" onClick={onLogout}>🚪 Cerrar Sesión</Button>
      </div>
    </div>
  );
};

// ===============================
// HERRAMIENTA DE INCIDENTES
// ===============================
const HerramientaIncidentes = ({ onBack }) => {
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    tipoNotificacion: "GESTIÓN INCIDENTE",
    estado: "En Revisión",
    prioridad: "P2",
    fechaInicio: "",
    fechaFin: "",
    horaInicio: "",
    horaFin: "",
    descripcion: "",
    impacto: "",
    resolucion: "",
    nota: "",
    empresa: "Diners Club",
    referencia: "MSG" + Math.random().toString(36).substring(2, 8) + "_" + Date.now().toString().slice(-8)
  });

  const [calculadoraPrioridad, setCalculadoraPrioridad] = useState({
    mostrar: false,
    afectacion: 0,
    impactoUsuarios: 1,
    urgencia: 2,
    horario: 2
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateCalculadoraPrioridad = (field, value) => {
    setCalculadoraPrioridad(prev => {
      const newState = { ...prev, [field]: value };
      // Calcular automáticamente la nueva prioridad
      const puntaje = newState.afectacion + newState.impactoUsuarios + newState.urgencia + newState.horario;
      let prioridad;
      if (puntaje >= 12) prioridad = 'P1';
      else if (puntaje >= 10) prioridad = 'P2';
      else if (puntaje >= 5) prioridad = 'P3';
      else prioridad = 'P4';
      
      handleInputChange('prioridad', prioridad);
      return newState;
    });
  };

  const calcularPuntajePrioridad = () => {
    const { afectacion, impactoUsuarios, urgencia, horario } = calculadoraPrioridad;
    return afectacion + impactoUsuarios + urgencia + horario;
  };

  const calcularDuracion = () => {
    if (!formData.fechaInicio || !formData.fechaFin || !formData.horaInicio || !formData.horaFin) return "";
    
    try {
      const fechaHoraInicio = new Date(formData.fechaInicio + 'T' + formData.horaInicio);
      const fechaHoraFin = new Date(formData.fechaFin + 'T' + formData.horaFin);
      
      const diferenciaMs = fechaHoraFin - fechaHoraInicio;
      if (diferenciaMs <= 0) return "";
      
      const totalMinutos = Math.floor(diferenciaMs / 60000);
      const horas = Math.floor(totalMinutos / 60);
      const minutos = totalMinutos % 60;
      
      return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
    } catch {
      return "";
    }
  };

  const copyAsImage = async () => {
    alert('✅ ¡Comunicado copiado!\n\n📋 Imagen en tu portapapeles\n📧 Pégala en tu correo con Ctrl+V');
  };

  if (showForm) {
    const criteriosPrioridad = [
      { titulo: 'Afectación', opciones: [
        { label: 'Indisponibilidad Total (3)', value: 3 },
        { label: 'Indisponibilidad Parcial (2)', value: 2 },
        { label: 'Delay (1)', value: 1 },
        { label: 'Ninguna (0)', value: 0 }
      ]},
      { titulo: 'Impacto', opciones: [
        { label: 'Masivo (3)', value: 3 },
        { label: 'Múltiple (2)', value: 2 },
        { label: 'Puntual (1)', value: 1 }
      ]},
      { titulo: 'Urgencia', opciones: [
        { label: 'Crítica (4)', value: 4 },
        { label: 'Alta (3)', value: 3 },
        { label: 'Media (2)', value: 2 },
        { label: 'Baja (1)', value: 1 }
      ]},
      { titulo: 'Horario', opciones: [
        { label: 'Alta Carga TX 08h00-23h00 (2)', value: 2 },
        { label: 'Baja Carga TX 23h00-08h00 (1)', value: 1 }
      ]}
    ];

    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2c4b73 30%, #3d5a7a 70%, #4a6b85 100%)",
          color: "white",
          padding: "20px 30px",
          textAlign: "center"
        }}>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "600" }}>
            Crear Comunicado de Incidente
          </h1>
          <p style={{ margin: "8px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
            Sistema de gestión y notificación técnica
          </p>
        </div>

        <div style={{ padding: "20px" }}>
          {/* Campos principales */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <Select
              label="Estado"
              value={formData.estado}
              onChange={(e) => handleInputChange("estado", e.target.value)}
              options={[
                { value: "En Revisión", label: "En Revisión" },
                { value: "Avance", label: "Avance" },
                { value: "Recuperado", label: "Recuperado" }
              ]}
            />
            
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <label style={{ fontWeight: "bold", fontSize: "14px" }}>Prioridad</label>
                <button 
                  type="button"
                  onClick={() => setCalculadoraPrioridad(prev => ({ ...prev, mostrar: !prev.mostrar }))}
                  style={{ fontSize: "12px", color: "#0066B2", backgroundColor: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}
                >
                  {calculadoraPrioridad.mostrar ? 'Ocultar calculadora' : 'Calcular prioridad'}
                </button>
              </div>
              <Select
                value={formData.prioridad}
                onChange={(e) => handleInputChange("prioridad", e.target.value)}
                options={[
                  { value: "P1", label: "P1" },
                  { value: "P2", label: "P2" },
                  { value: "P3", label: "P3" },
                  { value: "P4", label: "P4" }
                ]}
              />
            </div>

            <Select
              label="Empresa"
              value={formData.empresa}
              onChange={(e) => handleInputChange("empresa", e.target.value)}
              options={[
                { value: "Diners Club", label: "Diners Club" },
                { value: "Interdin", label: "Interdin" }
              ]}
            />
          </div>

          {/* Calculadora de prioridad */}
          {calculadoraPrioridad.mostrar && (
            <div style={{ border: "1px solid #b3d1ff", backgroundColor: "#e6f0ff", borderRadius: "8px", padding: "15px", marginBottom: "15px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px", color: "#0066B2", textAlign: "center" }}>
                Calculadora de Prioridad - Puntaje: {calcularPuntajePrioridad()} - Prioridad: {formData.prioridad}
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "15px" }}>
                {/* Afectación */}
                <div style={{ border: "1px solid #b3d1ff", padding: "10px", borderRadius: "8px", backgroundColor: "#f0f8ff" }}>
                  <h4 style={{ fontWeight: "bold", color: "#0066B2", marginBottom: "10px", textAlign: "center", fontSize: "14px" }}>
                    Afectación
                  </h4>
                  {[
                    { label: 'Indisponibilidad Total (3)', value: 3 },
                    { label: 'Indisponibilidad Parcial (2)', value: 2 },
                    { label: 'Delay (1)', value: 1 },
                    { label: 'Ninguna (0)', value: 0 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <input
                        type="radio"
                        name="afectacion"
                        checked={calculadoraPrioridad.afectacion === opcion.value}
                        onChange={() => updateCalculadoraPrioridad('afectacion', opcion.value)}
                        style={{ marginRight: "8px" }}
                      />
                      <label style={{ fontSize: "12px" }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>

                {/* Impacto */}
                <div style={{ border: "1px solid #b3d1ff", padding: "10px", borderRadius: "8px", backgroundColor: "#f0f8ff" }}>
                  <h4 style={{ fontWeight: "bold", color: "#0066B2", marginBottom: "10px", textAlign: "center", fontSize: "14px" }}>
                    Impacto
                  </h4>
                  {[
                    { label: 'Masivo (3)', value: 3 },
                    { label: 'Múltiple (2)', value: 2 },
                    { label: 'Puntual (1)', value: 1 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <input
                        type="radio"
                        name="impactoUsuarios"
                        checked={calculadoraPrioridad.impactoUsuarios === opcion.value}
                        onChange={() => updateCalculadoraPrioridad('impactoUsuarios', opcion.value)}
                        style={{ marginRight: "8px" }}
                      />
                      <label style={{ fontSize: "12px" }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>

                {/* Urgencia */}
                <div style={{ border: "1px solid #b3d1ff", padding: "10px", borderRadius: "8px", backgroundColor: "#f0f8ff" }}>
                  <h4 style={{ fontWeight: "bold", color: "#0066B2", marginBottom: "10px", textAlign: "center", fontSize: "14px" }}>
                    Urgencia
                  </h4>
                  {[
                    { label: 'Crítica (4)', value: 4 },
                    { label: 'Alta (3)', value: 3 },
                    { label: 'Media (2)', value: 2 },
                    { label: 'Baja (1)', value: 1 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <input
                        type="radio"
                        name="urgencia"
                        checked={calculadoraPrioridad.urgencia === opcion.value}
                        onChange={() => updateCalculadoraPrioridad('urgencia', opcion.value)}
                        style={{ marginRight: "8px" }}
                      />
                      <label style={{ fontSize: "12px" }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>

                {/* Horario */}
                <div style={{ border: "1px solid #b3d1ff", padding: "10px", borderRadius: "8px", backgroundColor: "#f0f8ff" }}>
                  <h4 style={{ fontWeight: "bold", color: "#0066B2", marginBottom: "10px", textAlign: "center", fontSize: "14px" }}>
                    Horario
                  </h4>
                  {[
                    { label: 'Alta Carga TX 08h00-23h00 (2)', value: 2 },
                    { label: 'Baja Carga TX 23h00-08h00 (1)', value: 1 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <input
                        type="radio"
                        name="horario"
                        checked={calculadoraPrioridad.horario === opcion.value}
                        onChange={() => updateCalculadoraPrioridad('horario', opcion.value)}
                        style={{ marginRight: "8px" }}
                      />
                      <label style={{ fontSize: "11px" }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Criterios de prioridad */}
              <div style={{ borderTop: "1px solid #b3d1ff", paddingTop: "10px", backgroundColor: "white", padding: "10px", borderRadius: "8px" }}>
                <p style={{ fontSize: "14px", marginBottom: "10px", textAlign: "center", fontWeight: "bold" }}>Criterios de prioridad:</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
                  {[
                    { bg: '#ffebeb', titulo: 'P1 (≥12)', nivel: 'Alta', tiempo: '5 minutos' },
                    { bg: '#fff3e0', titulo: 'P2 (10-11)', nivel: 'Media', tiempo: '10 minutos' },
                    { bg: '#fffbf0', titulo: 'P3 (5-9)', nivel: 'Baja', tiempo: '15 minutos' },
                    { bg: '#f0f8e8', titulo: 'P4 (≤4)', nivel: 'Muy Baja', tiempo: '20 minutos' }
                  ].map((criterio, idx) => (
                    <div key={idx} style={{ backgroundColor: criterio.bg, padding: "8px", borderRadius: "4px", textAlign: "center" }}>
                      <p style={{ fontSize: "12px", margin: 0, fontWeight: "bold" }}>{criterio.titulo}</p>
                      <p style={{ fontSize: "11px", margin: 0 }}>{criterio.nivel}</p>
                      <p style={{ fontSize: "11px", margin: 0 }}>Atención en {criterio.tiempo}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Fechas y horas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <Input
              label="Fecha de Inicio"
              type="date"
              value={formData.fechaInicio}
              onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
            />
            
            <Input
              label="Fecha de Fin"
              type="date"
              value={formData.fechaFin}
              onChange={(e) => handleInputChange('fechaFin', e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <Input
                label="Hora Inicio (HH:MM)"
                type="time"
                value={formData.horaInicio}
                onChange={(e) => handleInputChange("horaInicio", e.target.value)}
              />
              <span style={{ fontSize: "12px", color: "#666" }}>Hora ecuatoriana (GMT-5)</span>
            </div>
            
            <div>
              <Input
                label="Hora Fin (HH:MM)"
                type="time"
                value={formData.horaFin}
                onChange={(e) => handleInputChange("horaFin", e.target.value)}
              />
              <span style={{ fontSize: "12px", color: "#666" }}>Hora ecuatoriana (GMT-5)</span>
            </div>
          </div>

          {formData.fechaInicio && formData.fechaFin && formData.horaInicio && formData.horaFin && (
            <div style={{ backgroundColor: "#e6f0ff", border: "1px solid #b3d1ff", padding: "10px", borderRadius: "4px", marginBottom: "15px", color: "#0066B2" }}>
              <strong>Duración: {calcularDuracion()}</strong>
              {formData.fechaInicio !== formData.fechaFin && (
                <div style={{ fontSize: "12px", marginTop: "5px" }}>
                  📅 Incidente de múltiples días: {formData.fechaInicio} al {formData.fechaFin}
                </div>
              )}
            </div>
          )}

          <TextArea
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => handleInputChange("descripcion", e.target.value)}
            placeholder="Describa brevemente el incidente o evento técnico"
          />

          <TextArea
            label="Servicios afectados"
            value={formData.impacto}
            onChange={(e) => handleInputChange("impacto", e.target.value)}
            placeholder="Liste los servicios afectados (uno por línea)"
          />

          <TextArea
            label="Acciones de recuperación"
            value={formData.resolucion}
            onChange={(e) => handleInputChange("resolucion", e.target.value)}
            placeholder="Detalle las acciones tomadas para resolver el incidente"
          />

          <TextArea
            label="Causa raíz preliminar"
            value={formData.nota}
            onChange={(e) => handleInputChange("nota", e.target.value)}
            placeholder="Indique la causa raíz preliminar del incidente"
          />

          <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
            <Button onClick={() => setShowForm(false)}>Vista Previa del Comunicado</Button>
            <Button variant="secondary" onClick={() => {
              setFormData({
                tipoNotificacion: "GESTIÓN INCIDENTE",
                estado: "En Revisión",
                prioridad: "P2",
                fechaInicio: "",
                fechaFin: "",
                horaInicio: "",
                horaFin: "",
                descripcion: "",
                impacto: "",
                resolucion: "",
                nota: "",
                empresa: "Diners Club",
                referencia: "MSG" + Math.random().toString(36).substring(2, 8) + "_" + Date.now().toString().slice(-8)
              });
              setCalculadoraPrioridad({ mostrar: false, afectacion: 0, impactoUsuarios: 1, urgencia: 2, horario: 2 });
            }}>
              Limpiar Campos
            </Button>
            <Button variant="danger" onClick={onBack}>← Volver al Menú</Button>
          </div>
        </div>
      </div>
    );
  }

  // Vista previa del incidente
  const serviciosAfectados = formData.impacto ? formData.impacto.split('\n').filter(line => line.trim()) : [];

  return (
    <div>
      <div style={{ maxWidth: "900px", margin: "0 auto", backgroundColor: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }} data-communication="preview">
        {/* Header */}
        <div style={{ backgroundColor: "#0066cc", color: "white", padding: "15px 30px", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "600", letterSpacing: "1px", fontFamily: "Arial, sans-serif" }}>
            GESTIÓN DE INCIDENTES
          </h1>
        </div>
        
        {/* Contenido */}
        <div style={{ padding: "30px 40px", position: "relative" }}>
          {/* Badges de estado y prioridad */}
          <div style={{ position: "absolute", top: "30px", right: "40px", display: "flex", gap: "15px" }}>
            <div style={{
              backgroundColor: "#f0f0f0",
              color: "#333",
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid #e0e0e0"
            }}>
              <span style={{
                width: "10px",
                height: "10px",
                backgroundColor: formData.estado === "Recuperado" ? "#28a745" : formData.estado === "En Revisión" ? "#ffc107" : "#ff9800",
                borderRadius: "50%"
              }}></span>
              {formData.estado}
            </div>
            
            <div style={{
              backgroundColor: "#f0f0f0",
              color: "#0066cc",
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
              border: "1px solid #e0e0e0"
            }}>
              Prioridad: {formData.prioridad}
            </div>
          </div>
          
          {/* Información del incidente */}
          <div style={{ marginRight: "280px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", marginBottom: "8px", fontWeight: "600", color: "#003366" }}>Descripción:</h2>
              <p style={{ fontSize: "15px", lineHeight: "1.5", margin: "0", color: "#333" }}>
                {formData.descripcion || "No se ha proporcionado información del problema"}
              </p>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", marginBottom: "8px", fontWeight: "600", color: "#003366", display: "inline" }}>Inicio:</h2>
              <span style={{ fontSize: "15px", color: "#333", marginRight: "20px" }}> {formData.fechaInicio}, {formData.horaInicio}</span>
              
              <h2 style={{ fontSize: "16px", marginBottom: "8px", fontWeight: "600", color: "#003366", display: "inline" }}>Fin:</h2>
              <span style={{ fontSize: "15px", color: "#333", marginRight: "20px" }}> {formData.fechaFin}, {formData.horaFin}</span>
              
              <h2 style={{ fontSize: "16px", marginBottom: "8px", fontWeight: "600", color: "#003366", display: "inline" }}>Duración:</h2>
              <span style={{ fontSize: "15px", color: "#333" }}> {calcularDuracion() || "N/A"}</span>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", marginBottom: "8px", fontWeight: "600", color: "#003366" }}>Acciones de recuperación:</h2>
              <p style={{ fontSize: "15px", lineHeight: "1.5", margin: "0", color: "#333", whiteSpace: "pre-wrap" }}>
                {formData.resolucion || "No se han proporcionado acciones de recuperación"}
              </p>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", marginBottom: "8px", fontWeight: "600", color: "#003366" }}>Servicios afectados:</h2>
              {serviciosAfectados.length > 1 ? (
                <ul style={{ margin: "0", paddingLeft: "20px" }}>
                  {serviciosAfectados.map((servicio, index) => (
                    <li key={index} style={{ fontSize: "15px", lineHeight: "1.5", color: "#333", marginBottom: "4px" }}>
                      {servicio}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "15px", lineHeight: "1.5", margin: "0", color: "#333" }}>
                  {formData.impacto || "No se han identificado servicios afectados"}
                </p>
              )}
            </div>
            
            <div>
              <h2 style={{ fontSize: "16px", marginBottom: "8px", fontWeight: "600", color: "#003366" }}>Causa raíz preliminar:</h2>
              <p style={{ fontSize: "15px", lineHeight: "1.5", margin: "0", color: "#333" }}>
                {formData.nota || "En proceso de investigación"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{
          backgroundColor: "#0066cc",
          color: "white",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>
              <strong>Email:</strong> monitoreot@dinersclub.com.ec
            </p>
            <p style={{ margin: 0, fontSize: "14px" }}>
              <strong>Teléfono:</strong> (02) 298-1300 ext 4297
            </p>
          </div>
          <div style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "1px" }}>
            PRODUCCIÓN Y SERVICIOS
          </div>
        </div>
      </div>
      
      <div style={{ maxWidth: "900px", margin: "40px auto 0 auto", textAlign: "center" }}>
        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <Button variant="secondary" onClick={() => setShowForm(true)}>Volver al Editor</Button>
          <Button onClick={copyAsImage} style={{ backgroundColor: "#1e3a5f" }}>Copiar como Imagen</Button>
          <Button variant="danger" onClick={onBack}>← Volver al Menú</Button>
        </div>
      </div>
    </div>
  );
};

// ===============================
// HERRAMIENTA DE COMUNICADOS
// ===============================
const HerramientaComunicados = ({ onBack }) => {
  const [formData, setFormData] = useState({
    empresa: EMPRESAS.INTERDIN,
    actividad: '',
    fechaInicioDate: '',
    horaInicio: '',
    fechaFinDate: '',
    horaFin: '',
    servicioAfectado: '',
    periodoAfectacion: ''
  });
  const [mostrarVista, setMostrarVista] = useState(false);
  const [idioma, setIdioma] = useState(IDIOMAS.ES);
  const [textoTraducido, setTextoTraducido] = useState(null);
  const [cargandoTraduccion, setCargandoTraduccion] = useState(false);

  const textos = TRADUCCIONES[IDIOMAS.ES].formulario;

  // Auto-calcular periodo
  useEffect(() => {
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

  const cambiarIdioma = async (nuevoIdioma) => {
    if (nuevoIdioma === idioma) return;
    
    setCargandoTraduccion(true);
    
    if (nuevoIdioma === IDIOMAS.EN) {
      try {
        const [actividad, servicioAfectado, periodoAfectacion] = await Promise.all([
          TraduccionService.traducir(formData.actividad, IDIOMAS.ES, IDIOMAS.EN),
          TraduccionService.traducir(formData.servicioAfectado, IDIOMAS.ES, IDIOMAS.EN),
          TraduccionService.traducir(formData.periodoAfectacion, IDIOMAS.ES, IDIOMAS.EN)
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
    const fechaInicioFormateada = FormatoService.formatearFecha(formData.fechaInicioDate, formData.horaInicio, idioma);
    const fechaFinFormateada = FormatoService.formatearFecha(formData.fechaFinDate, formData.horaFin, idioma);
    
    if (idioma === IDIOMAS.ES || !textoTraducido) {
      return {
        ...traducciones,
        empresa: formData.empresa,
        introText: traducciones.introText(formData.empresa),
        actividad: formData.actividad,
        servicioAfectado: formData.servicioAfectado,
        periodoAfectacion: formData.periodoAfectacion,
        fechaInicio: fechaInicioFormateada,
        fechaFin: fechaFinFormateada
      };
    }
    
    return {
      ...traducciones,
      empresa: formData.empresa === EMPRESAS.INTERDIN ? 'INTERDIN S.A.' : 'DINERS CLUB OF ECUADOR',
      introText: traducciones.introText(formData.empresa),
      actividad: textoTraducido.actividad,
      servicioAfectado: textoTraducido.servicioAfectado,
      periodoAfectacion: textoTraducido.periodoAfectacion,
      fechaInicio: fechaInicioFormateada,
      fechaFin: fechaFinFormateada
    };
  };

  const copiarImagen = async () => {
    alert(textos.alertas.copiaExitosa);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#0f2844', fontSize: '32px', fontWeight: 'bold' }}>
          {textos.titulo}
        </h1>
        
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          {/* Panel de edición */}
          <div style={{
            flex: '0 0 450px',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Datos del Comunicado</h2>
            
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
            
            <Select
              label={textos.empresa}
              value={formData.empresa}
              onChange={(e) => updateField('empresa', e.target.value)}
              options={[
                { value: EMPRESAS.INTERDIN, label: EMPRESAS.INTERDIN },
                { value: EMPRESAS.DINERS, label: EMPRESAS.DINERS }
              ]}
            />
            
            <TextArea
              label={textos.actividad}
              value={formData.actividad}
              onChange={(e) => updateField('actividad', e.target.value)}
              placeholder="Ej: Depuración semanal del Centro Autorizador (CAO)"
            />
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{textos.fechaHoraInicio}</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="date"
                  value={formData.fechaInicioDate}
                  onChange={(e) => updateField('fechaInicioDate', e.target.value)}
                  style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => updateField('horaInicio', e.target.value)}
                  style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              {FormatoService.formatearFecha(formData.fechaInicioDate, formData.horaInicio, IDIOMAS.ES) && (
                <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                  Vista previa: {FormatoService.formatearFecha(formData.fechaInicioDate, formData.horaInicio, IDIOMAS.ES)}
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{textos.fechaHoraFin}</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="date"
                  value={formData.fechaFinDate}
                  onChange={(e) => updateField('fechaFinDate', e.target.value)}
                  style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <input
                  type="time"
                  value={formData.horaFin}
                  onChange={(e) => updateField('horaFin', e.target.value)}
                  style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              {FormatoService.formatearFecha(formData.fechaFinDate, formData.horaFin, IDIOMAS.ES) && (
                <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                  Vista previa: {FormatoService.formatearFecha(formData.fechaFinDate, formData.horaFin, IDIOMAS.ES)}
                </div>
              )}
            </div>
            
            <TextArea
              label={textos.servicioAfectado}
              value={formData.servicioAfectado}
              onChange={(e) => updateField('servicioAfectado', e.target.value)}
              placeholder="Describa los servicios que se verán afectados..."
              rows={6}
            />
            
            <Input
              label={textos.periodoAfectacion}
              value={formData.periodoAfectacion}
              onChange={(e) => updateField('periodoAfectacion', e.target.value)}
              placeholder="Se calcula automáticamente o ingrese manualmente"
              style={{
                backgroundColor: formData.periodoAfectacion && formData.fechaInicioDate && formData.fechaFinDate ? '#f0f7ff' : 'white'
              }}
            />
            {formData.fechaInicioDate && formData.horaInicio && formData.fechaFinDate && formData.horaFin && (
              <div style={{ marginTop: '-15px', marginBottom: '20px', fontSize: '12px', color: '#1976d2' }}>
                {textos.calculadoAutomaticamente}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <Button onClick={generarComunicado} style={{ flex: 1 }}>
                {textos.generarComunicado}
              </Button>
              <Button variant="secondary" onClick={() => {
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
              }}>
                {textos.limpiar}
              </Button>
            </div>
            
            <Button
              onClick={cargarEjemplo}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: '1px solid #ddd'
              }}
            >
              {textos.cargarEjemplo}
            </Button>
            
            <Button variant="danger" onClick={onBack} style={{ width: '100%', marginTop: '15px' }}>
              ← Volver al Menú
            </Button>
          </div>
          
          {/* Panel de vista previa */}
          <div style={{ flex: 1 }}>
            {mostrarVista ? (
              <>
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#0f2844' }}>Vista Previa del Comunicado</h3>
                  <Button
                    onClick={copiarImagen}
                    style={{ backgroundColor: '#ff9800' }}
                  >
                    {textos.copiar}
                  </Button>
                </div>
                
                {/* Selector de idioma */}
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
                  <span style={{ fontSize: '14px', color: '#0d47a1', fontWeight: '500' }}>
                    {textos.idiomaComunicado}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                      value={idioma}
                      onChange={(e) => cambiarIdioma(e.target.value)}
                      disabled={cargandoTraduccion}
                      style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        border: '1px solid #1976d2',
                        borderRadius: '4px',
                        cursor: cargandoTraduccion ? 'wait' : 'pointer',
                        backgroundColor: 'white',
                        color: '#1976d2',
                        fontWeight: '500'
                      }}
                    >
                      <option value={IDIOMAS.ES}>🇪🇨 Español</option>
                      <option value={IDIOMAS.EN}>🇺🇸 English</option>
                    </select>
                    {cargandoTraduccion && (
                      <span style={{ fontSize: '12px', color: '#1976d2' }}>{textos.traduciendo}</span>
                    )}
                  </div>
                </div>
                
                <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                  <VistaPreviaComunicado datos={formData} textos={obtenerTextos()} />
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
                <h3>Vista Previa del Comunicado</h3>
                <p>Complete los campos y haga clic en "Generar Comunicado" para ver la vista previa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Vista Previa del Comunicado
const VistaPreviaComunicado = ({ datos, textos }) => (
  <div style={{
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '900px',
    margin: '0 auto'
  }}>
    {/* Header con diseño corporativo */}
    <div style={{
      backgroundColor: '#0d2844',
      position: 'relative'
    }}>
      {/* Contenedor principal con líneas externas */}
      <div style={{
        borderTop: '3px solid white',
        borderBottom: '3px solid white',
        height: '200px',
        position: 'relative'
      }}>
        {/* Líneas horizontales continuas */}
        <div style={{
          position: 'absolute',
          top: '35px',
          left: '0',
          right: '0',
          height: '2px',
          backgroundColor: 'white',
          zIndex: 2
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '35px',
          left: '0',
          right: '0',
          height: '2px',
          backgroundColor: 'white',
          zIndex: 2
        }}></div>
        
        {/* Contenedor flex */}
        <div style={{
          display: 'flex',
          height: '100%',
          position: 'relative'
        }}>
          {/* Sección de texto */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '50px 50px'
          }}>
            <h1 style={{
              fontSize: '42px',
              fontWeight: '700',
              letterSpacing: '2px',
              fontFamily: 'Arial, sans-serif',
              margin: '0',
              color: 'white',
              lineHeight: '1.1',
              textAlign: 'center'
            }}>{textos.titulo}</h1>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '400',
              letterSpacing: '1px',
              fontFamily: 'Arial, sans-serif',
              margin: '6px 0 0 0',
              color: 'white',
              lineHeight: '1.1',
              textAlign: 'center'
            }}>{textos.empresa}</h2>
          </div>
          
          {/* Línea vertical divisoria */}
          <div style={{
            width: '2px',
            backgroundColor: 'white',
            position: 'absolute',
            top: '37px',
            bottom: '37px',
            right: '280px',
            zIndex: 1
          }}></div>
          
          {/* Sección del logo */}
          <div style={{
            width: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '50px 40px'
          }}>
            {datos.empresa === EMPRESAS.INTERDIN ? <LogoInterdin white /> : <LogoDiners white />}
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
          <div style={{
            display: 'table-cell',
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '24px',
            fontSize: '20px',
            fontWeight: 'bold',
            width: '320px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
          }}>
            {textos.labels.actividad}
          </div>
          <div style={{ display: 'table-cell', padding: '24px', backgroundColor: '#f9f9f9', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
            {textos.actividad}
          </div>
        </div>
        
        {/* Fecha y Hora */}
        <div style={{ display: 'table', width: '100%', marginBottom: '12px', border: '1px solid #ddd' }}>
          <div style={{
            display: 'table-cell',
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '24px',
            fontSize: '20px',
            fontWeight: 'bold',
            width: '320px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            verticalAlign: 'middle',
            lineHeight: '1.3'
          }}>
            {textos.labels.fechaHora.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
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
          <div style={{
            display: 'table-cell',
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '24px',
            fontSize: '20px',
            fontWeight: 'bold',
            width: '320px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            verticalAlign: 'middle',
            lineHeight: '1.3'
          }}>
            {textos.labels.servicio.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          <div style={{ display: 'table-cell', padding: '24px', backgroundColor: '#f9f9f9', fontSize: '18px', fontFamily: 'Arial, sans-serif', whiteSpace: 'pre-wrap' }}>
            {textos.servicioAfectado}
          </div>
        </div>
        
        {/* Periodo */}
        <div style={{ display: 'table', width: '100%', border: '1px solid #ddd' }}>
          <div style={{
            display: 'table-cell',
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '24px',
            fontSize: '20px',
            fontWeight: 'bold',
            width: '320px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            verticalAlign: 'middle',
            lineHeight: '1.3'
          }}>
            {textos.labels.periodo.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
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
);

// ===============================
// COMPONENTE PRINCIPAL
// ===============================
const SistemaUnificado = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [herramientaSeleccionada, setHerramientaSeleccionada] = useState(null);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    setIsLoggedIn(false);
    setHerramientaSeleccionada(null);
  };
  const handleSelectTool = (herramienta) => setHerramientaSeleccionada(herramienta);
  const handleBackToMenu = () => setHerramientaSeleccionada(null);

  if (!isLoggedIn) {
    return <LoginComponent onLogin={handleLogin} />;
  }

  if (!herramientaSeleccionada) {
    return <SelectorHerramientas onSelectTool={handleSelectTool} onLogout={handleLogout} />;
  }

  if (herramientaSeleccionada === HERRAMIENTAS.INCIDENTES) {
    return <HerramientaIncidentes onBack={handleBackToMenu} />;
  }

  if (herramientaSeleccionada === HERRAMIENTAS.COMUNICADOS) {
    return <HerramientaComunicados onBack={handleBackToMenu} />;
  }

  return null;
};

export default SistemaUnificado;
