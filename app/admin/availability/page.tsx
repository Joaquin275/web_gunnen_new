export default function AdminAvailabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-light">Disponibilidad</h1>
        <p className="text-gray-500 mt-1">Gestiona los turnos y horarios de reserva</p>
      </div>

      <div className="bg-white border border-gray-200 p-8 space-y-8">
        {/* Horario actual */}
        <div>
          <h2 className="text-lg font-serif font-light mb-4 pb-2 border-b border-gray-100">Horario actual</h2>
          <div className="space-y-3 text-sm">
            {[
              { dia: "Lunes", turno: "—", cerrado: true },
              { dia: "Martes", turno: "13:00 – 15:00", cerrado: false },
              { dia: "Miércoles", turno: "13:00 – 15:00", cerrado: false },
              { dia: "Jueves", turno: "13:00 – 15:00 · 20:00 – 23:00", cerrado: false },
              { dia: "Viernes", turno: "13:00 – 15:00 · 20:00 – 23:00", cerrado: false },
              { dia: "Sábado", turno: "13:00 – 15:00 · 20:00 – 23:00", cerrado: false },
              { dia: "Domingo", turno: "—", cerrado: true },
            ].map((item) => (
              <div key={item.dia} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="font-medium w-28">{item.dia}</span>
                <span className={item.cerrado ? "text-gray-400 italic" : "text-gray-700"}>{item.cerrado ? "Cerrado" : item.turno}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Capacidad */}
        <div>
          <h2 className="text-lg font-serif font-light mb-4 pb-2 border-b border-gray-100">Capacidad</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Mesas disponibles", value: "3" },
              { label: "Personas por mesa (máx)", value: "8" },
              { label: "Comensales totales (máx)", value: "24" },
              { label: "Señal por persona", value: "30%" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 p-4">
                <p className="text-2xl font-serif font-light mb-1">{item.value}</p>
                <p className="text-xs tracking-wider uppercase text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          La configuración dinámica de turnos estará disponible cuando se conecte la base de datos PostgreSQL. 
          Actualmente los horarios se gestionan en el archivo <code className="font-mono bg-amber-100 px-1">app/api/availability/timeslots/route.ts</code>
        </div>
      </div>
    </div>
  );
}
