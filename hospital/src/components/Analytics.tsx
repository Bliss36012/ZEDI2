import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Patient, AttendanceLocation, Booking, Reminder } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  format, startOfDay, startOfWeek, startOfMonth, startOfYear, 
  subMonths, isWithinInterval, parseISO, endOfDay
} from 'date-fns';
import { MapPin, GraduationCap, Coffee, Hospital as HospitalIcon, TrendingUp, Users, Calendar, Bell } from 'lucide-react';

interface AnalyticsProps {
  patients: Patient[];
  bookings: Booking[];
  reminders: Reminder[];
}

const COLORS = ['#00695c', '#ef6c00', '#f43f5e']; 
const LOCATION_MAP: Record<AttendanceLocation, string> = {
  'Hospital': '#00695c',
  'Seminar': '#ef6c00',
  'In-person': '#f43f5e'
};

export function Analytics({ patients, bookings, reminders }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const allRecords = useMemo(() => {
    return patients.flatMap(p => 
      p.medicalHistory.map(record => ({
        ...record,
        patientName: p.name,
        parsedDate: parseISO(record.date)
      }))
    ).sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());
  }, [patients]);

  const stats = useMemo(() => {
    const now = new Date();
    
    let startDate: Date;
    switch(timeRange) {
      case 'day': startDate = startOfDay(now); break;
      case 'week': startDate = startOfWeek(now); break;
      case 'month': startDate = startOfMonth(now); break;
      case 'year': startDate = startOfYear(now); break;
      default: startDate = startOfMonth(now);
    }
    
    const interval = { start: startDate, end: endOfDay(now) };

    const periodRecords = allRecords.filter(r => isWithinInterval(r.parsedDate, interval));
    const periodBookings = bookings.filter(b => isWithinInterval(parseISO(b.date), interval));
    const periodReminders = reminders.filter(r => isWithinInterval(parseISO(r.date), interval));

    const locationCounts = {
      'Hospital': 0,
      'Seminar': 0,
      'In-person': 0
    };

    periodRecords.forEach(r => {
      locationCounts[r.location]++;
    });

    const pieData = Object.entries(locationCounts).map(([name, value]) => ({ name, value }));

    const groupData = () => {
      const dataMap: Record<string, any> = {};
      
      periodRecords.forEach(r => {
        let key = '';
        if (timeRange === 'year') {
          key = format(r.parsedDate, 'MMM');
        } else if (timeRange === 'month' || timeRange === 'week') {
          key = format(r.parsedDate, 'MMM dd');
        } else {
          key = format(r.parsedDate, 'HH:00'); 
        }

        if (!dataMap[key]) {
          dataMap[key] = { name: key, Hospital: 0, Seminar: 0, 'In-person': 0, total: 0 };
        }
        dataMap[key][r.location]++;
        dataMap[key].total++;
      });

      return Object.values(dataMap).sort((a, b) => {
        if (timeRange === 'year') return 0; // Months already sorted contextually or by insertion
        return a.name.localeCompare(b.name);
      });
    };

    return {
      totalPatients: new Set(periodRecords.map(r => r.patientName)).size,
      totalVisits: periodRecords.length,
      bookingsCount: periodBookings.length,
      remindersCount: periodReminders.length,
      completedBookings: periodBookings.filter(b => b.status === 'Completed').length,
      completedReminders: periodReminders.filter(r => r.completed).length,
      locationCounts,
      pieData,
      timelineData: groupData()
    };
  }, [allRecords, bookings, reminders, timeRange]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Hospital Analytics</h2>
          <p className="text-slate-500">Global patient attendance statistics and trends.</p>
        </div>
        
        <Tabs value={timeRange} onValueChange={(v: any) => setTimeRange(v)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200">
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-700">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Patients</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalPatients}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700">
              <HospitalIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Consultations</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalVisits}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-700">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Appts Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.bookingsCount > 0 ? ((stats.completedBookings / stats.bookingsCount) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-700">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Reminder Success</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.remindersCount > 0 ? ((stats.completedReminders / stats.remindersCount) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Consultation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {stats.timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="Hospital" stackId="a" fill={LOCATION_MAP['Hospital']} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Seminar" stackId="a" fill={LOCATION_MAP['Seminar']} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="In-person" stackId="a" fill={LOCATION_MAP['In-person']} radius={[4, 4, 0, 0]} name="Coffee Shop / In-person" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No data for this period.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Location Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {stats.totalVisits > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={LOCATION_MAP[entry.name as AttendanceLocation]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                 <div className="flex items-center justify-center h-full text-slate-500 text-center px-8">
                  Records required to generate location distribution.
                </div>
              )}
            </div>
            
            <div className="mt-8 space-y-4">
              {Object.entries(stats.locationCounts).map(([location, count]) => (
                <div key={location} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LOCATION_MAP[location as AttendanceLocation] }} />
                    <span className="text-sm font-medium text-slate-700">{location === 'In-person' ? 'Coffee Shop / Etc' : location}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{count} visits</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-xl">Recent Global Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary-deep font-bold">
                    {record.patientName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{record.patientName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        {record.location === 'Hospital' && <HospitalIcon className="w-3 h-3" />}
                        {record.location === 'Seminar' && <GraduationCap className="w-3 h-3" />}
                        {record.location === 'In-person' && <Coffee className="w-3 h-3" />}
                        {record.location}
                      </span>
                      <span>•</span>
                      <span>{record.diagnosis}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">{record.date}</p>
                  <p className="text-xs text-slate-500">Dr. Paschal</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
