
import React, { useMemo, useState, useEffect } from 'react';
import { Appointment, Clinic, AppointmentStatus, AppointmentSource, Doctor, DoctorSchedule } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface AdminDashboardProps {
  appointments: Appointment[];
  clinics: Clinic[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onReceiveIncomingBooking?: (apt: Appointment) => void;
  onUpdateClinics?: (clinics: Clinic[]) => void;
}

const DEFAULT_SCHEDULES: DoctorSchedule[] = [
  { day: 'Monday', enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
  { day: 'Tuesday', enabled: true, slots: [{ start: '10:00', end: '15:00' }] },
  { day: 'Wednesday', enabled: true, slots: [{ start: '09:00', end: '13:00' }] },
  { day: 'Thursday', enabled: false, slots: [] },
  { day: 'Friday', enabled: true, slots: [{ start: '09:00', end: '12:00' }] },
  { day: 'Saturday', enabled: false, slots: [] },
  { day: 'Sunday', enabled: false, slots: [] },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ appointments, clinics, onUpdateStatus, onReceiveIncomingBooking, onUpdateClinics }) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [clinicFilter, setClinicFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INTEGRATION' | 'CLINICS' | 'DOCTORS'>('OVERVIEW');
  const [showToast, setShowToast] = useState(false);
  const [lastNotification, setLastNotification] = useState<string>('');

  // CRUD States
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<{ doctor: Doctor, clinicId: string } | null>(null);
  const [selectedDoctorClinicId, setSelectedDoctorClinicId] = useState<string>(clinics[0]?.id || '');

  const stats = useMemo(() => {
    return clinics.map(c => ({
      name: c.name.split(' ')[0],
      count: appointments.filter(a => a.clinicId === c.id).length,
    }));
  }, [appointments, clinics]);

  const statusData = useMemo(() => {
    const statuses = Object.values(AppointmentStatus);
    return statuses.map(s => ({
      name: s,
      value: appointments.filter(a => a.status === s).length
    }));
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      const matchesClinic = clinicFilter === 'All' || a.clinicId === clinicFilter;
      const matchesSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            a.patientPhone.includes(searchTerm);
      return matchesStatus && matchesClinic && matchesSearch;
    });
  }, [appointments, statusFilter, clinicFilter, searchTerm]);

  const simulateIncomingWhatsApp = () => {
    if (!onReceiveIncomingBooking) return;
    const randomClinic = clinics[Math.floor(Math.random() * clinics.length)];
    const randomDoctor = randomClinic.doctors[Math.floor(Math.random() * randomClinic.doctors.length)];
    const names = ['Michael Scott', 'Dwight Schrute', 'Pam Beesly', 'Jim Halpert', 'Angela Martin'];
    const name = names[Math.floor(Math.random() * names.length)];
    const phone = `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;

    const newApt: Appointment = {
      id: 'wa-' + Math.random().toString(36).substr(2, 9),
      clinicId: randomClinic.id,
      doctorId: randomDoctor.id,
      patientName: name,
      patientPhone: phone,
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '11:30 AM',
      status: AppointmentStatus.PENDING,
      reason: 'Urgent consult via WhatsApp Cloud API',
      createdAt: Date.now(),
      source: 'WHATSAPP'
    };

    onReceiveIncomingBooking(newApt);
    setLastNotification(`New WhatsApp booking from ${name}!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const CHART_COLORS = ['#2e9e8f', '#1a4a4d', '#47b3a7', '#a3d9d3'];

  // Clinic Management Logic
  const handleSaveClinic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clinicData: Clinic = {
      id: editingClinic?.id || 'c-' + Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      image: formData.get('image') as string,
      location: formData.get('location') as string,
      specialty: formData.get('specialty') as string,
      rating: editingClinic?.rating || 4.5,
      reviews: editingClinic?.reviews || 0,
      doctors: editingClinic?.doctors || [],
      staff: editingClinic?.staff || [],
    };

    if (editingClinic) {
      onUpdateClinics?.(clinics.map(c => c.id === editingClinic.id ? clinicData : c));
    } else {
      onUpdateClinics?.([...clinics, clinicData]);
    }
    setIsClinicModalOpen(false);
    setEditingClinic(null);
  };

  const handleDeleteClinic = (id: string) => {
    if (confirm('Are you sure you want to delete this clinic? All associated data will be removed.')) {
      onUpdateClinics?.(clinics.filter(c => c.id !== id));
    }
  };

  // Doctor Management Logic
  const handleSaveDoctor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const targetClinicId = formData.get('clinicId') as string;
    
    const doctorData: Doctor = {
      id: editingDoctor?.doctor.id || 'd-' + Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      specialty: formData.get('specialty') as string,
      avatar: formData.get('avatar') as string,
      availability: editingDoctor?.doctor.availability || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      schedules: editingDoctor?.doctor.schedules || DEFAULT_SCHEDULES,
    };

    const newClinics = clinics.map(c => {
      // Remove doctor from old clinic if clinic changed
      if (editingDoctor && editingDoctor.clinicId !== targetClinicId && c.id === editingDoctor.clinicId) {
        return { ...c, doctors: c.doctors.filter(d => d.id !== doctorData.id) };
      }
      // Update existing or add new to target clinic
      if (c.id === targetClinicId) {
        const alreadyInTarget = c.doctors.find(d => d.id === doctorData.id);
        if (alreadyInTarget) {
          return { ...c, doctors: c.doctors.map(d => d.id === doctorData.id ? doctorData : d) };
        } else {
          return { ...c, doctors: [...c.doctors, doctorData] };
        }
      }
      return c;
    });

    onUpdateClinics?.(newClinics);
    setIsDoctorModalOpen(false);
    setEditingDoctor(null);
  };

  const handleDeleteDoctor = (clinicId: string, doctorId: string) => {
    if (confirm('Are you sure you want to remove this doctor from the clinic?')) {
      onUpdateClinics?.(clinics.map(c => c.id === clinicId ? { ...c, doctors: c.doctors.filter(d => d.id !== doctorId) } : c));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-8 right-8 z-[100] bg-ecura-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-8 fade-in">
          <div className="bg-white/20 p-2 rounded-xl">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.584 3.914 1.574 5.43l-.973 3.535 3.633-.954zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          </div>
          <div>
            <p className="font-black text-sm">Real-time Sync Active</p>
            <p className="text-xs text-ecura-50">{lastNotification}</p>
          </div>
          <button onClick={() => setShowToast(false)} className="ml-4 text-white/50 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8 mb-4">
        {['OVERVIEW', 'CLINICS', 'DOCTORS', 'INTEGRATION'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-sm font-bold tracking-tight transition-all relative ${activeTab === tab ? 'text-ecura-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-ecura-500 rounded-t-full"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <>
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-navy tracking-tight">System Analytics</h1>
              <p className="text-slate-500">Global overview of multi-vendor operations</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 min-w-[160px]">
                <div className="w-12 h-12 bg-ecura-50 rounded-2xl flex items-center justify-center text-ecura-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-800">{appointments.length}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 min-w-[160px]">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.584 3.914 1.574 5.43l-.973 3.535 3.633-.954zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">WhatsApp</p>
                  <p className="text-2xl font-bold text-emerald-500">{appointments.filter(a => a.source === 'WHATSAPP').length}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-brand-navy mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-ecura-500 rounded-full"></span>
                Appointments by Clinic
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#2e9e8f" radius={[8, 8, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-brand-navy mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-ecura-700 rounded-full"></span>
                Status Breakdown
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8">
            <div className="p-8 border-b border-slate-50">
               <h3 className="text-xl font-bold text-brand-navy mb-4">Patient Queue Management</h3>
               <div className="flex flex-wrap gap-4">
                  <div className="relative flex-1 max-w-md">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                      type="text" 
                      placeholder="Find patient..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-ecura-100 w-full outline-none"
                    />
                  </div>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-ecura-100 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    {Object.values(AppointmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-8 py-4">Source</th>
                    <th className="px-8 py-4">Patient</th>
                    <th className="px-8 py-4">Medical Vendor</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                         {apt.source === 'WHATSAPP' ? (
                           <div className="w-8 h-8 bg-whatsapp-light text-white rounded-lg flex items-center justify-center shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.584 3.914 1.574 5.43l-.973 3.535 3.633-.954zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg></div>
                         ) : (
                           <div className="w-8 h-8 bg-ecura-500 text-white rounded-lg flex items-center justify-center shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg></div>
                         )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800">{apt.patientName}</div>
                        <div className="text-xs text-slate-400 font-medium">{apt.patientPhone}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-brand-navy">{clinics.find(c => c.id === apt.clinicId)?.name}</div>
                        <div className="text-[10px] text-ecura-600 font-bold uppercase tracking-tight">{clinics.find(c => c.id === apt.clinicId)?.doctors.find(d => d.id === apt.doctorId)?.name}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          apt.status === AppointmentStatus.CONFIRMED ? 'bg-ecura-50 text-ecura-700 border-ecura-100' : 
                          apt.status === AppointmentStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => onUpdateStatus(apt.id, AppointmentStatus.CONFIRMED)} 
                              className="text-ecura-600 hover:text-white hover:bg-ecura-600 border border-ecura-600 px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-all"
                            >
                              Verify
                            </button>
                            <button 
                              onClick={() => onUpdateStatus(apt.id, AppointmentStatus.CANCELLED)} 
                              className="text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-600 px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-all"
                            >
                              Cancel
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'CLINICS' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-brand-navy">Clinic Directory</h2>
              <button 
                onClick={() => { setEditingClinic(null); setIsClinicModalOpen(true); }}
                className="bg-ecura-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-ecura-100 hover:bg-ecura-600 transition-all active:scale-95"
              >
                Add New Clinic
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.map(clinic => (
                <div key={clinic.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                   <div className="h-40 relative">
                      <img src={clinic.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => { setEditingClinic(clinic); setIsClinicModalOpen(true); }}
                          className="bg-white/90 p-2 rounded-xl text-ecura-600 shadow-sm"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                         </button>
                         <button 
                          onClick={() => handleDeleteClinic(clinic.id)}
                          className="bg-white/90 p-2 rounded-xl text-rose-600 shadow-sm"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                   </div>
                   <div className="p-6">
                      <h3 className="font-bold text-brand-navy text-lg mb-1">{clinic.name}</h3>
                      <p className="text-xs text-ecura-600 font-bold mb-3">{clinic.specialty}</p>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                         <span>{clinic.doctors.length} Doctors</span>
                         <span>{clinic.staff.length} Staff</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'DOCTORS' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-brand-navy">Staff Directory</h2>
              <div className="flex gap-4">
                 <select 
                  value={selectedDoctorClinicId}
                  onChange={(e) => setSelectedDoctorClinicId(e.target.value)}
                  className="bg-white border-none rounded-xl px-4 py-2 text-sm font-bold shadow-sm outline-none ring-1 ring-slate-200"
                 >
                   {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
                 <button 
                  onClick={() => { setEditingDoctor(null); setIsDoctorModalOpen(true); }}
                  className="bg-ecura-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-ecura-100 hover:bg-ecura-600 transition-all active:scale-95"
                 >
                  Add Doctor
                 </button>
              </div>
           </div>
           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                       <th className="px-8 py-4">Identity</th>
                       <th className="px-8 py-4">Specialization</th>
                       <th className="px-8 py-4">Assigned Clinic</th>
                       <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {clinics.find(c => c.id === selectedDoctorClinicId)?.doctors.map(dr => (
                      <tr key={dr.id} className="group hover:bg-slate-50 transition-colors">
                         <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                               <img src={dr.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                               <span className="font-bold text-brand-navy">{dr.name}</span>
                            </div>
                         </td>
                         <td className="px-8 py-4 text-sm font-medium text-ecura-700">{dr.specialty}</td>
                         <td className="px-8 py-4 text-xs font-bold text-slate-400">{clinics.find(c => c.id === selectedDoctorClinicId)?.name}</td>
                         <td className="px-8 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex justify-end gap-2">
                               <button onClick={() => { setEditingDoctor({ doctor: dr, clinicId: selectedDoctorClinicId }); setIsDoctorModalOpen(true); }} className="text-ecura-600 p-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                               <button onClick={() => handleDeleteDoctor(selectedDoctorClinicId, dr.id)} className="text-rose-600 p-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Clinic Modal */}
      {isClinicModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black text-brand-navy mb-6">{editingClinic ? 'Edit Clinic Profile' : 'New Vendor Registration'}</h3>
              <form onSubmit={handleSaveClinic} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Clinic Name</label>
                  <input name="name" defaultValue={editingClinic?.name} required className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Specialty Domain</label>
                  <input name="specialty" defaultValue={editingClinic?.specialty} required className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Physical Address</label>
                  <input name="location" defaultValue={editingClinic?.location} required className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Banner Image URL</label>
                  <input name="image" defaultValue={editingClinic?.image} required className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsClinicModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 font-bold text-slate-600">Cancel</button>
                   <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-ecura-500 font-bold text-white shadow-xl shadow-ecura-200">Save Clinic</button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Doctor Modal */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black text-brand-navy mb-6">{editingDoctor ? 'Update Medical Staff' : 'Add Medical Staff'}</h3>
              <form onSubmit={handleSaveDoctor} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Assign to Clinic</label>
                  <select name="clinicId" defaultValue={editingDoctor?.clinicId || selectedDoctorClinicId} className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none">
                     {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Practitioner Name</label>
                  <input name="name" defaultValue={editingDoctor?.doctor.name} required className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Specialty</label>
                  <input name="specialty" defaultValue={editingDoctor?.doctor.specialty} required className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Avatar Image URL</label>
                  <input name="avatar" defaultValue={editingDoctor?.doctor.avatar} required className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsDoctorModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 font-bold text-slate-600">Cancel</button>
                   <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-ecura-500 font-bold text-white shadow-xl shadow-ecura-200">Confirm Staff</button>
                </div>
              </form>
           </div>
        </div>
      )}

      {activeTab === 'INTEGRATION' && (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-ecura-50 text-ecura-600 rounded-3xl flex items-center justify-center shadow-inner">
               <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.584 3.914 1.574 5.43l-.973 3.535 3.633-.954zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-brand-navy">API Connectivity</h2>
              <p className="text-slate-500">Configure global WhatsApp Cloud API settings for all clinic nodes.</p>
            </div>
          </div>
          <div className="bg-brand-navy rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-ecura-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <div className="flex-1 space-y-4 z-10">
                <h4 className="text-ecura-400 font-black uppercase text-xs tracking-widest">Global Pabbly Webhook</h4>
                <div className="bg-black/20 p-5 rounded-2xl border border-white/10 font-mono text-sm break-all">
                  https://ecura-connect.cloud/webhooks/whatsapp/receive-pabbly-v1
                </div>
                <button className="bg-ecura-500 hover:bg-ecura-400 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-ecura-900/40">Copy Webhook Link</button>
             </div>
             <button onClick={simulateIncomingWhatsApp} className="bg-whatsapp-light hover:scale-105 transition-transform text-white font-black py-8 px-12 rounded-[3rem] shadow-xl flex flex-col items-center gap-3 z-10">
                <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.584 3.914 1.574 5.43l-.973 3.535 3.633-.954zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                <span>Trigger Test Message</span>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
