'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [violationTypes, setViolationTypes] = useState<any[]>([
    { id: '1', name: 'Terlambat Masuk Sekolah', points: 5 },
    { id: '2', name: 'Tidak Mengerjakan Tugas', points: 10 }
  ]);
  const [violations, setViolations] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [pasteText, setPasteText] = useState('');
  const [singleForm, setSingleForm] = useState<any>({});

  // Fetch Data dari Database Neon
  useEffect(() => {
    fetch('/api/student')
      .then((res) => res.json())
      .then((result) => {
        if (result.data) {
          setStudents(result.data);
        }
      })
      .catch((err) => console.error('Gagal ambil data:', err))
      .finally(() => setIsLoaded(true));
  }, []);

  const uniqueClasses = Array.from(new Set(students.map((s) => s.class).filter(Boolean)));

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">SIAPP - SMPN 2 Kayen</h1>
          <p className="text-sm text-gray-500">Sistem Informasi Akademik & Pelanggaran Pelajar</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isLoaded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {isLoaded ? '● Database Connected' : '○ Loading...'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button 
          onClick={() => setActiveModal('addStudent')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          + Tambah Data Siswa
        </button>
        <button 
          onClick={() => setActiveModal('record')}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          + Catat Pelanggaran
        </button>
      </div>

      {/* Ringkasan Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border p-4 rounded-xl bg-white shadow-sm">
          <h3 className="text-gray-500 text-sm mb-1">Total Siswa Terdaftar</h3>
          <p className="text-3xl font-bold text-gray-800">{students.length}</p>
        </div>
        <div className="border p-4 rounded-xl bg-white shadow-sm">
          <h3 className="text-gray-500 text-sm mb-1">Total Kelas</h3>
          <p className="text-3xl font-bold text-gray-800">{uniqueClasses.length}</p>
        </div>
      </div>

      {/* Tabel Data Siswa */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700">Daftar Siswa</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-sm text-gray-500 bg-gray-50">
              <th className="p-3">NISN / ID</th>
              <th className="p-3">Nama Siswa</th>
              <th className="p-3">Kelas</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-400 text-sm">
                  Belum ada data siswa di database.
                </td>
              </tr>
            ) : (
              students.map((s, idx) => (
                <tr key={s.id || idx} className="border-b hover:bg-gray-50 text-sm text-gray-700">
                  <td className="p-3">{s.nisn || s.id || '-'}</td>
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3">{s.class}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}