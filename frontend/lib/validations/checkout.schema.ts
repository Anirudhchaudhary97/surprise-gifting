import * as Yup from 'yup';

export const checkoutValidationSchema = Yup.object({
    fullName: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Full name is required'),
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
        .required('Phone number is required'),
    addressLine: Yup.string()
        .min(5, 'Address must be at least 5 characters')
        .required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string().required('ZIP code is required'),
    country: Yup.string().required('Country is required'),
});
