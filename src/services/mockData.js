// ─── Realistic Mock Data ────────────────────────────────────

export const users = [
  { id: 1, name: 'Alex Morgan', email: 'alex.morgan@company.com', role: 'Administrator', status: 'Active', phone: '+1 (555) 123-4567', joinedDate: '2024-01-15', avatar: '#556ee6' },
  { id: 2, name: 'Sarah Williams', email: 'sarah.w@company.com', role: 'Manager', status: 'Active', phone: '+1 (555) 234-5678', joinedDate: '2024-02-20', avatar: '#34c38f' },
  { id: 3, name: 'Michael Chen', email: 'm.chen@company.com', role: 'Editor', status: 'Active', phone: '+1 (555) 345-6789', joinedDate: '2024-03-10', avatar: '#f1b44c' },
  { id: 4, name: 'Emily Rodriguez', email: 'emily.r@company.com', role: 'User', status: 'Active', phone: '+1 (555) 456-7890', joinedDate: '2024-04-05', avatar: '#f46a6a' },
  { id: 5, name: 'James Wilson', email: 'j.wilson@company.com', role: 'Manager', status: 'Inactive', phone: '+1 (555) 567-8901', joinedDate: '2024-05-12', avatar: '#50a5f1' },
  { id: 6, name: 'Olivia Brown', email: 'olivia.b@company.com', role: 'User', status: 'Active', phone: '+1 (555) 678-9012', joinedDate: '2024-06-18', avatar: '#556ee6' },
  { id: 7, name: 'Daniel Kim', email: 'd.kim@company.com', role: 'Editor', status: 'Suspended', phone: '+1 (555) 789-0123', joinedDate: '2024-07-22', avatar: '#34c38f' },
  { id: 8, name: 'Sophia Patel', email: 's.patel@company.com', role: 'User', status: 'Active', phone: '+1 (555) 890-1234', joinedDate: '2024-08-30', avatar: '#f1b44c' },
];

export const orders = [
  { id: 'ORD-10482', customer: 'John Smith', product: 'Premium Plan', amount: 249, status: 'Completed', date: '2026-08-30' },
  { id: 'ORD-10481', customer: 'Maria Garcia', product: 'Enterprise Suite', amount: 1299, status: 'Completed', date: '2026-08-29' },
  { id: 'ORD-10480', customer: 'Robert Johnson', product: 'Starter Pack', amount: 49, status: 'Pending', date: '2026-08-29' },
  { id: 'ORD-10479', customer: 'Lisa Anderson', product: 'Professional Plan', amount: 99, status: 'Processing', date: '2026-08-28' },
  { id: 'ORD-10478', customer: 'David Lee', product: 'Premium Plan', amount: 249, status: 'Cancelled', date: '2026-08-28' },
  { id: 'ORD-10477', customer: 'Jennifer Wang', product: 'Enterprise Suite', amount: 1299, status: 'Completed', date: '2026-08-27' },
  { id: 'ORD-10476', customer: 'Thomas Miller', product: 'Starter Pack', amount: 49, status: 'Completed', date: '2026-08-27' },
  { id: 'ORD-10475', customer: 'Amanda Taylor', product: 'Professional Plan', amount: 99, status: 'Processing', date: '2026-08-26' },
];

export const notifications = [
  { id: 1, title: 'New order received', message: 'John placed a $249 order for Premium Plan.', time: '5 min ago', read: false, type: 'order' },
  { id: 2, title: 'Payment completed', message: 'Payment #PAY-9284 was successfully processed.', time: '20 min ago', read: false, type: 'payment' },
  { id: 3, title: 'User registered', message: 'A new user Sarah Williams has signed up.', time: '1 hour ago', read: true, type: 'user' },
  { id: 4, title: 'Server alert', message: 'CPU usage exceeded 90% on server us-east-1.', time: '2 hours ago', read: true, type: 'alert' },
  { id: 5, title: 'Backup complete', message: 'Daily database backup completed successfully.', time: '6 hours ago', read: true, type: 'system' },
  { id: 6, title: 'New comment', message: 'Michael Chen commented on your report.', time: '8 hours ago', read: true, type: 'comment' },
];

export const calendarEvents = [
  { id: 1, title: 'Team Standup', date: '2026-08-31', time: '09:00', color: '#556ee6', description: 'Daily team sync meeting' },
  { id: 2, title: 'Client Call - Acme Corp', date: '2026-09-01', time: '14:00', color: '#34c38f', description: 'Quarterly review with Acme Corp' },
  { id: 3, title: 'Product Launch', date: '2026-09-05', time: '10:00', color: '#f1b44c', description: 'New product launch event' },
  { id: 4, title: 'Budget Review', date: '2026-08-30', time: '11:00', color: '#f46a6a', description: 'Monthly budget review meeting' },
  { id: 5, title: 'Training Session', date: '2026-09-03', time: '15:00', color: '#50a5f1', description: 'Onboarding training for new hires' },
];

export const dashboardData = {
  kpis: {
    revenue: { value: 24580, change: 12.5, label: 'Revenue', prefix: '$' },
    orders: { value: 1248, change: 8.4, label: 'Orders', prefix: '' },
    customers: { value: 8492, change: 15.2, label: 'Customers', prefix: '' },
    conversion: { value: 4.82, change: -2.1, label: 'Conversion', prefix: '', suffix: '%' },
  },
  revenueChart: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    revenue: [18200, 21500, 19800, 23400, 25100, 22800, 24500, 26800, 24580, 0, 0, 0],
    expenses: [12400, 14200, 13100, 15800, 16500, 15200, 16100, 17900, 16200, 0, 0, 0],
    profit: [5800, 7300, 6700, 7600, 8600, 7600, 8400, 8900, 8380, 0, 0, 0],
  },
  salesChart: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [320, 450, 380, 520, 480, 290, 180],
  },
  trafficSources: [
    { label: 'Direct', value: 35, color: '#556ee6' },
    { label: 'Search', value: 28, color: '#34c38f' },
    { label: 'Social', value: 22, color: '#f1b44c' },
    { label: 'Referral', value: 15, color: '#f46a6a' },
  ],
  recentActivity: [
    { user: 'John Smith', action: 'Created a new order', time: '2 minutes ago', color: '#556ee6' },
    { user: 'Sarah Williams', action: 'Updated customer profile', time: '15 minutes ago', color: '#34c38f' },
    { user: 'Michael Brown', action: 'Completed payment of $1,299', time: '32 minutes ago', color: '#f1b44c' },
    { user: 'Emily Rodriguez', action: 'Submitted a support ticket', time: '1 hour ago', color: '#f46a6a' },
    { user: 'David Lee', action: 'Renewed subscription plan', time: '2 hours ago', color: '#50a5f1' },
  ],
};

// ─── Formatters ─────────────────────────────────────────────
export function formatCurrency(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0 });
}
export function formatNumber(n) {
  return n.toLocaleString('en-US');
}
export function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
