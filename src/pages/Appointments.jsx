import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, X, Edit, Trash2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
  title: '',
  client_name: '',
  date: '',
  time: '',
  duration: 60,
  status: 'scheduled',  // ADD THIS
  notes: ''
});

    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const appointmentData = {
        ...formData,
        user_id: user.id
      };

      if (editingId) {
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Appointment updated successfully' });
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert([appointmentData]);

        if (error) throw error;
        toast({ title: 'Appointment created successfully' });
      }

      resetForm();
      fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({ 
        title: 'Error saving appointment', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Appointment deleted successfully' });
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({ 
        title: 'Error deleting appointment',
        variant: 'destructive' 
      });
    }
  };

  const handleEdit = (appointment) => {
    setFormData({
      title: appointment.title,
      client_name: appointment.client_name,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      notes: appointment.notes || '',
    status: appointment.status || 'scheduled'
    });
    setEditingId(appointment.id);
    setShowNewForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      client_name: '',
      date: '',
      time: '',
      duration: 60,
      notes: '',
    status: 'scheduled'
    });
    setEditingId(null);
    setShowNewForm(false);
  };

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date + 'T' + apt.time);
    return aptDate >= new Date();
  });

  const totalClients = new Set(appointments.map(apt => apt.client_name)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your bookings and availability</p>
        </div>
        <Button 
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Clients Served</p>
              <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* New/Edit Appointment Form */}
      {showNewForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {editingId ? 'Edit Appointment' : 'New Appointment'}
            </h2>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Meeting title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Client name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="60"
                />
              </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                placeholder="Add any notes about this appointment"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? 'Update' : 'Create'} Appointment
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Appointments List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming appointments</p>
            <Button 
              onClick={() => setShowNewForm(true)} 
              className="mt-4"
              variant="outline"
            >
              Schedule Your First Appointment
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span className={`px-2 py-1 text-xs rounded-full ${
  appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
  appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
  'bg-gray-100 text-gray-800'
}`}>
  {appointment.status}
</span>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.title}</h3>
                    <p className="text-sm text-gray-600">{appointment.client_name}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{appointment.time}</span>
                      <span>•</span>
                      <span>{appointment.duration} min</span>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(appointment)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(appointment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
