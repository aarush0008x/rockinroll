const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding authentic gourmet Kathi roll menu into Supabase...')

  // 1. Categories
  const categories = [
    {
      id: 'signature-rolls',
      name: 'Signature Kathi Rolls',
      sortOrder: 1,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600',
    },
    {
      id: 'classic-rolls',
      name: 'Classic Heritage Rolls',
      sortOrder: 2,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
    },
    {
      id: 'fusion-bowls',
      name: 'Roll-in-a-Bowl (Rice & Paratha Bowls)',
      sortOrder: 3,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600',
    },
    {
      id: 'beverages-sides',
      name: 'Coolers, Dips & Munchies',
      sortOrder: 4,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
    },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    })
  }
  console.log('✓ Categories seeded')

  // 2. Authentic Menu Items
  const products = [
    {
      id: 'butter-chicken-roll',
      name: 'Murgh Makhani (Butter Chicken) Kathi Roll',
      description: 'Succulent clay-oven grilled chicken tikka tossed in rich satin makhani gravy, rolled in a flaky, ghee-layered handmade laccha paratha with pickled red onions and fresh mint chutney.',
      price: 269,
      discountPrice: 239,
      categoryId: 'signature-rolls',
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800',
      isVeg: false,
      spiceLevel: 2,
      preparationTime: 12,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNewItem: false,
      rating: 4.9,
      reviewCount: 342,
      ingredients: JSON.stringify(['Charcoal Chicken Tikka', 'Makhani Cream Gravy', 'Flaky Laccha Paratha', 'Pickled Red Onions', 'Mint Crema']),
      allergens: JSON.stringify(['Dairy', 'Gluten']),
      addons: [
        { name: 'Double Chicken Tikka Meat', price: 65 },
        { name: 'Melted Amul Mozzarella Cheese', price: 40 },
        { name: 'Extra Makhani Dip Pot (60ml)', price: 30 },
      ],
    },
    {
      id: 'smoked-paneer-tikka-roll',
      name: 'Dhungar Smoked Paneer Tikka Kathi Roll',
      description: 'Charred Malai paneer cubes infused with live charcoal smoke, roasted bell peppers, mint yogurt reduction, and chaat spices rolled in golden laccha paratha.',
      price: 229,
      discountPrice: 199,
      categoryId: 'signature-rolls',
      imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800',
      isVeg: true,
      spiceLevel: 2,
      preparationTime: 10,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNewItem: false,
      rating: 4.8,
      reviewCount: 289,
      ingredients: JSON.stringify(['Charred Malai Paneer', 'Roasted Capsicum', 'Pudina Chutney', 'Laccha Paratha', 'Kashmiri Chili Glaze']),
      allergens: JSON.stringify(['Dairy', 'Gluten']),
      addons: [
        { name: 'Extra Paneer Cubes (4pcs)', price: 45 },
        { name: 'Melted Amul Mozzarella Cheese', price: 40 },
        { name: 'Crispy Garlic Crunch', price: 25 },
      ],
    },
    {
      id: 'mutton-seekh-kathi-roll',
      name: 'Old Delhi Mutton Seekh Kebab Roll',
      description: 'Juicy spiced minced mutton seekh kebab skewered over wood charcoal, wrapped in egg-coated paratha with spicy green chili chutney and lemon relish.',
      price: 319,
      discountPrice: 289,
      categoryId: 'signature-rolls',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
      isVeg: false,
      spiceLevel: 3,
      preparationTime: 15,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNewItem: false,
      rating: 4.9,
      reviewCount: 198,
      ingredients: JSON.stringify(['Spiced Mutton Seekh', 'Farm Egg Lining', 'Roomali / Paratha', 'Mint Garlic Chutney']),
      allergens: JSON.stringify(['Eggs', 'Gluten']),
      addons: [
        { name: 'Extra Seekh Kebab Skewer', price: 85 },
        { name: 'Double Farm Fresh Egg Coating', price: 25 },
        { name: 'Cheese Burst Core', price: 40 },
      ],
    },
    {
      id: 'kolkata-double-egg-roll',
      name: 'Original Kolkata Double Egg Roll',
      description: 'The street food legend. Crispy paratha fried with two organic farm eggs, loaded with crunchy sliced cucumber, raw onions, green chilies, and tangy kasundi mustard sprinkle.',
      price: 159,
      discountPrice: 139,
      categoryId: 'classic-rolls',
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800',
      isVeg: false,
      spiceLevel: 2,
      preparationTime: 8,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: false,
      isNewItem: false,
      rating: 4.7,
      reviewCount: 420,
      ingredients: JSON.stringify(['2x Farm Eggs', 'Layered Paratha', 'Cucumber Slaw', 'Kasundi Sauce', 'Chaat Lime']),
      allergens: JSON.stringify(['Eggs', 'Gluten', 'Mustard']),
      addons: [
        { name: 'Triple Egg Upgrade', price: 20 },
        { name: 'Amul Cheese Slice', price: 35 },
      ],
    },
    {
      id: 'crunchy-soya-chaap-roll',
      name: 'Tandoori Soya Chaap Afghani Roll',
      description: 'Protein-packed soya chaap chunks marinated in rich cashew paste, hung curd, and crushed black pepper, flame-grilled and wrapped with creamy garlic mayo.',
      price: 219,
      discountPrice: 189,
      categoryId: 'classic-rolls',
      imageUrl: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?w=800',
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 10,
      isAvailable: true,
      isBestSeller: false,
      isFeatured: true,
      isNewItem: true,
      rating: 4.8,
      reviewCount: 165,
      ingredients: JSON.stringify(['Soya Chaap Chunks', 'Afghani Cream Marinade', 'Cashew Paste', 'Paratha Wrap']),
      allergens: JSON.stringify(['Dairy', 'Gluten', 'Nuts']),
      addons: [
        { name: 'Extra Soya Chaap Chunks', price: 40 },
        { name: 'Melted Mozzarella Cheese', price: 40 },
      ],
    },
    {
      id: 'butter-chicken-rice-bowl',
      name: 'Deconstructed Butter Chicken Roll-Bowl',
      description: 'All the goodness of our best-selling roll served over fragrant jeera basmati rice, layered with charcoal chicken tikka, rich butter makhani gravy, crunchy paratha crisps, and mint dip.',
      price: 299,
      discountPrice: 269,
      categoryId: 'fusion-bowls',
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800',
      isVeg: false,
      spiceLevel: 2,
      preparationTime: 12,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: true,
      isNewItem: false,
      rating: 4.9,
      reviewCount: 210,
      ingredients: JSON.stringify(['Jeera Basmati Rice', 'Chicken Tikka', 'Makhani Gravy', 'Paratha Crisps', 'Salad']),
      allergens: JSON.stringify(['Dairy', 'Gluten']),
      addons: [
        { name: 'Extra Chicken Portion', price: 65 },
        { name: 'Extra Butter Gravy Pot', price: 30 },
      ],
    },
    {
      id: 'paneer-tikka-biryani-bowl',
      name: 'Flame-Grilled Paneer Tikka Fusion Bowl',
      description: 'Aromatic spiced saffron rice bowl topped with smoked paneer cubes, roasted bell peppers, crispy caramelized onions, and house spicy garlic dip.',
      price: 269,
      discountPrice: 239,
      categoryId: 'fusion-bowls',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
      isVeg: true,
      spiceLevel: 2,
      preparationTime: 10,
      isAvailable: true,
      isBestSeller: false,
      isFeatured: false,
      isNewItem: true,
      rating: 4.7,
      reviewCount: 144,
      ingredients: JSON.stringify(['Saffron Rice', 'Smoked Paneer Tikka', 'Caramelized Birista Onions', 'Garlic Crema']),
      allergens: JSON.stringify(['Dairy']),
      addons: [
        { name: 'Extra Paneer Tikka', price: 45 },
        { name: 'Spicy Mint Raita', price: 25 },
      ],
    },
    {
      id: 'masala-lemonade-cooler',
      name: 'Shikanji Street Masala Lemonade (500ml)',
      description: 'Chilled freshly squeezed lime juice with roasted cumin, black salt, fresh mint leaves, and effervescent soda. The ultimate roll pairing.',
      price: 89,
      discountPrice: 69,
      categoryId: 'beverages-sides',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800',
      isVeg: true,
      spiceLevel: 0,
      preparationTime: 4,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: false,
      isNewItem: false,
      rating: 4.9,
      reviewCount: 512,
      ingredients: JSON.stringify(['Fresh Lemon Juice', 'Black Salt & Cumin Spice Blend', 'Sparkling Soda', 'Fresh Mint']),
      allergens: JSON.stringify([]),
      addons: [],
    },
    {
      id: 'peri-peri-crinkle-fries',
      name: 'Crinkle Cut Peri-Peri Fries with Tandoori Dip',
      description: 'Golden crispy crinkle-cut potato fries tossed in fiery African-Indian peri peri seasoning, served with creamy tandoori mayo.',
      price: 129,
      discountPrice: 109,
      categoryId: 'beverages-sides',
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800',
      isVeg: true,
      spiceLevel: 2,
      preparationTime: 6,
      isAvailable: true,
      isBestSeller: true,
      isFeatured: false,
      isNewItem: false,
      rating: 4.8,
      reviewCount: 388,
      ingredients: JSON.stringify(['Potato Crinkle Fries', 'Peri Peri Spice', 'Tandoori Mayo Dip']),
      allergens: JSON.stringify(['Gluten']),
      addons: [
        { name: 'Liquid Cheddar Cheese Pour', price: 35 },
      ],
    },
  ]

  for (const prod of products) {
    const { addons, ...prodData } = prod
    const savedProd = await prisma.product.upsert({
      where: { id: prodData.id },
      update: prodData,
      create: prodData,
    })

    if (addons && addons.length > 0) {
      await prisma.productAddon.deleteMany({ where: { productId: savedProd.id } })
      for (const addon of addons) {
        await prisma.productAddon.create({
          data: {
            productId: savedProd.id,
            name: addon.name,
            price: addon.price,
          },
        })
      }
    }
  }
  console.log('✓ Authentic rolls & addons seeded')

  // 3. Initial Users
  const passwordHash = await bcrypt.hash('RockinRoll@2026', 10)

  const users = [
    {
      email: 'admin@rockinroll.com',
      name: 'Operations Lead',
      phone: '9501714559',
      role: 'ADMIN',
      isVerified: true,
      passwordHash,
    },
    {
      email: 'kitchen@rockinroll.com',
      name: 'Chef Rajan',
      phone: '9501714558',
      role: 'STAFF',
      isVerified: true,
      passwordHash,
    },
    {
      email: 'rider@rockinroll.com',
      name: 'Rider Vikram',
      phone: '9501714557',
      role: 'DELIVERY_PARTNER',
      isVerified: true,
      passwordHash,
    },
    {
      email: 'customer@rockinroll.com',
      name: 'Ananya Sharma',
      phone: '9501714556',
      role: 'CUSTOMER',
      isVerified: true,
      passwordHash,
    },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, isVerified: u.isVerified },
      create: u,
    })
  }
  console.log('✓ Initial users seeded')

  // 4. Sample Promo Coupons
  const coupons = [
    {
      id: 'FIRSTROLL',
      discountType: 'PERCENTAGE',
      value: 20,
      minOrderAmount: 199,
      maxDiscount: 75,
      isActive: true,
    },
    {
      id: 'MIDNIGHT50',
      discountType: 'FLAT',
      value: 50,
      minOrderAmount: 299,
      maxDiscount: 50,
      isActive: true,
    },
    {
      id: 'CGC50',
      discountType: 'FLAT',
      value: 50,
      minOrderAmount: 149,
      maxDiscount: 50,
      isActive: true,
    },
  ]

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    })
  }
  console.log('✓ Coupons seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
