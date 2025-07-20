# Bulk Operations Demo Guide

## Overview
The Web Admin Dashboard now includes comprehensive bulk operations functionality for efficient coffee catalog management. This guide demonstrates the key features and usage.

## Features Implemented

### 1. Multi-Select Interface
- **Checkboxes**: Each table row has a checkbox for individual selection
- **Select All**: Master checkbox in table header selects all items on current page
- **Visual Feedback**: Selected rows are highlighted in blue
- **Selection Counter**: Shows count of selected items in toolbar and table header

### 2. Bulk Action Toolbar
The toolbar appears when items are selected and provides:
- **Bulk Verify**: Mark selected coffees as verified
- **Bulk Unverify**: Mark selected coffees as pending review
- **Bulk Edit**: Edit multiple coffee properties at once
- **Bulk Delete**: Delete multiple coffees with confirmation
- **Clear Selection**: Deselect all items

### 3. Advanced Filtering System
- **Search**: Filter by coffee name, roastery, or origin
- **Status Filter**: Show all, verified, or pending coffees
- **Roaster Filter**: Filter by specific roastery
- **Date Range**: Filter by creation date range
- **Active Filter Count**: Shows number of active filters
- **Clear Filters**: Reset all filters at once

### 4. Pagination
- **Server-side Pagination**: Handles large datasets efficiently
- **20 items per page**: Configurable page size
- **Page Navigation**: Previous/Next with numbered pages
- **Total Count**: Shows total items and current page info

### 5. Performance Optimizations
- **Optimistic Updates**: Immediate UI feedback for bulk operations
- **Loading States**: Skeleton screens during data loading
- **Efficient Queries**: Only fetch necessary data with proper indexing
- **Error Recovery**: Automatic rollback on failed operations

## Usage Examples

### Bulk Verification Workflow
1. Navigate to Coffee Catalog page
2. Use filters to find pending coffees
3. Select individual items or use "Select All"
4. Click "일괄 검증" in the bulk toolbar
5. See immediate UI update with success toast

### Bulk Edit Process
1. Select multiple coffees
2. Click "일괄 수정" in toolbar
3. Check fields you want to update
4. Enter new values
5. Click save to apply changes to all selected items

### Advanced Filtering
1. Use search bar for quick text search
2. Select status filter (verified/pending)
3. Choose specific roastery from dropdown
4. Set date range for creation time
5. View filtered results with pagination

## Technical Details

### Components Created
- `BulkActionToolbar`: Main bulk operations interface
- `CoffeeFilterBar`: Advanced filtering controls
- `BulkEditDialog`: Multi-field editing modal
- `DateRangePicker`: Date range selection component
- `LoadingSkeleton`: Loading state components

### Hooks and Utilities
- `useOptimisticUpdate`: Optimistic UI updates
- Enhanced state management for selections
- Efficient Supabase query optimization

### Performance Features
- **Debounced Search**: Prevents excessive API calls
- **Optimistic Updates**: Immediate UI feedback
- **Skeleton Loading**: Better perceived performance
- **Pagination**: Handles large datasets efficiently

## Configuration
- Page size: 20 items (configurable in code)
- Filter debounce: 300ms for search
- Optimistic timeout: 5 seconds before rollback
- Date range: Full calendar with Korean locale

## Error Handling
- Automatic rollback on failed operations
- Toast notifications for all operations
- Confirmation dialogs for destructive actions
- Graceful loading state management

This implementation provides a professional-grade admin interface with efficient bulk operations, making coffee catalog management fast and intuitive.