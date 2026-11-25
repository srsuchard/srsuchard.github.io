import type { Profile } from "./schema";

// Approved 2026-11-24. No city, employment history, dates or qualifications.
// `about` and `principles` are drafted in Task 7 and approved at the M3 content review.
export const profile: Profile = {
  about: [],
  interests: ["Software engineering", "Cybersecurity", "AI", "Entrepreneurship"],
  education: [{ school: "Pacifica Christian High School" }],
  principles: [],
};
