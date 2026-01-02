
import React, { useState, useEffect } from 'react';
import { MOCK_CLINICS, INITIAL_APPOINTMENTS, INITIAL_VISITS } from './constants';
import { Appointment, Clinic, AppointmentStatus, VisitRecord, DoctorSchedule, Staff } from './types';
import Sidebar, { AppView } from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import ClinicPortal from './components/ClinicPortal';
import WhatsAppWidget from './components/WhatsAppWidget';
import DoctorPanel from './components/DoctorPanel';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('USER_BROWSE');
  const [clinics, setClinics] = useState<Clinic[]>(MOCK_CLINICS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [visits, setVisits] = useState<VisitRecord[]>(INITIAL_VISITS);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  // For Demo: Assume we are Dr. Sarah Smith (d1) from Evergreen Family Clinic (c1)
  const currentDr = clinics[0].doctors[0];
  const currentClinic = clinics[0];

  const handleNewBooking = (newAppointment: Appointment) => {
    setAppointments(prev => [newAppointment, ...prev]);
  };

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleUpdateDoctorSchedules = (newSchedules: DoctorSchedule[]) => {
    setClinics(prev => prev.map(c => ({
      ...c,
      doctors: c.doctors.map(d => d.id === currentDr.id ? { ...d, schedules: newSchedules } : d)
    })));
  };

  const handleAddVisit = (newVisit: Omit<VisitRecord, 'id'>) => {
    const visit: VisitRecord = {
      ...newVisit,
      id: 'v-' + Math.random().toString(36).substr(2, 9)
    };
    setVisits(prev => [visit, ...prev]);
  };

  const handleUpdateClinics = (newClinics: Clinic[]) => {
    setClinics(newClinics);
  };

  const handleUpdateStaff = (newStaff: Staff[]) => {
    setClinics(prev => prev.map(c => c.id === currentClinic.id ? { ...c, staff: newStaff } : c));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentView={view} setView={setView} />

      <main className="flex-1 transition-all duration-300">
        <div className="p-4 md:p-8">
          {view === 'USER_BROWSE' && (
            <ClinicPortal 
              clinics={clinics} 
              onSelectClinic={(c) => setSelectedClinic(c)} 
            />
          )}
          {view === 'ADMIN_DASHBOARD' && (
            <AdminDashboard 
              appointments={appointments} 
              clinics={clinics}
              onUpdateStatus={handleUpdateStatus}
              onReceiveIncomingBooking={handleNewBooking}
              onUpdateClinics={handleUpdateClinics}
            />
          )}
          {(view.startsWith('DR_')) && (
            <DoctorPanel 
              view={view.split('_')[1] as any}
              appointments={appointments}
              clinic={currentClinic}
              doctor={currentDr}
              visits={visits}
              onUpdateAppointment={handleUpdateStatus}
              onUpdateSchedules={handleUpdateDoctorSchedules}
              onAddVisit={handleAddVisit}
              onUpdateStaff={handleUpdateStaff}
            />
          )}
        </div>
      </main>

      <WhatsAppWidget 
        selectedClinic={selectedClinic} 
        onBooked={handleNewBooking}
        onClose={() => setSelectedClinic(null)}
      />
    </div>
  );
};

export default App;
