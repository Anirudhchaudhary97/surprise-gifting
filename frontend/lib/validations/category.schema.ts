import * as Yup from 'yup';

export const categoryValidationSchema = Yup.object({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
    description: Yup.string(),
    imageUrl: Yup.string().url('Must be a valid URL'),
});
