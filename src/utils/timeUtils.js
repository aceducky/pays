export const timeRemainingInSeconds = (futureTimeInSeconds) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return Math.max(0, futureTimeInSeconds - nowInSeconds);
};

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  const days = Math.ceil(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""}`;
};
