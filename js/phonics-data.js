/**
 * Amina AAC & Phonics Studio - Hooked on Phonics Curriculum & Learning Engine
 * Systematic Multi-Sensory Phonics: Sound Wall, Blending Board, Decodable Stories, & Word Family Jam
 */

const PHONICS_CURRICULUM = {
  // 1. The Sound Wall: Letter-Sound Associations
  alphabet: [
    { letter: "A", sound: "short a (/æ/)", word: "Apple", icon: "🍎", type: "vowel", cue: "Open mouth wide, tongue low in front" },
    { letter: "B", sound: "/b/", word: "Ball", icon: "⚽", type: "consonant", cue: "Lips pressed together, quick burst of air" },
    { letter: "C", sound: "/k/", word: "Cat", icon: "🐱", type: "consonant", cue: "Back of tongue against roof of mouth" },
    { letter: "D", sound: "/d/", word: "Duck", icon: "🦆", type: "consonant", cue: "Tip of tongue behind top front teeth" },
    { letter: "E", sound: "short e (/ɛ/)", word: "Elephant", icon: "🐘", type: "vowel", cue: "Mouth slightly open, relaxed smile" },
    { letter: "F", sound: "/f/", word: "Fish", icon: "🐟", type: "consonant", cue: "Top teeth gently touching lower lip" },
    { letter: "G", sound: "/g/", word: "Guitar", icon: "🎸", type: "consonant", cue: "Back of throat sound, voice on" },
    { letter: "H", sound: "/h/", word: "Hat", icon: "🎩", type: "consonant", cue: "Warm breath out with mouth open" },
    { letter: "I", sound: "short i (/ɪ/)", word: "Igloo", icon: "🧊", type: "vowel", cue: "Gentle smile, tongue resting high" },
    { letter: "J", sound: "/dʒ/", word: "Juice", icon: "🧃", type: "consonant", cue: "Rounded lips, soft punchy voice" },
    { letter: "K", sound: "/k/", word: "Kite", icon: "🪁", type: "consonant", cue: "Crisp back-tongue tap" },
    { letter: "L", sound: "/l/", word: "Lion", icon: "🦁", type: "consonant", cue: "Tip of tongue behind upper front teeth" },
    { letter: "M", sound: "/m/", word: "Moon", icon: "🌙", type: "consonant", cue: "Lips closed together, gentle hum" },
    { letter: "N", sound: "/n/", word: "Nest", icon: "🪺", type: "consonant", cue: "Tongue roof tap, air through nose" },
    { letter: "O", sound: "short o (/ɒ/)", word: "Octopus", icon: "🐙", type: "vowel", cue: "Mouth round like an O, jaw dropped" },
    { letter: "P", sound: "/p/", word: "Pig", icon: "🐷", type: "consonant", cue: "Quiet pop of air between two lips" },
    { letter: "Q", sound: "/kw/", word: "Queen", icon: "👑", type: "consonant", cue: "Pucker lips into /kw/ combo" },
    { letter: "R", sound: "/r/", word: "Rainbow", icon: "🌈", type: "consonant", cue: "Sides of tongue touch upper molars" },
    { letter: "S", sound: "/s/", word: "Sun", icon: "☀️", type: "consonant", cue: "Teeth together, hiss like a friendly snake" },
    { letter: "T", sound: "/t/", word: "Turtle", icon: "🐢", type: "consonant", cue: "Quiet crisp tap of tongue on roof" },
    { letter: "U", sound: "short u (/ʌ/)", word: "Umbrella", icon: "☂️", type: "vowel", cue: "Relaxed open mouth, belly breath" },
    { letter: "V", sound: "/v/", word: "Van", icon: "🚐", type: "consonant", cue: "Teeth on lip with humming voice" },
    { letter: "W", sound: "/w/", word: "Water", icon: "💧", type: "consonant", cue: "Small round circle lips blowing forward" },
    { letter: "X", sound: "/ks/", word: "Box", icon: "📦", type: "consonant", cue: "Starts as /k/ ends as /s/" },
    { letter: "Y", sound: "/j/", word: "Yo-Yo", icon: "🪀", type: "consonant", cue: "Sides of tongue high, glide voice" },
    { letter: "Z", sound: "/z/", word: "Zebra", icon: "🦓", type: "consonant", cue: "Teeth together, buzzing bee sound" }
  ],

  // Consonant Digraphs & Teams
  digraphs: [
    { letter: "CH", sound: "/tʃ/", word: "Chair", icon: "🪑", cue: "Choo-choo train sound, tongue pops forward" },
    { letter: "SH", sound: "/ʃ/", word: "Ship", icon: "🚢", cue: "Quiet shhh sound, rounded gentle lips" },
    { letter: "TH", sound: "/θ/", word: "Thumb", icon: "👍", cue: "Tongue tip peeking between front teeth" },
    { letter: "WH", sound: "/w/", word: "Whale", icon: "🐋", cue: "Whistling round lips, breath out" },
    { letter: "CK", sound: "/k/", word: "Duck", icon: "🦆", cue: "Quick crisp /k/ at the end of short vowel words" }
  ],

  // 2. CVC Word Families (Classic Hooked-on-Phonics Blending Progression)
  wordFamilies: [
    {
      id: "at",
      name: "-AT Family",
      vowel: "a",
      rime: "at",
      words: [
        { word: "cat", onset: "c", vowel: "a", coda: "t", icon: "🐱", sentence: "The cat sat on the mat." },
        { word: "bat", onset: "b", vowel: "a", coda: "t", icon: "🦇", sentence: "A bat flies at night." },
        { word: "hat", onset: "h", vowel: "a", coda: "t", icon: "🎩", sentence: "I like my warm hat." },
        { word: "mat", onset: "m", vowel: "a", coda: "t", icon: "🧘", sentence: "Sit down on the mat." },
        { word: "rat", onset: "r", vowel: "a", coda: "t", icon: "🐀", sentence: "The little rat ran fast." }
      ]
    },
    {
      id: "an",
      name: "-AN Family",
      vowel: "a",
      rime: "an",
      words: [
        { word: "can", onset: "c", vowel: "a", coda: "n", icon: "🥫", sentence: "I can run and jump!" },
        { word: "fan", onset: "f", vowel: "a", coda: "n", icon: "🪭", sentence: "Turn on the cool fan." },
        { word: "man", onset: "m", vowel: "a", coda: "n", icon: "👨", sentence: "The kind man waved." },
        { word: "pan", onset: "p", vowel: "a", coda: "n", icon: "🍳", sentence: "Cook eggs in the pan." },
        { word: "van", onset: "v", vowel: "a", coda: "n", icon: "🚐", sentence: "We ride in the blue van." }
      ]
    },
    {
      id: "op",
      name: "-OP Family",
      vowel: "o",
      rime: "op",
      words: [
        { word: "hop", onset: "h", vowel: "o", coda: "p", icon: "🦘", sentence: "Watch the bunny hop!" },
        { word: "mop", onset: "m", vowel: "o", coda: "p", icon: "🧹", sentence: "Clean the floor with a mop." },
        { word: "pop", onset: "p", vowel: "o", coda: "p", icon: "🎈", sentence: "The bubble went pop!" },
        { word: "top", onset: "t", vowel: "o", coda: "p", icon: "🔝", sentence: "We climbed to the top." }
      ]
    },
    {
      id: "ig",
      name: "-IG Family",
      vowel: "i",
      rime: "ig",
      words: [
        { word: "big", onset: "b", vowel: "i", coda: "g", icon: "🐘", sentence: "That elephant is very big!" },
        { word: "dig", onset: "d", vowel: "i", coda: "g", icon: "⛏️", sentence: "I like to dig in the sand." },
        { word: "pig", onset: "p", vowel: "i", coda: "g", icon: "🐷", sentence: "The pink pig is cute." },
        { word: "wig", onset: "w", vowel: "i", coda: "g", icon: "💇", sentence: "She wore a funny wig." }
      ]
    },
    {
      id: "ug",
      name: "-UG Family",
      vowel: "u",
      rime: "ug",
      words: [
        { word: "bug", onset: "b", vowel: "u", coda: "g", icon: "🐛", sentence: "A little green bug crawled by." },
        { word: "hug", onset: "h", vowel: "u", coda: "g", icon: "🤗", sentence: "I want a warm hug please." },
        { word: "mug", onset: "m", vowel: "u", coda: "g", icon: "☕", sentence: "Warm cocoa in my mug." },
        { word: "rug", onset: "r", vowel: "u", coda: "g", icon: "🧶", sentence: "Sit on the cozy rug." }
      ]
    },
    {
      id: "ed",
      name: "-ED Family",
      vowel: "e",
      rime: "ed",
      words: [
        { word: "bed", onset: "b", vowel: "e", coda: "d", icon: "🛏️", sentence: "Time to sleep in bed." },
        { word: "red", onset: "r", vowel: "e", coda: "d", icon: "🔴", sentence: "I see a red apple." },
        { word: "fed", onset: "f", vowel: "e", coda: "d", icon: "🥣", sentence: "I fed the hungry puppy." }
      ]
    }
  ],

  // 3. Decodable Phonics Readers (Seamless Bridge to AAC Sentence Strip)
  decodableStories: [
    {
      id: "story_1",
      title: "The Fat Cat",
      level: "Short A Focus",
      coverIcon: "🐱",
      lines: [
        { text: "The cat is fat.", words: ["the", "cat", "is", "fat"], aacTiles: ["I", "see", "cat"] },
        { text: "The fat cat sat on the mat.", words: ["the", "fat", "cat", "sat", "on", "the", "mat"], aacTiles: ["cat", "stop", "in"] },
        { text: "The cat wants a warm nap.", words: ["the", "cat", "wants", "a", "warm", "nap"], aacTiles: ["cat", "want", "sleep"] }
      ]
    },
    {
      id: "story_2",
      title: "A Big Red Bug",
      level: "Short U & I Focus",
      coverIcon: "🐛",
      lines: [
        { text: "I see a bug.", words: ["I", "see", "a", "bug"], aacTiles: ["I", "look", "different"] },
        { text: "It is a big red bug.", words: ["it", "is", "a", "big", "red", "bug"], aacTiles: ["big", "good"] },
        { text: "The big bug is on the rug.", words: ["the", "big", "bug", "is", "on", "the", "rug"], aacTiles: ["bug", "in", "home"] },
        { text: "I give the bug a gentle wave.", words: ["I", "give", "the", "bug", "a", "gentle", "wave"], aacTiles: ["hello", "friend"] }
      ]
    },
    {
      id: "story_3",
      title: "Run in the Sun",
      level: "Short U Focus",
      coverIcon: "☀️",
      lines: [
        { text: "The sun is up in the sky.", words: ["the", "sun", "is", "up", "in", "the", "sky"], aacTiles: ["look", "good"] },
        { text: "We can run and have fun.", words: ["we", "can", "run", "and", "have", "fun"], aacTiles: ["we", "go", "play"] },
        { text: "I like to play outside.", words: ["I", "like", "to", "play", "outside"], aacTiles: ["I", "like", "play"] }
      ]
    }
  ],

  // 4. "Word Family Jam" & Auditory Rhyme Practice Questions
  rhymeDrills: [
    {
      prompt: "Find the word that rhymes with 'CAT':",
      targetSound: "/æt/",
      options: [
        { word: "HAT", correct: true, icon: "🎩" },
        { word: "DOG", correct: false, icon: "🐶" },
        { word: "PIG", correct: false, icon: "🐷" }
      ],
      explanation: "'Cat' and 'Hat' both end in the /at/ sound!"
    },
    {
      prompt: "Which word starts with the /b/ sound?",
      targetSound: "/b/",
      options: [
        { word: "BALL", correct: true, icon: "⚽" },
        { word: "SUN", correct: false, icon: "☀️" },
        { word: "CAR", correct: false, icon: "🚗" }
      ],
      explanation: "'Ball' begins with the letter B and the sound /b/!"
    },
    {
      prompt: "Find the word that rhymes with 'BUG':",
      targetSound: "/ʌɡ/",
      options: [
        { word: "HUG", correct: true, icon: "🤗" },
        { word: "FISH", correct: false, icon: "🐟" },
        { word: "TREE", correct: false, icon: "🌳" }
      ],
      explanation: "'Bug' and 'Hug' belong to the -UG word family!"
    },
    {
      prompt: "Blend these sounds together: /p/ /i/ /g/",
      targetSound: "pig",
      options: [
        { word: "PIG", correct: true, icon: "🐷" },
        { word: "PAN", correct: false, icon: "🍳" },
        { word: "POT", correct: false, icon: "🍲" }
      ],
      explanation: "/p/ ... /i/ ... /g/ blends together into PIG!"
    },
    {
      prompt: "Which word rhymes with 'HOP'?",
      targetSound: "/ɒp/",
      options: [
        { word: "MOP", correct: true, icon: "🧹" },
        { word: "NET", correct: false, icon: "🥅" },
        { word: "CUP", correct: false, icon: "☕" }
      ],
      explanation: "'Hop' and 'Mop' both share the -OP rhyme family!"
    }
  ]
};

window.phonicsData = PHONICS_CURRICULUM;
