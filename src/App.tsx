import React, { useState, useMemo } from 'react';
import { Search, Copy, Users, Router, Shield, BarChart3, Zap, Check } from 'lucide-react';

interface Script {
  id: string;
  title: string;
  category: string;
  description: string;
  code: string;
  author: string;
}

const scripts: Script[] = [
  {
    id: '1',
    title: 'Acceso Remoto Seguro',
    category: 'A',
    description: 'Configuración de acceso remoto seguro mediante SSH y certificados. Incluye configuración de llaves públicas, deshabilitación de servicios innecesarios y configuración de puertos seguros.',
    code: `/ip service disable telnet,ftp,www
/ip service set ssh port=2222
/user ssh-keys import public-key-file=admin.pub user=admin
/ip firewall filter add chain=input action=accept protocol=tcp dst-port=2222 src-address=192.168.1.0/24
:log info "Acceso remoto seguro configurado"`,
    author: 'Security Admin'
  },
  {
    id: '2',
    title: 'Actualización Automática de Firmware',
    category: 'A',
    description: 'Script para verificar y descargar automáticamente actualizaciones de firmware. Incluye verificación de versión actual, descarga segura y programación de reinicio.',
    code: `/system package update check-for-updates
:delay 10s
:if ([/system package update get status] = "New version is available") do={
  /system package update download
  :log info "Descargando nueva versión de firmware"
  :delay 60s
  /system reboot
}`,
    author: 'Update Manager'
  },
  {
    id: '3',
    title: 'Análisis de Tráfico por IP',
    category: 'A',
    description: 'Herramienta para analizar el tráfico de red por dirección IP. Genera reportes detallados de consumo de ancho de banda y identifica las IPs con mayor uso de datos.',
    code: `:foreach address in=[/ip firewall address-list find list="monitored-ips"] do={
  :local ip [/ip firewall address-list get $address address]
  :local bytes [/ip accounting get [find src-address=$ip] bytes]
  :if ($bytes > 1000000000) do={
    :log warning ("IP $ip ha consumido " . ($bytes / 1000000) . " MB")
  }
}`,
    author: 'Network Analyst'
  },
  {
    id: '4',
    title: 'Autenticación RADIUS',
    category: 'A',
    description: 'Configuración completa de autenticación RADIUS para usuarios PPPoE y Hotspot. Incluye configuración de servidor RADIUS, accounting y failover.',
    code: `/radius add service=ppp address=192.168.1.10 secret=radiussecret
/radius add service=hotspot address=192.168.1.10 secret=radiussecret
/ppp aaa set use-radius=yes
/ip hotspot profile set hsprof1 use-radius=yes
:log info "Autenticación RADIUS configurada"`,
    author: 'Auth Specialist'
  },
  {
    id: '5',
    title: 'Alertas de Sistema por Email',
    category: 'A',
    description: 'Sistema de alertas automáticas que envía notificaciones por email cuando ocurren eventos críticos como caídas de interfaces, alta temperatura o uso excesivo de CPU.',
    code: `:local cpuload [/system resource get cpu-load]
:local temperature [/system health get temperature]
:local freememory [/system resource get free-memory]

:if ($cpuload > 80) do={
  /tool e-mail send to="admin@empresa.com" subject="Alerta: CPU Alta" body=("CPU al " . $cpuload . "%")
}
:if ($temperature > 60) do={
  /tool e-mail send to="admin@empresa.com" subject="Alerta: Temperatura Alta" body=("Temperatura: " . $temperature . "°C")
}`,
    author: 'System Monitor'
  },
  {
    id: '6',
    title: 'Administración de Usuarios PPPoE',
    category: 'A',
    description: 'Script para gestión automática de usuarios PPPoE. Incluye creación masiva de usuarios, asignación de perfiles de velocidad y generación de reportes de conexión.',
    code: `:for i from=1 to=50 do={
  :local username ("user" . $i)
  :local password ("pass" . $i)
  /ppp secret add name=$username password=$password profile=default
}
/ppp profile add name=1mb local-address=192.168.1.1 rate-limit=1M/1M
/ppp profile add name=2mb local-address=192.168.1.1 rate-limit=2M/2M
:log info "50 usuarios PPPoE creados"`,
    author: 'PPPoE Admin'
  },
  {
    id: '7',
    title: 'Anti-DDoS Básico',
    category: 'A',
    description: 'Protección básica contra ataques DDoS mediante rate limiting y blacklisting automático. Detecta patrones de tráfico anómalos y bloquea IPs sospechosas.',
    code: `/ip firewall filter
add action=add-src-to-address-list address-list=ddos-attackers address-list-timeout=1h chain=input connection-limit=20,32 protocol=tcp
add action=drop chain=input src-address-list=ddos-attackers
add action=tarpit chain=input connection-limit=3,32 protocol=tcp dst-port=22,23,21,25,53,80,110,995,143,993,587,465,119,563
:log info "Protección anti-DDoS activada"`,
    author: 'Security Expert'
  },
  {
    id: '8',
    title: 'Auditoría de Configuración',
    category: 'A',
    description: 'Script de auditoría que revisa la configuración actual del router y genera un reporte con recomendaciones de seguridad y optimización.',
    code: `:local report ""
:if ([/ip service get telnet disabled] = false) do={
  :set report ($report . "ADVERTENCIA: Servicio Telnet habilitado\\n")
}
:if ([/ip service get ftp disabled] = false) do={
  :set report ($report . "ADVERTENCIA: Servicio FTP habilitado\\n")
}
:if ([/system ntp client get enabled] = false) do={
  :set report ($report . "RECOMENDACIÓN: Habilitar cliente NTP\\n")
}
:log info $report`,
    author: 'Audit Team'
  },
  {
    id: '9',
    title: 'Asignación Automática de VLANs',
    category: 'A',
    description: 'Automatización para la creación y asignación de VLANs basada en direcciones MAC. Útil para segmentar automáticamente dispositivos en redes corporativas.',
    code: `:foreach lease in=[/ip dhcp-server lease find] do={
  :local mac [/ip dhcp-server lease get $lease mac-address]
  :local ip [/ip dhcp-server lease get $lease address]
  
  :if ([:pick $mac 0 8] = "00:1B:44") do={
    /interface bridge port set [find interface=ether2] pvid=100
    :log info ("Dispositivo $mac asignado a VLAN 100")
  }
}`,
    author: 'VLAN Manager'
  },
  {
    id: '10',
    title: 'Archivo de Logs Automático',
    category: 'A',
    description: 'Sistema de archivado automático de logs del sistema. Comprime y envía logs antiguos por email, manteniendo el sistema limpio y con historial completo.',
    code: `:local logcount [/log print count-only]
:if ($logcount > 1000) do={
  /log print file=system-logs
  :delay 5s
  /tool e-mail send to="admin@empresa.com" subject="Logs del Sistema" body="Logs automáticos del router" file=system-logs.txt
  /log print without-paging
  :log info "Logs archivados y enviados por email"
}`,
    author: 'Log Keeper'
  },
  {
    id: '11',
    title: 'Backup Automático Diario',
    category: 'A',
    description: 'Script para crear respaldos automáticos del router cada 24 horas. Guarda la configuración completa y la envía por email. Ideal para mantener copias de seguridad regulares sin intervención manual.',
    code: `:local backupname ("backup-" . [/system identity get name] . "-" . [:pick [/system clock get date] 7 11] . [:pick [/system clock get date] 0 3] . [:pick [/system clock get date] 4 6] . ".backup")
/system backup save name=$backupname
:delay 5s
/tool e-mail send to="admin@empresa.com" subject=("Backup " . [/system identity get name]) body=("Backup del router " . [/system identity get name] . " generado automáticamente") file=$backupname
:log info ("Backup creado: " . $backupname)`,
    author: 'MikroTik Community'
  },
  {
    id: '12',
    title: 'Configurar DHCP Server Básico',
    category: 'C',
    description: 'Configuración rápida de un servidor DHCP con pool de direcciones IP, DNS y gateway por defecto. Incluye configuración de lease time y opciones de red estándar para una LAN típica.',
    code: `/ip pool add name=dhcp-pool ranges=192.168.1.100-192.168.1.200
/ip dhcp-server network add address=192.168.1.0/24 gateway=192.168.1.1 dns-server=8.8.8.8,8.8.4.4
/ip dhcp-server add name=dhcp-server interface=bridge address-pool=dhcp-pool disabled=no
:log info "DHCP Server configurado correctamente"`,
    author: 'Router Admin'
  },
  {
    id: '13',
    title: 'Firewall Básico de Seguridad',
    category: 'F',
    description: 'Reglas de firewall esenciales para proteger tu router MikroTik. Incluye protección contra ataques comunes, bloqueo de accesos no autorizados y configuración de NAT básico para la red interna.',
    code: `/ip firewall filter
add action=accept chain=input connection-state=established,related
add action=accept chain=input src-address=192.168.1.0/24
add action=drop chain=input
add action=accept chain=forward connection-state=established,related
add action=accept chain=forward src-address=192.168.1.0/24
add action=drop chain=forward
/ip firewall nat
add action=masquerade chain=srcnat out-interface=ether1
:log info "Firewall configurado con reglas básicas de seguridad"`,
    author: 'Security Team'
  },
  {
    id: '14',
    title: 'Monitor de Ancho de Banda',
    category: 'M',
    description: 'Script para monitorear el uso de ancho de banda por interfaz y generar alertas cuando se superen los límites configurados. Útil para detectar anomalías en el tráfico de red.',
    code: `:foreach interface in=[/interface ethernet find] do={
  :local ifname [/interface ethernet get $interface name]
  :local rxbytes [/interface ethernet monitor $interface once as-value]
  :local txbytes ($rxbytes->"tx-byte")
  :local rxrate ($rxbytes->"rx-bits-per-second")
  :local txrate ($rxbytes->"tx-bits-per-second")
  
  :if ($rxrate > 50000000) do={
    :log warning ("Tráfico alto en $ifname: RX $rxrate bps")
  }
  :if ($txrate > 50000000) do={
    :log warning ("Tráfico alto en $ifname: TX $txrate bps")
  }
}`,
    author: 'Network Monitor'
  },
  {
    id: '15',
    title: 'QoS Básico para Gaming',
    category: 'Q',
    description: 'Configuración de Quality of Service (QoS) optimizada para gaming y aplicaciones en tiempo real. Prioriza el tráfico de juegos y reduce la latencia para una mejor experiencia de usuario.',
    code: `/queue tree
add name=Gaming parent=global priority=1 max-limit=50M
add name=Streaming parent=global priority=3 max-limit=30M
add name=General parent=global priority=8 max-limit=100M

/ip firewall mangle
add action=mark-packet chain=forward dst-port=27015,7777,25565 new-packet-mark=gaming-packet
add action=mark-packet chain=forward dst-port=80,443,1935 new-packet-mark=streaming-packet
add action=mark-packet chain=forward new-packet-mark=general-packet

/queue tree
add name=Gaming-Up parent=global packet-mark=gaming-packet priority=1
add name=Streaming-Up parent=global packet-mark=streaming-packet priority=3
add name=General-Up parent=global packet-mark=general-packet priority=8

:log info "QoS configurado para optimizar gaming y streaming"`,
    author: 'Gaming Optimizer'
  }
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function App() {
  const [selectedScript, setSelectedScript] = useState<Script>(scripts[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredScripts = useMemo(() => {
    let filtered = scripts;

    if (searchTerm) {
      filtered = filtered.filter(script => 
        script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLetter) {
      filtered = filtered.filter(script => 
        script.title.charAt(0).toUpperCase() === selectedLetter
      );
    }

    return filtered;
  }, [searchTerm, selectedLetter]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(selectedScript.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const resetFilters = () => {
    setSelectedLetter(null);
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Router className="h-8 w-8 text-green-400" />
              <h1 className="text-xl font-bold">MikroTik Hispano</h1>
            </div>
            
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Colabora</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-80 bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar scripts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Alphabet Filter */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">Filtro Alfabético</h3>
                  {(selectedLetter || searchTerm) && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 text-center">
                  {alphabet.map((letter) => (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                      className={`px-2 py-1 text-xs font-medium hover:bg-gray-100 transition-colors duration-150 ${
                        selectedLetter === letter
                          ? 'text-green-600 font-bold'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scripts List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Scripts ({filteredScripts.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredScripts.map((script) => (
                    <button
                      key={script.id}
                      onClick={() => setSelectedScript(script)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        selectedScript.id === script.id
                          ? 'bg-green-50 border-2 border-green-200 shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-medium text-gray-900 text-sm leading-tight">
                        {script.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        por {script.author}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-lg shadow-md p-8">
            {/* Script Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedScript.title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {selectedScript.description}
              </p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Autor: {selectedScript.author}</span>
                </span>
              </div>
            </div>

            {/* Code Block */}
            <div className="relative">
              <div className="bg-slate-900 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300 text-sm font-medium ml-4">
                      {selectedScript.title.toLowerCase().replace(/\s+/g, '-')}.rsc
                    </span>
                  </div>
                  
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 text-sm font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                    <code>{selectedScript.code}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Nota Importante</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Siempre realiza una copia de seguridad de tu configuración antes de aplicar cualquier script. 
                    Prueba en un entorno de desarrollo cuando sea posible.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}