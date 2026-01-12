
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function NotFoundPage() {
  const [ballPosition, setBallPosition] = useState({ x: 150, y: 120 }); // Ball starts near top
  const [ballVelocity, setBallVelocity] = useState({ x: 2, y: -3 }); // Initial velocity with horizontal movement
  const [paddlePosition, setPaddlePosition] = useState(130); // Paddle's x-position
  const [gameOver, setGameOver] = useState(false);
  const gameAreaRef = useRef(null);
  const gameWidth = 320; // Game area width
  const gameHeight = 160; // Game area height

  // Game loop with requestAnimationFrame
  useEffect(() => {
    let animationFrameId;

    const updateGame = () => {
      if (!gameOver) {
        setBallPosition((prev) => {
          let newX = prev.x + ballVelocity.x;
          let newY = prev.y + ballVelocity.y;
          let newVelocityX = ballVelocity.x;
          let newVelocityY = ballVelocity.y;

          // Bounce off sides
          if (newX <= 0 || newX >= gameWidth - 20) { // Ball width: 20px
            newVelocityX = -newVelocityX * 0.95; // Slight energy loss
            newX = newX <= 0 ? 0 : gameWidth - 20;
          }

          // Bounce off top
          if (newY >= gameHeight - 20) { // Ball height: 20px
            newVelocityY = -newVelocityY * 0.95; // Slight energy loss
            newY = gameHeight - 20;
          }

          // Apply gravity
          newVelocityY -= 0.15; // Reduced gravity for smoother fall

          // Check paddle collision
          const paddleLeft = paddlePosition;
          const paddleRight = paddlePosition + 60; // Paddle width: 60px
          const paddleTop = 10; // Paddle near bottom
          const ballBottom = newY;

          if (
            newX + 20 > paddleLeft &&
            newX < paddleRight &&
            ballBottom <= paddleTop + 5 && // Small buffer for catch
            newVelocityY < 0 // Ball moving down
          ) {
            newVelocityY = -newVelocityY * 0.95; // Bounce up
            newVelocityX += (newX - (paddleLeft + 30)) * 0.1; // Add spin based on hit position
            newY = paddleTop + 5; // Reset to just above paddle
          }

          // Game over if ball hits ground
          if (newY <= 0) {
            setGameOver(true);
            newY = 0; // Stick to ground
          }

          setBallVelocity({ x: newVelocityX, y: newVelocityY });
          return { x: newX, y: newY };
        });
      }

      animationFrameId = requestAnimationFrame(updateGame);
    };

    animationFrameId = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [ballPosition, ballVelocity, paddlePosition, gameOver]);

  // Paddle movement with arrow keys
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameOver) {
        setPaddlePosition((prev) => {
          if (e.key === "ArrowLeft" && prev > 0) return prev - 10;
          if (e.key === "ArrowRight" && prev < gameWidth - 60) return prev + 10;
          return prev;
        });
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameOver]);

  return (
    <div className="flex flex-col text-center items-center justify-center min-h-screen bg-gray-950 text-white font-sans">
      {/* "W" Logo */}
      <span className="text-6xl font-bold text- transform rotate-[21deg] mb-4">
        W
      </span>

      {/* "WorldsAibot" Branding */}
      <span className="text-4xl font-semibold text-white mb-4">
        WorldsAibot
      </span>

      {/* 404 Message */}
      <h1 className="text-5xl font-bold text-red-500 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-white max-w-md mb-6 text-center">
        Oops! You’ve lost your way. Catch the ball with the paddle using Arrow
        keys—don’t let it hit the ground!
      </p>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="relative w-80 h-40 bg-gray-200 border border-gray-300 mb-6 overflow-hidden"
      >
        {/* Ball */}
        <div
          className="absolute w-5 h-5 bg-red-500 rounded-full transition-all duration-[16ms]"
          style={{ left: `${ballPosition.x}px`, bottom: `${ballPosition.y}px` }}
        ></div>

        {/* Paddle */}
        <div
          className="absolute w-[60px] h-[10px] bg-blue-500"
          style={{ left: `${paddlePosition}px`, bottom: "5px" }}
        ></div>

        {/* Game Over Message */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <p className="text-xl text-white">Out! Refresh to play again.</p>
          </div>
        )}
      </div>

      {/* Go to Home Button */}
      <Link
        to="/"
        className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200"
      >
        Go to Home Page
      </Link>
    </div>
  );
}

export default NotFoundPage;