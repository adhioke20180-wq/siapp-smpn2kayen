'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, AlertTriangle, BarChart3, 
  FileText, Trash2, ShieldAlert, BookOpen, 
  Plus, Menu, UserCheck, Clipboard, User, Calendar
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Data Utama
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [violationTypes, setViolationTypes] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);

  // State Modal Input Excel & Form
  const [activeModal, setActiveModal] = useState<string | null>(null);
  // 1. Load Data awal dari Cloud Database (Neon)
  useEffect(() => {
    async function loadData() {
      try {
        const [resS, resT, resV] = await Promise.all([
          fetch('/api/student'), // SUDAH DIPERBAIKI (tanpa huruf 's')
          fetch('/api/teachers'),
          fetch('/api/violations')
        ]);

        if (resS.ok) {
          const dataS = await resS.json();
          if (Array.isArray(dataS) && dataS.length > 0) setStudents(dataS);
        }
        if (resT.ok) {
          const dataT = await resT.json();
          if (Array.isArray(dataT) && dataT.length > 0) {
            setTeachers(dataT);
            setSelectedTeacher(dataT[0].name);
          }
        }
        if (resV.ok) {
          const dataV = await resV.json();
          if (Array.isArray(dataV) && dataV.length > 0) setViolations(dataV);
        }
      } catch (err) {
        console.error('Gagal memuat data dari cloud:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  // 2. Simpan Otomatis Siswa ke Cloud
  useEffect(() => {
    if (isLoaded && students.length > 0) {
      fetch('/api/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(students),
      }).catch((err) => console.error('Gagal simpan siswa:', err));
    }
  }, [students, isLoaded]);

  // 3. Simpan Otomatis Pelanggaran ke Cloud
  useEffect(() => {
    if (isLoaded && violations.length > 0) {
      fetch('/api/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(violations),
      }).catch((err) => console.error('Gagal simpan pelanggaran:', err));
    }
  }, [violations, isLoaded]);
  useEffect(() => {
    if (isLoaded && violations.length > 0) {
      fetch('/api/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(violations),
      }).catch((err) => console.error('Gagal simpan pelanggaran:', err));
    }
  }, [violations, isLoaded]);

  // Rekap Kelas
  const uniqueClasses = Array.from(new Set(students.map(s => s.class).filter(Boolean)));

  // Buka Modal Pelanggaran
  const openRecordModal = () => {
    setSingleForm({
      studentId: '',
      vTypeId: '',
      teacherName: selectedTeacher || (teachers.length > 0 ? teachers[0].name : ''),
      date: new Date().toISOString().split('T')[0]
    });
    setActiveModal('record');
  };

  // Import Excel
  const handlePasteSubmit = (type: string) => {
    if (!pasteText.trim()) return;

    const lines = pasteText.trim().split('\n');

    if (type === 'student') {
      const newItems = lines.map((line, idx) => {
        const cols = line.split('\t').map(c => c.trim());
        return {
          id: Date.now().toString() + idx,
          nis: cols[0] || '-',
          name: cols[1] || cols[0] || 'Tanpa Nama',
          class: cols[2] || 'Umum',
          score: 0
        };
      });
      setStudents(prev => [...prev, ...newItems]);
    } 
    else if (type === 'teacher') {
      const newItems = lines.map((line, idx) => {
        const cols = line.split('\t').map(c => c.trim());
        return {
          id: Date.now().toString() + idx,
          name: cols[0] || 'Tanpa Nama',
          subject: cols[1] || '-'
        };
      });
      setTeachers(prev => {
        const updated = [...prev, ...newItems];
        if (!selectedTeacher && updated.length > 0) setSelectedTeacher(updated[0].name);
        return updated;
      });
    } 
    else if (type === 'vtype') {
      const newItems = lines.map((line, idx) => {
        const cols = line.split('\t').map(c => c.trim());
        return {
          id: Date.now().toString() + idx,
          name: cols[0] || 'Pelanggaran',
          points: Number(cols[1]) || 5
        };
      });
      setViolationTypes(prev => [...prev, ...newItems]);
    }

    setPasteText('');
    setActiveModal(null);
  };

  // Simpan Pelanggaran
  const handleRecordViolation = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === singleForm.studentId);
    const vType = violationTypes.find(v => v.id === singleForm.vTypeId);
    if (!student || !vType || !singleForm.teacherName) return;

    const pts = Number(vType.points);
    const record = {
      id: Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      type: vType.name,
      points: pts,
      teacher: singleForm.teacherName,
      date: singleForm.date || new Date().toISOString().split('T')[0]
    };

    setViolations([record, ...violations]);
    setStudents(students.map(s => s.id === student.id ? { ...s, score: (s.score || 0) + pts } : s));
    setSingleForm({});
    setActiveModal(null);
  };

  const topStudents = [...students].sort((a, b) => (b.score || 0) - (a.score || 0));

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* HEADER HP / TABLET */}
      <div className="md:hidden bg-indigo-950 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-400" />
          <div>
            <h1 className="font-bold text-base leading-none">SIAPPS</h1>
            <p className="text-[10px] text-indigo-300">spendaka26.27</p>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1">
          <Menu className="w-6 h-6 text-indigo-200" />
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:flex w-full md:w-64 bg-indigo-950 text-white flex-col justify-between p-4 shadow-xl shrink-0`}>
        <div>
          <div className="hidden md:flex items-center gap-3 px-2 py-4 border-b border-indigo-900 mb-6">
            <ShieldAlert className="w-8 h-8 text-indigo-400" />
            <div>
              <h1 className="font-bold text-xl leading-none tracking-wide">SIAPPS</h1>
              <span className="text-xs text-indigo-300">spendaka26.27</span>
            </div>
          </div>

          <div className="mb-6 bg-indigo-900/60 p-3 rounded-xl border border-indigo-800">
            <label className="block text-[11px] font-semibold text-indigo-300 uppercase mb-1">Guru Pengakses:</label>
            <select 
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full bg-indigo-950 text-white text-xs border border-indigo-700 rounded-lg p-2 focus:outline-none"
            >
              {teachers.length === 0 ? <option value="">Belum ada data guru</option> : null}
              {teachers.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          <nav className="space-y-1">
            <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-indigo-700 text-white shadow-md' : 'text-indigo-200 hover:bg-indigo-900'}`}>
              <BarChart3 className="w-5 h-5" /> Dashboard
            </button>
            <button onClick={() => { setActiveTab('students'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'students' ? 'bg-indigo-700 text-white shadow-md' : 'text-indigo-200 hover:bg-indigo-900'}`}>
              <Users className="w-5 h-5" /> Data Siswa
            </button>
            <button onClick={() => { setActiveTab('teachers'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'teachers' ? 'bg-indigo-700 text-white shadow-md' : 'text-indigo-200 hover:bg-indigo-900'}`}>
              <UserCheck className="w-5 h-5" /> Data Guru
            </button>
            <button onClick={() => { setActiveTab('vtypes'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'vtypes' ? 'bg-indigo-700 text-white shadow-md' : 'text-indigo-200 hover:bg-indigo-900'}`}>
              <AlertTriangle className="w-5 h-5" /> Jenis Pelanggaran
            </button>
            <button onClick={() => { setActiveTab('record'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'record' ? 'bg-indigo-700 text-white shadow-md' : 'text-indigo-200 hover:bg-indigo-900'}`}>
              <FileText className="w-5 h-5" /> Catat Pelanggaran
            </button>
            <button onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'reports' ? 'bg-indigo-700 text-white shadow-md' : 'text-indigo-200 hover:bg-indigo-900'}`}>
              <BarChart3 className="w-5 h-5" /> Laporan Rekap
            </button>
          </nav>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Dashboard Utama</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><BookOpen className="w-8 h-8" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Jumlah Kelas Terdeteksi</p>
                  <p className="text-3xl font-bold text-slate-800">{uniqueClasses.length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Users className="w-8 h-8" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Siswa</p>
                  <p className="text-3xl font-bold text-slate-800">{students.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 text-lg mb-4">Rekap Pelanggaran Per Kelas</h3>
                <div className="space-y-3">
                  {uniqueClasses.length === 0 ? <p className="text-xs text-slate-400 italic">Belum ada data siswa.</p> : null}
                  {uniqueClasses.map((clsName) => {
                    const count = violations.filter(v => v.class === clsName).length;
                    return (
                      <div key={clsName} className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                        <span className="font-medium text-slate-700">{clsName}</span>
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">{count} Kejadian</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 text-lg mb-4">Skor Pelanggaran Tertinggi</h3>
                <div className="space-y-3">
                  {topStudents.length === 0 ? <p className="text-xs text-slate-400 italic">Belum ada data siswa.</p> : null}
                  {topStudents.slice(0, 5).map((s, idx) => (
                    <div key={s.id} className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                      <div>
                        <p className="font-bold text-slate-800">{idx + 1}. {s.name}</p>
                        <p className="text-xs text-slate-400">{s.class}</p>
                      </div>
                      <span className="text-rose-600 font-bold text-xs">{s.score || 0} Pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DATA SISWA */}
        {activeTab === 'students' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-6xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Data Siswa</h2>
              <button onClick={() => setActiveModal('student')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <Clipboard className="w-4 h-4" /> Import Excel / Tambah Siswa
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 min-w-[500px]">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b text-xs uppercase">
                  <tr>
                    <th className="p-3">NIS</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Total Poin</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">Belum ada data siswa. Klik button Import Excel di atas.</td>
                    </tr>
                  )}
                  {students.map(s => (
                    <tr key={s.id}>
                      <td className="p-3 text-xs font-mono">{s.nis || '-'}</td>
                      <td className="p-3 font-semibold text-slate-800">{s.name}</td>
                      <td className="p-3 font-medium text-indigo-600">{s.class}</td>
                      <td className="p-3 font-bold text-rose-600">{s.score || 0} Pts</td>
                      <td className="p-3 text-right">
                        <button onClick={() => setStudents(students.filter(x => x.id !== s.id))} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DATA GURU */}
        {activeTab === 'teachers' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Data Guru</h2>
              <button onClick={() => setActiveModal('teacher')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <Clipboard className="w-4 h-4" /> Import Excel / Tambah Guru
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b text-xs uppercase">
                  <tr>
                    <th className="p-3">Nama Lengkap Guru</th>
                    <th className="p-3">Mata Pelajaran</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-400 text-xs">Belum ada data guru.</td>
                    </tr>
                  )}
                  {teachers.map(t => (
                    <tr key={t.id}>
                      <td className="p-3 font-semibold text-slate-800">{t.name}</td>
                      <td className="p-3">{t.subject || '-'}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => setTeachers(teachers.filter(x => x.id !== t.id))} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* JENIS PELANGGARAN */}
        {activeTab === 'vtypes' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Jenis Pelanggaran</h2>
              <button onClick={() => setActiveModal('vtype')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <Clipboard className="w-4 h-4" /> Import Excel / Tambah Jenis
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b text-xs uppercase">
                  <tr>
                    <th className="p-3">Pelanggaran</th>
                    <th className="p-3">Bobot Poin</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {violationTypes.map(vt => (
                    <tr key={vt.id}>
                      <td className="p-3 font-semibold text-slate-800">{vt.name}</td>
                      <td className="p-3 font-bold text-rose-600">+{vt.points} Poin</td>
                      <td className="p-3 text-right">
                        <button onClick={() => setViolationTypes(violationTypes.filter(x => x.id !== vt.id))} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATAT PELANGGARAN */}
        {activeTab === 'record' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Catat Pelanggaran</h2>
                <p className="text-xs text-slate-500">Guru Aktif: <strong className="text-indigo-600">{selectedTeacher || "Pilih Guru di Sidebar"}</strong></p>
              </div>
              <button onClick={openRecordModal} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 shadow-md">
                <Plus className="w-4 h-4" /> Input Pelanggaran Baru
              </button>
            </div>
          </div>
        )}

        {/* LAPORAN REKAP */}
        {(activeTab === 'reports' || activeTab === 'record') && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-6xl mx-auto mt-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">Riwayat Catatan Pelanggaran</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b text-xs uppercase">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Pelanggaran</th>
                    <th className="p-3">Poin</th>
                    <th className="p-3">Guru Pelapor</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {violations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">Belum ada riwayat pelanggaran.</td>
                    </tr>
                  )}
                  {violations.map(v => (
                    <tr key={v.id}>
                      <td className="p-3 text-xs text-slate-400">{v.date}</td>
                      <td className="p-3 font-semibold text-slate-800">{v.studentName}</td>
                      <td className="p-3">{v.class}</td>
                      <td className="p-3 font-medium text-slate-800">{v.type}</td>
                      <td className="p-3 font-bold text-rose-600">+{v.points}</td>
                      <td className="p-3 text-slate-700 font-medium">{v.teacher}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL PASTE EXCEL */}
      {activeModal && activeModal !== 'record' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-2">
              Import Data {activeModal === 'student' ? 'Siswa' : activeModal === 'teacher' ? 'Guru' : 'Jenis Pelanggaran'}
            </h3>
            
            <p className="text-xs text-slate-500 mb-3">
              Copy kolom dari Excel dan Tempel di sini:
              <br/>
              {activeModal === 'student' && <strong className="text-indigo-600">Format Excel: NIS [TAB] NAMA SISWA [TAB] KELAS</strong>}
              {activeModal === 'teacher' && <strong className="text-indigo-600">Format Excel: NAMA GURU [TAB] MAPEL</strong>}
              {activeModal === 'vtype' && <strong className="text-indigo-600">Format Excel: NAMA PELANGGARAN [TAB] POIN</strong>}
            </p>

            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste data Excel di sini..."
              className="w-full p-3 border rounded-xl text-xs font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setActiveModal(null); setPasteText(''); }} className="px-4 py-2 text-xs text-slate-600">Batal</button>
              <button onClick={() => handlePasteSubmit(activeModal)} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-md hover:bg-indigo-700">
                Proses Import Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT PELANGGARAN SISWA */}
      {activeModal === 'record' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Input Pelanggaran Siswa</h3>
            <form onSubmit={handleRecordViolation} className="space-y-4">
              
              {/* TANGGAL */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" /> Tanggal Pelanggaran
                </label>
                <input 
                  type="date"
                  required 
                  value={singleForm.date || ''} 
                  onChange={(e) => setSingleForm({...singleForm, date: e.target.value})} 
                  className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* NAMA SISWA */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> Nama Siswa
                </label>
                <select 
                  required 
                  value={singleForm.studentId || ''} 
                  onChange={(e) => setSingleForm({...singleForm, studentId: e.target.value})} 
                  className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} (Kelas {s.class})</option>)}
                </select>
              </div>

              {/* JENIS PELANGGARAN */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Jenis Pelanggaran
                </label>
                <select 
                  required 
                  value={singleForm.vTypeId || ''} 
                  onChange={(e) => setSingleForm({...singleForm, vTypeId: e.target.value})} 
                  className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Jenis Pelanggaran --</option>
                  {violationTypes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>

              {/* GURU YANG MELAPOR */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Guru yang Melapor
                </label>
                <select 
                  required 
                  value={singleForm.teacherName || ''} 
                  onChange={(e) => setSingleForm({...singleForm, teacherName: e.target.value})} 
                  className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Guru Pelapor --</option>
                  {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>

              {/* BUTTON ACTION */}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs font-medium text-slate-600">Batal</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md">Simpan Laporan</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}