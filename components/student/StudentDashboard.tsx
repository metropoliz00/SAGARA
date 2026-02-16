
import React, { useMemo, useState } from 'react';
import { Student, SchoolProfileData, TeacherProfileData } from '../../types';
import { PieChart as PieChartIcon, Printer, BarChart2, Calendar, Users, Briefcase, GraduationCap } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  Bar, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart
} from 'recharts';

interface StudentDashboardProps {
    students: Student[];
    schoolProfile?: SchoolProfileData;
    teacherProfile?: TeacherProfileData; // Added teacherProfile prop
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#64748b'];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ students, schoolProfile, teacherProfile }) => {
    const [reportPickupLog, setReportPickupLog] = useState<Record<string, { pickerName: string; signature: string }>>({});

    const calculateAge = (birthDate: string): number => {
        if (!birthDate) return 0;
        try {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        } catch (e) {
            return 0;
        }
    };
    
    const ageByMonthData = useMemo(() => {
        const months = Array.from({ length: 12 }, () => ({
            L: Array(13).fill(0), // Ages 6-18
            P: Array(13).fill(0),
            total: 0
        }));

        students.forEach(student => {
            if (student.birthDate) {
                const birthMonth = new Date(student.birthDate).getMonth();
                const age = calculateAge(student.birthDate);
                if (age >= 6 && age <= 18) {
                    const ageIndex = age - 6;
                    if (student.gender === 'L') {
                        months[birthMonth].L[ageIndex]++;
                    } else {
                        months[birthMonth].P[ageIndex]++;
                    }
                    months[birthMonth].total++;
                }
            }
        });
        return months;
    }, [students]);

    const countByYearData = useMemo(() => {
        const yearMap: Record<string, { L: number; P: number; total: number; age: number }> = {};
        students.forEach(s => {
            if (s.birthDate) {
                const year = new Date(s.birthDate).getFullYear();
                const age = calculateAge(s.birthDate);
                if (!yearMap[year]) {
                    yearMap[year] = { L: 0, P: 0, total: 0, age: age };
                }
                if (s.gender === 'L') yearMap[year].L++;
                else yearMap[year].P++;
                yearMap[year].total++;
            }
        });
        return Object.entries(yearMap).sort((a,b) => Number(b[0]) - Number(a[0]));
    }, [students]);

    const parentOccupationData = useMemo(() => {
        const jobs = students.flatMap(s => [s.fatherJob, s.motherJob]);
        
        // Filter out undefined/null and empty strings
        const validJobs = jobs.filter((j): j is string => !!j && j.trim() !== '');
        
        const counts: Record<string, number> = {};
        validJobs.forEach(job => {
            const normalized = job.trim().toLowerCase();
            counts[normalized] = (counts[normalized] || 0) + 1;
        });
        
        const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
        const top5 = sorted.slice(0, 6);
        const others = sorted.slice(6).reduce((acc, [, count]) => acc + count, 0);

        const chartData = top5.map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
        if (others > 0) chartData.push({ name: 'Lainnya', value: others });
        
        return chartData;
    }, [students]);

    const parentEducationData = useMemo(() => {
        const educations = students.flatMap(s => [s.fatherEducation, s.motherEducation]);
        
        // Filter out undefined/null and empty strings
        const validEducations = educations.filter((e): e is string => !!e && e.trim() !== '');

        const counts: Record<string, number> = {};
        validEducations.forEach(edu => {
            const normalized = edu.trim().toUpperCase();
            counts[normalized] = (counts[normalized] || 0) + 1;
        });
        return Object.entries(counts).sort(([, a], [, b]) => b - a).map(([name, value])=>({name, value}));
    }, [students]);

    const handleReportPickupChange = (studentId: string, field: 'pickerName' | 'signature', value: string) => {
        setReportPickupLog(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                pickerName: field === 'pickerName' ? value : (prev[studentId]?.pickerName || ''),
                signature: field === 'signature' ? value : (prev[studentId]?.signature || ''),
            }
        }));
    };

    const handlePrintReportPickup = () => {
        document.body.classList.add('printing-report-log');
        window.print();
        document.body.classList.remove('printing-report-log');
    };

    // Date formatting for the signature section
    const currentDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print-report">
                <div className="bg-white p-4 rounded-lg shadow-sm border col-span-1 lg:col-span-2">
                    <h3 className="font-bold text-gray-700 flex items-center mb-2"><Calendar size={16} className="mr-2 text-indigo-500" /> Daftar Umur Siswa Menurut Bulan Lahir</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-center border-collapse">
                            <thead className="bg-gray-50 font-semibold">
                                <tr>
                                    <th className="border p-1 w-24">Bulan Lahir</th>
                                    {Array.from({length: 13}, (_,i) => i+6).map(age => <th key={age} className="border p-1 w-12">{age}</th>)}
                                    <th className="border p-1 w-16 bg-gray-100">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ageByMonthData.map((monthData, monthIndex) => (
                                    <tr key={monthIndex}>
                                        <td className="border p-1 font-semibold">{new Date(0, monthIndex).toLocaleString('id-ID', {month: 'long'})}</td>
                                        {Array.from({length: 13}, (_,i) => i).map(ageIndex => (
                                            <td key={ageIndex} className="border p-1">
                                                {monthData.L[ageIndex] > 0 && <span className="text-blue-600">L:{monthData.L[ageIndex]}</span>}
                                                {monthData.P[ageIndex] > 0 && <span className="text-pink-600 ml-1">P:{monthData.P[ageIndex]}</span>}
                                            </td>
                                        ))}
                                        <td className="border p-1 font-bold bg-gray-50">{monthData.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-gray-700 flex items-center mb-2"><Users size={16} className="mr-2 text-indigo-500" /> Daftar Jumlah Siswa Menurut Tahun Lahir</h3>
                    <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-xs text-center border-collapse">
                            <thead className="bg-gray-50 font-semibold sticky top-0">
                                <tr>
                                    <th className="border p-2">Tahun Kelahiran</th>
                                    <th className="border p-2">Umur</th>
                                    <th className="border p-2">L</th>
                                    <th className="border p-2">P</th>
                                    <th className="border p-2">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {countByYearData.map(([year, data]) => (
                                    <tr key={year}>
                                        <td className="border p-2">{year}</td>
                                        <td className="border p-2">{data.age} Th</td>
                                        <td className="border p-2">{data.L}</td>
                                        <td className="border p-2">{data.P}</td>
                                        <td className="border p-2 font-bold">{data.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-gray-700 flex items-center mb-2"><Briefcase size={16} className="mr-2 text-indigo-500" /> Data Pekerjaan Orang Tua</h3>
                    <div style={{width: '100%', height: 250}}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={parentOccupationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {parentOccupationData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value) => [value, 'Jumlah']} />
                                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border col-span-1 lg:col-span-2">
                    <h3 className="font-bold text-gray-700 flex items-center mb-2"><GraduationCap size={16} className="mr-2 text-indigo-500" /> Data Pendidikan Orang Tua</h3>
                    <div style={{width: '100%', height: 250}}>
                        <ResponsiveContainer>
                            <RechartsBarChart data={parentEducationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [value, 'Jumlah']} />
                                <Bar dataKey="value" fill="#8884d8" />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div id="printable-report-section" className="bg-white p-6 rounded-lg shadow-sm border print:shadow-none print:border-none print:p-0">
                <div className="flex justify-between items-center mb-4 no-print">
                    <h3 className="font-bold text-lg text-gray-800">Buku Pengambilan Rapor</h3>
                    <button onClick={handlePrintReportPickup} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"><Printer size={16}/> Cetak</button>
                </div>
                
                {/* Print Header */}
                <div className="print-only text-center mb-8 hidden">
                    <h2 className="text-xl font-bold uppercase underline mb-2 tracking-wider">BUKU PENERIMAAN RAPOR</h2>
                    <table className="mx-auto text-sm font-bold uppercase" style={{ border: 'none' }}>
                        <tbody>
                            <tr>
                                <td className="text-right pr-2">KELAS / SEMESTER</td>
                                <td className="px-1">:</td>
                                <td className="text-left">{teacherProfile?.teachingClass || '...'} / {schoolProfile?.semester || '...'}</td>
                            </tr>
                            <tr>
                                <td className="text-right pr-2">TAHUN AJARAN</td>
                                <td className="px-1">:</td>
                                <td className="text-left">{schoolProfile?.year || '...'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-black">
                        <thead>
                            <tr className="bg-gray-100 print:bg-white">
                                <th className="border border-black p-2 w-10 text-center font-bold">NO</th>
                                <th className="border border-black p-2 text-left font-bold">NAMA SISWA</th>
                                <th className="border border-black p-2 text-left font-bold w-1/4">PENERIMA</th>
                                <th className="border border-black p-2 text-center font-bold w-1/4">TANDA TANGAN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.sort((a,b) => a.name.localeCompare(b.name)).map((student, index) => (
                                <tr key={student.id}>
                                    <td className="border border-black p-2 text-center">{index + 1}</td>
                                    <td className="border border-black p-2 font-medium">{student.name}</td>
                                    <td className="border border-black p-2">
                                        {/* Input for screen, Text for print */}
                                        <input 
                                            type="text"
                                            className="w-full p-1 outline-none bg-transparent placeholder-gray-300 print:placeholder-transparent"
                                            placeholder="Nama Penerima..."
                                            value={reportPickupLog[student.id]?.pickerName || ''}
                                            onChange={(e) => handleReportPickupChange(student.id, 'pickerName', e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-black p-2 h-10">
                                        {/* Just whitespace for signature in print */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Print Footer with Signatures */}
                <div className="hidden print:flex justify-between items-start mt-12 px-8 text-sm break-inside-avoid">
                    {/* Left: Headmaster */}
                    <div className="text-center w-64">
                        <p className="mb-20">
                            Mengetahui,<br/>
                            Kepala {schoolProfile?.name || 'Sekolah'}
                        </p>
                        <p className="font-bold underline">{schoolProfile?.headmaster || '......................'}</p>
                        <p>NIP. {schoolProfile?.headmasterNip || '......................'}</p>
                    </div>

                    {/* Right: Teacher */}
                    <div className="text-center w-64">
                        <p className="mb-20">
                            Tuban, {currentDate}<br/>
                            Guru Kelas {teacherProfile?.teachingClass || '...'}
                        </p>
                        <p className="font-bold underline">{teacherProfile?.name || '......................'}</p>
                        <p>NIP. {teacherProfile?.nip || '......................'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;
