'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Activity,
  Database,
  LogOut,
  RefreshCw,
  Download,
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DatabaseAppointment } from '@/types';

interface AdminStats {
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalUsers: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  appointmentsThisMonth: number;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats>({
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalUsers: 0,
    appointmentsToday: 0,
    appointmentsThisWeek: 0,
    appointmentsThisMonth: 0
  });

  const [appointments, setAppointments] = useState<DatabaseAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAppointmentDetails, setShowAppointmentDetails] = useState<DatabaseAppointment | null>(null);

  // Check if user is admin
  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(',').includes(user?.id || '');

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, router]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch appointments
      const appointmentsResponse = await fetch('/api/admin/appointments');
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/';
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh data
        fetchDashboardData();
        // Close details modal if open
        setShowAppointmentDetails(null);
      } else {
        alert('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status');
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh data
        fetchDashboardData();
        // Close details modal if open
        setShowAppointmentDetails(null);
      } else {
        alert('Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = searchTerm === '' ||
      apt.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone.includes(searchTerm);

    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'confirmed':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Database className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl text-slate-800 dark:text-slate-200">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Admin: {user?.firstName} {user?.lastName}
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Appointments</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.totalAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Scheduled</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.scheduledAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.completedAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Today's Appointments</p>
                <p className="text-3xl font-bold">{stats.appointmentsToday}</p>
              </div>
              <BarChart3 className="w-8 h-8 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">This Week</p>
                <p className="text-3xl font-bold">{stats.appointmentsThisWeek}</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">This Month</p>
                <p className="text-3xl font-bold">{stats.appointmentsThisMonth}</p>
              </div>
              <Activity className="w-8 h-8 opacity-50" />
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Recent Appointments</h2>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white w-full md:w-64"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-600 dark:text-slate-400">Loading appointments...</span>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {appointment.fullName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            ID: {appointment.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 dark:text-slate-100">{appointment.email}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{appointment.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 dark:text-slate-100">{appointment.doctor}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{appointment.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 dark:text-slate-100">
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowAppointmentDetails(appointment)}
                              className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {appointment.status === 'scheduled' && (
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id!, 'completed')}
                                className="p-1 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                                title="Mark as completed"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {appointment.status === 'scheduled' && (
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id!, 'cancelled')}
                                className="p-1 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                title="Cancel appointment"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => deleteAppointment(appointment.id!)}
                              className="p-1 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Delete appointment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showAppointmentDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Appointment Details
                </h3>
                <button
                  onClick={() => setShowAppointmentDetails(null)}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Patient Name</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{showAppointmentDetails.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{showAppointmentDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{showAppointmentDetails.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(showAppointmentDetails.status)}`}>
                    {getStatusIcon(showAppointmentDetails.status)}
                    {showAppointmentDetails.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Doctor</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{showAppointmentDetails.doctor}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Department</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{showAppointmentDetails.department}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Date</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {new Date(showAppointmentDetails.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Time</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{showAppointmentDetails.time}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Address</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{showAppointmentDetails.address}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Created</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {new Date(showAppointmentDetails.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Symptoms / Reason</p>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">{showAppointmentDetails.reason}</p>
              </div>

              {showAppointmentDetails.symptoms && (
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Additional Symptoms</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">{showAppointmentDetails.symptoms}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAppointmentDetails(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>

              {showAppointmentDetails.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => updateAppointmentStatus(showAppointmentDetails.id!, 'completed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(showAppointmentDetails.id!, 'cancelled')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}

              <button
                onClick={() => deleteAppointment(showAppointmentDetails.id!)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};