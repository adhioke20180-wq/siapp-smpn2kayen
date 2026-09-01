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

  // Load Data awal dari Database Neon
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

  // Rekap Kelas
  const uniqueClasses = Array.from(new Set(students.map((s) => s.class).filter(Boolean)));

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

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">SIAPP - SMPN 2 Kayen</h1>
      <p className="mb-4">Status Database: {isLoaded ? 'Terhubung' : 'Memuat data...'}</p>
      <div className="border p-4 rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Jumlah Siswa Terdaftar: {students.length}</h2>
        <ul className="list-disc pl-5">
          {students.map((s) => (
            <li key={s.id}>{s.name} - Kelas {s.class}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}