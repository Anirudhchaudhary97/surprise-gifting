"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    // Create admin user
    const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@surprise.com' },
        update: {},
        create: {
            email: 'admin@surprise.com',
            password: adminPassword,
            name: 'Admin User',
            role: client_1.Role.ADMIN,
        },
    });
    console.log('✅ Admin user created');
    // Create test users
    const userPassword = await bcryptjs_1.default.hash('password123', 10);
    const user1 = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
            email: 'john@example.com',
            password: userPassword,
            name: 'John Doe',
            role: client_1.Role.USER,
        },
    });
    const user2 = await prisma.user.upsert({
        where: { email: 'jane@example.com' },
        update: {},
        create: {
            email: 'jane@example.com',
            password: userPassword,
            name: 'Jane Smith',
            role: client_1.Role.USER,
        },
    });
    console.log('✅ Test users created');
    // Create carts for users
    await prisma.cart.upsert({
        where: { userId: user1.id },
        update: {},
        create: { userId: user1.id },
    });
    await prisma.cart.upsert({
        where: { userId: user2.id },
        update: {},
        create: { userId: user2.id },
    });
    console.log('✅ Carts created');
    // Create categories
    const categories = [
        {
            name: 'Birthday Gifts',
            slug: 'birthday',
            description: 'Perfect gifts to make birthdays memorable',
            imageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500',
        },
        {
            name: 'Anniversary Gifts',
            slug: 'anniversary',
            description: 'Celebrate love with our anniversary collection',
            imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500',
        },
        {
            name: 'Romantic Surprises',
            slug: 'romantic',
            description: 'Express your love with romantic gestures',
            imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500',
        },
        {
            name: 'Customized Gifts',
            slug: 'customized',
            description: 'Personalized gifts made just for them',
            imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',
        },
    ];
    const createdCategories = [];
    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
        createdCategories.push(category);
    }
    console.log('✅ Categories created');
    // Create gifts
    const gifts = [
        {
            name: 'Deluxe Chocolate Box',
            description: 'Premium assorted chocolates in an elegant box. Perfect for any celebration.',
            price: 1500,
            stock: 50,
            categoryId: createdCategories[0].id,
            isCustomizable: true,
            allowPersonalMsg: true,
            allowAddons: true,
            addonsOptions: ['Greeting Card', 'Balloon', 'Gift Wrap'],
            featured: true,
            images: ['https://images.unsplash.com/photo-1511381939415-e44015466834?w=500'],
        },
        {
            name: 'Red Rose Bouquet',
            description: 'Beautiful bouquet of 12 fresh red roses with greenery.',
            price: 2000,
            stock: 30,
            categoryId: createdCategories[2].id,
            isCustomizable: true,
            allowPersonalMsg: true,
            allowAddons: true,
            addonsOptions: ['Teddy Bear', 'Chocolates', 'Vase'],
            featured: true,
            images: ['https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500'],
        },
        {
            name: 'Personalized Photo Frame',
            description: 'Custom photo frame with your special memories. Upload your favorite photo!',
            price: 800,
            stock: 100,
            categoryId: createdCategories[3].id,
            isCustomizable: true,
            allowPersonalMsg: true,
            allowImageUpload: true,
            addonsOptions: ['Gift Box', 'Message Card'],
            featured: true,
            images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=500'],
        },
        {
            name: 'Birthday Cake (1kg)',
            description: 'Delicious vanilla cake with custom message. Choose your flavor!',
            price: 1200,
            stock: 20,
            categoryId: createdCategories[0].id,
            isCustomizable: true,
            allowPersonalMsg: true,
            allowAddons: true,
            addonsOptions: ['Candles', 'Knife', 'Extra Decoration'],
            featured: false,
            images: ['https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500'],
        },
        {
            name: 'Couple Mugs Set',
            description: 'Adorable matching mugs for couples. Perfect anniversary gift.',
            price: 600,
            stock: 75,
            categoryId: createdCategories[1].id,
            isCustomizable: true,
            allowPersonalMsg: true,
            allowImageUpload: true,
            addonsOptions: ['Gift Box', 'Coasters'],
            featured: false,
            images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500'],
        },
        {
            name: 'Scented Candle Set',
            description: 'Set of 3 aromatic candles in beautiful packaging.',
            price: 900,
            stock: 60,
            categoryId: createdCategories[2].id,
            isCustomizable: false,
            allowPersonalMsg: true,
            allowAddons: true,
            addonsOptions: ['Gift Wrap', 'Message Card'],
            featured: false,
            images: ['https://images.unsplash.com/photo-1602874801006-c2b2d6d1c16b?w=500'],
        },
        {
            name: 'Customized T-Shirt',
            description: 'Premium quality t-shirt with your custom design or photo.',
            price: 700,
            stock: 100,
            categoryId: createdCategories[3].id,
            isCustomizable: true,
            allowPersonalMsg: false,
            allowImageUpload: true,
            addonsOptions: ['Gift Box', 'Extra T-Shirt'],
            featured: true,
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
        },
        {
            name: 'Teddy Bear (Large)',
            description: 'Soft and cuddly teddy bear, perfect for expressing love.',
            price: 1100,
            stock: 40,
            categoryId: createdCategories[2].id,
            isCustomizable: false,
            allowPersonalMsg: true,
            allowAddons: true,
            addonsOptions: ['Heart Balloon', 'Chocolates', 'Roses'],
            featured: false,
            images: ['https://images.unsplash.com/photo-1551515917-e5fe0e2d3f8e?w=500'],
        },
        {
            name: 'Jewelry Box',
            description: 'Elegant wooden jewelry box with velvet interior.',
            price: 1800,
            stock: 25,
            categoryId: createdCategories[1].id,
            isCustomizable: true,
            allowPersonalMsg: true,
            allowImageUpload: false,
            addonsOptions: ['Engraving', 'Gift Wrap'],
            featured: false,
            images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'],
        },
        {
            name: 'Gourmet Gift Basket',
            description: 'Assorted gourmet treats including cookies, nuts, and chocolates.',
            price: 2500,
            stock: 15,
            categoryId: createdCategories[0].id,
            isCustomizable: false,
            allowPersonalMsg: true,
            allowAddons: true,
            addonsOptions: ['Wine', 'Cheese', 'Greeting Card'],
            featured: true,
            images: ['https://images.unsplash.com/photo-1543168256-418811576931?w=500'],
        },
    ];
    for (const gift of gifts) {
        const { images, ...giftData } = gift;
        const createdGift = await prisma.gift.create({
            data: giftData,
        });
        // Create gift images
        for (let i = 0; i < images.length; i++) {
            await prisma.giftImage.create({
                data: {
                    giftId: createdGift.id,
                    url: images[i],
                    publicId: `seed-${createdGift.id}-${i}`,
                    isPrimary: i === 0,
                },
            });
        }
    }
    console.log('✅ Gifts created with images');
    // Create sample addresses
    await prisma.address.create({
        data: {
            userId: user1.id,
            fullName: 'John Doe',
            phone: '9841234567',
            addressLine: 'Thamel, Kathmandu',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600',
            country: 'Nepal',
            isDefault: true,
        },
    });
    await prisma.address.create({
        data: {
            userId: user2.id,
            fullName: 'Jane Smith',
            phone: '9857654321',
            addressLine: 'Lakeside, Pokhara',
            city: 'Pokhara',
            state: 'Gandaki',
            zipCode: '33700',
            country: 'Nepal',
            isDefault: true,
        },
    });
    console.log('✅ Addresses created');
    console.log('🎉 Seed completed successfully!');
    console.log('\n📧 Admin credentials:');
    console.log('   Email: admin@surprise.com');
    console.log('   Password: admin123');
    console.log('\n📧 Test user credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
}
main()
    .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map