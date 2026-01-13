// Initialize demo user in localStorage for testing
export function initializeDemoUser() {
  if (typeof window === 'undefined') return;

  const existingUsers = localStorage.getItem('bulkbuddy_users');
  
  // Only initialize if no users exist
  if (!existingUsers) {
    const demoUsers = {
      'demo@bulkbuddy.com': {
        id: '1',
        name: 'John Doe',
        email: 'demo@bulkbuddy.com',
        userType: 'buyer' as const,
        company: 'Demo Company',
        location: 'Pune MIDC',
        createdAt: new Date().toISOString(),
        password: btoa('demo123'), // Base64 encoded "demo123"
      },
      'supplier@bulkbuddy.com': {
        id: '2',
        name: 'Jane Smith',
        email: 'supplier@bulkbuddy.com',
        userType: 'supplier' as const,
        company: 'Demo Supplies Inc',
        location: 'Pune MIDC',
        createdAt: new Date().toISOString(),
        password: btoa('demo123'),
      },
    };

    localStorage.setItem('bulkbuddy_users', JSON.stringify(demoUsers));
  }
}
