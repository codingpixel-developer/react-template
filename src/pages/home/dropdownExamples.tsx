import { useState } from 'react';
import { Dropdown } from '@/shared/components/ui/dropdown/dropdown';
import type {
  DropdownOption,
  DropdownPage,
  DropdownRequest,
} from '@/shared/components/ui/dropdown/dropdown';

const people = Array.from({ length: 40 }, (_, index) => ({
  id: index + 1,
  label: `Team member ${String(index + 1).padStart(2, '0')}`,
}));
const roles = [
  { id: 'viewer', label: 'Viewer' },
  { id: 'editor', label: 'Editor' },
  { id: 'admin', label: 'Administrator' },
];
const actions = [
  { id: 'view', label: 'View profile' },
  { id: 'settings', label: 'Settings' },
  {
    id: 'delete',
    label: 'Delete account',
    destructive: true,
    dividerBefore: true,
  },
];

function loadPeople({
  search,
  page,
}: DropdownRequest): Promise<DropdownPage<DropdownOption>> {
  const filtered = people.filter((person) =>
    person.label.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const pageSize = 10;
  return Promise.resolve({
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    hasMore: page * pageSize < filtered.length,
  });
}

export function DropdownExamples() {
  const [person, setPerson] = useState<DropdownOption | null>(people[26]);
  const [role, setRole] = useState<(typeof roles)[number] | null>(roles[0]);
  const [lastAction, setLastAction] = useState('');

  return (
    <div className="flex flex-col items-start gap-4">
      <p>
        Search team members and scroll for more. Team member 27 starts selected.
      </p>
      <Dropdown
        label="Team member"
        selectedItem={person}
        onSelect={setPerson}
        queryKey={['dropdown-example', 'people']}
        loadOptions={loadPeople}
      />
      <Dropdown
        label="Role"
        items={roles}
        selectedItem={role}
        onSelect={setRole}
      />
      <Dropdown
        mode="action"
        label="Actions"
        items={actions}
        onSelect={(item) =>
          setLastAction(`${item.label} selected (demo only).`)
        }
      />
      {lastAction && <p role="status">{lastAction}</p>}
    </div>
  );
}
