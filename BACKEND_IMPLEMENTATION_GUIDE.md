# Flask Backend Implementation Guide for Writer Platform

## Overview
This document provides comprehensive specifications for implementing the Python Flask backend for a freelance writer marketplace platform. The frontend is built with React + TypeScript and expects specific API endpoints and response formats.

## Backend Structure (Already Implemented)
```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── extensions.py
│   ├── models/
│   ├── schemas/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── main.py
├── migrations/
├── tests/
├── .env
├── requirements.txt
└── wsgi.py
```

---

## API Specifications

### Base Configuration
- **Base URL**: `https://your-flask-api.com/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token in `Authorization` header
- **CORS**: Must allow frontend origin

---

## 1. Authentication Endpoints

### POST /api/v1/auth/register
**Purpose**: Register a new writer account

**Request Body**:
```json
{
  "email": "writer@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "role": "writer"
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "writer@example.com",
      "full_name": "John Doe",
      "role": "writer",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "access_token": "jwt-token-string",
    "refresh_token": "refresh-token-string"
  }
}
```

**Error Response (400)**:
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists",
    "details": {
      "field": "email"
    }
  }
}
```

---

### POST /api/v1/auth/login
**Purpose**: Authenticate user and return JWT tokens

**Request Body**:
```json
{
  "email": "writer@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "writer@example.com",
      "full_name": "John Doe",
      "role": "writer",
      "profile_complete": true,
      "rating": 4.8,
      "total_orders": 45
    },
    "access_token": "jwt-token-string",
    "refresh_token": "refresh-token-string"
  }
}
```

---

### POST /api/v1/auth/logout
**Purpose**: Invalidate user session
**Headers**: `Authorization: Bearer {token}`

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

### GET /api/v1/auth/me
**Purpose**: Get current user profile
**Headers**: `Authorization: Bearer {token}`

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "writer@example.com",
      "full_name": "John Doe",
      "role": "writer",
      "rating": 4.8,
      "total_orders": 45,
      "completed_orders": 42,
      "success_rate": 93.3,
      "member_since": "2023-06-15T00:00:00Z",
      "bio": "Experienced writer specializing in...",
      "avatar_url": "https://cdn.example.com/avatars/user-id.jpg"
    }
  }
}
```

---

## 2. Orders Endpoints

### GET /api/v1/orders
**Purpose**: Get writer's orders (My Orders page)
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `status` (optional): `all`, `active`, `pending`, `completed`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "orders": [
      {
        "id": "ORD-001",
        "title": "Research Paper on Climate Change",
        "subject": "Environmental Science",
        "type": "Research Paper",
        "pages": 8,
        "deadline": "2024-01-15T23:59:59Z",
        "budget": 120.00,
        "accepted_bid": 115.00,
        "status": "active",
        "progress": 65,
        "client": {
          "id": "client-uuid",
          "name": "John Doe",
          "rating": 4.8
        },
        "description": "Comprehensive analysis of climate change impacts...",
        "created_at": "2024-01-08T10:00:00Z",
        "started_at": "2024-01-08T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3,
      "has_next": true,
      "has_prev": false
    },
    "summary": {
      "total_orders": 45,
      "active": 5,
      "pending": 2,
      "completed": 38,
      "total_earned": 2840.00
    }
  }
}
```

---

### GET /api/v1/orders/{order_id}
**Purpose**: Get detailed order information (Order View page)
**Headers**: `Authorization: Bearer {token}`

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "ORD-001",
      "title": "Research Paper on Climate Change",
      "subject": "Environmental Science",
      "type": "Research Paper",
      "pages": 8,
      "deadline": "2024-01-15T23:59:59Z",
      "budget": 120.00,
      "accepted_bid": 115.00,
      "status": "active",
      "progress": 65,
      "description": "Comprehensive analysis of climate change impacts on global agriculture...",
      "client": {
        "id": "client-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "rating": 4.8
      },
      "requirements": [
        "APA citation style",
        "Minimum 10 scholarly sources",
        "Include data visualizations",
        "Double-spaced, 12pt Times New Roman"
      ],
      "milestones": [
        {
          "id": 1,
          "title": "Research and Outline",
          "status": "completed",
          "due_date": "2024-01-10T23:59:59Z",
          "completed_at": "2024-01-10T15:30:00Z"
        },
        {
          "id": 2,
          "title": "First Draft",
          "status": "completed",
          "due_date": "2024-01-12T23:59:59Z",
          "completed_at": "2024-01-12T18:45:00Z"
        },
        {
          "id": 3,
          "title": "Revisions",
          "status": "in-progress",
          "due_date": "2024-01-14T23:59:59Z",
          "completed_at": null
        },
        {
          "id": 4,
          "title": "Final Submission",
          "status": "pending",
          "due_date": "2024-01-15T23:59:59Z",
          "completed_at": null
        }
      ],
      "files": [
        {
          "id": "file-uuid-1",
          "name": "research-outline.pdf",
          "size": 159744,
          "size_formatted": "156 KB",
          "mime_type": "application/pdf",
          "uploaded_at": "2024-01-10T15:30:00Z",
          "uploaded_by": "writer",
          "download_url": "https://cdn.example.com/files/file-uuid-1"
        }
      ],
      "created_at": "2024-01-08T10:00:00Z",
      "started_at": "2024-01-08T14:30:00Z"
    }
  }
}
```

---

### PATCH /api/v1/orders/{order_id}
**Purpose**: Update order (e.g., update progress, submit milestone)
**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "progress": 75,
  "milestone_id": 3,
  "status": "in-progress"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "ORD-001",
      "progress": 75,
      "updated_at": "2024-01-14T10:30:00Z"
    }
  }
}
```

---

## 3. Bids Endpoints

### GET /api/v1/bids
**Purpose**: Get writer's bids (My Bids page)
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `status` (optional): `all`, `open`, `unconfirmed`, `declined`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "bids": [
      {
        "id": "BID-001",
        "order_id": "ORD-101",
        "order_title": "Marketing Research Paper",
        "subject": "Marketing",
        "bid_amount": 150.00,
        "original_budget": 200.00,
        "status": "open",
        "is_counter_offer": false,
        "message": "I have extensive experience in marketing research...",
        "submitted_date": "2024-01-10T14:30:00Z",
        "response_date": "2024-01-15T10:00:00Z",
        "order_deadline": "2024-01-20T23:59:59Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 23,
      "pages": 2,
      "has_next": true,
      "has_prev": false
    },
    "summary": {
      "total_bids": 23,
      "open": 12,
      "unconfirmed": 3,
      "declined": 8,
      "success_rate": 67
    }
  }
}
```

---

### POST /api/v1/orders/{order_id}/bids
**Purpose**: Place a bid on an available order
**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "bid_amount": 150.00,
  "proposed_deadline": "2024-01-18T23:59:59Z",
  "message": "I have 5+ years of experience in marketing research with published papers..."
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "data": {
    "bid": {
      "id": "BID-024",
      "order_id": "AO-001",
      "bid_amount": 150.00,
      "status": "open",
      "submitted_date": "2024-01-15T11:30:00Z",
      "message": "I have 5+ years of experience..."
    },
    "message": "Bid submitted successfully"
  }
}
```

---

## 4. Available Orders Endpoints

### GET /api/v1/available-orders
**Purpose**: Get available orders for bidding
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `type` (optional): `all`, `invited`
- `subject` (optional): Filter by subject
- `min_budget` (optional): Minimum budget filter
- `max_budget` (optional): Maximum budget filter
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "orders": [
      {
        "id": "AO-001",
        "title": "Business Plan for Tech Startup",
        "subject": "Business",
        "type": "Business Plan",
        "pages": 15,
        "deadline": "2024-01-18T23:59:59Z",
        "budget": 300.00,
        "description": "Comprehensive business plan for a fintech startup...",
        "requirements": "MBA level writing, experience with business plans required",
        "is_invited": false,
        "urgency": "high",
        "bids_count": 12,
        "client": {
          "id": "client-uuid",
          "name": "TechStart Inc.",
          "rating": 4.8,
          "total_orders": 23,
          "completion_rate": 96
        },
        "detailed_requirements": [
          "Executive Summary",
          "Market Analysis and Research",
          "Financial Projections (3-year)"
        ],
        "specifications": {
          "format": "PDF",
          "citation_style": "APA",
          "language": "English (US)",
          "additional_notes": "Please include charts and graphs for financial projections."
        },
        "posted_at": "2024-01-10T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 48,
      "pages": 3,
      "has_next": true,
      "has_prev": false
    },
    "summary": {
      "total_available": 48,
      "invited_orders": 5,
      "avg_budget": 190.00,
      "avg_competition": 8.3
    }
  }
}
```

---

## 5. Notifications Endpoints

### GET /api/v1/notifications
**Purpose**: Get user notifications with pagination
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `is_read` (optional): `true` or `false`
- `type` (optional): `order`, `bid`, `payment`, `review`, `system`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "notif-uuid-1",
        "type": "bid",
        "title": "Bid Accepted",
        "message": "Your bid for 'Marketing Research Paper' has been accepted!",
        "is_read": false,
        "created_at": "2024-01-15T10:30:00Z",
        "details": {
          "order_id": "ORD-101",
          "bid_id": "BID-001",
          "order_title": "Marketing Research Paper"
        }
      },
      {
        "id": "notif-uuid-2",
        "type": "payment",
        "title": "Payment Received",
        "message": "Payment of $115.00 has been credited to your account",
        "is_read": true,
        "created_at": "2024-01-14T15:20:00Z",
        "details": {
          "amount": 115.00,
          "order_id": "ORD-095"
        }
      }
    ],
    "unread_count": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "pages": 8,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

### PATCH /api/v1/notifications/{notification_id}/read
**Purpose**: Mark single notification as read
**Headers**: `Authorization: Bearer {token}`

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "id": "notif-uuid-1",
    "is_read": true
  }
}
```

---

### POST /api/v1/notifications/mark-all-read
**Purpose**: Mark all notifications as read
**Headers**: `Authorization: Bearer {token}`

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "message": "All notifications marked as read",
    "count": 5
  }
}
```

---

## 6. Balance & Payments Endpoints

### GET /api/v1/balance
**Purpose**: Get writer's balance information
**Headers**: `Authorization: Bearer {token}`

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "balance": {
      "available": 1245.50,
      "pending": 380.00,
      "total_earned": 12450.00,
      "total_withdrawn": 11204.50,
      "currency": "USD"
    }
  }
}
```

---

### GET /api/v1/transactions
**Purpose**: Get transaction history
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `type` (optional): `all`, `credit`, `debit`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "txn-uuid-1",
        "type": "credit",
        "amount": 115.00,
        "description": "Payment for Order #ORD-095",
        "status": "completed",
        "reference": "ORD-095",
        "created_at": "2024-01-14T15:20:00Z",
        "balance_after": 1245.50
      },
      {
        "id": "txn-uuid-2",
        "type": "debit",
        "amount": 500.00,
        "description": "Withdrawal to Bank Account",
        "status": "completed",
        "reference": "WD-042",
        "created_at": "2024-01-10T10:00:00Z",
        "balance_after": 1130.50
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

### POST /api/v1/withdrawals
**Purpose**: Request withdrawal
**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "amount": 500.00,
  "method": "bank_transfer",
  "account_details": {
    "account_number": "1234567890",
    "bank_name": "Example Bank",
    "account_holder": "John Doe"
  }
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "data": {
    "withdrawal": {
      "id": "WD-043",
      "amount": 500.00,
      "status": "pending",
      "method": "bank_transfer",
      "requested_at": "2024-01-15T14:30:00Z",
      "estimated_completion": "2024-01-17T00:00:00Z"
    },
    "message": "Withdrawal request submitted successfully"
  }
}
```

---

## 7. Chats & Messages Endpoints

### GET /api/v1/chats
**Purpose**: Get user's chat conversations
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "chats": [
      {
        "id": "chat-uuid-1",
        "order_id": "ORD-001",
        "order_title": "Research Paper on Climate Change",
        "participant": {
          "id": "client-uuid",
          "name": "John Doe",
          "avatar_url": "https://cdn.example.com/avatars/user.jpg",
          "role": "client"
        },
        "last_message": {
          "content": "Can you send me the first draft by tomorrow?",
          "sent_at": "2024-01-14T18:30:00Z",
          "sender_id": "client-uuid"
        },
        "unread_count": 2,
        "updated_at": "2024-01-14T18:30:00Z"
      }
    ],
    "unread_total": 12,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

---

### GET /api/v1/chats/{chat_id}/messages
**Purpose**: Get messages in a chat
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "id": "msg-uuid-1",
        "chat_id": "chat-uuid-1",
        "sender": {
          "id": "client-uuid",
          "name": "John Doe",
          "role": "client"
        },
        "content": "Can you send me the first draft by tomorrow?",
        "attachments": [],
        "is_read": true,
        "sent_at": "2024-01-14T18:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 24,
      "pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

---

### POST /api/v1/chats/{chat_id}/messages
**Purpose**: Send a message in a chat
**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "content": "Yes, I'll send the first draft by 5 PM tomorrow.",
  "attachments": []
}
```

**Success Response (201)**:
```json
{
  "status": "success",
  "data": {
    "message": {
      "id": "msg-uuid-2",
      "chat_id": "chat-uuid-1",
      "content": "Yes, I'll send the first draft by 5 PM tomorrow.",
      "sent_at": "2024-01-14T19:00:00Z",
      "is_read": false
    }
  }
}
```

---

## 8. Leaderboard Endpoint

### GET /api/v1/leaderboard
**Purpose**: Get leaderboard rankings
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `period` (optional): `all-time`, `monthly`, `weekly` (default: `all-time`)
- `limit` (optional): Number of top writers (default: 50)

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "current_user_position": {
      "rank": 12,
      "writer": {
        "id": "current-user-uuid",
        "name": "John Doe",
        "avatar_url": "https://cdn.example.com/avatars/user.jpg",
        "rating": 4.8
      },
      "orders_completed": 42,
      "total_earned": 5240.00,
      "success_rate": 93.3
    },
    "leaderboard": [
      {
        "rank": 1,
        "writer": {
          "id": "writer-uuid-1",
          "name": "Sarah Johnson",
          "avatar_url": "https://cdn.example.com/avatars/sarah.jpg",
          "rating": 4.9
        },
        "orders_completed": 158,
        "total_earned": 28450.00,
        "success_rate": 98.7
      },
      {
        "rank": 2,
        "writer": {
          "id": "writer-uuid-2",
          "name": "Michael Chen",
          "avatar_url": "https://cdn.example.com/avatars/michael.jpg",
          "rating": 4.95
        },
        "orders_completed": 142,
        "total_earned": 26780.00,
        "success_rate": 97.2
      }
    ],
    "period": "all-time",
    "updated_at": "2024-01-15T00:00:00Z"
  }
}
```

---

## 9. Profile Endpoints

### GET /api/v1/profile
**Purpose**: Get writer's profile
**Headers**: `Authorization: Bearer {token}`

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "profile": {
      "id": "user-uuid",
      "email": "writer@example.com",
      "full_name": "John Doe",
      "role": "writer",
      "avatar_url": "https://cdn.example.com/avatars/user.jpg",
      "bio": "Experienced writer with 5+ years in academic writing...",
      "rating": 4.8,
      "total_orders": 45,
      "completed_orders": 42,
      "success_rate": 93.3,
      "specializations": ["Business", "Marketing", "Research"],
      "education": "MBA, Marketing",
      "languages": ["English", "Spanish"],
      "member_since": "2023-06-15T00:00:00Z",
      "total_earned": 12450.00,
      "verified": true
    }
  }
}
```

---

### PATCH /api/v1/profile
**Purpose**: Update writer's profile
**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "full_name": "John Doe",
  "bio": "Updated bio text...",
  "specializations": ["Business", "Marketing", "Finance"],
  "education": "MBA, Marketing",
  "languages": ["English", "Spanish", "French"]
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "profile": {
      "id": "user-uuid",
      "full_name": "John Doe",
      "bio": "Updated bio text...",
      "updated_at": "2024-01-15T14:30:00Z"
    },
    "message": "Profile updated successfully"
  }
}
```

---

## General Requirements

### Error Response Format
All error responses should follow this structure:

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid input data (400)
- `UNAUTHORIZED`: Missing or invalid authentication (401)
- `FORBIDDEN`: Insufficient permissions (403)
- `NOT_FOUND`: Resource not found (404)
- `CONFLICT`: Resource conflict (409)
- `UNPROCESSABLE_ENTITY`: Valid syntax but unable to process (422)
- `INTERNAL_ERROR`: Server error (500)

### HTTP Status Codes
- **200 OK**: Successful GET/PATCH request
- **201 Created**: Successful POST request creating new resource
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing/invalid authentication
- **403 Forbidden**: Valid auth but insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **422 Unprocessable Entity**: Validation failed
- **500 Internal Server Error**: Server error

### Required Headers
- **Content-Type**: `application/json`
- **Authorization**: `Bearer {jwt-token}` (for authenticated endpoints)

### Pagination Format
All paginated endpoints must return:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### Date/Time Format
- Use ISO 8601 format: `2024-01-15T10:30:00Z`
- All timestamps in UTC

### Security Requirements
1. **JWT Authentication**: Use secure JWT tokens with expiration
2. **Rate Limiting**: Implement rate limiting per user/IP
3. **Input Validation**: Validate all inputs server-side
4. **SQL Injection Prevention**: Use parameterized queries
5. **HTTPS Only**: Enforce HTTPS in production
6. **CORS**: Configure proper CORS headers

---

## Implementation Steps

### Step 1: Update Route Files
Ensure all route blueprints in `app/routes/` match the specifications above.

### Step 2: Service Layer Implementation
Implement business logic in `app/services/` for:
- Order management
- Bid processing
- Notification handling
- Payment processing
- Chat functionality

### Step 3: Database Models
Verify models in `app/models/` have all required fields and relationships.

### Step 4: Pagination Utility
Update `app/utils/pagination.py` to return the standard pagination format.

### Step 5: Response Formatter
Ensure `app/utils/response_formatter.py` uses the standard response format:
```python
def success_response(data, status=200):
    return jsonify({
        "status": "success",
        "data": data
    }), status

def error_response(code, message, details=None, status=400):
    return jsonify({
        "status": "error",
        "error": {
            "code": code,
            "message": message,
            "details": details or {}
        }
    }), status
```

### Step 6: Authentication Middleware
Implement JWT authentication decorator for protected routes.

### Step 7: Error Handlers
Set up global error handlers for common exceptions.

### Step 8: Testing
Write tests in `tests/` for all endpoints.

---

## Additional Notes

### File Upload Handling
For file uploads (profile pictures, order submissions):
- Use multipart/form-data
- Store files in cloud storage (AWS S3, etc.)
- Return CDN URLs in responses

### Real-time Features
For real-time chat and notifications:
- Consider implementing WebSocket support
- Use Socket.IO or similar library
- Emit events for new messages/notifications

### Background Tasks
For async operations (email sending, report generation):
- Use Celery with Redis/RabbitMQ
- Queue heavy operations

---

## Contact & Support
If you need clarification on any endpoint or response format, refer to the existing Flask structure and maintain consistency with the patterns already established in your codebase.

Good luck with the implementation! 🚀
