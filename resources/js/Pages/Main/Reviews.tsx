import React, { useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import SEO from '../../Components/SEO'
import Layout from "../../Layouts/Layout";
import ReviewsSection from "../../Components/ReviewsSection";
import { motion } from "framer-motion";
import { Star, Send, MessageSquare } from "lucide-react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface Review {
    id: number;
    author_name: string;
    content: string;
    rating: number;
    created_at: string;
}

interface ReviewsPageProps {
    reviews: { data: Review[]; current_page: number; last_page: number; total: number };
    flash?: { success?: string; error?: string };
}

// ─── STAR RATING INPUT ──────────────────────────────────────────────────────

function StarRating({
    rating,
    onChange,
}: {
    rating: number;
    onChange: (r: number) => void;
}) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    className="transition-colors"
                >
                    <Star
                        className={`h-6 w-6 ${
                            star <= (hover || rating)
                                ? "fill-[#3D6B1F] text-[#3D6B1F]"
                                : "text-neutral-300"
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function Reviews({ reviews, flash }: ReviewsPageProps) {
    const { data, setData, post, processing, errors, reset, wasSuccessful } =
        useForm({
            author_name: "",
            email: "",
            content: "",
            rating: 5,
        });

    const recentlySubmitted = wasSuccessful;

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post("/reviews", {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <Layout>
            <SEO
                title="Guest Reviews | Beach House Botaland"
                description="Read what our guests have to say about their stay at Beach House Botaland in Limbe, Cameroon. Share your own experience with us."
                canonical={window.location.origin + "/reviews"}
            />

            <main className="overflow-x-hidden">
                {/* ── HERO ─────────────────────────────────────────────────────── */}
                <section className="relative bg-[#2D5016] py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2D5016]/95 via-[#2D5016]/80 to-[#1a3009]/90" />
                    <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-[#6B9E3F]/15 blur-3xl pointer-events-none" />

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 bg-[#F5F2E8]/15 border border-[#F5F2E8]/25 rounded-full px-4 py-1.5 text-[#C8DBA8] text-sm font-medium mb-6 backdrop-blur-sm">
                                <MessageSquare className="h-4 w-4" />
                                Guest Reviews
                            </span>
                            <h1 className="text-4xl sm:text-5xl font-bold text-[#F5F2E8] leading-tight">
                                What Our Guests Say
                            </h1>
                            <p className="mt-4 text-lg text-[#C8DBA8]/70 max-w-xl mx-auto">
                                Real experiences from guests who have stayed at
                                Beach House Botaland.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── REVIEWS LIST ─────────────────────────────────────────────── */}
                {reviews.data && reviews.data.length > 0 ? (
                    <ReviewsSection reviews={reviews.data} showHeading={false} />
                ) : (
                    <section className="py-20 bg-[#EAE6D6]">
                        <div className="mx-auto max-w-7xl px-4 text-center">
                            <MessageSquare className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                            <p className="text-neutral-500 text-lg">
                                No reviews yet. Be the first to share your
                                experience!
                            </p>
                        </div>
                    </section>
                )}

                {/* ── PAGINATION ───────────────────────────────────────────────── */}
                {reviews.last_page > 1 && (
                    <div className="bg-[#EAE6D6] pb-16">
                        <div className="mx-auto max-w-7xl px-4 flex justify-center gap-2">
                            {Array.from(
                                { length: reviews.last_page },
                                (_, i) => i + 1
                            ).map((page) => (
                                <Link
                                    key={page}
                                    href={`/reviews?page=${page}`}
                                    preserveScroll
                                    className={`h-10 w-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all ${
                                        page === reviews.current_page
                                            ? "bg-[#2D5016] text-[#F5F2E8]"
                                            : "bg-white text-[#2D5016] hover:bg-[#2D5016]/10 border border-[#2D5016]/10"
                                    }`}
                                >
                                    {page}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SUBMIT REVIEW FORM ────────────────────────────────────────── */}
                <section className="py-20 bg-[#F5F2E8]">
                    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-10"
                        >
                            <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">
                                Share Your Experience
                            </span>
                            <h2 className="mt-3 text-3xl font-bold text-[#2D5016]">
                                Leave a Review
                            </h2>
                            <p className="mt-3 text-neutral-500">
                                We'd love to hear about your stay at Beach House
                                Botaland.
                            </p>
                        </motion.div>

                        {recentlySubmitted && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-4 bg-[#3D6B1F]/10 border border-[#3D6B1F]/20 rounded-xl text-[#2D5016] text-sm text-center"
                            >
                                Thank you for your review! It will be visible
                                once approved.
                            </motion.div>
                        )}

                        {flash?.success && !recentlySubmitted && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-4 bg-[#3D6B1F]/10 border border-[#3D6B1F]/20 rounded-xl text-[#2D5016] text-sm text-center"
                            >
                                {flash.success}
                            </motion.div>
                        )}

                        <motion.form
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white rounded-2xl p-8 border border-[#2D5016]/10 shadow-sm space-y-6"
                        >
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="author_name"
                                    className="block text-sm font-semibold text-[#2D5016] mb-1.5"
                                >
                                    Your Name *
                                </label>
                                <input
                                    id="author_name"
                                    type="text"
                                    value={data.author_name}
                                    onChange={(e) =>
                                        setData("author_name", e.target.value)
                                    }
                                    required
                                    placeholder="John Doe"
                                    className="w-full rounded-xl border border-[#2D5016]/15 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#6B9E3F]/30 focus:border-[#6B9E3F] transition-all"
                                />
                                {errors.author_name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.author_name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-[#2D5016] mb-1.5"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    placeholder="john@example.com"
                                    className="w-full rounded-xl border border-[#2D5016]/15 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#6B9E3F]/30 focus:border-[#6B9E3F] transition-all"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-semibold text-[#2D5016] mb-1.5">
                                    Your Rating *
                                </label>
                                <StarRating
                                    rating={data.rating}
                                    onChange={(r) => setData("rating", r)}
                                />
                                {errors.rating && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.rating}
                                    </p>
                                )}
                            </div>

                            {/* Review Content */}
                            <div>
                                <label
                                    htmlFor="content"
                                    className="block text-sm font-semibold text-[#2D5016] mb-1.5"
                                >
                                    Your Review *
                                </label>
                                <textarea
                                    id="content"
                                    rows={4}
                                    value={data.content}
                                    onChange={(e) =>
                                        setData("content", e.target.value)
                                    }
                                    required
                                    placeholder="Tell us about your experience..."
                                    className="w-full rounded-xl border border-[#2D5016]/15 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#6B9E3F]/30 focus:border-[#6B9E3F] transition-all resize-none"
                                />
                                {errors.content && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.content}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 bg-[#2D5016] text-[#F5F2E8] font-semibold px-6 py-3.5 rounded-xl hover:bg-[#3D6B1F] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    "Submitting..."
                                ) : (
                                    <>
                                        Submit Review
                                        <Send className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    </div>
                </section>
            </main>
        </Layout>
    );
}
