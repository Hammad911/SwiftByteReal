"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Star, Loader2, MessageSquareQuote } from "lucide-react";
import { restaurantApi } from "@/lib/api";

const gold = "#F5A623";
const surface = "#161410";
const cream = "#F5ECD7";
const muted = "#9E8E78";
const border = "rgba(245,166,35,0.15)";

type ReviewRow = {
  id: string;
  score: number;
  comment: string | null;
  createdAt: string;
  rater: { id: string; name: string; avatar: string | null };
  order: { id: string; createdAt: string; total: number; status: string };
};

export default function ReviewsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["restaurant-reviews"],
    queryFn: () => restaurantApi.myReviews({ limit: 50 }).then((r) => r.data.data),
    retry: false,
  });

  const summary = data?.summary;
  const reviews: ReviewRow[] = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: gold }} />
        <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", color: muted, textTransform: "uppercase" }}>
          Loading feedback…
        </p>
      </div>
    );
  }

  if (isError) {
    const msg =
      (error as any)?.response?.data?.error ||
      (error as Error)?.message ||
      "Unknown error";
    return (
      <div
        className="rounded-2xl p-6 text-sm space-y-2"
        style={{ background: surface, border: `1px solid ${border}`, color: "#f87171" }}
      >
        <p>Couldn&apos;t load reviews. {msg}</p>
        <p style={{ color: muted, fontSize: "0.8rem" }}>
          If you recently logged in, try refreshing. You must be logged in as the restaurant owner.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: gold,
          }}
        >
          Customer voice
        </p>
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontStyle: "italic",
            fontSize: "1.75rem",
            color: cream,
            marginTop: "0.25rem",
          }}
        >
          Feedback & ratings
        </h1>
        <p style={{ color: muted, fontSize: "0.875rem", marginTop: "0.35rem", maxWidth: "36rem" }}>
          Ratings and comments left by customers after a delivered order. They help you spot what&apos;s
          working and what to improve.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-5"
          style={{ background: surface, border: `1px solid ${border}` }}
        >
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.15em", color: muted, textTransform: "uppercase" }}>
            Average rating
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", color: cream, lineHeight: 1 }}>
              {(summary?.avgRating ?? 0).toFixed(1)}
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-4 w-4"
                  style={{ color: s <= Math.round(summary?.avgRating ?? 0) ? gold : "#3d362c" }}
                  fill={s <= Math.round(summary?.avgRating ?? 0) ? gold : "transparent"}
                />
              ))}
            </div>
          </div>
        </div>
        <div
          className="rounded-2xl p-5"
          style={{ background: surface, border: `1px solid ${border}` }}
        >
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.15em", color: muted, textTransform: "uppercase" }}>
            Total reviews
          </p>
          <p style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", color: cream, marginTop: "0.25rem", lineHeight: 1 }}>
            {summary?.totalReviews ?? 0}
          </p>
          <p style={{ color: muted, fontSize: "0.75rem", marginTop: "0.35rem" }}>On your public profile</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: surface, border: `1px dashed ${border}` }}
        >
          <MessageSquareQuote className="h-10 w-10 mx-auto mb-3" style={{ color: "#3d362c" }} />
          <p style={{ color: cream, fontWeight: 600 }}>No feedback yet</p>
          <p style={{ color: muted, fontSize: "0.875rem", marginTop: "0.5rem", maxWidth: "22rem", marginInline: "auto" }}>
            When customers complete an order and submit a rating, it will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.18em", color: muted, textTransform: "uppercase" }}>
            Recent ({reviews.length})
          </p>
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl p-5"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "rgba(245,166,35,0.15)", color: gold }}
                  >
                    {rev.rater.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p style={{ color: cream, fontWeight: 600, fontSize: "0.95rem" }}>{rev.rater.name}</p>
                    <p style={{ color: muted, fontSize: "0.7rem", fontFamily: "var(--font-dm-mono)", letterSpacing: "0.06em" }}>
                      Order #{rev.order.id.slice(-6).toUpperCase()} ·{" "}
                      {formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="h-4 w-4"
                      style={{ color: s <= rev.score ? gold : "#3d362c" }}
                      fill={s <= rev.score ? gold : "transparent"}
                    />
                  ))}
                </div>
              </div>
              {rev.comment?.trim() ? (
                <p style={{ color: "#C4B5A0", fontSize: "0.9rem", marginTop: "1rem", lineHeight: 1.55 }} className="whitespace-pre-wrap">
                  {rev.comment}
                </p>
              ) : (
                <p style={{ color: muted, fontSize: "0.8rem", fontStyle: "italic", marginTop: "0.75rem" }}>No written comment</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
