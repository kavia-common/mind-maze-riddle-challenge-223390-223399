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
      { question: "What has to be broken before you can use it?", answers: ["egg", "an egg"], hint: "Breakfast might help." },
      { question: "I’m tall when I’m young, and I’m short when I’m old. What am I?", answers: ["candle", "a candle"], hint: "Light me up." },
      { question: "What month of the year has 28 days?", answers: ["all", "all of them", "every month", "every"], hint: "Think broader." },
      { question: "What goes up but never comes down?", answers: ["age", "your age"], hint: "Numbers climb." },
      { question: "What has many keys but can’t open a single lock?", answers: ["piano", "a piano", "keyboard"], hint: "Musical." },
      { question: "I speak without a mouth and hear without ears. What am I?", answers: ["echo", "an echo"], hint: "Caves repeat." },
      { question: "What can you keep after giving to someone?", answers: ["word", "your word", "promise"], hint: "Integrity." }
    ]
  },
  {
    id: 2,
    name: "Adept Analyst",
    timePerRiddle: 18,
    lives: 3,
    points: 15,
    riddles: [
      { question: "What is full of holes but still holds water?", answers: ["sponge", "a sponge"], hint: "Kitchen helper." },
      { question: "What can you catch, but not throw?", answers: ["cold", "a cold"], hint: "Stay warm." },
      { question: "The more of this there is, the less you see. What is it?", answers: ["darkness", "the dark"], hint: "Nightfall." },
      { question: "What has one eye but can’t see?", answers: ["needle", "a needle"], hint: "Sewing kit." },
      { question: "What has a head and a tail but no body?", answers: ["coin", "a coin"], hint: "Pocket change." },
      { question: "What gets bigger the more you take away?", answers: ["hole", "a hole"], hint: "Subtraction paradox." },
      { question: "I’m found in socks, scarves and mittens; and often in the paws of playful kittens. What am I?", answers: ["yarn", "wool", "string"], hint: "Crafty." }
    ]
  },
  {
    id: 3,
    name: "Master Mind",
    timePerRiddle: 15,
    lives: 2,
    points: 25,
    riddles: [
      { question: "I have branches, but no fruit, trunk or leaves. What am I?", answers: ["bank", "a bank"], hint: "Money moves here." },
      { question: "What disappears as soon as you say its name?", answers: ["silence"], hint: "Shh..." },
      { question: "What gets wet while drying?", answers: ["towel", "a towel"], hint: "Bathroom staple." },
      { question: "What invention lets you look right through a wall?", answers: ["window", "a window"], hint: "View outside." },
      { question: "I shave every day, but my beard stays the same. Who am I?", answers: ["barber", "a barber"], hint: "Profession." },
      { question: "What building has the most stories?", answers: ["library", "the library"], hint: "Quiet please." },
      { question: "What can travel around the world while staying in a corner?", answers: ["stamp", "a stamp"], hint: "Mail." }
    ]
  }
];
