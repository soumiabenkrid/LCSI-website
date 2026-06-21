"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
interface NewsArticle {
  id: number | string;
  slug?: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
  categoryColor: string;
}

interface NewsCardProps {
  article: NewsArticle;
  isLarge?: boolean;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
  article,
  isLarge = false,
  className = "",
}) => {
  const linkHref = article.slug
    ? `/news/${article.slug}`
    : `/news/${article.id}`;

  return (
    <Link
      href={linkHref}
      className={`bg-white rounded-lg hover:shadow-sm transition-shadow duration-300 overflow-hidden border border-gray-100 cursor-pointer ${className}`}
    >
      {/* Image Section */}
      <div className="relative">
      <Image
		  src={article.image && article.image.trim() !== "" ? article.image : "/placeholder.jpg"}
		  alt={article.title || "News image"}
		  width={500}
		  height={500}
		/>
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span
            className="px-3 py-1 text-xs font-medium text-white rounded-full"
            style={{ backgroundColor: article.categoryColor }}
          >
            {article.category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className={`p-4 ${isLarge ? "lg:p-6" : ""}`}>
        {/* Title */}
        <h3
          className={`font-semibold text-gray-900 mb-2 leading-tight overflow-hidden ${
            isLarge ? "text-xl lg:text-2xl mb-3" : "text-lg"
          }`}
        >
          {article.title}
        </h3>

        {/* Description */}
        <p
          className={`text-gray-600 text-sm mb-4 leading-relaxed overflow-hidden ${
            isLarge ? "" : "h-12"
          }`}
        >
          {article.description?.length > 150
            ? `${article.description.substring(0, 150)}...`
            : article.description}
        </p>

        {/* Date */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm font-medium">
            {article.date}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
