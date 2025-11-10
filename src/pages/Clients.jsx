
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ClientForm from '../components/clients/ClientForm';
import ClientList from '../components/clients/ClientList';
import ClientView from '../components/clients/ClientView';
import Sidebar from '../components/common/Sidebar';

export default function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);

  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        return await base44.entities.Client.list('name', 500);
      } catch (error) {
        console.error('Error loading clients:', error);
        return [];
      }
    }
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        return await base44.entities.Invoice.list('-issue_date', 500);
      } catch (error) {
        console.error('Error loading invoices:', error);
        return [];
      }
    }
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      try {
        return await base44.entities.Transaction.list('-date', 500);
      } catch (error) {
        console.error('Error loading transactions:', error);
        return [];
      }
    }
  });

  const createClientMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating client:', error);
      alert('Failed to create client. Please try again.');
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      resetForm();
      setViewingClient(null);
    },
    onError: (error) => {
      console.error('Error updating client:', error);
      alert('Failed to update client. Please try again.');
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
    onError: (error) => {
      console.error('Error deleting client:', error);
      alert('Failed to delete client. Please try again.');
    }
  });

  const resetForm = () => {
    setEditingClient(null);
    setShowForm(false);
  };

  const handleSubmit = async (data) => {
    if (editingClient) {
      await updateClientMutation.mutateAsync({ id: editingClient.id, data });
    } else {
      await createClientMutation.mutateAsync(data);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
    setViewingClient(null);
  };

  const handleView = (client) => {
    setViewingClient(client);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <Sidebar currentPage="Clients" />
      
      <div style={{
        marginLeft: '260px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '32px 24px'
      }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Client Management</h1>
            <p className="text-gray-600 mt-1">Manage your client relationships and history</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingClient(null);
            }}
            className="rounded-[14px] text-white"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
            aria-label="Add new client"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Client
          </Button>
        </div>

        {/* Client Form */}
        <AnimatePresence>
          {showForm && (
            <ClientForm
              client={editingClient}
              onSubmit={handleSubmit}
              onCancel={resetForm}
            />
          )}
        </AnimatePresence>

        {/* Client List */}
        <ClientList
          clients={clients}
          onEdit={handleEdit}
          onDelete={(id) => deleteClientMutation.mutate(id)}
          onView={handleView}
        />

        {/* Client View Modal */}
        <AnimatePresence>
          {viewingClient && (
            <ClientView
              client={viewingClient}
              invoices={invoices}
              transactions={transactions}
              onClose={() => setViewingClient(null)}
              onEdit={handleEdit}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
