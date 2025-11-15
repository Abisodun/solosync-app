import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { User, Building } from 'lucide-react';

export default function ContactSelector({ value, onChange, placeholder, disabled }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list()
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  // Combine contacts and clients
  const allContacts = [
    ...contacts.map(c => ({ name: c.name, email: c.email, type: 'contact', company: c.company })),
    ...clients.map(c => ({ name: c.name, email: c.email, type: 'client', company: c.company }))
  ];

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  const handleSelectContact = (contact) => {
    const emails = inputValue.split(',').map(e => e.trim()).filter(e => e);
    emails.push(contact.email);
    const newValue = emails.join(', ');
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(false);
  };

  // Filter contacts based on input
  const lastEmail = inputValue.split(',').map(e => e.trim()).pop() || '';
  const filteredContacts = allContacts.filter(c => 
    c.name.toLowerCase().includes(lastEmail.toLowerCase()) ||
    c.email.toLowerCase().includes(lastEmail.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="relative flex-1">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(inputValue.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="rounded-[10px]"
        disabled={disabled}
      />

      {showSuggestions && filteredContacts.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto" style={{ background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {filteredContacts.map((contact, index) => (
            <button
              key={index}
              onClick={() => handleSelectContact(contact)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {contact.type === 'client' ? (
                    <Building className="w-4 h-4 text-blue-600" />
                  ) : (
                    <User className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{contact.name}</div>
                  <div className="text-sm text-gray-500">{contact.email}</div>
                  {contact.company && (
                    <div className="text-xs text-gray-400">{contact.company}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}