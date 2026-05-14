import React, { useState } from 'react';
import { Booking, Patient } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, User, Calendar as CalendarIcon, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface BookingManagementProps {
  bookings: Booking[];
  patients: Patient[];
  onAddBooking: (booking: Booking) => void;
  onUpdateBooking: (booking: Booking) => void;
}

export function BookingManagement({ bookings, patients, onAddBooking, onUpdateBooking }: BookingManagementProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddingBooking, setIsAddingBooking] = useState(false);

  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : '';
  const dayBookings = bookings.filter(b => b.date === selectedDateStr);

  const handleAddBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const patientId = formData.get('patientId') as string;
    const patient = patients.find(p => p.id === patientId);

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      patientId,
      patientName: patient?.name || 'Unknown',
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      type: formData.get('type') as any,
      status: 'Scheduled',
      notes: formData.get('notes') as string,
    };
    onAddBooking(newBooking);
    setIsAddingBooking(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Appointment Calendar</h2>
          <p className="text-slate-500">Schedule and manage patient consultations.</p>
        </div>
        <Dialog open={isAddingBooking} onOpenChange={setIsAddingBooking}>
          <DialogTrigger asChild>
            <Button className="bg-primary-deep hover:bg-teal-800 text-white rounded-xl gap-2">
              <Plus className="w-5 h-5" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBooking} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient</Label>
                <Select name="patientId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" defaultValue={selectedDateStr} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" type="time" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select name="type" defaultValue="Consultation">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Therapy">Therapy Session</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input id="notes" name="notes" placeholder="Reason for visit..." />
              </div>
              <Button type="submit" className="w-full bg-primary-deep text-white">Confirm Booking</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-sm bg-white p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-xl border-none"
          />
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-deep" />
            Schedule for {date ? format(date, 'MMMM do, yyyy') : 'Selected Date'}
          </h3>
          
          <div className="space-y-4">
            {dayBookings.length > 0 ? (
              dayBookings.map((booking) => (
                <Card key={booking.id} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="text-center min-w-[60px]">
                          <p className="text-lg font-bold text-primary-deep">{booking.time}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Time</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div>
                          <p className="font-bold text-slate-900 text-lg">{booking.patientName}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">{booking.type}</Badge>
                            <Badge className={`${getStatusColor(booking.status)} border-none shadow-none`}>{booking.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                    {booking.notes && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic">
                        "{booking.notes}"
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                <Clock className="w-12 h-12 mb-4 opacity-20" />
                <p>No appointments scheduled for this day.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
