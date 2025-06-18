import React, { useEffect, useState } from 'react';

interface BlockProps {
  title?: string;
  description?: string;
}

interface Card {
  id: number;
  type: string;
  name: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const Block: React.FC<BlockProps> = ({ title = "WW1 Memory Game", description = "Match the pairs to learn about World War 1!" }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);

  // WW1 themed card pairs (kid-friendly)
  const cardPairs = [
    { type: 'vehicle', name: 'Biplane', emoji: '✈️' },
    { type: 'vehicle', name: 'Tank', emoji: '🚂' },
    { type: 'person', name: 'Soldier', emoji: '🪖' },
    { type: 'symbol', name: 'Medal', emoji: '🏅' },
    { type: 'place', name: 'Trench', emoji: '🏰' },
    { type: 'symbol', name: 'Flag', emoji: '🏳️' },
    { type: 'communication', name: 'Telegraph', emoji: '📡' },
    { type: 'medical', name: 'Red Cross', emoji: '⛑️' }
  ];

  const initializeGame = () => {
    const gameCards: Card[] = [];
    let id = 0;

    // Create pairs of cards
    cardPairs.forEach(pair => {
      // First card of the pair
      gameCards.push({
        id: id++,
        type: pair.type,
        name: pair.name,
        emoji: pair.emoji,
        isFlipped: false,
        isMatched: false
      });
      // Second card of the pair
      gameCards.push({
        id: id++,
        type: pair.type,
        name: pair.name,
        emoji: pair.emoji,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle the cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameCompleted(false);
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards.find(card => card.id === cardId)?.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card flip state
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);

      if (firstCard && secondCard && firstCard.name === secondCard.name) {
        // Match found!
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatchedPairs(matchedPairs + 1);
          setFlippedCards([]);
          
          // Check if game is completed
          if (matchedPairs + 1 === cardPairs.length) {
            setGameCompleted(true);
            // Send completion event
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            window.postMessage({ 
              type: 'BLOCK_COMPLETION', 
              blockId: '6852995c3070c1efd983da88', 
              completed: true, 
              score: Math.max(100 - moves * 2, 20), 
              maxScore: 100,
              timeSpent: timeSpent,
              data: { moves, pairs: cardPairs.length }
            }, '*');
            window.parent.postMessage({ 
              type: 'BLOCK_COMPLETION', 
              blockId: '6852995c3070c1efd983da88', 
              completed: true, 
              score: Math.max(100 - moves * 2, 20), 
              maxScore: 100,
              timeSpent: timeSpent,
              data: { moves, pairs: cardPairs.length }
            }, '*');
          }
        }, 1000);
      } else {
        // No match, flip cards back
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1500);
      }
    }
  };

  const CardComponent = ({ card }: { card: Card }) => {
    const isVisible = card.isFlipped || card.isMatched;
    
    return (
      <div
        className="memory-card"
        onClick={() => handleCardClick(card.id)}
        style={{
          width: 100,
          height: 100,
          margin: 8,
          borderRadius: 12,
          border: '3px solid #8B4513',
          cursor: card.isMatched ? 'default' : 'pointer',
          backgroundColor: card.isMatched ? '#90EE90' : isVisible ? '#F5DEB3' : '#8B4513',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isVisible ? '32px' : '20px',
          fontWeight: 'bold',
          color: isVisible ? '#2F4F4F' : '#F5DEB3',
          transition: 'all 0.3s ease',
          transform: card.isMatched ? 'scale(1.05)' : 'scale(1)',
          boxShadow: card.isMatched ? '0 4px 15px rgba(144, 238, 144, 0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
          textAlign: 'center',
          userSelect: 'none'
        }}
      >
        {isVisible ? (
          <>
            <div style={{ fontSize: '36px', marginBottom: '4px' }}>{card.emoji}</div>
            <div style={{ fontSize: '10px', fontWeight: 'normal' }}>{card.name}</div>
          </>
        ) : (
          '?'
        )}
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #F4A460 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '20px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '30px',
          maxWidth: '600px',
          lineHeight: '1.5'
        }}>
          {description} Click on cards to flip them and find matching pairs. Learn about important people, places, and things from World War 1!
        </p>
        <button
          onClick={initializeGame}
          style={{
            padding: '15px 30px',
            fontSize: '1.2rem',
            backgroundColor: '#FF6347',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 15px rgba(255, 99, 71, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#FF4500';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#FF6347';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Start Game! 🎮
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #F4A460 100%)',
      padding: '20px',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          margin: '0 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          WW1 Memory Game 🎯
        </h1>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          <div>Moves: {moves}</div>
          <div>Pairs Found: {matchedPairs}/{cardPairs.length}</div>
        </div>
      </div>

      {/* Game Board */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
      }}>
        {cards.map(card => (
          <CardComponent key={card.id} card={card} />
        ))}
      </div>

      {/* Game Completed Modal */}
      {gameCompleted && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            color: '#2F4F4F',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '400px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              margin: '0 0 20px 0',
              color: '#228B22'
            }}>
              🎉 Congratulations! 🎉
            </h2>
            <p style={{
              fontSize: '1.2rem',
              margin: '0 0 20px 0',
              lineHeight: '1.5'
            }}>
              You completed the WW1 Memory Game!<br/>
              <strong>Moves: {moves}</strong><br/>
              <strong>Time: {Math.round((Date.now() - startTime) / 1000)} seconds</strong>
            </p>
            <button
              onClick={initializeGame}
              style={{
                padding: '15px 30px',
                fontSize: '1.1rem',
                backgroundColor: '#FF6347',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255, 99, 71, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              Play Again! 🔄
            </button>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div style={{
        textAlign: 'center',
        marginTop: '20px'
      }}>
        <button
          onClick={initializeGame}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
          }}
        >
          New Game 🔄
        </button>
      </div>
    </div>
  );
};

export default Block;