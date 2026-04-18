# Frontend Integration Guide - Updated Backend API

## 🔄 CRITICAL CHANGE: Auth Token Required

The backend now requires **user auth tokens** for authenticated requests. This is a **BREAKING CHANGE** from the previous implementation.

---

## 🔐 Authentication Flow

### **1. User Logs In (PocketBase)**
```javascript
// Frontend uses pocketbaseClient to authenticate
const authData = await pb.collection('users').authWithPassword(
  email,
  password
);

// Get the auth token
const userToken = pb.authStore.token;

// Store token for API requests
localStorage.setItem('userToken', userToken);
```

### **2. Make Authenticated API Requests**
```javascript
// Include token in Authorization header
const response = await apiServerClient.fetch('/properties', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(propertyData)
});

const result = await response.json();
```

---

## 📄 API Endpoints

### **Health Check (No Auth Required)**
```javascript
GET /health

Response: { status: 'ok' }
```

### **Create Property (Auth Required)**
```javascript
POST /properties

Headers:
  Authorization: Bearer {userToken}
  Content-Type: application/json

Body:
{
  title: string,
  description: string,
  city: string,
  propertyType: string,
  price: number,
  area: number,
  areaUnit: string,
  // ... other fields
}

Response: { id, title, city, ... }
```

### **Get Properties (Public - No Auth)**
```javascript
GET /properties?page=1&limit=20&search=query

Response:
{
  items: [...],
  page: 1,
  perPage: 20,
  totalItems: 100,
  totalPages: 5
}
```

### **Search Properties (Public - No Auth)**
```javascript
GET /properties/search?city=Mumbai&propertyType=Apartment&minPrice=1000000

Query Parameters:
  - city: string
  - propertyType: string
  - propertySubType: string
  - tenure: string
  - bhk: string
  - minArea: number
  - maxArea: number
  - areaUnit: string (default: 'sqft')
  - minPrice: number
  - maxPrice: number
  - page: number (default: 1)
  - limit: number (default: 20, max: 100)

Response:
{
  items: [...],
  page: 1,
  perPage: 20,
  totalItems: 100,
  totalPages: 5
}
```

### **Get Single Property (Public - No Auth)**
```javascript
GET /properties/:id

Response: { id, title, city, ... }
```

### **Update Property (Auth Required)**
```javascript
PUT /properties/:id

Headers:
  Authorization: Bearer {userToken}
  Content-Type: application/json

Body:
{
  title: string,
  description: string,
  // ... fields to update
}

Response:
{
  success: true,
  property: { id, title, ... }
}
```

### **Admin Login**
```javascript
POST /admin/login

Body:
{
  email: string,
  password: string
}

Response:
{
  success: true,
  token: string,
  admin: { id, email, name }
}
```

### **Get Admin Properties**
```javascript
GET /admin/properties?page=1&limit=20&status=pending

Headers:
  Authorization: Bearer {adminToken}

Query Parameters:
  - page: number
  - limit: number
  - status: 'pending' | 'approved' | 'rejected' | 'suspended'
  - search: string
  - city: string
  - propertyType: string
  - dateFilter: 'alltime' | 'today' | '7days' | '30days' | '90days'

Response:
{
  items: [...],
  page: 1,
  perPage: 20,
  totalItems: 100,
  totalPages: 5
}
```

### **Update Property Status (Admin)**
```javascript
PATCH /admin/properties/:id/status

Headers:
  Authorization: Bearer {adminToken}
  Content-Type: application/json

Body:
{
  status: 'approved' | 'rejected' | 'suspended',
  rejection_reason: string (optional, for rejected status)
}

Response: { id, status, ... }
```

### **Send WhatsApp OTP**
```javascript
POST /whatsapp/send-otp

Body:
{
  phoneNumber: string,
  otp: string (optional, default: '000000')
}

Response:
{
  success: true,
  message: 'OTP sent on WhatsApp',
  data: { messages: [...] }
}
```

### **Verify WhatsApp OTP**
```javascript
POST /whatsapp/verify-otp

Body:
{
  phoneNumber: string,
  otp: string
}

Response:
{
  success: true,
  message: 'OTP Verified Successfully',
  redirectUrl: '/'
}
```

---

## 💫 Error Handling

### **Error Response Format**
```javascript
{
  error: string,  // Error message
  details: string // (development only) Additional details
}
```

### **Common Error Codes**

| Status | Error | Meaning |
|--------|-------|----------|
| 400 | Bad Request | Missing required parameters |
| 401 | Unauthorized | Missing or invalid auth token |
| 404 | Not Found | Resource not found |
| 503 | Service Unavailable | PocketBase connection failed |
| 504 | Gateway Timeout | Request took > 5 seconds |
| 500 | Internal Server Error | Server error |

### **Example Error Handling**
```javascript
try {
  const response = await apiServerClient.fetch('/properties', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(propertyData)
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`Error ${response.status}: ${error.error}`);
    
    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      window.location.href = '/login';
    } else if (response.status === 503 || response.status === 504) {
      // Backend/PocketBase unavailable
      console.error('Backend service temporarily unavailable');
    }
    return;
  }

  const result = await response.json();
  console.log('Success:', result);
} catch (error) {
  console.error('Network error:', error);
}
```

---

## 🔍 Request/Response Examples

### **Create Property**
```javascript
// Frontend code
const userToken = localStorage.getItem('userToken');

const propertyData = {
  title: 'Beautiful 2BHK Apartment',
  description: 'Spacious apartment in prime location',
  city: 'Mumbai',
  propertyType: 'Apartment',
  propertySubType: 'Flat',
  price: 5000000,
  area: 1200,
  areaUnit: 'sqft',
  bhk: '2',
  tenure: 'Freehold',
  address: '123 Main Street, Mumbai',
  amenities: ['Parking', 'Gym', 'Pool'],
  images: ['url1', 'url2'],
  termsAccepted: true
};

const response = await apiServerClient.fetch('/properties', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(propertyData)
});

const createdProperty = await response.json();
console.log('Property created:', createdProperty.id);
```

### **Search Properties**
```javascript
// Frontend code
const searchParams = new URLSearchParams({
  city: 'Mumbai',
  propertyType: 'Apartment',
  minPrice: 1000000,
  maxPrice: 10000000,
  minArea: 500,
  maxArea: 3000,
  areaUnit: 'sqft',
  page: 1,
  limit: 20
});

const response = await apiServerClient.fetch(
  `/properties/search?${searchParams}`
);

const results = await response.json();
console.log(`Found ${results.totalItems} properties`);
console.log('Items:', results.items);
```

### **Update Property**
```javascript
// Frontend code
const userToken = localStorage.getItem('userToken');
const propertyId = 'abc123';

const updateData = {
  title: 'Updated Title',
  price: 5500000
};

const response = await apiServerClient.fetch(
  `/properties/${propertyId}`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  }
);

const result = await response.json();
console.log('Property updated:', result.property);
```

---

## ⚠️ IMPORTANT NOTES

1. **Always Include Auth Token**: For authenticated endpoints, always include the `Authorization: Bearer {token}` header.

2. **Token Expiration**: Admin tokens expire after 24 hours. Implement token refresh logic if needed.

3. **CORS**: The backend allows requests from any origin (CORS_ORIGIN=*). This is configured for development.

4. **Request Timeout**: All backend requests have a 5-second timeout. Long-running operations may fail.

5. **Phone Number Sanitization**: Phone numbers in descriptions and addresses are automatically sanitized (replaced with **********) for privacy.

6. **Sensitive Fields**: The following fields are removed from public property responses:
   - owner_phone
   - owner_email
   - owner_name

7. **Pagination**: Default page size is 20, maximum is 100.

---

## 🚀 Quick Start

```javascript
// 1. User logs in with PocketBase
const authData = await pb.collection('users').authWithPassword(email, password);
const userToken = pb.authStore.token;

// 2. Create a property
const response = await apiServerClient.fetch('/properties', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(propertyData)
});

const property = await response.json();
console.log('Property created:', property.id);

// 3. Search properties (no auth needed)
const searchResponse = await apiServerClient.fetch(
  '/properties/search?city=Mumbai&propertyType=Apartment'
);

const results = await searchResponse.json();
console.log('Found properties:', results.items);
```

---

## 📄 Migration Checklist

- [ ] Update all API calls to include `Authorization` header with user token
- [ ] Update error handling for 401 (unauthorized) responses
- [ ] Update error handling for 503/504 (service unavailable) responses
- [ ] Test all authenticated endpoints with valid tokens
- [ ] Test all public endpoints without tokens
- [ ] Verify token is stored and retrieved correctly
- [ ] Implement token refresh logic if needed
- [ ] Test error scenarios (invalid token, expired token, etc.)
- [ ] Update API documentation
- [ ] Update unit tests

---

## 🚨 Troubleshooting

### **401 Unauthorized Error**
- Verify token is being sent in Authorization header
- Check that token is valid and not expired
- Verify user is authenticated in PocketBase
- Try logging in again to get a fresh token

### **503/504 Service Unavailable**
- Verify PocketBase is running
- Check network connectivity to PocketBase
- Check PocketBase logs for errors
- Verify POCKETBASE_URL in backend .env

### **400 Bad Request**
- Verify all required fields are included
- Check field types and formats
- Verify query parameters are correct

### **Network Timeout**
- Check network latency
- Verify PocketBase is responding
- Try again after a few seconds

---

**For questions or issues, contact the backend team.** 🚀