
// Order Data tesst 
export const dataSource = [
  {
    key: '1',
    orderId: '#ORD-8291',
    customer: {
      name: 'Eleanor Kade',
      email: 'eleanor.k@email.com',
      avatar: 'https://i.pravatar.cc/150?u=eleanor'
    },
    date: 'Oct 24, 2023 • 09:42 AM',
    total: 42.50,
    status: 'PENDING',
  },
  {
    key: '2',
    orderId: '#ORD-8290',
    customer: {
      name: 'Marcus Thorne',
      email: 'm.thorne@design.co',
      avatar: 'https://i.pravatar.cc/150?u=marcus'
    },
    date: 'Oct 24, 2023 • 09:15 AM',
    total: 118.00,
    status: 'PROCESSING',
  },
  {
    key: '3',
    orderId: '#ORD-8289',
    customer: {
      name: 'Juliet Silas',
      email: 'j.silas@webmail.com',
      avatar: 'https://i.pravatar.cc/150?u=juliet'
    },
    date: 'Oct 23, 2023 • 05:30 PM',
    total: 12.95,
    status: 'COMPLETED',
  },
  {
    key: '4',
    orderId: '#ORD-8288',
    customer: {
      name: 'Robert Wade',
      email: 'wade.r@outlook.com',
      avatar: 'https://i.pravatar.cc/150?u=robert'
    },
    date: 'Oct 23, 2023 • 04:12 PM',
    total: 64.20,
    status: 'CANCELLED',
  }
];


// Inventory Data test 
export const inventorySource = [ {
    key: '1',
    product: {
      productId: 'BC-001',
      name: 'Signature Sourdough',
      avatar: 'https://unsplash.com/photos/white-cake-with-chocolate-syrup-on-white-ceramic-plate-vdx5hPQhXFk'
    },
    category: "BAKERY",
    stock: {
       allstock: 50,
       currentstock: 42
    },
    price: 8.50,
    status: "IN STOCK"
  },
  {
    key: '2',
    product: {
      productId: 'BC-024',
      name: 'Ethiopian Yirgacheffe',
      avatar: 'https://unsplash.com/photos/white-cake-with-chocolate-syrup-on-white-ceramic-plate-vdx5hPQhXFk'
    },
    category: "COFFEE LAB ",
    stock: {
       allstock: 40,
       currentstock: 5
    },
    price: 24.00,
    status: "LOW STOCK"
  },
  {
    key: '3',
    product: {
      productId: 'BC-015',
      name: 'Pink Velvet Macarons',
      avatar: 'https://unsplash.com/photos/white-cake-with-chocolate-syrup-on-white-ceramic-plate-vdx5hPQhXFk'
    },
    category: "BAKERY",
    stock: {
       allstock: 100,
       currentstock: 0
    },
    price: 3.50,
    status: "OUT OF STOCK"
  },
  {
    key: '4',
    product: {
      productId: 'BC-008',
      name: 'Butter Croissant',
      avatar: 'https://unsplash.com/photos/white-cake-with-chocolate-syrup-on-white-ceramic-plate-vdx5hPQhXFk'
    },
    category: "BAKERY",
    stock: {
       allstock: 60,
       currentstock: 16
    },
    price: 4.75,
    status: "LOW STOCK A"
  }
];

// Customer data test
export const customerSource = [ 
  {
    key: '1',
    customer: {
      customerId: '001',
      name: 'Alex Sandro',
      avatar: 'https://unsplash.com/photos/white-cake-with-chocolate-syrup-on-white-ceramic-plate-vdx5hPQhXFk'
    },
    email: "example123@gmail.com",
    allorders : 42,
    points: 2450 ,
    status: "Offline",
  },
  {
    key: '2',
    customer: {
      customerId: '002',
      name: 'Martinez',
      avatar: 'https://unsplash.com/photos/white-cake-with-chocolate-syrup-on-white-ceramic-plate-vdx5hPQhXFk'
    },
    email: "example123@gmail.com",
    allorders : 15,
    points: 420 ,
    status: "Online",
  },
  {
    key: '3',
    customer: {
      customerId: '003',
      name: 'Ronaldo',
      avatar: 'https://unsplash.com/photos/white-cake-with-chocolate-syrup-on-white-ceramic-plate-vdx5hPQhXFk'
    },
    email: "example123@gmail.com",
    allorders : 124,
    points: 8910 ,
    status: "Online",
  },
  {
    key: '4',
    customer: {
      customerId: '004',
      name: 'Alex Ferguson',
      avatar: 'https://unsplash.com/photos/white-cake-with-chocolate-syrup-on-white-ceramic-plate-vdx5hPQhXFk'
    },
    email: "example123@gmail.com",
    allorders : 2,
    points: 50 ,
    status: "Offline",
  }
];

