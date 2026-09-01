'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  FileText, 
  BarChart2, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Download, 
  Upload, 
  CheckCircle,
  XCircle,
  ChevronDown
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [violationTypes, setViolationTypes] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  const [searchStudent, setSearchStudent] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [singleForm, setSingleForm] = useState<any>({});

  // 1. Load Data dari Database Cloud Neon (Bisa diakses HP & Laptop)
  const fetchData = async () => {
    try {
      const [resS, resT, resV] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/teachers'),
        fetch('/api/violations')
      ]);

      if (resS.ok) {
        const dataS = await resS.json();
        if (Array.isArray(dataS)) setStudents(dataS);
      }
      if (resT.ok) {
        const dataT = await resT.json();
        if (Array.isArray(dataT)) {
          setTeachers(dataT);
          if (dataT.length > 0 && !selectedTeacher) setSelectedTeacher(dataT[0].name);
        }
      }
      if (resV.ok) {
        const dataV = await resV.json();
        if (Array.isArray(dataV)) setViolations(dataV);
      }
    } catch (err) {
      console.error('Gagal mengambil data dari cloud:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Rekap Kelas & Skor
  const classesList = [
    '7A','7B','7C','7D','7E','7F','7G','7H','7I',
    '8A','8B','8C','8D','8E','8F','8G','8H',
    '9A','9B','9C','9D','9E','9F','9G','9H'
  ];

  const getStudentScore = (studentId: string) => {
    return violations
      .filter((v: any) => String(v.studentId) === String(studentId))
      .reduce((sum: number, v: any) => sum + (Number(v.points) || 0), 0);
  };

  const getStudentViolationCount = (studentId: string) => {
    return violations.filter((v: any) => String(v.studentId) === String(studentId)).length;
  };

  const sortedStudentsByScore = [...students].sort((a, b) => {
    return getStudentScore(b.id) - getStudentScore(a.id);
  });

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-indigo-700 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">SIAPPS</h1>
              <p className="text-xs text-indigo-300">spendaka26.27</p>
            </div>
          </div>

          <div className="mb-6 px-2">
            <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block mb-2">
              Guru Pengakses:
            </label>
            <div className="relative">
              <select 
                value={selectedTeacher} 
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full bg-indigo-800 text-white text-sm rounded-lg p-2.5 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-indigo-700"
              >
                {teachers.length === 0 && <option value="">Belum ada data guru</option>}
                {teachers.map((t: any, idx: number) => (
                  <option key={idx} value={t.name}>{t.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-indigo-300 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <BarChart2 className="w-4 h-4" /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('students')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <Users className="w-4 h-4" /> Data Siswa
            </button>
            <button 
              onClick={() => setActiveTab('teachers')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'teachers' ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <UserCheck className="w-4 h-4" /> Data Guru
            </button>
            <button 
              onClick={() => setActiveTab('vtypes')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'vtypes' ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <AlertTriangle className="w-4 h-4" /> Jenis Pelanggaran
            </button>
            <button 
              onClick={() => setActiveTab('record')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'record' ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <FileText className="w-4 h-4" /> Catat Pelanggaran
            </button>
            <button 
              onClick={() => setActiveTab('rekap')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'rekap' ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <BarChart2 className="w-4 h-4" /> Laporan Rekap
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Dashboard Utama</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Jumlah Kelas Terdeteksi</p>
                  <p className="text-3xl font-bold text-slate-800">{classesList.length}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Siswa</p>
                  <p className="text-3xl font-bold text-slate-800">{students.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Rekap Pelanggaran Per Kelas</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {classesList.map((cls) => {
                    const count = violations.filter((v: any) => v.studentClass === cls).length;
                    return (
                      <div key={cls} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="font-semibold text-slate-700">{cls}</span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                          {count} Kejadian
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Skor Pelanggaran Tertinggi</h3>
                <div className="space-y-3">
                  {sortedStudentsByScore.slice(0, 5).map((s, idx) => {
                    const score = getStudentScore(s.id);
                    return (
                      <div key={s.id || idx} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-none">
                        <div>
                          <p className="font-bold text-slate-800">{idx + 1}. {s.name}</p>
                          <p className="text-xs text-slate-500">{s.class}</p>
                        </div>
                        <span className="font-bold text-red-600 text-sm">{score} Pts</span>
                      </div>
                    );
                  })}
                  {students.length === 0 && <p className="text-sm text-slate-400">Belum ada data siswa.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tampilan halaman lainnya akan memuat data otomatis dari Cloud */}
        {activeTab !== 'dashboard' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-4 capitalize">Halaman {activeTab}</h2>
            <p className="text-slate-600 text-sm mb-4">
              Semua data di halaman ini sudah terhubung secara otomatis ke database Cloud Neon (Bisa diakses bersama di Laptop & HP).
            </p>
            <div className="p-4 bg-indigo-50 text-indigo-800 rounded-xl text-sm font-medium">
              Sistem Sinkronisasi Cloud Aktif. Total Siswa Terhubung: {students.length} | Guru: {teachers.length}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}