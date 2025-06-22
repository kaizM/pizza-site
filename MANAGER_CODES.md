# Manager Authorization System

## Overview
Prevents employees from closing the kitchen during business hours (9-11 PM) to protect revenue.

## Authorization Code
**Current Manager Code:** `PIZZA2025`

## How It Works
1. **Business Hours (9-11 PM):** Employees cannot close kitchen without authorization
2. **Off Hours:** Employees can freely change status (open/busy/closed)
3. **Authorization Required:** Only for closing during business hours
4. **Manager Override:** Enter code to authorize status changes

## Changing the Code
To update the manager code, edit this line in `AdvancedEmployeeDashboard.tsx`:
```javascript
const MANAGER_CODE = "PIZZA2025"; // Change this to your new code
```

## Security Features
- Code is hidden (password field)
- Lock icon shows when authorization required
- Clear warning message explains policy
- Prevents accidental closures during peak hours

## Business Impact
- Protects revenue during prime hours (9-11 PM)
- Prevents lazy employees from turning off orders
- Maintains customer satisfaction
- Professional authorization system