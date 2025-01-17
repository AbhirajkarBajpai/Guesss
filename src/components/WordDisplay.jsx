import React from "react";
import "./WordDisplay.css"; // Make sure to create this CSS file for styling

const WordDisplay = ({ word , onKeyPress, wordIndex}) => {

  const handleKeyClick = (key, index) => {
    onKeyPress(key, index);
  };
  return (
    <div className="word-display">
      {word.split("").map((letter, index) => (
        <div
          key={index}
          onClick={() => handleKeyClick(letter, wordIndex)}
          className="letter-box"
        >
          <span>{letter}</span>
        </div>
      ))}
    </div>
  );
};

export default WordDisplay;
