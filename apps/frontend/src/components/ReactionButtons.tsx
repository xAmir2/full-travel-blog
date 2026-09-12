import { useState } from "react";

import { Button, Spinner } from "react-bootstrap";

import {
  HandThumbsDown,
  HandThumbsDownFill,
  HandThumbsUp,
  HandThumbsUpFill,
} from "react-bootstrap-icons";

import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { getApiErrorMessage } from "../services/apiErrors";

import type { ReactionSummary, ReactionType } from "../types/models";

interface ReactionButtonsProps {
  reactions: ReactionSummary;
  onReact: (reactionType: ReactionType) => Promise<ReactionSummary>;
  onChange: (reactions: ReactionSummary) => void;
  label: string;
}

export function ReactionButtons({
  reactions,
  onReact,
  onChange,
  label,
}: ReactionButtonsProps) {
  const { user } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [pendingReaction, setPendingReaction] = useState<ReactionType | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);

  const isSubmitting = pendingReaction !== null;

  async function handleReaction(reactionType: ReactionType) {
    if (!user) {
      navigate("/login", {
        state: {
          from: `${location.pathname}${location.search}`,
        },
      });

      return;
    }

    if (isSubmitting) {
      return;
    }

    setPendingReaction(reactionType);
    setError(null);

    try {
      const updatedReactions = await onReact(reactionType);

      onChange(updatedReactions);
    } catch (reactionError) {
      setError(
        getApiErrorMessage(reactionError, "Your reaction could not be saved."),
      );
    } finally {
      setPendingReaction(null);
    }
  }

  const hasLiked = reactions.currentUserReaction === "LIKE";
  const hasDisliked = reactions.currentUserReaction === "DISLIKE";

  return (
    <div className="reaction-control">
      <div
        className="reaction-buttons"
        role="group"
        aria-label={`Reactions for ${label}`}
      >
        <Button
          type="button"
          variant="link"
          className={`reaction-button${hasLiked ? " active" : ""}`}
          aria-label={`Like ${label}`}
          aria-pressed={hasLiked}
          disabled={isSubmitting}
          onClick={() => void handleReaction("LIKE")}
        >
          {pendingReaction === "LIKE" ? (
            <Spinner animation="border" size="sm" />
          ) : hasLiked ? (
            <HandThumbsUpFill aria-hidden="true" />
          ) : (
            <HandThumbsUp aria-hidden="true" />
          )}

          <span>{reactions.likeCount}</span>
        </Button>

        <Button
          type="button"
          variant="link"
          className={`reaction-button${hasDisliked ? " active dislike" : ""}`}
          aria-label={`Dislike ${label}`}
          aria-pressed={hasDisliked}
          disabled={isSubmitting}
          onClick={() => void handleReaction("DISLIKE")}
        >
          {pendingReaction === "DISLIKE" ? (
            <Spinner animation="border" size="sm" />
          ) : hasDisliked ? (
            <HandThumbsDownFill aria-hidden="true" />
          ) : (
            <HandThumbsDown aria-hidden="true" />
          )}

          <span>{reactions.dislikeCount}</span>
        </Button>
      </div>

      {error && (
        <small className="reaction-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
