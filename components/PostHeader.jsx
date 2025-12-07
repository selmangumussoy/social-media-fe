"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PostHeader({
                                       username,
                                       fullName,
                                       avatarUrl,
                                       timeAgo,
                                       isFollowing,
                                       handleFollow,
                                       currentUserId,
                                       postUserId,
                                   }) {
    // Kullanıcı kendi gönderisine bakıyorsa takip et butonunu gösterme
    // Güvenli kıyaslama için String'e çeviriyoruz
    const isOwner = String(currentUserId) === String(postUserId);

    return (
        <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 items-center">
                {/* Avatar Kısmı */}
                <Link href={`/profile/${username}`} className="cursor-pointer">
                    <Avatar className="h-12 w-12 border border-gray-100 shadow-sm">
                        <AvatarImage src={avatarUrl} alt={fullName} />
                        <AvatarFallback>{fullName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                </Link>

                {/* İsim ve Zaman Bilgisi */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/profile/${username}`}
                            className="font-bold text-gray-900 hover:underline text-lg"
                        >
                            {fullName}
                        </Link>

                        {/* Takip Et Butonu Mantığı */}
                        {!isOwner && currentUserId && (
                            <>
                                <span className="text-gray-300 text-xs">•</span>
                                <button
                                    onClick={handleFollow}
                                    className={`text-sm font-semibold transition-colors ${
                                        isFollowing
                                            ? "text-gray-500 hover:text-gray-700"
                                            : "text-blue-600 hover:text-blue-700"
                                    }`}
                                >
                                    {isFollowing ? "Takip Ediliyor" : "Takip Et"}
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>@{username}</span>
                        <span>•</span>
                        <span>{timeAgo}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}