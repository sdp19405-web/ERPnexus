# Warehouse API Documentation

## Overview

This document describes the API endpoints and data structures for the Warehouse Management System backend integration. The current implementation uses localStorage for demonstration; these endpoints should be implemented on your backend server.

## Base URL

```
https://api.example.com/api/warehouse
```

## Authentication

All endpoints require Bearer token authentication in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Standard Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {},
  "timestamp": "2024-07-28T10:30:45.123Z"
}
```

### Error Response (400/500)

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-07-28T10:30:45.123Z"
}
```

## Receiving Management

### Get All Receiving Records

```
GET /receiving
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rec_001",
      "grnNo": "GRN-2024-001",
      "poNumber": "PO-7743",
      "vendor": "Steel Corp India",
      "items": "500 MT Steel Sheets",
      "quantity": "500 MT",
      "warehouse": "WH-01 Mumbai",
      "inspector": "Raj K.",
      "date": "2024-06-28",
      "status": "Accepted",
      "createdAt": "2024-06-28T10:00:00Z",
      "updatedAt": "2024-06-28T10:00:00Z"
    }
  ]
}
```

### Get Receiving Record by ID

```
GET /receiving/:id
Authorization: Bearer <token>
```

**Response:** Single receiving record object

### Create Receiving Record

```
POST /receiving
Authorization: Bearer <token>
Content-Type: application/json

{
  "grnNo": "GRN-2024-002",
  "poNumber": "PO-7744",
  "vendor": "Steel Corp India",
  "items": "300 MT Steel Plates",
  "quantity": "300 MT",
  "warehouse": "WH-01 Mumbai",
  "inspector": "Priya S.",
  "date": "2024-07-28",
  "status": "Pending"
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "rec_002",
    "grnNo": "GRN-2024-002",
    ...
  }
}
```

### Update Receiving Record

```
PUT /receiving/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Rejected",
  "inspector": "Raj K."
}
```

### Delete Receiving Record

```
DELETE /receiving/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

## Picking Management

### Get All Picking Orders

```
GET /picking
Authorization: Bearer <token>
```

**Response Data Structure:**
```json
{
  "id": "pick_001",
  "pickId": "PICK-2024-001",
  "soNumber": "SO-5582",
  "customer": "Automotive Corp",
  "zone": "Zone-A1",
  "picker": "Ravi D.",
  "itemCount": "25",
  "priority": "High",
  "dueDate": "2024-07-28",
  "status": "In Progress",
  "createdAt": "2024-07-27T14:30:00Z",
  "updatedAt": "2024-07-28T09:15:00Z"
}
```

### Create Picking Order

```
POST /picking
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickId": "PICK-2024-002",
  "soNumber": "SO-5583",
  "customer": "Automotive Corp",
  "zone": "Zone-B2",
  "picker": "Suresh K.",
  "itemCount": "18",
  "priority": "Medium",
  "dueDate": "2024-07-30",
  "status": "Pending"
}
```

## Packing Management

### Get All Packing Records

```
GET /packing
Authorization: Bearer <token>
```

**Data Structure:**
```json
{
  "id": "pack_001",
  "packId": "PACK-2024-001",
  "pickId": "PICK-2024-001",
  "boxCount": "5",
  "weight": "125 kg",
  "packer": "Anita M.",
  "packingDate": "2024-07-28",
  "status": "Completed"
}
```

### Create Packing Record

```
POST /packing
Authorization: Bearer <token>
Content-Type: application/json

{
  "packId": "PACK-2024-002",
  "pickId": "PICK-2024-002",
  "boxCount": "4",
  "weight": "98 kg",
  "packer": "Ramesh V.",
  "packingDate": "2024-07-28",
  "status": "In Progress"
}
```

## Dispatch Management

### Get All Dispatch Records

```
GET /dispatch
Authorization: Bearer <token>
```

**Data Structure:**
```json
{
  "id": "disp_001",
  "dispatchId": "DISP-2024-001",
  "soNumber": "SO-5582",
  "customer": "Automotive Corp",
  "destination": "Bangalore, Karnataka",
  "weight": "125 kg",
  "courier": "DHL Express",
  "trackingNo": "DHL123456789",
  "deliveryDate": "2024-07-29",
  "status": "In Transit"
}
```

### Create Dispatch Record

```
POST /dispatch
Authorization: Bearer <token>
Content-Type: application/json

{
  "dispatchId": "DISP-2024-002",
  "soNumber": "SO-5583",
  "customer": "Automotive Corp",
  "destination": "Delhi, NCR",
  "weight": "98 kg",
  "courier": "FedEx",
  "trackingNo": "FX987654321",
  "deliveryDate": "2024-07-30",
  "status": "Ready"
}
```

## Dock Management

### Get All Dock Records

```
GET /dock
Authorization: Bearer <token>
```

**Data Structure:**
```json
{
  "id": "dock_001",
  "dockNo": "Dock-01",
  "truckNo": "TN07AB1234",
  "arrival": "2024-07-28 09:00 AM",
  "departure": "2024-07-28 12:30 PM",
  "operator": "Vikram S.",
  "status": "Completed",
  "notes": "All items verified and stored"
}
```

### Create Dock Record

```
POST /dock
Authorization: Bearer <token>
Content-Type: application/json

{
  "dockNo": "Dock-02",
  "truckNo": "TN07AB5678",
  "arrival": "2024-07-28 14:00 AM",
  "operator": "Harish R.",
  "status": "Active"
}
```

## Zone Management

### Get All Zones

```
GET /zones
Authorization: Bearer <token>
```

**Data Structure:**
```json
{
  "id": "zone_001",
  "zoneName": "Zone-A1",
  "warehouse": "WH-01 Mumbai",
  "capacity": "5000 sqft",
  "manager": "Kumar R.",
  "tempControl": "20-25°C",
  "status": "Active"
}
```

### Create Zone

```
POST /zones
Authorization: Bearer <token>
Content-Type: application/json

{
  "zoneName": "Zone-C3",
  "warehouse": "WH-01 Mumbai",
  "capacity": "3000 sqft",
  "manager": "Priya S.",
  "tempControl": "Ambient",
  "status": "Active"
}
```

## Task Management

### Get All Tasks

```
GET /tasks
Authorization: Bearer <token>
```

**Data Structure:**
```json
{
  "id": "task_001",
  "taskId": "TASK-2024-001",
  "employee": "Ravi D.",
  "type": "Picking",
  "description": "Pick items for order SO-5582",
  "priority": "High",
  "dueDate": "2024-07-28",
  "status": "In Progress"
}
```

### Create Task

```
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskId": "TASK-2024-002",
  "employee": "Suresh K.",
  "type": "Verification",
  "description": "Verify Zone-A1 inventory count",
  "priority": "Medium",
  "dueDate": "2024-07-30",
  "status": "Pending"
}
```

## Barcode Management

### Get All Barcodes

```
GET /barcodes
Authorization: Bearer <token>
```

**Data Structure:**
```json
{
  "id": "bar_001",
  "barcode": "8953214567890",
  "sku": "SKU-7743",
  "product": "Steel Sheet 2mm",
  "quantity": "100",
  "warehouse": "WH-01 Mumbai",
  "zone": "Zone-A1",
  "bin": "Bin-A1-01"
}
```

### Scan Barcode

```
POST /barcodes/scan
Authorization: Bearer <token>
Content-Type: application/json

{
  "barcode": "8953214567890",
  "action": "receive" | "ship" | "move"
}
```

## Shipment Tracking

### Get All Shipments

```
GET /shipments
Authorization: Bearer <token>
```

**Data Structure:**
```json
{
  "id": "ship_001",
  "shipmentId": "SHIP-2024-001",
  "dispatchId": "DISP-2024-001",
  "customer": "Automotive Corp",
  "currentLocation": "Bangalore, Karnataka",
  "eta": "2024-07-29 18:00",
  "courier": "DHL Express",
  "trackingUrl": "https://tracking.dhl.com/...",
  "status": "In Transit"
}
```

### Update Shipment Status

```
PATCH /shipments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentLocation": "Bangalore, Karnataka",
  "status": "Out for Delivery",
  "eta": "2024-07-29 17:00"
}
```

## GPS Tracking

### Get All GPS Records

```
GET /gps
Authorization: Bearer <token>
```

**Data Structure:**
```json
{
  "id": "gps_001",
  "vehicleId": "VEH-007",
  "driver": "Ramesh V.",
  "dispatchId": "DISP-2024-001",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "status": "Moving",
  "speed": "65 km/h",
  "lastUpdated": "2024-07-28T15:30:00Z"
}
```

### Update GPS Location

```
POST /gps/:vehicleId/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 12.9800,
  "longitude": 77.6050,
  "status": "Moving",
  "speed": "70 km/h"
}
```

## Put Away Rules

### Get All Put Away Rules

```
GET /putaway-rules
Authorization: Bearer <token>
```

**Data Structure:**
```json
{
  "id": "rule_001",
  "ruleId": "RULE-001",
  "sku": "SKU-7743",
  "product": "Steel Sheet 2mm",
  "zone": "Zone-A1",
  "rack": "Rack-01",
  "bin": "Bin-A1-01",
  "ruleType": "FIFO",
  "priority": "High"
}
```

### Create Put Away Rule

```
POST /putaway-rules
Authorization: Bearer <token>
Content-Type: application/json

{
  "ruleId": "RULE-002",
  "sku": "SKU-7744",
  "product": "Steel Plate 3mm",
  "zone": "Zone-B2",
  "rack": "Rack-03",
  "bin": "Bin-B2-02",
  "ruleType": "LIFO",
  "priority": "Medium"
}
```

## Dashboard Metrics

### Get Dashboard Metrics

```
GET /dashboard/metrics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "todayReceipts": 5,
    "todayDispatches": 3,
    "pendingPicking": 12,
    "openTasks": 8,
    "spaceUtilization": 72,
    "lowStockItems": 4,
    "dockStatus": {
      "total": 4,
      "active": 2
    },
    "activeShipments": 15
  }
}
```

### Get Warehouse Locations

```
GET /dashboard/locations
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Zone-A1",
      "value": 65,
      "fill": "#3b82f6"
    },
    {
      "name": "Zone-B2",
      "value": 48,
      "fill": "#10b981"
    }
  ]
}
```

## Search & Filter

### Global Search

```
GET /search?q=query&type=all
Authorization: Bearer <token>
```

**Query Parameters:**
- `q`: Search query string
- `type`: Entity type (receiving, picking, dispatch, all)
- `limit`: Results limit (default: 20)
- `offset`: Results offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rec_001",
      "type": "receiving",
      "grnNo": "GRN-2024-001",
      "score": 0.95
    }
  ],
  "total": 1
}
```

## Bulk Operations

### Bulk Delete

```
DELETE /bulk-delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "receiving",
  "ids": ["rec_001", "rec_002", "rec_003"]
}
```

### Bulk Export

```
POST /bulk-export
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "receiving",
  "format": "csv" | "json" | "excel" | "pdf",
  "ids": ["rec_001", "rec_002"]
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_INPUT` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `VALIDATION_ERROR` | 422 | Validation failed |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

- Limit: 100 requests per minute per user
- Headers:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: Field to sort by
- `sortOrder`: asc or desc (default: asc)

**Response Headers:**
```
X-Total-Count: 150
X-Page: 1
X-Limit: 20
X-Total-Pages: 8
```

## Webhooks

Real-time event notifications:

### Subscribe to Events

```
POST /webhooks/subscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://yourdomain.com/webhook",
  "events": ["receiving.created", "dispatch.updated", "shipment.status_changed"]
}
```

### Webhook Events

- `receiving.created`
- `receiving.updated`
- `receiving.deleted`
- `picking.created`
- `picking.updated`
- `dispatch.updated`
- `shipment.status_changed`
- `gps.location_updated`

### Webhook Payload

```json
{
  "event": "receiving.created",
  "timestamp": "2024-07-28T10:30:45Z",
  "data": {
    "id": "rec_001",
    "grnNo": "GRN-2024-001",
    ...
  }
}
```

## Implementation Checklist

- [ ] Setup database schema for all entities
- [ ] Implement authentication/authorization
- [ ] Create REST endpoints for CRUD operations
- [ ] Add input validation
- [ ] Implement pagination and sorting
- [ ] Add search functionality
- [ ] Implement audit logging
- [ ] Add error handling
- [ ] Setup API documentation (Swagger/OpenAPI)
- [ ] Configure rate limiting
- [ ] Setup webhook system
- [ ] Add unit/integration tests
- [ ] Deploy to production
- [ ] Monitor API usage and performance

---

**Last Updated**: July 2024
**API Version**: 1.0.0
**Status**: Ready for Implementation
