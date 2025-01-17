import React, { useContext, useState, useEffect, useRef } from "react";
import { GameContext } from "../context/context";
import WordDisplay from "../components/WordDisplay";
import "./Game.css";

const Game = () => {
  const {
    level,
    words,
    guesses,
    setGuesses,
    checkWord,
    isGameComplete,
    score,
  } = useContext(GameContext);
  const [colors, setColors] = useState(
    words.map((word) => Array(word.length).fill("#384353"))
  );
  const [jumbledWords, setJumbledWords] = useState([]);
  const inputRefs = useRef(words.map((word) => Array(word.length).fill(null)));
  const [wordIdx, setWordIdx] = useState();
  const [letterIdx, setLetterIdx] = useState();
  const [lockedWords, setLockedWords] = useState(words.map(() => false));

  const initialLastFilledIndexMap = {};
  words.forEach((word, index) => {
    initialLastFilledIndexMap[index] = -1;
  });

  const [lastFilledIndexMap, setLastFilledIndexMap] = useState(
    initialLastFilledIndexMap
  );

  const derange = (arr) => {
    const len = arr.length;
    if (len <= 1) return arr;
    const shuffle = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };
    let result = [...arr];
    shuffle(result);
    for (let i = 0; i < len; i++) {
      if (result[i] === arr[i]) {
        const swapWith = (i + 1) % len;
        [result[i], result[swapWith]] = [result[swapWith], result[i]];
      }
    }

    if (result.every((item, idx) => item !== arr[idx])) {
      return result;
    } else {
      return derange(arr);
    }
  };

  const jumbleWord = (word) => {
    const letters = word.split("");
    const jumbledLetters = derange(letters);
    return jumbledLetters.join("");
  };

  function setIndexes(wordIndex, letterIndex) {
    setWordIdx(wordIndex);
    setLetterIdx(letterIndex);
  }

  function resetLastFilledIndexMap() {
    const resetMap = {};
    words.forEach((_, index) => {
      resetMap[index] = -1;
    });
    setLastFilledIndexMap(resetMap);
  }

  useEffect(() => {
    setJumbledWords(words.map((word) => jumbleWord(word)));
    setColors(words.map((word) => Array(word.length).fill("#384353")));
    setWordIdx();
    setLetterIdx();
    setTimeout(() => {
      resetLastFilledIndexMap();
    }, 100);
  }, [level]);

  useEffect(() => {
    setLockedWords(words.map(() => false));
  }, [words]);

  function handleCustomInput(value, wordIndex) {
    if (lockedWords[wordIndex]) return; // Do nothing if the word is locked

    if (wordIdx === undefined || letterIdx === undefined) {
      setWordIdx(wordIndex);
      setLetterIdx(0);
      handleInputChange(wordIndex, 0, value);
    } else {
      if (wordIdx === wordIndex) {
        const lastFilledIndex = lastFilledIndexMap[wordIndex] ?? -1;
        if (lastFilledIndex === -1) {
          const newLetterIndex = lastFilledIndex + 1;
          handleInputChange(wordIndex, newLetterIndex, value);
        } else {
          handleInputChange(wordIdx, letterIdx, value);
        }
      } else {
        const lastFilledIndex = lastFilledIndexMap[wordIndex] ?? -1;
        if (lastFilledIndex === words[wordIndex].length - 1) {
          console.log("Word Completed!!");
          return;
        }
        const newLetterIndex = lastFilledIndex + 1;
        setWordIdx(wordIndex);
        setLetterIdx(newLetterIndex);
        handleInputChange(wordIndex, newLetterIndex, value);
      }
    }
  }

  const handleInputChange = (wordIndex, letterIndex, value) => {
    let updatedGuesses = [...guesses];
    updatedGuesses[wordIndex][letterIndex] = value.toUpperCase();
    setGuesses(updatedGuesses);

    // Recalculate colors for all words
    let updatedColors = [...colors];

    updatedGuesses.forEach((currentGuess, idx) => {
      if (
        !currentGuess.includes("") &&
        currentGuess.every((letter) => letter !== "")
      ) {
        const guessedWord = currentGuess.join("");
        if (checkWord(guessedWord, idx)) {
          updatedColors[idx] = Array(currentGuess.length).fill("#8397ff"); 
          setLockedWords((prevLockedWords) => {
            const newLockedWords = [...prevLockedWords];
            newLockedWords[idx] = true;
            return newLockedWords;
          });
        } else {
          updatedColors[idx] = currentGuess.map((letter, i) =>
            guessedWord[i] === words[idx][i] ? "#00D864" : "#384353"
          );
          // Add a delay to reset colors and input fields for incorrect words
          setTimeout(() => {
            setColors((prevColors) => {
              const newColors = [...prevColors];
              newColors[idx] = Array(currentGuess.length).fill("#384353");
              return newColors;
            });
            setGuesses((prevGuesses) => {
              const newGuesses = [...prevGuesses];
              newGuesses[idx] = Array(words[idx].length).fill("");
              return newGuesses;
            });
          }, 2000);
        }
      } else {
        updatedColors[idx] = currentGuess.map(
          (letter, i) => (!letter ? "#384353" : colors[idx][i]) // keep existing color for filled letters
        );
      }
    });

    setColors(updatedColors);
    setLastFilledIndexMap((prevMap) => ({
      ...prevMap,
      [wordIndex]: letterIndex,
    }));

    if (value) {
      // Move to the next input box if the current one is filled
      if (
        inputRefs.current[wordIndex] &&
        inputRefs.current[wordIndex][letterIndex + 1]
      ) {
        inputRefs.current[wordIndex][letterIndex + 1].focus();
      }
    } else {
      // Move to the previous input box if backspacing
      if (
        letterIndex > 0 &&
        inputRefs.current[wordIndex] &&
        inputRefs.current[wordIndex][letterIndex - 1]
      ) {
        inputRefs.current[wordIndex][letterIndex - 1].focus();
      }
    }
  };

  useEffect(() => {
    guesses.forEach((currentGuess, wordIndex) => {
      if (
        !currentGuess.includes("") &&
        currentGuess.every((letter) => letter !== "")
      ) {
        const guessedWord = currentGuess.join("");
        if (checkWord(guessedWord, wordIndex)) {
          let updatedColors = [...colors];
          updatedColors[wordIndex] = Array(currentGuess.length).fill("#8397ff");
          setColors(updatedColors);
          setLockedWords((prevLockedWords) => {
            const newLockedWords = [...prevLockedWords];
            newLockedWords[wordIndex] = true;
            return newLockedWords;
          });
        } else {
          let updatedColors = [...colors];
          updatedColors[wordIndex] = currentGuess.map((letter, index) =>
            guessedWord[index] === words[wordIndex][index]
              ? "#00D864"
              : "#384353"
          );
          setColors(updatedColors);
          setTimeout(() => {
            setColors((prevColors) => {
              const newColors = [...prevColors];
              newColors[wordIndex] = Array(currentGuess.length).fill("#384353");
              return newColors;
            });
            setGuesses((prevGuesses) => {
              const newGuesses = [...prevGuesses];
              newGuesses[wordIndex] = Array(words[wordIndex].length).fill("");
              return newGuesses;
            });
            setLastFilledIndexMap((prevMap) => ({
              ...prevMap,
              [wordIndex]: -1,
            }));
          }, 2000);
        }
      }
    });
  }, [guesses]);

  const getClassNameFromColor = (color) => {
    switch (color) {
      case "#384353":
        return "gi_normal_g6";
      case "#8397ff":
        return "gi_found_g6";
      case "#00D864":
        return "gi_correct_g6";
      default:
        return "";
    }
  };

  return (
    <div className="G6_h5Game">
      <div className="upperInfo_g6_container">
        <div className="level-heading">
          <span>Level: {level}</span>
        </div>
        <div className="level-heading">
          <span>Score: {score}</span>
        </div>
      </div>
      <div className="level_word_container_G6">
        {guesses.map((currentGuess, wordIndex) => (
          <div key={wordIndex} className="guess-container">
            <div className="guess-input-container">
              {currentGuess.map((letter, letterIndex) => (
                <input
                  key={letterIndex}
                  type="text"
                  maxLength="1"
                  value={letter}
                  ref={(el) => (inputRefs.current[wordIndex][letterIndex] = el)}
                  onFocus={() => setIndexes(wordIndex, letterIndex)}
                  className={`guess-input ${getClassNameFromColor(
                    colors[wordIndex][letterIndex]
                  )}`}
                  readOnly={lockedWords[wordIndex]} // Lock input if word is completed correctly
                />
              ))}
            </div>

            <WordDisplay
              word={jumbledWords[wordIndex]}
              wordIndex={wordIndex}
              onKeyPress={handleCustomInput}
            />
          </div>
        ))}
      </div>
      {isGameComplete && (
        <p className="game-complete-message">
          Congratulations! You've completed the game!
        </p>
      )}
    </div>
  );
};

export default Game;
