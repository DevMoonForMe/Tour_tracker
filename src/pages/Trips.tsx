import { useState } from 'react';
import { useTripStore } from '../store/useTripStore';
import type { Trip } from '../types';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';

export function Trips() {
  const { trips, addTrip, setActiveTrip, activeTripId, deleteTrip } = useTripStore();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate) return;

    const newTrip: Trip = {
      id: crypto.randomUUID(),
      name: formData.name,
      destination: formData.destination,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      notes: formData.notes,
      createdAt: Date.now()
    };

    addTrip(newTrip);
    setShowForm(false);
    setFormData({ name: '', destination: '', startDate: '', endDate: '', budget: '', notes: '' });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip and all its data?')) {
      deleteTrip(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Trips</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Trip'}
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Create New Trip</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Trip Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. Goa Trip 2026"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Destination</label>
                <input 
                  type="text" 
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. Goa"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Start Date *</label>
                <input 
                  type="date" 
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">End Date</label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Total Budget (Optional)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. 50000"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                rows={2}
              />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                Save Trip
              </button>
            </div>
          </form>
        </div>
      )}

      {trips.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No trips found</h3>
          <p className="text-slate-500 mt-1">Create your first trip to start tracking expenses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map(trip => (
            <div 
              key={trip.id}
              onClick={() => setActiveTrip(trip.id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                activeTripId === trip.id 
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 shadow-md' 
                  : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {trip.name}
                  {activeTripId === trip.id && <CheckCircle className="w-5 h-5 text-primary-600" />}
                </h3>
                <button 
                  onClick={(e) => handleDelete(trip.id, e)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <span className="sr-only">Delete</span>
                  &times;
                </button>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600">
                {trip.destination && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.destination}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(trip.startDate).toLocaleDateString()} {trip.endDate ? `- ${new Date(trip.endDate).toLocaleDateString()}` : ''}</span>
                </div>
                {trip.budget && (
                  <div className="mt-3 inline-block px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium">
                    Budget: ₹{trip.budget.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
