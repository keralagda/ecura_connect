
import React, { useState, useEffect, useRef } from 'react';
import { Clinic, Appointment, AppointmentStatus, Message } from '../types';
import { processChat } from '../services/geminiService';
import { sendBookingToPabbly } from '../services/pabblyService';

interface WhatsAppWidgetProps {
  selectedClinic: Clinic | null;
  onBooked: (appointment: Appointment) => void;
  onClose: () => void;
}

const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ selectedClinic, onBooked, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedClinic) {
      setIsOpen(true);
      const welcomeMsg: Message = {
        id: 'welcome',
        sender: 'bot',
        text: `Hi! Welcome to *${selectedClinic.name}*. I'm your AI health assistant. How can I help you book your appointment today?`,
        timestamp: Date.now(),
        status: 'read'
      };
      setMessages([welcomeMsg]);
    }
  }, [selectedClinic]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isSyncing]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim() || !selectedClinic) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'delivered' } : m));
    }, 800);
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' } : m));
    }, 1500);

    const clinicContext = `
      Clinic Name: ${selectedClinic.name}
      Location: ${selectedClinic.location}
      Available Doctors: ${selectedClinic.doctors.map(d => `${d.name} (Specialty: ${d.specialty}, Available: ${d.availability.join(', ')})`).join('; ')}
      Rating: ${selectedClinic.rating} stars
    `;

    const response = await processChat(
      messages.concat(userMsg).map(m => ({ sender: m.sender, text: m.text })),
      clinicContext
    );

    setIsTyping(false);

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      if (call.name === 'bookAppointment') {
        const args = call.args as any;
        const newApt: Appointment = {
          id: 'apt-' + Math.random().toString(36).substr(2, 9),
          clinicId: selectedClinic.id,
          doctorId: args.doctorId,
          patientName: args.patientName,
          patientPhone: args.patientPhone,
          date: args.date,
          time: args.time,
          status: AppointmentStatus.PENDING,
          reason: args.reason || 'General Checkup',
          createdAt: Date.now(),
          source: 'WEB' // Tagging as web source
        };
        
        onBooked(newApt);
        
        setIsSyncing(true);
        const pabblyResult = await sendBookingToPabbly(newApt, selectedClinic);
        setIsSyncing(false);
        
        setMessages(prev => [...prev, {
          id: Date.now() + 'c',
          sender: 'bot',
          text: `✅ *Appointment Registered!* 
          \nPatient: ${args.patientName}
          \nDate: ${args.date} at ${args.time}
          \n${pabblyResult.success ? "_WhatsApp notification sent via Pabbly Connect._" : "_Local booking saved. Manual follow-up may be required._"}
          \nOur team will review your request and confirm shortly.`,
          timestamp: Date.now()
        }]);
      }
    } else {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: response.text,
        timestamp: Date.now()
      }]);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        handleSendMessage("I'd like to book an appointment for next Monday with Dr. Smith please.");
      }, 3000);
    }
  };

  if (!isOpen && !selectedClinic) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-90 pointer-events-none'}`}>
      <div className="w-80 md:w-[380px] bg-slate-50 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200/50 flex flex-col h-[600px] backdrop-blur-sm">
        {/* Header */}
        <div className="bg-[#075e54] p-5 flex items-center justify-between text-white relative shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 p-0.5 relative">
              <img src={selectedClinic?.image} alt="Clinic" className="w-full h-full rounded-full object-cover border border-white/40 shadow-inner" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075e54] rounded-full"></span>
            </div>
            <div>
              <p className="font-black text-base leading-tight tracking-tight">{selectedClinic?.name || 'WhatsApp Assistant'}</p>
              <p className="text-[11px] font-medium text-emerald-100/80 flex items-center gap-1.5 mt-0.5">
                online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => { setIsOpen(false); onClose(); }} className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efe7de]"
          style={{ 
            backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', 
            backgroundSize: '400px', 
            backgroundBlendMode: 'multiply',
            backgroundColor: '#e5ddd5'
          }}
        >
          <div className="flex justify-center mb-6">
            <span className="bg-[#d1eaeb] text-[#1c2d35] text-[10px] font-bold px-3 py-1 rounded-lg shadow-sm uppercase tracking-widest">Today</span>
          </div>

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div 
                className={`max-w-[85%] px-3.5 py-2 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-sm relative group ${
                  msg.sender === 'user' 
                    ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.sender === 'user' && (
                    <span className={msg.status === 'read' ? 'text-sky-500' : 'text-slate-300'}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isSyncing && (
            <div className="flex justify-center">
              <span className="bg-white/80 backdrop-blur-sm text-[10px] font-bold text-indigo-600 px-3 py-1 rounded-full shadow-sm animate-pulse flex items-center gap-2">
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeWidth="3" strokeLinecap="round"/></svg>
                Syncing with WhatsApp Service...
              </span>
            </div>
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#f0f2f5] flex items-center gap-3">
          <div className="flex-1 bg-white rounded-full flex items-center px-4 py-1 shadow-sm border border-slate-200">
             <button className="text-slate-400 hover:text-slate-600 transition-colors mr-2">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </button>
             <input 
               type="text"
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
               placeholder="Type a message"
               className="flex-1 bg-transparent border-none py-2.5 text-[15px] focus:outline-none placeholder:text-slate-400 text-slate-700"
             />
             <button className="text-slate-400 hover:text-slate-600 transition-colors ml-2">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" /></svg>
             </button>
          </div>
          
          <button 
            onClick={inputValue.trim() ? () => handleSendMessage() : toggleRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg ${
              inputValue.trim() || isRecording ? 'bg-[#128c7e] hover:bg-[#075e54] scale-110' : 'bg-[#128c7e] hover:bg-[#075e54]'
            } ${isRecording ? 'animate-pulse' : ''}`}
          >
            {inputValue.trim() ? (
              <svg className="w-6 h-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            ) : (
              <svg className={`w-6 h-6 transition-colors ${isRecording ? 'text-rose-200' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppWidget;
