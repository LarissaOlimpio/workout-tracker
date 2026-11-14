export const VideoRating = Object.freeze({
  Like: 'like',
  Dislike: 'dislike',
});
export type VideoRating = (typeof VideoRating)[keyof typeof VideoRating];
