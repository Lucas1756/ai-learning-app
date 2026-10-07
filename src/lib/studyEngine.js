const STOP_WORDS = new Set([
  'der', 'die', 'und', 'mit', 'das', 'ist', 'aus', 'auf', 'für', 'im', 'ein', 'eine', 'oder', 'dass', 'nicht', 'auch', 'sind', 'wird', 'wir', 'von', 'bei', 'den', 'des', 'dem', 'als', 'zur', 'zum', 'aber', 'nach', 'durch', 'einer', 'diese', 'dieser', 'diesen', 'diese', 'haben', 'wurde', 'werden', 'dabei', 'dann', 'sein', 'ihrer', 'ihre', 'über', 'unter', 'beim', 'mehr', 'weniger', 'sowie', 'beispiel', 'zwei', 'mehrere'
]);

function sanitizeText(text) {
  return String(text)
    .replace(/\s+/g, ' ')
    .replace(/\r/g, '')
    .trim();
}

function normalizeSentence(sentence) {
  return sentence.replace(/\s+/g, ' ').trim();
}

function shorten(text, maxLength = 80) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export function generateLearningPack({ text, topic = 'Lernstoff', difficulty = 'mittel' }) {
  const cleanText = sanitizeText(text || '');
  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => normalizeSentence(sentence))
    .filter((sentence) => sentence.length > 20);

  const safeSentences = sentences.length ? sentences : [cleanText];
  const keywords = Array.from(
    new Set(
      cleanText
        .toLowerCase()
        .replace(/[^a-zäöüß\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
    )
  ).slice(0, 8);

  const summary = safeSentences.slice(0, 3).join(' ');

  const flashcards = safeSentences.slice(0, 6).map((sentence, index) => ({
    id: index + 1,
    question: `Was ist die Hauptidee von: ${shorten(sentence, 60)}?`,
    answer: `Wichtig ist: ${sentence}`
  }));

  const quiz = safeSentences.slice(0, 5).map((sentence, index) => {
    const options = [
      sentence,
      safeSentences[(index + 1) % safeSentences.length] || 'Zusammenfassung des Themas',
      safeSentences[(index + 2) % safeSentences.length] || 'Ein Beispiel für die Anwendung',
      keywords[0] ? `Wichtige Begriffe: ${keywords.join(', ')}` : 'Die Theorie und das Beispiel'
    ];

    return {
      id: index + 1,
      question: `Frage ${index + 1}: Welche Aussage passt am besten zu diesem Lerninhalt?`,
      options: Array.from(new Set(options)).slice(0, 4),
      correct: sentence
    };
  });

  const game = safeSentences.slice(0, 6).map((sentence, index) => ({
    id: index + 1,
    question: `Spielrunde ${index + 1}: Erkläre in 1 Satz: ${shorten(sentence, 80)}`,
    answer: sentence
  }));

  const tasks = [
    {
      title: 'Schreib eine kurze Zusammenfassung',
      description: `Fasse das Thema ${topic} in 3 Sätzen zusammen.`
    },
    {
      title: 'Erstelle Mini-Quiz',
      description: `Formuliere 3 Fragen zu ${topic} mit den wichtigsten Begriffen ${keywords.slice(0, 4).join(', ') || 'deinem Lernstoff'}.`
    },
    {
      title: 'Übung',
      description: `Erkläre mit eigenen Worten, warum ${keywords[0] || 'das Thema'} wichtig ist.`
    }
  ];

  return {
    topic,
    difficulty,
    summary,
    keywords,
    flashcards,
    quiz,
    tasks,
    game
  };
}
