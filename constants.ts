export const SUBSCRIPTION_KEYWORDS = [
  'subscription',
  'receipt',
  'invoice',
  'charge',
  'billing',
  'renewal',
  'renew',
  'auto-renew',
  'recurring',
  'membership',
  'paid plan',
  'order confirmation',
  'payment confirmed',
  'thank you for your payment',
  'your plan',
  'your account',
]

export const CONFIDENCE_THRESHOLD = 0.5

export const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'one-time', label: 'One-time' },
] as const

export const SUBSCRIPTION_CATEGORIES = [
  'Productivity',
  'Entertainment',
  'Cloud Storage',
  'Developer Tools',
  'Design',
  'Marketing',
  'Finance',
  'Communication',
  'Security',
  'Education',
  'Health & Fitness',
  'News & Media',
  'Other',
]

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
]

export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.metadata',
].join(' ')

export const MICROSOFT_OAUTH_SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'Mail.Read',
  'MailboxSettings.Read',
].join(' ')

export const MICROSOFT_AUTHORITY = 'https://login.microsoftonline.com/common/oauth2/v2.0'
