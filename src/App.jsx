import { useMemo, useState } from 'react';
import Tesseract from 'tesseract.js';
import { generateLearningPack } from './lib/studyEngine';

const sampleText = `Photosynthese ist der Prozess, bei dem Pflanzen mithilfe von Licht Wasser und Kohlenstoffdioxid in Glucose und Sauerstoff umwandeln. Wichtige Bestandteile sind Chlorophyll, Blattgrün, Wurzeln, Blätter und die Sonne. In der Biologie lernen wir, dass Pflanzen Energie aus dem Licht aufnehmen und dadurch Zucker produzieren. Das ist wichtig für das Wachstum, die Atmung und die Erhaltung von Ökosystemen.`;

const defaultPack = generateLearningPack({
  text: sampleText,
  topic: 'Biologie',
  difficulty: 'mittel'
});

function App() {
  const [mode, setMode] = useState('learn');
  const [subject, setSubject] = useState('Biologie');
  const [difficulty, setDifficulty] = useState('mittel');
  const [ocrText, setOcrText] = useState(sampleText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState('');
  const [studyPack, setStudyPack] = useState(defaultPack);
  const [quizIndex, setQuizIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameIndex, setGameIndex] = useState(0);

  const activeQuiz = studyPack.quiz[quizIndex];
  const activeGameCard = studyPack.game[gameIndex];

  const summaryText = useMemo(() => {
    if (!studyPack.summary) return 'Noch kein Lernpaket erstellt.';
    return studyPack.summary;
  }, [studyPack.summary]);

  const handleGeneratePack = () => {
    const text = ocrText.trim() || sampleText;
    const generated = generateLearningPack({
      text,
      topic: subject || 'Lernstoff',
      difficulty
    });
    setStudyPack(generated);
    setQuizIndex(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setScore(0);
    setGameIndex(0);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setIsAnalyzing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(file, 'deu+eng', {
        logger: (message) => {
          if (message.status === 'recognizing text') {
            const value = Math.round(message.progress * 100);
            setProgress(value);
          }
        }
      });

      const extractedText = result.data.text.trim();
      setOcrText(extractedText || sampleText);
      if (extractedText) {
        const generated = generateLearningPack({
          text: extractedText,
          topic: subject || 'Lernstoff',
          difficulty
        });
        setStudyPack(generated);
      }
    } catch (error) {
      console.error('OCR Fehler:', error);
      setOcrText(sampleText);
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
    }
  };

  const handleAnswer = (option) => {
    if (!activeQuiz) return;
    setSelectedAnswer(option);
    if (option === activeQuiz.correct) {
      setScore((current) => current + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowAnswer(false);
    if (quizIndex < studyPack.quiz.length - 1) {
      setQuizIndex((current) => current + 1);
    }
  };

  const nextGameCard = () => {
    setGameIndex((current) => (current + 1) % Math.max(studyPack.game.length, 1));
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Kostenlos & lokal</p>
          <h1>Learning Quest AI</h1>
        </div>
        <div className="topbar-actions">
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Thema"
            className="input"
          />
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="input"
          >
            <option value="leicht">Leicht</option>
            <option value="mittel">Mittel</option>
            <option value="schwer">Schwer</option>
          </select>
          <button className="primary-button" onClick={handleGeneratePack}>
            Lernpaket erstellen
          </button>
        </div>
      </header>

      <main className="content-grid">
        <aside className="panel left-panel">
          <div className="upload-box">
            <label htmlFor="image-upload" className="upload-area">
              <span>📷 Bild hochladen</span>
              <small>z. B. Lernzettel, Karteikarten, Notizen</small>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(event) => handleImageUpload(event.target.files?.[0])}
            />
          </div>

          {preview ? <img src={preview} alt="Lernvorlage" className="preview-image" /> : null}

          {isAnalyzing ? (
            <div className="progress-wrap">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <small>Texterkennung läuft... {progress}%</small>
            </div>
          ) : null}

          <div className="panel-section">
            <h3>Extrahierter Lernstoff</h3>
            <textarea
              className="text-area"
              value={ocrText}
              onChange={(event) => setOcrText(event.target.value)}
              rows={10}
            />
          </div>
        </aside>

        <section className="panel main-panel">
          <div className="mode-switcher">
            {['learn', 'quiz', 'game'].map((item) => (
              <button
                key={item}
                className={mode === item ? 'mode-button active' : 'mode-button'}
                onClick={() => setMode(item)}
              >
                {item === 'learn' ? 'Lernmodus' : item === 'quiz' ? 'Übungsmodus' : 'Spielmodus'}
              </button>
            ))}
          </div>

          {mode === 'learn' ? (
            <div className="mode-content">
              <div className="summary-card">
                <h2>{subject}</h2>
                <p>{summaryText}</p>
              </div>

              <div className="chip-row">
                {studyPack.keywords.map((keyword) => (
                  <span key={keyword} className="chip">{keyword}</span>
                ))}
              </div>

              <div className="card-grid">
                {studyPack.flashcards.map((card) => (
                  <article key={card.id} className="flashcard">
                    <span className="label">Karte {card.id}</span>
                    <h3>{card.question}</h3>
                    <button
                      className="secondary-button"
                      onClick={() => setShowAnswer((current) => !current)}
                    >
                      {showAnswer ? 'Antwort verstecken' : 'Antwort zeigen'}
                    </button>
                    {showAnswer ? <p>{card.answer}</p> : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {mode === 'quiz' ? (
            <div className="mode-content">
              {activeQuiz ? (
                <>
                  <div className="quiz-box">
                    <div className="quiz-header">
                      <span>Frage {quizIndex + 1} / {studyPack.quiz.length}</span>
                      <strong>Punktestand: {score}</strong>
                    </div>
                    <h2>{activeQuiz.question}</h2>
                    <div className="options-grid">
                      {activeQuiz.options.map((option) => (
                        <button
                          key={option}
                          className={selectedAnswer === option ? 'option-button selected' : 'option-button'}
                          onClick={() => handleAnswer(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {selectedAnswer ? (
                      <div className="answer-box">
                        <p>
                          {selectedAnswer === activeQuiz.correct ? 'Richtig! ✅' : `Falsch. Die richtige Antwort ist: ${activeQuiz.correct}`}
                        </p>
                        <button className="primary-button" onClick={nextQuestion}>
                          {quizIndex === studyPack.quiz.length - 1 ? 'Fertig' : 'Nächste Frage'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <p>Erstelle zuerst ein Lernpaket.</p>
              )}
            </div>
          ) : null}

          {mode === 'game' ? (
            <div className="mode-content">
              {activeGameCard ? (
                <div className="game-box">
                  <span className="label">Mini-Spiel</span>
                  <h2>{activeGameCard.question}</h2>
                  <p>{activeGameCard.answer}</p>
                  <button className="primary-button" onClick={nextGameCard}>
                    Nächste Aufgabe
                  </button>
                </div>
              ) : (
                <p>Es liegt noch kein Spielpaket vor.</p>
              )}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
