/**
 * Basic riddle set grouped by levels with increasing difficulty.
 * This can be later replaced by API data using env URLs from .env
 */

// PUBLIC_INTERFACE
export const LEVELS = [
  {
    id: 1,
    name: "Novice Navigator",
    timePerRiddle: 20,
    lives: 3,
    points: 10,
    riddles: [
      {
        question: "What has to be broken before you can use it?",
        answers: ["egg", "an egg"],
        hint: "Breakfast might help.",
      },
      {
        question: "I’m tall when I’m young, and I’m short when I’m old. What am I?",
        answers: ["candle", "a candle"],
        hint: "Light me up.",
      },
      {
        question: "What month of the year has 28 days?",
        answers: ["all", "all of them", "every month", "every"],
        hint: "Think broader.",
      }
    ]
  },
  {
    id: 2,
    name: "Adept Analyst",
    timePerRiddle: 18,
    lives: 3,
    points: 15,
    riddles: [
      {
        question: "What is full of holes but still holds water?",
        answers: ["sponge", "a sponge"],
        hint: "Kitchen helper.",
      },
      {
        question: "What can you catch, but not throw?",
        answers: ["cold", "a cold"],
        hint: "Stay warm.",
      },
      {
        question: "The more of this there is, the less you see. What is it?",
        answers: ["darkness", "the dark"],
        hint: "Nightfall.",
      }
    ]
  },
  {
    id: 3,
    name: "Master Mind",
    timePerRiddle: 15,
    lives: 2,
    points: 25,
    riddles: [
      {
        question: "I have branches, but no fruit, trunk or leaves. What am I?",
        answers: ["bank", "a bank"],
        hint: "Money moves here.",
      },
      {
        question: "What disappears as soon as you say its name?",
        answers: ["silence"],
        hint: "Shh...",
      },
      {
        question: "What gets wet while drying?",
        answers: ["towel", "a towel"],
        hint: "Bathroom staple.",
      }
    ]
  }
];
