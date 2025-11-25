interface StepCardProps {
    number: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    isLast?: boolean;
}

export default function StepCard({ number, title, description, icon, isLast = false }: StepCardProps) {
    return (
        <div className="relative flex flex-col items-center text-center group">
            {/* Connecting Line (Desktop only) */}
            {!isLast && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-rose-200 via-lavender-200 to-rose-200 -z-10"></div>
            )}

            {/* Number Circle with Gradient */}
            <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-500 to-lavender-500 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                        <div className="text-rose-500 transform group-hover:scale-110 transition-transform duration-300">
                            {icon}
                        </div>
                    </div>
                </div>
                {/* Number Badge */}
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-lavender-500 to-rose-500 text-white font-bold flex items-center justify-center shadow-lg text-lg">
                    {number}
                </div>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-neutral-900 mb-3 font-playfair">
                {title}
            </h3>
            <p className="text-neutral-600 leading-relaxed max-w-xs">
                {description}
            </p>
        </div>
    );
}
