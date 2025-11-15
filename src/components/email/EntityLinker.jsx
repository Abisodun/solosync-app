import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, FolderKanban, FileText, Users, CheckSquare } from 'lucide-react';

const ENTITY_TYPES = [
  { value: 'Project', label: 'Project', icon: FolderKanban },
  { value: 'Invoice', label: 'Invoice', icon: FileText },
  { value: 'Client', label: 'Client', icon: Users },
  { value: 'Task', label: 'Task', icon: CheckSquare }
];

export default function EntityLinker({ selectedEntity, onSelect, onClose }) {
  const [entityType, setEntityType] = useState(selectedEntity?.type || 'Project');

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ['link-entities', entityType],
    queryFn: async () => {
      return await base44.entities[entityType].list();
    },
    enabled: !!entityType
  });

  const handleSelectEntity = (entityId) => {
    const entity = entities.find(e => e.id === entityId);
    onSelect({ id: entityId, type: entityType, name: entity.name || entity.title || entity.invoice_number });
    onClose();
  };

  const selectedTypeConfig = ENTITY_TYPES.find(t => t.value === entityType);
  const Icon = selectedTypeConfig?.icon || FolderKanban;

  return (
    <Card className="p-4 rounded-[12px] bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">Link to Entity</h4>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="rounded-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading ? (
          <div className="text-center text-gray-500 py-4">Loading...</div>
        ) : entities.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No {entityType.toLowerCase()}s found</div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-2">
            {entities.slice(0, 10).map(entity => (
              <button
                key={entity.id}
                onClick={() => handleSelectEntity(entity.id)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-[10px] hover:bg-blue-50 transition-colors text-left border border-gray-200"
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-800 truncate">
                  {entity.name || entity.title || entity.invoice_number || entity.client_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}