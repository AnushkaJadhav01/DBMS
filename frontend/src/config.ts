export type FieldType = 'text' | 'number' | 'date' | 'select';

export interface EntityColumn {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hiddenInForm?: boolean;
  options?: string[]; // strictly for 'select' type
}

export interface EntityConfig {
  endpoint: string;
  entityName: string;
  idField: string;
  icon: string; 
  columns: EntityColumn[];
}

export const APP_CONFIG: Record<string, EntityConfig> = {
  dashboard: {
    endpoint: '/api/dashboard', // Just for stats later if needed
    entityName: 'Dashboard',
    idField: '',
    icon: 'LayoutDashboard',
    columns: []
  },
  orders: {
    endpoint: '/api/orders',
    entityName: 'Order',
    idField: 'Order_ID',
    icon: 'ShoppingCart',
    columns: [
      { key: 'Order_ID', label: 'Order ID', type: 'number', hiddenInForm: true },
      { key: 'Product_ID', label: 'Product ID', type: 'text', required: true },
      { key: 'Supplier_ID', label: 'Supplier ID', type: 'text', required: true },
      { key: 'Tracking_No', label: 'Tracking #', type: 'text' },
      { key: 'Order_Date', label: 'Order Date', type: 'date' }
    ]
  },
  products: {
    endpoint: '/api/products',
    entityName: 'Product',
    idField: 'Product_ID',
    icon: 'Package',
    columns: [
      { key: 'Product_ID', label: 'Product ID', type: 'text', required: true },
      { key: 'Product_name', label: 'Name', type: 'text' },
      { key: 'Supplier_ID', label: 'Supplier ID', type: 'text' },
      { key: 'Stock', label: 'Stock Qty', type: 'number' },
      { key: 'Check_price', label: 'Price (₹)', type: 'number' },
      { key: 'Temperature_required', label: 'Req Temp (°C)', type: 'number' }
    ]
  },
  customers: {
    endpoint: '/api/customers',
    entityName: 'Customer',
    idField: 'Customer_ID',
    icon: 'Users',
    columns: [
      { key: 'Customer_ID', label: 'Customer ID', type: 'number', hiddenInForm: true },
      { key: 'Customer_Name', label: 'Full Name', type: 'text', required: true },
      { key: 'Phone_No', label: 'Phone', type: 'text' },
      { key: 'City', label: 'City', type: 'text' }
    ]
  },
  suppliers: {
    endpoint: '/api/suppliers',
    entityName: 'Supplier',
    idField: 'Supplier_ID',
    icon: 'Truck',
    columns: [
      { key: 'Supplier_ID', label: 'Supplier ID', type: 'text', required: true },
      { key: 'Phone_No', label: 'Phone', type: 'text' },
      { key: 'Area', label: 'Area', type: 'text' }
    ]
  },
  shipments: {
    endpoint: '/api/shipments',
    entityName: 'Shipment',
    idField: 'Shipment_ID',
    icon: 'Send',
    columns: [
      { key: 'Shipment_ID', label: 'Shipment ID', type: 'number', hiddenInForm: true },
      { key: 'Shipment_Date', label: 'Date', type: 'date', required: true },
      { key: 'Order_ID', label: 'Order ID', type: 'number', required: true },
      { key: 'Quantity', label: 'Quantity', type: 'number', required: true },
      { key: 'Tracking_Number', label: 'Tracking #', type: 'text' }
    ]
  },
  payments: {
    endpoint: '/api/payments',
    entityName: 'Payment',
    idField: 'Payment_ID',
    icon: 'CreditCard',
    columns: [
      { key: 'Payment_ID', label: 'Payment ID', type: 'number', hiddenInForm: true },
      { key: 'Order_ID', label: 'Order ID', type: 'number' },
      { key: 'Amount', label: 'Amount (₹)', type: 'number', required: true },
      { key: 'Payment_Mode', label: 'Mode', type: 'select', options: ['Credit Card', 'Cash', 'Bank Transfer', 'UPI'] },
      { key: 'Payment_Date', label: 'Date', type: 'date' }
    ]
  }
};
