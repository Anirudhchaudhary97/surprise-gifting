import * as Yup from 'yup';

export const giftCustomizationSchema = Yup.object({
    personalMessage: Yup.string().max(500, 'Message too long'),
    deliveryDate: Yup.date().min(new Date(), 'Date must be in the future').nullable(),
    selectedAddons: Yup.array().of(Yup.string()),
});

export const adminGiftSchema = Yup.object({
    name: Yup.string()
        .min(3, 'Name must be at least 3 characters')
        .required('Name is required'),
    description: Yup.string()
        .min(10, 'Description must be at least 10 characters')
        .required('Description is required'),
    price: Yup.number()
        .min(0, 'Price must be positive')
        .required('Price is required'),
    stock: Yup.number()
        .min(0, 'Stock must be positive')
        .required('Stock is required'),
    categoryId: Yup.string().required('Category is required'),
    isCustomizable: Yup.boolean(),
    allowPersonalMsg: Yup.boolean(),
    allowAddons: Yup.boolean(),
    allowImageUpload: Yup.boolean(),
    featured: Yup.boolean(),
    addonsOptions: Yup.string(),
});
