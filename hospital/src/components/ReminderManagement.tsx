import React, { useState } from 'react';
import { Reminder } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Bell, Pill, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReminderManagementProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Reminder) => void;
  onUpdateReminder: (reminder: Reminder) => void;
  onDeleteReminder: (id: string) => void;
}

export function ReminderManagement({ reminders, onAddReminder, onUpdateReminder, onDeleteReminder }: ReminderManagementProps) {
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  const handleAddReminder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      type: formData.get('type') as any,
      completed: false,
    };
    onAddReminder(newReminder);
    setIsAddingReminder(false);
  };

  const toggleReminder = (reminder: Reminder) => {
    onUpdateReminder({ ...reminder, completed: !reminder.completed });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Medication': return Pill;
      case 'Appointment': return Calendar;
      default: return AlertCircle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Medication': return 'text-blue-600 bg-blue-100';
      case 'Appointment': return 'text-amber-600 bg-amber-100';
      default: return 'text-purple-600 bg-purple-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Reminders & Alerts</h2>
          <p className="text-slate-500">Stay on top of medications and patient tasks.</p>
        </div>
        <Dialog open={isAddingReminder} onOpenChange={setIsAddingReminder}>
          <DialogTrigger asChild>
            <Button className="bg-primary-deep hover:bg-teal-800 text-white rounded-xl gap-2">
              <Plus className="w-5 h-5" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Create New Reminder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddReminder} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="e.g., Morning Meds" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="Details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" type="time" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue="General">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medication">Medication</SelectItem>
                    <SelectItem value="Appointment">Appointment</SelectItem>
                    <SelectItem value="General">General Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary-deep text-white">Save Reminder</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reminders.map((reminder) => {
          const Icon = getTypeIcon(reminder.type);
          return (
            <Card key={reminder.id} className={`border-none shadow-sm transition-all ${reminder.completed ? 'opacity-60 grayscale' : 'bg-white hover:shadow-md'}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className={`p-3 rounded-2xl ${getTypeColor(reminder.type)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-slate-900 truncate ${reminder.completed ? 'line-through' : ''}`}>
                        {reminder.title}
                      </h4>
                      <Badge variant="outline" className="text-[10px] py-0 px-1 uppercase tracking-wider">{reminder.type}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{reminder.description}</p>
                    <div className="flex items-center gap-3 mt-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {reminder.date}</span>
                      <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {reminder.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <Checkbox 
                      checked={reminder.completed} 
                      onCheckedChange={() => toggleReminder(reminder)}
                      className="w-6 h-6 rounded-lg border-slate-200 data-[state=checked]:bg-primary-deep data-[state=checked]:border-primary-deep"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-300 hover:text-red-500"
                      onClick={() => onDeleteReminder(reminder.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {reminders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
            <Bell className="w-12 h-12 mb-4 opacity-20" />
            <p>No reminders set. Click "Add Reminder" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
