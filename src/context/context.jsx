import React, { createContext, useState, useEffect } from "react";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [guesses, setGuesses] = useState([]);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const wordsPerLevel = [
    ["APPLE", "SPACE", "CLICK", "BUILD"],
    ["COLOR", "RING", "BLACK"],
    ["FIGHT", "FLOWER"],
    ["SINGS", "ROSES", "ICEBERG"],
  ];

  // Initialize guesses for the current level
  const initializeGuesses = () => {
    setGuesses(
      wordsPerLevel[level - 1].map((word) => Array(word.length).fill(""))
    );
  };

  const checkWord = (word, wordIndex) => {
    const correctWord = wordsPerLevel[level - 1][wordIndex];
    return word === correctWord;
  };

  const moveToNextLevel = () => {
    if (level < wordsPerLevel.length) {
      setLevel(level + 1);
      initializeGuesses();
    } else {
      setIsGameComplete(true);
    }
  };
  const checkScore = () => {
    let score=0;
    let i=0;
    guesses.forEach((guess)=>{
      if(guess.join("") === wordsPerLevel[level - 1][i]){
        score+= wordsPerLevel[level - 1][i].length*100;
        i++;
      }
    })
    setScore(score);
  };

  const isLevelComplete = () => {
    checkScore();
    return guesses.every((guess, index) => checkWord(guess.join(""), index));
  };

  // Automatically move to the next level when all words are correctly guessed
  useEffect(() => {
    if (isLevelComplete()) {
      const timer = setTimeout(() => {
        moveToNextLevel();
      }, 1000); // 1-second delay to allow visual feedback before changing level
      return () => clearTimeout(timer); // Clean up timer on component unmount or level change
    }
  }, [guesses]);

  // Initialize guesses when the level changes
  useEffect(() => {
    initializeGuesses();
  }, [level]);

  return (
    <GameContext.Provider
      value={{
        level,
        words: wordsPerLevel[level - 1],
        guesses,
        setGuesses,
        checkWord,
        moveToNextLevel,
        isGameComplete,
        score,
        setScore,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
