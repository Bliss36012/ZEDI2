import React, { useState } from 'react';
import { Patient, MedicalRecord, PatientStatistic } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, BarChart2, User, Phone, Mail, MapPin, Map, Coffee, GraduationCap, Hospital as HospitalIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const COLORS = ['#0d9488', '#f43f5e', '#8b5cf6', '#f59e0b', '#3b82f6'];

interface PatientManagementProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
}

export function PatientManagement({ patients, onAddPatient, onUpdatePatient }: PatientManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPatient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      dob: formData.get('dob') as string,
      gender: formData.get('gender') as any,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      medicalHistory: [],
      statistics: [
        { date: new Date().toISOString().split('T')[0], mood: 5, sleepHours: 8, anxietyLevel: 5 }
      ],
      createdAt: new Date().toISOString(),
    };
    onAddPatient(newPatient);
    setIsAddingPatient(false);
  };

  const handleAddMedicalRecord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const formData = new FormData(e.currentTarget);
    const newRecord: MedicalRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: formData.get('date') as string,
      diagnosis: formData.get('diagnosis') as string,
      notes: formData.get('notes') as string,
      prescriptions: (formData.get('prescriptions') as string).split(',').filter(p => p.trim()),
      doctor: 'Dr. Paschal',
      location: formData.get('location') as any,
    };

    const updatedPatient = {
      ...selectedPatient,
      medicalHistory: [newRecord, ...selectedPatient.medicalHistory],
    };
    onUpdatePatient(updatedPatient);
    setSelectedPatient(updatedPatient);
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'Seminar': return <GraduationCap className="w-4 h-4" />;
      case 'In-person': return <Coffee className="w-4 h-4" />;
      case 'Hospital': return <HospitalIcon className="w-4 h-4" />;
      default: return <Map className="w-4 h-4" />;
    }
  };

  const getAttendanceData = () => {
    if (!selectedPatient) return [];
    const counts: Record<string, number> = {};
    selectedPatient.medicalHistory.forEach(record => {
      counts[record.location] = (counts[record.location] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getMoodDistributionData = () => {
    if (!selectedPatient) return [];
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    selectedPatient.statistics.forEach(stat => {
      counts[stat.mood]++;
    });
    return Object.entries(counts).map(([mood, count]) => ({ mood: `Mood ${mood}`, count }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Patient Directory</h2>
          <p className="text-slate-500 text-sm sm:text-base">Manage medical records and track patient progress.</p>
        </div>
        <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-primary-deep hover:bg-teal-800 text-white rounded-xl gap-2">
              <Plus className="w-5 h-5" />
              Add New Patient
            </Button>
          </DialogTrigger>
          {/* ... DialogContent remains نفس ... */}
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPatient} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select name="gender" defaultValue="Prefer not to say">
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Home Address</Label>
                <Input id="address" name="address" required />
              </div>
              <Button type="submit" className="w-full bg-primary-deep text-white">Register Patient</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className={cn(
          "lg:col-span-1 border-none shadow-sm bg-white overflow-hidden",
          selectedPatient && "hidden lg:block"
        )}>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search patients..." 
                className="pl-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] lg:max-h-[600px] overflow-y-auto">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-4 border-b border-slate-50 transition-colors ${selectedPatient?.id === patient.id ? 'bg-primary-soft' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-500">{patient.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className={cn(
          "lg:col-span-2",
          !selectedPatient && "hidden lg:block"
        )}>
          {selectedPatient ? (
            <div className="space-y-6">
              <Button 
                variant="ghost" 
                className="lg:hidden mb-2 gap-2 text-slate-500"
                onClick={() => setSelectedPatient(null)}
              >
                <Plus className="w-4 h-4 rotate-45" /> Back to Directory
              </Button>
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-primary-deep flex items-center justify-center text-white text-3xl font-serif">
                        {selectedPatient.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-slate-900">{selectedPatient.name}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedPatient.gender}, {new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()} yrs</span>
                          <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {selectedPatient.phone}</span>
                          <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {selectedPatient.email}</span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-2">
                          <MapPin className="w-4 h-4" /> {selectedPatient.address}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="h-fit py-1 px-3 border-primary-deep text-primary-deep">Active Patient</Badge>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="history" className="w-full">
                <TabsList className="bg-white p-1 rounded-xl border border-slate-100 mb-6">
                  <TabsTrigger value="history" className="rounded-lg gap-2"><FileText className="w-4 h-4" /> Medical History</TabsTrigger>
                  <TabsTrigger value="stats" className="rounded-lg gap-2"><BarChart2 className="w-4 h-4" /> Statistics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="history">
                  <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Clinical Records</CardTitle>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-lg gap-2">
                            <Plus className="w-4 h-4" /> Add Record
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>New Clinical Record</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddMedicalRecord} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" name="date" type="date" required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="location">Setting</Label>
                                <Select name="location" defaultValue="Hospital">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Hospital">Hospital</SelectItem>
                                    <SelectItem value="Seminar">Seminar</SelectItem>
                                    <SelectItem value="In-person">In-person (Cafe/Restaurant/etc)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="diagnosis">Diagnosis / Purpose</Label>
                              <Input id="diagnosis" name="diagnosis" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="notes">Notes</Label>
                              <Input id="notes" name="notes" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="prescriptions">Prescriptions (comma separated)</Label>
                              <Input id="prescriptions" name="prescriptions" placeholder="e.g. Med A, Med B" />
                            </div>
                            <Button type="submit" className="w-full bg-primary-deep text-white">Save Record</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {selectedPatient.medicalHistory.length > 0 ? (
                          selectedPatient.medicalHistory.map((record) => (
                            <div key={record.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium text-primary-deep">{record.date}</p>
                                    <Badge variant="secondary" className="text-[10px] gap-1 bg-white border-slate-200">
                                      {getLocationIcon(record.location)}
                                      {record.location}
                                    </Badge>
                                  </div>
                                  <h4 className="text-lg font-bold text-slate-900">{record.diagnosis}</h4>
                                </div>
                                <span className="text-sm text-slate-500">By {record.doctor}</span>
                              </div>
                              <p className="text-slate-600 text-sm leading-relaxed">{record.notes}</p>
                              <div className="flex flex-wrap gap-2">
                                {record.prescriptions.map((p, i) => (
                                  <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 border-none">{p}</Badge>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-slate-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No medical records found for this patient.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stats">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm bg-white">
                      <CardHeader>
                        <CardTitle>Health Trends (Line Chart)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] w-full">
                          {selectedPatient.statistics.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={selectedPatient.statistics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Line type="monotone" dataKey="mood" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#0d9488' }} activeDot={{ r: 6 }} name="Mood" />
                                <Line type="monotone" dataKey="anxietyLevel" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} name="Anxiety" />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : <p className="text-center text-slate-500 py-12">No data</p>}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white">
                      <CardHeader>
                        <CardTitle>Attendance Distribution (Pie Chart)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] w-full">
                          {selectedPatient.medicalHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getAttendanceData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {getAttendanceData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : <p className="text-center text-slate-500 py-12">No attendance records</p>}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white md:col-span-2">
                      <CardHeader>
                        <CardTitle>Mood Frequency (Histogram)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] w-full">
                          {selectedPatient.statistics.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getMoodDistributionData()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="mood" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Frequency" />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : <p className="text-center text-slate-500 py-12">No stats data</p>}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <User className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a patient to view details</p>
              <p className="text-sm">Search or select from the directory on the left.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
