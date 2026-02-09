"use client";

import { useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { th, enUS } from "date-fns/locale";
import { Send, Loader2, MoreHorizontal, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth";
import { LoginDialog } from "@/features/auth";
import { useComments, useCreateComment, useDeleteComment } from "../hooks";
import type { Comment } from "../types";

interface CommentsSheetProps {
  reelId: string;
  locale?: "th" | "en";
  trigger?: React.ReactNode;
  commentsCount?: number;
  // Controlled mode props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommentsSheet({
  reelId,
  locale = "th",
  trigger,
  commentsCount = 0,
  open: controlledOpen,
  onOpenChange,
}: CommentsSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;
  const [newComment, setNewComment] = useState("");

  const { user, isAuthenticated } = useAuthStore();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useComments(reelId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const comments = data?.pages.flatMap((page) => page.data) ?? [];
  const totalComments = data?.pages[0]?.meta.total ?? commentsCount;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !isAuthenticated) return;

      createComment.mutate(
        { reelId, data: { content: newComment.trim() } },
        {
          onSuccess: () => setNewComment(""),
        }
      );
    },
    [newComment, isAuthenticated, createComment, reelId]
  );

  const handleDelete = useCallback(
    (commentId: string) => {
      deleteComment.mutate({ commentId, reelId });
    },
    [deleteComment, reelId]
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: locale === "th" ? th : enUS,
    });
  };

  const getInitials = (comment: Comment) => {
    // ใช้ 2 ตัวแรกของ displayName (TH#xxx -> TH)
    if (comment.user?.displayName) {
      return comment.user.displayName.slice(0, 2).toUpperCase();
    }
    return "TH";
  };

  const getDisplayName = (comment: Comment) => {
    return comment.user?.displayName || "TH#000000000";
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="bottom" className="h-[70vh] sm:h-[80vh] p-0">
        <div className="max-w-lg mx-auto w-full h-full flex flex-col">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="text-center">
              {locale === "th" ? "ความคิดเห็น" : "Comments"}{" "}
              {totalComments > 0 && `(${totalComments})`}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col flex-1 min-h-0">
            {/* Comments list */}
            <ScrollArea className="flex-1 px-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <p>
                    {locale === "th"
                      ? "ยังไม่มีความคิดเห็น"
                      : "No comments yet"}
                  </p>
                  <p className="text-sm">
                    {locale === "th"
                      ? "เป็นคนแรกที่แสดงความคิดเห็น!"
                      : "Be the first to comment!"}
                  </p>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      locale={locale}
                      formatTime={formatTime}
                      getInitials={getInitials}
                      getDisplayName={getDisplayName}
                      onDelete={handleDelete}
                      isOwner={user?.id === comment.userId}
                      isDeleting={deleteComment.isPending}
                    />
                  ))}

                  {/* Load more button */}
                  {hasNextPage && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {locale === "th" ? "โหลดเพิ่ม" : "Load more"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Comment input */}
            <div className="border-t p-4">
              {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-sm rounded-lg">
                      {user?.displayName?.slice(0, 2) || "TH"}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    placeholder={
                      locale === "th" ? "เขียนความคิดเห็น..." : "Add a comment..."
                    }
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                    disabled={createComment.isPending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newComment.trim() || createComment.isPending}
                  >
                    {createComment.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {locale === "th"
                      ? "เข้าสู่ระบบเพื่อแสดงความคิดเห็น"
                      : "Login to comment"}
                  </span>
                  <LoginDialog locale={locale}>
                    <Button size="sm">
                      {locale === "th" ? "เข้าสู่ระบบ" : "Login"}
                    </Button>
                  </LoginDialog>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Individual comment item
interface CommentItemProps {
  comment: Comment;
  locale: "th" | "en";
  formatTime: (dateString: string) => string;
  getInitials: (comment: Comment) => string;
  getDisplayName: (comment: Comment) => string;
  onDelete: (commentId: string) => void;
  isOwner: boolean;
  isDeleting: boolean;
}

function CommentItem({
  comment,
  locale,
  formatTime,
  getInitials,
  getDisplayName,
  onDelete,
  isOwner,
  isDeleting,
}: CommentItemProps) {
  return (
    <div className="flex gap-2.5">
      <Avatar className="h-8 w-8 flex-shrink-0 rounded-lg">
        <AvatarImage src={comment.user?.avatar} />
        <AvatarFallback className="text-xs rounded-lg">{getInitials(comment)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 leading-none">
        {/* Line 1: Name + Delete button */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm leading-tight">{getDisplayName(comment)}</span>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 -mt-1">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDelete(comment.id)}
                  disabled={isDeleting}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {locale === "th" ? "ลบ" : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Line 2: Badge + Level + Time */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground leading-tight">
          {comment.user && (
            <>
              <span>{comment.user.levelBadge || "⭐"}</span>
              <span>Lv.{comment.user.level || 1}</span>
              <span>•</span>
            </>
          )}
          <span>{formatTime(comment.createdAt)}</span>
        </div>

        {/* Line 3: Comment content */}
        <p className="text-sm leading-tight break-words mt-0.5">{comment.content}</p>
      </div>
    </div>
  );
}
