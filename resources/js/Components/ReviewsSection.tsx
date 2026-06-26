import React from "react";
import { motion, Variants } from "framer-motion";
import { Star } from "lucide-react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface Testimonial {
    id: number | string;
    author_name: string;
    content: string;
    rating: number;
}

interface ReviewsSectionProps {
    reviews: Testimonial[];
    showHeading?: boolean;
}

// ─── ANIMATION WRAPPERS ─────────────────────────────────────────────────────

const StaggerContainer = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const variants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };
    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const StaggerItem = ({ children }: { children: React.ReactNode }) => {
    const variants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };
    return <motion.div variants={variants}>{children}</motion.div>;
};

const Reveal = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
        {children}
    </motion.div>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

const ReviewsSection = React.memo(function ReviewsSection({
    reviews = [],
    showHeading = true,
}: ReviewsSectionProps) {
    if (!reviews || reviews.length === 0) {
        return null;
    }

    return (
        <section className="py-28 bg-[#EAE6D6]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {showHeading && (
                    <Reveal className="text-center mb-12">
                        <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">
                            Testimonials
                        </span>
                        <h2 className="mt-3 text-4xl font-bold text-[#2D5016]">
                            What Our Guests Say
                        </h2>
                    </Reveal>
                )}

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((review) => {
                        const rating = Math.min(5, Math.max(0, Math.floor(review.rating)));
                        return (
                            <StaggerItem key={review.id}>
                                <div className="bg-[#F5F2E8] h-full rounded-2xl p-7 border border-[#2D5016]/10 hover:shadow-lg transition-shadow flex flex-col justify-between">
                                    <div>
                                        <div className="flex gap-1 mb-4">
                                            {Array.from({ length: rating }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="h-4 w-4 fill-[#3D6B1F] text-[#3D6B1F]"
                                                />
                                            ))}
                                        </div>
                                        <p className="text-neutral-600 text-sm leading-relaxed mb-5">
                                            "{review.content}"
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="h-9 w-9 rounded-full bg-[#2D5016] flex items-center justify-center text-[#F5F2E8] font-bold text-sm select-none">
                                            {review.author_name[0]?.toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-[#2D5016] text-sm">
                                            {review.author_name}
                                        </span>
                                    </div>
                                </div>
                            </StaggerItem>
                        );
                    })}
                </StaggerContainer>
            </div>
        </section>
    );
});

export default ReviewsSection;
