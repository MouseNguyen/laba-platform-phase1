export const ROLE_COLORS = {
  super_admin: { bg: 'bg-green-100', text: 'text-green-800', label: 'Super Admin' },
  admin: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Admin' },
  manager: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Manager' },
  staff: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Staff' },
  customer: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Customer' },
};

export function getRoleBadgeClass(role: string): string {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.customer;
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`;
}

export function getRoleLabel(role: string): string {
  return ROLE_COLORS[role]?.label || 'Customer';
}