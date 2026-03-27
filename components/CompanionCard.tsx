"use client";
import { addBookmark, removeBookmark } from "@/lib/actions/companion.action";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState, useTransition } from "react";
declare type CompanionCardProps = {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color?: string;
  bookmarked: boolean;
};
const CompanionCard: FC<CompanionCardProps> = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked,
}) => {
  const path = usePathname();
  const router = useRouter();
  const { userId } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  useEffect(() => {
    setIsBookmarked(bookmarked);
  }, [bookmarked]);

  const handleBookmarkToggle = async () => {
    // Client-side check: redirect to sign-in if not authenticated
    if (!userId) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(path)}`);
      return;
    }

    const previousBookmarkState = isBookmarked;
    setIsBookmarked(!isBookmarked);

    startTransition(async () => {
      try {
        if (previousBookmarkState) {
          await removeBookmark(id, path);
        } else {
          await addBookmark(id, path);
        }
      } catch (error) {
        console.error("Bookmark action failed:", error);
        // Revert optimistic update on error
        setIsBookmarked(previousBookmarkState);
        // Optionally show error toast here
      }
    });
  };

  return (
    <article className='companion-card' style={{ backgroundColor: color }}>
      <div className='flex justify-between items-center'>
        <div className='subject-badge'>{subject}</div>
        <button
          className='companion-bookmark'
          onClick={handleBookmarkToggle}
          disabled={isPending}
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}>
          <Image
            src={
              isBookmarked
                ? "/icons/bookmark-filled.svg"
                : "/icons/bookmark.svg"
            }
            alt='bookmark'
            width={13}
            height={15}
          />
        </button>
      </div>

      <h2 className='text-2xl font-bold'>{name}</h2>
      <p className='text-sm'>{topic}</p>
      <div className='flex items-center gap-2'>
        <Image src='/icons/clock.svg' alt='duration' width={14} height={14} />
        <p className='text-sm'>{duration} minutes</p>
      </div>

      <Link href={`/companions/${id}`} className='w-full'>
        <button className='btn-primary w-full justify-center'>
          Launch Lesson
        </button>
      </Link>
    </article>
  );
};

export default CompanionCard;
