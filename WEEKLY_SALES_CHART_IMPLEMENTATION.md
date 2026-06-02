# WeeklySalesChart Implementation - Real-time Week Filtering & Auto-Reset

## Overview
This document explains the implementation of the real-time weekly sales chart with automatic reset functionality and separated historical revenue tracking.

## Key Features Implemented

### 1. Real-time Week Filtering with dayjs (ISO Week - Monday Start)
- **Library Used**: `dayjs` with `isoWeek` plugin
- **Week Definition**: Monday (00:00:00) to Sunday (23:59:59)
- **Automatic Detection**: The system automatically determines the current week boundaries based on real-time

### 2. Auto-Reset at Week Transition
- **Trigger Time**: Exactly at 00:00:00 on Monday morning
- **Behavior**: When a new week begins, the chart automatically resets to show all zeros
- **No Database Deletion**: The reset is purely visual - historical data remains intact in the database
- **Implementation**: A setInterval checks every second for the Monday midnight transition

### 3. Separated Revenue Tracking
- **Total Revenue (Dashboard)**: Shows revenue from all previous weeks of the current year (historical revenue)
- **Current Week Revenue**: Displayed as a sub-item under Total Revenue
- **Weekly Chart**: Only shows data for the selected week (this week or last week)

## File Changes

### WeeklySalesChart.jsx
```javascript
// Key changes:
1. Added dayjs plugins: isoWeek, isBetween
2. Added callbacks:
   - onCurrentWeekRevenueChange: sends current week revenue to Dashboard
   - onCurrentWeekOrdersChange: sends current week orders count to Dashboard (for AOV calculation)
3. Implemented auto-reset logic with setInterval
4. Uses isBetween for precise date range filtering
5. Always initializes 7 days (MON-SUN) with 0 values
6. Filters orders by status === 'Completed'
7. Counts orders in current week for AOV calculation
```

### Dashboard.jsx
```javascript
// Key changes:
1. Added dayjs imports and plugins
2. Separated revenue calculations:
   - historicalRevenueNumber: Revenue from weeks before current week (calculated via useMemo)
   - currentWeekRevenue: Revenue from current week (received via callback from WeeklySalesChart)
   - currentWeekOrdersCount: Number of orders in current week (received via callback for AOV)
3. Updated Total Revenue card to show:
   - Main value: Current week revenue
   - Sub-text: Historical revenue (Total Revenue For The Year) in parentheses
4. AOV calculation now uses current week data:
   - AOV = currentWeekRevenue / currentWeekOrdersCount
   - Resets to 0.00 when week ends (no orders)
5. Passed callbacks to WeeklySalesChart for real-time updates
```

## How It Works

### Week Calculation Logic
```javascript
// Start of current week (Monday 00:00:00)
const startOfCurrentWeek = dayjs().startOf('isoWeek');

// End of current week (Sunday 23:59:59)
const endOfCurrentWeek = dayjs().endOf('isoWeek');

// Last week
const startOfLastWeek = dayjs().subtract(1, 'week').startOf('isoWeek');
const endOfLastWeek = dayjs().subtract(1, 'week').endOf('isoWeek');
```

### Revenue Separation Logic
```javascript
// Historical Revenue (all completed orders BEFORE current week)
historicalRevenueNumber = orders
  .filter(order => order.status === 'Completed' 
    && orderDate.isBefore(startOfCurrentWeek))
  .reduce((sum, order) => sum + order.totalPrice, 0);

// Current Week Revenue (all completed orders IN current week)
// Calculated in WeeklySalesChart and sent via callback
currentWeekRevenue = received from WeeklySalesChart callback
```

### Orders Count Logic (for AOV)
```javascript
// Current Week Orders Count (number of completed orders IN current week)
// Calculated in WeeklySalesChart and sent via callback
currentWeekOrdersCount = received from WeeklySalesChart callback
```

### AOV Calculation Logic
```javascript
// AOV = Current Week Revenue / Current Week Orders Count
// Resets to 0.00 when no orders in current week
const calculateAOV = () => {
  if (currentWeekOrdersCount === 0) return "0.00";
  return (currentWeekRevenue / currentWeekOrdersCount).toFixed(2);
};
```

### Auto-Reset Logic
```javascript
useEffect(() => {
  const checkWeekChange = () => {
    const now = dayjs();
    const isMondayMidnight = now.day() === 1 && now.hour() === 0 && now.minute() === 0;
    
    if (isMondayMidnight && filterKey === 'this_week') {
      // Reset chart to empty state
      setChartData(generateEmptyWeekData());
      setCurrentWeekRevenue(0);
      setCurrentWeekOrdersCount(0); // Reset orders count for AOV
    }
  };
  
  const interval = setInterval(checkWeekChange, 1000);
  return () => clearInterval(interval);
}, [filterKey]);
```

## User Experience

### Dashboard View
- **Total Revenue Card**: Shows "TỔNG DOANH THU CỦA NĂM" with historical revenue
- **Sub-text**: Shows "(Tuần này: $X,XXX.XX)" for current week revenue
- **Weekly Chart**: Displays daily breakdown for selected week

### Chart Behavior
1. **Monday Morning (00:00:00)**: Chart resets to zero, ready for new week
2. **During the Week**: Chart updates in real-time as new orders are completed
3. **Week Filter**: Users can toggle between "Tuần này" and "Tuần trước"
4. **Real-time Updates**: When orders are marked as "Completed", they appear in the chart

## Technical Notes

### Time Zone Handling
- Uses the system's local timezone (Asia/Saigon - UTC+7)
- dayjs automatically handles timezone based on browser/system settings

### Performance Considerations
- Revenue calculations use useMemo to prevent unnecessary recalculations
- Chart data is only recalculated when orders or filter changes
- Auto-reset check runs every second but only triggers on Monday midnight

### Data Integrity
- No data is deleted from the database
- Reset is purely visual (chart shows zeros)
- Historical data remains accessible for reporting

## Testing Recommendations

1. **Manual Testing**:
   - Change system date to Monday 00:00:00 to verify auto-reset
   - Create test orders and mark as "Completed" to see real-time updates
   - Toggle between "Tuần này" and "Tuần trước" filters

2. **Edge Cases**:
   - No orders in current week (should show all zeros)
   - Orders from different weeks (should be correctly categorized)
   - Order status changes (Pending → Completed should update chart)

3. **Visual Verification**:
   - Total Revenue should NOT include current week
   - Current week revenue shown in parentheses
   - Chart should display 7 days (MON-SUN) even with no data