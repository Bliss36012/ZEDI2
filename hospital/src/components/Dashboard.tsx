import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Bell, TrendingUp } from 'lucide-react';
import { Patient, Booking, Reminder } from '../types';
import { motion } from 'motion/react';

interface DashboardProps {
  patients: Patient[];
  bookings: Booking[];
  reminders: Reminder[];
}

export function Dashboard({ patients, bookings, reminders }: DashboardProps) {
  const stats = [
    { label: 'Total Patients', value: patients.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Today\'s Bookings', value: bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length, icon: Calendar, color: 'bg-teal-100 text-teal-600' },
    { label: 'Pending Reminders', value: reminders.filter(r => !r.completed).length, icon: Bell, color: 'bg-amber-100 text-amber-600' },
    { label: 'Active Cases', value: patients.filter(p => p.medicalHistory.length > 0).length, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ];

  const upcomingBookings = bookings
    .filter(b => b.status === 'Scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Siha Angavu Dashboard</h2>
        <p className="text-slate-500">Welcome back, Dr. Paschal. Here's your hospital overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary-deep font-bold">
                        {booking.patientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{booking.patientName}</p>
                        <p className="text-sm text-slate-500">{booking.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">{booking.date}</p>
                      <p className="text-sm text-slate-500">{booking.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">No upcoming appointments.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Recent Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reminders.slice(0, 5).map((reminder) => (
                <div key={reminder.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-2 h-10 rounded-full ${reminder.type === 'Medication' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{reminder.title}</p>
                    <p className="text-sm text-slate-500">{reminder.description}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    {reminder.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
