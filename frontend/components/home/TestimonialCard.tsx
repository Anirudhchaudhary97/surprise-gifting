import Image from 'next/image';
import Card from '../ui/Card';

interface TestimonialCardProps {
    name: string;
    role: string;
    image: string;
    rating: number;
    quote: string;
}

export default function TestimonialCard({ name, role, image, rating, quote }: TestimonialCardProps) {
    return (
        <Card glass variant="rose" className="p-8 h-full flex flex-col">
            {/* Stars */}
            <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-5 h-5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>

            {/* Quote */}
            <blockquote className="text-neutral-700 text-lg leading-relaxed mb-8 flex-grow italic">
                "{quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-rose-100">
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <h4 className="font-bold text-neutral-900">{name}</h4>
                    <p className="text-sm text-neutral-500">{role}</p>
                </div>
            </div>
        </Card>
    );
}
