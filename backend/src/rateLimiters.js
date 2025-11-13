import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis.js";

const ephemeralCache = new Map();

export const makeLimiter = ({
  refillRate,
  refillInterval,
  tokens,
  category,
}) => {
  return {
    limiter: new Ratelimit({
      redis,
      limiter: Ratelimit.tokenBucket(refillRate, refillInterval, tokens),
      prefix: `rate-limit-${category}-`,
      analytics: false,
      ephemeralCache,
    }),
    category,
  };
};

export const signupLimiter = makeLimiter({
  tokens: 5,
  refillInterval: "2 m",
  refillRate: 1,
  category: "signup",
});

export const loginLimiter = makeLimiter({
  tokens: 5,
  refillInterval: "10 m",
  refillRate: 1,
  category: "login",
});

export const authRefreshLimiter = makeLimiter({
  tokens: 20,
  refillInterval: "5 m",
  refillRate: 10,
  category: "profile",
});

export const selfProfileLimiter = makeLimiter({
  tokens: 10,
  refillInterval: "2 m",
  refillRate: 5,
  category: "profile"
})

export const passwordChangeLimiter = makeLimiter({
  tokens: 3,
  refillInterval: "1 h",
  refillRate: 1,
  category: "password change",
});

export const userListingLimiter = makeLimiter({
  tokens: 20,
  refillInterval: "2 m",
  refillRate: 10,
  category: "user listing",
});

export const balanceCheckLimiter = makeLimiter({
  tokens: 10,
  refillInterval: "1 m",
  refillRate: 5,
  category: "balance check",
});

export const fullNameChangeLimiter = makeLimiter({
  tokens: 3,
  refillInterval: "3 d",
  refillRate: 1,
  category: "full name change",
});

export const paymentWriteLimiter = makeLimiter({
  tokens: 10,
  refillInterval: "2 m",
  refillRate: 1,
  category: "payment",
});

export const paymentListingLimiter = makeLimiter({
  tokens: 20,
  refillInterval: "2 m",
  refillRate: 10,
  category: "payment listing",
});

export const paymentReceiptLimiter = makeLimiter({
  tokens: 5,
  refillInterval: "1 m",
  refillRate: 5,
  category: "payment receipt",
});

