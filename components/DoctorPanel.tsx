
import React, { useMemo, useState } from 'react';
import { Appointment, Clinic, AppointmentStatus, VisitRecord, DoctorSchedule, TimeRange, Doctor, Staff, StaffRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

interface DoctorPanelProps {
  view: 'DASHBOARD' | 'APPOINTMENTS' | 'SCHEDULES' | 'VISITS' | 'STAFF';
  appointments: Appointment[];
  clinic: Clinic;
  doctor: Doctor;
  visits: VisitRecord[];
  onUpdateAppointment: (id: string, status: AppointmentStatus) => void;
  onUpdateSchedules: (schedules: DoctorSchedule[]) => void;
  onAddVisit: (visit: Omit<VisitRecord, 'id'>) => void;
  onUpdateStaff: (staff: Staff[]) => void;
}

const DoctorPanel: React.FC<DoctorPanelProps> = ({ 
  view, appointments, clinic, doctor, visits, onUpdateAppointment, onUpdateSchedules, onAddVisit, onUpdateStaff 
}) => {
  const [activeDateRange, setActiveDateRange] = useState<'DAY' | 'WEEK' | 'MONTH'>('DAY');
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState<{ day: string } | null>(null);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const myAppointments = useMemo(() => 
    appointments.filter(a => a.doctorId === doctor.id), 
  [appointments, doctor.id]);

  const todayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return myAppointments.filter(a => a.date === todayStr).length;
  }, [myAppointments]);

  const recentVisits = useMemo(() => visits.filter(v => v.doctorId === doctor.id), [visits, doctor.id]);

  const handleSaveStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const staffData: Staff = {
      id: editingStaff?.id || 's-' + Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      role: formData.get('role') as StaffRole,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      avatar: formData.get('avatar') as string || `https://i.pravatar.cc/150?u=${Math.random()}`,
    };

    if (editingStaff) {
      onUpdateStaff(clinic.staff.map(s => s.id === editingStaff.id ? staffData : s));
    } else {
      onUpdateStaff([...clinic.staff, staffData]);
    }
    setShowStaffModal(false);
    setEditingStaff(null);
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      onUpdateStaff(clinic.staff.filter(s => s.id !== id));
    }
  };

  const handleAddShift = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showShiftModal) return;
    
    const formData = new FormData(e.currentTarget);
    const start = formData.get('start') as string;
    const end = formData.get('end') as string;

    if (!start || !end) return;

    const newSchedules = doctor.schedules.map(s => {
      if (s.day === showShiftModal.day) {
        return { ...s, slots: [...s.slots, { start, end }] };
      }
      return s;
    });
    onUpdateSchedules(newSchedules);
    setShowShiftModal(null);
  };

  const handleDeleteSlot = (day: string, slotIdx: number) => {
    const newSchedules = doctor.schedules.map(s => {
      if (s.day === day) {
        const newSlots = [...s.slots];
        newSlots.splice(slotIdx, 1);
        return { ...s, slots: newSlots };
      }
      return s;
    });
    onUpdateSchedules(newSchedules);
  };

  const chartData = useMemo(() => {
    return [
      { name: 'Mon', count: 4 },
      { name: 'Tue', count: 7 },
      { name: 'Wed', count: 5 },
      { name: 'Thu', count: 8 },
      { name: 'Fri', count: 3 },
      { name: 'Sat', count: 0 },
      { name: 'Sun', count: 0 },
    ];
  }, []);

  if (view === 'DASHBOARD') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-3xl font-black text-brand-navy tracking-tight">Doctor Workspace</h1>
          <p className="text-slate-500">Manage clinical operations for <span className="text-ecura-600 font-bold">{clinic.name}</span></p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Today's Load</p>
            <p className="text-3xl font-black text-ecura-600">{todayCount}</p>
            <div className="mt-4 flex items-center text-[10px] text-slate-400 font-bold gap-1 bg-slate-50 p-2 rounded-xl">
               <svg className="w-3 h-3 text-ecura-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
               Live Activity
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Clinic Staff</p>
            <p className="text-3xl font-black text-ecura-600">{clinic.staff.length}</p>
            <div className="mt-4 text-[10px] text-brand-navy font-bold px-2 py-1 bg-ecura-50 rounded-lg inline-block">Support Team</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Check-ins</p>
            <p className="text-3xl font-black text-amber-500">
              {myAppointments.filter(a => a.status === AppointmentStatus.CHECKED_IN).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Clinic Rating</p>
            <p className="text-3xl font-black text-brand-navy">{clinic.rating}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold text-brand-navy">Weekly Trends</h3>
                 <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {['DAY', 'WEEK', 'MONTH'].map(r => (
                      <button 
                        key={r}
                        onClick={() => setActiveDateRange(r as any)}
                        className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all ${activeDateRange === r ? 'bg-white text-ecura-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        {r}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorEcura" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2e9e8f" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2e9e8f" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="count" stroke="#2e9e8f" fillOpacity={1} fill="url(#colorEcura)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-brand-navy mb-6">Recent Records</h3>
              <div className="space-y-4">
                 {recentVisits.slice(0, 4).map(v => (
                   <div key={v.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl hover:bg-ecura-50/50 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-ecura-600 border border-slate-100 font-bold uppercase">
                        {v.patientName[0]}
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-bold text-slate-800">{v.patientName}</p>
                         <p className="text-[10px] text-slate-400 line-clamp-1">{v.diagnosis}</p>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">{v.date}</div>
                   </div>
                 ))}
                 {recentVisits.length === 0 && (
                   <div className="py-10 text-center text-slate-300 italic text-sm">No recent visits recorded</div>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (view === 'APPOINTMENTS') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight">Patient Queue</h1>
            <p className="text-slate-500">Live monitoring of your scheduled appointments</p>
          </div>
          <div className="text-xs font-bold text-ecura-600 bg-ecura-50 px-4 py-2 rounded-xl border border-ecura-100">
             Session: Active
          </div>
        </header>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
             <thead>
               <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                 <th className="px-8 py-4">Time</th>
                 <th className="px-8 py-4">Patient</th>
                 <th className="px-8 py-4">Reason</th>
                 <th className="px-8 py-4">Status</th>
                 <th className="px-8 py-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {myAppointments.sort((a,b) => a.time.localeCompare(b.time)).map(apt => (
                 <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                   <td className="px-8 py-5 text-sm font-black text-ecura-600">{apt.time}</td>
                   <td className="px-8 py-5">
                      <div className="font-bold text-slate-800">{apt.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{apt.patientPhone}</div>
                   </td>
                   <td className="px-8 py-5 text-xs text-slate-500 max-w-xs truncate">{apt.reason}</td>
                   <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        apt.status === AppointmentStatus.CHECKED_IN ? 'bg-ecura-100 text-ecura-700' :
                        apt.status === AppointmentStatus.CHECKED_OUT ? 'bg-slate-100 text-slate-400' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                   </td>
                   <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {apt.status !== AppointmentStatus.CHECKED_OUT && (
                          <>
                            {apt.status === AppointmentStatus.CHECKED_IN ? (
                              <button 
                                onClick={() => { setSelectedApt(apt); setShowVisitModal(true); }}
                                className="bg-ecura-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg hover:bg-ecura-600 transition-all shadow-lg shadow-ecura-100"
                              >
                                Finalize Visit
                              </button>
                            ) : (
                              <button 
                                onClick={() => onUpdateAppointment(apt.id, AppointmentStatus.CHECKED_IN)}
                                className="bg-ecura-50 text-ecura-600 text-[10px] font-black uppercase px-4 py-2 rounded-lg hover:bg-ecura-100 transition-all"
                              >
                                Mark Check-in
                              </button>
                            )}
                          </>
                        )}
                        {apt.status === AppointmentStatus.CHECKED_OUT && (
                          <span className="text-xs text-slate-300 font-bold">Closed</span>
                        )}
                      </div>
                   </td>
                 </tr>
               ))}
               {myAppointments.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-300 italic font-medium">No appointments found for today</td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>

        {showVisitModal && selectedApt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm">
             <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <h3 className="text-2xl font-black text-brand-navy mb-6">Create Visit Record</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  onAddVisit({
                    appointmentId: selectedApt.id,
                    patientName: selectedApt.patientName,
                    patientPhone: selectedApt.patientPhone,
                    doctorId: doctor.id,
                    clinicId: clinic.id,
                    date: new Date().toISOString().split('T')[0],
                    diagnosis: formData.get('diagnosis') as string,
                    notes: formData.get('notes') as string,
                    treatment: formData.get('treatment') as string,
                    vitals: { bp: formData.get('bp') as string, weight: formData.get('weight') as string, temp: formData.get('temp') as string }
                  });
                  onUpdateAppointment(selectedApt.id, AppointmentStatus.CHECKED_OUT);
                  setShowVisitModal(false);
                }} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <input name="bp" placeholder="BP (120/80)" className="bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                    <input name="weight" placeholder="Weight (kg)" className="bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                    <input name="temp" placeholder="Temp (C)" className="bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                  </div>
                  <input name="diagnosis" placeholder="Diagnosis" required className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                  <textarea name="treatment" placeholder="Treatment Plan" rows={2} className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none resize-none" />
                  <textarea name="notes" placeholder="Clinical Notes" rows={2} className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none resize-none" />
                  <div className="flex gap-4 pt-4">
                     <button type="button" onClick={() => setShowVisitModal(false)} className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
                     <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-ecura-500 font-bold text-white shadow-xl shadow-ecura-200 hover:bg-ecura-600">Complete Visit</button>
                  </div>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'SCHEDULES') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <h1 className="text-3xl font-black text-brand-navy tracking-tight">Availability Center</h1>
          <p className="text-slate-500">Manage your granular working shifts across the week</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {doctor.schedules.map((sched, idx) => (
             <div key={sched.day} className={`p-6 rounded-3xl border transition-all ${sched.enabled ? 'bg-white border-ecura-100 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}>
                <div className="flex items-center justify-between mb-6">
                   <h4 className={`font-black uppercase tracking-wider text-sm ${sched.enabled ? 'text-ecura-600' : 'text-slate-400'}`}>{sched.day}</h4>
                   <button 
                    onClick={() => {
                      const newScheds = [...doctor.schedules];
                      newScheds[idx].enabled = !newScheds[idx].enabled;
                      onUpdateSchedules(newScheds);
                    }}
                    className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all ${sched.enabled ? 'bg-rose-50 text-rose-600' : 'bg-ecura-500 text-white'}`}
                   >
                     {sched.enabled ? 'Disable' : 'Enable'}
                   </button>
                </div>
                {sched.enabled && (
                  <div className="space-y-3">
                     {sched.slots.map((slot, sIdx) => (
                        <div key={sIdx} className="bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between border border-slate-100">
                           <span>{slot.start} — {slot.end}</span>
                           <button onClick={() => handleDeleteSlot(sched.day, sIdx)} className="text-slate-300 hover:text-rose-500 transition-colors">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                     ))}
                     <button 
                      onClick={() => setShowShiftModal({ day: sched.day })}
                      className="w-full border-2 border-dashed border-ecura-100 rounded-xl py-3 text-[10px] font-black text-ecura-400 hover:border-ecura-300 hover:text-ecura-600 transition-all uppercase tracking-widest"
                     >
                       + Add Shift Slot
                     </button>
                  </div>
                )}
                {!sched.enabled && (
                  <div className="h-24 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Clinic Off-Day</div>
                )}
             </div>
           ))}
        </div>

        {showShiftModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy/70 backdrop-blur-sm">
             <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <h3 className="text-xl font-black text-brand-navy mb-6">Add Slot for {showShiftModal.day}</h3>
                <form onSubmit={handleAddShift} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block px-1">Start Time</label>
                      <input name="start" type="time" required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block px-1">End Time</label>
                      <input name="end" type="time" required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowShiftModal(null)} className="flex-1 px-6 py-3 rounded-xl bg-slate-100 font-bold text-slate-500">Cancel</button>
                    <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-ecura-500 font-bold text-white shadow-lg shadow-ecura-100">Add Slot</button>
                  </div>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'VISITS') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <h1 className="text-3xl font-black text-brand-navy tracking-tight">Visit Archive</h1>
          <p className="text-slate-500">Complete medical history for your patients</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {recentVisits.map(visit => (
             <div key={visit.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                   <div className="text-[10px] font-black text-ecura-500 uppercase tracking-widest bg-ecura-50 px-3 py-1.5 rounded-xl border border-ecura-100">{visit.date}</div>
                </div>
                <h4 className="text-lg font-black text-brand-navy mb-1">{visit.patientName}</h4>
                <p className="text-xs text-slate-400 mb-6">{visit.patientPhone}</p>
                
                <div className="grid grid-cols-3 gap-2 mb-6">
                   <div className="text-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">BP</p>
                      <p className="text-[10px] font-black text-ecura-600">{visit.vitals?.bp || 'N/A'}</p>
                   </div>
                   <div className="text-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Weight</p>
                      <p className="text-[10px] font-black text-ecura-600">{visit.vitals?.weight || 'N/A'}</p>
                   </div>
                   <div className="text-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Temp</p>
                      <p className="text-[10px] font-black text-ecura-600">{visit.vitals?.temp || 'N/A'}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="p-4 bg-ecura-50/30 rounded-2xl border border-ecura-50">
                      <p className="text-[10px] font-black text-ecura-700 uppercase tracking-widest mb-1">Diagnosis</p>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">{visit.diagnosis}</p>
                   </div>
                   <div className="px-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinical Plan</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 italic">"{visit.treatment}"</p>
                   </div>
                </div>
             </div>
           ))}
           {recentVisits.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-300 italic text-lg font-medium">Archive is currently empty</div>
           )}
        </div>
      </div>
    );
  }

  if (view === 'STAFF') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight">Clinical Support</h1>
            <p className="text-slate-500">Enroll and manage your support team members</p>
          </div>
          <button 
            onClick={() => { setEditingStaff(null); setShowStaffModal(true); }}
            className="bg-ecura-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-ecura-100 hover:bg-ecura-600 transition-all active:scale-95"
          >
            Enroll New Staff
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinic.staff.map(s => (
            <div key={s.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                 <img src={s.avatar} className="w-16 h-16 rounded-2xl object-cover border-4 border-slate-50 shadow-sm" alt="" />
                 <div>
                    <h4 className="font-black text-brand-navy leading-tight">{s.name}</h4>
                    <span className="text-[9px] font-black text-ecura-600 uppercase tracking-widest px-2 py-1 bg-ecura-50 rounded-lg mt-1 inline-block border border-ecura-100">{s.role.replace('_', ' ')}</span>
                 </div>
              </div>
              <div className="space-y-2 text-xs font-medium text-slate-500 mb-6 px-1">
                 <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-ecura-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {s.email}
                 </div>
                 <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-ecura-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {s.phone}
                 </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => { setEditingStaff(s); setShowStaffModal(true); }} className="flex-1 text-[10px] font-black uppercase text-ecura-600 bg-ecura-50 py-2 rounded-xl hover:bg-ecura-100">Edit Profile</button>
                 <button onClick={() => handleDeleteStaff(s.id)} className="flex-1 text-[10px] font-black uppercase text-rose-600 bg-rose-50 py-2 rounded-xl hover:bg-rose-100">Release</button>
              </div>
            </div>
          ))}
          {clinic.staff.length === 0 && (
             <div className="col-span-full py-20 text-center text-slate-300 italic font-medium">No personnel enrolled yet</div>
          )}
        </div>

        {showStaffModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy/70 backdrop-blur-sm">
             <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <h3 className="text-2xl font-black text-brand-navy mb-6">{editingStaff ? 'Modify Profile' : 'Staff Enrollment'}</h3>
                <form onSubmit={handleSaveStaff} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block px-1">Staff Role</label>
                    <select name="role" defaultValue={editingStaff?.role} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-ecura-500 outline-none">
                       <option value="NURSE">Nurse</option>
                       <option value="RECEPTIONIST">Receptionist</option>
                       <option value="ADMIN_ASSISTANT">Admin Assistant</option>
                    </select>
                  </div>
                  <input name="name" defaultValue={editingStaff?.name} placeholder="Full Name" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="email" type="email" defaultValue={editingStaff?.email} placeholder="Email" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                    <input name="phone" defaultValue={editingStaff?.phone} placeholder="Phone" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                  </div>
                  <input name="avatar" defaultValue={editingStaff?.avatar} placeholder="Avatar Image URL (Optional)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-ecura-500 outline-none" />
                  <div className="flex gap-4 pt-6">
                     <button type="button" onClick={() => setShowStaffModal(false)} className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 font-bold text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                     <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-ecura-500 font-bold text-white shadow-xl shadow-ecura-200 hover:bg-ecura-600 transition-all">Enroll Staff</button>
                  </div>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default DoctorPanel;
