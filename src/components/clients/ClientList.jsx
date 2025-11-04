import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Edit2, Trash2, Eye, Search, Mail, Phone, Building2 } from 'lucide-react';

const statusConfig = {
  active: { color: 'bg-green-100 text-green-700', label: 'Active' },
  inactive: { color: 'bg-gray-100 text-gray-700', label: 'Inactive' },
  lead: { color: 'bg-blue-100 text-blue-700', label: 'Lead' }
};

export default function ClientList({ clients, onEdit, onDelete, onView }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  if (!clients || clients.length === 0) {
    return (
      <Card className="p-8 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div
          className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
        >
          <Users className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No clients yet</h3>
        <p className="text-gray-500">Add your first client to start managing your relationships</p>
      </Card>
    );
  }

  // Filter clients
  let filteredClients = clients.filter(client => {
    const matchesSearch = searchQuery === '' || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort clients
  filteredClients = [...filteredClients].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === '-total_invoiced') {
      return (b.total_invoiced || 0) - (a.total_invoiced || 0);
    } else if (sortBy === '-last_invoice') {
      if (!a.last_invoice_date) return 1;
      if (!b.last_invoice_date) return -1;
      return new Date(b.last_invoice_date) - new Date(a.last_invoice_date);
    }
    return 0;
  });

  return (
    <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
      {/* Header with Filters */}
      <div className="mb-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Clients</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-[12px] pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-[10px] w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="rounded-[10px] w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="-total_invoiced">Highest Revenue</SelectItem>
              <SelectItem value="-last_invoice">Recent Invoice</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const config = statusConfig[client.status];
          
          return (
            <Card
              key={client.id}
              className="p-5 rounded-[16px] hover:shadow-lg transition-all cursor-pointer"
              style={{ background: 'rgba(249, 250, 251, 0.8)' }}
              onClick={() => onView(client)}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-[12px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Badge className={`${config.color} text-xs`}>
                  {config.label}
                </Badge>
              </div>

              <h4 className="font-bold text-gray-800 mb-1 truncate">{client.name}</h4>
              {client.company && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate">{client.company}</span>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                )}
              </div>

              {(client.total_invoiced > 0 || client.total_paid > 0) && (
                <div className="pt-3 border-t border-gray-200 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Total Invoiced:</span>
                    <span className="font-semibold text-gray-800">${(client.total_invoiced || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-semibold text-green-600">${(client.total_paid || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(client);
                  }}
                  className="flex-1 rounded-[10px]"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(client);
                  }}
                  className="rounded-[10px]"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
                      onDelete(client.id);
                    }
                  }}
                  className="rounded-[10px] hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No clients found matching your search
        </div>
      )}
    </Card>
  );
}