export const timeRemainingInSeconds = (futureTimeInSeconds) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return Math.max(0, futureTimeInSeconds - nowInSeconds);
};
