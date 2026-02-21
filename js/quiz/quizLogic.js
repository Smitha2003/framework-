// Quiz Logic Module
const QuizLogic = {
  // Quiz questions mapped to cognitive dimensions
  questions: [
    {
      id: 1,
      text: "When starting a new project, you typically:",
      answers: [
        { text: "Create a detailed plan and timeline", type: "architect", weight: 3 },
        { text: "Jump in and figure it out as you go", type: "sprinter", weight: 3 },
        { text: "Think about the big picture and possibilities", type: "dreamer", weight: 3 },
        { text: "See what needs to happen and adapt quickly", type: "juggler", weight: 3 }
      ]
    },
    {
      id: 2,
      text: "Your ideal task list is:",
      answers: [
        { text: "Comprehensive with priorities and deadlines", type: "architect", weight: 3 },
        { text: "Just a few high-impact items", type: "minimalist", weight: 3 },
        { text: "Flexible and open to change", type: "dreamer", weight: 3 },
        { text: "Organized by context and urgency", type: "juggler", weight: 2 }
      ]
    },
    {
      id: 3,
      text: "When you encounter unexpected obstacles, you:",
      answers: [
        { text: "Work through them systematically", type: "architect", weight: 2 },
        { text: "Work faster to overcome them", type: "sprinter", weight: 3 },
        { text: "Look for alternative, creative solutions", type: "dreamer", weight: 3 },
        { text: "Pivot and handle multiple solutions at once", type: "juggler", weight: 3 }
      ]
    },
    {
      id: 4,
      text: "Deadlines make you feel:",
      answers: [
        { text: "Energized and focused", type: "sprinter", weight: 3 },
        { text: "Slightly anxious but motivated", type: "architect", weight: 2 },
        { text: "Constrained and creatively limited", type: "dreamer", weight: 2 },
        { text: "Ready to juggle multiple priorities", type: "juggler", weight: 3 }
      ]
    },
    {
      id: 5,
      text: "Your workspace is typically:",
      answers: [
        { text: "Well-organized and systematic", type: "architect", weight: 3 },
        { text: "Minimal and distraction-free", type: "minimalist", weight: 3 },
        { text: "Visual and inspiring with many ideas around", type: "dreamer", weight: 3 },
        { text: "Dynamic and changing based on current focus", type: "juggler", weight: 2 }
      ]
    },
    {
      id: 6,
      text: "When learning something new, you prefer to:",
      answers: [
        { text: "Study the fundamentals first, then apply", type: "architect", weight: 3 },
        { text: "Learn from real-world experience quickly", type: "sprinter", weight: 3 },
        { text: "Understand the broader implications first", type: "dreamer", weight: 3 },
        { text: "Learn while doing multiple related things", type: "juggler", weight: 2 }
      ]
    },
    {
      id: 7,
      text: "Which describes your focus style?",
      answers: [
        { text: "Deep focus on one thing at a time", type: "architect", weight: 3 },
        { text: "Intense sprints followed by rest", type: "sprinter", weight: 3 },
        { text: "Zoom out and in between details and big picture", type: "dreamer", weight: 2 },
        { text: "Context-switching between many tasks smoothly", type: "juggler", weight: 3 }
      ]
    },
    {
      id: 8,
      text: "How do you measure productivity?",
      answers: [
        { text: "By completion of planned items", type: "architect", weight: 3 },
        { text: "By velocity and momentum", type: "sprinter", weight: 3 },
        { text: "By quality of ideas generated", type: "dreamer", weight: 2 },
        { text: "By handling everything on my plate", type: "juggler", weight: 2 }
      ]
    },
    {
      id: 9,
      text: "Your biggest challenge is usually:",
      answers: [
        { text: "Being too rigid in your plans", type: "architect", weight: 1 },
        { text: "Burning out from high intensity", type: "sprinter", weight: 2 },
        { text: "Getting stuck in analysis and dreaming", type: "dreamer", weight: 3 },
        { text: "Taking on too much at once", type: "juggler", weight: 3 }
      ]
    },
    {
      id: 10,
      text: "You thrive in environments that are:",
      answers: [
        { text: "Structured with clear processes", type: "architect", weight: 3 },
        { text: "Fast-paced with high stakes", type: "sprinter", weight: 3 },
        { text: "Open-ended and exploratory", type: "dreamer", weight: 3 },
        { text: "Varied and dynamic", type: "juggler", weight: 3 }
      ]
    }
  ],

  // Calculate brain type based on answers
  calculateBrainType(answers) {
    const scores = {
      architect: 0,
      sprinter: 0,
      dreamer: 0,
      juggler: 0,
      minimalist: 0
    };

    // Sum weights for each type
    answers.forEach((answerIndex, questionIndex) => {
      const question = this.questions[questionIndex];
      const selectedAnswer = question.answers[answerIndex];
      scores[selectedAnswer.type] += selectedAnswer.weight;
    });

    // Handle minimalist special case (appears in specific questions)
    const minimalistBonus = answers[1] === 1 ? 2 : 0;
    scores.minimalist += minimalistBonus;

    // Find top 2 brain types
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1]);

    return {
      primary: sorted[0][0],
      primaryScore: sorted[0][1],
      secondary: sorted[1][0],
      secondaryScore: sorted[1][1],
      allScores: scores
    };
  },

  // Get brain type descriptions
  getBrainTypeInfo(type) {
    const info = {
      architect: {
        title: "Architect",
        emoji: "🏗️",
        description: "Structured, systematic, detail-oriented",
        strength: "You excel at creating frameworks and systems that others can follow. Your methodical approach ensures nothing falls through the cracks.",
        challenge: "You might get stuck in planning mode instead of executing. Remember: done is better than perfect.",
        dashboard: "Your dashboard emphasizes structure, detailed metrics, and long-term planning capabilities."
      },
      sprinter: {
        title: "Sprinter",
        emoji: "🏃",
        description: "Fast-paced, deadline-driven, momentum-focused",
        strength: "You thrive under pressure and deliver rapidly. Your ability to focus intensely makes you incredibly productive.",
        challenge: "You might burn out from constant high intensity. Build recovery time into your workflow.",
        dashboard: "Your dashboard highlights velocity, streak tracking, and quick wins to maintain momentum."
      },
      dreamer: {
        title: "Dreamer",
        emoji: "💭",
        description: "Creative, visionary, big-picture thinker",
        strength: "You generate innovative ideas and see possibilities others miss. Your vision inspires and guides direction.",
        challenge: "You might get lost in possibilities and struggle with execution. Break big ideas into smaller steps.",
        dashboard: "Your dashboard emphasizes ideation, inspiration, and creative exploration."
      },
      juggler: {
        title: "Juggler",
        emoji: "🤹",
        description: "Multitasker, adaptive, context-switcher",
        strength: "You handle complexity and context-switching effortlessly. Your flexibility makes you invaluable in dynamic environments.",
        challenge: "You might scatter your attention too thin. Batch similar tasks to maintain momentum.",
        dashboard: "Your dashboard handles multiple parallel streams and adapts to your constantly shifting focus."
      },
      minimalist: {
        title: "Minimalist",
        emoji: "🎯",
        description: "Simplicity-focused, essential-only thinker",
        strength: "You cut through clutter and focus on what truly matters. Your clarity and simplicity are powerful.",
        challenge: "You might oversimplify complex situations. Sometimes good requires nuance.",
        dashboard: "Your dashboard strips away distractions, showing only what's absolutely essential."
      }
    };

    return info[type];
  }
};
